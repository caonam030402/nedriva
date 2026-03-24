"""
Image Enhancement Pipeline.

Features:
  - Upscale (Real-ESRGAN): x2, x4, x8, x16, or custom size
  - Face enhancement (GFPGAN): for Prime and Old Photo models
  - Light AI: color correction, CLAHE, sharpening
  - Multiple presets: Prime, Gentle, Old Photo, Try All
"""
from __future__ import annotations

import io
import logging
import math
import time
from pathlib import Path
from typing import NamedTuple

import numpy as np
import torch
from PIL import Image

from app.modules.image_enhancer.schemas import (
    ImageMoreModel,
    ImageScaleFactor,
    ImageSizeMode,
    ImageUpscaleModel,
)

logger = logging.getLogger(__name__)


# ── Result type ────────────────────────────────────────────────

class ImageEnhancerResult(NamedTuple):
    images: list[Image.Image]
    metadata: dict


# ── Pipeline ───────────────────────────────────────────────────

class ImageEnhancerPipeline:
    """
    Image enhancement pipeline with upscale, face enhance, and light AI.
    """

    def __init__(self):
        self._upscaler_cache: dict[str, object] = {}
        self._restorer_cache: dict[str, object] = {}

    # ── Public API ────────────────────────────────────────────

    def run(
        self,
        image: Image.Image,
        upscale_enabled: bool = True,
        upscale_model: ImageUpscaleModel = ImageUpscaleModel.prime,
        more_model: ImageMoreModel | None = None,
        size_mode: ImageSizeMode = ImageSizeMode.auto,
        scale_factor: ImageScaleFactor = ImageScaleFactor.x4,
        custom_width: int | None = None,
        custom_height: int | None = None,
        light_ai_enabled: bool = False,
        light_ai_intensity: int = 30,
    ) -> ImageEnhancerResult:
        """Run the image enhancement pipeline."""
        outputs: list[Image.Image] = []
        meta: dict = {}

        if upscale_model == ImageUpscaleModel.try_all:
            variants = []
            for model in (ImageUpscaleModel.prime, ImageUpscaleModel.gentle, ImageUpscaleModel.old_photo):
                result = self._run_single(
                    image=image,
                    upscale_enabled=upscale_enabled,
                    upscale_model=model,
                    more_model=None,
                    size_mode=size_mode,
                    scale_factor=scale_factor,
                    custom_width=custom_width,
                    custom_height=custom_height,
                    light_ai_enabled=False,
                    light_ai_intensity=light_ai_intensity,
                )
                outputs.append(result)
                variants.append({"model": model.value})
            meta["try_all"] = True
            meta["variants"] = variants
        else:
            result = self._run_single(
                image=image,
                upscale_enabled=upscale_enabled,
                upscale_model=upscale_model,
                more_model=more_model,
                size_mode=size_mode,
                scale_factor=scale_factor,
                custom_width=custom_width,
                custom_height=custom_height,
                light_ai_enabled=light_ai_enabled,
                light_ai_intensity=light_ai_intensity,
            )
            outputs.append(result)
            meta["model"] = upscale_model.value

        return ImageEnhancerResult(images=outputs, metadata=meta)

    # ── Internal ─────────────────────────────────────────────

    def _run_single(
        self,
        image: Image.Image,
        upscale_enabled: bool,
        upscale_model: ImageUpscaleModel,
        more_model: ImageMoreModel | None,
        size_mode: ImageSizeMode,
        scale_factor: ImageScaleFactor,
        custom_width: int | None,
        custom_height: int | None,
        light_ai_enabled: bool,
        light_ai_intensity: int,
    ) -> Image.Image:
        current = image
        steps = []

        # 1. Upscale
        if upscale_enabled:
            current = self._upscale(
                current,
                upscale_model=upscale_model,
                more_model=more_model,
                size_mode=size_mode,
                scale_factor=scale_factor,
                custom_width=custom_width,
                custom_height=custom_height,
            )
            steps.append("upscale")

        # 2. Face enhancement
        if upscale_enabled and upscale_model == ImageUpscaleModel.old_photo:
            if not self._skip_gfpgan():
                current = self._restore_old_photo(current)
                steps.append("face_restore_old_photo")
            else:
                current = self._light_ai_fallback(current)
                steps.append("old_photo_light_cpu_fallback")
        elif upscale_enabled and upscale_model == ImageUpscaleModel.prime and not self._skip_gfpgan():
            current = self._enhance_faces(current, strength=0.5)
            steps.append("face_enhance")

        # 3. Light AI
        if light_ai_enabled:
            current = self._enhance_light(current, intensity=light_ai_intensity)
            steps.append("light_ai")

        logger.info("Image enhancer: %s", " → ".join(steps) or "no-op")
        return current

    # ── Upscale (Real-ESRGAN) ─────────────────────────────────

    def _upscale(
        self,
        image: Image.Image,
        upscale_model: ImageUpscaleModel,
        more_model: ImageMoreModel | None,
        size_mode: ImageSizeMode,
        scale_factor: ImageScaleFactor,
        custom_width: int | None,
        custom_height: int | None,
    ) -> Image.Image:
        from app.config import get_settings

        settings = get_settings()
        is_cpu = not torch.cuda.is_available()

        # Cap input
        if is_cpu and settings.max_input_mp_cpu > 0:
            image = self._cap_input(image, settings.max_input_mp_cpu)

        # Extra cap for 4×+ on CPU
        if is_cpu:
            ge4 = self._is_ge4_scale(size_mode, scale_factor, custom_width, custom_height, settings)
            if ge4:
                cap = float(getattr(settings, "max_input_mp_cpu_scale_ge_4", 0.18) or 0.18)
                if cap > 0:
                    image = self._cap_input(image, cap)

        src_w, src_h = image.size

        # Resolve target
        if size_mode == ImageSizeMode.scale and scale_factor == ImageScaleFactor.x1:
            return image.copy()

        if size_mode == ImageSizeMode.custom and custom_width and custom_height:
            target_w, target_h = custom_width, custom_height
            req_scale = max(math.ceil(target_w / src_w), math.ceil(target_h / src_h))
            if req_scale <= 1:
                return image.copy()
        else:
            if size_mode == ImageSizeMode.scale:
                req_scale = int(scale_factor)
            else:
                req_scale = max(1, min(int(settings.auto_upscale_scale), 16))
            if req_scale == 1:
                return image.copy()
            target_w, target_h = src_w * req_scale, src_h * req_scale
            req_scale = 2 if req_scale == 2 else 4

        # Cap output
        max_out_px = settings.max_upscale_mp * 1_000_000
        if target_w * target_h > max_out_px:
            ratio = (max_out_px / (target_w * target_h)) ** 0.5
            target_w = max(1, int(target_w * ratio))
            target_h = max(1, int(target_h * ratio))

        # CPU lanczos clamp
        if is_cpu and settings.cpu_avoid_lanczos_upscale and upscale_model != "try_all":
            native = 4
            max_w = int(src_w * native)
            max_h = int(src_h * native)
            if target_w > max_w or target_h > max_h:
                r = min(max_w / target_w, max_h / target_h)
                target_w = max(1, int(target_w * r))
                target_h = max(1, int(target_h * r))

        # Resolve model
        model_name, native_scale = self._resolve_esrgan_model(upscale_model, more_model, req_scale)

        # Load upscaler
        tile = self._pick_tile(src_w, src_h, not is_cpu)
        upscaler = self._load_upscaler(model_name, tile)

        rgb = image.convert("RGB")
        img_array = np.ascontiguousarray(np.asarray(rgb, dtype=np.uint8))

        logger.info("Upscaling %dx%d → %dx%d via %s", src_w, src_h, target_w, target_h, model_name)

        with torch.inference_mode():
            output_array, _ = upscaler.enhance(img_array, outscale=native_scale)

        result = Image.fromarray(output_array)

        if (result.width, result.height) != (target_w, target_h):
            result = result.resize((target_w, target_h), Image.LANCZOS)

        return result

    # ── Face Enhancement (GFPGAN) ────────────────────────────

    def _enhance_faces(self, image: Image.Image, strength: float = 0.5) -> Image.Image:
        import httpx
        from pathlib import Path
        from app.config import get_settings

        settings = get_settings()
        model_path = str(Path(settings.model_cache_dir) / "GFPGANv1.4.pth")
        url = "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth"

        if not Path(model_path).exists():
            Path(model_path).parent.mkdir(parents=True, exist_ok=True)
            logger.info("Downloading GFPGAN model…")
            with httpx.stream("GET", url, timeout=120) as r:
                r.raise_for_status()
                with open(model_path, "wb") as f:
                    for chunk in r.iter_bytes(8192):
                        f.write(chunk)

        if model_path not in self._restorer_cache:
            from gfpgan import GFPGANer
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self._restorer_cache[model_path] = GFPGANer(
                model_path=model_path,
                upscale=1,
                arch="clean",
                channel_multiplier=2,
                bg_upsampler=None,
                device=device,
            )

        restorer = self._restorer_cache[model_path]
        img_bgr = np.array(image.convert("RGB"))[:, :, ::-1]
        _, _, restored_list = restorer.enhance(img_bgr, has_aligned=False, only_center_face=False, paste_back=True, weight=strength)

        if not restored_list:
            return image

        restored_rgb = restored_list[0][:, :, ::-1]
        return Image.fromarray(restored_rgb.astype(np.uint8))

    def _restore_old_photo(self, image: Image.Image) -> Image.Image:
        return self._enhance_faces(image, strength=1.0)

    def _light_ai_fallback(self, image: Image.Image) -> Image.Image:
        from app.config import get_settings
        settings = get_settings()
        return self._enhance_light(image, intensity=min(100, max(0, settings.old_photo_cpu_light_intensity)))

    # ── Light AI ───────────────────────────────────────────────

    def _enhance_light(self, image: Image.Image, intensity: int = 30) -> Image.Image:
        import cv2

        strength = intensity / 100.0
        img = np.array(image.convert("RGB"))

        # White balance
        result = img.astype(np.float32)
        mean = result.mean(axis=(0, 1))
        overall_mean = mean.mean()
        scale = overall_mean / (mean + 1e-6)
        balanced = np.clip(result * scale, 0, 255)
        img = (img * (1 - strength * 0.6) + balanced * (strength * 0.6)).astype(np.uint8)

        # CLAHE
        lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clip_limit = 1.0 + strength * 3.0
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
        l_eq = clahe.apply(l)
        l_blend = cv2.addWeighted(l, 1 - strength * 0.7, l_eq, strength * 0.7, 0)
        lab = cv2.merge([l_blend, a, b])
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

        # Unsharp mask
        if strength >= 0.1:
            blurred = cv2.GaussianBlur(img, (5, 5), 2.0)
            amount = strength * 0.4
            img = np.clip(cv2.addWeighted(img, 1 + amount, blurred, -amount, 0), 0, 255).astype(np.uint8)

        return Image.fromarray(img)

    # ── Helpers ───────────────────────────────────────────────

    def _cap_input(self, image: Image.Image, max_mp: float) -> Image.Image:
        if max_mp <= 0:
            return image
        w, h = image.size
        mp = w * h / 1_000_000
        if mp <= max_mp:
            return image
        ratio = (max_mp / mp) ** 0.5
        nw, nh = max(1, int(w * ratio)), max(1, int(h * ratio))
        return image.resize((nw, nh), Image.LANCZOS)

    def _is_ge4_scale(self, size_mode, scale_factor, cw, ch, settings) -> bool:
        if size_mode == ImageSizeMode.scale:
            return int(scale_factor) >= 4
        if size_mode == ImageSizeMode.custom and cw and ch:
            return max(math.ceil(cw / 100), math.ceil(ch / 100)) >= 4
        return int(settings.auto_upscale_scale) >= 4

    def _pick_tile(self, w: int, h: int, is_gpu: bool) -> int:
        if is_gpu:
            return 512
        m = max(w, h)
        if m <= 640:
            return 0
        if m <= 1280:
            return 400
        return 256

    def _resolve_esrgan_model(self, upscale_model: ImageUpscaleModel, more_model: ImageMoreModel | None, req_scale: int) -> tuple:
        if upscale_model == ImageUpscaleModel.gentle:
            return "RealESRGAN_x4plus_anime_6B", 4
        if upscale_model == ImageUpscaleModel.more:
            if more_model in (ImageMoreModel.strong, ImageMoreModel.magic):
                return "realesr-general-x4v3", 4
            if req_scale <= 2:
                return "RealESRGAN_x2plus", 2
            return "RealESRGAN_x4plus", 4
        if req_scale <= 2:
            return "RealESRGAN_x2plus", 2
        return "RealESRGAN_x4plus", 4

    def _skip_gfpgan(self) -> bool:
        from app.config import get_settings
        return get_settings().skip_face_enhance_on_cpu and not torch.cuda.is_available()

    def _load_upscaler(self, model_name: str, tile: int):
        from basicsr.archs.rrdbnet_arch import RRDBNet
        from realesrgan import RealESRGANer
        from app.config import get_settings

        cache_key = f"{model_name}:t{tile}"
        if cache_key in self._upscaler_cache:
            return self._upscaler_cache[cache_key]

        settings = get_settings()
        is_gpu = torch.cuda.is_available()
        device = "cuda" if is_gpu else "cpu"

        arch_kwargs = dict(num_in_ch=3, num_out_ch=3, num_feat=64, num_grow_ch=32)
        if "anime" in model_name:
            net = RRDBNet(**arch_kwargs, num_block=6, scale=4)
        elif "x2plus" in model_name:
            net = RRDBNet(**arch_kwargs, num_block=23, scale=2)
        else:
            net = RRDBNet(**arch_kwargs, num_block=23, scale=4)

        local_weight = Path(settings.model_cache_dir) / f"{model_name}.pth"
        tag_map = {"RealESRGAN_x4plus": "v0.1.0", "RealESRGAN_x4plus_anime_6B": "v0.2.2.4", "RealESRGAN_x2plus": "v0.2.1", "realesr-general-x4v3": "v0.2.5.0"}
        tag = tag_map.get(model_name, "v0.1.0")
        remote = f"https://github.com/xinntao/Real-ESRGAN/releases/download/{tag}/{model_name}.pth"
        model_path = str(local_weight) if local_weight.exists() else remote

        tile_pad = 10 if tile > 0 else 0
        upscaler = RealESRGANer(
            scale=2 if "x2plus" in model_name else 4,
            model_path=model_path,
            model=net,
            tile=tile,
            tile_pad=tile_pad,
            pre_pad=0,
            half=is_gpu,
            device=device,
        )

        self._upscaler_cache[cache_key] = upscaler
        return upscaler

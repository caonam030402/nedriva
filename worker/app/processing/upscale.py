"""
Real-ESRGAN upscaler wrapper.

Models used:
  - RealESRGAN_x4plus        → Prime / general photos   (native x4)
  - RealESRGAN_x4plus_anime  → Gentle (lower hallucinate) (native x4)
  - RealESRGAN_x2plus        → 2x scale jobs            (native x2)
  - realesr-general-x4v3     → Strong (more detail)      (native x4)

Scaling pipeline
────────────────
Real-ESRGAN is ONLY ever run at its native scale (x2 or x4).
Requested scales > 4x are achieved by:
  1. Real-ESRGAN at native x4
  2. PIL LANCZOS resize to the final target size

Performance
───────────
* Tile size is chosen from input dimensions (CPU: small images → no tiling).
* Cache key includes tile so we don't reuse wrong tiling config.
* Inference runs under torch.inference_mode() (less autograd overhead).
* No nested ThreadPoolExecutor — outer asyncio.to_thread already isolates the pipeline.
"""
import logging
import math
import time
from enum import StrEnum
from pathlib import Path

import numpy as np
import torch
from PIL import Image

from app.config import get_settings
from app.schemas import MoreModel, ScaleFactor, SizeMode, UpscaleModel

logger = logging.getLogger(__name__)

# "model_name:tile{N}" → RealESRGANer
_upscaler_cache: dict[str, object] = {}


def _output_scale_from_dims(src_w: int, src_h: int, target_w: int, target_h: int) -> int:
    """Smallest integer scale covering custom target (for picking x2 vs x4 weights)."""
    return max(math.ceil(target_w / src_w), math.ceil(target_h / src_h))

# Fallback if settings missing
_DEFAULT_TIMEOUT_S = 600


class _ModelName(StrEnum):
    general = "RealESRGAN_x4plus"
    anime   = "RealESRGAN_x4plus_anime_6B"
    x2      = "RealESRGAN_x2plus"
    strong  = "realesr-general-x4v3"


# Exact GitHub release tag per file (defaults were wrong → urllib HTTP 404)
# - anime_6B: NOT in v0.1.0 → v0.2.2.4
# - x2plus: NOT in v0.1.0 → v0.2.1
# - realesr-general-x4v3: v0.2.5.0
_MODEL_RELEASE_TAG: dict[str, str] = {
    _ModelName.general: "v0.1.0",
    _ModelName.anime: "v0.2.2.4",
    _ModelName.x2: "v0.2.1",
    _ModelName.strong: "v0.2.5.0",
}


def _remote_weight_url(model_name: str) -> str:
    tag = _MODEL_RELEASE_TAG.get(model_name, "v0.1.0")
    return f"https://github.com/xinntao/Real-ESRGAN/releases/download/{tag}/{model_name}.pth"


def _pick_tile(w: int, h: int, is_gpu: bool) -> int:
    """
    Balance tile count vs per-tile work.

    CPU: tiny inputs → tile 0 (single forward, least Python overhead).
         medium → 400, large → 256 (cache-friendly, avoids giant tensors).
    GPU: 512 saturates VRAM well.
    """
    if is_gpu:
        return 512
    m = max(w, h)
    if m <= 640:
        return 0
    if m <= 1280:
        return 400
    return 256


def _resolve_model(
    upscale_model: UpscaleModel,
    more_model: MoreModel | None,
    output_scale: int,
) -> tuple[str, int]:
    """
    Return (model_name, native_scale) for the requested configuration.

    *output_scale* is the requested integer enlargement (2, 4, …). Use 2 to select
    RealESRGAN_x2plus (fast on CPU). Gentle always uses anime x4 (no x2 weights).
    """
    if upscale_model == UpscaleModel.gentle:
        return _ModelName.anime, 4
    if upscale_model == UpscaleModel.more:
        if more_model in (MoreModel.strong, MoreModel.ultra):
            return _ModelName.strong, 4
        if output_scale <= 2:
            return _ModelName.x2, 2
        return _ModelName.general, 4
    if output_scale <= 2:
        return _ModelName.x2, 2
    return _ModelName.general, 4


def _load_upscaler(model_name: str, tile: int):
    """Load (or return cached) RealESRGANer. Cache key = model + tile size."""
    cache_key = f"{model_name}:t{tile}"
    if cache_key in _upscaler_cache:
        return _upscaler_cache[cache_key]

    from basicsr.archs.rrdbnet_arch import RRDBNet
    from realesrgan import RealESRGANer

    settings = get_settings()
    is_gpu   = torch.cuda.is_available()
    device   = "cuda" if is_gpu else "cpu"
    logger.info("Loading %s on %s (tile=%s) …", model_name, device, tile)

    native_scale = 2 if model_name == _ModelName.x2 else 4

    arch_kwargs: dict = dict(num_in_ch=3, num_out_ch=3, num_feat=64, num_grow_ch=32)
    if model_name == _ModelName.anime:
        net = RRDBNet(**arch_kwargs, num_block=6,  scale=4)
    elif model_name == _ModelName.x2:
        net = RRDBNet(**arch_kwargs, num_block=23, scale=2)
    else:
        net = RRDBNet(**arch_kwargs, num_block=23, scale=4)

    local_weight = Path(settings.model_cache_dir) / f"{model_name}.pth"
    model_path = str(local_weight) if local_weight.exists() else _remote_weight_url(model_name)

    tile_pad = 10 if tile > 0 else 0

    upscaler = RealESRGANer(
        scale=native_scale,
        model_path=model_path,
        model=net,
        tile=tile,
        tile_pad=tile_pad,
        pre_pad=0,
        half=is_gpu,
        device=device,
    )

    _upscaler_cache[cache_key] = upscaler
    return upscaler


def _extra_cap_input_for_ge4_cpu(
    image: Image.Image,
    *,
    is_cpu: bool,
    settings,
    size_mode: SizeMode,
    scale_factor: ScaleFactor,
    custom_width: int | None,
    custom_height: int | None,
) -> Image.Image:
    """
    4×+ upscales on CPU are much slower; shrink input further so jobs finish within timeouts.
    Controlled by max_input_mp_cpu_scale_ge_4 (0 = off).
    """
    if not is_cpu:
        return image
    cap_ge4 = float(getattr(settings, "max_input_mp_cpu_scale_ge_4", 0.0) or 0.0)
    if cap_ge4 <= 0:
        return image
    w, h = image.size
    ge4 = False
    if size_mode == SizeMode.scale:
        ge4 = int(scale_factor) >= 4
    elif size_mode == SizeMode.auto:
        ge4 = int(settings.auto_upscale_scale) >= 4
    elif size_mode == SizeMode.custom and custom_width and custom_height:
        ge4 = _output_scale_from_dims(w, h, custom_width, custom_height) >= 4
    if not ge4:
        return image
    if settings.max_input_mp_cpu > 0:
        tight = min(float(settings.max_input_mp_cpu), cap_ge4)
    else:
        tight = cap_ge4
    return _cap_input(image, tight)


def _cap_input(image: Image.Image, max_mp: float) -> Image.Image:
    """Downscale input if it exceeds max_mp megapixels (CPU guard)."""
    if max_mp <= 0:
        return image
    w, h = image.size
    mp = w * h / 1_000_000
    if mp <= max_mp:
        return image
    ratio = (max_mp / mp) ** 0.5
    nw, nh = max(1, int(w * ratio)), max(1, int(h * ratio))
    logger.warning(
        "Input %dx%d (%.1fMP) → downscaled to %dx%d before AI inference",
        w, h, mp, nw, nh,
    )
    return image.resize((nw, nh), Image.LANCZOS)


def upscale(
    image: Image.Image,
    upscale_model: UpscaleModel,
    more_model: MoreModel | None,
    size_mode: SizeMode,
    scale_factor: ScaleFactor,
    custom_width: int | None,
    custom_height: int | None,
) -> Image.Image:
    """Upscale *image* and return the result as a PIL Image."""
    settings = get_settings()
    t0 = time.monotonic()
    is_cpu = not torch.cuda.is_available()

    if is_cpu and settings.max_input_mp_cpu > 0:
        image = _cap_input(image, settings.max_input_mp_cpu)
    image = _extra_cap_input_for_ge4_cpu(
        image,
        is_cpu=is_cpu,
        settings=settings,
        size_mode=size_mode,
        scale_factor=scale_factor,
        custom_width=custom_width,
        custom_height=custom_height,
    )

    src_w, src_h = image.size

    # ── Scale 1×: do NOT run Real-ESRGAN ───────────────────────────────
    # Models are native 2×/4× only. A “1×” job would still run a full 4× forward
    # then LANCZOS shrink → same cost as 4×, looks broken vs 2× (~10s vs timeout).
    # Same-resolution polish = Light AI / face steps in the pipeline, not ESRGAN.
    if size_mode == SizeMode.scale and scale_factor == ScaleFactor.x1:
        logger.info("Scale 1x: skipping Real-ESRGAN (no resolution change)")
        return image.copy()

    if size_mode == SizeMode.custom and custom_width and custom_height:
        target_w, target_h = custom_width, custom_height
        model_pick_scale = _output_scale_from_dims(src_w, src_h, target_w, target_h)
        if model_pick_scale <= 1:
            logger.info("Custom size ≤ original: skipping Real-ESRGAN")
            return image.copy()
    else:
        if size_mode == SizeMode.scale:
            req_scale = int(scale_factor)
        else:
            # Auto: was hard-coded 4× (very slow on CPU). Default = settings.auto_upscale_scale (2).
            req_scale = max(1, min(int(settings.auto_upscale_scale), 16))
        if req_scale == 1:
            logger.info("1× target: skipping Real-ESRGAN (no resolution change)")
            return image.copy()
        target_w, target_h = src_w * req_scale, src_h * req_scale
        # x2 weights only for exact 2× request; 3×/4×/8× use native x4 then LANCZOS if needed
        model_pick_scale = 2 if req_scale == 2 else 4

    max_out_px = settings.max_upscale_mp * 1_000_000
    if target_w * target_h > max_out_px:
        ratio = (max_out_px / (target_w * target_h)) ** 0.5
        target_w = max(1, int(target_w * ratio))
        target_h = max(1, int(target_h * ratio))
        logger.warning("Output capped to %dx%d (max %dMP)", target_w, target_h, settings.max_upscale_mp)

    model_name, native_scale = _resolve_model(upscale_model, more_model, model_pick_scale)

    # CPU: Real-ESRGAN only outputs ~native_scale× LR. Stretching further with LANCZOS
    # adds no texture → user sees “before/after looks the same” (just bigger blur).
    if (
        is_cpu
        and settings.cpu_avoid_lanczos_upscale
        and upscale_model != UpscaleModel.try_all
    ):
        max_w = int(src_w * native_scale)
        max_h = int(src_h * native_scale)
        if target_w > max_w or target_h > max_h:
            r = min(max_w / target_w, max_h / target_h)
            target_w = max(1, int(target_w * r))
            target_h = max(1, int(target_h * r))
            logger.warning(
                "CPU: output size clamped to %dx%d (max %d× neural upscaling from %dx%d; "
                "raise MAX_INPUT_MP_CPU or use GPU for larger sharp outputs)",
                target_w,
                target_h,
                native_scale,
                src_w,
                src_h,
            )
    is_gpu = not is_cpu
    tile = _pick_tile(src_w, src_h, is_gpu)
    upscaler = _load_upscaler(model_name, tile)

    rgb = image.convert("RGB")
    img_array = np.ascontiguousarray(np.asarray(rgb, dtype=np.uint8))

    timeout_s = getattr(settings, "inference_timeout_s", _DEFAULT_TIMEOUT_S)

    logger.info(
        "Running %s (native x%d, tile=%s) on %dx%d → target %dx%d",
        model_name, native_scale, tile, src_w, src_h, target_w, target_h,
    )

    # inference_mode: no autograd graph — faster, less memory
    # Timeout enforced by asyncio.wait_for around whole pipeline in queue.py
    with torch.inference_mode():
        output_array, _ = upscaler.enhance(img_array, outscale=native_scale)

    result = Image.fromarray(output_array)

    if (result.width, result.height) != (target_w, target_h):
        result = result.resize((target_w, target_h), Image.LANCZOS)

    elapsed = time.monotonic() - t0
    logger.info(
        "Upscaled %dx%d → %dx%d via %s in %.1fs",
        src_w, src_h, result.width, result.height, model_name, elapsed,
    )
    return result

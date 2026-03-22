"""
Main dispatcher — runs the full processing pipeline for a job.

Pipeline order (each step is optional based on ops):
  1. Upscale (Real-ESRGAN)
  2. Face enhance (GFPGAN) — Prime model always runs this
  3. Light AI (color + contrast correction)
  4. Remove background (rembg)

Returns one or more output PIL Images (try_all returns 3).
"""
import logging
from typing import NamedTuple

from PIL import Image

from app.schemas import BgType, MoreModel, ScaleFactor, SizeMode, UpscaleModel

logger = logging.getLogger(__name__)


class ProcessResult(NamedTuple):
    images: list[Image.Image]   # one image normally, three for try_all
    metadata: dict


def run_pipeline(
    image: Image.Image,
    upscale_enabled: bool,
    upscale_model: UpscaleModel,
    more_model: MoreModel | None,
    size_mode: SizeMode,
    scale_factor: ScaleFactor,
    custom_width: int | None,
    custom_height: int | None,
    light_ai_enabled: bool,
    light_ai_intensity: int,
    remove_bg_enabled: bool,
    bg_type: BgType,
    clip_to_object: bool,
) -> ProcessResult:
    outputs: list[Image.Image] = []
    meta: dict = {}

    # try_all: run Prime, Gentle, OldPhoto independently (3× cost on CPU — avoid for dev)
    if upscale_model == UpscaleModel.try_all:
        variants: list[dict] = []
        for model in (UpscaleModel.prime, UpscaleModel.gentle, UpscaleModel.old_photo):
            result, steps = _run_single(
                image=image,
                upscale_enabled=upscale_enabled,
                upscale_model=model,
                more_model=None,
                size_mode=size_mode,
                scale_factor=scale_factor,
                custom_width=custom_width,
                custom_height=custom_height,
                light_ai_enabled=light_ai_enabled,
                light_ai_intensity=light_ai_intensity,
                remove_bg_enabled=False,   # bg removal disabled for try_all
                bg_type=bg_type,
                clip_to_object=clip_to_object,
            )
            outputs.append(result)
            variants.append({"model": model.value, "steps": steps})
        meta["try_all"] = True
        meta["variants"] = variants
    else:
        result, steps = _run_single(
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
            remove_bg_enabled=remove_bg_enabled,
            bg_type=bg_type,
            clip_to_object=clip_to_object,
        )
        outputs.append(result)
        meta["steps"] = steps

    return ProcessResult(images=outputs, metadata=meta)


def _run_single(
    image: Image.Image,
    upscale_enabled: bool,
    upscale_model: UpscaleModel,
    more_model: MoreModel | None,
    size_mode: SizeMode,
    scale_factor: ScaleFactor,
    custom_width: int | None,
    custom_height: int | None,
    light_ai_enabled: bool,
    light_ai_intensity: int,
    remove_bg_enabled: bool,
    bg_type: BgType,
    clip_to_object: bool,
) -> tuple[Image.Image, list[str]]:
    # No copy — each step returns a new PIL image (never mutates input in place)
    current: Image.Image = image
    steps = []

    # 1. Upscale
    if upscale_enabled:
        from app.processing.upscale import upscale
        current = upscale(
            image=current,
            upscale_model=upscale_model,
            more_model=more_model,
            size_mode=size_mode,
            scale_factor=scale_factor,
            custom_width=custom_width,
            custom_height=custom_height,
        )
        steps.append("upscale")

    # 2. Face / “old photo” restoration
    from app.config import get_settings
    import torch

    is_gpu = torch.cuda.is_available()
    skip_prime_gfpgan = get_settings().skip_face_enhance_on_cpu and not is_gpu

    if upscale_enabled and upscale_model == UpscaleModel.old_photo:
        if not skip_prime_gfpgan:
            from app.processing.face_enhance import restore_old_photo
            current = restore_old_photo(current)
            steps.append("face_restore_old_photo")
        else:
            # CPU dev: full GFPGAN is often 10+ min — use strong Light AI so output visibly changes
            from app.processing.light_ai import enhance_light
            li = get_settings().old_photo_cpu_light_intensity
            current = enhance_light(current, intensity=min(100, max(0, li)))
            steps.append("old_photo_light_ai_cpu_fallback")
            logger.info(
                "Old photo on CPU: GFPGAN skipped (skip_face_enhance_on_cpu); "
                "applied Light AI fallback intensity=%d. For real face restore set "
                "SKIP_FACE_ENHANCE_ON_CPU=false or use GPU.",
                li,
            )
    elif upscale_enabled and upscale_model == UpscaleModel.prime and not skip_prime_gfpgan:
        from app.processing.face_enhance import enhance_faces
        current = enhance_faces(current, strength=0.5)
        steps.append("face_enhance")
    elif upscale_enabled and upscale_model == UpscaleModel.prime and skip_prime_gfpgan:
        logger.info("Prime on CPU: GFPGAN skipped (skip_face_enhance_on_cpu=True)")

    # 3. Light AI
    if light_ai_enabled:
        from app.processing.light_ai import enhance_light
        current = enhance_light(current, intensity=light_ai_intensity)
        steps.append("light_ai")

    # 4. Remove background (last — works on final resolution)
    if remove_bg_enabled:
        from app.processing.remove_bg import remove_background
        current = remove_background(current, bg_type=bg_type, clip_to_object=clip_to_object)
        steps.append("remove_bg")

    logger.info("Pipeline complete: %s", " → ".join(steps) or "no-op")
    return current, steps

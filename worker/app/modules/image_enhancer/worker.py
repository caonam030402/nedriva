"""Image enhancer worker function — chạy trong arq worker queue `image`."""
import asyncio
import logging
import time
from typing import Any

import httpx
from arq.connections import ArqRedis

from app.config import get_settings
from app.modules.image_enhancer import (
    ImageBgType,
    ImageEnhancerPipeline,
    ImageJobStatus,
    ImageMoreModel,
    ImageScaleFactor,
    ImageSizeMode,
    ImageUpscaleModel,
    get_job_data,
    set_job_status,
)
from app.modules.background_remover import BgRemoverPipeline
from app.storage import download_image_from_url, upload_image

logger = logging.getLogger(__name__)


async def process_image_job(ctx: dict[str, Any], job_id: str, payload: dict) -> dict:
    redis: ArqRedis = ctx["redis"]
    settings = get_settings()
    timeout_s = settings.job_pipeline_timeout_s

    await set_job_status(redis, job_id, {
        "job_id": job_id,
        "queue_item_id": payload["queue_item_id"],
        "status": ImageJobStatus.processing,
    })

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_run_sync, job_id, payload),
            timeout=timeout_s,
        )
        await set_job_status(redis, job_id, result)
        await _send_webhook(result)
        logger.info(
            "Image job %s done in %dms — %d output(s)",
            job_id, result["processing_ms"], len(result["outputs"]),
        )
        return result

    except asyncio.TimeoutError:
        msg = (
            f"Job exceeded pipeline timeout ({timeout_s}s). "
            "Real-ESRGAN on CPU is slow — use a smaller image or run on GPU."
        )
        logger.error("Image job %s timed out after %ds", job_id, timeout_s)
        error_data = {
            "job_id": job_id,
            "queue_item_id": payload["queue_item_id"],
            "status": ImageJobStatus.error,
            "error": msg,
        }
        await set_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        return error_data

    except Exception as exc:
        logger.exception("Image job %s failed: %s", job_id, exc)
        error_data = {
            "job_id": job_id,
            "queue_item_id": payload["queue_item_id"],
            "status": ImageJobStatus.error,
            "error": str(exc),
        }
        await set_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        return error_data


def _run_sync(job_id: str, payload: dict) -> dict:
    start = time.monotonic()
    image = download_image_from_url(payload["image_url"])

    pipeline = ImageEnhancerPipeline()
    result = pipeline.run(
        image=image,
        upscale_enabled=payload.get("upscale_enabled", True),
        upscale_model=ImageUpscaleModel(payload.get("upscale_model", "prime")),
        more_model=ImageMoreModel(payload["more_model"]) if payload.get("more_model") else None,
        size_mode=ImageSizeMode(payload.get("size_mode", "auto")),
        scale_factor=ImageScaleFactor(str(payload.get("scale_factor", "4"))),
        custom_width=payload.get("custom_width"),
        custom_height=payload.get("custom_height"),
        light_ai_enabled=payload.get("light_ai_enabled", False),
        light_ai_intensity=payload.get("light_ai_intensity", 30),
    )

    if payload.get("remove_bg_enabled", False):
        bg_pipeline = BgRemoverPipeline()
        bg_type = ImageBgType(payload.get("bg_type", "general"))
        clip = payload.get("clip_to_object", False)
        processed = []
        for img in result.images:
            bg_result = bg_pipeline.run(image=img, bg_type=bg_type, clip_to_object=clip)
            processed.append(bg_result.image)
        result_images = processed
    else:
        result_images = result.images

    output_urls: list[str] = []
    for img in result_images:
        fmt = "PNG" if img.mode == "RGBA" else "JPEG"
        url = upload_image(img, folder=f"outputs/{job_id}", fmt=fmt)
        output_urls.append(url)

    primary = result_images[0]
    ow, oh = primary.size
    elapsed_ms = int((time.monotonic() - start) * 1000)
    return {
        "job_id": job_id,
        "queue_item_id": payload["queue_item_id"],
        "status": ImageJobStatus.done,
        "output_url": output_urls[0],
        "outputs": output_urls,
        "output_width": ow,
        "output_height": oh,
        "processing_ms": elapsed_ms,
        "metadata": result.metadata,
    }


async def _send_webhook(data: dict) -> None:
    settings = get_settings()
    url = (settings.webhook_url or "").strip()
    if not url:
        return
    headers = {"x-webhook-secret": settings.webhook_secret} if settings.webhook_secret else {}
    timeout = httpx.Timeout(60.0, connect=25.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            await client.post(url, json=data, headers=headers)
    except Exception as exc:
        logger.warning("Webhook delivery failed: %s", exc)

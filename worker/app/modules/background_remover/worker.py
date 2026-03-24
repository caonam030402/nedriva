"""Background remover worker function — chạy trong arq worker queue `bg_remover`."""
import asyncio
import logging
import time
from typing import Any

import httpx
from arq.connections import ArqRedis

from app.config import get_settings
from app.modules.background_remover import (
    BgRemoverPipeline,
    BgType,
    get_bg_job_data,
    set_bg_job_status,
)
from app.storage import download_image_from_url, upload_image

logger = logging.getLogger(__name__)


async def process_bg_removal_job(ctx: dict[str, Any], job_id: str, payload: dict) -> dict:
    redis: ArqRedis = ctx["redis"]

    await set_bg_job_status(redis, job_id, {
        "job_id": job_id,
        "status": "processing",
        "output_url": None,
        "error": None,
        "processing_ms": None,
    })

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_run_sync, job_id, payload),
            timeout=300,
        )
        await set_bg_job_status(redis, job_id, result)
        await _send_webhook(result)
        return result

    except asyncio.TimeoutError:
        msg = "Background removal exceeded 5min timeout"
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "output_url": None,
            "error": msg,
            "processing_ms": None,
        }
        await set_bg_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        return error_data

    except Exception as exc:
        logger.exception("BgRemoval job %s failed", job_id)
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "output_url": None,
            "error": str(exc),
            "processing_ms": None,
        }
        await set_bg_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        return error_data


def _run_sync(job_id: str, payload: dict) -> dict:
    start = time.monotonic()
    logger.info("BgRemoval job %s: downloading %s", job_id, payload["input_url"])
    image = download_image_from_url(payload["input_url"])

    pipeline = BgRemoverPipeline()
    bg_type = BgType.car if payload.get("bg_type") == "car" else BgType.general
    result = pipeline.run(
        image=image,
        bg_type=bg_type,
        alpha_matting=payload.get("alpha_matting", False),
        alpha_matting_foreground_threshold=payload.get("alpha_matting_foreground_threshold", 240),
        alpha_matting_background_threshold=payload.get("alpha_matting_background_threshold", 10),
        alpha_matting_erode_size=payload.get("alpha_matting_erode_size", 10),
        post_process_mask=payload.get("post_process_mask", False),
        background_color=payload.get("background_color"),
        clip_to_object=payload.get("clip_to_object", False),
    )

    url = upload_image(result.image, folder=f"bg-removal/outputs/{job_id}", fmt="PNG")
    elapsed_ms = int((time.monotonic() - start) * 1000)
    logger.info("BgRemoval job %s done in %dms", job_id, elapsed_ms)

    return {
        "job_id": job_id,
        "status": "done",
        "output_url": url,
        "error": None,
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

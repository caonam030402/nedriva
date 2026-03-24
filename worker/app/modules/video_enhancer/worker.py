"""Video enhancer worker function — chạy trong arq worker queue `video`."""
import asyncio
import logging
from typing import Any

from arq.connections import ArqRedis

from app.config import get_settings
from app.modules.video_enhancer import (
    VideoEnhancerPipeline,
    VideoJobStatus,
    get_video_job_data,
    set_video_job_status,
)

logger = logging.getLogger(__name__)


async def process_video_job(ctx: dict[str, Any], job_id: str, payload: dict) -> dict:
    redis: ArqRedis = ctx["redis"]
    settings = get_settings()
    timeout_s = settings.video_job_pipeline_timeout_s

    await set_video_job_status(
        redis, job_id,
        {
            "job_id": job_id,
            "status": VideoJobStatus.processing.value,
            "progress": 15,
            "stage_label": "Enhancing",
            "output_url": None,
            "error": None,
        },
    )

    try:
        job_data = await asyncio.wait_for(
            asyncio.to_thread(_run_sync, job_id, payload),
            timeout=timeout_s,
        )
        await set_video_job_status(redis, job_id, job_data)
        logger.info("Video job %s finished — %s", job_id, job_data.get("output_url"))
        return job_data

    except asyncio.TimeoutError:
        msg = f"Video job exceeded pipeline timeout ({timeout_s}s)."
        logger.error("Video job %s timed out after %ds", job_id, timeout_s)
        error_data = {
            "job_id": job_id,
            "status": VideoJobStatus.failed.value,
            "progress": 0,
            "stage_label": None,
            "output_url": None,
            "error": msg,
        }
        await set_video_job_status(redis, job_id, error_data)
        return error_data

    except Exception as exc:
        logger.exception("Video job %s failed: %s", job_id, exc)
        error_data = {
            "job_id": job_id,
            "status": VideoJobStatus.failed.value,
            "progress": 0,
            "stage_label": None,
            "output_url": None,
            "error": str(exc),
        }
        await set_video_job_status(redis, job_id, error_data)
        return error_data


def _run_sync(job_id: str, payload: dict) -> dict:
    pipeline = VideoEnhancerPipeline()
    result = pipeline.run(
        job_id=job_id,
        input_url=payload["input_url"],
        output_key=payload["output_key"],
        upscale_factor=payload["options"].get("upscale_factor", "auto"),
        denoise=payload["options"].get("denoise", False),
        deblur=payload["options"].get("deblur", False),
        face_enhance=payload["options"].get("face_enhance", False),
        style=payload["options"].get("style", "natural"),
    )
    return {
        "job_id": result.job_id,
        "status": result.status,
        "output_url": result.output_url,
        "progress": result.progress,
        "stage_label": result.stage_label,
        "error": result.error,
    }

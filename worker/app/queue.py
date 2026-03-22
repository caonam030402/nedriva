"""
Job queue using arq (async Redis Queue).

Each job:
  1. Downloads the source image from image_url
  2. Runs the processing pipeline
  3. Uploads outputs to R2/S3
  4. Stores result in Redis hash  (job:{job_id})
  5. POSTs a webhook to Next.js with the result

Job status is stored in Redis so GET /jobs/{id} can read it.

IMPORTANT: Heavy work runs in asyncio.to_thread() so the event loop is not blocked.
If the pipeline ran synchronously inside this async function, arq's job_timeout and
asyncio timers would never fire → Redis stuck on "processing" forever.
"""
import asyncio
import json
import logging
import time
from typing import Any

import httpx
from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.config import get_settings
from app.schemas import JobStatus, VideoJobStatus

logger = logging.getLogger(__name__)


def _redis_settings() -> RedisSettings:
    url = get_settings().redis_url
    # arq RedisSettings.from_dsn parses redis://host:port/db
    return RedisSettings.from_dsn(url)


async def get_redis_pool() -> ArqRedis:
    return await create_pool(_redis_settings())


# ── Job result helpers ─────────────────────────────────────────

async def set_job_status(redis: ArqRedis, job_id: str, data: dict) -> None:
    await redis.hset(f"job:{job_id}", mapping={k: json.dumps(v) for k, v in data.items()})
    await redis.expire(f"job:{job_id}", 86400)  # 24h TTL


async def get_job_data(redis: ArqRedis, job_id: str) -> dict | None:
    raw = await redis.hgetall(f"job:{job_id}")
    if not raw:
        return None
    return {k.decode(): json.loads(v) for k, v in raw.items()}


# ── Video job state (separate Redis key from image jobs) ───────

async def set_video_job_status(redis: ArqRedis, job_id: str, data: dict) -> None:
    await redis.hset(f"vjob:{job_id}", mapping={k: json.dumps(v) for k, v in data.items()})
    await redis.expire(f"vjob:{job_id}", 86400)


async def get_video_job_data(redis: ArqRedis, job_id: str) -> dict | None:
    raw = await redis.hgetall(f"vjob:{job_id}")
    if not raw:
        return None
    return {k.decode(): json.loads(v) for k, v in raw.items()}


# ── Worker task ────────────────────────────────────────────────

def _run_pipeline_sync(job_id: str, payload: dict) -> dict:
    """
    Entire CPU/GPU-heavy path in one sync function — must run via asyncio.to_thread
    so the worker event loop stays alive (timeouts + Redis updates work).
    """
    from app.processing import run_pipeline
    from app.schemas import (
        BgType, MoreModel, ScaleFactor, SizeMode, UpscaleModel,
    )
    from app.storage import download_image_from_url, upload_image

    start = time.monotonic()
    image = download_image_from_url(payload["image_url"])
    result = run_pipeline(
        image=image,
        upscale_enabled=payload.get("upscale_enabled", True),
        upscale_model=UpscaleModel(payload.get("upscale_model", "prime")),
        more_model=MoreModel(payload["more_model"]) if payload.get("more_model") else None,
        size_mode=SizeMode(payload.get("size_mode", "auto")),
        scale_factor=ScaleFactor(str(payload.get("scale_factor", "4"))),
        custom_width=payload.get("custom_width"),
        custom_height=payload.get("custom_height"),
        light_ai_enabled=payload.get("light_ai_enabled", False),
        light_ai_intensity=payload.get("light_ai_intensity", 30),
        remove_bg_enabled=payload.get("remove_bg_enabled", False),
        bg_type=BgType(payload.get("bg_type", "general")),
        clip_to_object=payload.get("clip_to_object", False),
    )

    output_urls: list[str] = []
    for img in result.images:
        fmt = "PNG" if img.mode == "RGBA" else "JPEG"
        url = upload_image(img, folder=f"outputs/{job_id}", fmt=fmt)
        output_urls.append(url)

    primary = result.images[0]
    ow, oh = primary.size
    elapsed_ms = int((time.monotonic() - start) * 1000)
    return {
        "job_id": job_id,
        "queue_item_id": payload["queue_item_id"],
        "status": JobStatus.done,
        "output_url": output_urls[0],
        "outputs": output_urls,
        "output_width": ow,
        "output_height": oh,
        "processing_ms": elapsed_ms,
        "metadata": result.metadata,
    }


async def process_image_job(ctx: dict, job_id: str, payload: dict) -> dict:
    """
    arq worker function — runs in the worker process.
    ctx is provided by arq and contains the redis connection.
    """
    redis: ArqRedis = ctx["redis"]
    settings = get_settings()
    timeout_s = settings.job_pipeline_timeout_s

    await set_job_status(redis, job_id, {
        "job_id": job_id,
        "queue_item_id": payload["queue_item_id"],
        "status": JobStatus.processing,
    })

    try:
        job_data = await asyncio.wait_for(
            asyncio.to_thread(_run_pipeline_sync, job_id, payload),
            timeout=timeout_s,
        )
        await set_job_status(redis, job_id, job_data)
        await _send_webhook(job_data)
        logger.info(
            "Job %s done in %dms — %d output(s)",
            job_id,
            job_data["processing_ms"],
            len(job_data["outputs"]),
        )
        return job_data

    except asyncio.TimeoutError:
        msg = (
            f"Job exceeded pipeline timeout ({timeout_s}s). "
            "Real-ESRGAN on CPU in Docker is very slow — use a smaller image, "
            "lower MAX_INPUT_MP_CPU, or run on GPU."
        )
        logger.error("Job %s timed out after %ds", job_id, timeout_s)
        error_data = {
            "job_id": job_id,
            "queue_item_id": payload["queue_item_id"],
            "status": JobStatus.error,
            "error": msg,
        }
        await set_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        # Do not re-raise — avoids arq infinite retries on timeout
        return error_data

    except Exception as exc:
        logger.exception("Job %s failed: %s", job_id, exc)
        error_data = {
            "job_id": job_id,
            "queue_item_id": payload["queue_item_id"],
            "status": JobStatus.error,
            "error": str(exc),
        }
        await set_job_status(redis, job_id, error_data)
        await _send_webhook(error_data)
        # Do not re-raise urllib.HTTPError etc. — arq cannot pickle them (BufferedReader in exc)
        return error_data


# ── Video worker task ───────────────────────────────────────────

def _run_video_pipeline_sync(job_id: str, payload: dict) -> dict:
    from app.processing.video_pipeline import run_video_enhance_sync

    return run_video_enhance_sync(
        job_id,
        payload["input_url"],
        payload["output_key"],
        payload["options"],
    )


async def process_video_job(ctx: dict, job_id: str, payload: dict) -> dict:
    """arq handler — downloads video, runs ffmpeg enhancement, uploads to R2/S3."""
    redis: ArqRedis = ctx["redis"]
    settings = get_settings()
    timeout_s = settings.video_job_pipeline_timeout_s

    await set_video_job_status(
        redis,
        job_id,
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
            asyncio.to_thread(_run_video_pipeline_sync, job_id, payload),
            timeout=timeout_s,
        )
        await set_video_job_status(redis, job_id, job_data)
        logger.info("Video job %s finished — %s", job_id, job_data.get("output_url"))
        return job_data

    except asyncio.TimeoutError:
        msg = (
            f"Video job exceeded pipeline timeout ({timeout_s}s). "
            "Try a shorter clip, lower resolution, or raise VIDEO_JOB_PIPELINE_TIMEOUT_S."
        )
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


async def _send_webhook(data: dict) -> None:
    settings = get_settings()
    url = (settings.webhook_url or "").strip()
    if not url:
        return

    # Docker: localhost = the container itself, not the host — POST never reaches Next.js
    if "localhost" in url and "host.docker.internal" not in url:
        logger.warning(
            "WEBHOOK_URL points at localhost — from inside Docker that is NOT your Mac. "
            "Set WEBHOOK_URL=http://host.docker.internal:3000/api/webhooks/process (or leave empty to skip)."
        )

    headers = {"x-webhook-secret": settings.webhook_secret} if settings.webhook_secret else {}
    # Longer connect timeout: slow TLS / VPN / first request to dev server
    timeout = httpx.Timeout(60.0, connect=25.0)
    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=False,
        ) as client:
            await client.post(url, json=data, headers=headers)
    except httpx.TimeoutException as exc:
        logger.warning(
            "Webhook timeout (%s). Check WEBHOOK_URL, firewall, and that Next.js is running on the host.",
            exc,
        )
    except httpx.ConnectError as exc:
        logger.warning(
            "Webhook connect failed (%s). From Docker use host.docker.internal instead of localhost.",
            exc,
        )
    except Exception as exc:
        logger.warning("Webhook delivery failed: %s", exc)


# ── Worker lifecycle ────────────────────────────────────────────

async def startup(ctx: dict) -> None:
    """Pre-warm the default upscaler and configure torch threads on startup."""
    import os
    import torch

    is_cpu = not torch.cuda.is_available()

    if is_cpu:
        # Use all physical cores for intra-op parallelism (matrix math)
        n_threads = os.cpu_count() or 4
        torch.set_num_threads(n_threads)
        logger.info("CPU mode: %d torch threads", n_threads)

    # Pre-warm the most common model so the first job has zero cold-start delay
    try:
        from app.processing.upscale import _load_upscaler
        logger.info("Pre-warming RealESRGAN_x4plus …")
        # Warm a typical CPU tiling config (matches ~1MP inputs after downscale)
        _load_upscaler("RealESRGAN_x4plus", 256)
        logger.info("Model warm ✓")
    except Exception as exc:
        logger.warning("Model pre-warm failed (non-fatal): %s", exc)


# ── arq WorkerSettings ─────────────────────────────────────────

class WorkerSettings:
    """arq worker configuration — referenced by `python worker.py`."""
    functions = [process_image_job, process_video_job]
    on_startup = startup
    redis_settings = _redis_settings()
    # On CPU: keep at 1 so jobs run serially — 4 jobs competing for the same cores
    # is slower than 1 job using all cores. Set to 4+ on GPU server.
    max_jobs = 1
    # Must cover longest pipeline (video ffmpeg can exceed image AI on long clips)
    job_timeout = max(
        get_settings().job_pipeline_timeout_s,
        get_settings().video_job_pipeline_timeout_s,
    )
    keep_result = 3600            # keep result in Redis for 1h

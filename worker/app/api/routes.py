"""FastAPI route handlers."""
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.config import Settings, get_settings
from app.queue import get_job_data, get_redis_pool
from app.schemas import (
    HealthResponse,
    JobResponse,
    JobStatus,
    JobStatusResponse,
    ProcessRequest,
)

router = APIRouter()


# ── Auth dependency ────────────────────────────────────────────

async def verify_api_key(
    x_api_key: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> None:
    if settings.app_env == "development":
        return  # Skip auth in dev
    if x_api_key != settings.api_secret_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


# ── Routes ─────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Health check — also reports which models are warm in cache."""
    from app.processing.upscale import _upscaler_cache
    from app.processing.remove_bg import _session_cache
    from app.processing.face_enhance import _restorer_cache

    loaded = (
        [f"upscaler:{k}" for k in _upscaler_cache]
        + [f"rembg:{k}" for k in _session_cache]
        + [f"gfpgan:{k}" for k in _restorer_cache]
    )
    return HealthResponse(models_loaded=loaded)


@router.post(
    "/process",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["processing"],
    dependencies=[Depends(verify_api_key)],
)
async def enqueue_job(request: ProcessRequest) -> JobResponse:
    """
    Enqueue an image processing job.
    Returns a job_id immediately; poll GET /jobs/{job_id} for progress.
    """
    job_id = uuid.uuid4().hex
    redis = await get_redis_pool()

    # Persist initial state so GET /jobs/{id} works right away
    from app.queue import set_job_status
    await set_job_status(redis, job_id, {
        "job_id": job_id,
        "queue_item_id": request.queue_item_id,
        "status": JobStatus.queued,
    })

    # Enqueue the arq job
    await redis.enqueue_job(
        "process_image_job",
        job_id=job_id,
        payload=request.model_dump(),
    )

    return JobResponse(job_id=job_id)


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    tags=["processing"],
    dependencies=[Depends(verify_api_key)],
)
async def get_job_status(job_id: str) -> JobStatusResponse:
    """Poll job status and retrieve output URLs when done."""
    redis = await get_redis_pool()
    data = await get_job_data(redis, job_id)

    if data is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        job_id=data["job_id"],
        queue_item_id=data["queue_item_id"],
        status=JobStatus(data["status"]),
        output_url=data.get("output_url"),
        outputs=data.get("outputs"),
        output_width=data.get("output_width"),
        output_height=data.get("output_height"),
        error=data.get("error"),
        processing_ms=data.get("processing_ms"),
        metadata=data.get("metadata", {}),
    )

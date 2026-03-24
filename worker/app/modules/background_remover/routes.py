"""Background remover API — /api/v1/background-remover."""
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.common import verify_api_key
from app.modules.background_remover import (
    BackgroundRemoverJobRequest,
    BackgroundRemoverJobResponse,
    BackgroundRemoverModel,
    BackgroundRemoverStatusResponse,
    get_bg_job_data,
    get_redis_pool,
    set_bg_job_status,
)

logger = logging.getLogger(__name__)
background_remover_router = APIRouter()


@background_remover_router.post(
    "/process",
    response_model=BackgroundRemoverJobResponse,
    status_code=202,
    tags=["background-remover"],
    dependencies=[Depends(verify_api_key)],
)
async def enqueue_background_remover(request: BackgroundRemoverJobRequest) -> BackgroundRemoverJobResponse:
    """Enqueue a background removal job."""
    redis = await get_redis_pool()

    await set_bg_job_status(redis, request.job_id, {
        "job_id": request.job_id,
        "status": "queued",
        "output_url": None,
        "error": None,
        "processing_ms": None,
    })

    await redis.enqueue_job(
        "process_bg_removal_job",
        job_id=request.job_id,
        payload=request.model_dump(),
        _queue="bg_remover",
    )

    logger.info("Background remover job %s enqueued (input=%s)", request.job_id, request.input_url)
    return BackgroundRemoverJobResponse(job_id=request.job_id, status="queued")


@background_remover_router.get(
    "/jobs/{job_id}",
    response_model=BackgroundRemoverStatusResponse,
    tags=["background-remover"],
    dependencies=[Depends(verify_api_key)],
)
async def get_background_remover_job(job_id: str) -> BackgroundRemoverStatusResponse:
    """Poll background removal job status."""
    redis = await get_redis_pool()
    data = await get_bg_job_data(redis, job_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Bg removal job not found")

    return BackgroundRemoverStatusResponse(
        job_id=str(data.get("job_id", job_id)),
        status=str(data.get("status", "queued")),
        output_url=data.get("output_url"),
        error=data.get("error"),
        processing_ms=data.get("processing_ms"),
    )


@background_remover_router.get(
    "/models",
    response_model=dict,
    tags=["background-remover"],
)
async def list_background_remover_models():
    """List available background removal models."""
    return {
        "models": [m.value for m in BackgroundRemoverModel],
        "default": BackgroundRemoverModel.birefnet_general.value,
    }

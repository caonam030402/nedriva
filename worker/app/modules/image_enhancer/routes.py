"""Image enhancer API — /api/v1/image-enhancer."""
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.common import verify_api_key
from app.modules.image_enhancer import (
    ImageHealthResponse,
    ImageJobResponse,
    ImageJobStatus,
    ImageJobStatusResponse,
    ImageProcessRequest,
    get_job_data,
    get_redis_pool,
    set_job_status,
)

logger = logging.getLogger(__name__)
image_enhancer_router = APIRouter()


@image_enhancer_router.get("/health", response_model=ImageHealthResponse, tags=["system"])
async def health() -> ImageHealthResponse:
    """Health check — also reports which models are warm in cache."""
    from app.modules.image_enhancer import ImageEnhancerPipeline
    from app.modules.background_remover import BgRemoverPipeline

    img_pipeline = ImageEnhancerPipeline()
    bg_pipeline = BgRemoverPipeline()

    loaded = (
        [f"upscaler:{k}" for k in img_pipeline._upscaler_cache]
        + [f"rembg:{k}" for k in bg_pipeline._session_cache]
        + [f"gfpgan:{k}" for k in img_pipeline._restorer_cache]
    )
    return ImageHealthResponse(models_loaded=loaded)


@image_enhancer_router.post(
    "/process",
    response_model=ImageJobResponse,
    status_code=202,
    tags=["image-enhancer"],
    dependencies=[Depends(verify_api_key)],
)
async def enqueue_job(request: ImageProcessRequest) -> ImageJobResponse:
    """Enqueue an image enhancement job."""
    job_id = uuid.uuid4().hex
    redis = await get_redis_pool()

    await set_job_status(redis, job_id, {
        "job_id": job_id,
        "queue_item_id": request.queue_item_id,
        "status": ImageJobStatus.queued,
    })

    await redis.enqueue_job(
        "process_image_job",
        job_id=job_id,
        payload=request.model_dump(),
        _queue="image",
    )

    return ImageJobResponse(job_id=job_id)


@image_enhancer_router.get(
    "/jobs/{job_id}",
    response_model=ImageJobStatusResponse,
    tags=["image-enhancer"],
    dependencies=[Depends(verify_api_key)],
)
async def get_job_status(job_id: str) -> ImageJobStatusResponse:
    """Poll job status and retrieve output URLs when done."""
    redis = await get_redis_pool()
    data = await get_job_data(redis, job_id)

    if data is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return ImageJobStatusResponse(
        job_id=data["job_id"],
        queue_item_id=data["queue_item_id"],
        status=ImageJobStatus(data["status"]),
        output_url=data.get("output_url"),
        outputs=data.get("outputs"),
        output_width=data.get("output_width"),
        output_height=data.get("output_height"),
        error=data.get("error"),
        processing_ms=data.get("processing_ms"),
        metadata=data.get("metadata", {}),
    )

"""Video enhancer API — /api/v1/video-enhancer."""
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.common import verify_api_key
from app.modules.video_enhancer import (
    VideoEnqueueResponse,
    VideoJobStatus,
    VideoJobStatusResponse,
    VideoProcessRequest,
    get_redis_pool,
    get_video_job_data,
    set_video_job_status,
)

logger = logging.getLogger(__name__)
video_enhancer_router = APIRouter()


def _validate_output_key(key: str) -> None:
    key = key.strip()
    if not key.startswith("videos/outputs/") or ".." in key or key.startswith("/"):
        raise HTTPException(status_code=400, detail="output_key must be a safe key under videos/outputs/")
    if not key.lower().endswith(".mp4"):
        raise HTTPException(status_code=400, detail="output_key must end with .mp4")


@video_enhancer_router.post(
    "/process",
    response_model=VideoEnqueueResponse,
    status_code=202,
    tags=["video-enhancer"],
    dependencies=[Depends(verify_api_key)],
)
async def enqueue_video(request: VideoProcessRequest) -> VideoEnqueueResponse:
    _validate_output_key(request.output_key)
    redis = await get_redis_pool()

    await set_video_job_status(redis, request.job_id, {
        "job_id": request.job_id,
        "status": VideoJobStatus.queued.value,
        "progress": 0,
        "stage_label": "Queued",
        "output_url": None,
        "error": None,
    })

    await redis.enqueue_job(
        "process_video_job",
        job_id=request.job_id,
        payload={
            "input_url": request.input_url,
            "output_key": request.output_key,
            "options": request.options.model_dump(mode="json"),
        },
        _queue="video",
    )

    return VideoEnqueueResponse(job_id=request.job_id, status=VideoJobStatus.queued)


@video_enhancer_router.get(
    "/jobs/{job_id}",
    response_model=VideoJobStatusResponse,
    tags=["video-enhancer"],
    dependencies=[Depends(verify_api_key)],
)
async def get_video_job(job_id: str) -> VideoJobStatusResponse:
    redis = await get_redis_pool()
    data = await get_video_job_data(redis, job_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Video job not found")

    st = str(data.get("status", "queued"))
    try:
        status_enum = VideoJobStatus(st)
    except ValueError:
        status_enum = VideoJobStatus.queued

    return VideoJobStatusResponse(
        job_id=str(data.get("job_id", job_id)),
        status=status_enum,
        progress=int(data.get("progress", 0) or 0),
        stage_label=data.get("stage_label"),
        output_url=data.get("output_url"),
        error=data.get("error"),
    )

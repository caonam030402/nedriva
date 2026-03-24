from enum import StrEnum

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────

class VideoUpscaleFactor(StrEnum):
    auto = "auto"
    x2   = "2x"
    x4   = "4x"


class VideoEnhanceStyle(StrEnum):
    cinematic = "cinematic"
    social    = "social"
    natural   = "natural"


class VideoJobStatus(StrEnum):
    queued     = "queued"
    processing = "processing"
    done       = "done"
    failed     = "failed"


# ── Requests / Responses ───────────────────────────────────────

class VideoEnhanceOptionsPayload(BaseModel):
    upscale_factor: VideoUpscaleFactor = VideoUpscaleFactor.auto
    denoise: bool    = False
    deblur: bool    = False
    face_enhance: bool = False
    style: VideoEnhanceStyle = VideoEnhanceStyle.natural


class VideoProcessRequest(BaseModel):
    """Enqueue video enhancement — job_id is owned by Next.js / Postgres."""
    job_id: str    = Field(..., min_length=8, max_length=64)
    input_url: str  = Field(..., description="Presigned or public URL to source video")
    output_key: str = Field(
        ...,
        description="S3/R2 object key for the enhanced MP4 (e.g. videos/outputs/.../job.mp4)",
    )
    options: VideoEnhanceOptionsPayload = Field(default_factory=VideoEnhanceOptionsPayload)


class VideoEnqueueResponse(BaseModel):
    job_id: str
    status: VideoJobStatus = VideoJobStatus.queued


class VideoJobStatusResponse(BaseModel):
    job_id: str
    status: VideoJobStatus
    progress: int = 0
    stage_label: str | None = None
    output_url: str | None = None
    error: str | None = None

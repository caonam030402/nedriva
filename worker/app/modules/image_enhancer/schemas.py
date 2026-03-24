from enum import StrEnum

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────

class ImageUpscaleModel(StrEnum):
    prime     = "prime"
    gentle    = "gentle"
    old_photo = "old_photo"
    try_all   = "try_all"
    more      = "more"


class ImageMoreModel(StrEnum):
    balanced = "balanced"
    ultra    = "ultra"
    strong   = "strong"
    digi_art = "digi_art"
    magic    = "magic"


class ImageSizeMode(StrEnum):
    auto   = "auto"
    scale  = "scale"
    custom = "custom"


class ImageScaleFactor(StrEnum):
    x1  = "1"
    x2  = "2"
    x4  = "4"
    x8  = "8"
    x16 = "16"


class ImageBgType(StrEnum):
    general = "general"
    car     = "car"


class ImageJobStatus(StrEnum):
    queued     = "queued"
    processing = "processing"
    done       = "done"
    error      = "error"


# ── Requests / Responses ───────────────────────────────────────

class ImageProcessRequest(BaseModel):
    """Payload sent by Next.js to kick off an image enhancement job."""
    queue_item_id: str = Field(..., description="ID of the QueueItem on the frontend")
    image_url: str     = Field(..., description="Presigned URL or public URL of the source image")

    upscale_enabled: bool             = True
    upscale_model: ImageUpscaleModel  = ImageUpscaleModel.prime
    more_model: ImageMoreModel | None = None
    size_mode: ImageSizeMode          = ImageSizeMode.auto
    scale_factor: ImageScaleFactor    = ImageScaleFactor.x4
    custom_width: int | None          = None
    custom_height: int | None         = None

    light_ai_enabled: bool  = False
    light_ai_intensity: int = Field(30, ge=0, le=100)

    remove_bg_enabled: bool     = False
    bg_type: ImageBgType       = ImageBgType.general
    clip_to_object: bool       = False


class ImageJobResponse(BaseModel):
    """Returned immediately after POST /process."""
    job_id: str
    status: ImageJobStatus = ImageJobStatus.queued


class ImageJobStatusResponse(BaseModel):
    """Returned by GET /jobs/{job_id}."""
    job_id: str
    queue_item_id: str
    status: ImageJobStatus
    output_url: str | None    = None
    outputs: list[str] | None = None
    output_width: int | None  = None
    output_height: int | None = None
    error: str | None         = None
    processing_ms: int | None = None
    metadata: dict            = {}


class ImageHealthResponse(BaseModel):
    status: str = "ok"
    models_loaded: list[str] = []

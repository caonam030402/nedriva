from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


# ── Enums (mirror src/enums/enhancer.ts) ──────────────────────

class UpscaleModel(StrEnum):
    prime     = "prime"
    gentle    = "gentle"
    old_photo = "old_photo"
    try_all   = "try_all"
    more      = "more"


class MoreModel(StrEnum):
    balanced = "balanced"
    ultra    = "ultra"
    strong   = "strong"
    digi_art = "digi_art"
    magic    = "magic"


class SizeMode(StrEnum):
    auto   = "auto"
    scale  = "scale"
    custom = "custom"


class ScaleFactor(StrEnum):
    x1  = "1"
    x2  = "2"
    x4  = "4"
    x8  = "8"
    x16 = "16"


class BgType(StrEnum):
    general = "general"
    car     = "car"


class JobStatus(StrEnum):
    queued     = "queued"
    processing = "processing"
    done       = "done"
    error      = "error"


# ── Request / Response ─────────────────────────────────────────

class ProcessRequest(BaseModel):
    """Payload sent by Next.js to kick off a processing job."""
    queue_item_id: str = Field(..., description="ID of the QueueItem on the frontend")
    image_url: str     = Field(..., description="Presigned URL or public URL of the source image")

    # Ops state (mirrors OpsState in TypeScript)
    upscale_enabled: bool         = True
    upscale_model: UpscaleModel   = UpscaleModel.prime
    more_model: MoreModel | None  = None
    size_mode: SizeMode           = SizeMode.auto
    scale_factor: ScaleFactor     = ScaleFactor.x4
    custom_width: int | None      = None
    custom_height: int | None     = None

    light_ai_enabled: bool    = False
    light_ai_intensity: int   = Field(30, ge=0, le=100)

    remove_bg_enabled: bool   = False
    bg_type: BgType           = BgType.general
    clip_to_object: bool      = False


class JobResponse(BaseModel):
    """Returned immediately after POST /process."""
    job_id: str
    status: JobStatus = JobStatus.queued


class JobStatusResponse(BaseModel):
    """Returned by GET /jobs/{job_id}."""
    job_id: str
    queue_item_id: str
    status: JobStatus
    output_url: str | None     = None
    outputs: list[str] | None  = None   # try_all returns multiple
    output_width: int | None   = None   # actual first output dimensions (UI truth)
    output_height: int | None  = None
    error: str | None          = None
    processing_ms: int | None  = None
    metadata: dict[str, Any]   = {}


class HealthResponse(BaseModel):
    status: str = "ok"
    models_loaded: list[str] = []

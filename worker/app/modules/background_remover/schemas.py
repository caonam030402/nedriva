from enum import StrEnum

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────

class BackgroundRemoverModel(StrEnum):
    birefnet_general       = "birefnet-general"
    birefnet_general_lite = "birefnet-general-lite"
    birefnet_portrait      = "birefnet-portrait"
    u2net                 = "u2net"
    u2net_human_seg       = "u2net-human-seg"
    isnet_general_use     = "isnet-general-use"
    isnet_anime           = "isnet-anime"
    silueta               = "silueta"
    bria_rmbg             = "bria-rmbg"


class BgType(StrEnum):
    general = "general"
    car     = "car"


# ── Requests / Responses ───────────────────────────────────────

class BackgroundRemoverJobRequest(BaseModel):
    """Payload for background removal job."""
    job_id: str = Field(..., description="Unique job ID from Next.js")
    input_url: str = Field(..., description="Public URL of the image in R2")
    bg_type: BgType = BgType.general
    clip_to_object: bool = False
    alpha_matting: bool = False
    alpha_matting_foreground_threshold: int = Field(240, ge=0, le=255)
    alpha_matting_background_threshold: int = Field(10, ge=0, le=255)
    alpha_matting_erode_size: int = Field(10, ge=0)
    post_process_mask: bool = False


class BackgroundRemoverJobResponse(BaseModel):
    job_id: str
    status: str = "queued"


class BackgroundRemoverStatusResponse(BaseModel):
    job_id: str
    status: str
    output_url: str | None = None
    error: str | None = None
    processing_ms: int | None = None

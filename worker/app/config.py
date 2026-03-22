from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_env: str = "development"
    log_level: str = "INFO"

    # API security
    api_secret_key: str = "change-me-in-production"

    # Redis (job queue)
    redis_url: str = "redis://localhost:6379"

    # Storage — Cloudflare R2 (S3-compatible) or AWS S3
    storage_endpoint_url: str = ""          # empty = AWS S3; set for R2: https://<account>.r2.cloudflarestorage.com
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_bucket: str = "pixelai-outputs"
    storage_public_base_url: str = ""       # public URL prefix for output files

    # Processing
    max_image_size_mb: int = 50
    max_upscale_mp: int = 512              # max megapixels after upscale
    # On CPU (local dev), downscale input to this many MP before processing.
    # Prevents 30-min hangs on 17MP images. Set to 0 to disable (GPU server).
    max_input_mp_cpu: float = 2.0
    # When scale ≥4× on CPU, further cap input to this many MP (faster 4×/8×/16×).
    # Set 0 to disable extra cap (same as max_input_mp_cpu only).
    max_input_mp_cpu_scale_ge_4: float = 0.18
    # SizeMode "auto" output multiplier (1–4). Default 2 = same fast path as "Scale → 2×" on CPU.
    # Set 4 for old behaviour (max quality, much slower on CPU).
    auto_upscale_scale: int = Field(default=2, ge=1, le=4)
    # On CPU: skip GFPGAN for **Prime** only (saves one heavy model). Old Photo still gets
    # a Light-AI fallback so the preset is not “only upscale”. Set false for full GFPGAN on CPU (slow).
    skip_face_enhance_on_cpu: bool = True
    # When Old Photo runs on CPU with GFPGAN skipped — stronger color/contrast pass (0–100).
    old_photo_cpu_light_intensity: int = 80
    # On CPU: do not resize *beyond* native model output (e.g. 4×). Extra size is only
    # LANCZOS interpolation → looks like “scale but no detail” vs the original zoomed.
    cpu_avoid_lanczos_upscale: bool = True
    # Hard timeout (seconds) for a single Real-ESRGAN inference call.
    # Job is marked error instead of hanging forever if exceeded.
    # CPU Real-ESRGAN can exceed 4–8 min on large inputs; keep above arq job_timeout margin
    inference_timeout_s: int = 600
    # Hard cap for entire job (download + pipeline + upload). Must run in thread so asyncio can enforce it.
    # 4×+ on Mac CPU Docker often needs 20–30 min — keep arq job_timeout in sync (see app/queue.py).
    job_pipeline_timeout_s: int = 1800
    model_cache_dir: str = "/app/models"   # where to cache downloaded model weights
    # JPEG outputs (RGB) — smaller/faster upload than PNG; ignored for RGBA
    jpeg_output_quality: int = 90

    # Webhook (Next.js notified when job finishes)
    webhook_url: str = ""
    webhook_secret: str = ""

    # Video (ffmpeg pipeline in worker)
    # Must be >= longest expected encode; arq job_timeout uses max(image, video) below.
    video_job_pipeline_timeout_s: int = 7200
    max_video_duration_secs: int = 600  # 10 minutes
    max_video_size_mb: int = 500


@lru_cache
def get_settings() -> Settings:
    return Settings()

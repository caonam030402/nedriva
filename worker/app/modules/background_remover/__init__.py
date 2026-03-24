from app.redis_pool import get_redis_pool
from .pipeline import BgRemoverPipeline, BgRemoverResult, BgRemovalModel
from .queue import get_job_data as get_bg_job_data, set_job_status as set_bg_job_status
from .schemas import (
    BackgroundRemoverJobRequest,
    BackgroundRemoverJobResponse,
    BackgroundRemoverModel,
    BackgroundRemoverStatusResponse,
    BgType,
)
from .worker import process_bg_removal_job

__all__ = [
    "BgRemoverPipeline",
    "BgRemoverResult",
    "BgRemovalModel",
    "BackgroundRemoverModel",
    "BgType",
    "BackgroundRemoverJobRequest",
    "BackgroundRemoverJobResponse",
    "BackgroundRemoverStatusResponse",
    # queue
    "get_redis_pool",
    "set_bg_job_status",
    "get_bg_job_data",
    # worker
    "process_bg_removal_job",
]

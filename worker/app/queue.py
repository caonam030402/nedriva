"""
WorkerSettings factory for arq.
Each module contains its own worker function in worker.py.
Run individually or all at once via worker.py.
"""
import logging

from arq.connections import RedisSettings

from app.config import get_settings

logger = logging.getLogger(__name__)


def _redis_settings() -> RedisSettings:
    return RedisSettings.from_dsn(get_settings().redis_url)


def _image_worker_settings() -> type:
    from app.modules.image_enhancer.worker import process_image_job

    s = get_settings()
    _max_jobs = s.max_jobs_image if s.max_jobs_image > 0 else 1

    class ImageWorkerSettings:
        functions = [process_image_job]
        redis_settings = _redis_settings()
        max_jobs = _max_jobs
        job_timeout = s.job_pipeline_timeout_s
        keep_result = 3600
        queue_name = "image"

    return ImageWorkerSettings


def _video_worker_settings() -> type:
    from app.modules.video_enhancer.worker import process_video_job

    s = get_settings()
    _max_jobs = s.max_jobs_video if s.max_jobs_video > 0 else 1

    class VideoWorkerSettings:
        functions = [process_video_job]
        redis_settings = _redis_settings()
        max_jobs = _max_jobs
        job_timeout = s.video_job_pipeline_timeout_s
        keep_result = 3600
        queue_name = "video"

    return VideoWorkerSettings


def _bg_remover_worker_settings() -> type:
    from app.modules.background_remover.worker import process_bg_removal_job

    s = get_settings()
    _max_jobs = s.max_jobs_bg_remover if s.max_jobs_bg_remover > 0 else 1

    class BgRemoverWorkerSettings:
        functions = [process_bg_removal_job]
        redis_settings = _redis_settings()
        max_jobs = _max_jobs
        job_timeout = 600
        keep_result = 3600
        queue_name = "bg_remover"

    return BgRemoverWorkerSettings

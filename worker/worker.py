"""
arq worker entry point — runs all 3 workers concurrently.

Run with:
  python worker.py
"""
import app.compat  # noqa: F401 — must be first import
import asyncio
import logging
import multiprocessing

from app.queue import (
    _bg_remover_worker_settings,
    _image_worker_settings,
    _video_worker_settings,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def run_image():
    import app.compat  # noqa: F401
    from arq.worker import create_worker
    from app.queue import _image_worker_settings
    w = create_worker(_image_worker_settings())
    w.loop.run_until_complete(w.async_run())


def run_video():
    import app.compat  # noqa: F401
    from arq.worker import create_worker
    from app.queue import _video_worker_settings
    w = create_worker(_video_worker_settings())
    w.loop.run_until_complete(w.async_run())


def run_bg():
    import app.compat  # noqa: F401
    from arq.worker import create_worker
    from app.queue import _bg_remover_worker_settings
    w = create_worker(_bg_remover_worker_settings())
    w.loop.run_until_complete(w.async_run())


if __name__ == "__main__":
    p_image = multiprocessing.Process(target=run_image)
    p_video = multiprocessing.Process(target=run_video)
    p_bg = multiprocessing.Process(target=run_bg)

    p_image.start()
    p_video.start()
    p_bg.start()

    p_image.join()
    p_video.join()
    p_bg.join()

"""
arq worker entry point.

Run with:
  python worker.py

Or in production:
  arq app.queue.WorkerSettings
"""
import app.compat  # noqa: F401 — must be first import
import asyncio
import logging

from arq import run_worker

from app.queue import WorkerSettings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

if __name__ == "__main__":
    run_worker(WorkerSettings)

"""FastAPI application entry point."""
import app.compat  # noqa: F401 — must be first import
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.video_routes import video_router
from app.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up storage connection and log startup info."""
    settings = get_settings()
    logger.info("Starting Nedriva Python Service (env=%s)", settings.app_env)
    logger.info("Redis: %s", settings.redis_url)
    logger.info("Storage bucket: %s", settings.storage_bucket)
    yield
    logger.info("Shutting down…")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Nedriva Processing Service",
        description="AI image processing and ffmpeg-based video enhancement",
        version="1.0.0",
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.app_env == "development" else [],
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api/v1")
    app.include_router(video_router, prefix="/api/v1/video")

    return app


app = create_app()

"""Cloudflare R2 / AWS S3 storage helpers."""
import io
import logging
import threading
import uuid
from pathlib import Path

import boto3
import httpx
from botocore.config import Config
from PIL import Image

from app.config import get_settings

logger = logging.getLogger(__name__)

_s3_lock = threading.Lock()
_s3_client = None

_http_lock = threading.Lock()
_http_client: httpx.Client | None = None


def _get_client():
    """Thread-safe singleton S3 client (avoids new TCP/TLS per upload)."""
    global _s3_client
    if _s3_client is not None:
        return _s3_client
    with _s3_lock:
        if _s3_client is None:
            settings = get_settings()
            kwargs: dict = {
                "aws_access_key_id": settings.storage_access_key,
                "aws_secret_access_key": settings.storage_secret_key,
                "config": Config(signature_version="s3v4", max_pool_connections=20),
            }
            if settings.storage_endpoint_url:
                kwargs["endpoint_url"] = settings.storage_endpoint_url
            _s3_client = boto3.client("s3", **kwargs)
    return _s3_client


def _get_http() -> httpx.Client:
    """Reuse keep-alive connections for image downloads."""
    global _http_client
    if _http_client is not None:
        return _http_client
    with _http_lock:
        if _http_client is None:
            _http_client = httpx.Client(
                timeout=httpx.Timeout(120.0, connect=30.0),
                limits=httpx.Limits(max_keepalive_connections=8, max_connections=16),
                follow_redirects=True,
            )
    return _http_client


def upload_image(image: Image.Image, folder: str = "outputs", fmt: str = "PNG") -> str:
    """Upload a PIL Image to storage, return the public URL."""
    settings = get_settings()

    buf = io.BytesIO()
    fmt_u = fmt.upper()
    if fmt_u == "JPEG":
        # RGB-only path in caller; progressive + quality = smaller + faster egress
        rgb = image.convert("RGB")
        rgb.save(
            buf,
            format="JPEG",
            quality=settings.jpeg_output_quality,
            optimize=True,
            progressive=True,
        )
    else:
        image.save(buf, format=fmt_u, optimize=True)
    buf.seek(0)

    ext = fmt.lower()
    key = f"{folder}/{uuid.uuid4().hex}.{ext}"
    content_type = f"image/{'jpeg' if ext == 'jpeg' else ext}"

    client = _get_client()
    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=buf,
        ContentType=content_type,
        ACL="public-read",
    )

    base = settings.storage_public_base_url.rstrip("/")
    url = f"{base}/{key}" if base else f"https://{settings.storage_bucket}.s3.amazonaws.com/{key}"
    logger.info("Uploaded %s → %s", key, url)
    return url


def upload_bytes(data: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    settings = get_settings()
    client = _get_client()
    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        ACL="public-read",
    )
    base = settings.storage_public_base_url.rstrip("/")
    return f"{base}/{key}" if base else f"https://{settings.storage_bucket}.s3.amazonaws.com/{key}"


def download_image_from_url(url: str) -> Image.Image:
    """Download an image from a URL and return a PIL Image."""
    r = _get_http().get(url)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")

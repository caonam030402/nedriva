"""
Video enhancement — runs inside the arq worker (sync, via asyncio.to_thread).

Uses ffmpeg for denoise, optional Lanczos upscale, colour/style tweaks, and sharpening.
This matches the product expectation that heavy video work lives in the Python service;
neural upscaling per frame can be added later on top of this scaffold.
"""
from __future__ import annotations

import json
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import httpx

from app.config import get_settings
from app.storage import upload_bytes

logger = logging.getLogger(__name__)


def _http() -> httpx.Client:
    return httpx.Client(
        timeout=httpx.Timeout(600.0, connect=60.0),
        limits=httpx.Limits(max_connections=4),
        follow_redirects=True,
    )


def download_video_to_path(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with _http().stream("GET", url) as r:
        r.raise_for_status()
        settings = get_settings()
        max_mb = settings.max_video_size_mb
        max_bytes = max_mb * 1024 * 1024
        written = 0
        with dest.open("wb") as f:
            for chunk in r.iter_bytes(chunk_size=1024 * 1024):
                written += len(chunk)
                if written > max_bytes:
                    raise ValueError(
                        f"Video exceeds max size ({max_mb} MB). "
                        "Use a shorter or lower-bitrate file.",
                    )
                f.write(chunk)


def probe_video(path: Path) -> tuple[int, int, float]:
    """Return width, height, duration seconds (best effort)."""
    proc = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or "ffprobe failed")
    data = json.loads(proc.stdout or "{}")
    streams = data.get("streams") or []
    if not streams:
        raise RuntimeError("No video stream found")
    s0 = streams[0]
    w, h = int(s0["width"]), int(s0["height"])
    fmt = data.get("format") or {}
    dur_s = float(fmt.get("duration") or 0.0)
    return w, h, dur_s


def _build_vf_chain(width: int, height: int, options: dict[str, Any]) -> str:
    upscale = str(options.get("upscale_factor", "auto"))
    denoise = bool(options.get("denoise", False))
    deblur = bool(options.get("deblur", False))
    face_enhance = bool(options.get("face_enhance", False))
    style = str(options.get("style", "natural"))

    parts: list[str] = []

    if denoise:
        parts.append("hqdn3d=4:3:6:4.5")

    # Upscale (Lanczos). Neural per-frame can replace this later.
    if upscale == "2x":
        parts.append("scale=iw*2:ih*2:flags=lanczos")
    elif upscale == "4x":
        parts.append("scale=iw*4:ih*4:flags=lanczos")
    elif upscale == "auto":
        if max(width, height) < 960:
            parts.append("scale=iw*2:ih*2:flags=lanczos")

    if style == "cinematic":
        parts.append("eq=contrast=1.08:brightness=0.02:saturation=1.05")
    elif style == "social":
        parts.append("eq=contrast=1.05:saturation=1.12:brightness=0.01")
    # natural: no extra colour block

    if deblur:
        parts.append("unsharp=5:5:1.0:5:5:0.0")
    if face_enhance:
        parts.append("unsharp=3:3:1.25:3:3:0.05")

    if not parts:
        parts.append("null")

    return ",".join(parts)


def run_ffmpeg_enhance(input_path: Path, output_path: Path, vf: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(input_path),
        "-vf",
        vf,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(output_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip() or "ffmpeg failed"
        logger.error("ffmpeg exit %s: %s", proc.returncode, err[:2000])
        raise RuntimeError(f"ffmpeg failed: {err[:500]}")


def run_video_enhance_sync(
    job_id: str,
    input_url: str,
    output_key: str,
    options: dict[str, Any],
) -> dict[str, Any]:
    """
    Download → probe → ffmpeg → upload. Returns a dict suitable for Redis / API
    (status done, output_url = S3 key, progress, stage_label).
    """
    settings = get_settings()
    with tempfile.TemporaryDirectory(prefix=f"video-{job_id}-") as tmp:
        tmp_path = Path(tmp)
        src = tmp_path / "input.bin"
        dst = tmp_path / "output.mp4"

        logger.info("Video job %s: downloading…", job_id)
        download_video_to_path(input_url, src)

        w, h, dur = probe_video(src)
        if dur > settings.max_video_duration_secs:
            raise ValueError(
                f"Video too long ({dur:.0f}s). Max {settings.max_video_duration_secs}s.",
            )

        vf = _build_vf_chain(w, h, options)
        logger.info("Video job %s: encoding (%dx%d, %.1fs) vf=%s", job_id, w, h, dur, vf)
        run_ffmpeg_enhance(src, dst, vf)

        if not dst.exists() or dst.stat().st_size < 32:
            raise RuntimeError("Encoder produced empty output")

        data = dst.read_bytes()
        logger.info("Video job %s: uploading %s bytes → %s", job_id, len(data), output_key)
        upload_bytes(data, output_key, content_type="video/mp4")

    return {
        "job_id": job_id,
        "status": "done",
        "progress": 100,
        "stage_label": "Done",
        "output_url": output_key,
        "error": None,
    }

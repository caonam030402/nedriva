"""
Video Enhancement Pipeline using ffmpeg.

Features:
  - Denoise (hqdn3d filter)
  - Upscale (Lanczos): 2x, 4x, or auto
  - Color/style presets: cinematic, social, natural
  - Sharpen (unsharp mask)
  - Face enhance (unsharp variant)
  - Audio passthrough (AAC 128kbps)

Reference: worker/app/modules/video_enhancer/pipeline.py
"""
from __future__ import annotations

import json
import logging
import subprocess
import tempfile
from enum import StrEnum
from pathlib import Path
from typing import Any, NamedTuple

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class VideoUpscaleFactor(StrEnum):
    auto = "auto"
    x2 = "2x"
    x4 = "4x"


class VideoStyle(StrEnum):
    cinematic = "cinematic"
    social = "social"
    natural = "natural"


class VideoEnhancerResult(NamedTuple):
    job_id: str
    status: str
    output_url: str | None
    progress: int
    stage_label: str | None
    error: str | None


class VideoEnhancerPipeline:
    """
    Video enhancement pipeline using ffmpeg.
    """

    def __init__(self):
        pass

    def run(
        self,
        job_id: str,
        input_url: str,
        output_key: str,
        upscale_factor: VideoUpscaleFactor = VideoUpscaleFactor.auto,
        denoise: bool = False,
        deblur: bool = False,
        face_enhance: bool = False,
        style: VideoStyle = VideoStyle.natural,
    ) -> VideoEnhancerResult:
        """Run video enhancement pipeline."""
        options = {
            "upscale_factor": upscale_factor.value,
            "denoise": denoise,
            "deblur": deblur,
            "face_enhance": face_enhance,
            "style": style.value,
        }

        return self._run_sync(job_id, input_url, output_key, options)

    def _run_sync(
        self,
        job_id: str,
        input_url: str,
        output_key: str,
        options: dict[str, Any],
    ) -> VideoEnhancerResult:
        """Execute video pipeline synchronously."""
        from app.storage import upload_bytes

        settings = get_settings()

        with tempfile.TemporaryDirectory(prefix=f"video-{job_id}-") as tmp:
            tmp_path = Path(tmp)
            src = tmp_path / "input.mp4"
            dst = tmp_path / "output.mp4"

            logger.info("Video job %s: downloading…", job_id)
            self._download_video(input_url, src, settings)

            w, h, dur = self._probe_video(src)
            if dur > settings.max_video_duration_secs:
                return VideoEnhancerResult(
                    job_id=job_id, status="failed", output_url=None,
                    progress=0, stage_label=None,
                    error=f"Video too long ({dur:.0f}s). Max {settings.max_video_duration_secs}s.",
                )

            vf = self._build_vf_chain(w, h, options)
            logger.info("Video job %s: encoding (%dx%d, %.1fs) vf=%s", job_id, w, h, dur, vf)
            self._run_ffmpeg(src, dst, vf)

            if not dst.exists() or dst.stat().st_size < 32:
                return VideoEnhancerResult(
                    job_id=job_id, status="failed", output_url=None,
                    progress=0, stage_label=None, error="Encoder produced empty output",
                )

            data = dst.read_bytes()
            logger.info("Video job %s: uploading %s bytes → %s", job_id, len(data), output_key)
            upload_bytes(data, output_key, content_type="video/mp4")

        return VideoEnhancerResult(
            job_id=job_id,
            status="done",
            output_url=output_key,
            progress=100,
            stage_label="Done",
            error=None,
        )

    # ── Download ─────────────────────────────────────────────

    def _download_video(self, url: str, dest: Path, settings) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        max_bytes = settings.max_video_size_mb * 1024 * 1024

        with httpx.Client(timeout=httpx.Timeout(600, connect=60), limits=httpx.Limits(max_connections=4)) as client:
            with client.stream("GET", url) as r:
                r.raise_for_status()
                written = 0
                with dest.open("wb") as f:
                    for chunk in r.iter_bytes(chunk_size=1024 * 1024):
                        written += len(chunk)
                        if written > max_bytes:
                            raise ValueError(f"Video exceeds max size ({settings.max_video_size_mb} MB)")
                        f.write(chunk)

    # ── Probe ────────────────────────────────────────────────

    def _probe_video(self, path: Path) -> tuple[int, int, float]:
        """Return width, height, duration."""
        proc = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-show_entries", "format=duration",
                "-of", "json", str(path),
            ],
            capture_output=True, text=True, check=False,
        )
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr or "ffprobe failed")

        data = json.loads(proc.stdout or "{}")
        streams = data.get("streams") or []
        if not streams:
            raise RuntimeError("No video stream found")

        s0 = streams[0]
        w, h = int(s0["width"]), int(s0["height"])
        dur = float((data.get("format") or {}).get("duration") or 0.0)
        return w, h, dur

    # ── Filter chain ─────────────────────────────────────────

    def _build_vf_chain(self, w: int, h: int, options: dict[str, Any]) -> str:
        parts = []

        if options.get("denoise"):
            parts.append("hqdn3d=4:3:6:4.5")

        upscale = str(options.get("upscale_factor", "auto"))
        if upscale == "2x":
            parts.append("scale=iw*2:ih*2:flags=lanczos")
        elif upscale == "4x":
            parts.append("scale=iw*4:ih*4:flags=lanczos")
        elif upscale == "auto":
            if max(w, h) < 960:
                parts.append("scale=iw*2:ih*2:flags=lanczos")

        style = str(options.get("style", "natural"))
        if style == "cinematic":
            parts.append("eq=contrast=1.08:brightness=0.02:saturation=1.05")
        elif style == "social":
            parts.append("eq=contrast=1.05:saturation=1.12:brightness=0.01")

        if options.get("deblur"):
            parts.append("unsharp=5:5:1.0:5:5:0.0")
        if options.get("face_enhance"):
            parts.append("unsharp=3:3:1.25:3:3:0.05")

        return ",".join(parts) if parts else "null"

    # ── Encode ───────────────────────────────────────────────

    def _run_ffmpeg(self, input_path: Path, output_path: Path, vf: str) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(input_path),
            "-vf", vf,
            "-map", "0:v:0", "-map", "0:a?",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            str(output_path),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0:
            err = (proc.stderr or proc.stdout or "").strip()
            logger.error("ffmpeg exit %s: %s", proc.returncode, err[:500])
            raise RuntimeError(f"ffmpeg failed: {err[:500]}")

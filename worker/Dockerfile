FROM python:3.11-slim AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System libs for OpenCV / PIL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 \
    wget curl git ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Layer 1: Heavy AI deps (torch / torchvision) ──────────────
# Cached as long as requirements-torch.txt doesn't change (~800 MB, slow).
# Copy ONLY this file first so app code changes don't bust this cache.
COPY requirements-torch.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements-torch.txt

# ── Layer 2: App dependencies (fast, ~200 MB) ─────────────────
# Only re-runs when requirements.txt changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

# ── Layer 3: App code (near-instant, changes every deploy) ────
COPY . .

RUN mkdir -p /app/models

# ── Layer 4: Pre-download AI model weights ─────────────────────
# Cached until requirements-torch.txt changes. Saves ~2min on first job.
# The weights URL mirrors what RealESRGANer downloads at runtime.
RUN python - <<'PY'
import urllib.request, pathlib, sys
models = [
    ("https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
     "/app/models/RealESRGAN_x4plus.pth"),
    ("https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
     "/app/models/RealESRGAN_x4plus_anime_6B.pth"),
    ("https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
     "/app/models/RealESRGAN_x2plus.pth"),
    ("https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth",
     "/app/models/realesr-general-x4v3.pth"),
    ("https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth",
     "/app/models/GFPGANv1.4.pth"),
]
for url, dst in models:
    p = pathlib.Path(dst)
    if not p.exists():
        print(f"Downloading {p.name} …", flush=True)
        urllib.request.urlretrieve(url, dst)
        print(f"  → {p.stat().st_size // 1_048_576} MB", flush=True)
PY

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

"""
Face enhancement using GFPGAN (GAN-based face restoration).

Used for:
  - Prime / Gentle models: subtle face enhancement after upscale
  - Old Photo model: face-focused restoration (sharper features). **Not** full-scene
    B&W→color: we do not run a dedicated colorization model (e.g. DeOldify / DDColor).

GFPGAN v1.4 is used — best balance of quality vs. artifacts.
"""
import logging
from pathlib import Path

import numpy as np
import torch
from PIL import Image

from app.config import get_settings

logger = logging.getLogger(__name__)

_restorer_cache: dict[str, object] = {}

_GFPGAN_MODEL_URL = (
    "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth"
)


def _load_restorer(model_path: str):
    if model_path in _restorer_cache:
        return _restorer_cache[model_path]

    from gfpgan import GFPGANer

    logger.info("Loading GFPGAN from %s …", model_path)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    restorer = GFPGANer(
        model_path=model_path,
        upscale=1,           # we handle upscaling separately
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=None,   # we pass already-upscaled images
        device=device,
    )
    _restorer_cache[model_path] = restorer
    return restorer


def enhance_faces(image: Image.Image, strength: float = 0.5) -> Image.Image:
    """
    Detect and enhance faces in a PIL RGB image.

    strength: 0.0 = original, 1.0 = full GFPGAN output.
    Blends original and restored result.
    """
    settings = get_settings()
    model_path = str(Path(settings.model_cache_dir) / "GFPGANv1.4.pth")

    # Auto-download if missing
    if not Path(model_path).exists():
        _download_model(_GFPGAN_MODEL_URL, model_path)

    restorer = _load_restorer(model_path)

    img_bgr = np.array(image.convert("RGB"))[:, :, ::-1]  # RGB → BGR for cv2-based GFPGAN

    _, _, restored_bgr_list = restorer.enhance(
        img_bgr,
        has_aligned=False,
        only_center_face=False,
        paste_back=True,
        weight=strength,
    )

    if not restored_bgr_list:
        logger.info("No faces detected — skipping face enhancement")
        return image

    restored_rgb = restored_bgr_list[0][:, :, ::-1]  # BGR → RGB
    result = Image.fromarray(restored_rgb.astype(np.uint8))

    logger.info("Face enhancement applied (strength=%.2f)", strength)
    return result


def restore_old_photo(image: Image.Image) -> Image.Image:
    """Full restoration pass for old/damaged photos — maximum strength."""
    return enhance_faces(image, strength=1.0)


def _download_model(url: str, dest: str) -> None:
    import httpx
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    logger.info("Downloading model weights: %s → %s", url, dest)
    with httpx.stream("GET", url, follow_redirects=True, timeout=120) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_bytes(chunk_size=8192):
                f.write(chunk)
    logger.info("Model downloaded: %s", dest)

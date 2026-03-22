"""
Light AI — adaptive color correction and lighting enhancement.

Pipeline (ordered, each step is lightweight):
  1. LAB color space white balance (grey world assumption)
  2. CLAHE (Contrast Limited Adaptive Histogram Equalization) on L channel
  3. Unsharp mask for subtle sharpening
  4. Optional: saturation boost via HSV

intensity: 0–100 maps to how aggressively each step is applied.
"""
import logging

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def enhance_light(image: Image.Image, intensity: int = 30) -> Image.Image:
    """
    Apply Light AI enhancement to a PIL RGB image.
    intensity 0 = no-op, 100 = maximum correction.
    """
    strength = intensity / 100.0

    img = np.array(image.convert("RGB"))
    img = _white_balance(img, strength)
    img = _clahe_enhance(img, strength)
    img = _unsharp_mask(img, strength)

    result = Image.fromarray(img)
    logger.info("Light AI applied (intensity=%d)", intensity)
    return result


def _white_balance(img: np.ndarray, strength: float) -> np.ndarray:
    """Grey-world white balance correction blended by strength."""
    result = img.astype(np.float32)
    mean = result.mean(axis=(0, 1))            # per-channel mean
    overall_mean = mean.mean()
    scale = overall_mean / (mean + 1e-6)       # per-channel scale factors
    balanced = result * scale
    balanced = np.clip(balanced, 0, 255)
    return (img * (1 - strength * 0.6) + balanced * (strength * 0.6)).astype(np.uint8)


def _clahe_enhance(img: np.ndarray, strength: float) -> np.ndarray:
    """CLAHE on L channel in LAB space — improves local contrast."""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clip_limit = 1.0 + strength * 3.0          # 1.0 … 4.0
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
    l_eq = clahe.apply(l)

    # Blend original and enhanced L
    l_blend = cv2.addWeighted(l, 1 - strength * 0.7, l_eq, strength * 0.7, 0)
    lab = cv2.merge([l_blend, a, b])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def _unsharp_mask(img: np.ndarray, strength: float) -> np.ndarray:
    """Subtle unsharp mask — radius=2, weight scaled by strength."""
    if strength < 0.1:
        return img
    blurred = cv2.GaussianBlur(img, (5, 5), 2.0)
    amount = strength * 0.4                    # keep it subtle
    sharpened = cv2.addWeighted(img, 1 + amount, blurred, -amount, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)

"""
Background Removal Pipeline using rembg.

Features:
  - Multiple AI models: u2net, isnet, birefnet, bria-rmbg, silueta
  - Alpha matting for high-quality edges (pymatting)
  - Post-processing mask (morphological smoothing)
  - Custom background color (RGBA)
  - Clip to object bounding box
  - Session caching for performance

Reference:
  - rembg/bg.py (remove, alpha_matting_cutout, post_process, etc.)
  - rembg/sessions/__init__.py (available models)
"""
from __future__ import annotations

import io
import logging
from enum import Enum
from typing import NamedTuple, Optional

import numpy as np
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)


# ── Enums ─────────────────────────────────────────────────────

class BgRemovalModel(str, Enum):
    """Available rembg models."""
    u2net = "u2net"
    u2netp = "u2netp"
    u2net_human_seg = "u2net_human_seg"
    isnet_general_use = "isnet-general-use"
    isnet_anime = "isnet-anime"
    birefnet_general = "birefnet-general"
    birefnet_general_lite = "birefnet-general-lite"
    birefnet_portrait = "birefnet-portrait"
    silueta = "silueta"
    bria_rmbg = "bria-rmbg"


class BgType(str, Enum):
    """Background removal type presets."""
    general = "general"
    car = "car"


# ── Result type ────────────────────────────────────────────────

class BgRemoverResult(NamedTuple):
    image: Image.Image
    model: str
    metadata: dict


# ── Pipeline ───────────────────────────────────────────────────

class BgRemoverPipeline:
    """
    Background removal pipeline using rembg.
    """

    def __init__(self):
        self._session_cache: dict[str, object] = {}

    # ── Public API ────────────────────────────────────────────

    def run(
        self,
        image: Image.Image,
        bg_type: BgType = BgType.general,
        model: Optional[BgRemovalModel] = None,
        alpha_matting: bool = False,
        alpha_matting_foreground_threshold: int = 240,
        alpha_matting_background_threshold: int = 10,
        alpha_matting_erode_size: int = 10,
        post_process_mask: bool = False,
        background_color: Optional[tuple[int, int, int, int]] = None,
        clip_to_object: bool = False,
    ) -> BgRemoverResult:
        """
        Remove background from image.

        Args:
            image: PIL Image (RGB or RGBA)
            bg_type: Preset type (general | car)
            model: Override model (auto-selected from bg_type if None)
            alpha_matting: Use pymatting for better edges (slower)
            alpha_matting_foreground_threshold: FG threshold for alpha matting
            alpha_matting_background_threshold: BG threshold for alpha matting
            alpha_matting_erode_size: Erosion size for alpha matting
            post_process_mask: Apply morphological smoothing to mask
            background_color: RGBA tuple for background, e.g. (255,255,255,255) for white
            clip_to_object: Crop to subject bounding box

        Returns:
            BgRemoverResult with RGBA image and metadata
        """
        # Resolve model
        if model is None:
            model = self._resolve_model(bg_type)

        model_name = model.value if isinstance(model, BgRemovalModel) else model
        session = self._get_session(model_name)

        # Fix EXIF orientation
        img = self._fix_image_orientation(image)

        # Convert to PNG bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        # Run rembg
        logger.info("Running rembg with model=%s, alpha_matting=%s", model_name, alpha_matting)

        from rembg import remove
        result_bytes = remove(
            buf.getvalue(),
            session=session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=alpha_matting_foreground_threshold,
            alpha_matting_background_threshold=alpha_matting_background_threshold,
            alpha_matting_erode_size=alpha_matting_erode_size,
            post_process_mask=post_process_mask,
        )

        result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

        # Post-process mask if requested
        if post_process_mask:
            r, g, b, alpha = result.split()
            mask_array = np.array(alpha)
            processed = self._post_process_mask(mask_array)
            result.putalpha(Image.fromarray(processed, mode="L"))

        # Clip to subject
        if clip_to_object:
            result = self._crop_to_subject(result)

        # Apply background color
        if background_color:
            result = self._apply_background_color(result, background_color)

        logger.info(
            "Background removed (%s) — output: %dx%d",
            model_name, result.width, result.height,
        )

        return BgRemoverResult(
            image=result,
            model=model_name,
            metadata={
                "model": model_name,
                "alpha_matting": alpha_matting,
                "post_process_mask": post_process_mask,
                "background_color": background_color,
                "clip_to_object": clip_to_object,
            },
        )

    def get_mask(
        self,
        image: Image.Image,
        bg_type: BgType = BgType.general,
        model: Optional[BgRemovalModel] = None,
        post_process_mask: bool = True,
    ) -> Image.Image:
        """
        Return only the alpha mask (grayscale).

        Args:
            image: PIL Image
            bg_type: Preset type
            model: Override model
            post_process_mask: Apply morphological smoothing

        Returns:
            Grayscale PIL Image (the mask)
        """
        if model is None:
            model = self._resolve_model(bg_type)

        model_name = model.value if isinstance(model, BgRemovalModel) else model
        session = self._get_session(model_name)

        img = self._fix_image_orientation(image)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        from rembg import remove
        mask_bytes = remove(
            buf.getvalue(),
            session=session,
            only_mask=True,
            post_process_mask=post_process_mask,
        )

        mask = Image.open(io.BytesIO(mask_bytes)).convert("L")
        logger.info("Mask extracted (%s) — size: %dx%d", model_name, mask.width, mask.height)
        return mask

    # ── Session management ────────────────────────────────────

    def _get_session(self, model_name: str):
        """Get or create a cached rembg session."""
        if model_name not in self._session_cache:
            from rembg import new_session
            logger.info("Loading rembg model: %s …", model_name)
            self._session_cache[model_name] = new_session(model_name)
            logger.info("Model %s loaded ✓", model_name)
        return self._session_cache[model_name]

    def _resolve_model(self, bg_type: BgType) -> BgRemovalModel:
        """Map BgType to best rembg model."""
        models = {
            BgType.general: BgRemovalModel.birefnet_general,
            BgType.car: BgRemovalModel.birefnet_general,
        }
        return models.get(bg_type, BgRemovalModel.birefnet_general)

    # ── Image processing (from rembg/bg.py) ──────────────────

    def _fix_image_orientation(self, img: Image.Image) -> Image.Image:
        """Fix image orientation based on EXIF data."""
        return ImageOps.exif_transpose(img)

    def _post_process_mask(self, mask: np.ndarray) -> np.ndarray:
        """
        Post-process mask with morphological opening + gaussian filter.
        Reference: rembg/bg.py post_process()
        """
        from scipy.ndimage import gaussian_filter
        from skimage.morphology import disk

        k = disk(1)
        if mask.max() > 1:
            mask = (mask > 127).astype(np.uint8) * 255

        mask = gaussian_filter(mask.astype(np.float64), sigma=2)
        return np.where(mask < 127, 0, 255).astype(np.uint8)

    def _apply_background_color(
        self,
        img: Image.Image,
        color: tuple[int, int, int, int],
    ) -> Image.Image:
        """Apply RGBA background color."""
        background = Image.new("RGBA", img.size, color)
        return Image.alpha_composite(background, img)

    def _crop_to_subject(self, rgba: Image.Image) -> Image.Image:
        """Crop transparent padding to subject bounding box."""
        r, g, b, alpha = rgba.split()
        bbox = alpha.getbbox()
        if bbox:
            return rgba.crop(bbox)
        return rgba

    # ── Utility ──────────────────────────────────────────────

    def list_models(self) -> list[str]:
        """Return list of available rembg model names."""
        try:
            from rembg.sessions import sessions_names
            return sessions_names
        except Exception:
            return [m.value for m in BgRemovalModel]

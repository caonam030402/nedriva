"""
Background removal using rembg (U2Net / ISNET models).

Models:
  - u2net         → general subjects (people, products, animals)
  - u2net_car_seg → vehicle photography
  - isnet-general-use → higher quality, slower
"""
import io
import logging

from PIL import Image

from app.schemas import BgType

logger = logging.getLogger(__name__)

_session_cache: dict[str, object] = {}


def _get_session(model_name: str):
    if model_name not in _session_cache:
        from rembg import new_session
        logger.info("Loading rembg model: %s …", model_name)
        _session_cache[model_name] = new_session(model_name)
    return _session_cache[model_name]


def _resolve_model(bg_type: BgType) -> str:
    return "u2net_car_seg" if bg_type == BgType.car else "isnet-general-use"


def remove_background(
    image: Image.Image,
    bg_type: BgType = BgType.general,
    clip_to_object: bool = False,
) -> Image.Image:
    """Remove background and return RGBA PIL Image."""
    from rembg import remove

    model_name = _resolve_model(bg_type)
    session = _get_session(model_name)

    # rembg works best with PNG bytes
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)

    result_bytes = remove(buf.getvalue(), session=session)
    result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

    if clip_to_object:
        result = _crop_to_subject(result)

    logger.info("Background removed (%s) — output: %dx%d RGBA", model_name, result.width, result.height)
    return result


def _crop_to_subject(rgba: Image.Image) -> Image.Image:
    """Crop transparent padding to the bounding box of the subject."""
    r, g, b, alpha = rgba.split()
    bbox = alpha.getbbox()
    if bbox:
        return rgba.crop(bbox)
    return rgba

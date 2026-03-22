"""
Compatibility shims for older AI libraries against newer torchvision/torch.

Import this module FIRST in main.py and worker.py before any AI library.
"""
import sys
import types


def _patch_torchvision_functional_tensor() -> None:
    """
    basicsr / realesrgan / gfpgan import from
    `torchvision.transforms.functional_tensor` which was removed in
    torchvision >= 0.17.  Re-export the needed symbols from the current
    public API so the libraries keep working.
    """
    if "torchvision.transforms.functional_tensor" in sys.modules:
        return  # already present (older torchvision), nothing to do

    try:
        import torchvision.transforms.functional as _F  # noqa: PLC0415

        mod = types.ModuleType("torchvision.transforms.functional_tensor")

        # Symbols referenced by basicsr / realesrgan / gfpgan
        for name in (
            "rgb_to_grayscale",
            "adjust_brightness",
            "adjust_contrast",
            "adjust_hue",
            "adjust_saturation",
            "normalize",
        ):
            if hasattr(_F, name):
                setattr(mod, name, getattr(_F, name))

        sys.modules["torchvision.transforms.functional_tensor"] = mod
    except Exception:
        pass  # torchvision not installed yet — skip silently


_patch_torchvision_functional_tensor()

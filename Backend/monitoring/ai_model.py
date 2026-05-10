import importlib
import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, Optional

import numpy as np
from PIL import Image


MODEL_PATH = Path(
    os.environ.get(
        "GROWTH_MODEL_PATH",
        Path(__file__).with_name("growth.pt")
    )
)


@lru_cache(maxsize=1)
def load_growth_model():
    """Load the trained growth model once and reuse it for future predictions."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Growth model file not found: {MODEL_PATH}")

    try:
        torch = importlib.import_module("torch")
    except ImportError as error:
        raise RuntimeError("PyTorch is not installed. Install backend requirements or provide a fallback model.") from error

    try:
        return torch.jit.load(str(MODEL_PATH), map_location="cpu")
    except Exception:
        return torch.load(str(MODEL_PATH), map_location="cpu")


def _coerce_leaf_prediction(value: object) -> int:
    """Convert various prediction formats to binary leaf presence (0 or 1)."""
    if isinstance(value, bool):
        return int(value)

    if isinstance(value, (int, float)):
        return 1 if float(value) >= 0.5 else 0

    if isinstance(value, dict):
        for key in ("leaf_prediction", "prediction", "result", "label"):
            if key in value:
                return _coerce_leaf_prediction(value[key])

    if isinstance(value, (list, tuple)) and value:
        return _coerce_leaf_prediction(value[0])

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "leaf", "present", "detected"}:
            return 1
        if normalized in {"0", "false", "absent", "missing", "none"}:
            return 0

    return 0


def _fallback_leaf_prediction(image_path: str) -> int:
    """Fallback leaf detection using vegetation ratio analysis."""
    image = Image.open(image_path).convert("RGB").resize((256, 256))
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    green = pixels[:, :, 1]
    red = pixels[:, :, 0]
    blue = pixels[:, :, 2]

    vegetation_mask = (green > red * 1.04) & (green > blue * 1.02) & ((green - red) > 0.03)
    leaf_ratio = float(np.count_nonzero(vegetation_mask)) / max(float(vegetation_mask.size), 1.0)
    return 1 if leaf_ratio >= 0.04 else 0


def _predict_from_growth_model(model, image_path: str) -> int:
    """Run prediction using the trained growth model."""
    try:
        torch = importlib.import_module("torch")
    except ImportError:
        return _fallback_leaf_prediction(image_path)

    image = Image.open(image_path).convert("RGB").resize((224, 224))
    array = np.asarray(image, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(array).permute(2, 0, 1).unsqueeze(0)

    with torch.no_grad():
        prediction = model(tensor)

    if isinstance(prediction, (list, tuple)) and prediction:
        prediction = prediction[0]

    if hasattr(prediction, "detach"):
        prediction = prediction.detach().cpu().numpy()

    return _coerce_leaf_prediction(prediction)


def predict_leaf_presence(image_path: str) -> int:
    """Predict leaf presence from an image using the growth model with fallback."""
    try:
        model = load_growth_model()
        return _predict_from_growth_model(model, image_path)
    except (FileNotFoundError, RuntimeError):
        return _fallback_leaf_prediction(image_path)
    except Exception:
        return _fallback_leaf_prediction(image_path)

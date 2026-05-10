import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
from PIL import Image


MODEL_PATH = Path(
    os.environ.get(
        "PREANALYSIS_MODEL_PATH",
        Path(__file__).with_name("loveda_unet_25epoch_best.keras")
    )
)

LAND_COVER_CLASSES = {
    0: "unknown",
    1: "building",
    2: "road",
    3: "water",
    4: "barren_open_land",
    5: "forest",
    6: "agriculture",
}

USABLE_CLASSES = {"agriculture", "barren_open_land"}
UNUSABLE_CLASSES = {"building", "road", "water", "forest"}


@lru_cache(maxsize=1)
def load_land_model():
    """Load Krishan's U-Net land-cover model once and reuse it."""
    try:
        from tensorflow.keras.models import load_model
    except ImportError as error:
        raise RuntimeError("TensorFlow is not installed. Install backend requirements first.") from error

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Pre-analysis model file not found: {MODEL_PATH}")

    return load_model(str(MODEL_PATH), compile=False)


def normalize_percentages(counts: Dict[str, int], total_pixels: int) -> Dict[str, float]:
    total = max(total_pixels, 1)
    return {
        class_name: round((counts.get(class_name, 0) / total) * 100, 2)
        for class_name in LAND_COVER_CLASSES.values()
    }


def analyze_land_image_with_color_fallback(image_path: str) -> Dict[str, object]:
    """Estimate land cover from satellite colors when TensorFlow is unavailable."""
    image = Image.open(image_path).convert("RGB").resize((512, 512))
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    red = pixels[:, :, 0]
    green = pixels[:, :, 1]
    blue = pixels[:, :, 2]

    brightness = (red + green + blue) / 3
    saturation = np.max(pixels, axis=2) - np.min(pixels, axis=2)

    vegetation = (green > red * 1.06) & (green > blue * 1.04) & (saturation > 0.08)
    forest = vegetation & (brightness < 0.34)
    agriculture = vegetation & ~forest
    water = (blue > red * 1.05) & (blue >= green * 0.95) & (brightness < 0.55)
    road_or_building = (saturation < 0.12) & (brightness > 0.32)
    barren_open_land = (
        (red >= green * 0.92)
        & (red > blue * 1.05)
        & (saturation >= 0.08)
        & (brightness > 0.25)
        & ~water
        & ~vegetation
    )

    classified = agriculture | forest | water | road_or_building | barren_open_land
    counts = {
        "agriculture": int(np.count_nonzero(agriculture)),
        "forest": int(np.count_nonzero(forest)),
        "water": int(np.count_nonzero(water)),
        "road": int(np.count_nonzero(road_or_building)),
        "building": 0,
        "barren_open_land": int(np.count_nonzero(barren_open_land)),
        "unknown": int(np.count_nonzero(~classified)),
    }
    percentages = normalize_percentages(counts, pixels.shape[0] * pixels.shape[1])

    usable_percentage = round(sum(percentages.get(name, 0.0) for name in USABLE_CLASSES), 2)
    unusable_percentage = round(sum(percentages.get(name, 0.0) for name in UNUSABLE_CLASSES), 2)
    unknown_percentage = round(percentages.get("unknown", 0.0), 2)

    return {
        "land_cover_percentages": percentages,
        "usable_farming_percentage": usable_percentage,
        "unusable_percentage": unusable_percentage,
        "unknown_percentage": unknown_percentage,
        "analysis_method": "color_fallback"
    }


def get_model_input_size(model) -> Tuple[int, int]:
    input_shape = model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    height = input_shape[1] if len(input_shape) > 2 else None
    width = input_shape[2] if len(input_shape) > 2 else None

    return int(height or 256), int(width or 256)


def preprocess_image(image_path: str, size: Tuple[int, int]) -> np.ndarray:
    image = Image.open(image_path).convert("RGB")
    image = image.resize((size[1], size[0]))
    array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(array, axis=0)


def get_segmentation_mask(prediction: np.ndarray) -> np.ndarray:
    output = prediction[0]
    if output.ndim == 3 and output.shape[-1] > 1:
        return np.argmax(output, axis=-1)

    if output.ndim == 3 and output.shape[-1] == 1:
        output = output[:, :, 0]

    return (output > 0.5).astype(np.uint8)


def calculate_land_cover_percentages(mask: np.ndarray) -> Dict[str, float]:
    total_pixels = max(mask.size, 1)
    percentages = {class_name: 0.0 for class_name in LAND_COVER_CLASSES.values()}

    class_ids, counts = np.unique(mask, return_counts=True)
    for class_id, count in zip(class_ids, counts):
        class_name = LAND_COVER_CLASSES.get(int(class_id), "unknown")
        percentages[class_name] = round((float(count) / total_pixels) * 100, 2)

    return percentages


def analyze_land_image(image_path: str) -> Dict[str, object]:
    try:
        model = load_land_model()
    except RuntimeError:
        return analyze_land_image_with_color_fallback(image_path)

    input_size = get_model_input_size(model)
    image_array = preprocess_image(image_path, input_size)
    prediction = model.predict(image_array, verbose=0)
    mask = get_segmentation_mask(prediction)
    percentages = calculate_land_cover_percentages(mask)

    usable_percentage = round(sum(percentages.get(name, 0.0) for name in USABLE_CLASSES), 2)
    unusable_percentage = round(sum(percentages.get(name, 0.0) for name in UNUSABLE_CLASSES), 2)
    unknown_percentage = round(percentages.get("unknown", 0.0), 2)

    return {
        "land_cover_percentages": percentages,
        "usable_farming_percentage": usable_percentage,
        "unusable_percentage": unusable_percentage,
        "unknown_percentage": unknown_percentage,
        "analysis_method": "unet_model"
    }

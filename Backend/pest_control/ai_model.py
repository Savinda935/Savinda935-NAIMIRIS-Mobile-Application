import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Tuple


MODEL_PATH = Path(
    os.environ.get(
        "PEST_CONTROL_MODEL_PATH",
        Path(__file__).with_name("best.pt")
    )
)

REAL_CLASS_NAMES = {
    0: "Healthy Leaf",
    1: "Thrips Damage",
    2: "Leaf Spot Disease",
    3: "Yellow Virus Disease"
}


@lru_cache(maxsize=1)
def load_yolo_model():
    """Load the trained YOLO model once and reuse it for future predictions."""
    try:
        from ultralytics import YOLO
    except ImportError as error:
        raise RuntimeError("Ultralytics is not installed. Install backend requirements first.") from error

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"YOLO model file not found: {MODEL_PATH}")

    return YOLO(str(MODEL_PATH))


def box_to_list(box) -> List[float]:
    return [round(float(value), 2) for value in box.xyxy[0]]


def calculate_box_area_ratio(bounding_box: List[float], image_shape: Tuple[int, int]) -> float:
    image_height, image_width = image_shape
    image_area = max(float(image_height * image_width), 1.0)
    x_min, y_min, x_max, y_max = bounding_box
    box_area = max(0.0, x_max - x_min) * max(0.0, y_max - y_min)
    return round(box_area / image_area, 4)


def predict_disease(image_path: str) -> Dict[str, object]:
    """Run YOLO prediction for one uploaded image and return disease detections."""
    model = load_yolo_model()
    results = model.predict(source=image_path, verbose=False)

    predictions: List[Dict[str, object]] = []
    total_affected_area_ratio = 0.0
    for result in results:
        names = result.names or {}
        image_shape = tuple(result.orig_shape[:2])
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue

        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            bounding_box = box_to_list(box)
            affected_area_ratio = calculate_box_area_ratio(bounding_box, image_shape)
            total_affected_area_ratio += affected_area_ratio
            disease_name = REAL_CLASS_NAMES.get(class_id, names.get(class_id, str(class_id)))
            predictions.append(
                {
                    "pest_name": disease_name,
                    "disease_name": disease_name,
                    "confidence": round(confidence, 4),
                    "class_id": class_id,
                    "bounding_box": bounding_box,
                    "affected_area_ratio": affected_area_ratio
                }
            )

    best_prediction = max(predictions, key=lambda item: item["confidence"], default=None)
    affected_area_ratio = round(min(total_affected_area_ratio, 1.0), 4)
    return {
        "pest_name": best_prediction["pest_name"] if best_prediction else "No pest detected",
        "disease_name": best_prediction["disease_name"] if best_prediction else "No disease detected",
        "confidence": best_prediction["confidence"] if best_prediction else 0.0,
        "affected_area_ratio": affected_area_ratio,
        "predictions": predictions
    }

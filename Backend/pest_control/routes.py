import tempfile
from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, File, HTTPException, UploadFile

from .ai_model import predict_disease
from .models import PestControlAnalysisRequest, PestControlAnalysisResponse, PestDiseasePredictionResponse, StageInfo
from .service import (
    analyze_growth_guidance,
    build_treatment_summary,
    estimate_severity,
    list_stages,
    recommend_treatment
)


router = APIRouter(prefix="/api/pest-control", tags=["pest-control"])


@router.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "module": "pest_control"}


@router.get("/stages", response_model=List[StageInfo])
def stages() -> List[StageInfo]:
    return list_stages()


@router.post("/analyze", response_model=PestControlAnalysisResponse)
def analyze(request: PestControlAnalysisRequest) -> PestControlAnalysisResponse:
    return analyze_growth_guidance(request)


@router.post("/predict-disease", response_model=PestDiseasePredictionResponse)
def predict_disease_from_image(image: UploadFile = File(...)) -> PestDiseasePredictionResponse:
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    suffix = Path(image.filename or "").suffix or ".jpg"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(image.file.read())

        prediction = predict_disease(temp_path)
        severity = estimate_severity(float(prediction["affected_area_ratio"]))
        treatment = recommend_treatment(str(prediction["pest_name"]), severity)
        return PestDiseasePredictionResponse(
            filename=image.filename,
            model="best.pt",
            pest_name=str(prediction["pest_name"]),
            disease_name=str(prediction["disease_name"]),
            confidence=float(prediction["confidence"]),
            severity=severity,
            affected_area_ratio=float(prediction["affected_area_ratio"]),
            treatment_recommendation=build_treatment_summary(str(prediction["pest_name"]), severity, treatment),
            treatment=treatment,
            predictions=prediction["predictions"]
        )
    except (FileNotFoundError, RuntimeError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    finally:
        image.file.close()
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)

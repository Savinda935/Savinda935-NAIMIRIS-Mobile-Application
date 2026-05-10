import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .ai_model import analyze_land_image
from .models import LandSuitabilityImageResponse, PreAnalysisRequest, PreAnalysisResponse
from .service import build_land_analysis_response, run_decision_support


router = APIRouter(prefix="/api/preanalysis", tags=["preanalysis"])


@router.post("/decision-support", response_model=PreAnalysisResponse)
def decision_support(request: PreAnalysisRequest) -> PreAnalysisResponse:
    return run_decision_support(request)


@router.post("/land-image/analyze", response_model=LandSuitabilityImageResponse)
def analyze_land_image_upload(
    land_size_perch: float = Form(..., gt=0),
    image: UploadFile = File(...)
) -> LandSuitabilityImageResponse:
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    suffix = Path(image.filename or "").suffix or ".jpg"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(image.file.read())

        image_analysis = analyze_land_image(temp_path)
        return build_land_analysis_response(image.filename or "land-image", land_size_perch, image_analysis)
    except (FileNotFoundError, RuntimeError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    finally:
        image.file.close()
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)

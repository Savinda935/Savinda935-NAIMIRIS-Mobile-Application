from typing import Dict, List

from fastapi import APIRouter

from .models import PestControlAnalysisRequest, PestControlAnalysisResponse, StageInfo
from .service import analyze_growth_guidance, list_stages


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

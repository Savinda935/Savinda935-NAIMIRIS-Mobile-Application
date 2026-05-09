from fastapi import APIRouter

from .models import PreAnalysisRequest, PreAnalysisResponse
from .service import run_decision_support


router = APIRouter(prefix="/api/preanalysis", tags=["preanalysis"])


@router.post("/decision-support", response_model=PreAnalysisResponse)
def decision_support(request: PreAnalysisRequest) -> PreAnalysisResponse:
    return run_decision_support(request)

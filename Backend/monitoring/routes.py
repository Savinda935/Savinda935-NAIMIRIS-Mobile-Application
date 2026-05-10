import time
from typing import Dict, List, Optional
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from .models import (
    AiAlertRequest,
    AiAlertResponse,
    AiAskRequest,
    AiAskResponse,
    GerminationAnalysisRequest,
    GerminationAnalysisResponse,
    Reading,
    StageDecisionRequest,
    StageDecisionResponse,
    StageEvaluationRequest,
    StageEvaluationResponse,
    SummaryStats
)
from .service import (
    STAGES,
    call_gemini_alerts,
    call_gemini_ask,
    compute_summary,
    analyze_germination_image,
    evaluate_germination_analysis,
    evaluate_stage_decision,
    evaluate_stage_logic,
    fetch_firebase_reading,
    fetch_readings,
    fetch_readings_chrono,
    fetch_firebase_history,
    generate_report,
    generate_firebase_report,
    ingest_firebase_reading,
    insert_reading
)

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "module": "monitoring"}


@router.post("/readings")
def store_reading(reading: Reading) -> Dict[str, float]:
    timestamp = insert_reading(reading)
    return {"stored_at": timestamp}


@router.post("/readings/firebase")
def store_firebase_reading() -> Dict[str, float]:
    timestamp = ingest_firebase_reading()
    return {"stored_at": timestamp}


@router.get("/readings/latest")
def latest_reading() -> Dict[str, Optional[float]]:
    rows = fetch_readings(limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="No readings stored yet")

    return rows[0]


@router.get("/readings")
def list_readings(limit: int = 100) -> List[Dict[str, Optional[float]]]:
    return fetch_readings(limit=limit)


@router.get("/analytics/summary", response_model=SummaryStats)
def summary(minutes: int = 30) -> SummaryStats:
    since = time.time() - minutes * 60
    rows = fetch_readings(limit=1000, since=since)
    return compute_summary(rows)


@router.get("/analytics/summary/firebase", response_model=SummaryStats)
def summary_firebase(limit: int = 500) -> SummaryStats:
    rows = fetch_firebase_history(limit=limit, chronological=False)
    if not rows:
        raise HTTPException(status_code=404, detail="No Firebase history data available")
    return compute_summary(rows)


@router.get("/analytics/history/firebase")
def history_firebase(limit: int = 200, chronological: bool = True) -> List[Dict[str, Optional[float]]]:
    rows = fetch_firebase_history(limit=limit, chronological=chronological)
    if not rows:
        raise HTTPException(status_code=404, detail="No Firebase history data available")
    return rows


@router.get("/stages")
def list_stages() -> List[Dict[str, object]]:
    return STAGES


@router.post("/analytics/stage/evaluate", response_model=StageEvaluationResponse)
def evaluate_stage(request: StageEvaluationRequest) -> StageEvaluationResponse:
    if request.reading is None:
        rows = fetch_readings(limit=1)
        if not rows:
            raise HTTPException(status_code=404, detail="No readings stored yet")
        reading = Reading(**rows[0])
    else:
        reading = request.reading

    return evaluate_stage_logic(request.stage_id, reading, request.flags)


@router.post("/analytics/stage/decision", response_model=StageDecisionResponse)
def stage_decision(request: StageDecisionRequest) -> StageDecisionResponse:
    if request.reading is None:
        rows = fetch_readings(limit=1)
        if not rows:
            raise HTTPException(status_code=404, detail="No readings stored yet")
        reading = Reading(**rows[0])
    else:
        reading = request.reading

    return evaluate_stage_decision(request.expected_stage, request.ai_stage, reading)


@router.post("/analytics/germination/evaluate", response_model=GerminationAnalysisResponse)
def germination_evaluation(request: GerminationAnalysisRequest) -> GerminationAnalysisResponse:
    return evaluate_germination_analysis(request)


@router.post("/analytics/germination/analyze", response_model=GerminationAnalysisResponse)
def germination_image_analysis(
    plant_age_days: int = Form(..., ge=1, le=21),
    image: UploadFile = File(...)
) -> GerminationAnalysisResponse:
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    suffix = Path(image.filename or "").suffix or ".jpg"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(image.file.read())

        return analyze_germination_image(plant_age_days, temp_path)
    except (FileNotFoundError, RuntimeError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    finally:
        image.file.close()
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


@router.post("/ai/alerts", response_model=AiAlertResponse)
def ai_alerts(request: AiAlertRequest) -> AiAlertResponse:
    return call_gemini_alerts(request)


@router.post("/ai/ask", response_model=AiAskResponse)
def ai_ask(request: AiAskRequest) -> AiAskResponse:
    return call_gemini_ask(request)


@router.get("/report/pdf")
def report(minutes: int = 60, limit: int = 500) -> StreamingResponse:
    return generate_report(minutes=minutes, limit=limit)


@router.get("/report/firebase/pdf")
def report_firebase(limit: int = 500) -> StreamingResponse:
    return generate_firebase_report(limit=limit)

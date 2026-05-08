from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Reading(BaseModel):
    timestamp: Optional[float] = Field(default=None, description="Unix timestamp in seconds")
    humidity: Optional[float] = None
    temperature_c: Optional[float] = None
    heat_index_c: Optional[float] = None
    soil_moisture: Optional[float] = None
    soil_analog: Optional[float] = None
    soil_temperature_c: Optional[float] = None
    ec: Optional[float] = None


class SummaryStats(BaseModel):
    avg: Dict[str, Optional[float]]
    min: Dict[str, Optional[float]]
    max: Dict[str, Optional[float]]
    trend: Dict[str, Optional[float]]
    count: int


class StageEvaluationRequest(BaseModel):
    stage_id: str
    flags: Dict[str, bool] = Field(default_factory=dict)
    reading: Optional[Reading] = None


class StageEvaluationResponse(BaseModel):
    stage: Dict[str, object]
    readings: Dict[str, Optional[float]]
    statuses: Dict[str, str]
    alerts: List[Dict[str, str]]


class StageDecisionRequest(BaseModel):
    expected_stage: Optional[str] = None
    ai_stage: Optional[str] = None
    reading: Optional[Reading] = None


class StageDecisionResponse(BaseModel):
    stage: Optional[str]
    status: str
    recommendation: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    moisture: Optional[float] = None
    ec: Optional[float] = None


class AiAlertRequest(BaseModel):
    stage_id: str
    readings: Dict[str, Optional[float]]
    statuses: Dict[str, str] = Field(default_factory=dict)
    history: List[Dict[str, Optional[float]]] = Field(default_factory=list)


class AiAlertResponse(BaseModel):
    risk_score: int
    anomaly_detected: bool
    summary: str
    recommendation: str
    anomalies: List[str] = Field(default_factory=list)


class AiAskRequest(BaseModel):
    question: str


class AiAskResponse(BaseModel):
    answer: str

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class PestControlAnalysisRequest(BaseModel):
    plant_age_days: int = Field(..., ge=0, description="Plant age in days")
    image_stage_prediction: Optional[str] = Field(
        default=None,
        description="Optional stage predicted from an uploaded plant/land image"
    )
    soil_moisture: float = Field(..., description="Soil moisture percentage")
    ec_level: float = Field(..., description="Electrical conductivity level")
    soil_temperature: float = Field(..., description="Soil temperature in Celsius")
    air_temperature: float = Field(..., description="Air temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity percentage")
    notes: Optional[str] = Field(default=None, description="Optional farmer observations")


class StageInfo(BaseModel):
    id: str
    label: str
    min_days: int
    max_days: Optional[int] = None


class EnvironmentalParameterStatus(BaseModel):
    value: float
    min: float
    max: float
    status: str


class PestControlAnalysisResponse(BaseModel):
    growth_status: str
    expected_stage: str
    detected_stage: str
    environmental_status: Dict[str, EnvironmentalParameterStatus]
    issues: List[str]
    recommendations: List[str]


class PestDetectionPrediction(BaseModel):
    pest_name: str
    disease_name: str
    confidence: float
    class_id: Optional[int] = None
    bounding_box: Optional[List[float]] = None
    affected_area_ratio: float = 0.0


class TreatmentRecommendation(BaseModel):
    pesticide_name: str
    dosage: str
    application_method: str
    safety_note: str


class PestDiseasePredictionResponse(BaseModel):
    filename: Optional[str] = None
    model: str
    pest_name: str
    disease_name: str
    confidence: float
    severity: str
    affected_area_ratio: float
    treatment_recommendation: str
    treatment: TreatmentRecommendation
    predictions: List[PestDetectionPrediction]

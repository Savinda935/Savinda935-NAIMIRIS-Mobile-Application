from typing import Dict, List

from pydantic import BaseModel, Field


class PreAnalysisRequest(BaseModel):
    land_image_analysis_result: str = Field(..., description="Image-analysis summary such as good, moderate, poor, rocky, or waterlogged")
    land_size: float = Field(..., gt=0, description="Cultivable land size in acres")
    soil_type: str = Field(..., description="Observed soil type, for example loam, sandy, clay, or laterite")
    water_availability: str = Field(..., description="Water access level such as high, medium, low, or none")
    flood_risk: str = Field(..., description="Flood risk level such as low, medium, or high")
    budget: float = Field(..., ge=0, description="Available budget in LKR")
    workers: int = Field(..., ge=0, description="Number of available workers")
    equipment: List[str] = Field(default_factory=list, description="Available equipment or resources")
    location: str = Field(..., description="Farm location or agro-climatic zone")


class PreAnalysisResponse(BaseModel):
    land_suitability_score: int
    recommended_farming_method: str
    plant_quantity: int
    seed_recommendation: str
    estimated_cost: float
    expected_yield: float
    expected_revenue: float
    roi: float
    final_farming_recommendations: List[str]


class LandSuitabilityImageResponse(BaseModel):
    filename: str
    land_size_perch: float
    suitability: str
    usable_farming_percentage: float
    usable_land_perch: float
    usable_land_sqft: float
    estimated_plant_count: int
    land_cover_percentages: Dict[str, float]
    message: str

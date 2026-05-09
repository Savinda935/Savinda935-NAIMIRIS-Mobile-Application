from typing import Dict, List, Optional

from .models import (
    EnvironmentalParameterStatus,
    PestControlAnalysisRequest,
    PestControlAnalysisResponse,
    StageInfo,
    TreatmentRecommendation
)


STAGES = [
    StageInfo(id="germination", label="Germination", min_days=0, max_days=21),
    StageInfo(id="seedling", label="Seedling", min_days=22, max_days=35),
    StageInfo(id="vegetative", label="Vegetative", min_days=36, max_days=70),
    StageInfo(id="flowering", label="Flowering", min_days=71, max_days=91),
    StageInfo(id="fruiting_ripening", label="Fruiting & Ripening", min_days=92, max_days=None),
]

THRESHOLDS = {
    "soil_moisture": {"min": 40.0, "max": 70.0, "label": "Soil moisture"},
    "ec_level": {"min": 1.5, "max": 3.5, "label": "EC level"},
    "soil_temperature": {"min": 20.0, "max": 30.0, "label": "Soil temperature"},
    "air_temperature": {"min": 24.0, "max": 32.0, "label": "Air temperature"},
    "humidity": {"min": 60.0, "max": 80.0, "label": "Humidity"},
}

STAGE_ALIASES = {
    "germination": "germination",
    "germination stage": "germination",
    "seedling": "seedling",
    "seedling stage": "seedling",
    "vegetative": "vegetative",
    "vegetative growth": "vegetative",
    "vegetative stage": "vegetative",
    "flowering": "flowering",
    "flowering stage": "flowering",
    "fruiting": "fruiting_ripening",
    "ripening": "fruiting_ripening",
    "fruiting_ripening": "fruiting_ripening",
    "fruiting ripening": "fruiting_ripening",
    "fruiting & ripening": "fruiting_ripening",
    "fruiting and ripening": "fruiting_ripening",
}

SEVERITY_THRESHOLDS = {
    "low": 0.10,
    "medium": 0.30,
}

TREATMENT_GUIDELINES = {
    "thrips": {
        "pesticide_name": "Spinosad",
        "dosages": {
            "low": "0.3 ml/L",
            "medium": "0.5 ml/L",
            "high": "0.7 ml/L"
        },
        "application_method": "Spray both upper and lower leaf surfaces in the evening."
    },
    "aphid": {
        "pesticide_name": "Neem oil or imidacloprid",
        "dosages": {
            "low": "Neem oil 2 ml/L",
            "medium": "Neem oil 3 ml/L",
            "high": "Use registered imidacloprid according to label guidance"
        },
        "application_method": "Target new shoots and leaf undersides where colonies appear."
    },
    "mite": {
        "pesticide_name": "Abamectin",
        "dosages": {
            "low": "0.3 ml/L",
            "medium": "0.5 ml/L",
            "high": "0.6 ml/L"
        },
        "application_method": "Spray leaf undersides and repeat only if infestation continues."
    },
    "whitefly": {
        "pesticide_name": "Neem oil or yellow sticky traps",
        "dosages": {
            "low": "Use yellow sticky traps and neem oil 2 ml/L",
            "medium": "Neem oil 3 ml/L",
            "high": "Use a registered whitefly pesticide according to label guidance"
        },
        "application_method": "Combine spraying with sticky traps and remove heavily infested leaves."
    },
    "leaf spot": {
        "pesticide_name": "Copper-based fungicide",
        "dosages": {
            "low": "1 g/L",
            "medium": "2 g/L",
            "high": "2.5 g/L"
        },
        "application_method": "Remove infected leaves and spray evenly during dry weather."
    },
    "default": {
        "pesticide_name": "Neem-based botanical spray",
        "dosages": {
            "low": "2 ml/L",
            "medium": "3 ml/L",
            "high": "4 ml/L"
        },
        "application_method": "Apply in the evening and monitor plant response before repeating."
    }
}


def list_stages() -> List[StageInfo]:
    return STAGES


def estimate_expected_stage(plant_age_days: int) -> str:
    for stage in STAGES:
        if stage.max_days is None and plant_age_days >= stage.min_days:
            return stage.id

        if stage.max_days is not None and stage.min_days <= plant_age_days <= stage.max_days:
            return stage.id

    return STAGES[0].id


def normalize_stage_prediction(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    key = value.strip().lower().replace("-", " ").replace("_", " ")
    return STAGE_ALIASES.get(key)


def classify_value(value: float, minimum: float, maximum: float) -> str:
    if value < minimum:
        return "low"

    if value > maximum:
        return "high"

    return "good"


def build_environmental_status(request: PestControlAnalysisRequest) -> Dict[str, EnvironmentalParameterStatus]:
    values = {
        "soil_moisture": request.soil_moisture,
        "ec_level": request.ec_level,
        "soil_temperature": request.soil_temperature,
        "air_temperature": request.air_temperature,
        "humidity": request.humidity,
    }

    statuses: Dict[str, EnvironmentalParameterStatus] = {}
    for key, value in values.items():
        threshold = THRESHOLDS[key]
        statuses[key] = EnvironmentalParameterStatus(
            value=value,
            min=threshold["min"],
            max=threshold["max"],
            status=classify_value(value, threshold["min"], threshold["max"])
        )

    return statuses


def append_environment_guidance(
    environmental_status: Dict[str, EnvironmentalParameterStatus],
    issues: List[str],
    recommendations: List[str]
) -> None:
    guidance = {
        "soil_moisture": {
            "low": "Increase irrigation or apply mulch to reduce water stress.",
            "high": "Improve drainage and reduce watering to protect roots."
        },
        "ec_level": {
            "low": "Apply a balanced fertilizer plan to improve nutrient availability.",
            "high": "Flush the growing media or reduce fertilizer concentration."
        },
        "soil_temperature": {
            "low": "Use mulching or protected conditions to keep the root zone warmer.",
            "high": "Add shade or mulch to cool the root zone."
        },
        "air_temperature": {
            "low": "Use protected cultivation or delay transplanting until warmer conditions.",
            "high": "Use shade-netting and improve ventilation to reduce heat stress."
        },
        "humidity": {
            "low": "Use mulching and careful irrigation to reduce dry-air stress.",
            "high": "Improve airflow and avoid leaf wetness to lower disease risk."
        },
    }

    for key, status in environmental_status.items():
        if status.status == "good":
            continue

        label = THRESHOLDS[key]["label"]
        issues.append(f"{label} is {status.status}.")
        recommendations.append(guidance[key][status.status])


def append_notes_guidance(notes: Optional[str], issues: List[str], recommendations: List[str]) -> None:
    if not notes:
        return

    normalized_notes = notes.strip().lower()
    if any(word in normalized_notes for word in ["yellow", "yellowing", "chlorosis"]):
        issues.append("Farmer notes mention yellowing leaves.")
        recommendations.append("Inspect nutrient balance and possible root stress before applying fertilizer.")

    if any(word in normalized_notes for word in ["wilt", "wilting", "droop"]):
        issues.append("Farmer notes mention wilting or drooping.")
        recommendations.append("Check irrigation, drainage, and root-zone temperature immediately.")

    if any(word in normalized_notes for word in ["pest", "insect", "thrips", "mites", "aphid"]):
        issues.append("Farmer notes mention possible pest pressure.")
        recommendations.append("Inspect leaf undersides and isolate affected plants before treatment.")


def decide_growth_status(stage_mismatch: bool, environment_issue_count: int, note_issue_count: int) -> str:
    total_issues = environment_issue_count + note_issue_count

    if total_issues >= 4:
        return "unhealthy"

    if stage_mismatch and total_issues >= 2:
        return "delayed"

    if stage_mismatch:
        return "slow"

    if total_issues >= 2:
        return "slow"

    return "normal"


def estimate_severity(affected_area_ratio: float) -> str:
    """Classify pest severity from the detected damaged-area ratio."""
    if affected_area_ratio <= 0:
        return "none"

    if affected_area_ratio < SEVERITY_THRESHOLDS["low"]:
        return "low"

    if affected_area_ratio < SEVERITY_THRESHOLDS["medium"]:
        return "medium"

    return "high"


def find_treatment_guideline(pest_name: str) -> Dict[str, object]:
    normalized_name = pest_name.strip().lower()
    for key, guideline in TREATMENT_GUIDELINES.items():
        if key != "default" and key in normalized_name:
            return guideline

    return TREATMENT_GUIDELINES["default"]


def recommend_treatment(pest_name: str, severity: str) -> TreatmentRecommendation:
    if severity == "none":
        return TreatmentRecommendation(
            pesticide_name="No pesticide required",
            dosage="0",
            application_method="Continue observation and upload another image if symptoms appear.",
            safety_note="Avoid unnecessary spraying when no pest or disease is detected."
        )

    guideline = find_treatment_guideline(pest_name)
    dosage = guideline["dosages"].get(severity, guideline["dosages"]["low"])
    return TreatmentRecommendation(
        pesticide_name=guideline["pesticide_name"],
        dosage=dosage,
        application_method=guideline["application_method"],
        safety_note="Wear gloves and a mask, follow the product label, and avoid spraying near harvest."
    )


def build_treatment_summary(pest_name: str, severity: str, treatment: TreatmentRecommendation) -> str:
    if severity == "none":
        return "No pest or disease was detected. Continue routine monitoring."

    return (
        f"{severity.title()} severity detected for {pest_name}. "
        f"Recommended treatment: {treatment.pesticide_name} at {treatment.dosage}. "
        f"{treatment.application_method}"
    )


def analyze_growth_guidance(request: PestControlAnalysisRequest) -> PestControlAnalysisResponse:
    expected_stage = estimate_expected_stage(request.plant_age_days)
    normalized_prediction = normalize_stage_prediction(request.image_stage_prediction)
    detected_stage = normalized_prediction or expected_stage

    environmental_status = build_environmental_status(request)
    issues: List[str] = []
    recommendations: List[str] = []

    if request.image_stage_prediction and normalized_prediction is None:
        issues.append("Image stage prediction could not be matched to a supported stage.")
        recommendations.append("Use one of the supported stages or review the image-stage classifier output.")

    stage_mismatch = normalized_prediction is not None and normalized_prediction != expected_stage
    if stage_mismatch:
        issues.append("Detected stage does not match the expected stage for plant age.")
        recommendations.append("Review crop development and compare with field observations before changing inputs.")

    issue_count_before_environment = len(issues)
    append_environment_guidance(environmental_status, issues, recommendations)
    environment_issue_count = len(issues) - issue_count_before_environment

    issue_count_before_notes = len(issues)
    append_notes_guidance(request.notes, issues, recommendations)
    note_issue_count = len(issues) - issue_count_before_notes

    if not issues:
        recommendations.append("Conditions are within the recommended range. Continue routine monitoring.")

    growth_status = decide_growth_status(stage_mismatch, environment_issue_count, note_issue_count)

    return PestControlAnalysisResponse(
        growth_status=growth_status,
        expected_stage=expected_stage,
        detected_stage=detected_stage,
        environmental_status=environmental_status,
        issues=issues,
        recommendations=recommendations
    )

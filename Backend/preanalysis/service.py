from typing import List

from .models import LandSuitabilityImageResponse, PreAnalysisRequest, PreAnalysisResponse


BASE_PLANTS_PER_ACRE = 7000
BASE_COST_PER_ACRE = 180000
BASE_YIELD_KG_PER_ACRE = 850
MARKET_PRICE_PER_KG = 650
PERCH_TO_SQFT = 272.25
NAI_MIRIS_PLANT_SPACING_SQFT = 9
PRACTICAL_FIELD_FACTOR = 0.75


def normalize_text(value: str) -> str:
    return value.strip().lower()


def classify_land_suitability(usable_percentage: float, unknown_percentage: float) -> str:
    if unknown_percentage > 50:
        return "Need clearer image"

    if usable_percentage >= 50:
        return "Good for farming"

    return "Not good for farming"


def estimate_pp1_plant_count(land_size_perch: float, usable_percentage: float, suitability: str) -> int:
    if suitability != "Good for farming":
        return 0

    usable_land_perch = land_size_perch * (usable_percentage / 100)
    usable_sqft = usable_land_perch * PERCH_TO_SQFT
    raw_plant_count = usable_sqft / NAI_MIRIS_PLANT_SPACING_SQFT
    return round(raw_plant_count * PRACTICAL_FIELD_FACTOR)


def build_land_analysis_response(
    filename: str,
    land_size_perch: float,
    image_analysis: dict
) -> LandSuitabilityImageResponse:
    usable_percentage = float(image_analysis["usable_farming_percentage"])
    unknown_percentage = float(image_analysis["unknown_percentage"])
    suitability = classify_land_suitability(usable_percentage, unknown_percentage)
    usable_land_perch = round(land_size_perch * (usable_percentage / 100), 2)
    usable_land_sqft = round(usable_land_perch * PERCH_TO_SQFT, 2)
    estimated_plant_count = estimate_pp1_plant_count(land_size_perch, usable_percentage, suitability)

    if suitability == "Need clearer image":
        message = "More than 50% of the image is unknown. Upload a clearer satellite or top-view land image."
    elif suitability == "Good for farming":
        message = "Land is suitable for farming based on usable agriculture and barren/open land area."
    else:
        message = "Land is not suitable for farming because usable farming area is below 50%."

    return LandSuitabilityImageResponse(
        filename=filename,
        land_size_perch=land_size_perch,
        suitability=suitability,
        usable_farming_percentage=usable_percentage,
        usable_land_perch=usable_land_perch,
        usable_land_sqft=usable_land_sqft,
        estimated_plant_count=estimated_plant_count,
        land_cover_percentages=image_analysis["land_cover_percentages"],
        message=message
    )


def calculate_land_suitability_score(request: PreAnalysisRequest) -> int:
    score = 50

    # Image analysis acts as the first field observation signal from the land photo.
    image_result = normalize_text(request.land_image_analysis_result)
    if any(word in image_result for word in ["good", "healthy", "suitable", "fertile"]):
        score += 15
    elif any(word in image_result for word in ["moderate", "average", "mixed"]):
        score += 5
    elif any(word in image_result for word in ["poor", "rocky", "eroded", "waterlogged"]):
        score -= 15

    # Loam and sandy-loam soils support chilli root growth better than heavy clay.
    soil_type = normalize_text(request.soil_type)
    if soil_type in ["loam", "sandy loam", "silt loam"]:
        score += 15
    elif soil_type in ["sandy", "laterite"]:
        score += 5
    elif soil_type in ["clay", "heavy clay", "saline"]:
        score -= 10

    # Reliable water access increases suitability, especially during dry periods.
    water_availability = normalize_text(request.water_availability)
    if water_availability in ["high", "good", "available", "irrigated"]:
        score += 15
    elif water_availability in ["medium", "moderate", "seasonal"]:
        score += 5
    elif water_availability in ["low", "none", "poor"]:
        score -= 15

    # Flood-prone land is risky for Nai Miris because excess water damages roots.
    flood_risk = normalize_text(request.flood_risk)
    if flood_risk == "low":
        score += 10
    elif flood_risk == "medium":
        score -= 5
    elif flood_risk == "high":
        score -= 20

    # Worker availability improves practical readiness for planting and maintenance.
    worker_need = max(1, round(request.land_size * 2))
    if request.workers >= worker_need:
        score += 5
    elif request.workers == 0:
        score -= 10

    return max(0, min(100, score))


def recommend_farming_method(request: PreAnalysisRequest, suitability_score: int) -> str:
    flood_risk = normalize_text(request.flood_risk)
    water_availability = normalize_text(request.water_availability)
    equipment = [normalize_text(item) for item in request.equipment]

    # High flood risk requires raised beds or protected structures before planting.
    if flood_risk == "high":
        return "Raised-bed farming with drainage improvements"

    # Drip irrigation is preferred when equipment and budget can support it.
    if "drip" in equipment or "drip irrigation" in equipment:
        return "Open-field cultivation with drip irrigation"

    # Limited water requires conservation-focused cultivation.
    if water_availability in ["low", "none", "poor"]:
        return "Mulched open-field cultivation with scheduled irrigation"

    if suitability_score >= 80:
        return "Open-field intensive cultivation"

    return "Open-field cultivation with soil improvement"


def estimate_plant_quantity(land_size: float, farming_method: str) -> int:
    # Plant count is based on a simple acre-to-spacing assumption for Scotch Bonnet.
    method_factor = 0.9 if "Raised-bed" in farming_method else 1.0
    return round(BASE_PLANTS_PER_ACRE * land_size * method_factor)


def recommend_seed(request: PreAnalysisRequest, suitability_score: int) -> str:
    flood_risk = normalize_text(request.flood_risk)
    water_availability = normalize_text(request.water_availability)

    # Seed advice changes with land risk and available water.
    if flood_risk == "high":
        return "Disease-tolerant Scotch Bonnet/Nai Miris seeds suitable for raised beds"
    if water_availability in ["low", "none", "poor"]:
        return "Drought-tolerant Scotch Bonnet/Nai Miris seeds"
    if suitability_score >= 80:
        return "High-yield Scotch Bonnet/Nai Miris hybrid seeds"
    return "Certified Scotch Bonnet/Nai Miris seeds from a reliable supplier"


def estimate_cost(request: PreAnalysisRequest, farming_method: str, plant_quantity: int) -> float:
    equipment = [normalize_text(item) for item in request.equipment]

    # Base cost covers land preparation, seedlings, fertilizer, and normal field work.
    cost = BASE_COST_PER_ACRE * request.land_size

    # Seedling cost scales with the number of plants planned.
    cost += plant_quantity * 12

    # Labor support cost is included when available workers are below expected need.
    required_workers = max(1, round(request.land_size * 2))
    worker_shortage = max(0, required_workers - request.workers)
    cost += worker_shortage * 25000

    # Irrigation/protection additions are estimated from the selected farming method.
    if "drip" in farming_method.lower() and "drip" not in equipment and "drip irrigation" not in equipment:
        cost += 45000 * request.land_size
    if "raised-bed" in farming_method.lower():
        cost += 35000 * request.land_size

    # Contingency keeps the estimate realistic for transport and unexpected inputs.
    cost *= 1.1
    return round(cost, 2)


def estimate_expected_yield(request: PreAnalysisRequest, suitability_score: int, farming_method: str) -> float:
    # Yield starts from a baseline and is adjusted by suitability and method quality.
    suitability_factor = 0.6 + (suitability_score / 100) * 0.5
    method_factor = 1.1 if "drip" in farming_method.lower() or "intensive" in farming_method.lower() else 1.0
    flood_penalty = 0.85 if normalize_text(request.flood_risk) == "high" else 1.0
    expected_yield = BASE_YIELD_KG_PER_ACRE * request.land_size * suitability_factor * method_factor * flood_penalty
    return round(expected_yield, 2)


def calculate_roi(expected_revenue: float, estimated_cost: float) -> float:
    # ROI is returned as a percentage of profit over estimated cultivation cost.
    if estimated_cost <= 0:
        return 0.0
    return round(((expected_revenue - estimated_cost) / estimated_cost) * 100, 2)


def build_final_recommendations(
    request: PreAnalysisRequest,
    suitability_score: int,
    estimated_cost: float,
    farming_method: str
) -> List[str]:
    recommendations = [
        f"Use {farming_method.lower()} for the current land conditions.",
        "Prepare soil with organic matter before transplanting seedlings."
    ]

    # Budget guidance compares the rule-based cost estimate with the farmer's budget.
    if request.budget < estimated_cost:
        recommendations.append("Increase the budget or reduce cultivated area before starting.")
    else:
        recommendations.append("The available budget can support the estimated cultivation plan.")

    if normalize_text(request.flood_risk) in ["medium", "high"]:
        recommendations.append("Improve drainage and avoid planting in low-lying waterlogged sections.")

    if normalize_text(request.water_availability) in ["low", "none", "poor"]:
        recommendations.append("Prioritize mulching and scheduled irrigation to reduce water stress.")

    if suitability_score < 60:
        recommendations.append("Treat this land as moderate risk and improve soil/water conditions first.")
    elif suitability_score >= 80:
        recommendations.append("Land is strongly suitable for Nai Miris cultivation with good management.")

    return recommendations


def run_decision_support(request: PreAnalysisRequest) -> PreAnalysisResponse:
    suitability_score = calculate_land_suitability_score(request)
    farming_method = recommend_farming_method(request, suitability_score)
    plant_quantity = estimate_plant_quantity(request.land_size, farming_method)
    seed_recommendation = recommend_seed(request, suitability_score)
    estimated_cost = estimate_cost(request, farming_method, plant_quantity)
    expected_yield = estimate_expected_yield(request, suitability_score, farming_method)
    expected_revenue = round(expected_yield * MARKET_PRICE_PER_KG, 2)
    roi = calculate_roi(expected_revenue, estimated_cost)
    recommendations = build_final_recommendations(request, suitability_score, estimated_cost, farming_method)

    return PreAnalysisResponse(
        land_suitability_score=suitability_score,
        recommended_farming_method=farming_method,
        plant_quantity=plant_quantity,
        seed_recommendation=seed_recommendation,
        estimated_cost=estimated_cost,
        expected_yield=expected_yield,
        expected_revenue=expected_revenue,
        roi=roi,
        final_farming_recommendations=recommendations
    )

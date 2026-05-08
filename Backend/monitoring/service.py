import asyncio
import io
import json
import os
import sqlite3
import time
from datetime import datetime
from typing import Dict, List, Optional

import httpx
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from .models import (
    AiAlertRequest,
    AiAlertResponse,
    AiAskRequest,
    AiAskResponse,
    Reading,
    StageDecisionResponse,
    StageEvaluationResponse,
    SummaryStats
)

DB_PATH = os.environ.get("IOT_DB_PATH", "iot_readings.db")
FIREBASE_URL = os.environ.get(
    "FIREBASE_URL",
    "https://sensorsdata-dd238-default-rtdb.asia-southeast1.firebasedatabase.app"
)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-pro")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
FIREBASE_POLL_SECONDS = float(os.environ.get("FIREBASE_POLL_SECONDS", "30"))

_poller_task: Optional[asyncio.Task] = None

STAGES = [
    {
        "id": "stage1",
        "title": "Germination",
        "duration": "7-21 days",
        "dry_threshold": 1000,
        "thresholds": {
            "soil_moisture": {"min": 1000, "max": 2000, "unit": "analog"},
            "soil_temp": {"min": 25, "max": 30, "unit": "C"},
            "air_humidity": {"min": 70, "max": 85, "unit": "%"},
            "air_temp": {"min": 25, "max": 30, "unit": "C"},
            "ec": {"min": 0.5, "max": 1.2, "unit": "mS/cm"}
        },
        "flags": ["slow_growth"]
    },
    {
        "id": "stage2",
        "title": "Seedling",
        "duration": "2-4 weeks",
        "dry_threshold": 1000,
        "thresholds": {
            "soil_moisture": {"min": 1200, "max": 2200, "unit": "analog"},
            "soil_temp": {"min": 22, "max": 28, "unit": "C"},
            "air_humidity": {"min": 60, "max": 75, "unit": "%"},
            "air_temp": {"min": 22, "max": 28, "unit": "C"},
            "ec": {"min": 0.8, "max": 1.5, "unit": "mS/cm"}
        },
        "flags": ["slow_growth"]
    },
    {
        "id": "stage3",
        "title": "Vegetative",
        "duration": "4-8 weeks",
        "dry_threshold": 1000,
        "thresholds": {
            "soil_moisture": {"min": 1500, "max": 2500, "unit": "analog"},
            "soil_temp": {"min": 20, "max": 28, "unit": "C"},
            "air_humidity": {"min": 50, "max": 70, "unit": "%"},
            "air_temp": {"min": 24, "max": 30, "unit": "C"},
            "ec": {"min": 1.5, "max": 2.5, "unit": "mS/cm"}
        },
        "flags": ["slow_growth"]
    },
    {
        "id": "stage4",
        "title": "Flowering",
        "duration": "2-3 weeks",
        "dry_threshold": 1000,
        "thresholds": {
            "soil_moisture": {"min": 1200, "max": 2000, "unit": "analog"},
            "soil_temp": {"min": 20, "max": 26, "unit": "C"},
            "air_humidity": {"min": 50, "max": 65, "unit": "%"},
            "air_temp": {"min": 21, "max": 29, "unit": "C"},
            "ec": {"min": 1.5, "max": 2.2, "unit": "mS/cm"}
        },
        "flags": ["no_flower_development", "no_fruit_set"]
    },
    {
        "id": "stage5",
        "title": "Fruiting & Ripening",
        "duration": "3-6 weeks",
        "dry_threshold": 1000,
        "thresholds": {
            "soil_moisture": {"min": 1500, "max": 2500, "unit": "analog"},
            "soil_temp": {"min": 20, "max": 26, "unit": "C"},
            "air_humidity": {"min": 45, "max": 65, "unit": "%"},
            "air_temp": {"min": 24, "max": 30, "unit": "C"},
            "ec": {"min": 1.2, "max": 2.0, "unit": "mS/cm"}
        },
        "flags": ["slow_ripening"]
    }
]

STAGE_LABELS = {
    "stage1": "Germination",
    "stage2": "Seedling",
    "stage3": "Vegetative Growth",
    "stage4": "Flowering",
    "stage5": "Fruiting & Ripening"
}

STAGE_LABEL_ALIASES = {
    "stage1": "stage1",
    "germination": "stage1",
    "germination stage": "stage1",
    "stage2": "stage2",
    "seedling": "stage2",
    "seedling stage": "stage2",
    "stage3": "stage3",
    "vegetative": "stage3",
    "vegetative growth": "stage3",
    "vegetative growth stage": "stage3",
    "stage4": "stage4",
    "flowering": "stage4",
    "flowering stage": "stage4",
    "stage5": "stage5",
    "fruiting": "stage5",
    "ripening": "stage5",
    "fruiting & ripening": "stage5",
    "fruiting and ripening": "stage5",
    "fruiting stage": "stage5"
}


def get_stage(stage_id: str) -> Dict[str, object]:
    return next((stage for stage in STAGES if stage["id"] == stage_id), STAGES[0])


def normalize_stage_key(stage: Optional[str]) -> Optional[str]:
    if not stage:
        return None

    key = stage.strip().lower()
    return STAGE_LABEL_ALIASES.get(key)


def is_number(value: Optional[float]) -> bool:
    return isinstance(value, (int, float)) and value is not None


def range_status(value: Optional[float], range_def: Dict[str, float]) -> str:
    if not is_number(value):
        return "unknown"

    if value < range_def["min"]:
        return "low"

    if value > range_def["max"]:
        return "high"

    return "ok"


def normalize_reading(reading: Optional[Reading]) -> Dict[str, Optional[float]]:
    if not reading:
        return {
            "soil_analog": None,
            "soil_moisture": None,
            "soil_temp": None,
            "air_temp": None,
            "air_humidity": None,
            "ec": None
        }

    return {
        "soil_analog": reading.soil_analog,
        "soil_moisture": reading.soil_moisture,
        "soil_temp": reading.soil_temperature_c,
        "air_temp": reading.temperature_c,
        "air_humidity": reading.humidity,
        "ec": reading.ec
    }


def select_moisture(readings: Dict[str, Optional[float]]) -> Optional[float]:
    if is_number(readings.get("soil_moisture")):
        return readings["soil_moisture"]

    if is_number(readings.get("soil_analog")):
        return readings["soil_analog"]

    return None


def evaluate_stage_decision(
    expected_stage: Optional[str],
    ai_stage: Optional[str],
    reading: Optional[Reading]
) -> StageDecisionResponse:
    readings = normalize_reading(reading)
    moisture = select_moisture(readings)
    temp = readings.get("air_temp")
    humidity = readings.get("air_humidity")
    ec = readings.get("ec")

    expected_key = normalize_stage_key(expected_stage)
    ai_key = normalize_stage_key(ai_stage)
    stage_key = expected_key or ai_key
    stage_label = STAGE_LABELS.get(stage_key) if stage_key else None

    if stage_key is None:
        return StageDecisionResponse(
            stage=None,
            status="Stage Unknown",
            recommendation="Provide expected stage or AI stage to evaluate.",
            temperature=temp,
            humidity=humidity,
            moisture=moisture,
            ec=ec
        )

    status = "Growth Delay"
    recommendation = None

    def has_values(*values: Optional[float]) -> bool:
        return all(is_number(value) for value in values)

    if stage_key == "stage1":
        if not has_values(moisture, temp, humidity):
            status = "Insufficient Data"
            recommendation = "Check soil moisture, temperature, and humidity sensors."
        elif moisture >= 70 and moisture <= 85 and temp >= 25 and temp <= 30 and humidity >= 70:
            status = "Healthy Germination"
        elif moisture < 70:
            status = "Dry Soil"
            recommendation = "Increase irrigation."
        elif temp < 25:
            status = "Low Temperature"
            recommendation = "Maintain warmer environment."
        else:
            status = "Growth Delay"

    elif stage_key == "stage2":
        if not has_values(moisture, temp, humidity):
            status = "Insufficient Data"
            recommendation = "Check soil moisture, temperature, and humidity sensors."
        elif moisture >= 65 and moisture <= 75 and temp >= 24 and temp <= 30:
            status = "Healthy Seedling"
        elif humidity < 65:
            status = "Low Humidity"
            recommendation = "Increase humidity level."
        elif moisture < 65:
            status = "Water Deficiency"
            recommendation = "Apply water carefully."
        else:
            status = "Weak Seedling Growth"

    elif stage_key == "stage3":
        if not has_values(moisture, temp, ec):
            status = "Insufficient Data"
            recommendation = "Check soil moisture, temperature, and EC sensors."
        elif moisture >= 60 and moisture <= 70 and ec >= 1.5 and temp >= 24 and temp <= 32:
            status = "Healthy Vegetative Growth"
        elif ec < 1.5:
            status = "Low Nutrient Level"
            recommendation = "Apply nitrogen fertilizer."
        elif moisture < 60:
            status = "Low Moisture"
            recommendation = "Increase irrigation."
        else:
            status = "Slow Vegetative Growth"

    elif stage_key == "stage4":
        if not has_values(temp, humidity):
            status = "Insufficient Data"
            recommendation = "Check temperature and humidity sensors."
        elif temp >= 22 and temp <= 28 and humidity >= 60 and humidity <= 70:
            status = "Healthy Flowering"
        elif temp > 30:
            status = "Flower Drop Risk"
            recommendation = "Reduce heat stress."
        elif humidity < 60:
            status = "Dry Environment"
            recommendation = "Increase humidity."
        else:
            status = "Poor Flower Development"

    elif stage_key == "stage5":
        if not has_values(moisture, temp, ec):
            status = "Insufficient Data"
            recommendation = "Check soil moisture, temperature, and EC sensors."
        elif moisture >= 50 and moisture <= 65 and ec >= 2.0 and temp >= 20 and temp <= 30:
            status = "Healthy Fruiting"
        elif ec < 2.0:
            status = "Low Nutrient Supply"
            recommendation = "Apply potassium fertilizer."
        elif moisture > 70:
            status = "Overwatering Risk"
            recommendation = "Reduce irrigation."
        else:
            status = "Poor Fruit Development"

    if expected_key and ai_key and expected_key != ai_key:
        status = "Growth Delay Detected"
        recommendation = "AI stage does not match expected stage. Review crop development."

    return StageDecisionResponse(
        stage=stage_label,
        status=status,
        recommendation=recommendation,
        temperature=temp,
        humidity=humidity,
        moisture=moisture,
        ec=ec
    )


def evaluate_stage_logic(stage_id: str, reading: Optional[Reading], flags: Dict[str, bool]) -> StageEvaluationResponse:
    stage = get_stage(stage_id)
    readings = normalize_reading(reading)
    thresholds = stage["thresholds"]

    statuses = {
        "soil_moisture": range_status(readings["soil_analog"], thresholds["soil_moisture"]),
        "soil_temp": range_status(readings["soil_temp"], thresholds["soil_temp"]),
        "air_humidity": range_status(readings["air_humidity"], thresholds["air_humidity"]),
        "air_temp": range_status(readings["air_temp"], thresholds["air_temp"]),
        "ec": range_status(readings["ec"], thresholds["ec"])
    }

    alerts: List[Dict[str, str]] = []

    def push_alert(level: str, title: str, detail: str) -> None:
        alerts.append({"level": level, "title": title, "detail": detail})

    if is_number(readings["soil_analog"]) and readings["soil_analog"] < stage["dry_threshold"]:
        push_alert("alert", "Irrigation Required", "Soil moisture is below the dry-out threshold.")

    if stage["id"] == "stage1":
        if flags.get("slow_growth") and is_number(readings["soil_temp"]) and readings["soil_temp"] > 32:
            push_alert("warning", "Root Stress Warning", "Slow germination with high soil temperature.")
        if is_number(readings["air_humidity"]) and is_number(readings["air_temp"]) and readings["air_humidity"] > 90 and readings["air_temp"] > 30:
            push_alert("alert", "Disease Risk Alert", "High humidity and temperature increase damping-off risk.")

    if stage["id"] == "stage2":
        if flags.get("slow_growth") and is_number(readings["ec"]) and readings["ec"] < 0.8:
            push_alert("warning", "Fertiliser Needed", "Slow growth with low EC.")
        if is_number(readings["air_humidity"]) and is_number(readings["air_temp"]) and readings["air_humidity"] > 80 and readings["air_temp"] > 28:
            push_alert("alert", "Disease Risk Alert", "Humidity and temperature favor damping-off disease.")

    if stage["id"] == "stage3":
        if flags.get("slow_growth") and is_number(readings["soil_temp"]) and readings["soil_temp"] > 30:
            push_alert("warning", "Root Stress Warning", "Slow growth with high soil temperature.")
        if flags.get("slow_growth") and is_number(readings["ec"]) and readings["ec"] < 1.5:
            push_alert("warning", "Fertiliser Needed", "Slow growth with low EC.")
        if is_number(readings["air_humidity"]) and is_number(readings["air_temp"]) and readings["air_humidity"] > 80 and readings["air_temp"] > 30:
            push_alert("alert", "Disease Risk Alert", "High humidity and heat promote fungal disease.")

    if stage["id"] == "stage4":
        if flags.get("no_fruit_set") and is_number(readings["soil_temp"]) and readings["soil_temp"] > 28:
            push_alert("warning", "Root Stress Warning", "No fruit set with warm roots.")
        if flags.get("no_flower_development") and is_number(readings["ec"]) and readings["ec"] < 1.2:
            push_alert("warning", "Fertiliser Needed", "Low EC may delay flowering.")
        if is_number(readings["air_humidity"]) and is_number(readings["air_temp"]) and readings["air_humidity"] > 70 and readings["air_temp"] > 30:
            push_alert("alert", "Disease Risk Alert", "High humidity and temperature reduce pollination.")

    if stage["id"] == "stage5":
        if flags.get("slow_ripening") and is_number(readings["soil_temp"]) and readings["soil_temp"] > 28:
            push_alert("warning", "Root Stress Warning", "Slow ripening with warm roots.")
        if flags.get("slow_ripening") and is_number(readings["ec"]) and readings["ec"] < 1.0:
            push_alert("warning", "Fertiliser Needed", "Low EC may slow ripening.")
        if is_number(readings["air_humidity"]) and is_number(readings["air_temp"]) and readings["air_humidity"] > 75 and readings["air_temp"] > 30:
            push_alert("alert", "Disease Risk Alert", "High humidity risks botrytis.")

    all_normal = all(status == "ok" for status in statuses.values())
    if all_normal and not alerts:
        push_alert("ok", "Crop Growing Properly", "All parameters are within the optimal ranges.")

    return StageEvaluationResponse(
        stage=stage,
        readings=readings,
        statuses=statuses,
        alerts=alerts
    )


def heuristic_ai_alerts(request: AiAlertRequest) -> AiAlertResponse:
    status_values = [status for status in request.statuses.values() if status != "unknown"]
    high_count = sum(1 for status in status_values if status == "high")
    low_count = sum(1 for status in status_values if status == "low")

    risk_score = max(0, min(100, 20 + high_count * 18 + low_count * 12))
    anomalies: List[str] = []
    summary = "No anomalies detected in current readings."
    recommendation = "Maintain current schedule and keep monitoring."

    humidity = request.readings.get("air_humidity")
    soil = request.readings.get("soil_analog")
    if isinstance(humidity, (int, float)) and humidity > 80:
        recommendation = "Improve airflow and reduce leaf wetness to lower disease risk."

    stage = get_stage(request.stage_id)
    if isinstance(soil, (int, float)) and stage.get("dry_threshold") and soil < stage["dry_threshold"]:
        recommendation = "Soil is below dry threshold. Irrigation check recommended."

    return AiAlertResponse(
        risk_score=int(risk_score),
        anomaly_detected=False,
        summary=summary,
        recommendation=recommendation,
        anomalies=anomalies
    )


def call_gemini_alerts(request: AiAlertRequest) -> AiAlertResponse:
    if not GEMINI_API_KEY:
        return heuristic_ai_alerts(request)

    stage = get_stage(request.stage_id)
    prompt = (
        "You are an agronomy AI assistant for Scotch Bonnet peppers. "
        "Return ONLY valid JSON with keys: risk_score (0-100 integer), "
        "anomaly_detected (boolean), anomalies (array of short strings), "
        "summary (string), recommendation (string). "
        "Use the stage thresholds, current readings, status labels, and history trend.\n\n"
        f"Stage: {stage}\n"
        f"Readings: {request.readings}\n"
        f"Statuses: {request.statuses}\n"
        f"History (latest first): {request.history[::-1]}\n"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "response_mime_type": "application/json"
        }
    }

    try:
        response = httpx.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, timeout=20)
        response.raise_for_status()
    except httpx.HTTPError:
        return heuristic_ai_alerts(request)

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError):
        return heuristic_ai_alerts(request)

    risk_score = int(max(0, min(100, parsed.get("risk_score", 0))))
    anomaly_detected = bool(parsed.get("anomaly_detected", False))
    summary = str(parsed.get("summary", ""))
    recommendation = str(parsed.get("recommendation", ""))
    anomalies = parsed.get("anomalies", [])
    if not isinstance(anomalies, list):
        anomalies = []

    return AiAlertResponse(
        risk_score=risk_score,
        anomaly_detected=anomaly_detected,
        summary=summary,
        recommendation=recommendation,
        anomalies=anomalies
    )


def call_gemini_ask(request: AiAskRequest) -> AiAskResponse:
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    if not GEMINI_API_KEY:
        return AiAskResponse(answer="AI key is not configured. Please try again later.")

    prompt = (
        "You are an agronomy assistant for Scotch Bonnet peppers in Sri Lanka. "
        "Answer the farmer's question concisely in 2-4 sentences."
        f"\n\nQuestion: {question}\n"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3
        }
    }

    try:
        response = httpx.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, timeout=20)
        response.raise_for_status()
    except httpx.HTTPError:
        return AiAskResponse(answer="AI service is temporarily unavailable. Please try again.")

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return AiAskResponse(answer="AI response could not be parsed. Please try again.")

    return AiAskResponse(answer=str(text).strip())


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                humidity REAL,
                temperature_c REAL,
                heat_index_c REAL,
                soil_moisture REAL,
                soil_analog REAL,
                soil_temperature_c REAL,
                ec REAL
            )
            """
        )
        connection.commit()


def row_to_dict(row: sqlite3.Row) -> Dict[str, Optional[float]]:
    return {
        "timestamp": row["timestamp"],
        "humidity": row["humidity"],
        "temperature_c": row["temperature_c"],
        "heat_index_c": row["heat_index_c"],
        "soil_moisture": row["soil_moisture"],
        "soil_analog": row["soil_analog"],
        "soil_temperature_c": row["soil_temperature_c"],
        "ec": row["ec"]
    }


def reading_to_dict(reading: Reading, timestamp: Optional[float] = None) -> Dict[str, Optional[float]]:
    return {
        "timestamp": timestamp if timestamp is not None else reading.timestamp,
        "humidity": reading.humidity,
        "temperature_c": reading.temperature_c,
        "heat_index_c": reading.heat_index_c,
        "soil_moisture": reading.soil_moisture,
        "soil_analog": reading.soil_analog,
        "soil_temperature_c": reading.soil_temperature_c,
        "ec": reading.ec
    }


def parse_firebase_history_items(payload: Dict[str, object]) -> List[Dict[str, object]]:
    candidates = [
        payload.get("history"),
        payload.get("readings"),
        payload.get("sensorData"),
        payload.get("data")
    ]

    items: List[Dict[str, object]] = []
    for candidate in candidates:
        if isinstance(candidate, list):
            items = [entry for entry in candidate if isinstance(entry, dict)]
            if items:
                return items

        if isinstance(candidate, dict):
            for key, value in candidate.items():
                if not isinstance(value, dict):
                    continue

                entry = dict(value)
                if "timestamp" not in entry:
                    try:
                        entry["timestamp"] = float(key)
                    except (TypeError, ValueError):
                        pass
                items.append(entry)

            if items:
                return items

    return []


def insert_reading(reading: Reading) -> float:
    timestamp = reading.timestamp or time.time()

    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            INSERT INTO readings (
                timestamp,
                humidity,
                temperature_c,
                heat_index_c,
                soil_moisture,
                soil_analog,
                soil_temperature_c,
                ec
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp,
                reading.humidity,
                reading.temperature_c,
                reading.heat_index_c,
                reading.soil_moisture,
                reading.soil_analog,
                reading.soil_temperature_c,
                reading.ec
            )
        )
        connection.commit()

    return timestamp


def ingest_firebase_reading() -> float:
    reading = fetch_firebase_reading()
    timestamp = insert_reading(reading)
    return timestamp


async def firebase_poll_loop() -> None:
    while True:
        try:
            ingest_firebase_reading()
        except Exception:
            pass

        await asyncio.sleep(max(5.0, FIREBASE_POLL_SECONDS))


def start_firebase_poller() -> None:
    global _poller_task
    if FIREBASE_POLL_SECONDS <= 0:
        return

    if _poller_task and not _poller_task.done():
        return

    _poller_task = asyncio.create_task(firebase_poll_loop())


def stop_firebase_poller() -> None:
    global _poller_task
    if _poller_task and not _poller_task.done():
        _poller_task.cancel()


def fetch_readings(limit: int, since: Optional[float] = None) -> List[Dict[str, Optional[float]]]:
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        if since is not None:
            rows = connection.execute(
                "SELECT * FROM readings WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT ?",
                (since, limit)
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM readings ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            ).fetchall()

    return [row_to_dict(row) for row in rows]


def fetch_readings_chrono(limit: int, since: Optional[float] = None) -> List[Dict[str, Optional[float]]]:
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        if since is not None:
            rows = connection.execute(
                "SELECT * FROM readings WHERE timestamp >= ? ORDER BY timestamp ASC LIMIT ?",
                (since, limit)
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM readings ORDER BY timestamp ASC LIMIT ?",
                (limit,)
            ).fetchall()

    return [row_to_dict(row) for row in rows]


def build_trend_chart(rows: List[Dict[str, Optional[float]]], field: str, title: str, unit: str) -> bytes:
    values = [row[field] for row in rows if row[field] is not None]
    if not values:
        return b""

    plt.figure(figsize=(6, 2.4))
    plt.plot(values, color="#76D34E", linewidth=2)
    plt.title(title, fontsize=10)
    plt.ylabel(unit, fontsize=8)
    plt.grid(alpha=0.2)
    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", dpi=160)
    plt.close()
    buffer.seek(0)
    return buffer.read()


def summarize_stage_alerts(rows: List[Dict[str, Optional[float]]], stage_id: str) -> Dict[str, object]:
    alert_entries = []
    counts = {"alert": 0, "warning": 0, "info": 0, "ok": 0}

    for row in rows:
        reading = Reading(**row)
        evaluation = evaluate_stage_logic(stage_id, reading, flags={})
        for alert in evaluation.alerts:
            counts[alert["level"]] = counts.get(alert["level"], 0) + 1
            alert_entries.append(
                {
                    "timestamp": row.get("timestamp"),
                    "title": alert["title"],
                    "detail": alert["detail"],
                    "level": alert["level"]
                }
            )

    alert_entries = alert_entries[-50:]
    return {
        "counts": counts,
        "entries": alert_entries
    }


def compute_summary(rows: List[Dict[str, Optional[float]]]) -> SummaryStats:
    fields = [
        "humidity",
        "temperature_c",
        "heat_index_c",
        "soil_moisture",
        "soil_analog",
        "soil_temperature_c",
        "ec"
    ]

    def collect(field: str) -> List[float]:
        return [row[field] for row in rows if row[field] is not None]

    avg = {}
    min_values = {}
    max_values = {}
    trend = {}

    for field in fields:
        values = collect(field)
        avg[field] = sum(values) / len(values) if values else None
        min_values[field] = min(values) if values else None
        max_values[field] = max(values) if values else None

        if len(values) >= 2:
            trend[field] = values[0] - values[1]
        else:
            trend[field] = None

    return SummaryStats(avg=avg, min=min_values, max=max_values, trend=trend, count=len(rows))


def fetch_firebase_reading() -> Reading:
    try:
        response = httpx.get(f"{FIREBASE_URL}/.json", timeout=10)
        response.raise_for_status()
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    payload = response.json() or {}
    sensors = payload.get("sensors", payload)
    return Reading(
        humidity=sensors.get("humidity"),
        temperature_c=sensors.get("temperature_c"),
        heat_index_c=sensors.get("heat_index_c"),
        soil_moisture=sensors.get("soil_moisture"),
        soil_analog=sensors.get("soil_analog"),
        soil_temperature_c=sensors.get("soil_temperature_c") or sensors.get("soil_temp_c"),
        ec=sensors.get("ec")
    )


def fetch_firebase_history(
    limit: int = 500,
    since: Optional[float] = None,
    chronological: bool = False
) -> List[Dict[str, Optional[float]]]:
    try:
        response = httpx.get(f"{FIREBASE_URL}/.json", timeout=10)
        response.raise_for_status()
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    payload = response.json() or {}
    items = parse_firebase_history_items(payload)
    rows: List[Dict[str, Optional[float]]] = []

    for item in items:
        reading = Reading(**item)
        timestamp = item.get("timestamp") if isinstance(item, dict) else None
        row = reading_to_dict(reading, timestamp=timestamp)

        if since is not None and isinstance(row.get("timestamp"), (int, float)):
            if row["timestamp"] < since:
                continue

        rows.append(row)

    rows.sort(key=lambda entry: entry.get("timestamp") or 0, reverse=not chronological)

    if limit > 0:
        rows = rows[:limit]

    return rows


def generate_report_from_rows(rows: List[Dict[str, Optional[float]]], title: str) -> StreamingResponse:
    if not rows:
        raise HTTPException(status_code=404, detail="No readings stored yet")

    buffer = io.BytesIO()
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.pdfgen import canvas

    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setTitle(title)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, height - 2 * cm, title)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(2 * cm, height - 2.6 * cm, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    pdf.drawString(2 * cm, height - 3.2 * cm, f"Readings: {len(rows)}")
    pdf.drawString(2 * cm, height - 3.8 * cm, "Note: Context flags are not applied in this report.")

    y = height - 4.6 * cm

    charts = [
        ("temperature_c", "Air temperature", "C"),
        ("humidity", "Air humidity", "%"),
        ("soil_moisture", "Soil moisture %", "%"),
        ("soil_analog", "Soil analog", ""),
        ("ec", "EC", "mS/cm")
    ]

    for field, chart_title, unit in charts:
        chart_bytes = build_trend_chart(rows, field, chart_title, unit)
        if chart_bytes:
            if y < 7 * cm:
                pdf.showPage()
                y = height - 2 * cm
            pdf.setFont("Helvetica-Bold", 11)
            pdf.drawString(2 * cm, y, chart_title)
            y -= 0.3 * cm
            pdf.drawInlineImage(chart_bytes, 2 * cm, y - 5.4 * cm, width=17 * cm, height=5 * cm)
            y -= 6 * cm

    for stage in STAGES:
        if y < 9 * cm:
            pdf.showPage()
            y = height - 2 * cm

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(2 * cm, y, f"Stage: {stage['title']} ({stage['duration']})")
        y -= 0.4 * cm

        pdf.setFont("Helvetica", 9)
        for key, data in stage["thresholds"].items():
            label = key.replace("_", " ").title()
            pdf.drawString(2.2 * cm, y, f"{label}: {data['min']} - {data['max']} {data['unit']}")
            y -= 0.3 * cm

        summary = summarize_stage_alerts(rows, stage["id"])
        counts = summary["counts"]
        pdf.drawString(
            2.2 * cm,
            y,
            f"Alerts: {counts['alert']} | Warnings: {counts['warning']} | Info: {counts['info']} | OK: {counts['ok']}"
        )
        y -= 0.4 * cm

        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(2.2 * cm, y, "Recent alerts")
        y -= 0.3 * cm

        pdf.setFont("Helvetica", 8)
        for entry in summary["entries"][-10:]:
            timestamp = datetime.fromtimestamp(entry["timestamp"]).strftime("%H:%M:%S") if entry.get("timestamp") else "--"
            text = f"[{timestamp}] {entry['level'].upper()}: {entry['title']}"
            pdf.drawString(2.4 * cm, y, text)
            y -= 0.25 * cm
            if y < 3 * cm:
                pdf.showPage()
                y = height - 2 * cm

        y -= 0.2 * cm

    pdf.showPage()
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, height - 2 * cm, "Raw readings (latest 50)")
    pdf.setFont("Helvetica", 8)
    y = height - 2.6 * cm
    for row in rows[-50:]:
        timestamp = datetime.fromtimestamp(row["timestamp"]).strftime("%Y-%m-%d %H:%M:%S") if row.get("timestamp") else "--"
        line = (
            f"{timestamp} | T={row.get('temperature_c')} C | H={row.get('humidity')}% | "
            f"Soil%={row.get('soil_moisture')} | SoilA={row.get('soil_analog')} | EC={row.get('ec')}"
        )
        pdf.drawString(2 * cm, y, line)
        y -= 0.25 * cm
        if y < 2 * cm:
            pdf.showPage()
            y = height - 2 * cm

    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=iot_stage_report.pdf"}
    )


def generate_report(minutes: int = 60, limit: int = 500) -> StreamingResponse:
    since = time.time() - minutes * 60
    rows = fetch_readings_chrono(limit=limit, since=since)
    title = f"IoT Stage Report (Last {minutes} minutes)"
    return generate_report_from_rows(rows, title)


def generate_firebase_report(limit: int = 500) -> StreamingResponse:
    rows = fetch_firebase_history(limit=limit, chronological=True)
    return generate_report_from_rows(rows, "IoT Stage Report (Firebase History)")

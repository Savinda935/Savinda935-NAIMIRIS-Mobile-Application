# IoT Monitoring Backend

## What it does
- Stores IoT readings in SQLite
- Pulls the latest Firebase reading on demand
- Provides basic analytics (avg/min/max/trend)

## Setup
```bash
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run
```bash
uvicorn main:app --reload --port 8000
```

## Environment variables
- `FIREBASE_URL` (default is the provided Firebase URL)
- `IOT_DB_PATH` (default: iot_readings.db)

## Endpoints
- `GET /health`
- `POST /readings`
- `POST /readings/firebase`
- `GET /readings/latest`
- `GET /readings?limit=100`
- `GET /analytics/summary?minutes=30`
- `GET /report/pdf?minutes=60&limit=500`

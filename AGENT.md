# NAIMIRIS Repository Agent Notes

## 1. Project Overview

This repository currently contains Savinda's **Technology-Assisted A-to-Z Farming Guidance / IoT Monitoring** component for the NAIMIRIS mobile application.

It also contains a shared **React Native / Expo mobile app shell** that already has screens and folders for the other planned components, including Krishan's Pre-Analysis component and Tashini's Technology-Assisted A-to-Z Farming Guidance component.

Savinda's monitoring backend, Krishan's pre-analysis backend, and Tashini's initial guidance backend are implemented as separate FastAPI modules. New component logic should stay in separate modules and must not be placed inside `Backend/monitoring/`.

## 2. Savinda's Component Status

Savinda's component already includes:

- FastAPI backend
- React Native / Expo frontend
- Firebase IoT sensor data fetching
- SQLite sensor reading storage
- Crop growth stage evaluation
- Environmental condition validation
- Gemini AI alert generation
- Farmer Q&A endpoint
- Analytics summary endpoints
- Firebase history reading
- PDF report generation
- Monitoring dashboards in the frontend

The monitoring component focuses on IoT sensor readings, Scotch Bonnet/Nai Miris growth stages, environmental thresholds, alerts, analytics, and reports.

## 3. Current Backend Structure

### `Backend/main.py`

Main FastAPI server entry file.

Responsibilities:

- Loads environment variables using `python-dotenv`
- Creates the FastAPI app
- Adds CORS middleware
- Initializes the SQLite database on startup
- Starts the Firebase polling loop on startup
- Stops the Firebase polling loop on shutdown
- Registers the monitoring router
- Provides `GET /health`

### `Backend/monitoring/models.py`

Contains Pydantic request and response schemas for Savinda's monitoring module.

Important models include:

- `Reading`
- `SummaryStats`
- `StageEvaluationRequest`
- `StageEvaluationResponse`
- `StageDecisionRequest`
- `StageDecisionResponse`
- `AiAlertRequest`
- `AiAlertResponse`
- `AiAskRequest`
- `AiAskResponse`

### `Backend/monitoring/routes.py`

Contains FastAPI route definitions for monitoring.

Responsibilities:

- Accepting/storing sensor readings
- Fetching latest and historical readings
- Returning analytics summaries
- Returning Firebase history summaries
- Listing growth stages
- Evaluating stage conditions
- Calling AI alert and Q&A logic
- Generating PDF reports

Routes are currently registered without a module prefix, so endpoints are exposed directly at paths such as `/readings`, `/analytics/summary`, and `/ai/alerts`.

### `Backend/monitoring/service.py`

Main service/business logic file for Savinda's component.

Responsibilities:

- Stage threshold definitions
- Growth stage decision logic
- Environmental validation rules
- Local alert generation
- Gemini AI alert generation
- Gemini farmer Q&A
- SQLite database initialization
- SQLite reading insert/fetch logic
- Firebase latest reading fetch
- Firebase history parsing
- Background Firebase polling
- Analytics summary calculation
- PDF report and chart generation

This file is currently large and mixes several responsibilities, but it should not be refactored until the existing behavior is protected.

### `Backend/requirements.txt`

Python dependencies for the backend.

Current main dependencies:

- `fastapi`
- `uvicorn[standard]`
- `httpx`
- `matplotlib`
- `reportlab`
- `python-dotenv`
- `python-multipart`
- `ultralytics`

### `Backend/iot_readings.db`

SQLite database used by the monitoring backend to store IoT readings.

This is a runtime/generated file and should not normally be committed to Git.

### `Backend/.env`

Local backend environment file.

Used for values such as:

- `FIREBASE_URL`
- `IOT_DB_PATH`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `FIREBASE_POLL_SECONDS`

This file may contain secrets and should not normally be committed to Git.

## 4. Current Frontend Structure

### `frontend/App.js`

Main Expo app entry file.

Responsibilities:

- Loads custom fonts
- Wraps the app in `AppProvider`
- Creates the React Navigation container
- Loads the root navigator

### `frontend/src/navigation/`

Contains app navigation setup.

Important files:

- `RootNavigator.js`: stack navigation for welcome, onboarding, service screens, and feature screens
- `TabNavigator.js`: bottom tab navigation for Home, Pre-Analysis, Monitoring, Stage, and Pest areas

### `frontend/src/screens/`

Contains screen-level UI files.

Monitoring-related screens include:

- `MonitoringServicesScreen.js`
- `IoTDashboardScreen.js`
- `GrowthMonitoringScreen.js`
- `StageDashboardScreen.js`
- `DataAnalysisScreen.js`

Pre-analysis screens already exist, but currently mostly use placeholder/mock logic:

- `PreAnalysisServicesScreen.js`
- `LandAnalysisScreen.js`
- `BudgetPlanningScreen.js`
- `ProfitPredictionScreen.js`

Pest control screens also exist with placeholder/mock logic:

- `PestServicesScreen.js`
- `PestDetectionScreen.js`: re-exports the connected Tashini pest-detection screen from `frontend/src/features/pestControl/screens/PestDetectionScreen.js`
- `SeverityAnalysisScreen.js`
- `TreatmentPlanScreen.js`

### `frontend/src/features/monitoring/`

Contains monitoring-specific frontend logic.

Important files:

- `iotMonitor.js`: fetches live IoT sensor data from Firebase
- `stageLogic.js`: local frontend growth stage evaluation logic
- `aiAlerts.js`: mock/local AI alert summary logic
- `growthAnalyzer.js`: mock/local growth stage guidance logic

### `frontend/src/services/`

Contains shared service/helper files for API, AI, IoT, and local storage.

Important files:

- `apiClient.js`: generic API client, but currently uses a placeholder base URL
- `aiService.js`: calls backend AI alert endpoint
- `iotService.js`: ThingSpeak-related helper
- `storage.js`: local JSON storage using Expo FileSystem

### `frontend/src/config/api.js`

Contains the configurable backend base URL used by Tashini's frontend pest-control API client.

Resolution order:

- `EXPO_PUBLIC_BACKEND_BASE_URL`
- Expo dev host IP with port `8000`
- PC IPv4 fallback currently set to `http://10.68.28.18:8000`

Do not use `localhost` for mobile-device API calls.

### `frontend/src/state/`

Contains global app state.

Current file:

- `AppContext.js`

Uses React Context and `useReducer` to store shared app values such as budget, land, sensor state, growth stage, pest severity, and active plan ID.

### `frontend/src/components/ui/`

Contains reusable UI components used across screens.

Current components:

- `PrimaryButton.js`
- `ScreenHeader.js`
- `SectionCard.js`
- `StatTile.js`

Krishan should reuse these components for consistent UI style.

## 5. Current API Endpoints

Existing monitoring endpoints:

- `GET /health`
- `POST /readings`
- `POST /readings/firebase`
- `GET /readings/latest`
- `GET /readings`
- `GET /analytics/summary`
- `GET /analytics/summary/firebase`
- `GET /analytics/history/firebase`
- `GET /stages`
- `POST /analytics/stage/evaluate`
- `POST /analytics/stage/decision`
- `POST /ai/alerts`
- `POST /ai/ask`
- `GET /report/pdf`
- `GET /report/firebase/pdf`

These endpoints belong to Savinda's monitoring component and should continue working when Krishan's component is added.

## 6. Important Notes for Krishan

- Krishan's Pre-Analysis component should be added separately inside `Backend/preanalysis/`.
- Do not place Krishan's logic inside `Backend/monitoring/`.
- Follow the same backend module pattern used by Savinda:
  - `models.py`
  - `routes.py`
  - `service.py`
- Add pre-analysis frontend API calls separately.
- Existing frontend files under `frontend/src/features/preAnalysis/` are mostly placeholder/mock logic.
- Existing pre-analysis screens can be reused, but they should be connected to real backend APIs later.
- Keep Savinda's monitoring routes working.
- Avoid changing monitoring files unless the change is required for integration, such as registering a new router in `Backend/main.py`.

## 7. Suggested Krishan Backend Module

Suggested folder structure:

```text
Backend/preanalysis/
  __init__.py
  models.py
  routes.py
  service.py
```

Suggested endpoints:

- `POST /api/preanalysis/land/suitability`
- `POST /api/preanalysis/budget/plan`
- `POST /api/preanalysis/profit/predict`
- `POST /api/preanalysis/decision-support`
- `GET /api/preanalysis/report/pdf`

Recommended backend responsibilities:

- `models.py`: Pydantic request/response schemas
- `routes.py`: FastAPI endpoint definitions
- `service.py`: land suitability, budget planning, profit prediction, and decision-support logic

Recommended frontend addition:

```text
frontend/src/services/preAnalysisApi.js
```

This should contain frontend API calls for Krishan's backend endpoints.

## 8. Current Problems / Warnings

- `Backend/monitoring/service.py` is large and mixes many responsibilities.
- `Backend/.env` should not be committed.
- `Backend/iot_readings.db` should not be committed.
- `__pycache__` files should not be committed.
- `frontend/src/services/apiClient.js` currently has a placeholder base URL.
- Monitoring logic is duplicated in frontend and backend.
- Krishan and Tashini backend modules are implemented as separate backend modules.
- Backend route paths currently have no monitoring-specific prefix, so new modules should use separate prefixes to avoid conflicts.
- Some frontend pre-analysis and pest-control logic is mock/demo logic, not production backend integration.

## 9. Safe Next Steps

1. Create Krishan's `Backend/preanalysis/` backend module.
2. Add `__init__.py`, `models.py`, `routes.py`, and `service.py`.
3. Use a separate route prefix such as `/api/preanalysis`.
4. Register the new pre-analysis router in `Backend/main.py`.
5. Keep Savinda's monitoring module unchanged unless router registration requires a small import/include addition.
6. Add a frontend API service such as `frontend/src/services/preAnalysisApi.js`.
7. Connect existing pre-analysis screens to the new backend APIs.
8. Keep monitoring endpoints working exactly as they currently do.
9. Add proper ignore rules later for `.env`, SQLite databases, `__pycache__`, `.expo`, and `node_modules`.

The safest approach is to add Krishan's component as a new independent module first, then improve shared structure only after all current behavior is stable.

## 10. Important Notes for Tashini

- Tashini's Technology-Assisted A-to-Z Farming Guidance component is placed under `Backend/pest_control/`.
- Do not place Tashini's backend logic inside `Backend/guidance/`.
- Do not place Tashini's backend logic inside `Backend/monitoring/`.
- Tashini's router is registered in `Backend/main.py` with the prefix `/api/pest-control`.
- Tashini's module contains both rule-based growth guidance and a YOLO-based disease prediction endpoint.
- The YOLO integration is isolated in `Backend/pest_control/ai_model.py`.
- The default model file is `Backend/pest_control/best.pt`.
- The model path can be overridden with the `PEST_CONTROL_MODEL_PATH` environment variable.
- Image uploads use FastAPI `UploadFile`, so `python-multipart` is required.
- YOLO inference uses the `ultralytics` package.
- Keep Savinda's monitoring endpoints working exactly as they currently do.
- Avoid changing Krishan's `Backend/preanalysis/` module unless import compatibility requires it.

Current Tashini backend files:

```text
Backend/pest_control/
  __init__.py
  ai_model.py
  best.pt
  models.py
  service.py
  routes.py
```

Current Tashini endpoints:

- `GET /api/pest-control/health`
- `GET /api/pest-control/stages`
- `POST /api/pest-control/analyze`
- `POST /api/pest-control/predict-disease`

### `Backend/pest_control/ai_model.py`

Loads the trained YOLO model using Ultralytics and exposes:

- `predict_disease(image_path)`

This function accepts a local image path, runs YOLO prediction, and returns:

- best detected disease name
- confidence score
- bounding boxes
- affected-area ratio estimate
- full prediction list

### `POST /api/pest-control/predict-disease`

Accepts a multipart image upload, saves it temporarily, runs `predict_disease(image_path)`, returns JSON predictions, and removes the temporary image file after inference.

The response is aligned with Tashini's proposal for AI-driven pest monitoring and control:

- detects pest/disease from Nai Miris leaf images
- estimates severity as `none`, `low`, `medium`, or `high`
- estimates affected leaf area from YOLO bounding boxes
- returns pesticide/treatment recommendation
- returns dosage and safety guidance

Do not mix this model-loading code into `models.py`, `service.py`, or `Backend/monitoring/`. Keep ML inference isolated so the team can test and replace the trained model safely.

## 11. Tashini Frontend Connection Status

Tashini's React Native pest-detection frontend is connected to the existing FastAPI pest-control backend.

Current frontend files:

```text
frontend/src/features/pestControl/
  api/
    pestApi.js
  screens/
    PestDetectionScreen.js
  pestDetector.js
  severityScoring.js
  treatmentAdvisor.js
```

The original navigation screen remains at:

```text
frontend/src/screens/PestDetectionScreen.js
```

It re-exports the feature screen so existing `RootNavigator.js` and `TabNavigator.js` imports keep working.

Current frontend API functions:

- `predictDiseaseFromImage(imageAsset)`
- `checkPestControlHealth()`

Connected backend endpoint:

- `POST /api/pest-control/predict-disease`

Request format:

- multipart form-data
- field name: `image`

Expected backend response fields currently used by the UI:

- `filename`
- `model`
- `pest_name`
- `disease_name`
- `confidence`
- `severity`
- `affected_area_ratio`
- `treatment_recommendation`
- `treatment`
- `predictions`

The frontend displays severity and treatment recommendation when these values are returned by the backend.

Frontend dependencies added for this integration:

- `axios`
- `expo-image-picker`

Keep Savinda's monitoring frontend and Krishan's pre-analysis frontend unchanged when working on Tashini's pest-control UI.

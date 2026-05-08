from typing import Dict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from monitoring.routes import router as monitoring_router
from monitoring.service import init_db, start_firebase_poller, stop_firebase_poller

app = FastAPI(title="IoT Monitoring Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    start_firebase_poller()


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_firebase_poller()


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


app.include_router(monitoring_router)

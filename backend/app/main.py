from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="Smart Pillbox API", version="0.1.0")


class DoseEvent(BaseModel):
    device_id: str = Field(..., examples=["device_001"])
    compartment_id: int = Field(..., ge=1, le=5)
    status: Literal["taken", "missed"]
    scheduled_time: str = Field(..., examples=["09:00"])
    occurred_at: datetime | None = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/devices/{device_id}/schedule")
def get_device_schedule(device_id: str) -> dict:
    # TODO: Read this from Firestore once Firebase Admin credentials are configured.
    return {
        "deviceId": device_id,
        "timezone": "America/New_York",
        "compartments": [
            {"compartmentId": 1, "enabled": True, "medicationName": "Vitamin D", "time": "09:00"},
            {"compartmentId": 2, "enabled": True, "medicationName": "Blood pressure pill", "time": "12:30"},
            {"compartmentId": 3, "enabled": False, "medicationName": "", "time": ""},
            {"compartmentId": 4, "enabled": False, "medicationName": "", "time": ""},
            {"compartmentId": 5, "enabled": False, "medicationName": "", "time": ""},
        ],
    }


@app.post("/devices/{device_id}/dose-events")
def create_dose_event(device_id: str, event: DoseEvent) -> dict:
    # TODO: Write event to Firestore and trigger missed-dose email when needed.
    occurred_at = event.occurred_at or datetime.now(timezone.utc)
    return {
        "deviceId": device_id,
        "compartmentId": event.compartment_id,
        "status": event.status,
        "scheduledTime": event.scheduled_time,
        "occurredAt": occurred_at.isoformat(),
    }

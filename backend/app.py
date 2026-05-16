import json
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from functools import wraps
from os import getenv

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()


def initialize_firebase_admin():
    if firebase_admin._apps:
        return firestore.client()

    service_account_path = getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    service_account_json = getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    client_email = getenv("FIREBASE_CLIENT_EMAIL")
    private_key = getenv("FIREBASE_PRIVATE_KEY")
    project_id = getenv("FIREBASE_PROJECT_ID")

    if service_account_path:
        credential = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(credential)
        return firestore.client()

    if service_account_json:
        credential = credentials.Certificate(json.loads(service_account_json))
        firebase_admin.initialize_app(credential)
        return firestore.client()

    if client_email and private_key and project_id:
        credential = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": project_id,
                "private_key": private_key.replace("\\n", "\n"),
                "client_email": client_email,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        )
        firebase_admin.initialize_app(credential)
        return firestore.client()

    firebase_admin.initialize_app()
    return firestore.client()


try:
    db = initialize_firebase_admin()
    firebase_ready = True
except Exception as exc:
    db = None
    firebase_ready = False
    firebase_error = str(exc)
else:
    firebase_error = ""


def require_device_key(route_handler):
    @wraps(route_handler)
    def wrapper(*args, **kwargs):
        expected_key = getenv("DEVICE_API_KEY")

        if expected_key and request.headers.get("X-Device-Key") != expected_key:
            return jsonify({"error": "unauthorized_device"}), 401

        return route_handler(*args, **kwargs)

    return wrapper


def require_firebase():
    if db is None:
        return (
            jsonify(
                {
                    "error": "firebase_not_configured",
                    "message": firebase_error,
                }
            ),
            503,
        )

    return None


def serialize_compartment(document):
    data = document.to_dict() or {}

    return {
        "id": int(data.get("id", document.id)),
        "medicationName": data.get("medicationName", ""),
        "time": data.get("time", ""),
        "enabled": bool(data.get("enabled", False)),
        "status": data.get("status", "empty"),
    }


def smtp_configured():
    return all(
        [
            getenv("SMTP_HOST"),
            getenv("SMTP_PORT"),
            getenv("SMTP_USER"),
            getenv("SMTP_PASSWORD"),
            getenv("FROM_EMAIL"),
        ]
    )


def send_email(to_email, subject, body):
    if not smtp_configured():
        return {"sent": False, "reason": "smtp_not_configured"}

    message = EmailMessage()
    message["From"] = getenv("FROM_EMAIL")
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(getenv("SMTP_HOST"), int(getenv("SMTP_PORT", "587"))) as smtp:
        smtp.starttls()
        smtp.login(getenv("SMTP_USER"), getenv("SMTP_PASSWORD"))
        smtp.send_message(message)

    return {"sent": True}


def get_device_or_404(device_id):
    device_ref = db.collection("devices").document(device_id)
    device_snapshot = device_ref.get()

    if not device_snapshot.exists:
        return None, None

    return device_ref, device_snapshot.to_dict()


def build_daily_summary(device_ref, device):
    events = list(
        device_ref.collection("doseEvents")
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .limit(20)
        .stream()
    )
    taken = 0
    missed = 0
    lines = []

    for event_doc in events:
        event = event_doc.to_dict()
        status = event.get("status", "missed")
        if status == "taken":
            taken += 1
        if status == "missed":
            missed += 1
        lines.append(
            f"- Compartment {event.get('compartmentId')}: "
            f"{event.get('medicationName') or 'Unnamed'} at "
            f"{event.get('scheduledTime') or 'no time'} — {status}"
        )

    score = 100 if taken + missed == 0 else round((taken / (taken + missed)) * 100)
    body = "\n".join(
        [
            f"Your Chrono-Pill summary for {device.get('name', 'My Pillbox')}",
            "",
            f"Adherence score: {score}%",
            f"Taken: {taken}",
            f"Missed: {missed}",
            "",
            "Recent activity:",
            *(lines or ["- No dose events recorded yet."]),
            "",
            "Keep the routine steady. Small consistency adds up.",
        ]
    )

    return {
        "score": score,
        "taken": taken,
        "missed": missed,
        "body": body,
    }


def create_app():
    app = Flask(__name__)
    CORS(app, origins=[getenv("FRONTEND_ORIGIN", "http://localhost:5173")])

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "service": "chrono-pill-backend",
                "firebaseReady": firebase_ready,
                "time": datetime.now(timezone.utc).isoformat(),
            }
        )

    @app.get("/api/devices/<device_id>/schedule")
    @require_device_key
    def get_device_schedule(device_id):
        firebase_response = require_firebase()

        if firebase_response:
            return firebase_response

        device_ref, device = get_device_or_404(device_id)

        if not device_ref:
            return jsonify({"error": "device_not_found"}), 404

        compartments = [
            serialize_compartment(document)
            for document in device_ref.collection("compartments").stream()
        ]
        compartments.sort(key=lambda item: item["id"])

        return jsonify(
            {
                "deviceId": device_id,
                "timezone": device.get("timezone", "America/New_York"),
                "alertRules": {
                    "initialLightSeconds": 60,
                    "secondAlertMinutes": 15,
                    "missedAfterMinutes": 120,
                },
                "compartments": compartments,
            }
        )

    @app.post("/api/devices/<device_id>/dose-events")
    @require_device_key
    def create_dose_event(device_id):
        firebase_response = require_firebase()

        if firebase_response:
            return firebase_response

        payload = request.get_json(silent=True) or {}
        required_fields = ["compartmentId", "scheduledTime", "status"]
        missing_fields = [field for field in required_fields if field not in payload]

        if missing_fields:
            return jsonify({"error": "missing_fields", "fields": missing_fields}), 400

        if payload["status"] not in ["taken", "missed"]:
            return jsonify({"error": "invalid_status"}), 400

        device_ref, device = get_device_or_404(device_id)

        if not device_ref:
            return jsonify({"error": "device_not_found"}), 404

        compartment_id = int(payload["compartmentId"])
        event = {
            "deviceId": device_id,
            "compartmentId": compartment_id,
            "medicationName": payload.get("medicationName", ""),
            "scheduledTime": payload["scheduledTime"],
            "status": payload["status"],
            "occurredAt": payload.get("occurredAt") or datetime.now(timezone.utc).isoformat(),
            "createdAt": firestore.SERVER_TIMESTAMP,
        }

        event_ref = device_ref.collection("doseEvents").document()
        event_ref.set(event)
        device_ref.collection("compartments").document(str(compartment_id)).set(
            {
                "status": payload["status"],
                "lastTaken": event["occurredAt"] if payload["status"] == "taken" else "",
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

        notification_result = {"sent": False, "reason": "not_missed"}
        if payload["status"] == "missed":
            caregiver_email = device.get("caregiverEmail", "")
            if device.get("caregiverEnabled") and caregiver_email:
                notification_result = send_email(
                    caregiver_email,
                    "Chrono-Pill missed dose alert",
                    (
                        f"A dose was missed on {device.get('name', 'My Pillbox')}.\n\n"
                        f"Compartment: {compartment_id}\n"
                        f"Medication: {event['medicationName'] or 'Unnamed'}\n"
                        f"Scheduled time: {event['scheduledTime']}\n"
                    ),
                )

        return (
            jsonify(
                {
                    "id": event_ref.id,
                    "event": {**event, "createdAt": event["occurredAt"]},
                    "notification": notification_result,
                }
            ),
            201,
        )

    @app.post("/api/notifications/missed-dose")
    def notify_missed_dose():
        payload = request.get_json(silent=True) or {}
        to_email = payload.get("toEmail")

        if not to_email:
            return jsonify({"error": "missing_toEmail"}), 400

        result = send_email(
            to_email,
            "Chrono-Pill missed dose alert",
            payload.get("message", "A scheduled dose was missed."),
        )

        return jsonify(
            {
                "queued": result.get("sent", False),
                "result": result,
                "payload": payload,
            }
        )

    @app.post("/api/devices/<device_id>/daily-summary")
    @require_device_key
    def send_daily_summary(device_id):
        firebase_response = require_firebase()

        if firebase_response:
            return firebase_response

        payload = request.get_json(silent=True) or {}
        device_ref, device = get_device_or_404(device_id)

        if not device_ref:
            return jsonify({"error": "device_not_found"}), 404

        summary = build_daily_summary(device_ref, device)
        to_email = payload.get("toEmail") or device.get("caregiverEmail")

        if not to_email:
            return jsonify({"summary": summary, "email": {"sent": False, "reason": "missing_email"}})

        result = send_email(to_email, "Your Chrono-Pill daily summary", summary["body"])
        return jsonify({"summary": summary, "email": result})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)

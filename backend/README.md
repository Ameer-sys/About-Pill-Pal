# Chrono-Pill Backend

Flask API for the Smart Pillbox. The frontend uses Firebase directly for Auth and user-facing Firestore reads/writes, while this backend handles device-facing endpoints, dose event writes, and missed-dose notification logic.

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --debug
```

Health check:

```bash
curl http://127.0.0.1:5000/api/health
```

## API Shape

- `GET /api/health`
- `GET /api/devices/<device_id>/schedule`
- `POST /api/devices/<device_id>/dose-events`
- `POST /api/notifications/missed-dose`

## Firebase Admin

Use one of these options:

- `FIREBASE_SERVICE_ACCOUNT_PATH`: absolute path to the downloaded service account JSON file
- `FIREBASE_SERVICE_ACCOUNT_JSON`: full service account JSON as one environment variable
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_PROJECT_ID`
- Application Default Credentials for local Google Cloud tooling

Set `DEVICE_API_KEY` to require ESP32/API callers to send:

```text
X-Device-Key: your-device-key
```

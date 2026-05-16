# Chrono-Pill Smart Pillbox

Chrono-Pill is a 5-compartment smart pillbox platform for medication and supplement adherence. The product loop is:

1. User sets one daily reminder per compartment.
2. ESP32 alerts with LED, buzzer, and vibration.
3. Reed switch confirms the correct compartment was opened.
4. App logs taken or missed automatically.
5. Missed doses can notify the user and optional caregiver.

## Stack

- Frontend: React, Vite, Tailwind CSS, Firebase Auth
- Backend: Python Flask API with Firebase Admin
- Cloud: Firebase Auth now, Firestore next
- Hardware later: ESP32 DevKit V1, 5 reed switches, 5 LEDs, 1 buzzer, 2 vibration motors

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Local app: `http://127.0.0.1:5173`

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --debug
```

Health check: `http://127.0.0.1:5000/api/health`

## Current Frontend Capabilities

- Medical-style welcome screen
- Firebase signup/login wiring
- Dashboard with 5 compartments
- Compartment setup/edit/clear flow
- Firestore-backed schedules and settings
- Dose history/adherence view
- Settings for caregiver and notification preferences
- Feedback toast system

## Next Build Steps

1. Configure Firebase Admin credentials in `backend/.env`.
2. Configure SMTP credentials for missed-dose and daily summary email.
3. Upload the ESP32 sketch and verify reed switch wiring.
4. Deploy frontend hosting.
5. Prepare production monitoring and device provisioning.

See [docs/software-runbook.md](docs/software-runbook.md) for the full startup flow.

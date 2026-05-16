# Chrono-Pill Software Runbook

## 1. Firebase

Enable:

- Authentication: Email/Password
- Firestore Database

Publish:

- `firestore.rules`

Expected first-login documents:

```text
users/{uid}
devices/{uid}_default
devices/{uid}_default/compartments/1
devices/{uid}_default/compartments/2
devices/{uid}_default/compartments/3
devices/{uid}_default/compartments/4
devices/{uid}_default/compartments/5
```

## 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Test:

1. Create account with full name.
2. Save one compartment schedule.
3. Refresh and confirm the schedule stays.
4. Open the compartment page and use Hardware Testing to record taken/missed.
5. Confirm History and Streak update.

## 3. Backend

Create `backend/.env` from `backend/.env.example`.

Recommended:

```text
FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\to\your\service-account.json
DEVICE_API_KEY=choose-a-long-random-key
FRONTEND_ORIGIN=http://localhost:5173
```

Run:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --host 0.0.0.0 --port 5000 --debug
```

Health:

```text
http://127.0.0.1:5000/api/health
```

## 4. Email

Set SMTP variables in `backend/.env`:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=
```

Backend can send:

- missed-dose caregiver alert
- daily summary email

## 5. ESP32

Install Arduino IDE libraries:

- ArduinoJson

Copy:

```text
firmware/smart_pillbox_esp32/config.example.h
```

to:

```text
firmware/smart_pillbox_esp32/config.h
```

Fill:

- Wi-Fi
- backend IP URL
- device id: `<firebase-uid>_default`
- device API key if configured

Upload, open Serial Monitor at `115200`.

The ESP32 should:

1. Connect to Wi-Fi.
2. Sync NTP time.
3. Fetch schedule from Flask.
4. Alert at matching schedule time.
5. Detect reed switch opening.
6. POST taken/missed event to Flask.

## Important

For ESP32, do not use `localhost` for Flask. Use your computer Wi-Fi IPv4 address.

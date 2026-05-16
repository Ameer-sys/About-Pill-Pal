# ESP32 Setup

## Libraries

Install these in Arduino IDE Library Manager:

- ArduinoJson

The ESP32 core includes:

- WiFi
- HTTPClient

## Setup

1. Copy `config.example.h` to `config.h`.
2. Fill in Wi-Fi name and password.
3. Set `API_BASE_URL` to the computer running Flask.
4. Set `DEVICE_ID` to the Firestore device id.
   - Default format: `<firebase-user-uid>_default`
5. If backend `DEVICE_API_KEY` is set, copy the same value into `config.h`.

## Pin Map

| Component | GPIO |
| --- | --- |
| Reed 1 | 32 |
| Reed 2 | 33 |
| Reed 3 | 25 |
| Reed 4 | 26 |
| Reed 5 | 27 |
| LED 1 | 14 |
| LED 2 | 12 |
| LED 3 | 13 |
| LED 4 | 23 |
| LED 5 | 19 |
| Buzzer | 18 |
| Vibration motor 1 | 5 |
| Vibration motor 2 | 17 |

## First Hardware Test

Upload the sketch, open Serial Monitor at `115200`, and confirm:

- Wi-Fi connects.
- Schedule is fetched from Flask.
- Opening each compartment changes the reed switch state.
- A scheduled time triggers alerts.
- Opening the correct reed switch posts a taken dose event.

Do not connect vibration motors directly to ESP32 pins. Use transistor or MOSFET driver circuits.

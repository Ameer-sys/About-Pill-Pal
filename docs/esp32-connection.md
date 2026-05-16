# ESP32 Connection Plan

## Development Flow

1. Frontend saves schedules to Firestore.
2. Flask backend reads the schedule from Firestore.
3. ESP32 fetches from Flask:

```text
GET /api/devices/<device_id>/schedule
```

4. ESP32 later posts dose events:

```text
POST /api/devices/<device_id>/dose-events
```

## Local Backend URL

When testing with a real ESP32, `localhost` will not work because `localhost` means the ESP32 itself.

Use your computer IP address instead:

```text
http://YOUR_COMPUTER_IP:5000
```

On Windows, find it with:

```powershell
ipconfig
```

Look for the IPv4 address on your Wi-Fi adapter.

## Backend Device Key

For basic protection, set this in `backend/.env`:

```text
DEVICE_API_KEY=choose-a-long-random-key
```

Then copy the same key into `firmware/smart_pillbox_esp32/config.h`.

## Next Firmware Step

After schedule fetching and reed-switch reading works, add:

- NTP time sync
- schedule time comparison
- active 2-hour dose window
- second alert after 15 minutes
- POST taken/missed dose events

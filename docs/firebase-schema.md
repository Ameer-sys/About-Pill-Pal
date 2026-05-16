# Firebase Schema

## Collections

```text
users/{userId}
devices/{deviceId}
devices/{deviceId}/compartments/{compartmentId}
devices/{deviceId}/doseEvents/{eventId}
```

## users/{userId}

```json
{
  "email": "user@example.com",
  "displayName": "Bheesha",
  "caregiverEmail": "caregiver@example.com",
  "caregiverEnabled": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## devices/{deviceId}

```json
{
  "ownerId": "firebase-auth-user-id",
  "name": "My Smart Pillbox",
  "online": true,
  "lastSeen": "timestamp",
  "timezone": "America/New_York",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## devices/{deviceId}/compartments/{compartmentId}

```json
{
  "compartmentId": 1,
  "medicationName": "Vitamin D",
  "time": "09:00",
  "enabled": true,
  "repeatDaily": true,
  "status": "scheduled",
  "updatedAt": "timestamp"
}
```

## devices/{deviceId}/doseEvents/{eventId}

```json
{
  "compartmentId": 1,
  "medicationName": "Vitamin D",
  "scheduledTime": "09:00",
  "status": "taken",
  "openedAt": "timestamp",
  "date": "2026-05-12",
  "createdAt": "timestamp"
}
```

Allowed `status` values:

- `taken`
- `missed`

## Security Rule Direction

- Users can read/write their own profile.
- Users can read/write devices where `ownerId == request.auth.uid`.
- ESP32 should not use broad client credentials. It should communicate through the Python API.

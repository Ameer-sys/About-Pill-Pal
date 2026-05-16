# Software Design Document

## Scope

The Smart Pillbox MVP supports 5 independent compartments. Each compartment can store a medication or supplement name and one daily reminder time. At the scheduled time, the hardware alerts the user with the compartment LED, buzzer, and vibration motors. If the correct compartment opens within the active window, the dose is logged as taken. If no opening occurs within 2 hours, it is logged as missed and notifications are sent.

## Main Users

- Primary user: the person taking medication or supplements
- Optional caregiver: receives missed-dose email alerts only when configured

## Core Requirements

- Email/password signup and login
- 5 compartment dashboard cards
- Medication name and daily time per compartment
- Device connected/offline indicator
- Dose history with taken and missed status
- Missed-dose user notification and email
- Optional caregiver email for missed doses
- ESP32 schedule fetching
- Reed-switch based automatic logging

## Alert Rules

- Initial alert at scheduled time
- Correct LED on for 1 minute
- Buzzer: 10 beeps
- Vibration: 10 pulses
- Second buzzer alert after 15 minutes
- Missed after 2 hours if no correct compartment opening occurs
- Alerts stop immediately when the correct compartment is opened inside the active window

## System Architecture

```text
React dashboard
  -> Firebase Auth
  -> Firestore schedules/logs
  -> Python FastAPI device API
  -> ESP32 hardware
```

Firebase remains the source of truth. The Python API gives the ESP32 a safer and simpler way to fetch schedules and post dose events without exposing Firebase client behavior directly in firmware.

## MVP Completion Criteria

- User can create an account and log in
- User can set, edit, and clear compartment schedules
- ESP32 can fetch schedule data
- Correct LED, buzzer, and vibration trigger at the scheduled time
- Reed switch opening logs taken dose
- Missed window logs missed dose
- Dashboard updates with recent activity
- Demo mode can compress time windows for presentation

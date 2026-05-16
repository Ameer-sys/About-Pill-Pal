# Demo Plan

## Demo Goal

Show the full medication loop in a compressed timeline:

1. Create or log into account.
2. Set compartment 1 to trigger soon.
3. Hardware fetches schedule.
4. LED 1 turns on, buzzer beeps, motors vibrate.
5. Open compartment 1.
6. Dashboard shows taken event.
7. Repeat with a missed-dose simulation.

## Demo Mode Timing

Use short values only for the demo:

- Initial alert: immediate at scheduled demo time
- Second alert: 15 seconds
- Missed window: 30-60 seconds

Production values:

- Second alert: 15 minutes
- Missed window: 2 hours

## Script

Opening:

"This is a 5-compartment smart pillbox designed for medication and supplement routines. The important part is that it does not only remind the user; it confirms whether the correct compartment was opened."

Live flow:

"I set a reminder in the dashboard. The ESP32 receives it, alerts with light, sound, and vibration, then waits for the reed switch. When the compartment opens, the dose is logged automatically."

Missed flow:

"If the user does not open the compartment inside the active window, the dose is marked missed and the user or caregiver can be notified."

Close:

"The MVP proves the full loop: schedule, alert, detect, log, and notify."

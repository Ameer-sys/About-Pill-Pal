# Job Hunter Copilot MVP Architecture

## Product Goal

Build a local-first desktop app that helps the user discover Ontario IT co-op and internship roles, tailor a resume and optional cover letter, review applications, track progress, and schedule follow-ups with approval gates before any external action.

## MVP Principles

- The app is desktop-first and optimized for a single primary user.
- External actions always require approval.
- Tailored artifacts are generated from one master resume.
- Application outputs should be rendered to both DOCX and PDF, but submissions prefer PDF.
- Gmail and Google Calendar are the primary productivity integrations for version 1.
- The codebase keeps adapters isolated so additional providers can be added without touching the UI.

## Architecture

- `Electron` shell for desktop packaging and native filesystem access.
- `React + TypeScript` renderer for the interface.
- `IPC bridge` between renderer and main process for trusted actions.
- `Service layer` in the Electron main process for job ingestion, tailoring, application review, tracking, and reminders.
- `JSON file persistence` for the initial scaffold so the MVP can run locally without a database migration.

## Main Domains

- `Search`: provider adapters, filtering, deduplication, legitimacy heuristics, and match scoring.
- `Resume tailoring`: intake of master resume, extraction, prompt construction, artifact generation requests, and review summaries.
- `Applications`: status tracking, deadlines, notes, and source links.
- `Follow-ups`: draft generation, approval queue, Gmail send path, and Calendar reminders.
- `Preferences`: provider credentials, filters, and automation defaults.

## Safety

- No fully automatic application submission without a review state marked approved by the user.
- No email send without explicit approval.
- Providers can be disabled individually.
- All generated artifacts and application logs remain local by default.

## Likely Next Build Steps

1. Replace stubbed provider adapters with Playwright-backed site connectors where permitted.
2. Add DOCX/PDF parsing and export.
3. Add OAuth flows for Gmail and Google Calendar.
4. Add encryption for locally stored credentials.
5. Add real background reminders and system notifications.


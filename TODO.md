# Technical debt

Items identified during the July 2026 API contract alignment session that were out of scope and left for a future sprint.

---

## Mocked stores — not connected to real backend endpoints

The following stores initialize with hardcoded static data instead of fetching from the API. They compile and render correctly but display fake data in production.

### `src/gym/application/equipment.store.js`
- State is initialized with a hardcoded equipment array.
- `GET /equipments` exists in `equipment-api.js` but is never called on mount.
- **Action needed:** call `api.getAll()` on store init (or from the equipment-management view's `onMounted`), replace the fake seed data.

### `src/analytics/application/analytics.store.js`
- Usage stats, equipment data, ROI projections, and maintenance quotes are all static/computed from hardcoded values.
- Four API classes exist (`activity-report-api.js`, `roi-projection-api.js`, `maintenance-quote-api.js`, `analytics-api.js`) but none are called from the store.
- **Action needed:** wire each API class to its store action; replace hardcoded datasets with real responses.

### `src/monitoring/application/iot.store.js`
- IoT device list is seeded with hardcoded fake devices.
- `GET /iot-devices` exists in `iot-api.js` but is not called on load.
- **Action needed:** call `api.getAll()` on store init and replace the seed data.

### `src/dashboard/application/dashboard.store.js`
- KPIs and chart data are derived from the mocked equipment and maintenance stores above.
- Will automatically improve once the equipment and maintenance stores are connected to real data.
- `dashboard-api.js` calls `GET /usage_sessions` (note: underscore, inconsistent with the rest of the API path conventions — verify correct path with backend).

---

## Other notes

- `src/profiles/infrastructure/profiles-api.js` — `POST /profiles/admins` creates an admin directly, bypassing the new `register-business` onboarding flow. This endpoint requires an existing Admin JWT to call, so it is unreachable for real onboarding. Mark for removal or restrict to internal/dev tooling only.

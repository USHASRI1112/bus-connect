# Bus Connect Backend

## Setup

1. Create a local Postgres database named `bus_connect`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL` if needed.
3. Install dependencies with `npm install` inside this folder.
4. Start the API with `npm start`.

If you need to create the database locally, one quick option is:

```bash
createdb bus_connect
```

## Run From Repo Root

- Backend only: `npm run backend`
- Expo app: `npm start`
- If you want both at once, start the backend first, then start Expo in a second terminal.

## API

- `GET /health`
- `GET /api/trips`
- `POST /api/trips` - Creates a trip unless the service number already exists, in which case it returns the existing trip.
- `GET /api/trips/:tripId/discussion`
- `POST /api/trips/:tripId/updates`

## Notes

- The backend uses Postgres now, but all data access is isolated in `src/stores/postgresTripStore.js`.
- That store can later be replaced with a Firebase-backed store without changing the route layer.
- Every app request must include `x-client-session-id`. The frontend stores this locally and reuses it on repeat opens.
- Trip passengers are stored in `trip_passengers` with `(trip_id, client_session_id)` uniqueness so the same device reuses the same passenger on repeat opens.
- Trip updates are stored on the `trips.updates` JSONB array, so each update keeps `passengerName`, `content`, and `createdAt` together.
- Trips are archived after 24 hours, remain read-only while archived, and are hard-deleted after 48 hours.

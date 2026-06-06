CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  service_number TEXT NOT NULL,
  bus_name TEXT NULL,
  trip_date DATE NOT NULL,
  passenger_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ NULL,
  updates JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS updates JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS trip_updates (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  passenger_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_passengers (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  client_session_id TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_service_number ON trips(service_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_service_number_unique ON trips(service_number);
CREATE INDEX IF NOT EXISTS idx_trips_trip_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_archived_at ON trips(archived_at);
CREATE INDEX IF NOT EXISTS idx_trip_updates_trip_id_created_at ON trip_updates(trip_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_passengers_trip_session_unique ON trip_passengers(trip_id, client_session_id);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_trip_id ON trip_passengers(trip_id);

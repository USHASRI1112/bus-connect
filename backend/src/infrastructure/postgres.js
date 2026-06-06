const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function createPool() {
  const connectionString =
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/bus_connect';

  return new Pool({
    connectionString,
  });
}

async function ensureSchema(pool) {
  const schemaPath = path.join(__dirname, '../../sql/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schemaSql);

  await pool.query(`
    WITH legacy_updates AS (
      SELECT
        trip_id,
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'passengerName', passenger_name,
            'content', content,
            'createdAt', created_at
          )
          ORDER BY created_at ASC
        ) AS updates
      FROM trip_updates
      GROUP BY trip_id
    )
    UPDATE trips
    SET updates = COALESCE(trips.updates, '[]'::jsonb) || legacy_updates.updates
    FROM legacy_updates
    WHERE trips.id = legacy_updates.trip_id
      AND jsonb_array_length(COALESCE(trips.updates, '[]'::jsonb)) = 0
  `);
}

module.exports = {
  createPool,
  ensureSchema,
};

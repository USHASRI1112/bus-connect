const { buildUpdateContent } = require('../domain/updateContent');
const { createPool, ensureSchema } = require('../infrastructure/postgres');
const { syncTripLifecycle } = require('./postgresTripStore.lifecycle');
const {
  createPassengerName,
  createWhereClause,
  normalizeBusName,
  normalizePassengerRow,
  normalizeServiceNumber,
  normalizeTrip,
  normalizeStoredUpdates,
} = require('./postgresTripStore.helpers');

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withTransaction(pool, handler) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const value = await handler(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failures so the original error can surface.
    }

    throw error;
  } finally {
    client.release();
  }
}

async function getOrCreatePassenger(client, tripId, clientSessionId) {
  await client.query(
    `
    SELECT id
    FROM trips
    WHERE id = $1
    FOR UPDATE
    `,
    [tripId]
  );

  const existingResult = await client.query(
    `
    SELECT id, trip_id, client_session_id, passenger_name, created_at
    FROM trip_passengers
    WHERE trip_id = $1 AND client_session_id = $2
    LIMIT 1
    `,
    [tripId, clientSessionId]
  );

  const existingRow = existingResult.rows[0];

  if (existingRow) {
    return normalizePassengerRow(existingRow);
  }

  const countResult = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM trip_passengers
    WHERE trip_id = $1
    `,
    [tripId]
  );

  const nextPassengerIndex = Number(countResult.rows[0]?.total ?? 0) + 1;
  const passengerName = createPassengerName(nextPassengerIndex);
  const createdAt = new Date().toISOString();
  const id = createId('passenger');

  const insertResult = await client.query(
    `
    INSERT INTO trip_passengers (id, trip_id, client_session_id, passenger_name, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, trip_id, client_session_id, passenger_name, created_at
    `,
    [id, tripId, clientSessionId, passengerName, createdAt]
  );

  return normalizePassengerRow(insertResult.rows[0]);
}

async function createPostgresTripStore() {
  const pool = createPool();
  await ensureSchema(pool);

  return {
    async listTrips(filters) {
      await syncTripLifecycle(pool);

      const { whereSql, values } = createWhereClause(filters);
      const result = await pool.query(
        `
        SELECT id, service_number, bus_name, trip_date, archived_at
        FROM trips
        ${whereSql}
        ORDER BY trip_date ASC, service_number ASC
        `,
        values
      );

      return result.rows.map(normalizeTrip);
    },

    async getDiscussionSession(tripId, clientSessionId) {
      await syncTripLifecycle(pool);

      return withTransaction(pool, async (client) => {
        const tripResult = await client.query(
          `
          SELECT id, service_number, bus_name, trip_date, passenger_name, archived_at, updates
          FROM trips
          WHERE id = $1
          FOR UPDATE
          `,
          [tripId]
        );

        const tripRow = tripResult.rows[0];

        if (!tripRow) {
          return null;
        }

        const passengerRow = await getOrCreatePassenger(client, tripId, clientSessionId);

        return {
          trip: normalizeTrip(tripRow),
          passengerName: passengerRow.passengerName,
          isArchived: Boolean(tripRow.archived_at),
          updates: normalizeStoredUpdates(tripRow.updates, tripRow.id),
        };
      });
    },

    async addTripUpdate(tripId, clientSessionId, template, detail) {
      await syncTripLifecycle(pool);

      return withTransaction(pool, async (client) => {
        const tripResult = await client.query(
          `
          SELECT id, archived_at, updates
          FROM trips
          WHERE id = $1
          FOR UPDATE
          `,
          [tripId]
        );

        const tripRow = tripResult.rows[0];

        if (!tripRow) {
          return null;
        }

        if (tripRow.archived_at) {
          const error = new Error('Trip is archived and read-only');
          error.code = 'TRIP_ARCHIVED';
          error.statusCode = 403;
          throw error;
        }

        const passengerRow = await getOrCreatePassenger(client, tripId, clientSessionId);

        const content = buildUpdateContent(template, detail);
        const createdAt = new Date().toISOString();
        const id = createId('update');
        const updateEntry = {
          id,
          passengerName: passengerRow.passengerName,
          content,
          createdAt,
        };

        const updateResult = await client.query(
          `
          UPDATE trips
          SET updates = COALESCE(updates, '[]'::jsonb) || $2::jsonb
          WHERE id = $1
          RETURNING updates
          `,
          [tripId, JSON.stringify([updateEntry])]
        );

        const storedUpdates = normalizeStoredUpdates(updateResult.rows[0]?.updates, tripId);
        return storedUpdates[storedUpdates.length - 1] ?? null;
      });
    },

    async createOrOpenTrip({ busName, serviceNumber, tripDate }, clientSessionId) {
      await syncTripLifecycle(pool);

      const normalizedServiceNumber = normalizeServiceNumber(serviceNumber);
      const normalizedBusName = normalizeBusName(busName);

      try {
        return await withTransaction(pool, async (client) => {
          const existingResult = await client.query(
            `
            SELECT id, service_number, bus_name, trip_date, archived_at, updates
            FROM trips
            WHERE service_number = $1
            LIMIT 1
            FOR UPDATE
            `,
            [normalizedServiceNumber]
          );

          const existingRow = existingResult.rows[0];

          if (existingRow) {
            await getOrCreatePassenger(client, existingRow.id, clientSessionId);
            return normalizeTrip(existingRow);
          }

          const passengerName = createPassengerName(1);
          const createdAt = new Date().toISOString();
          const tripId = createId('trip');

          const insertResult = await client.query(
            `
            INSERT INTO trips (id, service_number, bus_name, trip_date, passenger_name, created_at, updates)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
            RETURNING id, service_number, bus_name, trip_date, archived_at, updates
            `,
            [
              tripId,
              normalizedServiceNumber,
              normalizedBusName,
              tripDate,
              passengerName,
              createdAt,
              '[]',
            ]
          );

          await getOrCreatePassenger(client, tripId, clientSessionId);

          return normalizeTrip(insertResult.rows[0]);
        });
      } catch (error) {
        if (error && error.code === '23505') {
          return withTransaction(pool, async (client) => {
            const existingResult = await client.query(
              `
              SELECT id, service_number, bus_name, trip_date, archived_at, updates
              FROM trips
              WHERE service_number = $1
              LIMIT 1
              FOR UPDATE
              `,
              [normalizedServiceNumber]
            );

            const existingRow = existingResult.rows[0];

            if (!existingRow) {
              throw error;
            }

            await getOrCreatePassenger(client, existingRow.id, clientSessionId);
            return normalizeTrip(existingRow);
          });
        }

        throw error;
      }
    },

    async close() {
      await pool.end();
    },
  };
}

module.exports = {
  createPostgresTripStore,
};

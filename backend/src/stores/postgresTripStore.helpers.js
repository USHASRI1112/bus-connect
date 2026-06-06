function normalizeTrip(row) {
  const tripDate = row.trip_date instanceof Date ? row.trip_date : new Date(row.trip_date);

  return {
    id: row.id,
    serviceNumber: row.service_number,
    busName: row.bus_name ?? undefined,
    date: tripDate.toISOString().slice(0, 10),
    isArchived: Boolean(row.archived_at),
  };
}

function normalizeStoredUpdate(entry, tripId, index) {
  const createdAt = entry.createdAt ?? entry.created_at ?? entry.time ?? new Date().toISOString();

  return {
    id: entry.id ?? `${tripId}-update-${index}`,
    tripId,
    passengerName: entry.passengerName ?? entry.passenger_name ?? 'Passenger',
    content: entry.content ?? '',
    time: createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString(),
  };
}

function normalizeStoredUpdates(entries, tripId) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry, index) => normalizeStoredUpdate(entry, tripId, index));
}

function normalizePassengerRow(row) {
  return {
    id: row.id,
    tripId: row.trip_id,
    clientSessionId: row.client_session_id,
    passengerName: row.passenger_name,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

function createWhereClause(filters) {
  const clauses = [];
  const values = [];

  if (filters.date) {
    values.push(filters.date);
    clauses.push(`trip_date = $${values.length}`);
  }

  if (filters.serviceNumber) {
    values.push(`%${filters.serviceNumber}%`);
    clauses.push(`service_number ILIKE $${values.length}`);
  }

  if (filters.busName) {
    values.push(`%${filters.busName}%`);
    clauses.push(`bus_name ILIKE $${values.length}`);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereSql, values };
}

function normalizeServiceNumber(serviceNumber) {
  return serviceNumber.trim();
}

function normalizeBusName(busName) {
  const value = busName.trim();
  return value.length > 0 ? value : null;
}

function createPassengerName(index) {
  return `Passenger #${index}`;
}

module.exports = {
  createWhereClause,
  createPassengerName,
  normalizeBusName,
  normalizeServiceNumber,
  normalizeTrip,
  normalizePassengerRow,
  normalizeStoredUpdate,
  normalizeStoredUpdates,
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return new Date(value);
}

function toIsoString(value) {
  const dateValue = toDateValue(value);
  return dateValue ? dateValue.toISOString() : new Date().toISOString();
}

function normalizeTripData(id, data) {
  return {
    id,
    serviceNumber: data.serviceNumber,
    busName: data.busName ?? undefined,
    date: String(data.tripDate).slice(0, 10),
    isArchived: Boolean(data.archivedAt),
  };
}

function normalizeUpdateEntry(entry, tripId, index) {
  return {
    id: entry.id || `${tripId}-update-${index}`,
    tripId,
    passengerName: entry.passengerName || entry.passenger_name || "Passenger",
    content: entry.content || "",
    time: toIsoString(entry.createdAt || entry.created_at || entry.time),
  };
}

function normalizeUpdates(entries, tripId) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry, index) => normalizeUpdateEntry(entry, tripId, index));
}

function normalizePassengerData(id, data) {
  return {
    id,
    tripId: data.tripId,
    clientSessionId: data.clientSessionId,
    passengerName: data.passengerName,
    createdAt: toIsoString(data.createdAt),
  };
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
  createId,
  createPassengerName,
  normalizeBusName,
  normalizePassengerData,
  normalizeServiceNumber,
  normalizeTripData,
  normalizeUpdates,
  toDateValue,
};

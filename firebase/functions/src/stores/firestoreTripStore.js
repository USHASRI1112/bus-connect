const { buildUpdateContent } = require("../domain/updateContent");
const {
  getFirestore,
  getPassengerDocRef,
  getServiceNumberDocRef,
  getTripDocRef,
} = require("../infrastructure/firestore");
const { syncTripLifecycle } = require("./firestoreTripStore.lifecycle");
const {
  createId,
  createPassengerName,
  normalizeBusName,
  normalizePassengerData,
  normalizeServiceNumber,
  normalizeTripData,
  normalizeUpdates,
} = require("./firestoreTripStore.helpers");

function normalizeFilterValue(value) {
  return value.trim().toLowerCase();
}

async function getOrCreatePassenger(transaction, db, tripId, clientSessionId) {
  const tripRef = getTripDocRef(db, tripId);
  const passengerRef = getPassengerDocRef(db, tripId, clientSessionId);

  const passengerSnap = await transaction.get(passengerRef);
  if (passengerSnap.exists) {
    return normalizePassengerData(passengerSnap.id, passengerSnap.data());
  }

  const tripSnap = await transaction.get(tripRef);
  if (!tripSnap.exists) {
    return null;
  }

  const tripData = tripSnap.data();
  const nextPassengerNumber = Number(tripData.nextPassengerNumber || 1);
  const passengerName = createPassengerName(nextPassengerNumber);
  const createdAt = new Date();

  transaction.set(passengerRef, {
    clientSessionId,
    createdAt,
    passengerName,
    tripId,
  });

  transaction.update(tripRef, {
    nextPassengerNumber: nextPassengerNumber + 1,
  });

  return normalizePassengerData(passengerRef.id, {
    clientSessionId,
    createdAt,
    passengerName,
    tripId,
  });
}

async function createFirestoreTripStore() {
  const db = getFirestore();

  return {
    async listTrips(filters) {
      await syncTripLifecycle(db);

      const snapshot = await db.collection("trips").get();
      const normalizedFilters = {
        busName: normalizeFilterValue(filters.busName || ""),
        date: normalizeFilterValue(filters.date || ""),
        serviceNumber: normalizeFilterValue(filters.serviceNumber || ""),
      };

      return snapshot.docs
        .map((doc) => normalizeTripData(doc.id, doc.data()))
        .filter((trip) => {
          const dateMatches = normalizedFilters.date ? trip.date === normalizedFilters.date : true;
          const serviceMatches = normalizedFilters.serviceNumber
            ? trip.serviceNumber.toLowerCase().includes(normalizedFilters.serviceNumber)
            : true;
          const busMatches = normalizedFilters.busName
            ? (trip.busName || "").toLowerCase().includes(normalizedFilters.busName)
            : true;

          return dateMatches && serviceMatches && busMatches;
        })
        .sort((left, right) => {
          if (left.date === right.date) {
            return left.serviceNumber.localeCompare(right.serviceNumber);
          }

          return left.date.localeCompare(right.date);
        });
    },

    async getDiscussionSession(tripId, clientSessionId) {
      await syncTripLifecycle(db);

      return db.runTransaction(async (transaction) => {
        const tripRef = getTripDocRef(db, tripId);
        const tripSnap = await transaction.get(tripRef);

        if (!tripSnap.exists) {
          return null;
        }

        const passenger = await getOrCreatePassenger(transaction, db, tripId, clientSessionId);
        const tripData = tripSnap.data();

        return {
          trip: normalizeTripData(tripSnap.id, tripData),
          passengerName: passenger ? passenger.passengerName : "Passenger",
          isArchived: Boolean(tripData.archivedAt),
          updates: normalizeUpdates(tripData.updates, tripSnap.id),
        };
      });
    },

    async addTripUpdate(tripId, clientSessionId, template, detail) {
      await syncTripLifecycle(db);

      return db.runTransaction(async (transaction) => {
        const tripRef = getTripDocRef(db, tripId);
        const tripSnap = await transaction.get(tripRef);

        if (!tripSnap.exists) {
          return null;
        }

        const tripData = tripSnap.data();

        if (tripData.archivedAt) {
          const error = new Error("Trip is archived and read-only");
          error.code = "TRIP_ARCHIVED";
          error.statusCode = 403;
          throw error;
        }

        const passenger = await getOrCreatePassenger(transaction, db, tripId, clientSessionId);
        const content = buildUpdateContent(template, detail);
        const updateEntry = {
          content,
          createdAt: new Date().toISOString(),
          id: createId("update"),
          passengerName: passenger ? passenger.passengerName : "Passenger",
        };
        const currentUpdates = Array.isArray(tripData.updates) ? tripData.updates : [];

        transaction.update(tripRef, {
          updates: [updateEntry, ...currentUpdates],
        });

        return normalizeUpdates([updateEntry], tripId)[0];
      });
    },

    async createOrOpenTrip({ busName, serviceNumber, tripDate }, clientSessionId) {
      await syncTripLifecycle(db);

      const normalizedServiceNumber = normalizeServiceNumber(serviceNumber);
      const normalizedBusName = normalizeBusName(busName);
      const serviceNumberRef = getServiceNumberDocRef(db, normalizedServiceNumber);

      return db.runTransaction(async (transaction) => {
        const serviceNumberSnap = await transaction.get(serviceNumberRef);

        if (serviceNumberSnap.exists) {
          const existingTripId = serviceNumberSnap.data().tripId;
          const existingTripRef = getTripDocRef(db, existingTripId);
          const existingTripSnap = await transaction.get(existingTripRef);

          if (!existingTripSnap.exists) {
            transaction.delete(serviceNumberRef);
          } else {
            await getOrCreatePassenger(transaction, db, existingTripId, clientSessionId);
            return normalizeTripData(existingTripSnap.id, existingTripSnap.data());
          }
        }

        const tripId = createId("trip");
        const now = new Date();
        const passengerName = createPassengerName(1);
        const tripData = {
          archivedAt: null,
          busName: normalizedBusName,
          createdAt: now,
          id: tripId,
          nextPassengerNumber: 2,
          passengerName,
          serviceNumber: normalizedServiceNumber,
          tripDate,
          updates: [],
        };

        const tripRef = getTripDocRef(db, tripId);

        transaction.set(tripRef, tripData);
        transaction.set(serviceNumberRef, {
          createdAt: now,
          serviceNumber: normalizedServiceNumber,
          tripId,
        });

        const passengerRef = getPassengerDocRef(db, tripId, clientSessionId);
        transaction.set(passengerRef, {
          clientSessionId,
          createdAt: now,
          passengerName,
          tripId,
        });

        return normalizeTripData(tripId, tripData);
      });
    },

    async syncTripLifecycle() {
      await syncTripLifecycle(db);
    },

    async close() {
      // Firestore admin SDK does not require explicit close.
    },
  };
}

module.exports = {
  createFirestoreTripStore,
};

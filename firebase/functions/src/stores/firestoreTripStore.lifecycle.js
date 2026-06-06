const { getServiceNumberDocRef } = require("../infrastructure/firestore");
const { toDateValue } = require("./firestoreTripStore.helpers");

function isArchivedData(data) {
  return data.archivedAt != null;
}

async function deleteTripPassengers(db, tripId, batch) {
  const passengersSnapshot = await db
    .collection("tripPassengers")
    .where("tripId", "==", tripId)
    .get();

  passengersSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
}

async function syncTripLifecycle(db) {
  const tripsSnapshot = await db.collection("trips").get();
  const now = new Date();
  const archiveThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const deleteThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const batch = db.batch();
  let hasWrites = false;

  for (const tripDoc of tripsSnapshot.docs) {
    const data = tripDoc.data();
    const createdAt = toDateValue(data.createdAt);

    if (!createdAt) {
      continue;
    }

    if (createdAt <= deleteThreshold) {
      await deleteTripPassengers(db, tripDoc.id, batch);
      if (data.serviceNumber) {
        batch.delete(getServiceNumberDocRef(db, data.serviceNumber));
      }
      batch.delete(tripDoc.ref);
      hasWrites = true;
      continue;
    }

    if (!isArchivedData(data) && createdAt <= archiveThreshold) {
      batch.update(tripDoc.ref, {
        archivedAt: now,
      });
      hasWrites = true;
    }
  }

  if (hasWrites) {
    await batch.commit();
  }
}

module.exports = {
  syncTripLifecycle,
};

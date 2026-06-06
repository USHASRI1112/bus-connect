const admin = require("firebase-admin");

function getFirestore() {
  return admin.firestore();
}

function getTripDocRef(db, tripId) {
  return db.collection("trips").doc(tripId);
}

function getPassengerDocRef(db, tripId, clientSessionId) {
  return db.collection("tripPassengers").doc(`${tripId}_${clientSessionId}`);
}

function getServiceNumberDocRef(db, serviceNumber) {
  return db.collection("tripServiceNumbers").doc(encodeURIComponent(serviceNumber));
}

module.exports = {
  getFirestore,
  getPassengerDocRef,
  getServiceNumberDocRef,
  getTripDocRef,
};

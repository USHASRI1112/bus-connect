const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");

const { createApiApp } = require("./src/server");
const { createFirestoreTripStore } = require("./src/stores/firestoreTripStore");

admin.initializeApp();

let appPromise;
let storePromise;

function getStore() {
  if (!storePromise) {
    storePromise = createFirestoreTripStore();
  }

  return storePromise;
}

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const store = await getStore();
      return createApiApp(store);
    })();
  }

  return appPromise;
}

exports.api = onRequest(async (req, res) => {
  const app = await getApp();
  return app(req, res);
});

exports.cleanupTrips = onSchedule("every 60 minutes", async () => {
  const store = await getStore();
  await store.syncTripLifecycle();
});

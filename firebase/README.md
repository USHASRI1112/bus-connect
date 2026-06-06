# Firebase Backend Copy

This folder is the Firestore + Cloud Functions version of the backend. The original `backend/` folder stays untouched.

## What is implemented

- Firestore-backed trips
- Trip-specific passenger records keyed by a persistent client session id
- Trip updates stored inside the trip document
- Archive after 24 hours
- Delete after 48 hours
- HTTP API exported as a Firebase Cloud Function
- Scheduled cleanup function for lifecycle maintenance

## Run locally with emulators

From the `firebase/` folder:

```bash
firebase emulators:start --only functions,firestore
```

The HTTP function will be available through the Firebase emulator URL.

For this project, the default project id is:

```text
cricket-prediction-app-a0f1c
```

So the functions emulator base URL will be similar to:

```text
http://127.0.0.1:5001/cricket-prediction-app-a0f1c/us-central1/api
```

## Test the app against the emulator

Set the Expo API base URL before starting the app:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:5001/cricket-prediction-app-a0f1c/us-central1/api
```

Then start Expo as usual.

## Deploy later

When you are ready for step 9, deploy from the `firebase/` folder:

```bash
firebase deploy --only functions,firestore
```

If you later add Hosting rewrites, deploy that too:

```bash
firebase deploy --only functions,firestore,hosting
```

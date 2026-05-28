import { initializeApp } from "firebase/app";
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Analytics is disabled by default until the user gives GDPR consent.
// Call enableAnalytics() after consent is granted.
const analytics = getAnalytics(app);
setAnalyticsCollectionEnabled(analytics, false);

export function enableAnalytics() {
  setAnalyticsCollectionEnabled(analytics, true);
}

export function disableAnalytics() {
  setAnalyticsCollectionEnabled(analytics, false);
}

export { app, analytics };

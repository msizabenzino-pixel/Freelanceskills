import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

const isProd = import.meta.env.PROD;
const defaultDevConfig = {
  apiKey: "AIzaSyDA7jqV7SveOCkfllNsQUC-kThK74n4Syk",
  authDomain: "freelanceskills-f5673.firebaseapp.com",
  projectId: "freelanceskills-f5673",
  storageBucket: "freelanceskills-f5673.firebasestorage.app",
  messagingSenderId: "861319822709",
  appId: "1:861319822709:web:d4614e9533baa6f0e6e73c",
  measurementId: "G-50S2H30MDX",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (isProd ? "" : defaultDevConfig.apiKey),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (isProd ? "" : defaultDevConfig.authDomain),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (isProd ? "" : defaultDevConfig.projectId),
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (isProd ? "" : defaultDevConfig.storageBucket),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isProd ? "" : defaultDevConfig.messagingSenderId),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (isProd ? "" : defaultDevConfig.appId),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (isProd ? "" : defaultDevConfig.measurementId),
};

const requiredFirebaseEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const missingFirebaseEnvVars = requiredFirebaseEnvVars.filter((key) => {
  const value = import.meta.env[key];
  return !value || String(value).trim().length === 0;
});

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (typeof window !== "undefined" && isProd && missingFirebaseEnvVars.length > 0) {
  console.error(
    `[Firebase] Missing required environment variables in production: ${missingFirebaseEnvVars.join(", ")}`
  );
}

let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseAnalytics: Analytics | null = null;
let analyticsReady: Promise<Analytics | null> | null = null;
if (isFirebaseConfigured) {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firebaseAuth = getAuth(app);
  firebaseDb = getFirestore(app);

  // Analytics only runs in browser contexts where it is supported.
  if (typeof window !== "undefined") {
    analyticsReady = isSupported()
      .then((supported) => {
        if (!supported) return null;
        firebaseAnalytics = getAnalytics(app);
        return firebaseAnalytics;
      })
      .catch(() => {
        firebaseAnalytics = null;
        return null;
      });
  }
}

export async function trackFirebaseEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (!analyticsReady) return;
  const analytics = await analyticsReady;
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

export { firebaseAuth, firebaseDb, firebaseAnalytics };

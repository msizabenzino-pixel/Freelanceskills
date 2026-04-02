import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDA7jqV7SveOCkfllNsQUC-kThK74n4Syk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "freelanceskills-f5673.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "freelanceskills-f5673",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "freelanceskills-f5673.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "861319822709",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:861319822709:web:d4614e9533baa6f0e6e73c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-50S2H30MDX",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

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

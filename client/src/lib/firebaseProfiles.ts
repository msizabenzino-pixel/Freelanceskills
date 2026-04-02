import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { firebaseDb, isFirebaseConfigured } from "./firebase";

export type JobApplicationProfile = {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  userType: "client" | "freelancer" | "both";
  phoneNumber: string;
  country: string;
  location: string;
  title: string;
  bio: string;
  skills: string[];
  yearsExperience: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function ensureFirebaseDbReady() {
  if (!isFirebaseConfigured || !firebaseDb) {
    throw new Error(
      "Firebase is not configured. Set VITE_FIREBASE_* variables in .env.local."
    );
  }
}

export async function upsertJobApplicationProfile(
  profile: JobApplicationProfile
): Promise<void> {
  ensureFirebaseDbReady();
  const ref = doc(firebaseDb!, "profiles", profile.userId);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...profile,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists()
        ? existing.data().createdAt ?? serverTimestamp()
        : serverTimestamp(),
    },
    { merge: true }
  );
}

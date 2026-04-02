import type { User } from "@shared/models/auth";
import {
  createUserWithEmailAndPassword,
  OAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebase";

function ensureFirebaseReady() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error(
      "Firebase is not configured. Set VITE_FIREBASE_* variables in .env.local."
    );
  }
}

function mapFirebaseUser(user: FirebaseUser): User {
  const fullName = user.displayName?.trim() || "";
  const [firstName = null, ...rest] = fullName ? fullName.split(" ") : [];
  const lastName = rest.length > 0 ? rest.join(" ") : null;

  return {
    id: user.uid,
    email: user.email,
    password: null,
    firstName,
    lastName,
    profileImageUrl: user.photoURL,
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : null,
    updatedAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
  };
}

export async function registerWithEmail(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  ensureFirebaseReady();
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth!,
    data.email,
    data.password
  );
  const displayName = [data.firstName?.trim(), data.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return mapFirebaseUser(credential.user);
}

export async function loginWithEmail(data: {
  email: string;
  password: string;
}): Promise<User> {
  ensureFirebaseReady();
  const credential = await signInWithEmailAndPassword(
    firebaseAuth!,
    data.email,
    data.password
  );
  return mapFirebaseUser(credential.user);
}

export async function loginWithGoogle(): Promise<User> {
  ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(firebaseAuth!, provider);
  return mapFirebaseUser(credential.user);
}

export async function loginWithApple(): Promise<User> {
  ensureFirebaseReady();
  const provider = new OAuthProvider("apple.com");
  const credential = await signInWithPopup(firebaseAuth!, provider);
  return mapFirebaseUser(credential.user);
}

export async function sendFirebaseResetEmail(email: string): Promise<void> {
  ensureFirebaseReady();
  await sendPasswordResetEmail(firebaseAuth!, email);
}

export async function logoutFirebaseUser(): Promise<void> {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

export function mapFirebaseUserOrNull(user: FirebaseUser | null): User | null {
  if (!user) return null;
  return mapFirebaseUser(user);
}

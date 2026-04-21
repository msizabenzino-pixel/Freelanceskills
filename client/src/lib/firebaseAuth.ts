import type { User } from "@shared/models/auth";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  OAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
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

function mapSocialAuthError(error: unknown, provider: "google" | "apple" | "facebook"): Error {
  if (!(error instanceof FirebaseError)) {
    return new Error("Sign-in failed. Please try again.");
  }

  switch (error.code) {
    case "auth/popup-closed-by-user":
      return new Error("Sign-in popup was closed before completing login.");
    case "auth/popup-blocked":
      return new Error("Popup was blocked by the browser. Allow popups and try again.");
    case "auth/network-request-failed":
      return new Error("Network error during sign-in. Check your connection and retry.");
    case "auth/unauthorized-domain":
      return new Error("This domain is not authorized in Firebase Auth. Add localhost to Authorized domains.");
    case "auth/operation-not-allowed":
      return new Error(
        provider === "google"
          ? "Google sign-in is not enabled in Firebase Authentication."
          : provider === "facebook"
          ? "Facebook sign-in is not enabled in Firebase Authentication."
          : "Apple sign-in is not enabled in Firebase Authentication."
      );
    case "auth/account-exists-with-different-credential":
      return new Error("An account with this email exists with a different sign-in method.");
    case "auth/internal-error":
      return new Error(
        provider === "apple"
          ? "Apple sign-in is not fully configured for this environment yet. Use email or Google sign-in for now."
          : "Google sign-in setup is incomplete. Check Firebase provider settings and authorized domains."
      );
    default:
      return new Error(error.message || "Sign-in failed. Please try again.");
  }
}

function mapRegistrationError(error: unknown): Error {
  if (!(error instanceof FirebaseError)) {
    return new Error("Registration failed. Please try again.");
  }
  switch (error.code) {
    case "auth/email-already-in-use":
      return Object.assign(
        new Error("An account already exists with this email address. Try signing in instead."),
        { code: "EMAIL_EXISTS" }
      );
    case "auth/weak-password":
      return Object.assign(
        new Error("Password is too weak. Use at least 6 characters with a mix of letters and numbers."),
        { code: "WEAK_PASSWORD" }
      );
    case "auth/invalid-email":
      return Object.assign(
        new Error("The email address is not valid. Please check and try again."),
        { code: "INVALID_EMAIL" }
      );
    case "auth/network-request-failed":
      return Object.assign(
        new Error("Network error. Please check your connection and try again."),
        { code: "NETWORK_ERROR" }
      );
    case "auth/too-many-requests":
      return Object.assign(
        new Error("Too many attempts. Please wait a few minutes before trying again."),
        { code: "TOO_MANY_REQUESTS" }
      );
    case "auth/operation-not-allowed":
      return Object.assign(
        new Error("Email/password sign-up is not enabled. Please contact support."),
        { code: "NOT_ALLOWED" }
      );
    default:
      return new Error(error.message || "Registration failed. Please try again.");
  }
}

export async function registerWithEmail(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  ensureFirebaseReady();
  try {
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
      try {
        await updateProfile(credential.user, { displayName });
      } catch (profileErr) {
        // Non-fatal — the Firebase account is already created.
        // Display name can be updated later in the profile wizard.
        console.warn("[registerWithEmail] updateProfile non-fatal:", profileErr);
      }
    }
    return mapFirebaseUser(credential.user);
  } catch (error) {
    throw mapRegistrationError(error);
  }
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

export type SocialAuthResult = { user: User; isNewUser: boolean };

export async function loginWithGoogle(): Promise<SocialAuthResult> {
  ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const credential = await signInWithPopup(firebaseAuth!, provider);
    const isNew = (credential as any)._tokenResponse?.isNewUser === true;
    return { user: mapFirebaseUser(credential.user), isNewUser: isNew };
  } catch (error) {
    throw mapSocialAuthError(error, "google");
  }
}

export async function loginWithFacebook(): Promise<SocialAuthResult> {
  ensureFirebaseReady();
  const provider = new FacebookAuthProvider();
  provider.addScope("email");
  try {
    const credential = await signInWithPopup(firebaseAuth!, provider);
    const isNew = (credential as any)._tokenResponse?.isNewUser === true;
    return { user: mapFirebaseUser(credential.user), isNewUser: isNew };
  } catch (error) {
    throw mapSocialAuthError(error, "facebook");
  }
}

export async function loginWithApple(): Promise<SocialAuthResult> {
  ensureFirebaseReady();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  try {
    const credential = await signInWithPopup(firebaseAuth!, provider);
    const isNew = (credential as any)._tokenResponse?.isNewUser === true;
    return { user: mapFirebaseUser(credential.user), isNewUser: isNew };
  } catch (error) {
    throw mapSocialAuthError(error, "apple");
  }
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

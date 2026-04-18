import { useEffect, useState, useRef } from "react";
import type { User } from "@shared/models/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { logoutFirebaseUser, mapFirebaseUserOrNull } from "@/lib/firebaseAuth";

/**
 * Synchronises the Firebase auth state into the Express session.
 * This bridges the Firebase client auth ↔ server isAuthenticated middleware.
 * Called once per auth state change (not on every render).
 */
async function syncFirebaseSession(firebaseUser: import("firebase/auth").User): Promise<void> {
  try {
    const idToken = await firebaseUser.getIdToken();
    await fetch("/api/auth/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ uid: firebaseUser.uid, idToken }),
    });
  } catch (err) {
    console.warn("[use-auth] Session sync failed (non-critical):", err);
  }
}

async function clearServerSession(): Promise<void> {
  try {
    await fetch("/api/auth/clear-session", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.warn("[use-auth] Session clear failed (non-critical):", err);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const lastSyncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUserOrNull(firebaseUser));
        // Only sync if this is a new user (not repeated renders)
        if (lastSyncedUid.current !== firebaseUser.uid) {
          lastSyncedUid.current = firebaseUser.uid;
          await syncFirebaseSession(firebaseUser);
        }
      } else {
        setUser(null);
        if (lastSyncedUid.current !== null) {
          lastSyncedUid.current = null;
          await clearServerSession();
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFirebaseUser();
      await clearServerSession();
      lastSyncedUid.current = null;
      setUser(null);
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    logout,
    isLoggingOut,
  };
}

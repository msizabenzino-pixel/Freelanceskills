import { useEffect, useState, useRef } from "react";
import type { User } from "@shared/models/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { logoutFirebaseUser, mapFirebaseUserOrNull } from "@/lib/firebaseAuth";

/**
 * Synchronises a Firebase user's ID token into the Express session.
 * Exported so Auth.tsx can call it immediately after login/register,
 * before navigation — eliminating the race condition that causes 401s.
 */
export async function syncSessionNow(): Promise<void> {
  const fbUser = firebaseAuth?.currentUser;
  if (!fbUser) return;
  try {
    const idToken = await fbUser.getIdToken(/* forceRefresh= */ false);
    const res = await fetch("/api/auth/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ uid: fbUser.uid, idToken }),
    });
    if (!res.ok) {
      // Force-refresh the token once and retry — handles token-expiry edge cases
      const freshToken = await fbUser.getIdToken(true);
      await fetch("/api/auth/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uid: fbUser.uid, idToken: freshToken }),
      });
    }
  } catch (err) {
    console.warn("[syncSessionNow] non-fatal:", err);
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
        // Always sync on first detection of a new UID (covers app reload / tab re-focus)
        if (lastSyncedUid.current !== firebaseUser.uid) {
          lastSyncedUid.current = firebaseUser.uid;
          await syncSessionNow();
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

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

/**
 * Destroy the server-side session and clear the session cookie.
 * Always resolves — errors are logged but never thrown.
 */
async function clearServerSession(): Promise<void> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      console.warn("[use-auth] /api/auth/logout returned", res.status);
    }
  } catch (err) {
    console.warn("[use-auth] clearServerSession failed (non-critical):", err);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResolved, setHasResolved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const lastSyncedUid = useRef<string | null>(null);
  // Guard: while logout is in flight, block onAuthStateChanged from
  // re-authenticating via GET /api/auth/user (which would still succeed
  // if signOut fires before the session is destroyed).
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      // No Firebase — check for a server-side session (email/password users).
      fetch("/api/auth/user", { credentials: "include" })
        .then(async (res) => {
          if (res.ok) {
            const serverUser = await res.json();
            setUser({
              id: serverUser.id,
              email: serverUser.email ?? "",
              firstName: serverUser.firstName ?? null,
              lastName: serverUser.lastName ?? null,
              profileImageUrl: serverUser.profileImageUrl ?? null,
            });
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null))
        .finally(() => {
          setIsLoading(false);
          setHasResolved(true);
        });
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync the Express session FIRST so that any query fired immediately
        // after setUser() already has a valid session cookie. Without this
        // ordering, useProfileStatus fires against /api/profile before the
        // session exists, gets a 401, and shows "No Profile" incorrectly.
        if (lastSyncedUid.current !== firebaseUser.uid) {
          lastSyncedUid.current = firebaseUser.uid;
          await syncSessionNow();
        }
        setUser(mapFirebaseUserOrNull(firebaseUser));
      } else {
        // No Firebase user — but skip re-auth check if logout is in progress.
        // Without this guard, signOut() fires onAuthStateChanged immediately,
        // which races GET /api/auth/user while the session is still live,
        // and re-authenticates the user before the session is destroyed.
        if (!loggingOutRef.current) {
          try {
            const res = await fetch("/api/auth/user", { credentials: "include" });
            if (res.ok) {
              const serverUser = await res.json();
              setUser({
                id: serverUser.id,
                email: serverUser.email ?? "",
                firstName: serverUser.firstName ?? null,
                lastName: serverUser.lastName ?? null,
                profileImageUrl: serverUser.profileImageUrl ?? null,
              });
              setIsLoading(false);
              setHasResolved(true);
              return;
            }
          } catch {
            // network error — fall through to null
          }
        }
        setUser(null);
        if (lastSyncedUid.current !== null) {
          lastSyncedUid.current = null;
          // Only clear server session here if NOT already in logout flow.
          if (!loggingOutRef.current) {
            await clearServerSession();
          }
        }
      }
      setIsLoading(false);
      setHasResolved(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    loggingOutRef.current = true;
    try {
      // 1. Destroy the server session FIRST — before Firebase signOut.
      //    This ensures that when onAuthStateChanged fires, any concurrent
      //    GET /api/auth/user call already returns 401.
      await clearServerSession();

      // 2. Sign out from Firebase (fires onAuthStateChanged, which is now guarded).
      await logoutFirebaseUser();

      lastSyncedUid.current = null;
      setUser(null);

      // 3. Hard-navigate to home — clears all React state and forces a fresh
      //    session check, which will correctly return unauthenticated.
      window.location.href = "/";
    } catch (err) {
      console.error("[logout] error:", err);
      // Still navigate away — user should not be stuck on the page.
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
      loggingOutRef.current = false;
    }
  };

  return {
    user,
    isLoading,
    hasResolved,
    isAuthenticated: Boolean(user),
    logout,
    isLoggingOut,
  };
}

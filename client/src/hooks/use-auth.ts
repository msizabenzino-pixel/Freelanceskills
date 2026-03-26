import { useEffect, useState } from "react";
import type { User } from "@shared/models/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { logoutFirebaseUser, mapFirebaseUserOrNull } from "@/lib/firebaseAuth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(mapFirebaseUserOrNull(firebaseUser));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFirebaseUser();
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

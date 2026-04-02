import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { firebaseDb } from "@/lib/firebase";
import { permissionsForRole } from "@/lib/admin/permissions";
import type { AdminIdentity, AdminPermission, AdminRole } from "@/types/admin";

interface AdminProfileDoc {
  isAdmin?: boolean;
  adminRole?: AdminRole;
  adminPermissions?: AdminPermission[];
  displayName?: string;
}

function parseAllowedAdminEmails(): string[] {
  const raw = String(import.meta.env.VITE_ADMIN_EMAILS || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

async function fetchAdminIdentity(uid: string, email: string | null, defaultName?: string | null): Promise<AdminIdentity> {
  const fallback: AdminIdentity = {
    uid,
    email,
    role: "analyst",
    isAdmin: false,
    permissions: [],
    displayName: defaultName || email || "User",
  };

  const allowList = parseAllowedAdminEmails();
  const isEmailAllowListed = Boolean(email && allowList.includes(email.toLowerCase()));

  if (!firebaseDb) {
    if (isEmailAllowListed) {
      return {
        ...fallback,
        isAdmin: true,
        role: "super_admin",
        permissions: permissionsForRole("super_admin"),
      };
    }
    return fallback;
  }

  try {
    const snap = await getDoc(doc(firebaseDb, "users", uid));
    const data = (snap.exists() ? snap.data() : {}) as AdminProfileDoc;

    const role = data.adminRole || (isEmailAllowListed ? "super_admin" : "analyst");
    const rolePermissions = permissionsForRole(role);
    const explicitPermissions = Array.isArray(data.adminPermissions) ? data.adminPermissions : [];
    const mergedPermissions = Array.from(new Set([...rolePermissions, ...explicitPermissions]));

    const isAdmin = Boolean(data.isAdmin || isEmailAllowListed || role !== "analyst");

    return {
      uid,
      email,
      role,
      isAdmin,
      permissions: isAdmin ? mergedPermissions : [],
      displayName: data.displayName || defaultName || email || "Admin",
    };
  } catch {
    if (isEmailAllowListed) {
      return {
        ...fallback,
        isAdmin: true,
        role: "super_admin",
        permissions: permissionsForRole("super_admin"),
      };
    }
    return fallback;
  }
}

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useAuth();
  const freeMode = import.meta.env.VITE_ADMIN_FREE_MODE === "true";

  const query = useQuery({
    queryKey: ["admin", "identity", user?.id],
    queryFn: () => fetchAdminIdentity(user!.id, user?.email ?? null, user?.firstName ?? null),
    enabled: Boolean(user?.id),
  });

  const identity = query.data;
  const freeModeIdentity: AdminIdentity | null = freeMode
    ? {
        uid: user?.id || "admin-free-mode",
        email: user?.email || "admin-free-mode@local",
        role: "super_admin",
        isAdmin: true,
        permissions: permissionsForRole("super_admin"),
        displayName: user?.firstName || user?.email || "Admin (Free Mode)",
      }
    : null;

  return useMemo(
    () => ({
      identity: freeModeIdentity || identity,
      isLoading: freeMode ? false : authLoading || query.isLoading,
      isAuthenticated: freeMode ? true : Boolean(user?.id),
      isAdmin: freeMode ? true : Boolean(identity?.isAdmin),
      permissions: freeMode ? permissionsForRole("super_admin") : identity?.permissions || [],
      role: freeMode ? "super_admin" : identity?.role || null,
      user,
    }),
    [authLoading, query.isLoading, identity, freeMode, freeModeIdentity, user]
  );
}

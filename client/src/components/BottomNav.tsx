import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Home, MessageCircle, Search, ClipboardList, User, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";

const ACTIVE = "#10b981";
const INACTIVE = "#6B7280";

// Routes where the bottom nav must NOT appear (auth + onboarding flows)
const HIDDEN_PREFIXES = [
  "/auth",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/cv-upload",
  "/profile-builder",
  "/client-onboarding",
];

interface Tab {
  label: string;
  href: string;
  icon: LucideIcon;
  fillWhenActive: boolean;
  match: (loc: string) => boolean;
}

const TABS: Tab[] = [
  { label: "Home", href: "/", icon: Home, fillWhenActive: true, match: (l) => l === "/" },
  { label: "Messages", href: "/messages", icon: MessageCircle, fillWhenActive: true, match: (l) => l.startsWith("/messages") },
  { label: "Search", href: "/search", icon: Search, fillWhenActive: false, match: (l) => l.startsWith("/search") },
  { label: "Orders", href: "/orders", icon: ClipboardList, fillWhenActive: true, match: (l) => l.startsWith("/orders") },
  { label: "Profile", href: "/dashboard", icon: User, fillWhenActive: true, match: (l) => l.startsWith("/dashboard") || l.startsWith("/profile") },
];

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const authed = !!user;
  const hidden = HIDDEN_PREFIXES.some((p) => location === p || location.startsWith(p + "/"));

  // ── Real badge data (only when authenticated + nav visible) ──
  // NOTE: all hooks must run unconditionally (Rules of Hooks). BottomNav is
  // mounted persistently outside the Router, so an early return before these
  // hooks would change the hook count across route changes and crash React.
  const { data: unread } = useQuery<{ count: number }>({
    queryKey: ["/api/conversations/unread-count"],
    queryFn: async () => {
      const res = await apiFetch("/api/conversations/unread-count");
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: authed && !hidden,
    refetchInterval: 30000,
  });

  const { data: bookings } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const res = await apiFetch("/api/bookings");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: authed && !hidden,
    refetchInterval: 60000,
  });

  const { data: readiness } = useQuery<{ score: number; identityVerified?: boolean }>({
    queryKey: ["/api/profile/check-readiness"],
    queryFn: async () => {
      const res = await apiFetch("/api/profile/check-readiness");
      if (!res.ok) return { score: 100, identityVerified: true };
      return res.json();
    },
    enabled: authed && !hidden,
  });

  if (hidden) return null;

  const unreadCount = authed ? unread?.count ?? 0 : 0;
  const pendingOrders = authed && Array.isArray(bookings)
    ? bookings.filter((b) => b?.status === "pending").length
    : 0;
  // Spec C10: red dot when profile completion < 60% OR identity unverified.
  const showProfileDot =
    authed &&
    readiness != null &&
    ((typeof readiness.score === "number" && readiness.score < 60) ||
      readiness.identityVerified === false);

  const badgeFor = (label: string): { count?: number; dot?: boolean } => {
    if (label === "Messages" && unreadCount > 0) return { count: unreadCount };
    if (label === "Orders" && pendingOrders > 0) return { count: pendingOrders };
    if (label === "Profile" && showProfileDot) return { dot: true };
    return {};
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: "#0D1117",
        borderTop: "1px solid #1F2937",
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      data-testid="bottom-nav"
    >
      {TABS.map((tab) => {
        const active = tab.match(location);
        const color = active ? ACTIVE : INACTIVE;
        const Icon = tab.icon;
        const badge = badgeFor(tab.label);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            data-testid={`bottomnav-${tab.label.toLowerCase()}`}
          >
            <span className="relative">
              <Icon
                className="w-6 h-6"
                style={{ color }}
                strokeWidth={active ? 2.4 : 2}
                fill={active && tab.fillWhenActive ? "currentColor" : "none"}
              />
              {badge.count !== undefined && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
                  data-testid={`badge-${tab.label.toLowerCase()}`}
                >
                  {badge.count > 99 ? "99+" : badge.count}
                </span>
              )}
              {badge.dot && (
                <span
                  className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#0D1117]"
                  data-testid="badge-profile-dot"
                />
              )}
            </span>
            <span className="text-[11px] font-medium leading-none" style={{ color }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

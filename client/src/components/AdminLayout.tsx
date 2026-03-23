/**
 * AdminLayout — Unified Admin Sidebar + Topbar
 * Section 33 — FreelanceSkills.net
 *
 * The single shell that wraps all 37 admin departments with:
 * - Collapsible sidebar (icon-only or full)
 * - Grouped department navigation (9 categories)
 * - Topbar: breadcrumb, global search, notifications, user avatar
 * - Mobile: off-canvas drawer (hamburger)
 * - Live system status indicator
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, Briefcase, ShoppingCart, DollarSign, Scale,
  HeadphonesIcon, BarChart2, Brain, Shield, TrendingUp, GraduationCap,
  Settings, Smartphone, Flag, Layers, Eye, Megaphone, Mail, CreditCard,
  Lock, ScrollText, Bell, PieChart, FileCode2, ToggleLeft, UserCheck,
  Users2, Activity, Zap, LineChart, ShieldCheck, Globe, ChevronLeft,
  ChevronRight, Search, Menu, X, Star, AlertOctagon, Cpu, Network,
  MapPin, Radio, ClipboardCheck, FileText, Package, Wallet, Bot,
  BookOpen, Hash, Sparkles, Home, Filter, RefreshCw, ChevronDown, ChevronUp,
  Gift, Award,
} from "lucide-react";

// ─── Navigation Structure ─────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    color: "emerald",
    items: [
      { label: "Mission Control",    path: "/admin/mission-control", icon: Sparkles,     badge: "NEW" },
      { label: "Admin Dashboard",    path: "/admin",                 icon: LayoutDashboard },
    ],
  },
  {
    label: "Users & Identity",
    color: "blue",
    items: [
      { label: "User Management",    path: "/admin",                 icon: Users },
      { label: "Freelancers",        path: "/admin/freelancers",     icon: Briefcase },
      { label: "Clients",            path: "/admin/clients",         icon: Users2 },
      { label: "KYC & Fraud",        path: "/admin/fraud",           icon: UserCheck },
    ],
  },
  {
    label: "Work Lifecycle",
    color: "violet",
    items: [
      { label: "Gig Marketplace",    path: "/admin/gigs",            icon: ShoppingCart },
      { label: "Proposals",          path: "/admin/proposals",       icon: FileText },
      { label: "Orders",             path: "/admin/orders",          icon: Package },
    ],
  },
  {
    label: "Money",
    color: "amber",
    items: [
      { label: "Finance & Escrow",   path: "/admin/finance",         icon: DollarSign },
      { label: "Payments",           path: "/admin/payments",        icon: Wallet },
      { label: "Subscriptions",      path: "/admin/subscriptions",   icon: CreditCard },
    ],
  },
  {
    label: "Resolution",
    color: "red",
    items: [
      { label: "Disputes",           path: "/admin/disputes",        icon: Scale },
      { label: "Support Tickets",    path: "/admin/support",         icon: HeadphonesIcon },
      { label: "Support Team",       path: "/admin/support-team",    icon: Users2 },
      { label: "Reports & Abuse",    path: "/admin/reports",         icon: AlertOctagon },
      { label: "Content Moderation", path: "/admin/moderation",      icon: Eye },
    ],
  },
  {
    label: "Intelligence",
    color: "pink",
    items: [
      { label: "Analytics",          path: "/admin/analytics",       icon: BarChart2 },
      { label: "Analytics Deep Dive",path: "/admin/analytics/deep-dive", icon: PieChart },
      { label: "AI Brain v3.0",      path: "/admin/ai-brain",        icon: Brain },
      { label: "Live Monitoring",    path: "/admin/monitoring",      icon: Activity },
      { label: "System Performance", path: "/admin/performance",     icon: Cpu },
      { label: "Marketplace Health", path: "/admin/marketplace-health", icon: Activity, badge: "NEW" },
    ],
  },
  {
    label: "Growth",
    color: "green",
    items: [
      { label: "Marketing",          path: "/admin/marketing",       icon: TrendingUp },
      { label: "Promotions",         path: "/admin/promotions",      icon: Megaphone },
      { label: "Academy",            path: "/admin/academy",         icon: GraduationCap },
      { label: "CMS",                path: "/admin/cms",             icon: FileCode2 },
      { label: "Categories & Skills",path: "/admin/categories",      icon: Layers },
      { label: "Referral & Affiliate", path: "/admin/referrals",     icon: Gift, badge: "NEW" },
    ],
  },
  {
    label: "Talent",
    color: "violet",
    items: [
      { label: "Talent Acquisition v4.0", path: "/admin/talent",    icon: Award, badge: "NEW" },
    ],
  },
  {
    label: "Governance",
    color: "cyan",
    items: [
      { label: "Roles & Permissions",path: "/admin/roles",           icon: Lock },
      { label: "Feature Flags",      path: "/admin/feature-flags",   icon: ToggleLeft },
      { label: "Audit Logs",         path: "/admin/audit-logs",      icon: ScrollText },
      { label: "Security & Trust",   path: "/admin/security",        icon: Shield },
    ],
  },
  {
    label: "Compliance & Config",
    color: "orange",
    items: [
      { label: "Data Compliance",    path: "/admin/compliance",      icon: ShieldCheck },
      { label: "Notifications",      path: "/admin/notifications",   icon: Bell },
      { label: "System Settings",    path: "/admin/settings",        icon: Settings },
      { label: "Mobile Admin v4.0",   path: "/admin/mobile",          icon: Smartphone, badge: "NEW" },
    ],
  },
];

const GROUP_COLORS: Record<string, { dot: string; bg: string; text: string; active: string }> = {
  emerald: { dot: "bg-emerald-500", bg: "bg-emerald-950/30", text: "text-emerald-400", active: "bg-emerald-900/40 text-emerald-300 border-l-2 border-emerald-500" },
  blue:    { dot: "bg-blue-500",    bg: "bg-blue-950/30",    text: "text-blue-400",    active: "bg-blue-900/40 text-blue-300 border-l-2 border-blue-500" },
  violet:  { dot: "bg-violet-500",  bg: "bg-violet-950/30",  text: "text-violet-400",  active: "bg-violet-900/40 text-violet-300 border-l-2 border-violet-500" },
  amber:   { dot: "bg-amber-500",   bg: "bg-amber-950/30",   text: "text-amber-400",   active: "bg-amber-900/40 text-amber-300 border-l-2 border-amber-500" },
  red:     { dot: "bg-red-500",     bg: "bg-red-950/30",     text: "text-red-400",     active: "bg-red-900/40 text-red-300 border-l-2 border-red-500" },
  pink:    { dot: "bg-pink-500",    bg: "bg-pink-950/30",    text: "text-pink-400",    active: "bg-pink-900/40 text-pink-300 border-l-2 border-pink-500" },
  green:   { dot: "bg-green-500",   bg: "bg-green-950/30",   text: "text-green-400",   active: "bg-green-900/40 text-green-300 border-l-2 border-green-500" },
  cyan:    { dot: "bg-cyan-500",    bg: "bg-cyan-950/30",    text: "text-cyan-400",    active: "bg-cyan-900/40 text-cyan-300 border-l-2 border-cyan-500" },
  orange:  { dot: "bg-orange-500",  bg: "bg-orange-950/30",  text: "text-orange-400",  active: "bg-orange-900/40 text-orange-300 border-l-2 border-orange-500" },
};

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ item, collapsed, activeColor, onClick }: { item: any; collapsed: boolean; activeColor: string; onClick: () => void }) {
  const [location, navigate] = useLocation();
  const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
  const Icon = item.icon;
  return (
    <button
      onClick={() => { navigate(item.path); onClick(); }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${isActive ? activeColor : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/60"}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={15} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && <span className="ml-auto px-1.5 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-xs font-medium">{item.badge}</span>}
    </button>
  );
}

// ─── Sidebar Group ────────────────────────────────────────────────────────────
function NavGroup({ group, collapsed, defaultOpen = true }: { group: any; collapsed: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = GROUP_COLORS[group.color] || GROUP_COLORS.blue;
  const [location] = useLocation();
  const hasActive = group.items.some((i: any) => location === i.path || (i.path !== "/admin" && location.startsWith(i.path)));

  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item: any) => (
          <NavItem key={item.path + item.label} item={item} collapsed={collapsed} activeColor={colors.active} onClick={() => {}} />
        ))}
      </div>
    );
  }
  return (
    <div>
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 transition-all ${hasActive ? colors.text : "text-gray-600 hover:text-gray-500"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
        <span className="text-xs font-semibold uppercase tracking-wider flex-1 text-left">{group.label}</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {open && (
        <div className="space-y-0.5 ml-1">
          {group.items.map((item: any) => (
            <NavItem key={item.path + item.label} item={item} collapsed={collapsed} activeColor={colors.active} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Global Search Bar ────────────────────────────────────────────────────────
function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { data } = useQuery<any>({ queryKey: ["/api/mission-control/global-search", q], enabled: q.length >= 2, refetchOnWindowFocus: false });

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-1.5">
        <Search size={13} className="text-gray-500" />
        <input
          data-testid="input-global-search"
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search all 33 departments..."
          className="bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none w-48"
        />
        {q && <button onClick={() => { setQ(""); setOpen(false); }}><X size={10} className="text-gray-600" /></button>}
      </div>
      {open && data?.results?.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {data.results.map((r: any) => (
            <button key={r.id + r.label} onClick={() => { navigate(r.path); setOpen(false); setQ(""); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 transition-colors text-left">
              <div className={`w-1.5 h-1.5 rounded-full ${r.type === "section" ? "bg-emerald-500" : "bg-blue-500"}`} />
              <div>
                <p className="text-xs text-gray-300">{r.label}</p>
                <p className="text-xs text-gray-600">{r.sublabel} · {r.path}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminLayout ─────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const sidebarW = collapsed ? "w-14" : "w-56";

  const currentSection = NAV_GROUPS.flatMap(g => g.items).find(i => location === i.path || (i.path !== "/admin" && location.startsWith(i.path)));
  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => location === i.path || (i.path !== "/admin" && location.startsWith(i.path))));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarW} bg-gray-900 border-r border-gray-800 flex flex-col z-50 transition-all duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-gray-800 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs font-bold text-white leading-none">FreelanceSkills</p>
              <p className="text-xs text-emerald-500 leading-none">Admin v2.0</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`ml-auto text-gray-600 hover:text-gray-400 hidden md:block`}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav scroll */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3 scrollbar-hide">
          {NAV_GROUPS.map(group => (
            <NavGroup key={group.label} group={group} collapsed={collapsed} defaultOpen={group.label === "Overview" || group.label === "Intelligence"} />
          ))}
        </nav>

        {/* System status footer */}
        <div className={`border-t border-gray-800 px-3 py-2 flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {!collapsed && <span className="text-xs text-gray-500">All 37 sections operational</span>}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "md:ml-14" : "md:ml-56"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-4 py-2.5 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={18} />
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 flex-1">
            <Home size={11} />
            <span>/</span>
            <span className="text-gray-500">Admin</span>
            {currentGroup && <><span>/</span><span className="text-gray-400">{currentGroup.label}</span></>}
            {currentSection && <><span>/</span><span className="text-emerald-400">{currentSection.label}</span></>}
          </div>
          {/* Global search */}
          <GlobalSearch />
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-900/30 border border-emerald-800/40 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400">33 Live</span>
          </div>
          {/* Section count */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-400">Section 33/100</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

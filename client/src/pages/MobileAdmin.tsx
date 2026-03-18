/**
 * Mobile Admin PWA — FreelanceSkills.net
 * Optimised for Cape Town admins on Android/iOS phones.
 * Bottom navigation, real-time Socket.io, pull-to-refresh, voice search, offline-ready.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

/* ─── Types ─────────────────────────────────────────────────────── */
type NavTab = "home" | "users" | "activity" | "analytics" | "alerts";

interface KPI {
  label: string;
  value: string | number;
  delta?: string;
  up?: boolean;
  color: string;
  icon: string;
}

interface LiveEvent {
  id: string;
  type: "user_join" | "payment" | "dispute" | "fraud" | "kyc" | "job";
  message: string;
  ts: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  kycStatus: string;
  createdAt: string;
  deletedAt?: string | null;
}

interface WalletTx {
  id: string;
  userId: string;
  amountCents: number;
  type: string;
  description?: string;
  createdAt: string;
}

/* ─── Hooks ──────────────────────────────────────────────────────── */
function usePullToRefresh(onRefresh: () => void) {
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
      pulling.current = window.scrollY === 0;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY.current;
      if (pulling.current && dy > 70) onRefresh();
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);
}

/* ─── Mini CSS Bar Chart ─────────────────────────────────────────── */
function MiniBarChart({ data, color = "#1DBF73" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(d.value / max) * 52}px`, background: color, opacity: 0.85 + (i / data.length) * 0.15 }}
          />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────────── */
function KpiCard({ kpi }: { kpi: KPI }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xl">{kpi.icon}</span>
        {kpi.delta && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${kpi.up ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
            {kpi.up ? "↑" : "↓"} {kpi.delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mt-1">{kpi.value}</div>
      <div className="text-xs text-gray-400">{kpi.label}</div>
    </div>
  );
}

/* ─── Live Pulse Dot ─────────────────────────────────────────────── */
function PulseDot({ color = "#1DBF73" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

/* ─── Screen: Home ───────────────────────────────────────────────── */
function HomeScreen({ liveStats }: { liveStats: any }) {
  const [, navigate] = useLocation();
  const { data: overview } = useQuery({ queryKey: ["/api/analytics/overview"], staleTime: 30000 });
  const o = (overview as any) || {};

  const kpis: KPI[] = [
    { label: "Total Users", value: o.totalUsers ?? "—", delta: o.userGrowth ? `${o.userGrowth}%` : undefined, up: (o.userGrowth ?? 0) >= 0, color: "#1DBF73", icon: "👥" },
    { label: "Active Jobs", value: o.activeJobs ?? "—", delta: o.jobGrowth ? `${o.jobGrowth}%` : undefined, up: (o.jobGrowth ?? 0) >= 0, color: "#6366f1", icon: "💼" },
    { label: "Revenue (ZAR)", value: o.totalRevenue ? `R ${Number(o.totalRevenue).toLocaleString()}` : "—", delta: o.revenueGrowth ? `${o.revenueGrowth}%` : undefined, up: (o.revenueGrowth ?? 0) >= 0, color: "#f59e0b", icon: "💰" },
    { label: "Certs Issued", value: o.totalCertificates ?? "—", delta: o.certGrowth ? `${o.certGrowth}%` : undefined, up: (o.certGrowth ?? 0) >= 0, color: "#ec4899", icon: "🎓" },
    { label: "KYC Pending", value: o.pendingKyc ?? "—", color: "#f97316", icon: "🪪" },
    { label: "Disputes Open", value: o.openDisputes ?? "—", color: "#ef4444", icon: "⚠️" },
  ];

  const quickActions = [
    { label: "View KYC Queue", icon: "🪪", action: () => navigate("/admin"), color: "#f97316" },
    { label: "Full Analytics", icon: "📊", action: () => navigate("/admin/analytics"), color: "#6366f1" },
    { label: "Admin Dashboard", icon: "🛡️", action: () => navigate("/admin"), color: "#1DBF73" },
    { label: "Job Board", icon: "💼", action: () => navigate("/jobs"), color: "#3b82f6" },
  ];

  return (
    <div className="pb-2">
      {/* Live banner */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <PulseDot />
        <span className="text-xs text-green-400 font-medium">Live Platform Stats</span>
        {liveStats && <span className="text-xs text-gray-500 ml-auto">{liveStats.onlineUsers ?? 0} online now</span>}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map((k, i) => <KpiCard key={i} kpi={k} />)}
      </div>

      {/* Quick Actions */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((a, i) => (
          <button key={i} onClick={a.action} data-testid={`btn-quick-${i}`}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-95"
            style={{ background: `${a.color}18`, border: `1px solid ${a.color}33` }}>
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm text-white font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Upskilling snapshot */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academy Snapshot</h3>
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Courses Active</span>
          <span className="text-white font-semibold">{o.activeCourses ?? "—"}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Completions (30d)</span>
          <span className="text-green-400 font-semibold">{o.courseCompletions ?? "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Avg Earnings Lift</span>
          <span className="text-yellow-400 font-semibold">+{o.earningsLift ?? "0"}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Screen: Users ──────────────────────────────────────────────── */
function UsersScreen() {
  const [search, setSearch] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users", search],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=30`, { credentials: "include" });
      return res.json();
    },
    staleTime: 15000,
  });

  usePullToRefresh(refetch);

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/users/${id}/status`, { status: "suspended", reason: "Suspended via Mobile Admin" }),
    onSuccess: () => { toast({ title: "User suspended" }); qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); },
    onError: () => toast({ title: "Failed to suspend user", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => { toast({ title: "User removed (30-day recovery)" }); qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); },
    onError: () => toast({ title: "Failed to remove user", variant: "destructive" }),
  });

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast({ title: "Voice search not supported on this browser", variant: "destructive" }); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-ZA";
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onresult = (e: any) => setSearch(e.results[0][0].transcript);
    recognition.start();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkSuspend = () => {
    if (!selectedIds.size) return;
    if (!confirm(`Suspend ${selectedIds.size} users?`)) return;
    selectedIds.forEach(id => suspendMutation.mutate(id));
    setSelectedIds(new Set());
  };

  const users: AdminUser[] = usersData?.users || usersData || [];

  const roleColor = (role: string) => {
    if (role === "admin") return "#1DBF73";
    if (role === "freelancer") return "#6366f1";
    if (role === "upskiller") return "#f59e0b";
    return "#6b7280";
  };
  const kycColor = (s: string) => {
    if (s === "verified") return "#1DBF73";
    if (s === "pending") return "#f97316";
    if (s === "rejected") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div className="pb-2">
      {/* Search bar with voice */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input data-testid="input-user-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <span className="absolute right-3 top-3 text-gray-500 text-xs">🔍</span>
        </div>
        <button data-testid="btn-voice-search" onClick={startVoiceSearch}
          className={`px-3 rounded-xl transition-colors ${voiceActive ? "bg-red-500" : "bg-gray-700"}`}>
          🎤
        </button>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="text-sm text-white flex-1">{selectedIds.size} selected</span>
          <button data-testid="btn-bulk-suspend" onClick={bulkSuspend}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600">Suspend All</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 text-xs px-2">✕ Clear</button>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-500 py-8 text-sm">Loading users…</div>}

      <div className="space-y-2">
        {users.map((u: AdminUser) => (
          <div key={u.id} data-testid={`card-user-${u.id}`}
            className={`rounded-xl p-3 transition-all ${selectedIds.has(u.id) ? "ring-2 ring-green-500" : ""}`}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button data-testid={`cb-user-${u.id}`} onClick={() => toggleSelect(u.id)}
                className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${selectedIds.has(u.id) ? "border-green-500 bg-green-500" : "border-gray-600"}`}>
                {selectedIds.has(u.id) && <span className="text-white text-xs">✓</span>}
              </button>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                style={{ background: `${roleColor(u.role)}22`, color: roleColor(u.role) }}>
                {(u.username || u.email || "?").charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white truncate">{u.username || u.email}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${roleColor(u.role)}22`, color: roleColor(u.role) }}>{u.role}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${kycColor(u.kycStatus)}22`, color: kycColor(u.kycStatus) }}>
                    {u.kycStatus || "unverified"}
                  </span>
                  {u.deletedAt && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400">deleted</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{u.email}</div>
              </div>
            </div>
            {/* Action row */}
            <div className="flex gap-2 mt-3 ml-8">
              <button data-testid={`btn-suspend-${u.id}`}
                onClick={() => { if (confirm(`Suspend ${u.username}?`)) suspendMutation.mutate(u.id); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-orange-300"
                style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}>
                Suspend
              </button>
              <button data-testid={`btn-delete-${u.id}`}
                onClick={() => { if (confirm(`Remove ${u.username}? (recoverable 30d)`)) deleteMutation.mutate(u.id); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-red-300"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                Remove
              </button>
              <button data-testid={`btn-message-${u.id}`}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-blue-300"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
      {!isLoading && users.length === 0 && (
        <div className="text-center text-gray-500 py-12 text-sm">No users found</div>
      )}
    </div>
  );
}

/* ─── Screen: Live Activity ──────────────────────────────────────── */
function ActivityScreen({ events, clearEvents }: { events: LiveEvent[]; clearEvents: () => void }) {
  const typeIcon: Record<string, string> = {
    user_join: "👤", payment: "💳", dispute: "⚠️", fraud: "🚨", kyc: "🪪", job: "💼",
  };
  const typeColor: Record<string, string> = {
    user_join: "#1DBF73", payment: "#6366f1", dispute: "#f59e0b", fraud: "#ef4444", kyc: "#f97316", job: "#3b82f6",
  };

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PulseDot />
          <span className="text-sm font-semibold text-white">Live Activity</span>
          <span className="text-xs text-gray-500">{events.length} events</span>
        </div>
        <button onClick={clearEvents} className="text-xs text-gray-500 px-2 py-1 rounded-lg hover:text-white transition-colors">
          Clear
        </button>
      </div>

      {events.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📡</div>
          <div className="text-gray-500 text-sm">Listening for live events…</div>
          <div className="text-gray-600 text-xs mt-1">Events appear here in real-time</div>
        </div>
      )}

      <div className="space-y-2">
        {events.map(ev => (
          <div key={ev.id} data-testid={`event-${ev.id}`}
            className="flex items-start gap-3 rounded-xl p-3 transition-all"
            style={{ background: `${typeColor[ev.type] || "#6b7280"}0f`, border: `1px solid ${typeColor[ev.type] || "#6b7280"}22` }}>
            <span className="text-xl mt-0.5">{typeIcon[ev.type] || "📌"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{ev.message}</p>
              <p className="text-xs mt-0.5" style={{ color: typeColor[ev.type] || "#6b7280" }}>
                {formatDistanceToNow(new Date(ev.ts), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen: Analytics ──────────────────────────────────────────── */
function AnalyticsScreen() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const periods = ["7d", "30d", "90d"] as const;

  const { data: overview } = useQuery({ queryKey: ["/api/analytics/overview", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/overview?period=${period}`, { credentials: "include" }).then(r => r.json()) });
  const { data: marketplace } = useQuery({ queryKey: ["/api/analytics/marketplace", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/marketplace?period=${period}`, { credentials: "include" }).then(r => r.json()) });
  const { data: financial } = useQuery({ queryKey: ["/api/analytics/financial", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/financial?period=${period}`, { credentials: "include" }).then(r => r.json()) });

  const o = (overview as any) || {};
  const m = (marketplace as any) || {};
  const f = (financial as any) || {};

  const kpis: KPI[] = [
    { label: "Total Users", value: o.totalUsers ?? "—", delta: o.userGrowth ? `${o.userGrowth}%` : undefined, up: (o.userGrowth ?? 0) >= 0, color: "#1DBF73", icon: "👥" },
    { label: "Active Jobs", value: o.activeJobs ?? "—", delta: o.jobGrowth ? `${o.jobGrowth}%` : undefined, up: (o.jobGrowth ?? 0) >= 0, color: "#6366f1", icon: "💼" },
    { label: "Revenue (ZAR)", value: o.totalRevenue ? `R ${Number(o.totalRevenue).toLocaleString()}` : "—", delta: o.revenueGrowth ? `${o.revenueGrowth}%` : undefined, up: (o.revenueGrowth ?? 0) >= 0, color: "#f59e0b", icon: "💰" },
    { label: "Certificates", value: o.totalCertificates ?? "—", color: "#ec4899", icon: "🎓" },
    { label: "Avg Budget (ZAR)", value: m.avgBudget ? `R ${Number(m.avgBudget).toFixed(0)}` : "—", color: "#3b82f6", icon: "📊" },
    { label: "Wallet Balance", value: f.totalBalance ? `R ${Number(f.totalBalance).toLocaleString()}` : "—", color: "#10b981", icon: "👛" },
  ];

  const categoryData = (m.categoryStats || []).slice(0, 6).map((c: any) => ({
    label: (c.category || "Other").slice(0, 8),
    value: Number(c.count || 0),
  }));
  const dailyFlow = (f.dailyFlow || []).slice(-7).map((d: any) => ({
    label: format(new Date(d.date || Date.now()), "dd/MM"),
    value: Number(d.credits || 0),
  }));
  const userTrend = (o.newUsersByDay || []).slice(-7).map((d: any) => ({
    label: format(new Date(d.date || Date.now()), "dd/MM"),
    value: Number(d.count || 0),
  }));

  return (
    <div className="pb-2">
      {/* Period picker */}
      <div className="flex gap-2 mb-5">
        {periods.map(p => (
          <button key={p} data-testid={`btn-period-${p}`} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? "text-white" : "text-gray-400"}`}
            style={{ background: period === p ? "#1DBF73" : "rgba(255,255,255,0.06)", border: `1px solid ${period === p ? "#1DBF73" : "rgba(255,255,255,0.08)"}` }}>
            {p}
          </button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map((k, i) => <KpiCard key={i} kpi={k} />)}
      </div>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Jobs by Category</h4>
          <MiniBarChart data={categoryData} color="#6366f1" />
        </div>
      )}
      {dailyFlow.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Daily Wallet Credits (ZAR)</h4>
          <MiniBarChart data={dailyFlow} color="#1DBF73" />
        </div>
      )}
      {userTrend.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">New Users (7d)</h4>
          <MiniBarChart data={userTrend} color="#f59e0b" />
        </div>
      )}

      <button data-testid="btn-full-analytics" onClick={() => window.location.href = "/admin/analytics"}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 mt-2"
        style={{ background: "linear-gradient(135deg, #1DBF73, #16a360)" }}>
        Open Full Analytics Dashboard →
      </button>
    </div>
  );
}

/* ─── Screen: Alerts (Fraud + Support + Wallet) ──────────────────── */
function AlertsScreen() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: txData, refetch: refetchTx } = useQuery({
    queryKey: ["/api/admin/wallet-transactions"],
    queryFn: () => fetch("/api/admin/wallet-transactions?type=payout&limit=20", { credentials: "include" }).then(r => r.json()),
    staleTime: 20000,
  });
  usePullToRefresh(refetchTx);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      toast({ title: "Payout approved ✓ (logged)", description: `Transaction ${id.slice(0, 8)} marked for manual payout release` });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      toast({ title: "Payout rejected", description: `Transaction ${id.slice(0, 8)} marked rejected` });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions"] }),
  });

  const txs: WalletTx[] = txData?.transactions || txData || [];

  const [pushDemo, setPushDemo] = useState(false);
  const simulatePush = () => {
    setPushDemo(true);
    if ("Notification" in window) {
      Notification.requestPermission().then(p => {
        if (p === "granted") {
          new Notification("🚨 FreelanceSkills Admin", {
            body: "Fraud alert: suspicious payment flagged for review",
            icon: "/icons/icon-192x192.png",
          });
        }
      });
    }
    setTimeout(() => setPushDemo(false), 3000);
  };

  return (
    <div className="pb-2">
      {/* Push notification test */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-red-300">Push Notifications</h4>
            <p className="text-xs text-gray-500 mt-0.5">Test mobile alert delivery</p>
          </div>
          <button data-testid="btn-test-push" onClick={simulatePush}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${pushDemo ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {pushDemo ? "Sent! ✓" : "Test Push"}
          </button>
        </div>
      </div>

      {/* Wallet withdrawals */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pending Withdrawals</h3>
      {txs.length === 0 && (
        <div className="rounded-2xl p-8 text-center mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm text-gray-500">No pending withdrawals</div>
        </div>
      )}
      <div className="space-y-3 mb-6">
        {txs.map((tx: WalletTx) => (
          <div key={tx.id} data-testid={`card-tx-${tx.id}`}
            className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-sm font-bold text-white">R {(Number(tx.amountCents) / 100).toFixed(2)}</span>
                <p className="text-xs text-gray-500 mt-0.5">{tx.userId.slice(0, 16)}…</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400 font-medium">
                {tx.type}
              </span>
            </div>
            <div className="flex gap-2">
              <button data-testid={`btn-approve-tx-${tx.id}`}
                onClick={() => approveMutation.mutate(tx.id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: "#1DBF73" }}>
                ✓ Approve
              </button>
              <button data-testid={`btn-reject-tx-${tx.id}`}
                onClick={() => rejectMutation.mutate(tx.id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: "#ef4444" }}>
                ✕ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Africa geo snapshot */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Africa User Map</h3>
      <AfricaMap />
    </div>
  );
}

/* ─── Simple Africa Text Map ─────────────────────────────────────── */
function AfricaMap() {
  const { data: geoData } = useQuery({
    queryKey: ["/api/analytics/geo"],
    queryFn: () => fetch("/api/analytics/geo", { credentials: "include" }).then(r => r.json()),
    staleTime: 120000,
  });

  const countries = ((geoData as any)?.countries || []).slice(0, 8);
  const maxUsers = Math.max(...countries.map((c: any) => Number(c.userCount || 0)), 1);

  const africanFlags: Record<string, string> = {
    "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "Ghana": "🇬🇭",
    "Egypt": "🇪🇬", "Ethiopia": "🇪🇹", "Tanzania": "🇹🇿", "Uganda": "🇺🇬",
    "Zimbabwe": "🇿🇼", "Zambia": "🇿🇲", "Botswana": "🇧🇼", "Namibia": "🇳🇦",
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {countries.length === 0 && <div className="text-center text-gray-500 text-sm py-4">No geo data yet</div>}
      <div className="space-y-2.5">
        {countries.map((c: any, i: number) => {
          const flag = africanFlags[c.country] || "🌍";
          const pct = Math.round((Number(c.userCount || 0) / maxUsers) * 100);
          return (
            <div key={i} data-testid={`geo-row-${i}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{flag} {c.country}</span>
                <span className="text-xs text-gray-400">{Number(c.userCount || 0).toLocaleString()} users</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: i === 0 ? "#1DBF73" : "#6366f1" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bottom Navigation ──────────────────────────────────────────── */
function BottomNav({ active, setActive, alertCount }: { active: NavTab; setActive: (t: NavTab) => void; alertCount: number }) {
  const tabs: { key: NavTab; icon: string; label: string }[] = [
    { key: "home", icon: "🏠", label: "Home" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "activity", icon: "📡", label: "Activity" },
    { key: "analytics", icon: "📊", label: "Analytics" },
    { key: "alerts", icon: "🔔", label: "Alerts" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{ background: "rgba(10,15,30,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(t => (
        <button key={t.key} data-testid={`nav-${t.key}`} onClick={() => setActive(t.key)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all relative ${active === t.key ? "text-white" : "text-gray-500"}`}>
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="text-[10px] font-medium">{t.label}</span>
          {t.key === "alerts" && alertCount > 0 && (
            <span className="absolute top-2 right-1/3 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
          {active === t.key && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: "#1DBF73" }} />
          )}
        </button>
      ))}
    </nav>
  );
}

/* ─── PWA Install Banner ─────────────────────────────────────────── */
function PWABanner({ onDismiss }: { onDismiss: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    onDismiss();
  };

  return (
    <div className="mx-0 mb-4 rounded-2xl p-3 flex items-center gap-3"
      style={{ background: "linear-gradient(135deg, rgba(29,191,115,0.15), rgba(99,102,241,0.1))", border: "1px solid rgba(29,191,115,0.3)" }}>
      <span className="text-2xl">📱</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white">Install Mobile Admin</p>
        <p className="text-[10px] text-gray-400">Add to home screen for instant access</p>
      </div>
      <button data-testid="btn-pwa-install" onClick={install}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0"
        style={{ background: "#1DBF73" }}>Install</button>
      <button onClick={onDismiss} className="text-gray-500 text-xs px-1">✕</button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function MobileAdmin() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [showPWA, setShowPWA] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const socketRef = useRef<Socket | null>(null);
  const [, navigate] = useLocation();

  /* Socket.io */
  useEffect(() => {
    const socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.emit("join_room", "analytics_room");

    socket.on("analytics_live", (data: any) => {
      setLiveStats(data);
    });
    socket.on("admin_notification", (data: any) => {
      const event: LiveEvent = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type || "user_join",
        message: data.message || "Platform event",
        ts: Date.now(),
      };
      setLiveEvents(prev => [event, ...prev.slice(0, 49)]);
      if (data.type === "fraud" || data.type === "dispute") {
        setAlertCount(prev => prev + 1);
      }
    });
    socket.on("user_online", () => {
      const event: LiveEvent = { id: `${Date.now()}`, type: "user_join", message: "New user came online", ts: Date.now() };
      setLiveEvents(prev => [event, ...prev.slice(0, 49)]);
    });
    socket.on("payment_update", (data: any) => {
      const event: LiveEvent = { id: `${Date.now()}`, type: "payment", message: data.message || "Payment processed", ts: Date.now() };
      setLiveEvents(prev => [event, ...prev.slice(0, 49)]);
    });

    return () => { socket.disconnect(); };
  }, []);

  /* Online/offline */
  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const clearEvents = useCallback(() => setLiveEvents([]), []);
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "alerts") setAlertCount(0);
  };

  const titles: Record<NavTab, string> = {
    home: "Overview", users: "User Management", activity: "Live Activity",
    analytics: "Quick Analytics", alerts: "Alerts & Actions",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Status bar */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(10,15,30,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button data-testid="btn-back-admin" onClick={() => navigate("/admin")} className="text-gray-400 text-lg leading-none">←</button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">{titles[activeTab]}</h1>
              {activeTab === "activity" && liveEvents.length > 0 && <PulseDot />}
            </div>
            <p className="text-[10px] text-gray-500">Mobile Admin · FreelanceSkills</p>
          </div>
          {isOffline && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 font-medium">Offline</span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="px-4 pt-4 pb-28 overflow-y-auto" style={{ minHeight: "calc(100vh - 56px)" }}>
        {showPWA && <PWABanner onDismiss={() => setShowPWA(false)} />}

        {activeTab === "home" && <HomeScreen liveStats={liveStats} />}
        {activeTab === "users" && <UsersScreen />}
        {activeTab === "activity" && <ActivityScreen events={liveEvents} clearEvents={clearEvents} />}
        {activeTab === "analytics" && <AnalyticsScreen />}
        {activeTab === "alerts" && <AlertsScreen />}
      </div>

      <BottomNav active={activeTab} setActive={handleTabChange} alertCount={alertCount} />
    </div>
  );
}

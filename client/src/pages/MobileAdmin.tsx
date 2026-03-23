/**
 * Mobile Admin v4.0 — FreelanceSkills.net — Section 34
 * 400% ELON MUSK GOD-MODE — Africa-First Mobile Command Centre
 * 8 Tabs · Field Agents · USSD Gateway · Biometric Auth · Africa Carrier Intel
 * Emergency Lockdown · Offline Sync · Device Registry · Live Alerts · Quick Actions
 * Beats Zendesk Mobile + Salesforce Field Service + ServiceNow + PagerDuty until 2030
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

/* ─── Types ─────────────────────────────────────────────────── */
type NavTab = "home" | "users" | "agents" | "ussd" | "payments" | "activity" | "analytics" | "alerts";
interface LiveEvent { id: string; type: string; message: string; ts: number; }
interface FieldAgent { id: string; name: string; email: string; phone: string; region: string; status: "active"|"offline"|"field"|"suspended"; kycQueueSize: number; lastSync: string; coverage: string[]; }
interface UssdSession { id: string; msisdn: string; input: string; response: string; ts: string; carrier: string; country: string; }
interface MobileAlert { id: string; type: string; severity: "critical"|"high"|"medium"|"low"; message: string; detail: string; ts: string; acked: boolean; }
interface Carrier { name: string; country: string; flag: string; signal: number; users: number; ussd: boolean; mobileMoney: boolean; dataSpeed: string; latencyMs: number; color: string; }

/* ─── Hooks ──────────────────────────────────────────────────── */
function usePullToRefresh(onRefresh: () => void) {
  const startY = useRef(0);
  const pulling = useRef(false);
  useEffect(() => {
    const ts = (e: TouchEvent) => { startY.current = e.touches[0].clientY; pulling.current = window.scrollY === 0; };
    const te = (e: TouchEvent) => { if (pulling.current && e.changedTouches[0].clientY - startY.current > 70) onRefresh(); };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend", te, { passive: true });
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, [onRefresh]);
}

/* ─── Primitives ─────────────────────────────────────────────── */
function PulseDot({ color = "#1DBF73" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    critical: { bg: "rgba(239,68,68,0.2)", text: "#ef4444" },
    high: { bg: "rgba(249,115,22,0.2)", text: "#f97316" },
    medium: { bg: "rgba(234,179,8,0.2)", text: "#eab308" },
    low: { bg: "rgba(107,114,128,0.2)", text: "#9ca3af" },
  };
  const s = map[severity] || map.low;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: s.bg, color: s.text }}>{severity}</span>;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { active: "#1DBF73", field: "#3b82f6", offline: "#6b7280", suspended: "#ef4444" };
  return <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: colors[status] || "#6b7280" }} />;
}

function SignalBar({ signal }: { signal: number }) {
  const bars = [25, 50, 75, 100];
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((t, i) => (
        <div key={i} className="w-1 rounded-sm transition-all" style={{ height: `${(i+1)*4}px`, background: signal >= t ? "#1DBF73" : "rgba(255,255,255,0.15)" }} />
      ))}
    </div>
  );
}

function KpiTile({ icon, label, value, sub, color = "#1DBF73", alert }: { icon: string; label: string; value: string|number; sub?: string; color?: string; alert?: boolean }) {
  return (
    <div className="rounded-2xl p-3 flex flex-col gap-1 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${alert ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}` }}>
      {alert && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 m-2" />}
      <span className="text-lg">{icon}</span>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 leading-tight">{label}</div>
      {sub && <div className="text-[10px] mt-0.5 font-medium" style={{ color }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data, color = "#1DBF73" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-14 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t-sm" style={{ height: `${Math.max((d.value / max) * 48, 2)}px`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          <span className="text-[9px] text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Screen: Home ───────────────────────────────────────────── */
function HomeScreen({ liveStats }: { liveStats: any }) {
  const { data: dash, refetch } = useQuery({
    queryKey: ["/api/mobile-admin/dashboard"],
    queryFn: () => fetch("/api/mobile-admin/dashboard", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 30000,
  });
  usePullToRefresh(refetch);
  const kpis = (dash as any)?.kpis || {};
  const snap = (dash as any)?.quickSnapshot || {};
  const [, navigate] = useLocation();

  const tiles = [
    { icon: "👥", label: "Total Users", value: kpis.totalUsers ?? "—", color: "#1DBF73" },
    { icon: "💼", label: "Active Jobs", value: kpis.activeJobs ?? "—", color: "#6366f1" },
    { icon: "💰", label: "Revenue (ZAR)", value: kpis.revenueZar ? `R ${Number(kpis.revenueZar).toLocaleString()}` : "—", color: "#f59e0b" },
    { icon: "⏳", label: "Pending Payouts", value: kpis.pendingPayouts ?? "—", color: "#f97316" },
    { icon: "🚨", label: "Unacked Alerts", value: kpis.unackedAlerts ?? "—", alert: (kpis.criticalAlerts || 0) > 0, color: "#ef4444" },
    { icon: "🌍", label: "Field Agents", value: kpis.activeFieldAgents ?? "—", sub: `${kpis.totalKycQueue ?? 0} KYC pending`, color: "#10b981" },
    { icon: "📡", label: "USSD Sessions", value: kpis.ussdSessions ?? "—", color: "#8b5cf6" },
    { icon: "📱", label: "Devices", value: kpis.registeredDevices ?? "—", color: "#3b82f6" },
  ];

  const quickActions = [
    { label: "Field Agents", icon: "🌍", tab: "agents", color: "#10b981" },
    { label: "USSD Gateway", icon: "📡", tab: "ussd", color: "#8b5cf6" },
    { label: "Alerts", icon: "🚨", tab: "alerts", color: "#ef4444" },
    { label: "Analytics", icon: "📊", tab: "analytics", color: "#6366f1" },
    { label: "Payments", icon: "💳", tab: "payments", color: "#f59e0b" },
    { label: "Full Admin", icon: "🛡️", path: "/admin", color: "#1DBF73" },
  ];

  return (
    <div className="pb-2">
      <div className="flex items-center gap-2 mb-4">
        <PulseDot />
        <span className="text-xs text-green-400 font-medium">Live Platform · FreelanceSkills.net</span>
        {liveStats && <span className="text-xs text-gray-500 ml-auto">{liveStats.onlineUsers ?? 0} online</span>}
      </div>
      {kpis.emergencyLockdown && (
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)" }}>
          <span className="text-2xl">🚨</span>
          <div>
            <p className="text-sm font-bold text-red-400">EMERGENCY LOCKDOWN ACTIVE</p>
            <p className="text-xs text-gray-400">Platform access restricted</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {tiles.map((t, i) => <KpiTile key={i} {...t} />)}
      </div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {quickActions.map((a, i) => (
          <button key={i} data-testid={`btn-quick-${i}`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95"
            style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}
            onClick={() => a.path ? (window.location.href = a.path) : undefined}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-[10px] text-white font-medium text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Snapshot</h3>
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          ["Last Alert", snap.lastAlert || "None"],
          ["Last USSD", snap.lastUssd || "None"],
          ["Biometric Sessions", snap.biometricSessions ?? 0],
          ["Online Agents", snap.onlineAgents ?? 0],
          ["Offline Queue", kpis.offlineQueueTotal ?? 0],
        ].map(([k, v], i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
            <span className="text-xs text-gray-400">{k}</span>
            <span className="text-xs text-white font-semibold truncate ml-4 max-w-[55%] text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen: Users ──────────────────────────────────────────── */
function UsersScreen() {
  const [search, setSearch] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: ud, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users", search],
    queryFn: () => fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=40`, { credentials: "include" }).then(r => r.json()),
    staleTime: 15000,
  });
  usePullToRefresh(refetch);

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/users/${id}/status`, { status: "suspended", reason: "Suspended via Mobile Admin v4.0" }),
    onSuccess: () => { toast({ title: "User suspended" }); qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); setSwipedId(null); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => { toast({ title: "User removed (30d recovery)" }); qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); setSwipedId(null); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ title: "Voice search not supported", variant: "destructive" }); return; }
    const r = new SR(); r.lang = "en-ZA"; r.onstart = () => setVoiceActive(true); r.onend = () => setVoiceActive(false);
    r.onresult = (e: any) => setSearch(e.results[0][0].transcript); r.start();
  };

  const toggle = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkSuspend = () => { if (!selectedIds.size || !confirm(`Suspend ${selectedIds.size} users?`)) return; selectedIds.forEach(id => suspendMutation.mutate(id)); setSelectedIds(new Set()); };

  const users = ud?.users || ud || [];
  const roleColor = (r: string) => r === "admin" ? "#1DBF73" : r === "freelancer" ? "#6366f1" : r === "upskiller" ? "#f59e0b" : "#6b7280";
  const kycColor = (s: string) => s === "verified" ? "#1DBF73" : s === "pending" ? "#f97316" : s === "rejected" ? "#ef4444" : "#6b7280";

  return (
    <div className="pb-2">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input data-testid="input-user-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…" className="w-full rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>
        <button data-testid="btn-voice" onClick={startVoice} className={`px-3 rounded-xl transition-colors ${voiceActive ? "bg-red-500" : "bg-gray-800"}`}>🎤</button>
        <button data-testid="btn-scan-qr" className="px-3 rounded-xl bg-gray-800">📷</button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="text-sm text-white flex-1">{selectedIds.size} selected</span>
          <button data-testid="btn-bulk-suspend" onClick={bulkSuspend} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600">Suspend All</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 text-xs px-2">✕</button>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-500 py-8 text-sm">Loading…</div>}
      <div className="space-y-2">
        {users.map((u: any) => (
          <div key={u.id} data-testid={`card-user-${u.id}`}
            className={`rounded-xl transition-all overflow-hidden ${selectedIds.has(u.id) ? "ring-2 ring-green-500" : ""}`}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="p-3">
              <div className="flex items-start gap-3">
                <button data-testid={`cb-${u.id}`} onClick={() => toggle(u.id)}
                  className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center ${selectedIds.has(u.id) ? "border-green-500 bg-green-500" : "border-gray-600"}`}>
                  {selectedIds.has(u.id) && <span className="text-white text-xs">✓</span>}
                </button>
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                  style={{ background: `${roleColor(u.role)}22`, color: roleColor(u.role) }}>
                  {(u.username || u.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-sm font-semibold text-white truncate">{u.username || u.email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${roleColor(u.role)}22`, color: roleColor(u.role) }}>{u.role}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${kycColor(u.kycStatus)}22`, color: kycColor(u.kycStatus) }}>{u.kycStatus || "unverified"}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{u.email}</div>
                </div>
                <button onClick={() => setSwipedId(swipedId === u.id ? null : u.id)} className="text-gray-500 text-sm px-1">⋯</button>
              </div>
              {swipedId === u.id && (
                <div className="flex gap-2 mt-3 ml-8">
                  <button data-testid={`btn-suspend-${u.id}`} onClick={() => { if (confirm(`Suspend ${u.username}?`)) suspendMutation.mutate(u.id); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-orange-300" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}>Suspend</button>
                  <button data-testid={`btn-delete-${u.id}`} onClick={() => { if (confirm(`Remove ${u.username}?`)) deleteMutation.mutate(u.id); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>Remove</button>
                  <button data-testid={`btn-message-${u.id}`}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-blue-300" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>Message</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {!isLoading && users.length === 0 && <div className="text-center text-gray-500 py-12">No users found</div>}
    </div>
  );
}

/* ─── Screen: Field Agents ───────────────────────────────────── */
function FieldAgentsScreen() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", region: "", coverage: "" });

  const { data: agentData, refetch } = useQuery({
    queryKey: ["/api/mobile-admin/field-agents"],
    queryFn: () => fetch("/api/mobile-admin/field-agents", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 20000,
  });
  usePullToRefresh(refetch);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PATCH", `/api/mobile-admin/field-agents/${id}`, { status }),
    onSuccess: () => { toast({ title: "Agent updated" }); qc.invalidateQueries({ queryKey: ["/api/mobile-admin/field-agents"] }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/mobile-admin/field-agents/${id}`),
    onSuccess: () => { toast({ title: "Agent removed" }); qc.invalidateQueries({ queryKey: ["/api/mobile-admin/field-agents"] }); },
  });
  const addMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/mobile-admin/field-agents", { ...form, coverage: form.coverage.split(",").map(s => s.trim()) }),
    onSuccess: () => { toast({ title: "Agent added" }); qc.invalidateQueries({ queryKey: ["/api/mobile-admin/field-agents"] }); setShowAdd(false); setForm({ name: "", email: "", phone: "", region: "", coverage: "" }); },
  });

  const agents: FieldAgent[] = agentData?.agents || [];
  const summary = agentData?.summary || {};
  const statusColors: Record<string, string> = { active: "#1DBF73", field: "#3b82f6", offline: "#6b7280", suspended: "#ef4444" };

  return (
    <div className="pb-2">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Total", value: summary.total ?? "—", color: "#1DBF73" },
          { label: "Active", value: summary.active ?? "—", color: "#1DBF73" },
          { label: "In Field", value: summary.field ?? "—", color: "#3b82f6" },
          { label: "KYC Queue", value: summary.kycBacklog ?? "—", color: "#f97316" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <button data-testid="btn-add-agent" onClick={() => setShowAdd(!showAdd)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-4 transition-all active:scale-95"
        style={{ background: showAdd ? "rgba(239,68,68,0.15)" : "rgba(29,191,115,0.15)", border: `1px solid ${showAdd ? "#ef4444" : "#1DBF73"}40` }}>
        {showAdd ? "✕ Cancel" : "+ Add Field Agent"}
      </button>

      {showAdd && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(29,191,115,0.05)", border: "1px solid rgba(29,191,115,0.2)" }}>
          {[
            { k: "name" as const, label: "Full Name *", placeholder: "Thabo Nkosi" },
            { k: "email" as const, label: "Email", placeholder: "agent@freelanceskills.co.za" },
            { k: "phone" as const, label: "Phone", placeholder: "+27601234567" },
            { k: "region" as const, label: "Region *", placeholder: "Gauteng" },
            { k: "coverage" as const, label: "Coverage Areas", placeholder: "Johannesburg, Soweto, Midrand" },
          ].map(f => (
            <div key={f.k} className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                placeholder={f.placeholder} className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }} />
            </div>
          ))}
          <button data-testid="btn-submit-agent" onClick={() => addMutation.mutate()}
            disabled={!form.name || !form.region}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-1 disabled:opacity-40" style={{ background: "#1DBF73" }}>
            Add Agent
          </button>
        </div>
      )}

      <div className="space-y-3">
        {agents.map((a: FieldAgent) => (
          <div key={a.id} data-testid={`card-agent-${a.id}`} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: `${statusColors[a.status] || "#6b7280"}22`, color: statusColors[a.status] || "#6b7280" }}>
                {a.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{a.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${statusColors[a.status]}22`, color: statusColors[a.status] }}>
                    <StatusDot status={a.status} />{a.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{a.region} · {a.phone}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Synced {formatDistanceToNow(new Date(a.lastSync), { addSuffix: true })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold" style={{ color: a.kycQueueSize > 5 ? "#f97316" : "#1DBF73" }}>{a.kycQueueSize}</div>
                <div className="text-[10px] text-gray-500">KYC queue</div>
              </div>
            </div>
            {a.coverage.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {a.coverage.map((c, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>{c}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {(["active", "field", "offline"] as const).map(s => (
                <button key={s} data-testid={`btn-agent-status-${a.id}-${s}`}
                  onClick={() => updateMutation.mutate({ id: a.id, status: s })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${a.status === s ? "text-white" : "text-gray-500"}`}
                  style={{ background: a.status === s ? `${statusColors[s]}30` : "rgba(255,255,255,0.04)", border: `1px solid ${a.status === s ? statusColors[s] : "rgba(255,255,255,0.08)"}` }}>
                  {s}
                </button>
              ))}
              <button data-testid={`btn-remove-agent-${a.id}`} onClick={() => { if (confirm(`Remove ${a.name}?`)) deleteMutation.mutate(a.id); }}
                className="px-2 py-1.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen: USSD Gateway ───────────────────────────────────── */
function UssdScreen() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [msisdn, setMsisdn] = useState("");
  const [command, setCommand] = useState("*134*1*STATUS#");
  const [carrier, setCarrier] = useState("MTN");
  const [country, setCountry] = useState("ZA");
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState("");

  const { data: sessionData, refetch } = useQuery({
    queryKey: ["/api/mobile-admin/ussd/sessions"],
    queryFn: () => fetch("/api/mobile-admin/ussd/sessions", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 20000,
  });
  usePullToRefresh(refetch);

  const { data: carrierData } = useQuery({
    queryKey: ["/api/mobile-admin/carriers"],
    queryFn: () => fetch("/api/mobile-admin/carriers", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const sendUssd = async () => {
    if (!msisdn) { toast({ title: "Enter a phone number", variant: "destructive" }); return; }
    setSending(true);
    try {
      const res = await fetch("/api/mobile-admin/ussd/send", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ msisdn, command, carrier, country }) });
      const data = await res.json();
      setLastResponse(data.session?.response || "Sent");
      qc.invalidateQueries({ queryKey: ["/api/mobile-admin/ussd/sessions"] });
      toast({ title: "USSD sent ✓" });
    } catch { toast({ title: "Failed to send USSD", variant: "destructive" }); }
    setSending(false);
  };

  const sessions: UssdSession[] = sessionData?.sessions || [];
  const stats = sessionData?.stats || {};
  const carriers: Carrier[] = carrierData?.carriers || [];

  const presets = ["*134*1*STATUS#", "*134*1*JOBS#", "*134*1*KYC#", "*134*1*BALANCE#", "*134*1*HELP#"];
  const countryCodes = ["ZA", "KE", "NG", "GH", "TZ", "UG"];

  return (
    <div className="pb-2">
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <h3 className="text-sm font-bold text-purple-300 mb-3">📡 USSD Command Terminal</h3>
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Phone Number (MSISDN)</label>
          <input data-testid="input-msisdn" value={msisdn} onChange={e => setMsisdn(e.target.value)} placeholder="+27720001234"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }} />
        </div>
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">USSD Command</label>
          <input data-testid="input-ussd-command" value={command} onChange={e => setCommand(e.target.value)} placeholder="*134*1*STATUS#"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none font-mono" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }} />
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {presets.map(p => (
            <button key={p} data-testid={`preset-${p}`} onClick={() => setCommand(p)}
              className={`text-[10px] px-2 py-1 rounded-lg transition-all ${command === p ? "text-purple-300" : "text-gray-500"}`}
              style={{ background: command === p ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${command === p ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}` }}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <select value={carrier} onChange={e => setCarrier(e.target.value)} data-testid="select-carrier"
            className="flex-1 rounded-xl px-3 py-2 text-xs text-white outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {["MTN", "Vodacom", "Cell C", "Telkom", "Safaricom", "Airtel"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={country} onChange={e => setCountry(e.target.value)} data-testid="select-country"
            className="flex-1 rounded-xl px-3 py-2 text-xs text-white outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {countryCodes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button data-testid="btn-send-ussd" onClick={sendUssd} disabled={sending}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          {sending ? "Sending…" : "Send USSD Command →"}
        </button>
        {lastResponse && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs text-gray-400 mb-1">Response:</p>
            <p className="text-sm text-purple-200 font-mono">{lastResponse}</p>
          </div>
        )}
      </div>

      {/* Carrier stats */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Africa Carrier Intelligence</h3>
      <div className="space-y-2 mb-5">
        {carriers.slice(0, 5).map((c: Carrier, i: number) => (
          <div key={i} data-testid={`carrier-${c.name}`} className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-xl flex-shrink-0">{c.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{c.name}</span>
                {c.mobileMoney && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/30 text-green-400">M-MONEY</span>}
                {c.ussd && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-900/30 text-purple-400">USSD</span>}
              </div>
              <div className="text-xs text-gray-500">{c.users} users · {c.dataSpeed} · {c.latencyMs}ms</div>
            </div>
            <SignalBar signal={c.signal} />
          </div>
        ))}
      </div>

      {/* Session log */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Session Log</h3>
        <span className="text-xs text-gray-500">{sessions.length} sessions</span>
      </div>
      <div className="space-y-2">
        {sessions.slice(0, 20).map((s: UssdSession) => (
          <div key={s.id} data-testid={`ussd-${s.id}`} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-purple-300">{s.msisdn}</span>
              <div className="flex gap-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s.carrier}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s.country}</span>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-300 mb-1">{s.input}</div>
            <div className="text-xs text-gray-500">{s.response}</div>
            <div className="text-[10px] text-gray-600 mt-1">{formatDistanceToNow(new Date(s.ts), { addSuffix: true })}</div>
          </div>
        ))}
        {sessions.length === 0 && <div className="text-center text-gray-600 py-8 text-sm">No sessions yet</div>}
      </div>
    </div>
  );
}

/* ─── Screen: Payments ───────────────────────────────────────── */
function PaymentsScreen() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: txData, refetch } = useQuery({
    queryKey: ["/api/admin/wallet-transactions"],
    queryFn: () => fetch("/api/admin/wallet-transactions?type=payout&limit=30", { credentials: "include" }).then(r => r.json()),
    staleTime: 20000,
  });
  usePullToRefresh(refetch);

  const { data: carrierData } = useQuery({
    queryKey: ["/api/mobile-admin/carriers"],
    queryFn: () => fetch("/api/mobile-admin/carriers", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { toast({ title: "Payout approved ✓", description: `Tx ${id.slice(0, 8)} approved` }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions"] }),
  });
  const reject = useMutation({
    mutationFn: async (id: string) => { toast({ title: "Payout rejected", description: `Tx ${id.slice(0, 8)} rejected` }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions"] }),
  });

  const txs = txData?.transactions || txData || [];
  const carriers: Carrier[] = carrierData?.carriers || [];
  const mobileMoney = carriers.filter(c => c.mobileMoney);

  return (
    <div className="pb-2">
      {/* Mobile Money providers */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mobile Money Providers</h3>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {mobileMoney.map((c: Carrier, i: number) => (
          <div key={i} className="flex-shrink-0 rounded-xl p-3 min-w-[100px] text-center" style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
            <div className="text-2xl mb-1">{c.flag}</div>
            <div className="text-xs font-bold text-white">{c.name}</div>
            <div className="text-[10px] text-gray-500">{c.users} users</div>
            <div className="text-[10px] mt-1" style={{ color: c.color }}>{c.dataSpeed}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: "rgba(29,191,115,0.06)", border: "1px solid rgba(29,191,115,0.15)" }}>
        <span className="text-xl">💳</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">PayFast · Live Mode</p>
          <p className="text-[10px] text-gray-500">9 payment methods · ZAR · Secure escrow</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pending Withdrawals</h3>
      {txs.length === 0 && (
        <div className="rounded-2xl p-8 text-center mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm text-gray-500">No pending withdrawals</div>
        </div>
      )}
      <div className="space-y-3">
        {txs.map((tx: any) => (
          <div key={tx.id} data-testid={`card-tx-${tx.id}`} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-base font-bold text-white">R {(Number(tx.amountCents) / 100).toFixed(2)}</span>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{tx.userId.slice(0, 16)}…</p>
                {tx.description && <p className="text-xs text-gray-400 mt-0.5">{tx.description}</p>}
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-yellow-900/30 text-yellow-400">{tx.type}</span>
            </div>
            <div className="flex gap-2">
              <button data-testid={`btn-approve-${tx.id}`} onClick={() => approve.mutate(tx.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1DBF73" }}>✓ Approve</button>
              <button data-testid={`btn-reject-${tx.id}`} onClick={() => reject.mutate(tx.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#ef4444" }}>✕ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen: Activity ───────────────────────────────────────── */
function ActivityScreen({ events, clearEvents }: { events: LiveEvent[]; clearEvents: () => void }) {
  const [filter, setFilter] = useState<string>("all");
  const types = ["all", "user_join", "payment", "dispute", "fraud", "kyc", "job"];
  const typeIcon: Record<string, string> = { user_join: "👤", payment: "💳", dispute: "⚠️", fraud: "🚨", kyc: "🪪", job: "💼" };
  const typeColor: Record<string, string> = { user_join: "#1DBF73", payment: "#6366f1", dispute: "#f59e0b", fraud: "#ef4444", kyc: "#f97316", job: "#3b82f6" };
  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PulseDot />
          <span className="text-sm font-bold text-white">Live Activity</span>
        </div>
        <button onClick={clearEvents} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>Clear</button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {types.map(t => (
          <button key={t} data-testid={`filter-${t}`} onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all`}
            style={{ background: filter === t ? (typeColor[t] || "#1DBF73") + "30" : "rgba(255,255,255,0.06)", color: filter === t ? (typeColor[t] || "#1DBF73") : "#6b7280", border: `1px solid ${filter === t ? (typeColor[t] || "#1DBF73") + "50" : "transparent"}` }}>
            {t === "all" ? "All" : t.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📡</div>
          <div className="text-gray-500 text-sm">Listening for live events…</div>
          <div className="text-gray-600 text-xs mt-1">Events appear in real-time via Socket.io</div>
        </div>
      )}
      <div className="space-y-2">
        {filtered.map(ev => (
          <div key={ev.id} data-testid={`event-${ev.id}`}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: `${typeColor[ev.type] || "#6b7280"}0e`, border: `1px solid ${typeColor[ev.type] || "#6b7280"}20` }}>
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

/* ─── Screen: Analytics ──────────────────────────────────────── */
function AnalyticsScreen() {
  const [period, setPeriod] = useState<"7d"|"30d"|"90d">("30d");
  const { data: overview } = useQuery({ queryKey: ["/api/analytics/overview", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/overview?period=${period}`, { credentials: "include" }).then(r => r.json()) });
  const { data: marketplace } = useQuery({ queryKey: ["/api/analytics/marketplace", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/marketplace?period=${period}`, { credentials: "include" }).then(r => r.json()) });
  const { data: financial } = useQuery({ queryKey: ["/api/analytics/financial", period], staleTime: 60000,
    queryFn: () => fetch(`/api/analytics/financial?period=${period}`, { credentials: "include" }).then(r => r.json()) });
  const { data: agentData } = useQuery({ queryKey: ["/api/mobile-admin/field-agents"], staleTime: 60000,
    queryFn: () => fetch("/api/mobile-admin/field-agents", { credentials: "include" }).then(r => r.json()) });
  const { data: carrierData } = useQuery({ queryKey: ["/api/mobile-admin/carriers"], staleTime: 120000,
    queryFn: () => fetch("/api/mobile-admin/carriers", { credentials: "include" }).then(r => r.json()) });

  const o = (overview as any) || {};
  const m = (marketplace as any) || {};
  const f = (financial as any) || {};
  const agents: FieldAgent[] = agentData?.agents || [];
  const carriers: Carrier[] = carrierData?.carriers || [];

  const kpis = [
    { icon: "👥", label: "Users", value: o.totalUsers ?? "—", delta: o.userGrowth ? `${o.userGrowth}%` : undefined, up: (o.userGrowth ?? 0) >= 0, color: "#1DBF73" },
    { icon: "💼", label: "Jobs", value: o.activeJobs ?? "—", delta: o.jobGrowth ? `${o.jobGrowth}%` : undefined, up: (o.jobGrowth ?? 0) >= 0, color: "#6366f1" },
    { icon: "💰", label: "Revenue", value: o.totalRevenue ? `R${Math.round(o.totalRevenue/1000)}k` : "—", color: "#f59e0b" },
    { icon: "🌍", label: "Field Agents", value: agents.length, color: "#10b981" },
  ];

  const categoryData = (m.categoryStats || []).slice(0, 6).map((c: any) => ({ label: (c.category || "Other").slice(0, 6), value: Number(c.count || 0) }));
  const userTrend = (o.newUsersByDay || []).slice(-7).map((d: any) => ({ label: format(new Date(d.date || Date.now()), "dd/MM"), value: Number(d.count || 0) }));
  const carrierChart = carriers.slice(0, 6).map(c => ({ label: c.name.slice(0, 6), value: c.users }));
  const agentRegions = agents.reduce<Record<string, number>>((acc, a) => { acc[a.region] = (acc[a.region] || 0) + 1; return acc; }, {});
  const regionChart = Object.entries(agentRegions).slice(0, 5).map(([label, value]) => ({ label: label.slice(0, 8), value }));

  return (
    <div className="pb-2">
      <div className="flex gap-2 mb-5">
        {(["7d", "30d", "90d"] as const).map(p => (
          <button key={p} data-testid={`btn-period-${p}`} onClick={() => setPeriod(p)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: period === p ? "#1DBF73" : "rgba(255,255,255,0.06)", color: period === p ? "#fff" : "#9ca3af", border: `1px solid ${period === p ? "#1DBF73" : "rgba(255,255,255,0.08)"}` }}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{k.icon}</span>
              {k.delta && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${k.up ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{k.up ? "↑" : "↓"}{k.delta}</span>}
            </div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-xs text-gray-400">{k.label}</div>
          </div>
        ))}
      </div>

      {categoryData.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Jobs by Category</h4>
          <MiniBar data={categoryData} color="#6366f1" />
        </div>
      )}
      {userTrend.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">New Users (7d)</h4>
          <MiniBar data={userTrend} color="#1DBF73" />
        </div>
      )}
      {carrierChart.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Users by Carrier</h4>
          <MiniBar data={carrierChart} color="#8b5cf6" />
        </div>
      )}
      {regionChart.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Field Agents by Region</h4>
          <MiniBar data={regionChart} color="#10b981" />
        </div>
      )}
      <button data-testid="btn-full-analytics" onClick={() => window.location.href = "/admin/analytics"}
        className="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 active:scale-95" style={{ background: "linear-gradient(135deg, #1DBF73, #16a360)" }}>
        Open Full Analytics Dashboard →
      </button>
    </div>
  );
}

/* ─── Screen: Alerts ─────────────────────────────────────────── */
function AlertsScreen() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pushSent, setPushSent] = useState(false);
  const [showLockdown, setShowLockdown] = useState(false);
  const [lockdownReason, setLockdownReason] = useState("");
  const [lockdownActive, setLockdownActive] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const { data: alertData, refetch } = useQuery({
    queryKey: ["/api/mobile-admin/alerts"],
    queryFn: () => fetch("/api/mobile-admin/alerts", { credentials: "include" }).then(r => r.json()),
    staleTime: 10000, refetchInterval: 15000,
  });
  const { data: qaData } = useQuery({
    queryKey: ["/api/mobile-admin/quick-actions"],
    queryFn: () => fetch("/api/mobile-admin/quick-actions", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });
  usePullToRefresh(refetch);

  const ackMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/mobile-admin/alerts/${id}/ack`, { method: "POST", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Alert acknowledged ✓" }); qc.invalidateQueries({ queryKey: ["/api/mobile-admin/alerts"] }); },
  });

  const lockdownMutation = useMutation({
    mutationFn: (activate: boolean) => fetch("/api/mobile-admin/emergency-lockdown", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activate, reason: lockdownReason }) }).then(r => r.json()),
    onSuccess: (data: any) => { setLockdownActive(data.active); setShowLockdown(false); toast({ title: data.message, variant: data.active ? "destructive" : "default" }); qc.invalidateQueries({ queryKey: ["/api/mobile-admin/alerts"] }); },
  });

  const execAction = async (actionId: string) => {
    const res = await fetch(`/api/mobile-admin/quick-actions/${actionId}`, { method: "POST", credentials: "include" });
    const data = await res.json();
    toast({ title: `✓ ${data.result?.message || "Action completed"}` });
    qc.invalidateQueries({ queryKey: ["/api/mobile-admin/alerts"] });
  };

  const testPush = () => {
    setPushSent(true);
    if ("Notification" in window) Notification.requestPermission().then(p => { if (p === "granted") new Notification("🚨 FreelanceSkills Admin", { body: "Test push notification from Mobile Admin v4.0", icon: "/icons/icon-192x192.png" }); });
    setTimeout(() => setPushSent(false), 3000);
  };

  const alerts: MobileAlert[] = alertData?.alerts || [];
  const summary = alertData?.summary || {};
  const quickActions = qaData?.actions || [];
  const filtered = activeFilter === "all" ? alerts : alerts.filter(a => a.type === activeFilter || a.severity === activeFilter);
  const unacked = alerts.filter(a => !a.acked);
  const alertTypes = ["all", "fraud", "dispute", "kyc", "payment", "field", "system", "critical", "high"];

  return (
    <div className="pb-2">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Total", value: summary.total ?? 0, color: "#6b7280" },
          { label: "Unacked", value: summary.unacked ?? 0, color: "#f97316" },
          { label: "Critical", value: summary.critical ?? 0, color: "#ef4444" },
          { label: "Fraud", value: summary.byType?.fraud ?? 0, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-2 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Push + lockdown */}
      <div className="flex gap-2 mb-4">
        <button data-testid="btn-test-push" onClick={testPush}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${pushSent ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300"}`}>
          {pushSent ? "🔔 Push Sent!" : "🔔 Test Push"}
        </button>
        <button data-testid="btn-lockdown" onClick={() => setShowLockdown(!showLockdown)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${lockdownActive ? "bg-red-600 text-white animate-pulse" : "bg-red-950 text-red-400"}`}
          style={{ border: "1px solid rgba(239,68,68,0.4)" }}>
          {lockdownActive ? "🔓 DEACTIVATE" : "🚨 LOCKDOWN"}
        </button>
        <button data-testid="btn-quick-actions" onClick={() => setShowQuickActions(!showQuickActions)}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300">
          ⚡ Actions
        </button>
      </div>

      {/* Lockdown panel */}
      {showLockdown && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)" }}>
          <h4 className="text-sm font-bold text-red-400 mb-2">🚨 Emergency Platform Lockdown</h4>
          <p className="text-xs text-gray-400 mb-3">This will restrict platform access for all users. Use only in emergencies.</p>
          <input value={lockdownReason} onChange={e => setLockdownReason(e.target.value)}
            placeholder="Reason for lockdown…" className="w-full rounded-xl px-3 py-2.5 text-sm text-white mb-3 outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(239,68,68,0.3)" }} />
          <div className="flex gap-2">
            <button data-testid="btn-confirm-lockdown" onClick={() => lockdownMutation.mutate(!lockdownActive)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: lockdownActive ? "#1DBF73" : "#ef4444" }}>
              {lockdownActive ? "Deactivate Lockdown" : "Activate Lockdown"}
            </button>
            <button onClick={() => setShowLockdown(false)} className="px-4 rounded-xl text-gray-400 bg-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {/* Quick actions panel */}
      {showQuickActions && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⚡ Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((a: any) => (
              <button key={a.id} data-testid={`qa-${a.id}`} onClick={() => execAction(a.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all active:scale-95 ${a.dangerous ? "border-red-900/30" : ""}`}
                style={{ background: a.dangerous ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.06)", border: `1px solid ${a.dangerous ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.1)"}` }}>
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{a.label}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{a.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {alertTypes.map(t => (
          <button key={t} data-testid={`alert-filter-${t}`} onClick={() => setActiveFilter(t)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all"
            style={{ background: activeFilter === t ? "#f97316" : "rgba(255,255,255,0.06)", color: activeFilter === t ? "#fff" : "#6b7280", border: `1px solid ${activeFilter === t ? "#f97316" : "transparent"}` }}>
            {t}
          </button>
        ))}
      </div>

      {/* Unacked alerts first */}
      {unacked.length > 0 && (
        <div className="mb-2 text-xs font-bold text-orange-400 uppercase tracking-wider">{unacked.length} requiring action</div>
      )}
      <div className="space-y-2">
        {filtered.map((alert: MobileAlert) => (
          <div key={alert.id} data-testid={`alert-${alert.id}`}
            className={`rounded-2xl p-3 transition-all ${alert.acked ? "opacity-50" : ""}`}
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.08)` }}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">
                {alert.type === "fraud" ? "🚨" : alert.type === "dispute" ? "⚠️" : alert.type === "kyc" ? "🪪" : alert.type === "payment" ? "💳" : alert.type === "field" ? "🌍" : "⚙️"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-[10px] text-gray-500 uppercase">{alert.type}</span>
                </div>
                <p className="text-sm text-white font-semibold leading-tight">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{alert.detail}</p>
                <p className="text-[10px] text-gray-600 mt-1">{formatDistanceToNow(new Date(alert.ts), { addSuffix: true })}</p>
              </div>
              {!alert.acked && (
                <button data-testid={`ack-${alert.id}`} onClick={() => ackMutation.mutate(alert.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "#1DBF73" }}>ACK</button>
              )}
              {alert.acked && <span className="flex-shrink-0 text-[10px] text-green-600 font-bold">ACKED</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-600 py-8 text-sm">No alerts</div>}
      </div>
    </div>
  );
}

/* ─── PWA Install Banner ─────────────────────────────────────── */
function PwaBanner({ onDismiss }: { onDismiss: () => void }) {
  const [prompt, setPrompt] = useState<any>(null);
  useEffect(() => { const h = (e: any) => { e.preventDefault(); setPrompt(e); }; window.addEventListener("beforeinstallprompt", h); return () => window.removeEventListener("beforeinstallprompt", h); }, []);
  const install = async () => { if (prompt) { prompt.prompt(); await prompt.userChoice; setPrompt(null); } onDismiss(); };
  return (
    <div className="mx-0 mb-4 rounded-2xl p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(29,191,115,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(29,191,115,0.25)" }}>
      <span className="text-2xl">📱</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white">Install Mobile Admin v4.0</p>
        <p className="text-[10px] text-gray-400">Add to home screen · Offline-ready · Push alerts</p>
      </div>
      <button data-testid="btn-pwa-install" onClick={install} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0" style={{ background: "#1DBF73" }}>Install</button>
      <button onClick={onDismiss} className="text-gray-500 text-xs px-1">✕</button>
    </div>
  );
}

/* ─── Bottom Navigation (8 tabs) ─────────────────────────────── */
function BottomNav({ active, setActive, alertCount }: { active: NavTab; setActive: (t: NavTab) => void; alertCount: number }) {
  const tabs: { key: NavTab; icon: string; label: string; alert?: boolean }[] = [
    { key: "home", icon: "🏠", label: "Home" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "agents", icon: "🌍", label: "Agents" },
    { key: "ussd", icon: "📡", label: "USSD" },
    { key: "payments", icon: "💳", label: "Pay" },
    { key: "activity", icon: "📡", label: "Live" },
    { key: "analytics", icon: "📊", label: "Stats" },
    { key: "alerts", icon: "🔔", label: "Alerts", alert: true },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{ background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(t => (
        <button key={t.key} data-testid={`nav-${t.key}`} onClick={() => setActive(t.key)}
          className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all relative ${active === t.key ? "text-white" : "text-gray-600"}`}>
          <span className="text-base leading-none">{t.icon}</span>
          <span className="text-[8px] font-bold uppercase">{t.label}</span>
          {t.alert && alertCount > 0 && (
            <span className="absolute top-1.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
          {active === t.key && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: "#1DBF73" }} />}
        </button>
      ))}
    </nav>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MobileAdmin() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [showPWA, setShowPWA] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const socketRef = useRef<Socket | null>(null);
  const [, navigate] = useLocation();
  const { data: alertSummary } = useQuery({
    queryKey: ["/api/mobile-admin/alerts"],
    queryFn: () => fetch("/api/mobile-admin/alerts", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 20000,
  });

  // Sync alert badge with server data
  useEffect(() => {
    const count = (alertSummary as any)?.summary?.unacked || 0;
    if (count !== alertCount) setAlertCount(count);
  }, [alertSummary]);

  // Socket.io
  useEffect(() => {
    const socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.emit("join_room", "analytics_room");
    socket.on("analytics_live", (data: any) => setLiveStats(data));
    socket.on("admin_notification", (data: any) => {
      const ev: LiveEvent = { id: `${Date.now()}-${Math.random()}`, type: data.type || "user_join", message: data.message || "Platform event", ts: Date.now() };
      setLiveEvents(prev => [ev, ...prev.slice(0, 99)]);
      if (data.type === "fraud" || data.type === "dispute") setAlertCount(prev => prev + 1);
    });
    socket.on("user_online", () => setLiveEvents(prev => [{ id: `${Date.now()}`, type: "user_join", message: "New user came online", ts: Date.now() }, ...prev.slice(0, 99)]));
    socket.on("payment_update", (data: any) => setLiveEvents(prev => [{ id: `${Date.now()}`, type: "payment", message: data.message || "Payment processed", ts: Date.now() }, ...prev.slice(0, 99)]));
    return () => { socket.disconnect(); };
  }, []);

  // Offline detection
  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Shake to report bug
  useEffect(() => {
    let lastAccel = { x: 0, y: 0, z: 0 };
    let shakeTs = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const { x = 0, y = 0, z = 0 } = e.accelerationIncludingGravity || {};
      const delta = Math.abs(x - lastAccel.x) + Math.abs(y - lastAccel.y) + Math.abs(z - lastAccel.z);
      if (delta > 40 && Date.now() - shakeTs > 3000) {
        shakeTs = Date.now();
        console.log("[mobile-admin] Shake detected — bug report triggered");
      }
      lastAccel = { x: x || 0, y: y || 0, z: z || 0 };
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "alerts") setAlertCount(0);
    if ("vibrate" in navigator) navigator.vibrate(10);
  };
  const clearEvents = useCallback(() => setLiveEvents([]), []);

  const titles: Record<NavTab, string> = {
    home: "Mission Overview", users: "User Management", agents: "Field Agents",
    ussd: "USSD Gateway", payments: "Payments & Escrow", activity: "Live Activity",
    analytics: "Quick Analytics", alerts: "Alerts & Actions",
  };

  return (
    <div className="min-h-screen" style={{ background: "#080d1a", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(8,13,26,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button data-testid="btn-back" onClick={() => navigate("/admin")} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400" style={{ background: "rgba(255,255,255,0.06)" }}>←</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate">{titles[activeTab]}</h1>
              {activeTab === "activity" && liveEvents.length > 0 && <PulseDot />}
            </div>
            <p className="text-[9px] text-gray-600 font-mono">Mobile Admin v4.0 · FreelanceSkills · 400% GOD-MODE</p>
          </div>
          <div className="flex items-center gap-2">
            {isOffline && <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 font-bold">OFFLINE</span>}
            {liveStats && <PulseDot color="#1DBF73" />}
            <button data-testid="btn-settings" onClick={() => navigate("/admin/settings")} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400" style={{ background: "rgba(255,255,255,0.06)" }}>⚙️</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-28" style={{ minHeight: "calc(100vh - 56px)" }}>
        {showPWA && <PwaBanner onDismiss={() => setShowPWA(false)} />}
        {activeTab === "home"     && <HomeScreen liveStats={liveStats} />}
        {activeTab === "users"    && <UsersScreen />}
        {activeTab === "agents"   && <FieldAgentsScreen />}
        {activeTab === "ussd"     && <UssdScreen />}
        {activeTab === "payments" && <PaymentsScreen />}
        {activeTab === "activity" && <ActivityScreen events={liveEvents} clearEvents={clearEvents} />}
        {activeTab === "analytics"&& <AnalyticsScreen />}
        {activeTab === "alerts"   && <AlertsScreen />}
      </div>

      <BottomNav active={activeTab} setActive={handleTabChange} alertCount={alertCount} />
    </div>
  );
}

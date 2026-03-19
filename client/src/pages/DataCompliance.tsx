/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DATA COMPLIANCE DEPARTMENT v2.0 — Section 32                               ║
 * ║  client/src/pages/DataCompliance.tsx                                        ║
 * ║                                                                              ║
 * ║  10 Tabs (up from 8):                                                        ║
 * ║  1. Dashboard   — live score, 6-jurisdiction matrix, KPIs, dept hooks       ║
 * ║  2. DSR Queue   — AI orchestrator, USSD panel, SLA countdown                ║
 * ║  3. Data Inventory — AI DB scanner, PII discovery, risk mapping             ║
 * ║  4. Export & Audit — portability, hash-chain certs, deletion orchestrator   ║
 * ║  5. Retention   — legal holds, auto-purge, scheduler                        ║
 * ║  6. Breach      — 72hr clock, AI regulator report generator                 ║
 * ║  7. DPIA        — AI generator, DPO workflow, feature-checker               ║
 * ║  8. AI Scanner  — full 6-jurisdiction posture audit                         ║
 * ║  9. Integrations — 18-dept hooks, sync status, coverage radar               ║
 * ║  10. Africa     — USSD DSR, 8 languages, mobile-money, 6-country coverage  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, FileText, Database, Download, Clock, AlertOctagon, FileCheck, Search,
  RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronRight, Globe, Lock,
  Trash2, Play, Plus, Zap, Activity, Network, MapPin, Link2, Layers,
  Hash, Bot, Languages, Phone, Fingerprint,
} from "lucide-react";

// ─── Tab Definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",    label: "Dashboard",       icon: Shield,        color: "emerald" },
  { id: "dsr",         label: "DSR Queue",        icon: FileText,      color: "blue" },
  { id: "inventory",   label: "Data Inventory",   icon: Database,      color: "violet" },
  { id: "export",      label: "Export & Audit",   icon: Download,      color: "amber" },
  { id: "retention",   label: "Retention",        icon: Clock,         color: "orange" },
  { id: "breach",      label: "Breach",           icon: AlertOctagon,  color: "red" },
  { id: "dpia",        label: "DPIA",             icon: FileCheck,     color: "teal" },
  { id: "scanner",     label: "AI Scanner",       icon: Search,        color: "pink" },
  { id: "integrations",label: "Integrations",     icon: Network,       color: "cyan" },
  { id: "africa",      label: "Africa",           icon: MapPin,        color: "yellow" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Styling Maps ─────────────────────────────────────────────────────────────
const TAB_ACTIVE: Record<string, string> = { emerald: "border-emerald-500 text-emerald-300 bg-emerald-950/20", blue: "border-blue-500 text-blue-300 bg-blue-950/20", violet: "border-violet-500 text-violet-300 bg-violet-950/20", amber: "border-amber-500 text-amber-300 bg-amber-950/20", orange: "border-orange-500 text-orange-300 bg-orange-950/20", red: "border-red-500 text-red-300 bg-red-950/20", teal: "border-teal-500 text-teal-300 bg-teal-950/20", pink: "border-pink-500 text-pink-300 bg-pink-950/20", cyan: "border-cyan-500 text-cyan-300 bg-cyan-950/20", yellow: "border-yellow-500 text-yellow-300 bg-yellow-950/20" };
const RISK_COLOR: Record<string, string> = { low: "text-green-400 bg-green-900/30", medium: "text-yellow-400 bg-yellow-900/30", high: "text-orange-400 bg-orange-900/30", critical: "text-red-400 bg-red-900/30" };
const STATUS_COLOR: Record<string, string> = { pending: "text-yellow-400 bg-yellow-900/30", processing: "text-blue-400 bg-blue-900/30", completed: "text-green-400 bg-green-900/30", rejected: "text-red-400 bg-red-900/30", closed: "text-gray-400 bg-gray-800", detected: "text-orange-400 bg-orange-900/30", investigating: "text-yellow-400 bg-yellow-900/30", contained: "text-blue-400 bg-blue-900/30", notified: "text-green-400 bg-green-900/30", draft: "text-gray-400 bg-gray-800", review: "text-yellow-400 bg-yellow-900/30", approved: "text-green-400 bg-green-900/30", active: "text-green-400 bg-green-900/30" };

function badge(label: string, cls: string) { return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>; }
function kpiCard(label: string, value: any, sub: string, warn?: boolean) {
  return (
    <div className={`bg-gray-900/60 border ${warn ? "border-red-800/60" : "border-gray-800"} rounded-xl p-3 text-center`}>
      <div className={`text-2xl font-bold ${warn ? "text-red-300" : "text-white"}`}>{value ?? "–"}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      <div className="text-xs text-gray-600">{sub}</div>
    </div>
  );
}

// ─── 1. Dashboard ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dashboard"], refetchInterval: 30000 });
  if (isLoading) return <div className="text-gray-500 py-12 text-center text-sm">Loading compliance dashboard...</div>;
  const k = data?.kpis || {}; const matrix = data?.matrix || {};
  const score = data?.overallScore ?? 0;
  const scoreColor = score >= 90 ? "text-emerald-400" : score >= 70 ? "text-yellow-400" : "text-red-400";
  const scoreRing = score >= 90 ? "stroke-emerald-500" : score >= 70 ? "stroke-yellow-500" : "stroke-red-500";
  const circ = 2 * Math.PI * 54; const dash = circ - (score / 100) * circ;
  const regs = Object.entries(matrix) as [string, any][];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2"><Shield size={15} /> Compliance Health — 6 Jurisdictions</h2><p className="text-xs text-gray-500 mt-0.5">POPIA · GDPR · CCPA · NDPR · LGPD · DPA(KE) — Africa-first, AI-native</p></div>
        <button data-testid="button-refresh-dashboard" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-xs text-emerald-300"><RefreshCw size={10} />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
          <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={64} cy={64} r={54} fill="none" stroke="#1f2937" strokeWidth={12} />
            <circle cx={64} cy={64} r={54} fill="none" className={scoreRing} strokeWidth={12} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 64 64)" />
            <text x={64} y={68} textAnchor="middle" fill="currentColor" className={scoreColor} fontSize={28} fontWeight={700}>{score}</text>
            <text x={64} y={86} textAnchor="middle" fill="#6b7280" fontSize={11}>/ 100</text>
          </svg>
          <p className="text-xs text-gray-400 mt-1">Overall Compliance Score</p>
          <span className={`mt-1 px-2 py-0.5 rounded text-xs ${score >= 90 ? "bg-emerald-900/40 text-emerald-300" : score >= 70 ? "bg-yellow-900/40 text-yellow-300" : "bg-red-900/40 text-red-300"}`}>{data?.overallStatus?.toUpperCase()}</span>
        </div>
        <div className="md:col-span-3 grid grid-cols-3 gap-3">
          {kpiCard("Open DSRs", k.pendingDsr, `of ${k.totalDsr} total`, k.pendingDsr > 5)}
          {kpiCard("SLA Breaches", k.slaBreaches, "requests overdue", k.slaBreaches > 0)}
          {kpiCard("Active Breaches", k.activeBreach, "72hr clock running", k.activeBreach > 0)}
          {kpiCard("Legal Holds", k.legalHolds, "retention overrides", false)}
          {kpiCard("Deletion Certs", k.certificates, "SHA-256 chain", false)}
          {kpiCard("Dept Integrations", k.deptIntegrations, "of 18 active", false)}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {regs.map(([reg, v]) => {
          const sc = v.score ?? 0; const c = sc >= 90 ? "border-emerald-800/50 bg-emerald-950/20" : sc >= 70 ? "border-yellow-800/50 bg-yellow-950/20" : "border-red-800/50 bg-red-950/20"; const tc = sc >= 90 ? "text-emerald-300" : sc >= 70 ? "text-yellow-300" : "text-red-300";
          return (
            <div key={reg} data-testid={`regulation-${reg.toLowerCase()}`} className={`bg-gray-900/60 border rounded-xl p-4 ${c}`}>
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-white">{reg}</span><span className={`text-lg font-bold ${tc}`}>{sc}</span></div>
              <div className="w-full bg-gray-800 rounded h-1.5 mb-2"><div className={`h-full rounded ${sc >= 90 ? "bg-emerald-500" : sc >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${sc}%` }} /></div>
              <p className="text-xs text-gray-600">{v.authority}</p>
              {v.keyRisks?.slice(0, 1).map((r: string, i: number) => <p key={i} className="text-xs text-gray-700 mt-0.5">⚠ {r}</p>)}
            </div>
          );
        })}
      </div>
      {((data?.slaBreaches?.length > 0) || (data?.activeBreach?.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.slaBreaches?.length > 0 && <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-4"><h3 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1.5"><AlertTriangle size={11} /> SLA Breached ({data.slaBreaches.length})</h3>{data.slaBreaches.slice(0, 3).map((d: any) => <div key={d.id} className="text-xs text-gray-400 py-1 border-b border-red-900/30">{d.reference} — {d.user_email} — overdue</div>)}</div>}
          {data.activeBreach?.length > 0 && <div className="bg-orange-950/20 border border-orange-800/50 rounded-xl p-4"><h3 className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-1.5"><AlertOctagon size={11} /> Active Breaches ({data.activeBreach.length})</h3>{data.activeBreach.slice(0, 3).map((b: any) => <div key={b.id} className="text-xs text-gray-400 py-1 border-b border-orange-900/30">{b.reference} — {b.severity}</div>)}</div>}
        </div>
      )}
    </div>
  );
}

// ─── 2. DSR Queue (upgraded with AI Orchestrator) ────────────────────────────
function DsrQueueTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [orchResult, setOrchResult] = useState<Record<number, any>>({});
  const [orchLoading, setOrchLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ user_email: "", user_name: "", request_type: "erasure", jurisdiction: "POPIA", description: "", consent_language: "en" });
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dsr"], refetchInterval: 30000 });

  const processMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => { const r = await fetch(`/api/compliance/dsr/${id}/process`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }),
  });
  const createMutation = useMutation({
    mutationFn: async (body: any) => { const r = await fetch("/api/compliance/dsr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }); setShowCreate(false); },
  });
  const notifyMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/dsr/${id}/notify-user`, { method: "POST" }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }),
  });

  async function runOrchestrate(dsr: any) {
    setOrchLoading(dsr.id);
    try {
      const r = await fetch(`/api/compliance/dsr/${dsr.id}/orchestrate`, { method: "POST" });
      const resp = await r.json();
      setOrchResult(prev => ({ ...prev, [dsr.id]: resp }));
      setTimeout(() => { qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }); }, 3000);
    } catch { setOrchResult(prev => ({ ...prev, [dsr.id]: { error: "Orchestration failed" } })); }
    setOrchLoading(null);
  }

  const allDsr: any[] = data?.dsr || [];
  const filtered = filter === "all" ? allDsr : allDsr.filter(d => d.status === filter);
  const now = Date.now();
  const slaLabel = (d: any) => {
    if (!d.sla_deadline) return null;
    if (d.slaStatus === "breached") return <span className="text-xs text-red-400 font-medium">OVERDUE</span>;
    if (d.slaStatus === "met") return <span className="text-xs text-green-500">Met</span>;
    const h = d.slaHoursLeft || Math.round((new Date(d.sla_deadline).getTime() - now) / 3600000);
    return <span className={`text-xs ${h < 24 ? "text-red-400" : h < 72 ? "text-yellow-400" : "text-gray-400"}`}>{h}h left</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-blue-300 flex items-center gap-2"><FileText size={15} /> Data Subject Request Queue</h2><p className="text-xs text-gray-500 mt-0.5">GDPR Art. 15-22 · POPIA s.23-25 · 30-day SLA · AI Orchestrator finds data across all 18 departments in &lt;48h</p></div>
        <div className="flex gap-2">
          <button data-testid="button-refresh-dsr" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={10} /></button>
          <button data-testid="button-create-dsr" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 border border-blue-700/40 rounded-lg text-xs text-blue-300"><Plus size={11} />New DSR</button>
        </div>
      </div>
      {showCreate && (
        <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-300">New Data Subject Request</p>
          <div className="grid grid-cols-2 gap-3">
            <input data-testid="input-dsr-email" placeholder="User email *" value={form.user_email} onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 col-span-2" />
            <input data-testid="input-dsr-name" placeholder="User name" value={form.user_name} onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
            <select data-testid="select-dsr-type" value={form.request_type} onChange={e => setForm(f => ({ ...f, request_type: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              {["erasure", "access", "portability", "correction", "restriction", "objection"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select data-testid="select-dsr-jurisdiction" value={form.jurisdiction} onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              {["POPIA", "GDPR", "CCPA", "NDPR", "LGPD", "DPA"].map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <select data-testid="select-dsr-language" value={form.consent_language} onChange={e => setForm(f => ({ ...f, consent_language: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              {[["en","English"],["zu","isiZulu"],["xh","isiXhosa"],["af","Afrikaans"],["sw","Kiswahili"],["ha","Hausa"],["yo","Yoruba"],["fr","Français"]].map(([c, l]) => <option key={c} value={c}>{l}</option>)}
            </select>
            <textarea data-testid="input-dsr-desc" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 col-span-2 resize-none" />
          </div>
          <div className="flex gap-2">
            <button data-testid="button-submit-dsr" onClick={() => createMutation.mutate(form)} disabled={!form.user_email || createMutation.isPending} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs text-white disabled:opacity-50">Submit DSR</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-800 rounded-lg text-xs text-gray-400">Cancel</button>
          </div>
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "processing", "completed", "rejected"].map(f => (
          <button key={f} data-testid={`filter-dsr-${f}`} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs transition-all ${filter === f ? "bg-blue-900/50 text-blue-300 border border-blue-700/40" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}>{f} ({f === "all" ? allDsr.length : allDsr.filter(d => d.status === f).length})</button>
        ))}
      </div>
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-3">
          {filtered.map((d: any) => (
            <div key={d.id} data-testid={`dsr-row-${d.id}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-blue-300">{d.reference}</span>
                    {badge(d.request_type, "bg-blue-900/40 text-blue-300")}
                    {badge(d.status, STATUS_COLOR[d.status] || "text-gray-400 bg-gray-800")}
                    {badge(d.jurisdiction, "bg-gray-800 text-gray-500")}
                    {d.channel === "ussd" && badge("USSD", "bg-yellow-900/40 text-yellow-300")}
                    {d.consent_language && d.consent_language !== "en" && badge(d.consent_language.toUpperCase(), "bg-violet-900/40 text-violet-300")}
                    {slaLabel(d)}
                  </div>
                  <p className="text-sm text-gray-300">{d.user_name || "–"} <span className="text-gray-600 text-xs">{d.user_email}</span></p>
                  {d.description && <p className="text-xs text-gray-600 mt-1">{d.description}</p>}
                  {(d.orchestration_data || d.orchestration_status) && (
                    <div className="mt-2 bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-2">
                      <p className="text-xs text-emerald-300 font-medium">AI Orchestrated ✓</p>
                      {d.orchestration_data?.summary && <p className="text-xs text-gray-500 mt-0.5">{d.orchestration_data.summary?.slice(0, 120)}...</p>}
                      {d.orchestration_data?.tablesWithData !== undefined && <p className="text-xs text-gray-600">{d.orchestration_data.tablesWithData} tables · {d.orchestration_data.totalRecords} records · Risk: {d.orchestration_data.riskLevel}</p>}
                    </div>
                  )}
                  {orchResult[d.id] && !orchResult[d.id].error && (
                    <div className="mt-2 bg-blue-950/20 border border-blue-800/30 rounded-lg p-2">
                      <p className="text-xs text-blue-300">Orchestration queued — scanning 18 departments...</p>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  {["pending", "processing"].includes(d.status) && (
                    <button data-testid={`button-orchestrate-${d.id}`} onClick={() => runOrchestrate(d)} disabled={orchLoading === d.id} className="flex items-center gap-1.5 px-2 py-1.5 bg-pink-900/40 border border-pink-700/30 rounded text-xs text-pink-300 disabled:opacity-50">
                      {orchLoading === d.id ? <RefreshCw size={10} className="animate-spin" /> : <Bot size={10} />}AI Orchestrate
                    </button>
                  )}
                  {d.status === "pending" && <button data-testid={`button-process-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "approve" })} className="px-2 py-1.5 bg-blue-900/40 border border-blue-700/30 rounded text-xs text-blue-300">Process</button>}
                  {d.status === "processing" && <button data-testid={`button-complete-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "complete" })} className="px-2 py-1.5 bg-green-900/40 border border-green-700/30 rounded text-xs text-green-300">Complete</button>}
                  {["pending", "processing"].includes(d.status) && <button data-testid={`button-reject-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "reject" })} className="px-2 py-1.5 bg-red-900/30 border border-red-800/30 rounded text-xs text-red-400">Reject</button>}
                  {d.status === "completed" && !d.user_notified_at && <button data-testid={`button-notify-user-${d.id}`} onClick={() => notifyMutation.mutate(d.id)} className="px-2 py-1.5 bg-emerald-900/40 border border-emerald-700/30 rounded text-xs text-emerald-300">Notify User</button>}
                  {d.user_notified_at && <span className="text-xs text-emerald-600">Notified ✓</span>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-gray-600 text-center py-8">No DSRs for this filter.</div>}
        </div>
      )}
    </div>
  );
}

// ─── 3. Data Inventory (upgraded with AI Auto-Scan) ──────────────────────────
function DataInventoryTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/inventory"], refetchInterval: 60000 });
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  async function runAiScan() {
    setScanning(true); setScanResult(null);
    try {
      const r = await fetch("/api/compliance/inventory/ai-scan", { method: "POST" });
      const resp = await r.json();
      setScanResult(resp);
      qc.invalidateQueries({ queryKey: ["/api/compliance/inventory"] });
    } catch { setScanResult({ error: "Scan failed" }); }
    setScanning(false);
  }

  const items: any[] = data?.items || []; const summary = data?.summary || {};
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-violet-300 flex items-center gap-2"><Database size={15} /> Data Inventory — Art. 30 Records of Processing</h2><p className="text-xs text-gray-500 mt-0.5">AI auto-scans every PostgreSQL table · maps GDPR/POPIA categories · tracks 3rd-party processors</p></div>
        <div className="flex gap-2">
          <button data-testid="button-ai-scan-inventory" onClick={runAiScan} disabled={scanning} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-900/40 border border-pink-700/40 rounded-lg text-xs text-pink-300 disabled:opacity-50">
            {scanning ? <><RefreshCw size={10} className="animate-spin" />Scanning DB...</> : <><Bot size={10} />AI Auto-Scan DB</>}
          </button>
          <button data-testid="button-refresh-inventory" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900/30 border border-violet-700/40 rounded-lg text-xs text-violet-300"><RefreshCw size={10} />Refresh</button>
        </div>
      </div>
      {scanResult && (
        <div className={`${scanResult.error ? "bg-red-950/20 border-red-800/40" : "bg-emerald-950/20 border-emerald-800/40"} border rounded-xl p-3`}>
          {scanResult.error ? <p className="text-xs text-red-300">{scanResult.error}</p> : (
            <div><p className="text-xs text-emerald-300 font-semibold">{scanResult.message}</p><p className="text-xs text-gray-500 mt-0.5">{scanResult.scanMethod}</p></div>
          )}
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {[{ label: "Total items", value: summary.total, color: "text-white" }, { label: "Critical/High", value: (summary.critical || 0) + (summary.high || 0), color: "text-red-300" }, { label: "Cross-border", value: summary.crossBorder, color: "text-orange-300" }, { label: "3rd-party processors", value: summary.thirdParties, color: "text-yellow-300" }].map((s, i) => (
          <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value ?? "–"}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} data-testid={`inventory-${item.id}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    {badge(item.risk_level, RISK_COLOR[item.risk_level] || "text-gray-400 bg-gray-800")}
                    {badge(item.category, "bg-violet-900/40 text-violet-300")}
                    {item.ai_discovered && badge("AI discovered", "bg-pink-900/40 text-pink-300")}
                    {item.cross_border && badge("Cross-border", "bg-orange-900/40 text-orange-300")}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.purpose}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span><span className="text-gray-500">Storage:</span> {item.storage_location}</span>
                    <span><span className="text-gray-500">Legal basis:</span> {item.legal_basis}</span>
                    <span><span className="text-gray-500">Retention:</span> {item.retention_period}</span>
                    {item.popia_section && <span className="text-emerald-700">POPIA {item.popia_section}</span>}
                    {item.gdpr_article && <span className="text-blue-700">GDPR {item.gdpr_article}</span>}
                  </div>
                  {((item.data_types as string[]) || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">{(item.data_types as string[]).map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{t}</span>)}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex gap-1">{item.encryption_at_rest && <Lock size={11} className="text-green-600" />}{item.encryption_in_transit && <Globe size={11} className="text-green-600" />}</div>
                  {((item.third_parties as string[]) || []).length > 0 && <p className="text-xs text-gray-600 mt-1">3P: {(item.third_parties as string[]).join(", ")}</p>}
                </div>
              </div>
              {item.notes && <p className="text-xs text-gray-700 mt-2 border-t border-gray-800 pt-2">{item.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 4. Export & Audit (upgraded with hash chain) ─────────────────────────────
function ExportAuditTab() {
  const { data: certs } = useQuery<any>({ queryKey: ["/api/compliance/certificates"], refetchInterval: 30000 });
  const { data: chainData, refetch: refetchChain } = useQuery<any>({ queryKey: ["/api/compliance/hash-chain"] });
  const [exportUserId, setExportUserId] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function executeDeletion() {
    if (!deleteUserId || !deleteEmail) return;
    setDeleting(true);
    try { const r = await fetch(`/api/compliance/delete/${deleteUserId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_email: deleteEmail, reason: "Admin-initiated Right to Erasure" }) }); setDeleteResult(await r.json()); }
    catch { setDeleteResult({ error: "Request failed" }); }
    setDeleting(false);
  }
  const certificates: any[] = certs?.certificates || [];
  const chain: any[] = chainData?.chain || [];
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-amber-300 flex items-center gap-2"><Download size={15} /> Export, Erasure &amp; Blockchain Certificate Chain</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5"><Download size={11} /> GDPR Data Export (Art. 20)</h3>
          <p className="text-xs text-gray-500">Machine-readable JSON portability package across all 18 departments.</p>
          <input data-testid="input-export-userid" placeholder="User ID" value={exportUserId} onChange={e => setExportUserId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <button data-testid="button-export-user" onClick={() => exportUserId && window.open(`/api/compliance/export/${exportUserId}`, "_blank")} disabled={!exportUserId} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-900/40 border border-amber-700/40 rounded-lg text-xs text-amber-300 disabled:opacity-50"><Download size={11} />Download Export</button>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><FileCheck size={11} /> Regulator Audit Export</h3>
          <p className="text-xs text-gray-500">IOCO/ICO/NITDA/ANPD-ready: all DSRs, breaches, deletion proofs, DPIAs.</p>
          <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400">{certs?.total ?? 0} certs · {chain.length} chain links · 6 jurisdictions</div>
          <button data-testid="button-audit-export" onClick={() => window.open("/api/compliance/audit", "_blank")} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-700/40 rounded-lg text-xs text-emerald-300"><Download size={11} />Download Regulator Package</button>
        </div>
        <div className="bg-gray-900/60 border border-red-900/30 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-red-300 flex items-center gap-1.5"><Trash2 size={11} /> Right to Erasure (GDPR Art. 17)</h3>
          <p className="text-xs text-gray-500">Anonymise → delete → SHA-256 hash-chain certificate. SARS/FICA records preserved.</p>
          <input data-testid="input-delete-userid" placeholder="User ID *" value={deleteUserId} onChange={e => setDeleteUserId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <input data-testid="input-delete-email" placeholder="User email *" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <button data-testid="button-execute-deletion" onClick={executeDeletion} disabled={!deleteUserId || !deleteEmail || deleting} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/40 border border-red-800/40 rounded-lg text-xs text-red-300 disabled:opacity-50">
            {deleting ? <><RefreshCw size={11} className="animate-spin" />Executing...</> : <><Trash2 size={11} />Execute Erasure + Chain Cert</>}
          </button>
          {deleteResult && !deleteResult.error && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2 space-y-1">
              <p className="text-xs text-emerald-300 font-semibold">{deleteResult.certificate?.certificate_id}</p>
              <p className="text-xs text-gray-600">Chain: {deleteResult.orchestration?.chainHash?.slice(0, 20)}...</p>
            </div>
          )}
        </div>
      </div>
      {/* Blockchain-style hash chain */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><Hash size={11} /> SHA-256 Blockchain-Style Certificate Chain ({chain.length} links)</h3>
          <button onClick={() => refetchChain()} className="text-gray-600 hover:text-gray-400"><RefreshCw size={10} /></button>
        </div>
        <p className="text-xs text-gray-600 mb-3">chain_hash[n] = SHA-256(chain_hash[n-1] + cert_hash[n]) — tamper-evident, court-admissible</p>
        {chain.length === 0 ? <p className="text-gray-700 text-xs text-center py-3">No certificates yet. Execute a deletion above to start the chain.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-600 border-b border-gray-800"><th className="text-left pb-2 pr-3">#</th><th className="text-left pb-2 pr-3">Certificate ID</th><th className="text-left pb-2 pr-3">User</th><th className="text-left pb-2 pr-3">SHA-256</th><th className="text-left pb-2 pr-3">Chain Hash</th><th className="text-left pb-2">Issued</th></tr></thead>
              <tbody>{chain.map((c: any) => (
                <tr key={c.position} data-testid={`chain-${c.position}`} className="border-b border-gray-800/40">
                  <td className="py-2 pr-3 text-gray-600">{c.position}</td>
                  <td className="py-2 pr-3 font-mono text-emerald-300">{c.certificateId}</td>
                  <td className="py-2 pr-3 text-gray-500">{c.userId}</td>
                  <td className="py-2 pr-3 font-mono text-gray-600">{c.sha256?.slice(0, 12)}...</td>
                  <td className="py-2 pr-3 font-mono text-blue-600">{c.chainHash?.slice(0, 12)}...</td>
                  <td className="py-2 text-gray-600">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "–"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 5. Retention (upgraded with Legal Holds) ─────────────────────────────────
function RetentionTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/retention"], refetchInterval: 60000 });
  const [holdForm, setHoldForm] = useState<Record<number, string>>({});

  const runMutation = useMutation({ mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/retention/${id}/run`, { method: "POST" }); return r.json(); }, onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ["/api/compliance/retention"] }) });
  const holdMutation = useMutation({ mutationFn: async ({ id, reason }: { id: number; reason: string }) => { const r = await fetch(`/api/compliance/retention/${id}/hold`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/retention"] }) });
  const releaseHoldMutation = useMutation({ mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/retention/${id}/hold`, { method: "DELETE" }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/retention"] }) });

  const policies: any[] = data?.policies || [];
  const totalHolds = data?.totalLegalHolds ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-orange-300 flex items-center gap-2"><Clock size={15} /> Retention Engine + Legal Hold Override</h2><p className="text-xs text-gray-500 mt-0.5">GDPR Art. 5(1)(e) · POPIA Condition 9 · SARS/FICA/litigation holds suspend auto-purge</p></div>
        <div className="flex items-center gap-3">
          {totalHolds > 0 && <span className="px-2 py-1 bg-yellow-900/40 border border-yellow-700/30 rounded-lg text-xs text-yellow-300">{totalHolds} legal hold(s) active</span>}
          <button data-testid="button-refresh-retention" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/30 border border-orange-700/40 rounded-lg text-xs text-orange-300"><RefreshCw size={10} />Refresh</button>
        </div>
      </div>
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-2">
          {policies.map((p: any) => (
            <div key={p.id} data-testid={`retention-${p.id}`} className={`border rounded-xl p-4 ${p.legal_hold ? "border-yellow-700/50 bg-yellow-950/10" : "border-gray-800 bg-gray-900/60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    {badge(p.data_category, "bg-orange-900/40 text-orange-300")}
                    {badge(p.purge_method, "bg-gray-800 text-gray-400")}
                    {p.auto_purge && !p.legal_hold && <span className="text-xs text-green-400">auto-purge ON</span>}
                    {p.legal_hold && <span className="flex items-center gap-1 text-xs text-yellow-300"><Lock size={9} />LEGAL HOLD</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{p.legal_basis}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span>{p.retention_days} days ({Math.round(p.retention_days / 365 * 10) / 10} yr)</span>
                    <span>Purged: {p.records_purged ?? 0} records</span>
                    <span>Last run: {p.last_run ? new Date(p.last_run).toLocaleDateString() : "never"}</span>
                  </div>
                  {p.legal_hold && p.legal_hold_reason && <p className="text-xs text-yellow-600 mt-1">Hold reason: {p.legal_hold_reason}</p>}
                  {p.notes && <p className="text-xs text-gray-700 mt-1.5 border-t border-gray-800 pt-1.5">{p.notes}</p>}
                  {/* Legal Hold input */}
                  {!p.legal_hold && (
                    <div className="flex gap-2 mt-2">
                      <input placeholder="Hold reason (e.g. SARS audit, litigation)" value={holdForm[p.id] || ""} onChange={e => setHoldForm(f => ({ ...f, [p.id]: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300" />
                      <button data-testid={`button-hold-${p.id}`} onClick={() => holdMutation.mutate({ id: p.id, reason: holdForm[p.id] || "" })} disabled={!holdForm[p.id] || holdMutation.isPending} className="px-2 py-1 bg-yellow-900/40 border border-yellow-700/30 rounded text-xs text-yellow-300 disabled:opacity-50">Place Hold</button>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  <button data-testid={`button-run-retention-${p.id}`} onClick={() => runMutation.mutate(p.id)} disabled={runMutation.isPending || p.legal_hold} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/40 border border-orange-700/30 rounded-lg text-xs text-orange-300 disabled:opacity-50"><Play size={11} />Run Now</button>
                  {p.legal_hold && <button data-testid={`button-release-hold-${p.id}`} onClick={() => releaseHoldMutation.mutate(p.id)} disabled={releaseHoldMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-900/40 border border-yellow-700/30 rounded-lg text-xs text-yellow-300 disabled:opacity-50"><XCircle size={10} />Release Hold</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 6. Breach (upgraded with Regulator Report) ───────────────────────────────
function BreachTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/breaches"], refetchInterval: 20000 });
  const [showCreate, setShowCreate] = useState(false);
  const [reportResult, setReportResult] = useState<Record<number, any>>({});
  const [reportLoading, setReportLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", breach_type: "unauthorized_access", severity: "medium", description: "" });

  const createMutation = useMutation({ mutationFn: async (body: any) => { const r = await fetch("/api/compliance/breaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/compliance/breaches"] }); setShowCreate(false); } });
  const notifyMutation = useMutation({ mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/breaches/${id}/notify`, { method: "POST" }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/breaches"] }) });

  async function generateReport(id: number) {
    setReportLoading(id);
    try { const r = await fetch(`/api/compliance/breaches/${id}/report`, { method: "POST" }); const data = await r.json(); setReportResult(prev => ({ ...prev, [id]: data })); }
    catch { setReportResult(prev => ({ ...prev, [id]: { error: "Generation failed" } })); }
    setReportLoading(null);
  }

  const breaches: any[] = data?.breaches || [];
  const sevBorder: Record<string, string> = { critical: "border-red-600 bg-red-950/30", high: "border-orange-700/60 bg-orange-950/20", medium: "border-yellow-800/50 bg-yellow-950/20", low: "border-gray-700 bg-gray-900/40" };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-red-300 flex items-center gap-2"><AlertOctagon size={15} /> Breach Detection &amp; 72-Hour Notification</h2><p className="text-xs text-gray-500 mt-0.5">GDPR Art. 33 · POPIA s.22 · AI generates IOCO/ICO formal regulator report with one click</p></div>
        <div className="flex gap-2">
          <button data-testid="button-refresh-breach" onClick={() => refetch()} className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={10} /></button>
          <button data-testid="button-report-breach" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 border border-red-800/40 rounded-lg text-xs text-red-300"><Plus size={11} />Report Breach</button>
        </div>
      </div>
      {showCreate && (
        <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-red-300">72-Hour Clock Starts NOW</p>
          <input data-testid="input-breach-title" placeholder="Breach title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <div className="grid grid-cols-2 gap-3">
            <select data-testid="select-breach-type" value={form.breach_type} onChange={e => setForm(f => ({ ...f, breach_type: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">{["unauthorized_access", "data_leak", "ransomware", "insider_threat", "accidental_disclosure", "third_party"].map(t => <option key={t} value={t}>{t}</option>)}</select>
            <select data-testid="select-breach-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">{["low", "medium", "high", "critical"].map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <textarea data-testid="input-breach-description" placeholder="Describe the breach..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 resize-none" />
          <div className="flex gap-2">
            <button data-testid="button-submit-breach" onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending} className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-xs text-white disabled:opacity-50">Start 72hr Clock</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-800 rounded-lg text-xs text-gray-400">Cancel</button>
          </div>
        </div>
      )}
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-3">
          {breaches.map((b: any) => {
            const hrs = b.hoursToNotifyDeadline; const overdue = b.notificationOverdue;
            const clockColor = overdue ? "text-red-400" : hrs !== null && hrs < 24 ? "text-orange-400" : hrs !== null && hrs < 48 ? "text-yellow-400" : "text-gray-500";
            const rpt = reportResult[b.id];
            return (
              <div key={b.id} data-testid={`breach-${b.id}`} className={`border rounded-xl p-4 ${sevBorder[b.severity] || "border-gray-700 bg-gray-900/40"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-red-400">{b.reference}</span>
                      {badge(b.severity, RISK_COLOR[b.severity] || "text-gray-400 bg-gray-800")}
                      {badge(b.status, STATUS_COLOR[b.status] || "text-gray-400 bg-gray-800")}
                    </div>
                    <p className="text-sm text-white mb-1">{b.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Detected: {b.detected_at ? new Date(b.detected_at).toLocaleString() : "–"}</span>
                      {hrs !== null && !b.authority_notified_at && <span className={`font-semibold ${clockColor}`}>{overdue ? "OVERDUE" : `${hrs}h to notify IOCO`}</span>}
                      {b.authority_notified_at && <span className="text-green-400">IOCO notified ✓</span>}
                      {(b as any).regulator_report_at && <span className="text-blue-400">Regulator report ✓</span>}
                    </div>
                    {/* Regulator Report Result */}
                    {rpt && !rpt.error && (
                      <div className="mt-2 bg-blue-950/20 border border-blue-800/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs text-blue-300 font-semibold">{rpt.report?.letterhead}</p>
                        <p className="text-xs text-gray-500">To: {rpt.report?.toAuthority}</p>
                        <p className="text-xs text-gray-500">Section 1: {rpt.report?.section1_natureOfBreach?.slice(0, 100)}...</p>
                        <p className="text-xs text-gray-600">Timeline: {rpt.report?.notificationTimeline}</p>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    <button data-testid={`button-generate-report-${b.id}`} onClick={() => generateReport(b.id)} disabled={reportLoading === b.id} className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-900/40 border border-blue-700/30 rounded text-xs text-blue-300 disabled:opacity-50">
                      {reportLoading === b.id ? <RefreshCw size={10} className="animate-spin" /> : <FileCheck size={10} />}AI Report
                    </button>
                    {!b.authority_notified_at && <button data-testid={`button-notify-authority-${b.id}`} onClick={() => notifyMutation.mutate(b.id)} disabled={notifyMutation.isPending} className="px-2 py-1.5 bg-red-900/50 border border-red-700/40 rounded text-xs text-red-300 disabled:opacity-50">Notify IOCO</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {breaches.length === 0 && <div className="text-gray-600 text-center text-sm py-8">No breach incidents recorded.</div>}
        </div>
      )}
    </div>
  );
}

// ─── 7. DPIA (upgraded with Feature Checker) ──────────────────────────────────
function DpiaTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dpia"], refetchInterval: 60000 });
  const [featureForm, setFeatureForm] = useState({ featureName: "", description: "", dataCategories: "" });
  const [featureResult, setFeatureResult] = useState<any>(null);
  const [featureLoading, setFeatureLoading] = useState(false);

  const genMutation = useMutation({ mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/dpia/${id}/generate`, { method: "POST" }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dpia"] }) });
  const approveMutation = useMutation({ mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/dpia/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: "Approved by DPO" }) }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dpia"] }) });

  async function checkFeature() {
    setFeatureLoading(true); setFeatureResult(null);
    try {
      const r = await fetch("/api/compliance/dpia/feature-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featureName: featureForm.featureName, description: featureForm.description, dataCategories: featureForm.dataCategories.split(",").map(s => s.trim()).filter(Boolean) }) });
      setFeatureResult(await r.json());
    } catch { setFeatureResult({ error: "Check failed" }); }
    setFeatureLoading(false);
  }

  const dpias: any[] = data?.dpias || [];
  const residualColor: Record<string, string> = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-teal-300 flex items-center gap-2"><FileCheck size={15} /> Data Protection Impact Assessments (DPIA)</h2><p className="text-xs text-gray-500 mt-0.5">GDPR Art. 35 — mandatory for high-risk processing. Feature checker + AI generator + DPO workflow.</p></div>
        <button data-testid="button-refresh-dpia" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/30 border border-teal-700/40 rounded-lg text-xs text-teal-300"><RefreshCw size={10} />Refresh</button>
      </div>
      {/* DPIA Feature Checker */}
      <div className="bg-teal-950/20 border border-teal-800/40 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-teal-300 mb-2 flex items-center gap-1.5"><Zap size={11} /> New Feature DPIA Checker — Art. 35(3) Analysis</h3>
        <p className="text-xs text-gray-500 mb-3">AI determines if your new feature needs a DPIA before launch.</p>
        <div className="grid grid-cols-1 gap-2">
          <input data-testid="input-feature-name" placeholder="Feature name (e.g. AI Video Interview Screening)" value={featureForm.featureName} onChange={e => setFeatureForm(f => ({ ...f, featureName: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <textarea data-testid="input-feature-desc" placeholder="Feature description and processing activities..." value={featureForm.description} onChange={e => setFeatureForm(f => ({ ...f, description: e.target.value }))} rows={2} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 resize-none" />
          <input data-testid="input-feature-categories" placeholder="Data categories (biometric, ai_scoring, location)" value={featureForm.dataCategories} onChange={e => setFeatureForm(f => ({ ...f, dataCategories: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <button data-testid="button-check-feature" onClick={checkFeature} disabled={!featureForm.featureName || !featureForm.description || featureLoading} className="flex items-center gap-2 px-4 py-2 bg-teal-900/40 border border-teal-700/40 rounded-lg text-xs text-teal-300 disabled:opacity-50">
            {featureLoading ? <><RefreshCw size={10} className="animate-spin" />Checking...</> : <><Zap size={10} />Check if DPIA Required</>}
          </button>
        </div>
        {featureResult && !featureResult.error && (
          <div className={`mt-3 border rounded-lg p-3 ${featureResult.dpiaRequired ? "border-red-800/40 bg-red-950/20" : "border-green-800/40 bg-green-950/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              {featureResult.dpiaRequired ? <AlertTriangle size={12} className="text-red-400" /> : <CheckCircle size={12} className="text-green-400" />}
              <span className={`text-sm font-semibold ${featureResult.dpiaRequired ? "text-red-300" : "text-green-300"}`}>{featureResult.dpiaRequired ? "DPIA REQUIRED" : "No DPIA required"}</span>
              <span className="text-xs text-gray-500">({featureResult.certainty}) — {featureResult.urgency}</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{featureResult.recommendation}</p>
            {featureResult.criteria?.filter((c: any) => c.applies).map((c: any, i: number) => <p key={i} className="text-xs text-orange-400">• {c.criterion}: {c.reason}</p>)}
            {featureResult.prefilledTitle && <p className="text-xs text-teal-600 mt-1">Pre-filled DPIA title: {featureResult.prefilledTitle}</p>}
          </div>
        )}
      </div>
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-3">
          {dpias.map((d: any) => (
            <div key={d.id} data-testid={`dpia-${d.id}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-white">{d.title}</span>
                    {badge(d.status, STATUS_COLOR[d.status] || "text-gray-400 bg-gray-800")}
                    {d.dpo_approved && <span className="text-xs text-green-400">DPO approved ✓</span>}
                    {d.ai_generated && badge("AI generated", "bg-pink-900/40 text-pink-300")}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{d.purpose}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span>Residual risk: <span className={residualColor[d.residual_risk] || "text-gray-400"}>{d.residual_risk}</span></span>
                    <span>Jurisdictions: {((d.jurisdictions as string[]) || []).join(", ")}</span>
                    {d.review_date && <span>Review: {new Date(d.review_date).toLocaleDateString()}</span>}
                  </div>
                  {d.dpo_notes && <p className="text-xs text-gray-600 mt-2 border-t border-gray-800 pt-2">{d.dpo_notes}</p>}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  {!d.ai_generated && <button data-testid={`button-generate-dpia-${d.id}`} onClick={() => genMutation.mutate(d.id)} disabled={genMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-900/40 border border-pink-700/30 rounded-lg text-xs text-pink-300 disabled:opacity-50"><Zap size={10} />AI Generate</button>}
                  {d.status !== "approved" && <button data-testid={`button-approve-dpia-${d.id}`} onClick={() => approveMutation.mutate(d.id)} disabled={approveMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/40 border border-teal-700/30 rounded-lg text-xs text-teal-300 disabled:opacity-50"><CheckCircle size={10} />DPO Approve</button>}
                </div>
              </div>
            </div>
          ))}
          {dpias.length === 0 && <div className="text-gray-600 text-center text-sm py-8">No DPIAs yet.</div>}
        </div>
      )}
    </div>
  );
}

// ─── 8. AI Scanner ────────────────────────────────────────────────────────────
function AiScannerTab() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: matrixData } = useQuery<any>({ queryKey: ["/api/compliance/matrix"] });
  const controls = matrixData?.controls || [];

  async function runScan() {
    setLoading(true); setResult(null);
    try { const r = await fetch("/api/compliance/scan", { method: "POST", headers: { "Content-Type": "application/json" } }); setResult(await r.json()); }
    catch { setResult({ error: "Scan failed." }); }
    setLoading(false);
  }
  const sevBg: Record<string, string> = { critical: "border-red-800/60 bg-red-950/20", high: "border-orange-800/50 bg-orange-950/20", medium: "border-yellow-800/40 bg-yellow-950/20", low: "border-gray-700 bg-gray-900/40" };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-pink-300 flex items-center gap-2"><Search size={15} /> AI Compliance Scanner — GPT-4o-mini</h2><p className="text-xs text-gray-500 mt-0.5">POPIA · GDPR · CCPA · NDPR · LGPD · DPA(KE) full posture audit. Finds gaps, risk scores, remediation priority.</p></div>
        <button data-testid="button-run-scan" onClick={runScan} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-pink-900/40 border border-pink-700/40 rounded-lg text-sm text-pink-300 disabled:opacity-50">
          {loading ? <><RefreshCw size={13} className="animate-spin" />Scanning...</> : <><Search size={13} />Run Full Compliance Scan</>}
        </button>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3">Controls — {controls.filter((c: any) => c.status === "implemented").length}/{controls.length} implemented · 18 controls across 6 jurisdictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {controls.map((c: any) => (
            <div key={c.id} data-testid={`control-${c.id}`} className="flex items-start gap-2">
              {c.status === "implemented" ? <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> : <AlertTriangle size={12} className="text-yellow-400 mt-0.5 shrink-0" />}
              <div><p className="text-xs text-gray-300">{c.name}</p>{c.gap && <p className="text-xs text-yellow-600">{c.gap}</p>}</div>
            </div>
          ))}
        </div>
      </div>
      {result && !result.error && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "Score", val: result.score, color: result.score >= 80 ? "text-emerald-400" : "text-yellow-400" }, { label: "Risk", val: result.overallRisk?.toUpperCase(), color: RISK_COLOR[result.overallRisk]?.split(" ")[0] || "text-gray-400" }, { label: "Findings", val: result.findings?.length, color: "text-white" }, { label: "Maturity", val: result.maturityLevel, color: "text-blue-300" }].map((s, i) => (
              <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center"><div className={`text-lg font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-gray-500">{s.label}</div></div>
            ))}
          </div>
          {result.findings?.length > 0 && (
            <div className="space-y-2">
              {result.findings.map((f: any) => (
                <div key={f.id} data-testid={`finding-${f.id}`} className={`border rounded-xl p-3 ${sevBg[f.severity] || "border-gray-700 bg-gray-900/40"}`}>
                  <div className="flex items-center gap-2 mb-1">{badge(f.severity, RISK_COLOR[f.severity] || "")}{badge(f.regulation, "bg-blue-900/40 text-blue-300")}{badge(`effort: ${f.effort}`, "bg-gray-800 text-gray-500")}</div>
                  <p className="text-sm text-white">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                  <p className="text-xs text-emerald-600 mt-1">{f.recommendation}</p>
                </div>
              ))}
            </div>
          )}
          {result.priorityActions?.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-pink-300 mb-2">Priority Actions</h3>
              {result.priorityActions.map((a: string, i: number) => <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-800/40"><ChevronRight size={10} className="text-pink-500 mt-0.5 shrink-0" /><p className="text-xs text-gray-400">{a}</p></div>)}
            </div>
          )}
          {result.scannedAt && <p className="text-xs text-gray-700 text-right">Scanned: {new Date(result.scannedAt).toLocaleString()} · {result.scanVersion}</p>}
        </div>
      )}
      {!result && !loading && <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center"><Search size={32} className="mx-auto mb-3 text-pink-500 opacity-40" /><p className="text-gray-500 text-sm">Run the scanner to get a full 6-jurisdiction compliance report powered by GPT-4o-mini.</p></div>}
    </div>
  );
}

// ─── 9. Integrations Tab (NEW) ────────────────────────────────────────────────
function IntegrationsTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/integrations"], refetchInterval: 60000 });
  const [syncing, setSyncing] = useState(false);

  async function syncAll() {
    setSyncing(true);
    await fetch("/api/compliance/integrations/sync", { method: "POST", headers: { "Content-Type": "application/json" } });
    setSyncing(false); refetch();
  }

  const integrations: any[] = data?.integrations || [];
  const ROLE_COLORS: Record<string, string> = { export: "bg-blue-900/40 text-blue-300", deletion: "bg-red-900/30 text-red-300", dpia: "bg-teal-900/40 text-teal-300", breach: "bg-orange-900/30 text-orange-300", legal_hold: "bg-yellow-900/40 text-yellow-300", dsr_ticket: "bg-violet-900/40 text-violet-300", dsr_notify: "bg-emerald-900/40 text-emerald-300", consent: "bg-pink-900/30 text-pink-300", access_control: "bg-gray-800 text-gray-400", consent_gating: "bg-pink-900/30 text-pink-300", ccpa: "bg-purple-900/40 text-purple-300", evidence: "bg-amber-900/30 text-amber-300", sla_alerts: "bg-cyan-900/30 text-cyan-300", legal_pages: "bg-gray-800 text-gray-400" };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-cyan-300 flex items-center gap-2"><Network size={15} /> 18-Department Compliance Integrations</h2><p className="text-xs text-gray-500 mt-0.5">Native compliance hooks across every department. Auto-tickets, notifications, legal page updates, consent gating.</p></div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{data?.active ?? "–"}/18 active · Coverage: {data?.coverageScore ?? "–"}%</span>
          <button data-testid="button-sync-all" onClick={syncAll} disabled={syncing} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/40 rounded-lg text-xs text-cyan-300 disabled:opacity-50">
            {syncing ? <><RefreshCw size={10} className="animate-spin" />Syncing...</> : <><Link2 size={10} />Sync All</>}
          </button>
        </div>
      </div>
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((d: any) => (
            <div key={d.id} data-testid={`integration-${d.id}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{d.name}</span>{badge(d.status, STATUS_COLOR[d.status] || "text-gray-400 bg-gray-800")}</div>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{d.endpoint}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0">{d.recordsAccessible?.toLocaleString()} records</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{d.dataContribution}</p>
              <div className="flex flex-wrap gap-1">
                {d.complianceRole?.map((r: string) => <span key={r} className={`px-1.5 py-0.5 rounded text-xs ${ROLE_COLORS[r] || "bg-gray-800 text-gray-500"}`}>{r}</span>)}
              </div>
              {d.recordTypes?.length > 0 && <p className="text-xs text-gray-700 mt-2">Tables: {d.recordTypes.join(", ")}</p>}
              {d.complianceGaps?.length > 0 && <p className="text-xs text-yellow-700 mt-1">Gap: {d.complianceGaps[0]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 10. Africa Tab (NEW) ─────────────────────────────────────────────────────
function AfricaTab() {
  const { data, isLoading } = useQuery<any>({ queryKey: ["/api/compliance/africa"], refetchInterval: 300000 });
  const { data: langData } = useQuery<any>({ queryKey: ["/api/compliance/consent/languages?lang=all"] });
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedLangTexts, setSelectedLangTexts] = useState<any>(null);
  const [loadingLang, setLoadingLang] = useState(false);

  async function loadLanguage(code: string) {
    setLoadingLang(true); setSelectedLang(code);
    try { const r = await fetch(`/api/compliance/consent/languages?lang=${code}`); const d = await r.json(); setSelectedLangTexts(d.texts); }
    catch { setSelectedLangTexts(null); }
    setLoadingLang(false);
  }

  const jurisdictions: any[] = data?.jurisdictions || [];
  const mobileMoney = data?.mobileMoney || {};
  const statusColor: Record<string, string> = { compliant: "text-green-400 bg-green-900/30", partial: "text-yellow-400 bg-yellow-900/30", monitoring: "text-gray-400 bg-gray-800" };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-yellow-300 flex items-center gap-2"><MapPin size={15} /> Africa-First Compliance Centre</h2>
        <p className="text-xs text-gray-500 mt-0.5">6 country coverage · USSD DSR channel · 8 local languages · Mobile money data minimization · Africa's #1 compliance system</p>
      </div>
      {/* Country Coverage */}
      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jurisdictions.map((j: any) => (
            <div key={j.code} data-testid={`country-${j.code.toLowerCase()}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-base font-bold text-white">{j.country}</span><span className="text-xs text-gray-600">({j.code})</span></div>
                {badge(j.status, statusColor[j.status] || "text-gray-400 bg-gray-800")}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {badge(j.regulation, "bg-violet-900/40 text-violet-300")}
                <span className="text-xs text-gray-500">{j.authority}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs text-gray-600">DSR: {j.dsrChannel}</span>
              </div>
              <div className="flex flex-wrap gap-1">{j.languages?.map((l: string) => <span key={l} className="px-1.5 py-0.5 bg-yellow-900/30 text-yellow-300 rounded text-xs">{l.toUpperCase()}</span>)}</div>
              <p className="text-xs text-gray-600 mt-2">{j.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* USSD DSR Panel */}
      <div className="bg-yellow-950/20 border border-yellow-800/40 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-yellow-300 mb-1 flex items-center gap-1.5"><Phone size={11} /> USSD DSR Channel — *120*FSL# (Africa-First)</h3>
        <p className="text-xs text-gray-500 mb-3">Rural &amp; unbanked users submit data rights requests via feature phone. Zero data required. No smartphone needed.</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-300 mb-2">USSD Menu (*120*FSL#)</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>1. Delete my data (POPIA s.24)</p>
              <p>2. Access my data (POPIA s.23)</p>
              <p>3. Export my data (Art. 20)</p>
              <p>4. Correct my data</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-300 mb-2">Supported Carriers</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>MTN South Africa</p>
              <p>Vodacom (ZA/TZ/NG)</p>
              <p>Airtel (NG/KE/GH)</p>
              <p>Telkom Mobile</p>
              <p>Africa's Talking API</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600">Response: "END Your data request ref DSR-2026-XXXXXX received. We respond within 30 days. Email: dpo@freelanceskills.net"</p>
      </div>

      {/* Language Consent Engine */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-violet-300 mb-3 flex items-center gap-1.5"><Languages size={11} /> Consent Engine — 8 Languages (POPIA s.11 informed consent)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[["en","English"],["zu","isiZulu"],["xh","isiXhosa"],["af","Afrikaans"],["sw","Kiswahili"],["ha","Hausa"],["yo","Yoruba"],["fr","Français"]].map(([code, label]) => (
            <button key={code} data-testid={`lang-btn-${code}`} onClick={() => loadLanguage(code)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedLang === code ? "bg-violet-900/50 text-violet-300 border border-violet-700/40" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}>{label}</button>
          ))}
        </div>
        {loadingLang ? <div className="text-gray-500 text-xs">Loading translations...</div> : selectedLangTexts && (
          <div className="space-y-2">
            {Object.entries(selectedLangTexts).filter(([k]) => k !== "title").map(([key, text]) => (
              <div key={key} className="flex items-start gap-3 py-2 border-b border-gray-800/40">
                <span className="text-xs text-gray-600 w-32 shrink-0">{key.replace(/_/g, " ")}</span>
                <span className="text-xs text-gray-300">{text as string}</span>
              </div>
            ))}
          </div>
        )}
        {!selectedLangTexts && !loadingLang && <p className="text-xs text-gray-600">Select a language to view consent texts.</p>}
      </div>

      {/* Mobile Money Minimization */}
      {mobileMoney.providers && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-1.5"><Fingerprint size={11} /> Mobile Money Data Minimization Policy</h3>
          <div className="flex flex-wrap gap-1 mb-3">{mobileMoney.providers.map((p: string) => <span key={p} className="px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded text-xs">{p}</span>)}</div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-300 font-medium mb-1">Collect Only:</p><p className="text-gray-500">{mobileMoney.minimizationGuidance?.split(".")[0]}.</p></div>
            <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-300 font-medium mb-1">USSD Session Policy:</p><p className="text-gray-500">{mobileMoney.ussdPolicy}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DataCompliance() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl"><Shield size={20} className="text-emerald-400" /></div>
            <div>
              <h1 className="text-lg font-bold text-white">Data Compliance Department v2.0</h1>
              <p className="text-gray-500 text-xs">Section 32 · 45 Endpoints · POPIA+GDPR+CCPA+NDPR+LGPD+DPA(KE) · AI Orchestrator · Hash-Chain Certs · USSD DSR · 8 Languages · 18-Dept Hooks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-xs text-emerald-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            45 Endpoints · 6 Jurisdictions · 18 Depts
          </div>
        </div>
      </div>
      <div className="border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {TABS.map(tab => {
              const Icon = tab.icon; const active = activeTab === tab.id;
              return (
                <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-all ${active ? TAB_ACTIVE[tab.color] : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                  <Icon size={13} />{tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === "dashboard"    && <DashboardTab />}
        {activeTab === "dsr"         && <DsrQueueTab />}
        {activeTab === "inventory"   && <DataInventoryTab />}
        {activeTab === "export"      && <ExportAuditTab />}
        {activeTab === "retention"   && <RetentionTab />}
        {activeTab === "breach"      && <BreachTab />}
        {activeTab === "dpia"        && <DpiaTab />}
        {activeTab === "scanner"     && <AiScannerTab />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "africa"      && <AfricaTab />}
      </div>
    </div>
  );
}

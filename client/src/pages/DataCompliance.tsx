/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DATA COMPLIANCE DEPARTMENT — Section 32                                    ║
 * ║  client/src/pages/DataCompliance.tsx                                        ║
 * ║  The nuclear legal & trust shield. Surpasses OneTrust+Vanta+Transcend      ║
 * ║  +DataGrail+Stripe combined.                                                ║
 * ║                                                                              ║
 * ║  8 Tabs:                                                                     ║
 * ║  1. Dashboard — live compliance score + regulation matrix + KPI cards       ║
 * ║  2. DSR Queue — data subject requests with 30-day SLA countdown             ║
 * ║  3. Data Inventory — AI-discovered personal data map                        ║
 * ║  4. Export & Audit — GDPR portability export + deletion certificates        ║
 * ║  5. Retention — auto-purge policies + manual run trigger                    ║
 * ║  6. Breach — 72-hour notification workflow tracker                          ║
 * ║  7. DPIA — Data Protection Impact Assessments + AI generator                ║
 * ║  8. AI Scanner — full compliance audit via GPT-4o-mini                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, FileText, Database, Download, Clock, AlertOctagon, FileCheck, Search, RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronRight, Globe, Lock, Trash2, Play, Plus, Eye, BarChart2, Zap, Activity } from "lucide-react";

// ─── Tab Definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",  label: "Dashboard",       icon: Shield,        color: "emerald" },
  { id: "dsr",        label: "DSR Queue",        icon: FileText,      color: "blue" },
  { id: "inventory",  label: "Data Inventory",   icon: Database,      color: "violet" },
  { id: "export",     label: "Export & Audit",   icon: Download,      color: "amber" },
  { id: "retention",  label: "Retention",        icon: Clock,         color: "orange" },
  { id: "breach",     label: "Breach",           icon: AlertOctagon,  color: "red" },
  { id: "dpia",       label: "DPIA",             icon: FileCheck,     color: "teal" },
  { id: "scanner",    label: "AI Scanner",       icon: Search,        color: "pink" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Color Maps ───────────────────────────────────────────────────────────────
const TAB_ACTIVE: Record<string, string> = { emerald: "border-emerald-500 text-emerald-300 bg-emerald-950/20", blue: "border-blue-500 text-blue-300 bg-blue-950/20", violet: "border-violet-500 text-violet-300 bg-violet-950/20", amber: "border-amber-500 text-amber-300 bg-amber-950/20", orange: "border-orange-500 text-orange-300 bg-orange-950/20", red: "border-red-500 text-red-300 bg-red-950/20", teal: "border-teal-500 text-teal-300 bg-teal-950/20", pink: "border-pink-500 text-pink-300 bg-pink-950/20" };
const RISK_COLOR: Record<string, string> = { low: "text-green-400 bg-green-900/30", medium: "text-yellow-400 bg-yellow-900/30", high: "text-orange-400 bg-orange-900/30", critical: "text-red-400 bg-red-900/30" };
const STATUS_COLOR: Record<string, string> = { pending: "text-yellow-400 bg-yellow-900/30", processing: "text-blue-400 bg-blue-900/30", completed: "text-green-400 bg-green-900/30", rejected: "text-red-400 bg-red-900/30", closed: "text-gray-400 bg-gray-800", detected: "text-orange-400 bg-orange-900/30", investigating: "text-yellow-400 bg-yellow-900/30", contained: "text-blue-400 bg-blue-900/30", notified: "text-green-400 bg-green-900/30", draft: "text-gray-400 bg-gray-800", review: "text-yellow-400 bg-yellow-900/30", approved: "text-green-400 bg-green-900/30" };

function badge(label: string, colorClass: string) {
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{label}</span>;
}

// ─── Tab 1: Compliance Dashboard ─────────────────────────────────────────────
function DashboardTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dashboard"], refetchInterval: 30000 });
  if (isLoading) return <div className="text-gray-500 py-12 text-center text-sm">Loading compliance dashboard...</div>;
  const kpis = data?.kpis || {};
  const matrix = data?.matrix || {};
  const regs = Object.entries(matrix) as [string, any][];
  const slaBreaches: any[] = data?.slaBreaches || [];
  const activeBreaches: any[] = data?.activeBreach || [];
  const score = data?.overallScore ?? 0;
  const scoreColor = score >= 90 ? "text-emerald-400" : score >= 70 ? "text-yellow-400" : "text-red-400";
  const scoreRing = score >= 90 ? "stroke-emerald-500" : score >= 70 ? "stroke-yellow-500" : "stroke-red-500";
  const circumference = 2 * Math.PI * 54;
  const dash = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2"><Shield size={15} /> Compliance Health — POPIA + GDPR + CCPA + NDPR</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time posture across 4 jurisdictions. Africa-first: POPIA (ZA) · NDPR (NG) · DPA (KE).</p>
        </div>
        <button data-testid="button-refresh-dashboard" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-xs text-emerald-300"><RefreshCw size={10} />Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Score Ring */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
          <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={64} cy={64} r={54} fill="none" stroke="#1f2937" strokeWidth={12} />
            <circle cx={64} cy={64} r={54} fill="none" className={scoreRing} strokeWidth={12} strokeDasharray={circumference} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 64 64)" />
            <text x={64} y={68} textAnchor="middle" className={`text-2xl font-bold ${scoreColor}`} fill="currentColor" fontSize={28} fontWeight={700}>{score}</text>
            <text x={64} y={86} textAnchor="middle" fill="#6b7280" fontSize={11}>/ 100</text>
          </svg>
          <p className="text-xs text-gray-400 mt-1">Overall Compliance Score</p>
          <span className={`mt-1 px-2 py-0.5 rounded text-xs ${score >= 90 ? "bg-emerald-900/40 text-emerald-300" : score >= 70 ? "bg-yellow-900/40 text-yellow-300" : "bg-red-900/40 text-red-300"}`}>{data?.overallStatus?.toUpperCase()}</span>
        </div>

        {/* KPI Cards */}
        <div className="md:col-span-3 grid grid-cols-3 gap-3">
          {[
            { label: "Open DSRs", value: kpis.pendingDsr, sub: `of ${kpis.totalDsr} total`, warn: kpis.pendingDsr > 5 },
            { label: "SLA Breaches", value: kpis.slaBreaches, sub: "requests overdue", warn: kpis.slaBreaches > 0 },
            { label: "Active Breaches", value: kpis.activeBreach, sub: "72hr clock running", warn: kpis.activeBreach > 0 },
            { label: "Data Inventory", value: kpis.inventoryItems, sub: `${kpis.highRiskItems} high-risk`, warn: false },
            { label: "Deletion Certs", value: kpis.certificates, sub: "SHA-256 issued", warn: false },
            { label: "DPIAs", value: kpis.dpias, sub: `Art. 35 assessments`, warn: false },
          ].map((kpi, i) => (
            <div key={i} data-testid={`kpi-${kpi.label.replace(/ /g, "-").toLowerCase()}`} className={`bg-gray-900/60 border ${kpi.warn ? "border-red-800/60" : "border-gray-800"} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${kpi.warn ? "text-red-300" : "text-white"}`}>{kpi.value ?? "–"}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
              <div className="text-xs text-gray-600">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {regs.map(([reg, v]) => {
          const sc = v.score ?? 0;
          const c = sc >= 90 ? "border-emerald-800/50 bg-emerald-950/20" : sc >= 70 ? "border-yellow-800/50 bg-yellow-950/20" : "border-red-800/50 bg-red-950/20";
          const tc = sc >= 90 ? "text-emerald-300" : sc >= 70 ? "text-yellow-300" : "text-red-300";
          return (
            <div key={reg} data-testid={`regulation-${reg.toLowerCase()}`} className={`bg-gray-900/60 border rounded-xl p-4 ${c}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{reg}</span>
                <span className={`text-lg font-bold ${tc}`}>{sc}</span>
              </div>
              <div className="w-full bg-gray-800 rounded h-1.5 mb-2"><div className={`h-full rounded ${sc >= 90 ? "bg-emerald-500" : sc >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${sc}%` }} /></div>
              <p className="text-xs text-gray-500">{v.authority}</p>
              {v.keyRisks?.slice(0, 1).map((risk: string, i: number) => <p key={i} className="text-xs text-gray-600 mt-1">⚠ {risk}</p>)}
            </div>
          );
        })}
      </div>

      {/* SLA Breaches + Active Breaches */}
      {(slaBreaches.length > 0 || activeBreaches.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slaBreaches.length > 0 && (
            <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1.5"><AlertTriangle size={11} /> SLA Breached DSRs ({slaBreaches.length})</h3>
              {slaBreaches.slice(0, 3).map((d: any) => <div key={d.id} className="text-xs text-gray-400 py-1 border-b border-red-900/30">{d.reference} — {d.user_email} — {d.request_type} — overdue</div>)}
            </div>
          )}
          {activeBreaches.length > 0 && (
            <div className="bg-orange-950/20 border border-orange-800/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-1.5"><AlertOctagon size={11} /> Active Breach Investigations ({activeBreaches.length})</h3>
              {activeBreaches.slice(0, 3).map((b: any) => <div key={b.id} className="text-xs text-gray-400 py-1 border-b border-orange-900/30">{b.reference} — {b.title?.slice(0, 60)} — {b.severity}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: DSR Queue ─────────────────────────────────────────────────────────
function DsrQueueTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ user_email: "", user_name: "", request_type: "erasure", jurisdiction: "POPIA", description: "" });
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dsr"], refetchInterval: 30000 });

  const processMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const r = await fetch(`/api/compliance/dsr/${id}/process`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch("/api/compliance/dsr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/compliance/dsr"] }); setShowCreate(false); },
  });

  const allDsr: any[] = data?.dsr || [];
  const filtered = filter === "all" ? allDsr : allDsr.filter(d => d.status === filter);

  const slaLabel = (d: any) => {
    if (!d.slaHoursLeft && d.slaHoursLeft !== 0) return null;
    if (d.slaStatus === "breached") return <span className="text-xs text-red-400 font-medium">OVERDUE</span>;
    if (d.slaStatus === "met") return <span className="text-xs text-green-500">Met</span>;
    const h = d.slaHoursLeft;
    const color = h < 24 ? "text-red-400" : h < 72 ? "text-yellow-400" : "text-gray-400";
    return <span className={`text-xs ${color}`}>{h}h left</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-blue-300 flex items-center gap-2"><FileText size={15} /> Data Subject Request Queue</h2>
          <p className="text-xs text-gray-500 mt-0.5">GDPR Art. 15-22 · POPIA s.23-25 · 30-day SLA. Erasure, access, portability, correction, restriction, objection.</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="button-refresh-dsr" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={10} /></button>
          <button data-testid="button-create-dsr" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 border border-blue-700/40 rounded-lg text-xs text-blue-300"><Plus size={11} />New DSR</button>
        </div>
      </div>

      {/* Create DSR form */}
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
              {["POPIA", "GDPR", "CCPA", "NDPR"].map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <textarea data-testid="input-dsr-desc" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 col-span-2 resize-none" />
          </div>
          <div className="flex gap-2">
            <button data-testid="button-submit-dsr" onClick={() => createMutation.mutate(form)} disabled={!form.user_email || createMutation.isPending} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs text-white disabled:opacity-50">Submit DSR</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-800 rounded-lg text-xs text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "processing", "completed", "rejected"].map(f => (
          <button key={f} data-testid={`filter-dsr-${f}`} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs transition-all ${filter === f ? "bg-blue-900/50 text-blue-300 border border-blue-700/40" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}>{f} {f === "all" ? `(${allDsr.length})` : `(${allDsr.filter(d => d.status === f).length})`}</button>
        ))}
      </div>

      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-gray-600 border-b border-gray-800 text-left"><th className="pb-2 pr-4">Reference</th><th className="pb-2 pr-4">User</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Jurisdiction</th><th className="pb-2 pr-4">Status</th><th className="pb-2 pr-4">SLA</th><th className="pb-2 pr-4">Channel</th><th className="pb-2">Actions</th></tr></thead>
            <tbody>
              {filtered.map((d: any) => (
                <tr key={d.id} data-testid={`dsr-row-${d.id}`} className="border-b border-gray-800/40 hover:bg-gray-900/40">
                  <td className="py-2.5 pr-4 font-mono text-blue-300">{d.reference}</td>
                  <td className="py-2.5 pr-4"><div className="text-gray-300">{d.user_name || "–"}</div><div className="text-gray-600">{d.user_email}</div></td>
                  <td className="py-2.5 pr-4">{badge(d.request_type, "bg-blue-900/40 text-blue-300")}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{d.jurisdiction}</td>
                  <td className="py-2.5 pr-4">{badge(d.status, STATUS_COLOR[d.status] || "text-gray-400 bg-gray-800")}</td>
                  <td className="py-2.5 pr-4">{slaLabel(d)}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{d.channel}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1.5">
                      {d.status === "pending" && <button data-testid={`button-process-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "approve" })} className="px-2 py-1 bg-blue-900/40 border border-blue-700/30 rounded text-xs text-blue-300 hover:bg-blue-800/50">Process</button>}
                      {d.status === "processing" && <button data-testid={`button-complete-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "complete" })} className="px-2 py-1 bg-green-900/40 border border-green-700/30 rounded text-xs text-green-300 hover:bg-green-800/50">Complete</button>}
                      {["pending", "processing"].includes(d.status) && <button data-testid={`button-reject-${d.id}`} onClick={() => processMutation.mutate({ id: d.id, action: "reject" })} className="px-2 py-1 bg-red-900/30 border border-red-800/30 rounded text-xs text-red-400">Reject</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-gray-600 text-center py-8">No DSRs found for this filter.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Data Inventory ────────────────────────────────────────────────────
function DataInventoryTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/inventory"], refetchInterval: 60000 });
  const items: any[] = data?.items || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-violet-300 flex items-center gap-2"><Database size={15} /> Data Inventory Map — Art. 30 Records of Processing</h2>
          <p className="text-xs text-gray-500 mt-0.5">AI auto-discovered personal data across all systems. GDPR Art. 30 / POPIA s.14 compliant.</p>
        </div>
        <button data-testid="button-refresh-inventory" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900/30 border border-violet-700/40 rounded-lg text-xs text-violet-300"><RefreshCw size={10} />Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total items", value: summary.total, color: "text-white" },
          { label: "Critical/High risk", value: (summary.critical || 0) + (summary.high || 0), color: "text-red-300" },
          { label: "Cross-border", value: summary.crossBorder, color: "text-orange-300" },
          { label: "3rd-party processors", value: summary.thirdParties, color: "text-yellow-300" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value ?? "–"}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading inventory...</div> : (
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
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(item.data_types as string[]).map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex gap-1 text-xs text-gray-600">
                    {item.encryption_at_rest && <span title="Encrypted at rest"><Lock size={11} className="text-green-600" /></span>}
                    {item.encryption_in_transit && <span title="Encrypted in transit"><Globe size={11} className="text-green-600" /></span>}
                  </div>
                  {((item.third_parties as string[]) || []).length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">3P: {(item.third_parties as string[]).join(", ")}</p>
                  )}
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

// ─── Tab 4: Export & Audit ────────────────────────────────────────────────────
function ExportAuditTab() {
  const { data: certs, isLoading: certsLoading } = useQuery<any>({ queryKey: ["/api/compliance/certificates"], refetchInterval: 30000 });
  const [exportUserId, setExportUserId] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function downloadExport() {
    if (!exportUserId) return;
    window.open(`/api/compliance/export/${exportUserId}`, "_blank");
  }

  async function downloadAudit() {
    window.open("/api/compliance/audit", "_blank");
  }

  async function executeDeletion() {
    if (!deleteUserId || !deleteEmail) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/compliance/delete/${deleteUserId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_email: deleteEmail, reason: "Admin-initiated Right to Erasure" }) });
      setDeleteResult(await r.json());
    } catch { setDeleteResult({ error: "Request failed" }); }
    setDeleting(false);
  }

  const certificates: any[] = certs?.certificates || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-amber-300 flex items-center gap-2"><Download size={15} /> Export &amp; Audit Center</h2>
        <p className="text-xs text-gray-500 mt-0.5">GDPR Art. 20 data portability · Right to Erasure orchestrator · Regulator-ready audit export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Export */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5"><Download size={11} /> GDPR Data Export (Art. 20)</h3>
          <p className="text-xs text-gray-500">Generate full JSON portability package for a user. Machine-readable, structured, complete.</p>
          <input data-testid="input-export-userid" placeholder="User ID" value={exportUserId} onChange={e => setExportUserId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <button data-testid="button-export-user" onClick={downloadExport} disabled={!exportUserId} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-700/40 rounded-lg text-xs text-amber-300 disabled:opacity-50"><Download size={11} />Download Export Package</button>
        </div>

        {/* Regulator Audit Export */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><FileCheck size={11} /> Regulator Audit Export</h3>
          <p className="text-xs text-gray-500">One-click IOCO/ICO/NITDA-ready package: all DSRs, breaches, deletion proofs, DPIAs.</p>
          <div className="space-y-2">
            <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400">Includes: {certs?.total ?? 0} deletion certs · All DSRs · Breach records · DPIA log</div>
          </div>
          <button data-testid="button-audit-export" onClick={downloadAudit} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/40 rounded-lg text-xs text-emerald-300"><Download size={11} />Download Regulator Package</button>
        </div>

        {/* Orchestrated Deletion */}
        <div className="bg-gray-900/60 border border-red-900/30 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-red-300 flex items-center gap-1.5"><Trash2 size={11} /> Right to Erasure (GDPR Art. 17)</h3>
          <p className="text-xs text-gray-500">Soft-delete → anonymise → SHA-256 proof. Financial records preserved per SARS/FICA.</p>
          <input data-testid="input-delete-userid" placeholder="User ID *" value={deleteUserId} onChange={e => setDeleteUserId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <input data-testid="input-delete-email" placeholder="User email *" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <button data-testid="button-execute-deletion" onClick={executeDeletion} disabled={!deleteUserId || !deleteEmail || deleting} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/40 rounded-lg text-xs text-red-300 disabled:opacity-50">
            {deleting ? <><RefreshCw size={11} className="animate-spin" />Executing...</> : <><Trash2 size={11} />Execute Erasure + Issue Certificate</>}
          </button>
          {deleteResult && !deleteResult.error && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 space-y-1">
              <p className="text-xs text-emerald-300 font-semibold">Certificate issued: {deleteResult.certificate?.certificate_id}</p>
              <p className="text-xs text-gray-500">SHA-256: {deleteResult.certificate?.sha256_hash?.slice(0, 20)}...</p>
              <p className="text-xs text-gray-500">Records: {deleteResult.orchestration?.totalRecordsAffected} | Anonymised: {deleteResult.orchestration?.stage1_anonymised?.length} tables</p>
            </div>
          )}
        </div>
      </div>

      {/* Deletion Certificates Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1.5"><Lock size={11} /> SHA-256 Deletion Certificates ({certs?.total ?? 0})</h3>
        {certsLoading ? <div className="text-gray-600 text-xs">Loading...</div> : certificates.length === 0 ? <div className="text-gray-600 text-xs text-center py-4">No deletion certificates yet. Execute a Right to Erasure above to generate one.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-600 border-b border-gray-800"><th className="text-left pb-2 pr-4">Certificate ID</th><th className="text-left pb-2 pr-4">User</th><th className="text-left pb-2 pr-4">SHA-256</th><th className="text-left pb-2 pr-4">Records</th><th className="text-left pb-2 pr-4">Method</th><th className="text-left pb-2">Issued</th></tr></thead>
              <tbody>{certificates.map((c: any) => (
                <tr key={c.id} data-testid={`cert-${c.id}`} className="border-b border-gray-800/40">
                  <td className="py-2 pr-4 font-mono text-emerald-300">{c.certificate_id}</td>
                  <td className="py-2 pr-4 text-gray-400">{c.user_email}</td>
                  <td className="py-2 pr-4 font-mono text-gray-600">{c.sha256_hash?.slice(0, 16)}...</td>
                  <td className="py-2 pr-4 text-gray-400">{c.records_deleted}</td>
                  <td className="py-2 pr-4 text-gray-500">{c.deletion_method}</td>
                  <td className="py-2 text-gray-600">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : "–"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 5: Retention Scheduler ───────────────────────────────────────────────
function RetentionTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/retention"], refetchInterval: 60000 });

  const runMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/retention/${id}/run`, { method: "POST" }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/retention"] }),
  });

  const policies: any[] = data?.policies || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-orange-300 flex items-center gap-2"><Clock size={15} /> Retention Policy Engine + Auto-Purge Scheduler</h2>
          <p className="text-xs text-gray-500 mt-0.5">GDPR Art. 5(1)(e) storage limitation · POPIA Condition 9 · Scheduled auto-purge per data category</p>
        </div>
        <button data-testid="button-refresh-retention" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/30 border border-orange-700/40 rounded-lg text-xs text-orange-300"><RefreshCw size={10} />Refresh</button>
      </div>

      {isLoading ? <div className="text-gray-500 text-sm text-center py-8">Loading...</div> : (
        <div className="space-y-2">
          {policies.map((p: any) => (
            <div key={p.id} data-testid={`retention-${p.id}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    {badge(p.data_category, "bg-orange-900/40 text-orange-300")}
                    {badge(p.purge_method, "bg-gray-800 text-gray-400")}
                    {p.auto_purge ? <span className="text-xs text-green-400">auto-purge ON</span> : <span className="text-xs text-gray-600">manual only</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{p.legal_basis}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span><span className="text-gray-500">Retention:</span> {p.retention_days} days ({Math.round(p.retention_days / 365 * 10) / 10} yr)</span>
                    <span><span className="text-gray-500">Table:</span> {p.table_name || "multiple"}</span>
                    <span><span className="text-gray-500">Last run:</span> {p.last_run ? new Date(p.last_run).toLocaleDateString() : "never"}</span>
                    <span><span className="text-gray-500">Purged:</span> {p.records_purged ?? 0} records total</span>
                  </div>
                  {p.notes && <p className="text-xs text-gray-700 mt-1.5 border-t border-gray-800 pt-1.5">{p.notes}</p>}
                </div>
                <div className="shrink-0">
                  <button data-testid={`button-run-retention-${p.id}`} onClick={() => runMutation.mutate(p.id)} disabled={runMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/40 hover:bg-orange-900/60 border border-orange-700/30 rounded-lg text-xs text-orange-300 disabled:opacity-50"><Play size={11} />Run Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 6: Breach Management ─────────────────────────────────────────────────
function BreachTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/breaches"], refetchInterval: 20000 });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", breach_type: "unauthorized_access", severity: "medium", description: "" });

  const createMutation = useMutation({
    mutationFn: async (body: any) => { const r = await fetch("/api/compliance/breaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/compliance/breaches"] }); setShowCreate(false); },
  });

  const notifyMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/breaches/${id}/notify`, { method: "POST" }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/breaches"] }),
  });

  const breaches: any[] = data?.breaches || [];
  const sevColor = (s: string) => ({ critical: "border-red-600 bg-red-950/30", high: "border-orange-700/60 bg-orange-950/20", medium: "border-yellow-800/50 bg-yellow-950/20", low: "border-gray-700 bg-gray-900/40" }[s] || "border-gray-700 bg-gray-900/40");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-red-300 flex items-center gap-2"><AlertOctagon size={15} /> Breach Detection &amp; 72-Hour Notification Workflow</h2>
          <p className="text-xs text-gray-500 mt-0.5">GDPR Art. 33 · POPIA s.22 · Notify IOCO/ICO within 72 hours of detection. Auto-clock on report.</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="button-refresh-breach" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={10} /></button>
          <button data-testid="button-report-breach" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 border border-red-800/40 rounded-lg text-xs text-red-300"><Plus size={11} />Report Breach</button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-red-300">72-Hour Clock Starts NOW on Save</p>
          <input data-testid="input-breach-title" placeholder="Breach title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300" />
          <div className="grid grid-cols-2 gap-3">
            <select data-testid="select-breach-type" value={form.breach_type} onChange={e => setForm(f => ({ ...f, breach_type: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              {["unauthorized_access", "data_leak", "ransomware", "insider_threat", "accidental_disclosure", "third_party"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select data-testid="select-breach-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              {["low", "medium", "high", "critical"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
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
            const hrs = b.hoursToNotifyDeadline;
            const overdue = b.notificationOverdue;
            const clockColor = overdue ? "text-red-400" : hrs !== null && hrs < 24 ? "text-orange-400" : hrs !== null && hrs < 48 ? "text-yellow-400" : "text-gray-500";
            return (
              <div key={b.id} data-testid={`breach-${b.id}`} className={`border rounded-xl p-4 ${sevColor(b.severity)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-red-400">{b.reference}</span>
                      {badge(b.severity, RISK_COLOR[b.severity] || "text-gray-400 bg-gray-800")}
                      {badge(b.status, STATUS_COLOR[b.status] || "text-gray-400 bg-gray-800")}
                      {badge(b.breach_type, "bg-gray-800 text-gray-400")}
                    </div>
                    <p className="text-sm text-white mb-1">{b.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Detected: {b.detected_at ? new Date(b.detected_at).toLocaleString() : "–"}</span>
                      <span>Affected: {b.users_affected} users</span>
                      {hrs !== null && !b.authority_notified_at && <span className={`font-semibold ${clockColor}`}>{overdue ? "OVERDUE" : `${hrs}h to notify`}</span>}
                      {b.authority_notified_at && <span className="text-green-400">Authority notified ✓</span>}
                    </div>
                    {b.description && <p className="text-xs text-gray-600 mt-1.5">{b.description}</p>}
                    {((b.timeline as any[]) || []).length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {(b.timeline as any[]).slice(-3).map((t: any, i: number) => <p key={i} className="text-xs text-gray-700">{new Date(t.ts).toLocaleTimeString()} — {t.event}: {t.detail}</p>)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    {!b.authority_notified_at && ["detected", "investigating", "contained"].includes(b.status) && (
                      <button data-testid={`button-notify-${b.id}`} onClick={() => notifyMutation.mutate(b.id)} disabled={notifyMutation.isPending} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900/80 border border-red-700/40 rounded-lg text-xs text-red-300 disabled:opacity-50">Notify IOCO</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {breaches.length === 0 && <div className="text-gray-600 text-center text-sm py-8">No breach incidents recorded. Report one above when detected.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Tab 7: DPIA ──────────────────────────────────────────────────────────────
function DpiaTab() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/compliance/dpia"], refetchInterval: 60000 });

  const generateMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/dpia/${id}/generate`, { method: "POST" }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dpia"] }),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/compliance/dpia/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: "Approved by DPO" }) }); return r.json(); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/compliance/dpia"] }),
  });

  const dpias: any[] = data?.dpias || [];
  const residualColor = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" } as Record<string, string>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-teal-300 flex items-center gap-2"><FileCheck size={15} /> Data Protection Impact Assessments (DPIA)</h2>
          <p className="text-xs text-gray-500 mt-0.5">GDPR Art. 35 — mandatory for high-risk processing. AI generator creates full risk matrix + DPO workflow.</p>
        </div>
        <button data-testid="button-refresh-dpia" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/30 border border-teal-700/40 rounded-lg text-xs text-teal-300"><RefreshCw size={10} />Refresh</button>
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
                    <span>Legal basis: {d.legal_basis}</span>
                    <span>Jurisdictions: {((d.jurisdictions as string[]) || []).join(", ")}</span>
                    {d.review_date && <span>Review: {new Date(d.review_date).toLocaleDateString()}</span>}
                  </div>
                  {((d.risks as any[]) || []).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Risks ({(d.risks as any[]).length}):</p>
                      {(d.risks as any[]).slice(0, 2).map((r: any) => <p key={r.id} className={`text-xs ${RISK_COLOR[r.riskLevel]?.replace("bg-", "").replace("/30", "") || "text-gray-500"}`}>• {r.title} — {r.riskLevel}</p>)}
                    </div>
                  )}
                  {d.dpo_notes && <p className="text-xs text-gray-600 mt-2 border-t border-gray-800 pt-2">{d.dpo_notes}</p>}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  {!d.ai_generated && <button data-testid={`button-generate-dpia-${d.id}`} onClick={() => generateMutation.mutate(d.id)} disabled={generateMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-900/40 border border-pink-700/30 rounded-lg text-xs text-pink-300 disabled:opacity-50"><Zap size={10} />AI Generate</button>}
                  {d.status !== "approved" && <button data-testid={`button-approve-dpia-${d.id}`} onClick={() => approveMutation.mutate(d.id)} disabled={approveMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/40 border border-teal-700/30 rounded-lg text-xs text-teal-300 disabled:opacity-50"><CheckCircle size={10} />DPO Approve</button>}
                </div>
              </div>
            </div>
          ))}
          {dpias.length === 0 && <div className="text-gray-600 text-center text-sm py-8">No DPIAs yet. Create one for any high-risk processing activity (AI ranking, biometric KYC, large-scale profiling).</div>}
        </div>
      )}
    </div>
  );
}

// ─── Tab 8: AI Scanner ────────────────────────────────────────────────────────
function AiScannerTab() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: matrixData } = useQuery<any>({ queryKey: ["/api/compliance/matrix"] });

  async function runScan() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/compliance/scan", { method: "POST", headers: { "Content-Type": "application/json" } });
      setResult(await r.json());
    } catch { setResult({ error: "Scan failed. Check server connectivity." }); }
    setLoading(false);
  }

  const controls = matrixData?.controls || [];
  const implemented = controls.filter((c: any) => c.status === "implemented");
  const partial = controls.filter((c: any) => c.status === "partial");
  const sevBg = { critical: "border-red-800/60 bg-red-950/20", high: "border-orange-800/50 bg-orange-950/20", medium: "border-yellow-800/40 bg-yellow-950/20", low: "border-gray-700 bg-gray-900/40" } as Record<string, string>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-pink-300 flex items-center gap-2"><Search size={15} /> AI Compliance Scanner — GPT-4o-mini</h2>
          <p className="text-xs text-gray-500 mt-0.5">Full POPIA/GDPR/CCPA/NDPR posture audit. Finds gaps, rates risks, prioritises remediation actions.</p>
        </div>
        <button data-testid="button-run-scan" onClick={runScan} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-pink-900/40 hover:bg-pink-900/60 border border-pink-700/40 rounded-lg text-sm text-pink-300 disabled:opacity-50 transition-all">
          {loading ? <><RefreshCw size={13} className="animate-spin" />Scanning...</> : <><Search size={13} />Run Full Compliance Scan</>}
        </button>
      </div>

      {/* Controls Matrix */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3">Compliance Controls — {implemented.length}/{controls.length} implemented</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {controls.map((c: any) => (
            <div key={c.id} data-testid={`control-${c.id}`} className="flex items-start gap-2">
              {c.status === "implemented" ? <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> : c.status === "partial" ? <AlertTriangle size={12} className="text-yellow-400 mt-0.5 shrink-0" /> : <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />}
              <div>
                <p className="text-xs text-gray-300">{c.name}</p>
                {c.gap && <p className="text-xs text-yellow-600">{c.gap}</p>}
                <div className="flex gap-1 flex-wrap mt-0.5">{c.jurisdictions?.map((j: string) => <span key={j} className="text-xs text-gray-600">{j}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
        {partial.length > 0 && <p className="text-xs text-yellow-600 mt-3">{partial.length} partial control(s) — review the Gaps tab for remediation steps.</p>}
      </div>

      {result && !result.error && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${result.score >= 80 ? "text-emerald-400" : result.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>{result.score}</div>
              <div className="text-xs text-gray-500">Compliance Score</div>
            </div>
            <div className={`bg-gray-900/60 border rounded-xl p-3 text-center ${RISK_COLOR[result.overallRisk] || ""}`}>
              <div className="text-lg font-bold">{result.overallRisk?.toUpperCase()}</div>
              <div className="text-xs text-gray-500">Overall Risk</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white">{result.findings?.length ?? 0}</div>
              <div className="text-xs text-gray-500">Findings</div>
            </div>
          </div>

          {result.findings?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400">Findings</h3>
              {result.findings.map((f: any) => (
                <div key={f.id} data-testid={`finding-${f.id}`} className={`border rounded-xl p-3 ${sevBg[f.severity] || "border-gray-700 bg-gray-900/40"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{f.id}</span>
                    {badge(f.severity, RISK_COLOR[f.severity] || "text-gray-400 bg-gray-800")}
                    {badge(f.regulation, "bg-blue-900/40 text-blue-300")}
                    {badge(`effort: ${f.effort}`, "bg-gray-800 text-gray-500")}
                  </div>
                  <p className="text-sm text-white">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                  <p className="text-xs text-emerald-600 mt-1"><span className="text-gray-500">Fix:</span> {f.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {result.priorityActions?.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-pink-300 mb-2">Priority Actions</h3>
              {result.priorityActions.map((a: string, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-800/40"><ChevronRight size={10} className="text-pink-500 mt-0.5 shrink-0" /><p className="text-xs text-gray-400">{a}</p></div>
              ))}
            </div>
          )}

          {result.estimatedComplianceCost && <p className="text-xs text-gray-500 text-center">Estimated compliance cost: <span className="text-yellow-400">{result.estimatedComplianceCost}</span></p>}
          {result.scannedAt && <p className="text-xs text-gray-700 text-right">Scanned: {new Date(result.scannedAt).toLocaleString()} · {result.scanVersion}</p>}
        </div>
      )}

      {result?.error && <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 text-sm text-red-300">{result.error}</div>}

      {!result && !loading && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
          <Search size={32} className="mx-auto mb-3 text-pink-500 opacity-40" />
          <p className="text-gray-500 text-sm">Run the scanner to get a full POPIA + GDPR + CCPA compliance report powered by GPT-4o-mini.</p>
          <p className="text-gray-700 text-xs mt-1">Analyses: data inventory · DSR queue · retention policies · breach history · DPIA coverage</p>
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
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl"><Shield size={20} className="text-emerald-400" /></div>
            <div>
              <h1 className="text-lg font-bold text-white">Data Compliance Department</h1>
              <p className="text-gray-500 text-xs">Section 32 · POPIA + GDPR + CCPA + NDPR · DSR Portal · 72hr Breach · DPIA Generator · SHA-256 Deletion Certs · FreelanceSkills.net</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-xs text-emerald-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            30 Endpoints · 4 Jurisdictions · Africa-First
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-all ${active ? TAB_ACTIVE[tab.color] : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === "dashboard"  && <DashboardTab />}
        {activeTab === "dsr"        && <DsrQueueTab />}
        {activeTab === "inventory"  && <DataInventoryTab />}
        {activeTab === "export"     && <ExportAuditTab />}
        {activeTab === "retention"  && <RetentionTab />}
        {activeTab === "breach"     && <BreachTab />}
        {activeTab === "dpia"       && <DpiaTab />}
        {activeTab === "scanner"    && <AiScannerTab />}
      </div>
    </div>
  );
}

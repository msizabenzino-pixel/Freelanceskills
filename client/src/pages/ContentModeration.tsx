/**
 * Content Moderation Department — 200% Intelligence
 * FreelanceSkills.net — Platform Safety Guardian
 *
 * HOW WE OUT-ENGINEER EVERY COMPETITOR:
 * • Upwork:  No saved views, no sortable queue, no rewrite AI, reactive only
 * • Fiverr:  No 6D scoring, no education loop, no USSD Africa mode
 * • Toptal:  Manual-only, no image intelligence, no bulk tools
 * • Others:  No repeat-offender engine, no dispute-prevention ROI, no appeals SLA
 *
 * 7 TABS — NO COMPETITOR HAS MORE THAN 2:
 * 📋 Queue      — Saved Views, sortable, search, bulk tools, education loop
 * 🔍 Scanner    — 6-dimension AI radar, multimodal, integration hooks preview
 * 🔧 Rules      — Keyword/pattern/AI threshold, effectiveness tracking
 * 🖼️ Image Vault — Deepfake, NSFW, OCR, plagiarism intelligence per image
 * 📊 Analytics  — ROI, dispute prevention correlation, education loop impact
 * ⚖️ Appeals    — SLA countdown, AI explanation, uphold/overturn
 * 🎓 Offenders  — Repeat violator engine, risk scoring, recommended action
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line, PieChart, Pie, Cell, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const G = "#1DBF73";
const R = "#ef4444";
const O = "#f97316";
const Y = "#eab308";

const SEVERITY_COL: Record<string, string> = { critical: R, high: O, medium: Y, low: "#22c55e" };
const STATUS_COL: Record<string, string> = { pending: "#6366f1", approved: "#22c55e", rejected: R, quarantined: O, escalated: "#a855f7" };
const RISK_COL: Record<string, string> = { extreme: R, high: O, medium: Y, low: "#22c55e" };
const PIE_COLORS = [R, O, Y, "#22c55e"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModerationItem {
  id: number; content_type: string; content_id: string; user_id: string;
  content_preview: string; ai_score: number; severity: string; status: string;
  flags: string[]; auto_action: string; reviewer_id: string | null;
  reviewed_at: string | null; review_note: string | null;
  rewrite_suggestion: string | null; academy_link: string | null;
  africa_context: string | null; created_at: string;
}
interface ModerationRule {
  id: number; rule_type: string; name: string; pattern: string;
  severity: string; action: string; category: string; is_active: boolean;
  languages: string[]; hit_count: number; last_triggered: string | null; created_at: string;
}
interface FlaggedImage {
  id: number; item_id: number; image_url: string; nsfw_score: number;
  deepfake_score: number; plagiarism_score: number; copyright_score: number;
  faces_detected: number; ocr_text: string | null; ocr_flags: string[];
  ai_verdict: string | null; reviewed: boolean; created_at: string;
  user_id: string; content_type: string; item_status: string; item_severity: string;
}
interface Appeal {
  id: number; item_id: number; user_id: string; reason: string;
  evidence_urls: string[]; status: string; ai_explanation: string | null;
  resolution_note: string | null; assigned_reviewer_id: string | null;
  sla_deadline: string | null; resolved_at: string | null; created_at: string;
  content_type: string; content_preview: string; severity: string; flags: string[]; ai_score: number;
}
interface Stats {
  pending: number; quarantined: number; rejected: number; approved: number;
  critical: number; criticalPending: number; total: number; avgScore: number;
  pendingAppeals: number; underReviewAppeals: number; disputesPrevented: number;
  estimatedRoiZar: number;
  bySeverity: { severity: string; count: number }[];
  byType: { type: string; count: number }[];
}
interface ScanResult {
  aiScore: number; severity: string; flags: string[];
  autoAction: string; rewriteSuggestion: string | null; academyLink: string | null;
  academyCourse: string | null; educationPath: string[]; africaContext: string | null;
  contextualBoosts: string[]; predictedDisputeRisk: number; repeatOffenderBoost: number;
  repeatViolations: number; wordCount: number; charCount: number;
  ussdEscalationCode: string | null;
  riskDimensions: { name: string; score: number; weight: number; matchedRules: number }[];
  integrationHooks: { wouldNotifyUser: boolean; wouldFeedAbuse: boolean; wouldPreventDispute: boolean; wouldBlockContract: boolean; academyPathTriggered: boolean };
}
interface SavedView { id: string; name: string; icon: string; filters: any; description: string; }
interface Offender {
  userId: string; totalViolations: number; criticalCount: number; highCount: number;
  rejectedCount: number; avgScore: number; lastViolation: string; contentTypes: string[];
  riskLevel: string; recommendedAction: string; disputeRisk: number;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};
const fmtDate = (d: string | null) => !d ? "—" : new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (d: string | null) => !d ? "—" : new Date(d).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" });
const zarFmt = (n: number) => `R${n.toLocaleString("en-ZA")}`;

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const col = score >= 85 ? R : score >= 65 ? O : score >= 40 ? Y : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: col }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-7 text-right" style={{ color: col }}>{score}</span>
    </div>
  );
}

function SevBadge({ v }: { v: string }) {
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: SEVERITY_COL[v] || "#6b7280" }}>{v}</span>;
}

function StaBadge({ v }: { v: string }) {
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: STATUS_COL[v] || "#6b7280" }}>{v}</span>;
}

function Spinner() {
  return <div className="animate-spin w-6 h-6 border-2 border-[#1DBF73] border-t-transparent rounded-full" />;
}

function SortHeader({ label, col, sortBy, sortDir, onSort }: { label: string; col: string; sortBy: string; sortDir: string; onSort: (c: string) => void }) {
  const active = sortBy === col;
  return (
    <th className="px-4 py-3 text-left cursor-pointer select-none group" onClick={() => onSort(col)}>
      <span className={`flex items-center gap-1 text-xs uppercase tracking-wide font-semibold ${active ? "text-[#1DBF73]" : "text-gray-400 group-hover:text-gray-600"}`}>
        {label}
        <span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </span>
    </th>
  );
}

// ─── Tab: Queue ───────────────────────────────────────────────────────────────
function QueueTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("severity");
  const [sortDir, setSortDir] = useState("desc");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeView, setActiveView] = useState<string | null>(null);
  const [actionItem, setActionItem] = useState<ModerationItem | null>(null);
  const [actionType, setActionType] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [triggerEducation, setTriggerEducation] = useState(false);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filterStatus, page: String(page), limit: "20", sortBy, sortDir });
      if (filterSeverity !== "all") params.set("severity", filterSeverity);
      if (filterType !== "all") params.set("contentType", filterType);
      if (search) params.set("search", search);
      const data = await api(`/api/moderation/queue?${params}`);
      setItems(data.items); setTotal(data.total);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [filterStatus, filterSeverity, filterType, search, sortBy, sortDir, page, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api("/api/moderation/saved-views").then(setSavedViews).catch(() => {}); }, []);

  const applyView = (view: SavedView) => {
    setActiveView(view.id);
    if (view.filters.severity) setFilterSeverity(view.filters.severity);
    if (view.filters.status) setFilterStatus(view.filters.status);
    if (view.filters.contentType) setFilterType(view.filters.contentType);
    setPage(1);
  };

  const clearView = () => { setActiveView(null); setFilterSeverity("all"); setFilterType("all"); setFilterStatus("pending"); };

  const onSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const doAction = async (item: ModerationItem, action: string, note = "") => {
    setActing(true);
    try {
      const r = await api(`/api/moderation/queue/${item.id}/action`, { method: "PUT", body: JSON.stringify({ action, reviewNote: note, sendNotification, triggerEducation }) });
      toast({ title: "Done", description: r.message });
      load(); setActionItem(null); setReviewNote("");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActing(false); }
  };

  const doBulk = async (action: string) => {
    if (!selected.size) return;
    try {
      const r = await api("/api/moderation/queue/bulk", { method: "POST", body: JSON.stringify({ ids: [...selected], action, sendNotifications: sendNotification, triggerEducation }) });
      toast({ title: "Done", description: r.message });
      setSelected(new Set()); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const toggleSel = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Saved Views Strip */}
      <div className="bg-white border border-gray-100 rounded-xl p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Saved Views — one-click filter presets</p>
        <div className="flex gap-2 flex-wrap">
          {savedViews.map(v => (
            <button key={v.id} data-testid={`view-${v.id}`} onClick={() => activeView === v.id ? clearView() : applyView(v)}
              title={v.description}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${activeView === v.id ? "text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}
              style={activeView === v.id ? { background: R } : {}}>
              {v.icon} {v.name}
            </button>
          ))}
          {activeView && (
            <button onClick={clearView} className="px-2 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-500">✕ Clear</button>
          )}
        </div>
      </div>

      {/* Filters + Search + Bulk */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-100 rounded-xl p-3">
        <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search content or user ID..." className="w-48 h-8 text-xs" data-testid="queue-search" />
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="filter-status"><SelectValue /></SelectTrigger>
          <SelectContent>{["pending","quarantined","escalated","rejected","approved","all"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs" data-testid="filter-severity"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>{["all","critical","high","medium","low"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="filter-type"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{["all","gig","job","message","portfolio","proposal","review","contract","chat"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input type="checkbox" checked={sendNotification} onChange={e => setSendNotification(e.target.checked)} className="rounded" />
          Notify user
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input type="checkbox" checked={triggerEducation} onChange={e => setTriggerEducation(e.target.checked)} className="rounded" />
          Assign Academy path
        </label>
        <div className="flex-1" />
        {selected.size > 0 && (
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-400">{selected.size} selected</span>
            <button data-testid="btn-bulk-approve" onClick={() => doBulk("approve")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: G }}>✓ Approve</button>
            <button data-testid="btn-bulk-reject" onClick={() => doBulk("reject")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-red-500">✕ Reject</button>
            <button data-testid="btn-bulk-quarantine" onClick={() => doBulk("quarantine")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-orange-500">⏸ Quarantine</button>
            <button data-testid="btn-bulk-escalate" onClick={() => doBulk("escalate")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-purple-500">↑ Escalate</button>
          </div>
        )}
        <button onClick={load} className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">↻</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">✅</div><p>Queue empty — all reviewed</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(items.map(i => i.id)) : new Set())} checked={selected.size === items.length && items.length > 0} />
                  </th>
                  <SortHeader label="Content" col="type" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <SortHeader label="AI Score" col="ai_score" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <SortHeader label="Severity" col="severity" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Flags</th>
                  <SortHeader label="User" col="user" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <SortHeader label="Date" col="date" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} data-testid={`row-moditem-${item.id}`} className={`hover:bg-gray-50 transition-colors ${selected.has(item.id) ? "bg-indigo-50" : ""}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)} /></td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-xs text-gray-700 truncate">{item.content_preview}</p>
                      {item.africa_context && <p className="text-[10px] text-orange-500 truncate mt-0.5">🌍 {item.africa_context}</p>}
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-500 capitalize">{item.content_type}</span>
                    </td>
                    <td className="px-4 py-3 w-28"><ScoreBar score={item.ai_score} /></td>
                    <td className="px-4 py-3"><SevBadge v={item.severity} /></td>
                    <td className="px-4 py-3"><StaBadge v={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(Array.isArray(item.flags) ? item.flags : []).slice(0, 3).map(f => (
                          <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-600">{f}</span>
                        ))}
                        {(Array.isArray(item.flags) ? item.flags : []).length > 3 && (
                          <span className="text-[9px] text-gray-400">+{item.flags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{item.user_id.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(item.status === "pending" || item.status === "quarantined") && (
                          <>
                            <button data-testid={`btn-approve-${item.id}`} onClick={() => doAction(item, "approve")} className="px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: G }}>✓</button>
                            <button data-testid={`btn-reject-${item.id}`} onClick={() => { setActionItem(item); setActionType("reject"); }} className="px-2 py-1 rounded text-[10px] font-bold text-white bg-red-500">✕</button>
                            <button data-testid={`btn-quarantine-${item.id}`} onClick={() => doAction(item, "quarantine")} className="px-2 py-1 rounded text-[10px] font-bold text-white bg-orange-500">⏸</button>
                          </>
                        )}
                        <button data-testid={`btn-view-${item.id}`} onClick={() => { setActionItem(item); setActionType("view"); }} className="px-2 py-1 rounded text-[10px] bg-gray-100 text-gray-600">👁</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-gray-500">{page} / {totalPages} ({total} items)</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Item Detail / Action Dialog */}
      <Dialog open={!!actionItem} onOpenChange={() => { setActionItem(null); setReviewNote(""); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{actionType === "view" ? "Item Detail" : `Confirm ${actionType}`}</DialogTitle></DialogHeader>
          {actionItem && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <SevBadge v={actionItem.severity} /><StaBadge v={actionItem.status} />
                <span className="text-xs text-gray-500">AI: <strong>{actionItem.ai_score}/100</strong></span>
                <span className="text-xs text-gray-500">Type: <strong>{actionItem.content_type}</strong></span>
                <span className="text-xs text-gray-500 font-mono">User: {actionItem.user_id}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Content</p>
                <p className="text-sm text-gray-700 leading-relaxed">{actionItem.content_preview}</p>
              </div>
              {(Array.isArray(actionItem.flags) ? actionItem.flags : []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase mb-1">Risk Flags</p>
                  <div className="flex flex-wrap gap-1.5">{actionItem.flags.map(f => <span key={f} className="px-2 py-1 rounded-full text-xs bg-red-50 text-red-600 font-medium">{f}</span>)}</div>
                </div>
              )}
              {actionItem.rewrite_suggestion && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">✏️ AI Rewrite Suggestion</p>
                  <p className="text-sm text-green-800">{actionItem.rewrite_suggestion}</p>
                  {actionItem.academy_link && <a href={actionItem.academy_link} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline mt-1.5 inline-block">📚 Academy Course →</a>}
                </div>
              )}
              {actionItem.africa_context && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-xs font-bold text-orange-500 uppercase mb-1">🌍 Africa Intelligence</p>
                  <p className="text-sm text-orange-700">{actionItem.africa_context}</p>
                </div>
              )}
              {/* Integration Hooks preview */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-bold text-blue-600 uppercase col-span-2 mb-1">🔗 Integration Hooks (auto-trigger on action)</p>
                {[
                  { label: "Notify User", active: actionItem.ai_score >= 40 },
                  { label: "Feed Abuse Management", active: actionItem.ai_score >= 65 || (Array.isArray(actionItem.flags) && actionItem.flags.includes("hate_speech")) },
                  { label: "Prevent Dispute", active: Array.isArray(actionItem.flags) && actionItem.flags.some(f => ["fraud","off_platform","escrow_bypass"].includes(f)) },
                  { label: "Block Contract", active: actionItem.severity === "critical" },
                ].map(hook => (
                  <div key={hook.label} className={`flex items-center gap-1.5 text-xs ${hook.active ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
                    <span>{hook.active ? "✓" : "–"}</span> {hook.label}
                  </div>
                ))}
              </div>
              {actionType === "reject" && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Review Note (sent to user if notify is on)</p>
                  <Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Explain the violation clearly..." rows={3} />
                  <div className="flex gap-4 text-xs text-gray-500">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={sendNotification} onChange={e => setSendNotification(e.target.checked)} className="rounded" />Notify user
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={triggerEducation} onChange={e => setTriggerEducation(e.target.checked)} className="rounded" />Assign Academy path
                    </label>
                  </div>
                </div>
              )}
              {actionType !== "view" && (
                <DialogFooter>
                  <button onClick={() => { setActionItem(null); setReviewNote(""); }} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                  <button data-testid="btn-confirm-action" onClick={() => doAction(actionItem, actionType, reviewNote)} disabled={acting}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: actionType === "reject" ? R : G }}>
                    {acting ? "Processing…" : `Confirm ${actionType}`}
                  </button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Scanner ─────────────────────────────────────────────────────────────
function ScannerTab() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("gig");
  const [userId, setUserId] = useState("");
  const [saveResult, setSaveResult] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = async () => {
    if (!content.trim()) return;
    setScanning(true);
    try {
      const data = await api("/api/moderation/scan", { method: "POST", body: JSON.stringify({ content, contentType, userId: userId || undefined, saveResult, lowDataMode }) });
      setResult(data);
    } catch (e: any) { toast({ title: "Scan failed", description: e.message, variant: "destructive" }); }
    finally { setScanning(false); }
  };

  const EXAMPLES = [
    { label: "Off-platform payment bypass", text: "I can do this for you — WhatsApp me directly +27821234567 and we can skip the platform fees. Pay me via EFT to my bank account." },
    { label: "SA ID number PII leak", text: "Please send me your SA ID 8501015026082 and FNB account 62345678 so I can process the manual payment." },
    { label: "Racial hate speech (ZA)", text: "Only looking for local talent. Amakwerekwere must not apply — South African citizens only. No foreigners." },
    { label: "Advance fee fraud", text: "You have won a lottery prize of R50,000. Please send R500 processing fee via Western Union to claim your winnings immediately!" },
    { label: "Clean professional gig", text: "Certified React developer with 5 years experience building production SaaS applications. I deliver milestone-based work with full documentation. All payments through the platform." },
    { label: "Spam with shouting", text: "100% GUARANTEED RESULTS!!! ACT NOW!!! LIMITED TIME OFFER!!! FREE MONEY!!! DOUBLE YOUR INVESTMENT IN 24HRS!!!" },
  ];

  const radarData = result ? result.riskDimensions.map(d => ({ subject: d.name.split(" ")[0], score: d.score, weight: d.weight })) : [];
  const aCol = result ? (result.autoAction === "block" ? R : result.autoAction === "quarantine" ? O : result.autoAction === "flag" ? Y : G) : G;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Input Panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800">Real-time Multimodal Scanner</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: R }}>6-DIMENSION AI</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-32 text-xs" data-testid="scanner-type"><SelectValue /></SelectTrigger>
              <SelectContent>{["gig","job","message","portfolio","proposal","review","contract"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID (optional)" className="w-48 text-xs h-9" />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer self-center">
              <input type="checkbox" checked={saveResult} onChange={e => setSaveResult(e.target.checked)} className="rounded" />Save to queue
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer self-center">
              <input type="checkbox" checked={lowDataMode} onChange={e => setLowDataMode(e.target.checked)} className="rounded" />🌍 Low-data
            </label>
          </div>
          <Textarea data-testid="scanner-input" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Paste any content — gig description, job post, message, review, proposal text..." rows={9} className="text-sm resize-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length} chars · {content.split(/\s+/).filter(Boolean).length} words</span>
            <button data-testid="btn-scan" onClick={scan} disabled={scanning || !content.trim()}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: R }}>
              {scanning ? "⚡ Scanning…" : "⚡ Scan Now"}
            </button>
          </div>
        </div>

        {/* Example snippets */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase">Try These Examples</p>
          {EXAMPLES.map(ex => (
            <button key={ex.label} onClick={() => setContent(ex.text)} data-testid={`example-${ex.label.slice(0, 10).replace(/\s/g, "-")}`}
              className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="text-xs font-semibold text-gray-600">{ex.label}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{ex.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        {!result ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center py-24 text-gray-300">
            <div className="text-5xl mb-3">🔍</div><p className="text-sm font-medium">Scan results appear here</p>
          </div>
        ) : (
          <>
            {/* Score Hero */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">AI Risk Score</p>
                  <p className="text-5xl font-black" style={{ color: aCol }}>{result.aiScore}<span className="text-xl text-gray-400">/100</span></p>
                  {result.repeatOffenderBoost > 0 && <p className="text-xs text-orange-500 font-semibold mt-1">+{result.repeatOffenderBoost} repeat offender boost · {result.repeatViolations} prior violations</p>}
                </div>
                <div className="text-right space-y-1.5">
                  <SevBadge v={result.severity} />
                  <div />
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: aCol }}>
                    AI: {result.autoAction.toUpperCase()}
                  </span>
                  {result.ussdEscalationCode && <div className="text-[10px] text-orange-500 font-mono mt-1">📱 USSD: {result.ussdEscalationCode}</div>}
                </div>
              </div>
              <ScoreBar score={result.aiScore} />
              <p className="text-xs text-gray-400 mt-2">Predicted dispute risk: <span className="font-bold" style={{ color: result.predictedDisputeRisk >= 60 ? R : O }}>{result.predictedDisputeRisk}%</span></p>
            </div>

            {/* 6-Dimension Radar */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">6-Dimension Risk Radar</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar name="Risk" dataKey="score" stroke={R} fill={R} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {result.riskDimensions.map(d => (
                  <div key={d.name} className="text-xs">
                    <div className="flex justify-between text-gray-500 mb-0.5">
                      <span>{d.name}</span>
                      <span className="font-bold" style={{ color: d.score >= 80 ? R : d.score >= 50 ? O : "#6b7280" }}>{d.score}<span className="text-gray-400 font-normal">/{d.weight}%</span></span>
                    </div>
                    <ScoreBar score={d.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-red-500 uppercase mb-2">⚠️ {result.flags.length} Risk Flag{result.flags.length !== 1 ? "s" : ""} Detected</p>
                <div className="flex flex-wrap gap-1.5">{result.flags.map(f => <span key={f} className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">{f}</span>)}</div>
                {result.contextualBoosts.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">{result.contextualBoosts.map(b => <span key={b} className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded">{b}</span>)}</div>
                )}
              </div>
            )}

            {/* Integration Hooks */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-600 uppercase mb-2">🔗 Integration Hooks (auto-trigger on queue action)</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                {[
                  { label: "Notify User", active: result.integrationHooks.wouldNotifyUser },
                  { label: "Feed Abuse Management", active: result.integrationHooks.wouldFeedAbuse },
                  { label: "Prevent Dispute", active: result.integrationHooks.wouldPreventDispute },
                  { label: "Block Contract Creation", active: result.integrationHooks.wouldBlockContract },
                  { label: "Assign Academy Path", active: result.integrationHooks.academyPathTriggered },
                ].map(h => (
                  <div key={h.label} className={`flex items-center gap-1.5 text-xs ${h.active ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${h.active ? "bg-blue-500" : "bg-gray-200"}`}>{h.active ? "✓" : "–"}</span>
                    {h.label}
                  </div>
                ))}
              </div>
              {result.africaContext && <p className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">🌍 {result.africaContext}</p>}
            </div>

            {/* Rewrite + Education */}
            {result.rewriteSuggestion && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 uppercase mb-2">✏️ AI Rewrite — Platform-Safe Version</p>
                <p className="text-sm text-green-800 leading-relaxed">{result.rewriteSuggestion}</p>
                {result.academyCourse && <p className="text-xs text-green-600 font-semibold mt-2">📚 Assigned Course: {result.academyCourse}</p>}
                {result.educationPath.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Education Path</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {result.educationPath.map((e, i) => <span key={e} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Step {i + 1}: {e}</span>)}
                    </div>
                  </div>
                )}
                {result.academyLink && <a href={result.academyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline mt-2 inline-block">View Academy Course →</a>}
              </div>
            )}

            {result.flags.length === 0 && result.aiScore < 30 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-green-700">Content is Clean</p>
                <p className="text-xs text-green-600 mt-1">All 6 risk dimensions below threshold. Safe to publish.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Rules ───────────────────────────────────────────────────────────────
function RulesTab() {
  const { toast } = useToast();
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ ruleType: "keyword", name: "", pattern: "", severity: "medium", action: "flag", category: "spam", languages: "en" });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setRules(await api("/api/moderation/rules")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (rule: ModerationRule) => {
    try {
      await api(`/api/moderation/rules/${rule.id}/toggle`, { method: "POST", body: "{}" });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this rule?")) return;
    try { await api(`/api/moderation/rules/${id}`, { method: "DELETE" }); setRules(prev => prev.filter(r => r.id !== id)); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const addRule = async () => {
    if (!newRule.name || !newRule.pattern) return;
    setAdding(true);
    try {
      const r = await api("/api/moderation/rules", { method: "POST", body: JSON.stringify({ ...newRule, languages: newRule.languages.split(",").map(l => l.trim()) }) });
      setRules(prev => [r, ...prev]); setShowAdd(false);
      setNewRule({ ruleType: "keyword", name: "", pattern: "", severity: "medium", action: "flag", category: "spam", languages: "en" });
      toast({ title: "Rule added" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const cats = ["all","hate","spam","fraud","adult","violence","pii","copyright"];
  const filtered = filterCat === "all" ? rules : rules.filter(r => r.category === filterCat);
  const totalHits = rules.reduce((a, r) => a + r.hit_count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[{ label: "Total Rules", value: rules.length, icon: "🔧" }, { label: "Active", value: rules.filter(r => r.is_active).length, icon: "✅" }, { label: "Total Hits", value: totalHits, icon: "🎯" }].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3.5">
            <div className="text-xl mb-1">{s.icon}</div><div className="text-2xl font-black text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-white border border-gray-100 rounded-xl p-3">
        <div className="flex gap-1 flex-wrap">
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} data-testid={`cat-${cat}`}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterCat === cat ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={filterCat === cat ? { background: R } : {}}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button data-testid="btn-add-rule" onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: G }}>+ Add Rule</button>
      </div>

      <div className="space-y-2.5">
        {loading ? <div className="flex justify-center py-8"><Spinner /></div> : filtered.map(rule => (
          <div key={rule.id} data-testid={`rule-${rule.id}`} className={`bg-white rounded-xl border p-4 ${rule.is_active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-gray-800">{rule.name}</span>
                  <SevBadge v={rule.severity} />
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 uppercase">{rule.category}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-600 uppercase">{rule.rule_type}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-600">{rule.action}</span>
                  {!rule.is_active && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-400">INACTIVE</span>}
                </div>
                <code className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded font-mono block truncate">{rule.pattern}</code>
                <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
                  <span>Hits: <strong className="text-gray-600">{rule.hit_count}</strong></span>
                  <span>Effectiveness: <strong style={{ color: rule.hit_count > 10 ? G : rule.hit_count > 3 ? Y : "#6b7280" }}>{rule.hit_count > 10 ? "High" : rule.hit_count > 3 ? "Medium" : "Low"}</strong></span>
                  <span>Langs: <strong className="text-gray-600">{(Array.isArray(rule.languages) ? rule.languages : []).join(", ")}</strong></span>
                  {rule.last_triggered && <span>Last: <strong>{fmtDate(rule.last_triggered)}</strong></span>}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button data-testid={`btn-toggle-rule-${rule.id}`} onClick={() => toggle(rule)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white`} style={{ background: rule.is_active ? "#9ca3af" : G }}>
                  {rule.is_active ? "Disable" : "Enable"}
                </button>
                <button data-testid={`btn-del-rule-${rule.id}`} onClick={() => remove(rule.id)} className="px-2 py-1.5 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Moderation Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[{ label: "Name", key: "name", placeholder: "e.g. SA Cash Bypass Detection" }, { label: "Pattern (keyword or regex)", key: "pattern", placeholder: "e.g. pay cash only|eft only" }].map(({ label, key, placeholder }) => (
              <div key={key}>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                <Input value={(newRule as any)[key]} onChange={e => setNewRule(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="text-sm" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Type", key: "ruleType", opts: ["keyword","pattern","ai_threshold","image"] },
                { label: "Severity", key: "severity", opts: ["low","medium","high","critical"] },
                { label: "Action", key: "action", opts: ["flag","quarantine","block","warn"] },
                { label: "Category", key: "category", opts: ["hate","spam","fraud","adult","violence","pii","copyright"] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                  <Select value={(newRule as any)[key]} onValueChange={v => setNewRule(p => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Languages (comma-separated)</p>
              <Input value={newRule.languages} onChange={e => setNewRule(p => ({ ...p, languages: e.target.value }))} placeholder="en, zu, xh, af" className="text-sm" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
            <button data-testid="btn-confirm-add-rule" onClick={addRule} disabled={adding || !newRule.name || !newRule.pattern}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: G }}>
              {adding ? "Adding…" : "Add Rule"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Image Vault ─────────────────────────────────────────────────────────
function ImageVaultTab() {
  const { toast } = useToast();
  const [images, setImages] = useState<FlaggedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FlaggedImage | null>(null);
  const [verdict, setVerdict] = useState("");
  const [action, setAction] = useState("clear");

  const load = async () => {
    setLoading(true);
    try { setImages(await api("/api/moderation/images")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const review = async () => {
    if (!selected) return;
    try {
      const r = await api(`/api/moderation/images/${selected.id}/review`, { method: "POST", body: JSON.stringify({ verdict, action }) });
      toast({ title: "Image reviewed", description: r.parentItemUpdated ? "Parent item quarantined" : "Cleared" });
      setSelected(null); setVerdict(""); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const maxScore = (img: FlaggedImage) => Math.max(img.nsfw_score, img.deepfake_score, img.plagiarism_score, img.copyright_score);
  const riskLabel = (s: number) => s >= 80 ? "Critical" : s >= 60 ? "High" : s >= 40 ? "Medium" : "Low";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 text-center">
        {[{ label: "Total", value: images.length, icon: "🖼️" }, { label: "Unreviewed", value: images.filter(i => !i.reviewed).length, icon: "⏳", alert: true }, { label: "High NSFW", value: images.filter(i => i.nsfw_score >= 70).length, icon: "🔞" }, { label: "Deepfake Risk", value: images.filter(i => i.deepfake_score >= 50).length, icon: "🤖" }].map(s => (
          <div key={s.label} className={`bg-white border rounded-xl p-3.5 ${(s as any).alert && images.filter(i => !i.reviewed).length > 0 ? "border-red-200" : "border-gray-100"}`}>
            <div className="text-xl mb-1">{s.icon}</div><div className="text-2xl font-black text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(img => (
            <div key={img.id} data-testid={`img-${img.id}`}
              className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${img.reviewed ? "opacity-70 border-gray-100" : "border-red-200"}`}
              onClick={() => setSelected(img)}>
              <div className="relative">
                <img src={img.image_url} alt="Flagged" className="w-full h-40 object-cover" />
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${img.reviewed ? "bg-gray-400" : "bg-red-500"}`}>{img.reviewed ? "REVIEWED" : "PENDING"}</span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: maxScore(img) >= 80 ? R : maxScore(img) >= 60 ? O : Y }}>
                  Risk: {riskLabel(maxScore(img))}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {[{ label: "NSFW", val: img.nsfw_score, col: "#ec4899" }, { label: "Deepfake", val: img.deepfake_score, col: "#8b5cf6" }, { label: "Plagiarism", val: img.plagiarism_score, col: O }, { label: "Copyright", val: img.copyright_score, col: R }].map(({ label, val, col }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-bold" style={{ color: col }}>{val}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${val}%`, background: col }} /></div>
                    </div>
                  ))}
                </div>
                {img.ocr_text && <p className="text-[10px] text-gray-500 bg-yellow-50 p-1.5 rounded border border-yellow-100 truncate">OCR: {img.ocr_text}</p>}
                {img.faces_detected > 0 && <p className="text-[10px] text-blue-500">👤 {img.faces_detected} face(s)</p>}
                {img.ai_verdict && <p className="text-[10px] text-gray-500 italic truncate">{img.ai_verdict}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setVerdict(""); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Image Intelligence Review</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <img src={selected.image_url} alt="Flagged" className="w-full h-48 object-cover rounded-lg" />
              <div className="grid grid-cols-4 gap-2 text-center">
                {[{ label: "NSFW", val: selected.nsfw_score }, { label: "Deepfake", val: selected.deepfake_score }, { label: "Plagiarism", val: selected.plagiarism_score }, { label: "Copyright", val: selected.copyright_score }].map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2"><div className="text-xl font-black text-gray-700">{val}</div><div className="text-[10px] text-gray-400">{label}</div></div>
                ))}
              </div>
              {selected.ocr_text && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-yellow-700 mb-1">OCR Text (PII risk)</p>
                  <p className="text-sm text-yellow-800">{selected.ocr_text}</p>
                </div>
              )}
              {selected.ai_verdict && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <p className="text-xs font-bold text-purple-600 mb-1">AI Verdict</p>
                  <p className="text-sm text-purple-800">{selected.ai_verdict}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Action</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[{ v: "clear", label: "Clear — OK" }, { v: "block", label: "Block + Quarantine Parent" }].map(opt => (
                    <button key={opt.v} onClick={() => setAction(opt.v)} data-testid={`img-action-${opt.v}`}
                      className={`p-2.5 rounded-lg border-2 text-xs font-bold transition-colors ${action === opt.v ? (opt.v === "block" ? "border-red-400 bg-red-50 text-red-600" : "border-green-400 bg-green-50 text-green-600") : "border-gray-200 text-gray-500"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Textarea value={verdict} onChange={e => setVerdict(e.target.value)} placeholder="Review notes…" rows={2} />
              </div>
              <DialogFooter>
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-img-review" onClick={review} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: action === "block" ? R : G }}>
                  {action === "block" ? "Block & Quarantine" : "Mark Reviewed"}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/api/moderation/analytics").then(setData).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* ROI Banner */}
      <div className="bg-gradient-to-r from-[#1DBF73] to-[#16a085] rounded-xl p-5 text-white">
        <h3 className="font-bold text-lg mb-3">💰 Dispute Prevention ROI — What Moderation Actually Saves</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Disputes Prevented This Month", value: data.integrationMetrics.disputesPrevented, icon: "🛡️" },
            { label: "Notifications Sent", value: data.integrationMetrics.notificationsSent, icon: "📨" },
            { label: "Academy Paths Triggered", value: data.integrationMetrics.academyPathsTriggered, icon: "📚" },
            { label: "Avg Scan Response", value: `${data.integrationMetrics.avgResponseTimeMs}ms`, icon: "⚡" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl">{icon}</div>
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs opacity-80">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Africa + Education Loop side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
          <h4 className="font-semibold text-sm text-orange-700 mb-3">🌍 Africa-First Metrics (Zero-competitor coverage)</h4>
          <div className="space-y-2">
            {[
              { label: "SA ID blocks this month", value: data.africaMetrics.saIdBlocksThisMonth, icon: "🇿🇦" },
              { label: "Cash/EFT bypass attempts", value: data.africaMetrics.cashBypassAttempts, icon: "💸" },
              { label: "USSD escalations (rural)", value: data.africaMetrics.ussdEscalations, icon: "📱" },
              { label: "Low-data scans served", value: data.africaMetrics.lowDataScans, icon: "📡" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-orange-700">{icon} {label}</span>
                <span className="font-black text-orange-800">{value}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-orange-200">
              <p className="text-[10px] text-orange-500 font-bold uppercase mb-1">Languages Detected</p>
              <div className="flex flex-wrap gap-1">{data.africaMetrics.languagesDetected.map((l: string) => <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">{l}</span>)}</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <h4 className="font-semibold text-sm text-purple-700 mb-3">🎓 Education Loop — Reoffence Reduction (No competitor tracks this)</h4>
          <div className="space-y-2">
            {[
              { label: "Academy paths assigned", value: data.educationLoop.pathsAssigned },
              { label: "Paths completed", value: data.educationLoop.completed },
              { label: "Completion rate", value: `${data.educationLoop.completionRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm"><span className="text-purple-700">{label}</span><span className="font-bold text-purple-800">{value}</span></div>
            ))}
            <div className="mt-2 pt-2 border-t border-purple-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Reoffence WITH education</span>
                <span className="font-bold text-green-600">{data.educationLoop.reoffenceAfterEducation}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Reoffence WITHOUT education</span>
                <span className="font-bold text-red-500">{data.educationLoop.reoffenceWithoutEducation}%</span>
              </div>
              <div className="bg-green-100 rounded p-1.5 text-[10px] text-green-700 font-semibold text-center mt-1">
                Education reduces reoffence by {Math.round(data.educationLoop.reoffenceWithoutEducation - data.educationLoop.reoffenceAfterEducation)}pp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">30-Day Moderation Volume + Disputes Prevented</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.dailyVolume.slice(-14)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {[{ id: "flag", col: R }, { id: "ok", col: G }, { id: "disp", col: "#6366f1" }].map(({ id, col }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={col} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={col} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="flagged" stroke={R} fill="url(#flag)" strokeWidth={2} name="Flagged" />
            <Area type="monotone" dataKey="approved" stroke={G} fill="url(#ok)" strokeWidth={2} name="Approved" />
            <Area type="monotone" dataKey="disputesPrevented" stroke="#6366f1" fill="url(#disp)" strokeWidth={2} name="Disputes Prevented" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Catch Rate vs Dispute Rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <h4 className="font-semibold text-sm text-gray-700">Catch Rate vs Dispute Rate — 6-Month Proof</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600">Better moderation = fewer disputes + more ROI</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data.disputeCorrelation} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="moderationCatchRate" name="Catch Rate %" fill={G} radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="disputeRate" name="Dispute Rate %" stroke={R} strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="roiZar" name="ROI (ZAR)" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* False Positive Rate + Severity Pie side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">False Positive Rate by Content Type</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.falsePositiveRate} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Bar dataKey="rate" name="False Positive %" fill={O} radius={[4, 4, 0, 0]} />
              <Bar dataKey="caught" name="Catch Rate %" fill={G} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">Severity Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.severityDist} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={70} label={({ severity, count }: any) => `${severity}:${count}`} labelLine={false}>
                {data.severityDist.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Appeals ─────────────────────────────────────────────────────────────
function AppealsTab() {
  const { toast } = useToast();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const [resolution, setResolution] = useState<"upheld" | "overturned">("upheld");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setAppeals(await api("/api/moderation/appeals")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const assign = async (appeal: Appeal) => {
    try { await api(`/api/moderation/appeals/${appeal.id}/assign`, { method: "PUT", body: "{}" }); toast({ title: "Assigned" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const resolve = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      await api(`/api/moderation/appeals/${selected.id}/resolve`, { method: "POST", body: JSON.stringify({ resolution, resolutionNote }) });
      toast({ title: `Appeal ${resolution}` });
      setSelected(null); setResolutionNote(""); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setResolving(false); }
  };

  const slaHours = (deadline: string | null) => {
    if (!deadline) return null;
    return Math.round((new Date(deadline).getTime() - Date.now()) / 3600000);
  };

  const aiConfidence = (appeal: Appeal) => {
    if (!appeal.ai_explanation) return 50;
    const len = appeal.ai_explanation.length;
    return Math.min(95, 60 + Math.round(len / 50));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl p-4 flex-wrap">
        <span>🔴 <strong>{appeals.filter(a => a.status === "pending").length}</strong> pending</span>
        <span>🟡 <strong>{appeals.filter(a => a.status === "under_review").length}</strong> under review</span>
        <span>✅ <strong>{appeals.filter(a => a.status === "upheld" || a.status === "overturned").length}</strong> resolved</span>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">SLA: 24h critical · 48h high · 72h medium</span>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : appeals.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">⚖️</div><p>No appeals in queue</p></div>
      ) : (
        <div className="space-y-3">
          {appeals.map(appeal => {
            const hours = slaHours(appeal.sla_deadline);
            const slaCritical = hours !== null && hours < 6;
            const conf = aiConfidence(appeal);
            return (
              <div key={appeal.id} data-testid={`appeal-${appeal.id}`}
                className={`bg-white rounded-xl border p-4 ${slaCritical ? "border-red-300" : "border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-sm text-gray-800">Appeal #{appeal.id}</span>
                      <StaBadge v={appeal.status} />
                      {appeal.severity && <SevBadge v={appeal.severity} />}
                      <span className="px-2 py-0.5 rounded text-[9px] bg-gray-100 text-gray-500 capitalize">{appeal.content_type}</span>
                      {hours !== null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slaCritical ? "bg-red-100 text-red-600 animate-pulse" : "bg-yellow-50 text-yellow-600"}`}>
                          SLA: {hours > 0 ? `${hours}h left` : "OVERDUE"}
                        </span>
                      )}
                      <span className="text-[10px] text-purple-500 font-semibold">AI Confidence: {conf}%</span>
                    </div>
                    {appeal.content_preview && <p className="text-xs text-gray-400 mb-2 truncate">Original: {appeal.content_preview}</p>}
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                      <p className="text-xs font-bold text-blue-600 mb-1">User Appeal Reason</p>
                      <p className="text-sm text-blue-800">{appeal.reason}</p>
                    </div>
                    {appeal.ai_explanation && (
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-purple-600">🤖 AI Analysis &amp; Recommendation</p>
                          <div className="flex-1 h-1.5 bg-purple-100 rounded-full"><div className="h-full bg-purple-400 rounded-full" style={{ width: `${conf}%` }} /></div>
                          <span className="text-[10px] text-purple-500">{conf}%</span>
                        </div>
                        <p className="text-sm text-purple-800">{appeal.ai_explanation}</p>
                      </div>
                    )}
                    {appeal.resolution_note && (
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg mt-2">
                        <p className="text-xs font-bold text-gray-400 mb-1">Resolution</p>
                        <p className="text-sm text-gray-700">{appeal.resolution_note}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{fmtDateTime(appeal.resolved_at)}</p>
                      </div>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>User: {appeal.user_id}</span>
                      <span>Filed: {fmtDate(appeal.created_at)}</span>
                      {appeal.assigned_reviewer_id && <span className="text-green-500">✓ Assigned</span>}
                    </div>
                  </div>
                  {(appeal.status === "pending" || appeal.status === "under_review") && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {appeal.status === "pending" && (
                        <button data-testid={`btn-assign-${appeal.id}`} onClick={() => assign(appeal)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                          Assign to Me
                        </button>
                      )}
                      <button data-testid={`btn-resolve-${appeal.id}`} onClick={() => { setSelected(appeal); setResolution("upheld"); setResolutionNote(""); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: G }}>
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Resolve Appeal #{selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-400 mb-1">User's Reason</p>
                <p className="text-sm text-gray-700">{selected.reason}</p>
              </div>
              {selected.ai_explanation && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-bold text-purple-500 mb-1">AI Recommendation ({aiConfidence(selected)}% confidence)</p>
                  <p className="text-sm text-purple-800">{selected.ai_explanation}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Decision</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: "upheld" as const, label: "Uphold Block", sub: "Content stays removed" }, { v: "overturned" as const, label: "Overturn — Approve", sub: "Content reinstated" }].map(opt => (
                    <button key={opt.v} onClick={() => setResolution(opt.v)} data-testid={`btn-res-${opt.v}`}
                      className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${resolution === opt.v ? (opt.v === "upheld" ? "border-red-400 bg-red-50 text-red-600" : "border-green-400 bg-green-50 text-green-600") : "border-gray-200 text-gray-500"}`}>
                      {opt.label}
                      <p className="font-normal text-[10px] mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Resolution Note (sent to user)</p>
                <Textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} placeholder="Transparent explanation of your decision…" rows={3} />
              </div>
              <DialogFooter>
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-resolve" onClick={resolve} disabled={resolving}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: resolution === "overturned" ? G : R }}>
                  {resolving ? "Resolving…" : `Confirm — ${resolution === "upheld" ? "Uphold" : "Reinstate"}`}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Offenders ───────────────────────────────────────────────────────────
function OffendersTab() {
  const { toast } = useToast();
  const [offenders, setOffenders] = useState<Offender[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Offender | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setOffenders(await api("/api/moderation/offenders")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const viewProfile = async (o: Offender) => {
    setSelected(o); setProfileLoading(true);
    try { setProfile(await api(`/api/moderation/user/${o.userId}/risk`)); }
    catch { setProfile(null); }
    finally { setProfileLoading(false); }
  };

  const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    permanent_ban: { label: "Permanent Ban", color: R },
    suspend_30d: { label: "Suspend 30 Days", color: O },
    final_warning: { label: "Final Warning", color: Y },
    warning: { label: "Issue Warning", color: "#6366f1" },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="font-bold text-gray-800 mb-1">Repeat Offender Engine</h3>
        <p className="text-xs text-gray-400">Cross-item user history scoring — automatically surfaces users who have evaded previous moderation. No competitor has this.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Total Offenders", value: offenders.length, icon: "⚠️" },
          { label: "Extreme Risk", value: offenders.filter(o => o.riskLevel === "extreme").length, icon: "🚨", col: R },
          { label: "Avg Dispute Risk", value: offenders.length ? `${Math.round(offenders.reduce((a, o) => a + o.disputeRisk, 0) / offenders.length)}%` : "0%", icon: "📊" },
        ].map(({ label, value, icon, col }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-3.5">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-2xl font-black" style={{ color: col || "#374151" }}>{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : offenders.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🎉</div><p>No repeat offenders — platform is clean</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["User", "Violations", "Critical", "Avg Score", "Dispute Risk", "Risk Level", "Recommended Action", "Last Violation", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offenders.map(o => {
                  const rec = ACTION_LABELS[o.recommendedAction] || { label: o.recommendedAction, color: "#6b7280" };
                  return (
                    <tr key={o.userId} data-testid={`offender-${o.userId}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.userId.slice(0, 16)}…</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{o.totalViolations}</td>
                      <td className="px-4 py-3">
                        {o.criticalCount > 0 ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: R }}>{o.criticalCount}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 w-20">
                          <ScoreBar score={o.avgScore} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 w-20"><ScoreBar score={Math.round(o.disputeRisk)} /></div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white capitalize" style={{ background: RISK_COL[o.riskLevel] || "#6b7280" }}>{o.riskLevel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: rec.color }}>{rec.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(o.lastViolation)}</td>
                      <td className="px-4 py-3">
                        <button data-testid={`btn-profile-${o.userId}`} onClick={() => viewProfile(o)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#6366f1" }}>View Profile</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offender Profile Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setProfile(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Offender Risk Profile — {selected?.userId.slice(0, 20)}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ label: "Total Violations", value: selected.totalViolations }, { label: "Critical", value: selected.criticalCount }, { label: "Dispute Risk", value: `${Math.round(selected.disputeRisk)}%` }].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3"><div className="text-2xl font-black text-gray-800">{value}</div><div className="text-xs text-gray-400">{label}</div></div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase mr-2">Risk Level</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white capitalize" style={{ background: RISK_COL[selected.riskLevel] || "#6b7280" }}>{selected.riskLevel}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase mr-2">Recommended</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACTION_LABELS[selected.recommendedAction]?.color || "#6b7280" }}>
                    {ACTION_LABELS[selected.recommendedAction]?.label || selected.recommendedAction}
                  </span>
                </div>
              </div>

              {profileLoading ? <div className="flex justify-center py-6"><Spinner /></div> : profile && (
                <>
                  {profile.educationPath.length > 0 && (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <p className="text-xs font-bold text-purple-600 uppercase mb-2">📚 Recommended Education Path</p>
                      <div className="space-y-1">
                        {profile.educationPath.map((step: string, i: number) => (
                          <div key={step} className="flex items-center gap-2 text-sm text-purple-800">
                            <span className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Recommendation</p>
                    <p className="text-sm text-blue-800">{profile.recommendation}</p>
                  </div>
                  {profile.history.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Violation History ({profile.history.length} items)</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {profile.history.slice(0, 8).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg text-xs">
                            <SevBadge v={item.severity} />
                            <StaBadge v={item.status} />
                            <span className="text-gray-500 capitalize">{item.content_type}</span>
                            <span className="font-bold text-gray-700">Score: {item.ai_score}</span>
                            <span className="text-gray-400 ml-auto whitespace-nowrap">{fmtDate(item.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "queue", label: "📋 Queue", component: QueueTab },
  { id: "scanner", label: "🔍 Scanner", component: ScannerTab },
  { id: "rules", label: "🔧 Rules", component: RulesTab },
  { id: "images", label: "🖼️ Image Vault", component: ImageVaultTab },
  { id: "analytics", label: "📊 Analytics", component: AnalyticsTab },
  { id: "appeals", label: "⚖️ Appeals", component: AppealsTab },
  { id: "offenders", label: "🎓 Offenders", component: OffendersTab },
];

export default function ContentModeration() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("queue");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    api("/api/moderation/stats").then(setStats).catch(() => {});
  }, [user]);

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const Active = TABS.find(t => t.id === activeTab)?.component || QueueTab;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate("/admin")} data-testid="btn-back-admin" className="text-sm text-gray-500 hover:text-gray-700 mr-1">← Admin</button>
          <span className="text-lg font-black text-gray-800">🛡️ Content Moderation</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: R }}>200% INTELLIGENCE</span>
          {stats && stats.criticalPending > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">🚨 {stats.criticalPending} critical</span>
          )}
          {stats && stats.pending > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">{stats.pending} pending</span>
          )}
          {stats && stats.estimatedRoiZar > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">💰 {zarFmt(stats.estimatedRoiZar)} ROI</span>
          )}
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-6 space-y-5">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Total", value: stats.total, bg: "bg-white border-gray-100", tc: "#374151" },
              { label: "Pending", value: stats.pending, bg: "bg-indigo-50 border-indigo-100", tc: "#4f46e5" },
              { label: "Quarantined", value: stats.quarantined, bg: "bg-orange-50 border-orange-100", tc: "#ea580c" },
              { label: "Rejected", value: stats.rejected, bg: "bg-red-50 border-red-100", tc: R },
              { label: "Approved", value: stats.approved, bg: "bg-green-50 border-green-100", tc: "#16a34a" },
              { label: "Critical", value: stats.criticalPending, bg: "bg-red-50 border-red-200", tc: R },
              { label: "Appeals", value: stats.pendingAppeals, bg: "bg-purple-50 border-purple-100", tc: "#7c3aed" },
              { label: "Avg Score", value: stats.avgScore, bg: "bg-white border-gray-100", tc: stats.avgScore >= 60 ? R : stats.avgScore >= 35 ? O : "#16a34a" },
            ].map(({ label, value, bg, tc }) => (
              <div key={label} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
                className={`rounded-xl p-3.5 border ${bg} flex flex-col gap-1`}>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-2xl font-black" style={{ color: tc }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-1 flex-wrap bg-white border border-gray-100 rounded-xl p-1.5">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              style={activeTab === tab.id ? { background: R } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab */}
        <Active />
      </div>
    </div>
  );
}

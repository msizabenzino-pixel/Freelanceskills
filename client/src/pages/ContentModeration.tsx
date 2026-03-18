/**
 * Content Moderation Department — 200% Intelligence
 * FreelanceSkills.net — Platform Safety Guardian
 * 6 Tabs: Queue · Scanner · Rules · Image Vault · Analytics · Appeals
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const G = "#1DBF73";
const ADMIN_ID = "user_2Pz69BfA5yS3R8M";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e"
};
const STATUS_COLOR: Record<string, string> = {
  pending: "#6366f1", approved: "#22c55e", rejected: "#ef4444",
  quarantined: "#f97316", escalated: "#a855f7"
};
const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

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
  languages: string[]; hit_count: number; last_triggered: string | null;
  created_at: string;
}
interface FlaggedImage {
  id: number; item_id: number; image_url: string; nsfw_score: number;
  deepfake_score: number; plagiarism_score: number; copyright_score: number;
  faces_detected: number; ocr_text: string | null; ocr_flags: string[];
  ai_verdict: string | null; reviewed: boolean; created_at: string;
  user_id: string; content_type: string; item_status: string;
}
interface Appeal {
  id: number; item_id: number; user_id: string; reason: string;
  evidence_urls: string[]; status: string; ai_explanation: string | null;
  resolution_note: string | null; assigned_reviewer_id: string | null;
  sla_deadline: string | null; resolved_at: string | null;
  created_at: string; content_type: string; content_preview: string;
  severity: string; flags: string[]; ai_score: number;
}
interface Stats {
  pending: number; quarantined: number; rejected: number; approved: number;
  critical: number; total: number; pendingAppeals: number;
  bySeverity: { severity: string; count: number }[];
  byType: { type: string; count: number }[];
}
interface ScanResult {
  aiScore: number; severity: string; flags: string[];
  autoAction: string; rewriteSuggestion: string | null; academyLink: string | null;
  riskFactors: { name: string; score: number; weight: number }[];
  wordCount: number; charCount: number;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};
const fmtDate = (d: string | null) => !d ? "—" : new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (d: string | null) => !d ? "—" : new Date(d).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" });

function ScorePill({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const col = pct >= 85 ? "#ef4444" : pct >= 65 ? "#f97316" : pct >= 40 ? "#eab308" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: col }}>{score}</span>
    </div>
  );
}

function SevBadge({ severity }: { severity: string }) {
  const col = SEVERITY_COLOR[severity] || "#6b7280";
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: col }}>{severity}</span>;
}

function StataBadge({ status }: { status: string }) {
  const col = STATUS_COLOR[status] || "#6b7280";
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: col }}>{status}</span>;
}

// ─── Tab: Moderation Queue ─────────────────────────────────────────────────────
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
  const [actionItem, setActionItem] = useState<ModerationItem | null>(null);
  const [actionType, setActionType] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filterStatus, page: String(page), limit: "20" });
      if (filterSeverity !== "all") params.set("severity", filterSeverity);
      if (filterType !== "all") params.set("contentType", filterType);
      const data = await api(`/api/moderation/queue?${params}`);
      setItems(data.items); setTotal(data.total);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [filterStatus, filterSeverity, filterType, page, toast]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (item: ModerationItem, action: string, note = "") => {
    setActing(true);
    try {
      await api(`/api/moderation/queue/${item.id}/action`, { method: "PUT", body: JSON.stringify({ action, reviewNote: note }) });
      toast({ title: "Done", description: `Item ${action}d` });
      load(); setActionItem(null); setReviewNote("");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActing(false); }
  };

  const doBulk = async (action: string) => {
    if (!selected.size) return;
    try {
      await api("/api/moderation/queue/bulk", { method: "POST", body: JSON.stringify({ ids: [...selected], action }) });
      toast({ title: "Done", description: `${selected.size} items ${action}d` });
      setSelected(new Set()); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const toggleSelect = (id: number) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-100 rounded-xl p-3">
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="filter-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["pending","quarantined","escalated","rejected","approved","all"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="filter-severity"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            {["all","critical","high","medium","low"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="filter-type"><SelectValue placeholder="Content type" /></SelectTrigger>
          <SelectContent>
            {["all","gig","job","message","portfolio","proposal","review","contract","chat"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        {selected.size > 0 && (
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 self-center">{selected.size} selected</span>
            <button data-testid="btn-bulk-approve" onClick={() => doBulk("approve")}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: G }}>Approve All</button>
            <button data-testid="btn-bulk-reject" onClick={() => doBulk("reject")}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-red-500">Reject All</button>
            <button data-testid="btn-bulk-quarantine" onClick={() => doBulk("quarantine")}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-orange-500">Quarantine All</button>
          </div>
        )}
        <button onClick={load} className="px-3 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">↻ Refresh</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-[#1DBF73] border-t-transparent rounded-full" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-medium">Queue empty — all items reviewed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(items.map(i => i.id)) : new Set())}
                      checked={selected.size === items.length && items.length > 0} />
                  </th>
                  <th className="px-4 py-3 text-left">Content</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">AI Score</th>
                  <th className="px-4 py-3 text-left">Severity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Flags</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} data-testid={`row-moditem-${item.id}`}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(item.id) ? "bg-indigo-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-gray-700 truncate">{item.content_preview}</p>
                      {item.africa_context && (
                        <p className="text-[10px] text-orange-500 mt-0.5 truncate">🌍 {item.africa_context}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 capitalize">{item.content_type}</span>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <ScorePill score={item.ai_score} />
                    </td>
                    <td className="px-4 py-3"><SevBadge severity={item.severity} /></td>
                    <td className="px-4 py-3"><StataBadge status={item.status} /></td>
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
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {item.status === "pending" || item.status === "quarantined" ? (
                          <>
                            <button data-testid={`btn-approve-${item.id}`}
                              onClick={() => doAction(item, "approve")}
                              className="px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: G }}>✓</button>
                            <button data-testid={`btn-reject-${item.id}`}
                              onClick={() => { setActionItem(item); setActionType("reject"); }}
                              className="px-2 py-1 rounded text-[10px] font-bold text-white bg-red-500">✕</button>
                            <button data-testid={`btn-escalate-${item.id}`}
                              onClick={() => doAction(item, "escalate")}
                              className="px-2 py-1 rounded text-[10px] font-bold text-white bg-purple-500">↑</button>
                          </>
                        ) : null}
                        <button data-testid={`btn-view-${item.id}`}
                          onClick={() => { setActionItem(item); setActionType("view"); }}
                          className="px-2 py-1 rounded text-[10px] bg-gray-100 text-gray-600">👁</button>
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
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-gray-500">{page} / {totalPages} ({total} items)</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionItem} onOpenChange={() => { setActionItem(null); setReviewNote(""); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionType === "view" ? "Item Detail" : `${actionType.charAt(0).toUpperCase()}${actionType.slice(1)} Item`}</DialogTitle>
          </DialogHeader>
          {actionItem && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <SevBadge severity={actionItem.severity} />
                <StataBadge status={actionItem.status} />
                <span className="text-xs text-gray-500">AI Score: <strong>{actionItem.ai_score}/100</strong></span>
                <span className="text-xs text-gray-500">Type: <strong>{actionItem.content_type}</strong></span>
                <span className="text-xs text-gray-500">User: <strong>{actionItem.user_id}</strong></span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Content Preview</p>
                <p className="text-sm text-gray-700">{actionItem.content_preview}</p>
              </div>
              {(Array.isArray(actionItem.flags) ? actionItem.flags : []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Risk Flags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {actionItem.flags.map(f => <span key={f} className="px-2 py-1 rounded-full text-xs bg-red-50 text-red-600 font-medium">{f}</span>)}
                  </div>
                </div>
              )}
              {actionItem.rewrite_suggestion && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-1">✏️ AI Rewrite Suggestion</p>
                  <p className="text-sm text-green-800">{actionItem.rewrite_suggestion}</p>
                  {actionItem.academy_link && (
                    <a href={actionItem.academy_link} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-600 underline mt-1 inline-block">📚 View Academy Course</a>
                  )}
                </div>
              )}
              {actionItem.africa_context && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-semibold text-orange-700 uppercase mb-1">🌍 Africa Intelligence</p>
                  <p className="text-sm text-orange-800">{actionItem.africa_context}</p>
                </div>
              )}
              {actionType === "reject" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Review Note (sent to user)</p>
                  <Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                    placeholder="Explain why this content was rejected..." rows={3} />
                </div>
              )}
              {actionType !== "view" && (
                <DialogFooter>
                  <button onClick={() => { setActionItem(null); setReviewNote(""); }}
                    className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                  <button data-testid="btn-confirm-action" onClick={() => doAction(actionItem, actionType, reviewNote)} disabled={acting}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: actionType === "reject" ? "#ef4444" : G }}>
                    {acting ? "Processing..." : `Confirm ${actionType}`}
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

// ─── Tab: Real-time Content Scanner ───────────────────────────────────────────
function ScannerTab() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("gig");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saveResult, setSaveResult] = useState(false);

  const scan = async () => {
    if (!content.trim()) return;
    setScanning(true);
    try {
      const data = await api("/api/moderation/scan", {
        method: "POST",
        body: JSON.stringify({ content, contentType, saveResult }),
      });
      setResult(data);
    } catch (e: any) { toast({ title: "Scan failed", description: e.message, variant: "destructive" }); }
    finally { setScanning(false); }
  };

  const actionColor = result ? (result.autoAction === "block" ? "#ef4444" : result.autoAction === "quarantine" ? "#f97316" : result.autoAction === "flag" ? "#eab308" : G) : G;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Input Panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-800">Real-time Content Scanner</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: G }}>200% AI</span>
          </div>
          <div className="flex gap-3">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-36 text-xs" data-testid="scanner-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["gig","job","message","portfolio","proposal","review","contract"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={saveResult} onChange={e => setSaveResult(e.target.checked)} className="rounded" />
              Save to queue if flagged
            </label>
          </div>
          <Textarea
            data-testid="scanner-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste any content to scan — gig description, job post, message, review, portfolio text..."
            rows={10}
            className="text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length} chars · {content.split(/\s+/).filter(Boolean).length} words</span>
            <button data-testid="btn-scan" onClick={scan} disabled={scanning || !content.trim()}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition-colors"
              style={{ background: G }}>
              {scanning ? "⚡ Scanning..." : "⚡ Scan Content"}
            </button>
          </div>
        </div>

        {/* Example snippets */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">Try These Examples</p>
          {[
            { label: "Off-platform bypass", text: "I can do this for you, WhatsApp me directly and we can pay outside the platform to save fees." },
            { label: "Racial hate speech", text: "Only looking for local talent, no foreigners or amakwerekwere please." },
            { label: "SA ID PII leak", text: "Please send your ID number 8501015026082 and banking details to process payment." },
            { label: "Clean gig description", text: "Professional logo designer with 5 years of experience. I create memorable brand identities for SA businesses. Fast turnaround, unlimited revisions." },
          ].map(ex => (
            <button key={ex.label} onClick={() => setContent(ex.text)} data-testid={`example-${ex.label.replace(/\s/g, "-")}`}
              className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="text-xs font-semibold text-gray-600">{ex.label}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{ex.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        {!result ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center py-24 text-gray-300">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium text-sm">Scan results will appear here</p>
          </div>
        ) : (
          <>
            {/* Score Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">AI Risk Score</p>
                  <p className="text-4xl font-black" style={{ color: actionColor }}>{result.aiScore}<span className="text-lg text-gray-400">/100</span></p>
                </div>
                <div className="text-right space-y-1">
                  <SevBadge severity={result.severity} />
                  <div />
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: actionColor }}>
                    AI Action: {result.autoAction.toUpperCase()}
                  </span>
                </div>
              </div>
              <ScorePill score={result.aiScore} />
            </div>

            {/* Risk Factors Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Risk Factor Breakdown</p>
              <div className="space-y-3">
                {result.riskFactors.map(rf => (
                  <div key={rf.name}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{rf.name}</span>
                      <span className="font-semibold">{rf.score}/100 <span className="text-gray-400">({Math.round(rf.weight * 100)}% weight)</span></span>
                    </div>
                    <ScorePill score={rf.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="bg-white rounded-xl border border-red-100 p-5">
                <p className="text-xs font-semibold text-red-500 uppercase mb-2">⚠️ Risk Flags Detected ({result.flags.length})</p>
                <div className="flex flex-wrap gap-2">
                  {result.flags.map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite Suggestion */}
            {result.rewriteSuggestion && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-green-700 uppercase mb-2">✏️ AI Rewrite Suggestion</p>
                <p className="text-sm text-green-800 leading-relaxed">{result.rewriteSuggestion}</p>
                {result.academyLink && (
                  <a href={result.academyLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-green-600 font-medium underline">
                    📚 View Academy Course →
                  </a>
                )}
              </div>
            )}

            {result.flags.length === 0 && result.aiScore < 30 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-green-700">Content is Clean</p>
                <p className="text-xs text-green-600 mt-1">No policy violations detected. Safe to publish.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Rules & Keywords ─────────────────────────────────────────────────────
function RulesTab() {
  const { toast } = useToast();
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ ruleType: "keyword", name: "", pattern: "", severity: "medium", action: "flag", category: "spam", languages: "en" });
  const [adding, setAdding] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

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
    try {
      await api(`/api/moderation/rules/${id}`, { method: "DELETE" });
      setRules(prev => prev.filter(r => r.id !== id));
      toast({ title: "Rule deleted" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const addRule = async () => {
    if (!newRule.name || !newRule.pattern) return;
    setAdding(true);
    try {
      const r = await api("/api/moderation/rules", {
        method: "POST",
        body: JSON.stringify({ ...newRule, languages: newRule.languages.split(",").map(l => l.trim()) }),
      });
      setRules(prev => [r, ...prev]);
      setShowAdd(false);
      setNewRule({ ruleType: "keyword", name: "", pattern: "", severity: "medium", action: "flag", category: "spam", languages: "en" });
      toast({ title: "Rule added" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const categories = ["all", "hate", "spam", "fraud", "adult", "violence", "pii", "copyright"];
  const filtered = filterCat === "all" ? rules : rules.filter(r => r.category === filterCat);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-100 rounded-xl p-3">
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} data-testid={`filter-cat-${cat}`}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterCat === cat ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={filterCat === cat ? { background: G } : {}}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button data-testid="btn-add-rule" onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: G }}>+ Add Rule</button>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-[#1DBF73] border-t-transparent rounded-full" /></div>
        ) : filtered.map(rule => (
          <div key={rule.id} data-testid={`rule-${rule.id}`}
            className={`bg-white rounded-xl border p-4 transition-opacity ${rule.is_active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-gray-800">{rule.name}</span>
                  <SevBadge severity={rule.severity} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">{rule.category}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 uppercase">{rule.rule_type}</span>
                  {!rule.is_active && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-400">INACTIVE</span>}
                </div>
                <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded font-mono block truncate">{rule.pattern}</code>
                <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
                  <span>Action: <strong className="text-gray-600">{rule.action}</strong></span>
                  <span>Hits: <strong className="text-gray-600">{rule.hit_count}</strong></span>
                  <span>Languages: <strong className="text-gray-600">{(Array.isArray(rule.languages) ? rule.languages : []).join(", ")}</strong></span>
                  {rule.last_triggered && <span>Last hit: <strong className="text-gray-600">{fmtDate(rule.last_triggered)}</strong></span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button data-testid={`btn-toggle-rule-${rule.id}`} onClick={() => toggle(rule)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${rule.is_active ? "bg-gray-400" : ""}`}
                  style={rule.is_active ? {} : { background: G }}>
                  {rule.is_active ? "Disable" : "Enable"}
                </button>
                <button data-testid={`btn-delete-rule-${rule.id}`} onClick={() => remove(rule.id)}
                  className="px-2 py-1.5 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Moderation Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Name", key: "name", type: "input", placeholder: "e.g. Off-platform payment bypass" },
              { label: "Pattern (keyword/regex)", key: "pattern", type: "input", placeholder: "e.g. pay outside|bypass platform" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
                <Input value={(newRule as any)[key]} onChange={e => setNewRule(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} className="text-sm" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Rule Type", key: "ruleType", opts: ["keyword","pattern","ai_threshold","image"] },
                { label: "Severity", key: "severity", opts: ["low","medium","high","critical"] },
                { label: "Action", key: "action", opts: ["flag","quarantine","block","warn"] },
                { label: "Category", key: "category", opts: ["hate","spam","fraud","adult","violence","pii","copyright"] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
                  <Select value={(newRule as any)[key]} onValueChange={v => setNewRule(p => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Languages (comma-separated)</p>
              <Input value={newRule.languages} onChange={e => setNewRule(p => ({ ...p, languages: e.target.value }))}
                placeholder="en, zu, xh, af" className="text-sm" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
            <button data-testid="btn-confirm-add-rule" onClick={addRule} disabled={adding || !newRule.name || !newRule.pattern}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: G }}>
              {adding ? "Adding..." : "Add Rule"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Image Intelligence Vault ────────────────────────────────────────────
function ImageVaultTab() {
  const { toast } = useToast();
  const [images, setImages] = useState<FlaggedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FlaggedImage | null>(null);
  const [reviewVerdict, setReviewVerdict] = useState("");

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
      await api(`/api/moderation/images/${selected.id}/review`, { method: "POST", body: JSON.stringify({ verdict: reviewVerdict }) });
      toast({ title: "Image reviewed" });
      setSelected(null); setReviewVerdict(""); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const maxScore = (img: FlaggedImage) => Math.max(img.nsfw_score, img.deepfake_score, img.plagiarism_score, img.copyright_score);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Total Flagged Images", value: images.length, icon: "🖼️" },
          { label: "Pending Review", value: images.filter(i => !i.reviewed).length, icon: "⏳" },
          { label: "High Risk (score 70+)", value: images.filter(i => maxScore(i) >= 70).length, icon: "🚨" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-black text-gray-800">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-[#1DBF73] border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(img => (
            <div key={img.id} data-testid={`img-vault-${img.id}`}
              className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${img.reviewed ? "opacity-70 border-gray-100" : "border-red-200"}`}
              onClick={() => setSelected(img)}>
              <div className="relative">
                <img src={img.image_url} alt="Flagged content" className="w-full h-40 object-cover" />
                {!img.reviewed && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">UNREVIEWED</span>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="text-xs text-white font-semibold">Risk Score: {maxScore(img)}/100</div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    { label: "NSFW", value: img.nsfw_score, col: "#ec4899" },
                    { label: "Deepfake", value: img.deepfake_score, col: "#8b5cf6" },
                    { label: "Plagiarism", value: img.plagiarism_score, col: "#f97316" },
                    { label: "Copyright", value: img.copyright_score, col: "#ef4444" },
                  ].map(({ label, value, col }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-bold" style={{ color: col }}>{value}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${value}%`, background: col }} />
                      </div>
                    </div>
                  ))}
                </div>
                {img.ocr_text && (
                  <p className="text-[10px] text-gray-500 bg-yellow-50 p-1.5 rounded border border-yellow-100 truncate">
                    OCR: {img.ocr_text}
                  </p>
                )}
                {img.faces_detected > 0 && (
                  <p className="text-[10px] text-blue-500">👤 {img.faces_detected} face(s) detected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setReviewVerdict(""); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Review Flagged Image</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <img src={selected.image_url} alt="Flagged" className="w-full h-48 object-cover rounded-lg" />
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "NSFW", value: selected.nsfw_score },
                  { label: "Deepfake", value: selected.deepfake_score },
                  { label: "Plagiarism", value: selected.plagiarism_score },
                  { label: "Copyright", value: selected.copyright_score },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-black text-gray-700">{value}</div>
                    <div className="text-[10px] text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
              {selected.ocr_text && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-yellow-700 mb-1">OCR Text Detected</p>
                  <p className="text-sm text-yellow-800">{selected.ocr_text}</p>
                </div>
              )}
              {selected.ai_verdict && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-700 mb-1">AI Verdict</p>
                  <p className="text-sm text-blue-800">{selected.ai_verdict}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Your Review Decision</p>
                <Textarea value={reviewVerdict} onChange={e => setReviewVerdict(e.target.value)}
                  placeholder="e.g. Confirmed NSFW — removing image and quarantining the portfolio item." rows={2} />
              </div>
              <DialogFooter>
                <button onClick={() => { setSelected(null); setReviewVerdict(""); }} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-image-review" onClick={review}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: G }}>
                  Mark Reviewed
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Analytics ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/moderation/analytics")
      .then(setData)
      .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-2 border-[#1DBF73] border-t-transparent rounded-full" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Africa Intelligence Banner */}
      <div className="bg-gradient-to-r from-[#1DBF73] to-[#16a085] rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌍</span>
          <h3 className="font-bold text-lg">Africa-First Moderation Intelligence</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "SA Flagged", value: data.africaMetrics.southAfrica.flagged, icon: "🇿🇦" },
            { label: "Nigeria Flagged", value: data.africaMetrics.nigeria.flagged, icon: "🇳🇬" },
            { label: "USSD Escalations", value: data.africaMetrics.ussdEscalations, icon: "📱" },
            { label: "Low-data Scans", value: data.africaMetrics.lowDataScans, icon: "📡" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl">{icon}</div>
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs opacity-80">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <p className="text-xs opacity-80 mr-1">Languages detected:</p>
          {data.africaMetrics.languagesDetected.map((l: string) => (
            <span key={l} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25">{l}</span>
          ))}
        </div>
      </div>

      {/* Row 1: Volume Chart + Severity Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">30-Day Moderation Volume</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.dailyVolume.slice(-14)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="modFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="modApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="flagged" stroke="#ef4444" fill="url(#modFlagged)" strokeWidth={2} name="Flagged" />
              <Area type="monotone" dataKey="approved" stroke={G} fill="url(#modApproved)" strokeWidth={2} name="Approved" />
              <Area type="monotone" dataKey="rejected" stroke="#f97316" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">Severity Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.severityDist} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={70} label={({ severity, count }: any) => `${severity}: ${count}`} labelLine={false}>
                {data.severityDist.map((entry: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: False Positive Rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">False Positive Rate by Content Type (lower is better)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.falsePositiveRate} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="type" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v: any) => `${v}%`} />
            <Bar dataKey="rate" name="False Positive Rate" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="caught" name="Catch Rate" fill={G} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Moderation Catch Rate vs Dispute Rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <h4 className="font-semibold text-sm text-gray-700">Moderation Catch Rate vs Dispute Rate</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600">↗ Strong negative correlation: better moderation = fewer disputes</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data.disputeCorrelation} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="moderationCatchRate" name="Catch Rate %" fill={G} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="disputeRate" name="Dispute Rate %" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Africa Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">Africa Country Breakdown</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-50">
              <th className="pb-2 text-left">Country</th>
              <th className="pb-2 text-right">Total Flagged</th>
              <th className="pb-2 text-right">Hate Speech</th>
              <th className="pb-2 text-right">Fraud</th>
              <th className="pb-2 text-right">Spam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { flag: "🇿🇦", name: "South Africa", ...data.africaMetrics.southAfrica },
              { flag: "🇳🇬", name: "Nigeria", ...data.africaMetrics.nigeria },
              { flag: "🇰🇪", name: "Kenya", ...data.africaMetrics.kenya },
              { flag: "🇬🇭", name: "Ghana", ...data.africaMetrics.ghana },
            ].map(row => (
              <tr key={row.name} className="hover:bg-gray-50">
                <td className="py-2.5">{row.flag} {row.name}</td>
                <td className="py-2.5 text-right font-bold text-gray-700">{row.flagged}</td>
                <td className="py-2.5 text-right text-red-500">{row.hateSpeech}</td>
                <td className="py-2.5 text-right text-orange-500">{row.fraud}</td>
                <td className="py-2.5 text-right text-yellow-500">{row.spam}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    try {
      await api(`/api/moderation/appeals/${appeal.id}/assign`, { method: "PUT", body: "{}" });
      toast({ title: "Appeal assigned to you" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const resolve = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      await api(`/api/moderation/appeals/${selected.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolution, resolutionNote }),
      });
      toast({ title: `Appeal ${resolution}` });
      setSelected(null); setResolutionNote(""); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setResolving(false); }
  };

  const slaHours = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const hours = Math.round(diff / 3600000);
    return hours;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex gap-3 text-sm text-gray-500">
          <span>🔴 <strong>{appeals.filter(a => a.status === "pending").length}</strong> pending</span>
          <span>🟡 <strong>{appeals.filter(a => a.status === "under_review").length}</strong> under review</span>
          <span>✅ <strong>{appeals.filter(a => a.status === "upheld" || a.status === "overturned").length}</strong> resolved</span>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">SLA: 24h (critical) · 48h (high) · 72h (medium)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-[#1DBF73] border-t-transparent rounded-full" /></div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">⚖️</div>
          <p className="font-medium">No appeals in the queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appeals.map(appeal => {
            const hours = slaHours(appeal.sla_deadline);
            const slaCritical = hours !== null && hours < 6;
            return (
              <div key={appeal.id} data-testid={`appeal-${appeal.id}`}
                className={`bg-white rounded-xl border p-4 ${slaCritical ? "border-red-200" : "border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-sm text-gray-800">Appeal #{appeal.id}</span>
                      <StataBadge status={appeal.status} />
                      {appeal.severity && <SevBadge severity={appeal.severity} />}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 capitalize">{appeal.content_type}</span>
                      {hours !== null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slaCritical ? "bg-red-100 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                          SLA: {hours > 0 ? `${hours}h remaining` : "OVERDUE"}
                        </span>
                      )}
                    </div>
                    {appeal.content_preview && (
                      <p className="text-xs text-gray-500 mb-2 truncate">Original content: {appeal.content_preview}</p>
                    )}
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                      <p className="text-xs font-semibold text-blue-700 mb-1">User's Appeal Reason</p>
                      <p className="text-sm text-blue-800">{appeal.reason}</p>
                    </div>
                    {appeal.ai_explanation && (
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <p className="text-xs font-semibold text-purple-700 mb-1">🤖 AI Analysis &amp; Recommendation</p>
                        <p className="text-sm text-purple-800">{appeal.ai_explanation}</p>
                      </div>
                    )}
                    {appeal.resolution_note && (
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg mt-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Resolution</p>
                        <p className="text-sm text-gray-700">{appeal.resolution_note}</p>
                        <p className="text-xs text-gray-400 mt-1">Resolved: {fmtDateTime(appeal.resolved_at)}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                      <span>By: <strong>{appeal.user_id}</strong></span>
                      <span>Filed: {fmtDate(appeal.created_at)}</span>
                      {appeal.assigned_reviewer_id && <span>Assigned: ✓</span>}
                    </div>
                  </div>
                  {(appeal.status === "pending" || appeal.status === "under_review") && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {appeal.status === "pending" && (
                        <button data-testid={`btn-assign-appeal-${appeal.id}`} onClick={() => assign(appeal)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                          Assign to Me
                        </button>
                      )}
                      <button data-testid={`btn-resolve-appeal-${appeal.id}`}
                        onClick={() => { setSelected(appeal); setResolution("upheld"); setResolutionNote(""); }}
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

      {/* Resolve Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Resolve Appeal #{selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 mb-1">Appeal Reason</p>
                <p className="text-sm text-gray-700">{selected.reason}</p>
              </div>
              {selected.ai_explanation && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-semibold text-purple-600 mb-1">AI Recommendation</p>
                  <p className="text-sm text-purple-800">{selected.ai_explanation}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resolution Decision</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setResolution("upheld")} data-testid="btn-resolution-upheld"
                    className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${resolution === "upheld" ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    Uphold Block
                    <p className="font-normal text-[10px] mt-0.5">Content stays removed</p>
                  </button>
                  <button onClick={() => setResolution("overturned")} data-testid="btn-resolution-overturned"
                    className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${resolution === "overturned" ? "border-green-400 bg-green-50 text-green-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    Overturn — Approve
                    <p className="font-normal text-[10px] mt-0.5">Content reinstated</p>
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resolution Note (sent to user)</p>
                <Textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
                  placeholder="Explain your decision with transparency..." rows={3} />
              </div>
              <DialogFooter>
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-resolve" onClick={resolve} disabled={resolving}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: resolution === "overturned" ? G : "#ef4444" }}>
                  {resolving ? "Resolving..." : `Confirm — ${resolution === "upheld" ? "Uphold Block" : "Reinstate Content"}`}
                </button>
              </DialogFooter>
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

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#1DBF73] border-t-transparent rounded-full" />
    </div>
  );

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || QueueTab;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => navigate("/admin")} data-testid="btn-back-admin"
              className="text-sm text-gray-500 hover:text-gray-700 mr-2">← Admin</button>
            <span className="text-lg font-black text-gray-800">🛡️ Content Moderation</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>SAFETY GUARDIAN</span>
            {stats && stats.pending > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                {stats.pending} pending
              </span>
            )}
            {stats && stats.critical > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                🚨 {stats.critical} critical
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-6 space-y-5">
        {/* ─── Stats Row ────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Total Items", value: stats.total, color: "bg-white border-gray-100", textColor: "#374151" },
              { label: "Pending", value: stats.pending, color: "bg-indigo-50 border-indigo-100", textColor: "#4f46e5" },
              { label: "Quarantined", value: stats.quarantined, color: "bg-orange-50 border-orange-100", textColor: "#ea580c" },
              { label: "Rejected", value: stats.rejected, color: "bg-red-50 border-red-100", textColor: "#dc2626" },
              { label: "Approved", value: stats.approved, color: "bg-green-50 border-green-100", textColor: "#16a34a" },
              { label: "Critical", value: stats.critical, color: "bg-red-50 border-red-200", textColor: "#dc2626" },
              { label: "Open Appeals", value: stats.pendingAppeals, color: "bg-purple-50 border-purple-100", textColor: "#7c3aed" },
            ].map(({ label, value, color, textColor }) => (
              <div key={label} data-testid={`stat-mod-${label.toLowerCase().replace(/\s/g, "-")}`}
                className={`rounded-xl p-3.5 border ${color} flex flex-col gap-1`}>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-2xl font-black" style={{ color: textColor }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── Tab Bar ──────────────────────────────────────────────────── */}
        <div className="flex gap-1 flex-wrap bg-white border border-gray-100 rounded-xl p-1.5">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              style={activeTab === tab.id ? { background: "#ef4444" } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Active Tab Content ────────────────────────────────────────── */}
        <ActiveComponent />
      </div>
    </div>
  );
}

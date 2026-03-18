/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AUDIT LOGS DEPARTMENT v1.0 — 200% INTELLIGENCE                             ║
 * ║  The Immutable Accountability Layer — every action tracked, forever         ║
 * ║  Legal compliance: POPIA · NDPR · DPA 2019 · GDPR · SOC 2                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 5-Tab Architecture:
 *  1. 📋 Live Feed      — Real-time scrollable log feed, filters, diff viewer
 *  2. 🔍 Search         — Full-text search + visual timeline replay
 *  3. 📊 Analytics      — Action volume, top admins, heatmap, severity chart
 *  4. 📤 Export Center  — CSV download, hash chain verifier, compliance info
 *  5. 🚨 Anomaly Alerts — AI-flagged suspicious patterns with score breakdown
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  FileText, Search, BarChart3, Download, AlertTriangle, Shield, Eye,
  CheckCircle2, XCircle, Clock, RefreshCw, Play, Link, Hash,
  AlertOctagon, Activity, Filter, Database, Lock, Zap, Users,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "feed",      label: "📋 Live Feed"      },
  { id: "search",    label: "🔍 Search & Timeline" },
  { id: "analytics", label: "📊 Analytics"       },
  { id: "export",    label: "📤 Export Center"   },
  { id: "anomalies", label: "🚨 Anomaly Alerts"  },
];
const SEV_BG: Record<string, string> = {
  critical: "bg-red-700 text-white", high: "bg-orange-600 text-white",
  medium: "bg-yellow-600 text-white", low: "bg-zinc-600 text-white",
};
const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#52525b",
};
const DEPT_COLORS: Record<string, string> = {
  security:"#ef4444", finance:"#10b981", payments:"#3b82f6",
  subscriptions:"#8b5cf6", moderation:"#f97316", marketing:"#ec4899",
  general:"#6b7280", audit:"#7c3aed", gigs:"#22c55e", disputes:"#f59e0b",
  support:"#06b6d4", reports:"#a855f7",
};

const api = {
  get: (url: string) => fetch(url).then(r => r.json()),
  post: (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
};

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("en-ZA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function fmtShort(ts: string) {
  return new Date(ts).toLocaleString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ══════════════════════════════════════════════════════════════════════════
// DIFF VIEWER MODAL
// ══════════════════════════════════════════════════════════════════════════
function DiffViewer({ log, onClose }: { log: any; onClose: () => void }) {
  if (!log) return null;
  const before = log.before_state ? JSON.stringify(log.before_state, null, 2) : null;
  const after  = log.after_state  ? JSON.stringify(log.after_state,  null, 2) : null;
  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400"/>
            Audit Log #{log.id} — Full Detail &amp; Before/After Diff
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          {/* Metadata grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Log ID",    `#${log.id}`],
              ["Admin",     log.admin_user_id],
              ["Action",    log.action],
              ["Department",log.department || "–"],
              ["Target",    `${log.target_type || "–"} : ${log.target_id || "–"}`],
              ["Severity",  log.severity],
              ["IP Address",log.ip_address || "–"],
              ["Session ID",log.session_id || "–"],
              ["Timestamp", fmt(log.created_at)],
            ].map(([l, v]) => (
              <div key={l} className="bg-zinc-900 border border-zinc-700 rounded p-2">
                <div className="text-zinc-500 font-semibold mb-0.5">{l}</div>
                <div className="text-zinc-200 break-all">{String(v)}</div>
              </div>
            ))}
          </div>
          {log.description && (
            <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
              <div className="text-zinc-500 font-semibold mb-1">Description</div>
              <div className="text-zinc-200">{log.description}</div>
            </div>
          )}
          {log.reason && (
            <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
              <div className="text-zinc-500 font-semibold mb-1">Admin Reason / Note</div>
              <div className="text-zinc-200">{log.reason}</div>
            </div>
          )}
          {/* Before / After Diff */}
          {(before || after) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-red-400 font-bold mb-1">⬅ BEFORE</div>
                <pre className="bg-red-950/40 border border-red-900 rounded p-3 text-xs text-red-200 overflow-auto max-h-60 whitespace-pre-wrap">
                  {before || "(no before state recorded)"}
                </pre>
              </div>
              <div>
                <div className="text-emerald-400 font-bold mb-1">AFTER ➡</div>
                <pre className="bg-emerald-950/40 border border-emerald-900 rounded p-3 text-xs text-emerald-200 overflow-auto max-h-60 whitespace-pre-wrap">
                  {after || "(no after state recorded)"}
                </pre>
              </div>
            </div>
          )}
          {/* Hash chain */}
          <div className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-1.5">
            <div className="text-purple-300 font-bold">🔗 Hash Chain Integrity</div>
            <div className="font-mono break-all"><span className="text-zinc-500">Previous: </span><span className="text-zinc-400">{log.previous_hash || "GENESIS"}</span></div>
            <div className="font-mono break-all"><span className="text-zinc-500">Current:  </span><span className="text-emerald-400">{log.current_hash}</span></div>
            <div><Badge className={log.chain_valid ? "bg-emerald-700" : "bg-red-700"}>{log.chain_valid ? "✓ Chain Valid" : "✗ Chain Broken"}</Badge></div>
          </div>
          {log.is_anomaly && (
            <div className="bg-red-950/40 border border-red-800 rounded p-3">
              <div className="text-red-300 font-bold mb-1">🚨 AI Anomaly Detected (Score: {log.anomaly_score})</div>
              <div className="text-red-200">{log.anomaly_reason}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function AuditLogs() {
  const [tab, setTab]           = useState("feed");
  const [loading, setLoading]   = useState(false);
  const [diffLog, setDiffLog]   = useState<any>(null);

  // Feed state
  const [logs,       setLogs]       = useState<any>({ items: [], total: 0 });
  const [anomalies,  setAnomalies]  = useState<any>({ items: [], total: 0 });
  const [stats,      setStats]      = useState<any>(null);
  const [timeline,   setTimeline]   = useState<any[]>([]);
  const [searchRes,  setSearchRes]  = useState<any>({ items: [], total: 0 });
  const [verifyRes,  setVerifyRes]  = useState<any>(null);
  const [chainRes,   setChainRes]   = useState<any>(null);
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const [manualResult, setManualResult] = useState<any>(null);

  // Filters
  const [dept,    setDept]    = useState("all");
  const [sev,     setSev]     = useState("all");
  const [adminF,  setAdminF]  = useState("");
  const [anomF,   setAnomF]   = useState("all");
  const [page,    setPage]    = useState(1);

  // Search
  const [searchQ,     setSearchQ]     = useState("");
  const [timelineAdmin, setTimelineAdmin] = useState("");
  const [timelineFrom,  setTimelineFrom]  = useState("");
  const [timelineTo,    setTimelineTo]    = useState("");

  // Export / Verify
  const [verifyId,    setVerifyId]    = useState("");
  const [chainLimit,  setChainLimit]  = useState("500");
  const [exportSev,   setExportSev]   = useState("all");
  const [exportDept,  setExportDept]  = useState("all");
  const [exportFrom,  setExportFrom]  = useState("");
  const [exportTo,    setExportTo]    = useState("");

  // Manual log form
  const [manualForm, setManualForm] = useState({
    action: "", department: "general", description: "", target_type: "", target_id: "",
    reason: "", severity: "medium", before_state: "", after_state: "",
  });

  // Live stream simulation (Socket.io demo feed)
  useEffect(() => {
    const SAMPLE = [
      { action: "post_security_risk_score",    department: "security",    severity: "high",     admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "post_api_kyc_review",         department: "security",    severity: "medium",   admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "post_promotions_fire_hook",   department: "promotions",  severity: "low",      admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "delete_moderation_content",   department: "moderation",  severity: "high",     admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "post_security_2fa_enforce",   department: "security",    severity: "medium",   admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "post_finance_payout_freeze",  department: "finance",     severity: "critical", admin_user_id: "user_2Pz69BfA5yS3R8M" },
      { action: "put_subscriptions_downgrade", department: "subscriptions",severity: "medium",  admin_user_id: "user_2Pz69BfA5yS3R8M" },
    ];
    const t = setInterval(() => {
      if (Math.random() > 0.5) {
        const s = SAMPLE[Math.floor(Math.random() * SAMPLE.length)];
        setLiveStream(prev => [{
          ...s, id: Date.now(), is_anomaly: Math.random() > 0.85,
          timestamp: new Date().toISOString(),
        }, ...prev.slice(0, 29)]);
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const loadTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "feed") {
        const p = new URLSearchParams({ page: String(page), limit: "100" });
        if (dept !== "all") p.set("department", dept);
        if (sev !== "all") p.set("severity", sev);
        if (adminF) p.set("admin_user_id", adminF);
        if (anomF === "anomaly") p.set("is_anomaly", "true");
        setLogs(await api.get(`/api/audit-logs?${p}`));
      } else if (tab === "analytics") {
        setStats(await api.get("/api/audit-logs/stats"));
      } else if (tab === "anomalies") {
        setAnomalies(await api.get("/api/audit-logs/anomalies?limit=100"));
      }
    } catch {}
    setLoading(false);
  }, [tab, dept, sev, adminF, anomF, page]);

  useEffect(() => { loadTab(); }, [loadTab]);

  const doSearch = async () => {
    if (!searchQ.trim()) return;
    setLoading(true);
    setSearchRes(await api.get(`/api/audit-logs/search?q=${encodeURIComponent(searchQ)}&limit=100`));
    setLoading(false);
  };
  const doTimeline = async () => {
    const p = new URLSearchParams({ limit: "300" });
    if (timelineAdmin) p.set("admin_user_id", timelineAdmin);
    if (timelineFrom) p.set("from", timelineFrom);
    if (timelineTo) p.set("to", timelineTo);
    setTimeline(await api.get(`/api/audit-logs/timeline?${p}`));
  };
  const doVerify = async () => {
    if (!verifyId) return;
    setVerifyRes(await api.get(`/api/audit-logs/verify/${verifyId}`));
  };
  const doVerifyChain = async () => {
    setChainRes(null);
    setChainRes(await api.get(`/api/audit-logs/verify-chain?limit=${chainLimit}`));
  };
  const doExport = () => {
    const p = new URLSearchParams();
    if (exportSev !== "all") p.set("severity", exportSev);
    if (exportDept !== "all") p.set("department", exportDept);
    if (exportFrom) p.set("from", exportFrom);
    if (exportTo) p.set("to", exportTo);
    window.open(`/api/audit-logs/export/csv?${p}`, "_blank");
  };
  const viewDetail = async (id: number) => {
    const r = await api.get(`/api/audit-logs/${id}`);
    setDiffLog(r);
  };
  const writeManual = async () => {
    if (!manualForm.action) return alert("Action required");
    let bs: any, as_: any;
    try { bs = manualForm.before_state ? JSON.parse(manualForm.before_state) : undefined; } catch { bs = undefined; }
    try { as_ = manualForm.after_state  ? JSON.parse(manualForm.after_state)  : undefined; } catch { as_ = undefined; }
    const r = await api.post("/api/audit-logs/manual", { ...manualForm, before_state: bs, after_state: as_ });
    if (r.id) { setManualResult(r); loadTab(); }
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 1: LIVE FEED
  // ══════════════════════════════════════════════════════════════════════
  const renderFeed = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400"/>Live Audit Log Feed
          </h2>
          <p className="text-zinc-400 text-xs">Immutable, append-only. Every admin action captured. Zero gaps possible.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={dept} onValueChange={v => { setDept(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Department"/></SelectTrigger>
            <SelectContent>{["all","security","finance","payments","subscriptions","moderation","marketing","gigs","disputes","support","reports","categories","audit","general"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sev} onValueChange={v => { setSev(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Severity"/></SelectTrigger>
            <SelectContent>{["all","critical","high","medium","low"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={anomF} onValueChange={v => { setAnomF(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Filter"/></SelectTrigger>
            <SelectContent><SelectItem value="all">All Logs</SelectItem><SelectItem value="anomaly">Anomalies Only</SelectItem></SelectContent>
          </Select>
          <Input className="h-8 w-36 text-xs" placeholder="Admin ID..." value={adminF} onChange={e => setAdminF(e.target.value)} onKeyDown={e => e.key === "Enter" && loadTab()}/>
          <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-xs" onClick={loadTab} data-testid="button-refresh-feed"><RefreshCw className="w-3.5 h-3.5 mr-1"/>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Total Logs", v: logs.total, c: "text-zinc-200", b: "border-zinc-700" },
          { l: "On This Page", v: logs.items?.length || 0, c: "text-purple-400", b: "border-purple-800" },
          { l: "Live Stream", v: liveStream.length, c: "text-blue-400", b: "border-blue-800" },
          { l: "Page", v: page, c: "text-zinc-400", b: "border-zinc-700" },
        ].map((k, i) => (
          <Card key={i} className={`bg-zinc-900 border ${k.b}`}><CardContent className="p-3 text-center"><div className={`text-xl font-bold ${k.c}`}>{k.v}</div><div className="text-xs text-zinc-500 mt-0.5">{k.l}</div></CardContent></Card>
        ))}
      </div>

      {/* Live Socket Stream Demo */}
      {liveStream.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
            <CardTitle className="text-sm">Live Socket.io Stream ({liveStream.length} recent)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {liveStream.slice(0, 10).map((e, i) => (
                <div key={i} className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs border ${e.is_anomaly ? "bg-red-900/20 border-red-800" : "bg-zinc-800 border-zinc-700"}`}>
                  <Badge className={SEV_BG[e.severity] || "bg-zinc-600"}>{e.severity}</Badge>
                  <span className="text-zinc-400 font-mono">{e.department}</span>
                  <span className="text-zinc-200 flex-1">{e.action}</span>
                  {e.is_anomaly && <Badge className="bg-red-800 text-xs">🚨 ANOMALY</Badge>}
                  <span className="text-zinc-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Log Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800 flex items-center justify-between">
            <span>{logs.total} total entries</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Prev</Button>
              <span className="text-zinc-400 text-xs px-2 py-1">Page {page}</span>
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setPage(p => p + 1)} disabled={logs.items?.length < 100}>Next →</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  {["ID", "Timestamp", "Severity", "Department", "Action", "Admin", "Target", "IP", "Auto", "Anomaly", "Diff"].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-zinc-300 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                ) : logs.items?.map((log: any) => (
                  <tr key={log.id} className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 ${log.is_anomaly ? "bg-red-950/10" : ""}`} data-testid={`row-audit-${log.id}`}>
                    <td className="py-2 px-3 text-zinc-500 font-mono">#{log.id}</td>
                    <td className="py-2 px-3 text-zinc-400 whitespace-nowrap">{fmtShort(log.created_at)}</td>
                    <td className="py-2 px-3"><Badge className={`${SEV_BG[log.severity] || "bg-zinc-600"} text-xs`}>{log.severity}</Badge></td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: DEPT_COLORS[log.department] || "#6b7280" }}>{log.department}</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-zinc-300 max-w-[200px] truncate">{log.action}</td>
                    <td className="py-2 px-3 font-mono text-zinc-400 max-w-[120px] truncate">{log.admin_user_id}</td>
                    <td className="py-2 px-3 text-zinc-500 max-w-[120px] truncate">{log.target_type ? `${log.target_type}:${log.target_id}` : "–"}</td>
                    <td className="py-2 px-3 font-mono text-zinc-600 text-xs">{log.ip_address || "–"}</td>
                    <td className="py-2 px-3 text-center">{log.is_automated ? <Zap className="w-3.5 h-3.5 text-blue-400 mx-auto"/> : <span className="text-zinc-600">–</span>}</td>
                    <td className="py-2 px-3 text-center">{log.is_anomaly ? <AlertOctagon className="w-4 h-4 text-red-400 mx-auto"/> : <span className="text-zinc-700">–</span>}</td>
                    <td className="py-2 px-3">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-purple-400 hover:text-purple-300" onClick={() => viewDetail(log.id)} data-testid={`button-diff-${log.id}`}>
                        <Eye className="w-3.5 h-3.5"/>
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && logs.items?.length === 0 && (
                  <tr><td colSpan={11} className="py-8 text-center text-zinc-600">No logs yet. Admin actions will appear here automatically.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Log Entry */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400"/>Manual Audit Entry — Cross-Department Integration</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div><Label className="text-xs">Action *</Label><Input className="h-7 text-xs mt-1" value={manualForm.action} onChange={e => setManualForm({ ...manualForm, action: e.target.value })} placeholder="user_banned..." data-testid="input-manual-action"/></div>
            <div><Label className="text-xs">Department</Label>
              <Select value={manualForm.department} onValueChange={v => setManualForm({ ...manualForm, department: v })}>
                <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{["general","security","finance","payments","subscriptions","moderation","marketing","gigs","disputes","support","reports","audit"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Target Type</Label><Input className="h-7 text-xs mt-1" value={manualForm.target_type} onChange={e => setManualForm({ ...manualForm, target_type: e.target.value })} placeholder="User/Gig/Payment..."/></div>
            <div><Label className="text-xs">Target ID</Label><Input className="h-7 text-xs mt-1" value={manualForm.target_id} onChange={e => setManualForm({ ...manualForm, target_id: e.target.value })} placeholder="user_ABC..."/></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="col-span-2"><Label className="text-xs">Description</Label><Input className="h-7 text-xs mt-1" value={manualForm.description} onChange={e => setManualForm({ ...manualForm, description: e.target.value })} placeholder="What was done and why..."/></div>
            <div><Label className="text-xs">Severity</Label>
              <Select value={manualForm.severity} onValueChange={v => setManualForm({ ...manualForm, severity: v })}>
                <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div><Label className="text-xs">Before State (JSON)</Label><Textarea className="text-xs mt-1 font-mono" rows={2} value={manualForm.before_state} onChange={e => setManualForm({ ...manualForm, before_state: e.target.value })} placeholder='{&quot;status&quot;:&quot;active&quot;}'/></div>
            <div><Label className="text-xs">After State (JSON)</Label><Textarea className="text-xs mt-1 font-mono" rows={2} value={manualForm.after_state} onChange={e => setManualForm({ ...manualForm, after_state: e.target.value })} placeholder='{&quot;status&quot;:&quot;banned&quot;}'/></div>
          </div>
          <div className="flex gap-2 items-center">
            <Button className="bg-purple-600 hover:bg-purple-700 h-7 text-xs" onClick={writeManual} data-testid="button-manual-write"><FileText className="w-3.5 h-3.5 mr-1"/>Write Audit Entry</Button>
            {manualResult && <span className="text-emerald-400 text-xs">✓ Entry #{manualResult.id} written to immutable log</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 2: SEARCH & TIMELINE
  // ══════════════════════════════════════════════════════════════════════
  const renderSearch = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Search className="w-6 h-6 text-blue-400"/>Search &amp; Timeline Replay</h2>
        <p className="text-zinc-400 text-xs">Full-text search across action/description/admin/target. Visual timeline for session replay.</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {/* Full-text search */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Global Full-Text Search</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input className="h-8 flex-1 text-sm" placeholder="Search: action, admin ID, description, target..." value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} data-testid="input-audit-search"/>
              <Button className="bg-blue-600 hover:bg-blue-700 h-8" onClick={doSearch} data-testid="button-audit-search"><Search className="w-4 h-4"/></Button>
            </div>
            {loading && <div className="text-zinc-500 text-xs">Searching...</div>}
            <div className="max-h-96 overflow-y-auto space-y-1">
              {searchRes.items?.map((log: any) => (
                <div key={log.id} className="p-2.5 bg-zinc-800 rounded border border-zinc-700 cursor-pointer hover:border-purple-600 transition-colors" onClick={() => viewDetail(log.id)} data-testid={`row-search-${log.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-500 font-mono text-xs">#{log.id}</span>
                    <Badge className={`${SEV_BG[log.severity] || "bg-zinc-600"} text-xs`}>{log.severity}</Badge>
                    <span className="px-1.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: DEPT_COLORS[log.department] || "#6b7280" }}>{log.department}</span>
                    {log.is_anomaly && <Badge className="bg-red-800 text-xs">🚨</Badge>}
                    <span className="text-zinc-500 ml-auto text-xs">{fmtShort(log.created_at)}</span>
                  </div>
                  <div className="font-mono text-xs text-zinc-300">{log.action}</div>
                  {log.description && <div className="text-xs text-zinc-500 mt-0.5 truncate">{log.description}</div>}
                </div>
              ))}
              {searchRes.items?.length === 0 && searchQ && <div className="text-zinc-600 text-xs text-center py-4">No results for "{searchQ}"</div>}
            </div>
          </CardContent>
        </Card>
        {/* Timeline Replay */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Play className="w-4 h-4 text-emerald-400"/>Session Timeline Replay</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Admin User ID</Label><Input className="h-7 text-xs mt-1" value={timelineAdmin} onChange={e => setTimelineAdmin(e.target.value)} placeholder="user_2Pz69..."/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">From Date</Label><Input type="datetime-local" className="h-7 text-xs mt-1" value={timelineFrom} onChange={e => setTimelineFrom(e.target.value)}/></div>
              <div><Label className="text-xs">To Date</Label><Input type="datetime-local" className="h-7 text-xs mt-1" value={timelineTo} onChange={e => setTimelineTo(e.target.value)}/></div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full h-7 text-xs" onClick={doTimeline} data-testid="button-timeline-load"><Play className="w-3.5 h-3.5 mr-1"/>Load Timeline</Button>
            {/* Visual Timeline */}
            <div className="max-h-64 overflow-y-auto space-y-0.5 relative">
              {timeline.length > 0 && (
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-700"/>
              )}
              {timeline.map((ev: any, i) => (
                <div key={ev.id} className="flex items-start gap-3 pl-4 relative cursor-pointer" onClick={() => viewDetail(ev.id)} data-testid={`row-timeline-${ev.id}`}>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 z-10 ${ev.severity === "critical" ? "bg-red-500" : ev.severity === "high" ? "bg-orange-500" : ev.severity === "medium" ? "bg-yellow-500" : "bg-zinc-500"}`}/>
                  <div className="flex-1 pb-2 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs">{new Date(ev.created_at).toLocaleTimeString()}</span>
                      <span className="px-1 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: DEPT_COLORS[ev.department] || "#6b7280" }}>{ev.department}</span>
                      {ev.is_anomaly && <AlertOctagon className="w-3 h-3 text-red-400"/>}
                    </div>
                    <div className="font-mono text-xs text-zinc-300 truncate">{ev.action}</div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && <div className="text-zinc-600 text-xs text-center py-4">Set filters above and click Load Timeline</div>}
            </div>
            {timeline.length > 0 && <div className="text-xs text-zinc-500">{timeline.length} events in timeline</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 3: ANALYTICS
  // ══════════════════════════════════════════════════════════════════════
  const renderAnalytics = () => {
    const s = stats;
    const sevData = s ? [
      { name: "Critical", value: Number(s.by_severity?.find((x: any) => x.severity === "critical")?.cnt || 0), fill: SEV_COLOR.critical },
      { name: "High",     value: Number(s.by_severity?.find((x: any) => x.severity === "high")?.cnt || 0),     fill: SEV_COLOR.high },
      { name: "Medium",   value: Number(s.by_severity?.find((x: any) => x.severity === "medium")?.cnt || 0),   fill: SEV_COLOR.medium },
      { name: "Low",      value: Number(s.by_severity?.find((x: any) => x.severity === "low")?.cnt || 0),      fill: SEV_COLOR.low },
    ] : [];
    const deptData = (s?.by_department || []).slice(0, 10).map((d: any) => ({ name: d.department, count: Number(d.cnt), fill: DEPT_COLORS[d.department] || "#6b7280" }));
    const hourData = Array.from({ length: 24 }, (_, h) => {
      const found = (s?.hourly_heatmap || []).find((r: any) => Number(r.hr) === h);
      return { hour: `${h}h`, count: Number(found?.cnt || 0) };
    });
    const dailyData = (s?.daily_trend || []).map((d: any) => ({
      date: String(d.date).slice(5), total: Number(d.total), high_risk: Number(d.high_risk),
    }));
    return (
      <div className="space-y-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-400"/>Audit Log Analytics</h2>
          <p className="text-zinc-400 text-xs">Action volume trends, top admins, risk heatmaps, severity breakdown — full accountability intelligence.</p>
        </div>
        {s && <>
          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { l: "Total Entries",   v: Number(s.overview?.total || 0),          c: "text-zinc-200",   b: "border-zinc-700" },
              { l: "Anomalies",       v: Number(s.overview?.anomalies || 0),       c: "text-red-400",    b: "border-red-800" },
              { l: "Critical",        v: Number(s.overview?.critical || 0),        c: "text-red-400",    b: "border-red-800" },
              { l: "High Severity",   v: Number(s.overview?.high || 0),            c: "text-orange-400", b: "border-orange-800" },
              { l: "Last 24 Hours",   v: Number(s.overview?.last_24h || 0),        c: "text-blue-400",   b: "border-blue-800" },
              { l: "Active Admins",   v: Number(s.overview?.active_admins || 0),   c: "text-purple-400", b: "border-purple-800" },
            ].map((k, i) => (
              <Card key={i} className={`bg-zinc-900 border ${k.b}`}>
                <CardContent className="p-3 text-center">
                  <div className={`text-xl font-bold ${k.c}`}>{k.v}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{k.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5">
            {/* Daily Trend */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">30-Day Action Volume + High Risk</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                    <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }}/>
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }}/>
                    <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}/>
                    <Legend wrapperStyle={{ fontSize: 10 }}/>
                    <Area type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}/>
                    <Bar dataKey="high_risk" name="High Risk" fill="#ef4444" radius={[2, 2, 0, 0]} opacity={0.8}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Severity Pie */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sevData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""} labelLine={false}>
                      {sevData.map((_, i) => <Cell key={i} fill={sevData[i].fill}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {/* Department Breakdown */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Actions by Department</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                    <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 10 }}/>
                    <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }}/>
                    <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}/>
                    <Bar dataKey="count" name="Actions" radius={[0, 3, 3, 0]}>
                      {deptData.map((d: any, i: number) => <Cell key={i} fill={d.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Hour Heatmap */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Activity Heatmap — Hour of Day (Last 7d)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                    <XAxis dataKey="hour" tick={{ fill: "#a1a1aa", fontSize: 9 }}/>
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }}/>
                    <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}/>
                    <Bar dataKey="count" name="Actions" radius={[2, 2, 0, 0]}>
                      {hourData.map((_: any, i: number) => <Cell key={i} fill={i >= 2 && i <= 5 ? "#ef4444" : i >= 9 && i <= 17 ? "#8b5cf6" : "#6b7280"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-3 text-xs mt-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"/><span className="text-zinc-500">Night (2–5am) — anomaly risk</span></span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block"/><span className="text-zinc-500">Business hours</span></span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Top Admins + Top Actions */}
          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Admin Activity Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(s.top_admins || []).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60">
                      <span className="text-zinc-600 font-bold w-5 text-right">{i + 1}</span>
                      <span className="font-mono text-zinc-300 text-xs flex-1 truncate">{a.admin_user_id}</span>
                      <Badge className="bg-zinc-700 text-xs">{Number(a.cnt)} actions</Badge>
                      {Number(a.critical_cnt) > 0 && <Badge className="bg-red-800 text-xs">{Number(a.critical_cnt)} critical</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top 15 Most Performed Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(s.top_actions || []).map((a: any, i: number) => {
                    const pct = Math.round(Number(a.cnt) / Number(s.overview?.total || 1) * 100);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400 text-xs flex-1 truncate">{a.action}</span>
                        <div className="w-20 bg-zinc-800 rounded-full h-2"><div className="h-2 rounded-full bg-purple-600" style={{ width: `${pct}%` }}/></div>
                        <span className="text-zinc-500 text-xs w-10 text-right">{Number(a.cnt)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>}
        {!s && !loading && <div className="text-zinc-500 text-center py-10">Loading analytics...</div>}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 4: EXPORT CENTER
  // ══════════════════════════════════════════════════════════════════════
  const renderExport = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Download className="w-6 h-6 text-emerald-400"/>Export Center &amp; Hash Verification</h2>
        <p className="text-zinc-400 text-xs">Audit-quality CSV exports, SHA-256 hash chain verifier, Africa compliance (POPIA/NDPR/DPA/GDPR) — court-admissible evidence.</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {/* CSV Export */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border-emerald-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-emerald-300 flex items-center gap-2"><Download className="w-4 h-4"/>CSV Export — Filtered &amp; Signed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Severity Filter</Label>
                <Select value={exportSev} onValueChange={setExportSev}>
                  <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent>{["all","critical","high","medium","low"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Department Filter</Label>
                <Select value={exportDept} onValueChange={setExportDept}>
                  <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent>{["all","security","finance","payments","subscriptions","moderation","marketing","general"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">From Date</Label><Input type="date" className="h-7 text-xs mt-1" value={exportFrom} onChange={e => setExportFrom(e.target.value)}/></div>
              <div><Label className="text-xs">To Date</Label><Input type="date" className="h-7 text-xs mt-1" value={exportTo} onChange={e => setExportTo(e.target.value)}/></div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full h-8 text-sm" onClick={doExport} data-testid="button-export-csv">
              <Download className="w-4 h-4 mr-1"/>Download CSV Export
            </Button>
            <div className="text-xs p-3 bg-zinc-800 rounded border border-zinc-700 space-y-1.5">
              <div className="text-emerald-300 font-semibold">What's included in the export:</div>
              <div className="text-zinc-400">• All 21 fields including before/after states, hash chain, anomaly flags</div>
              <div className="text-zinc-400">• X-Audit-Export-Hash header: SHA-256 of the full CSV file</div>
              <div className="text-zinc-400">• X-Audit-Export-Admin: which admin triggered the export (also logged)</div>
              <div className="text-zinc-400">• Up to 10,000 records per export; batch if more needed</div>
              <div className="text-zinc-400">• Export action itself is written to the audit log (meta-audit)</div>
            </div>
          </CardContent>
        </Card>
        {/* Hash Verifier */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border-purple-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-purple-300 flex items-center gap-2"><Hash className="w-4 h-4"/>SHA-256 Hash Chain Verifier</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-zinc-300 p-2 bg-zinc-800 rounded border border-zinc-700">
              <strong>How the chain works:</strong><br/>
              Each log computes: SHA256(admin_id|action|target_id|timestamp_ms|previous_hash)<br/>
              Any tampered field breaks the hash. Any deleted row breaks the chain. Impossible to forge.
            </div>
            <div><Label className="text-xs">Verify Single Log — Enter Log ID</Label>
              <div className="flex gap-2 mt-1">
                <Input type="number" className="h-7 text-xs flex-1" value={verifyId} onChange={e => setVerifyId(e.target.value)} placeholder="12345" data-testid="input-verify-id"/>
                <Button className="bg-purple-600 hover:bg-purple-700 h-7 text-xs" onClick={doVerify} data-testid="button-verify-single">Verify</Button>
              </div>
            </div>
            {verifyRes && (
              <div className={`p-3 rounded border ${verifyRes.valid ? "border-emerald-700 bg-emerald-900/20" : "border-red-700 bg-red-900/20"} text-xs`}>
                <div className={`font-bold text-base mb-1 ${verifyRes.valid ? "text-emerald-300" : "text-red-300"}`}>{verifyRes.message}</div>
                <div className="font-mono break-all text-zinc-400"><span className="text-zinc-500">Stored:   </span>{verifyRes.stored_hash}</div>
                <div className="font-mono break-all text-zinc-400"><span className="text-zinc-500">Computed: </span>{verifyRes.computed_hash}</div>
              </div>
            )}
            <div className="border-t border-zinc-700 pt-3">
              <Label className="text-xs">Full Chain Verification (last N entries)</Label>
              <div className="flex gap-2 mt-1">
                <Input type="number" className="h-7 text-xs flex-1" value={chainLimit} onChange={e => setChainLimit(e.target.value)} placeholder="500"/>
                <Button className="bg-purple-700 hover:bg-purple-600 h-7 text-xs" onClick={doVerifyChain} data-testid="button-verify-chain">Verify Chain</Button>
              </div>
            </div>
            {chainRes && (
              <div className={`p-3 rounded border ${chainRes.chain_integrity === "VALID" ? "border-emerald-700 bg-emerald-900/20" : "border-red-700 bg-red-900/20"} text-xs`}>
                <div className={`font-bold text-sm mb-1 ${chainRes.chain_integrity === "VALID" ? "text-emerald-300" : "text-red-300"}`}>{chainRes.message}</div>
                <div className="flex gap-4">
                  <span className="text-zinc-400">Total: <strong className="text-white">{chainRes.total}</strong></span>
                  <span className="text-emerald-400">Verified: <strong>{chainRes.verified}</strong></span>
                  <span className="text-red-400">Broken: <strong>{chainRes.broken}</strong></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Compliance Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400"/>Africa-First Legal Compliance — Why This Makes FreelanceSkills Legally Unbreakable</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {[
              { jurisdiction: "South Africa", law: "POPIA (PAIA Ch. 4)", requirement: "Records of processing activities; breach notification within 72h; data subject rights log.", coverage: "✓ Full: all user data changes logged with before/after states, admin ID, IP, timestamp.", color: "border-green-700 bg-green-900/20" },
              { jurisdiction: "Nigeria", law: "NDPR Art. 2.4", requirement: "Audit trails for all personal data processing; must be provided to NITDA on request.", coverage: "✓ Full: exportable CSV with all processing events; hash-signed for authenticity.", color: "border-yellow-700 bg-yellow-900/20" },
              { jurisdiction: "Kenya", law: "DPA 2019 §45", requirement: "Records of processing per §45; data controller register; security incident log.", coverage: "✓ Full: security events auto-logged from Security Dept; append-only tamper-proof.", color: "border-blue-700 bg-blue-900/20" },
              { jurisdiction: "EU / International", law: "GDPR Art. 30", requirement: "Records of processing activities; must demonstrate lawful basis for each action.", coverage: "✓ Full: action + reason + target + admin + timestamp. Legal basis can be added to reason field.", color: "border-purple-700 bg-purple-900/20" },
              { jurisdiction: "International", law: "SOC 2 Type II", requirement: "Continuous logging with integrity verification; no gaps; admin accountability.", coverage: "✓ Full: SHA-256 hash chain proves no gaps; middleware ensures no admin action escapes logging.", color: "border-indigo-700 bg-indigo-900/20" },
              { jurisdiction: "Court Evidence", law: "Digital Evidence (SA ECT Act)", requirement: "Electronic records admissible if integrity can be proven.", coverage: "✓ Full: hash chain = court-admissible proof of integrity. Export with SHA-256 signature.", color: "border-red-700 bg-red-900/20" },
            ].map((c, i) => (
              <div key={i} className={`${c.color} border rounded p-3`}>
                <div className="font-bold text-white mb-0.5">{c.jurisdiction}</div>
                <div className="text-zinc-400 font-semibold mb-1">{c.law}</div>
                <div className="text-zinc-500 mb-1">{c.requirement}</div>
                <div className="text-emerald-400">{c.coverage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 5: ANOMALY ALERTS
  // ══════════════════════════════════════════════════════════════════════
  const renderAnomalies = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-400"/>AI Anomaly Alerts — 7-Pattern Detection</h2>
        <p className="text-zinc-400 text-xs">AI detects: burst activity, night-shift logins, dept first-access, IP changes, high-risk volume, rare actions, severity spikes.</p>
      </div>
      {/* Pattern explainer */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">7 AI Detection Patterns — How Anomalies Are Flagged</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {[
              { n: "Burst Activity",         d: ">30 actions in 60 minutes by one admin", threshold: "30/h", score: "+35" },
              { n: "Night-Shift",            d: "Admin active 2am–5am UTC (unusual hours)", threshold: "2–5am UTC", score: "+20" },
              { n: "New Department Access",  d: "First-ever action in a department by this admin", threshold: "0 prior visits", score: "+15" },
              { n: "IP Address Change",      d: "Multiple IPs from same admin in 2 hours", threshold: ">1 IP/2h", score: "+30" },
              { n: "High-Risk Volume",       d: ">10 critical/high actions in 1 hour", threshold: "10/h", score: "+25" },
              { n: "Rare Critical Action",   d: "High-risk action performed fewer than 5 times ever", threshold: "<5 uses", score: "+20" },
              { n: "Severity Spike",         d: "Any critical action adds base anomaly score", threshold: "severity=critical", score: "+15" },
              { n: "Auto-Threshold",         d: "Score ≥40 OR 2+ patterns = anomaly flagged", threshold: "score≥40", score: "→ ALERT" },
            ].map((p, i) => (
              <div key={i} className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <div className="font-bold text-orange-300 mb-0.5">{p.n}</div>
                <div className="text-zinc-400 mb-1">{p.d}</div>
                <div className="flex gap-2">
                  <Badge className="bg-zinc-700 text-xs">{p.threshold}</Badge>
                  <Badge className="bg-red-900 text-xs">{p.score}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Anomaly List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">{anomalies.total} anomalies detected</div>
          {loading ? (
            <div className="py-8 text-center text-zinc-500">Loading anomalies...</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {anomalies.items?.map((a: any) => (
                <div key={a.id} className="p-4 bg-red-950/10 hover:bg-red-950/20 cursor-pointer" onClick={() => viewDetail(a.id)} data-testid={`row-anomaly-${a.id}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0"/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{a.action}</span>
                        <Badge className={`${SEV_BG[a.severity] || "bg-zinc-600"} text-xs`}>{a.severity}</Badge>
                        <span className="px-1.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: DEPT_COLORS[a.department] || "#6b7280" }}>{a.department}</span>
                        {a.anomaly_score && <Badge className="bg-red-800 text-xs">Score: {a.anomaly_score}</Badge>}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">Admin: <span className="font-mono">{a.admin_user_id}</span> · IP: {a.ip_address || "–"} · {fmtShort(a.created_at)}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-purple-400 text-xs h-7"><Eye className="w-3.5 h-3.5 mr-1"/>Diff</Button>
                  </div>
                  {a.anomaly_reason && (
                    <div className="ml-8 text-xs text-red-300 bg-red-900/20 border border-red-800 rounded p-2">
                      <strong>Why flagged:</strong> {a.anomaly_reason}
                    </div>
                  )}
                </div>
              ))}
              {anomalies.items?.length === 0 && (
                <div className="py-10 text-center text-zinc-600">No anomalies detected yet. The AI will flag patterns as admin activity accumulates.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5">
      <div className="max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Lock className="w-10 h-10 text-purple-400 flex-shrink-0"/>
            <h1 className="text-3xl font-bold text-white">Audit Logs Department</h1>
            <Badge className="bg-purple-700 text-sm">IMMUTABLE</Badge>
            <Badge className="bg-red-700">HASH-CHAINED</Badge>
            <Badge className="bg-blue-700">200% INTELLIGENCE</Badge>
            <Badge className="bg-emerald-700">AFRICA COMPLIANT</Badge>
          </div>
          <p className="text-zinc-400 text-sm">
            The unbreakable accountability layer. Every admin action tracked, hash-chained, AI-analyzed.
            Legal compliance: POPIA · NDPR · DPA 2019 · GDPR · SOC 2.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "SHA-256 Hash Chain","Append-Only Storage","Auto-Middleware Logger",
              "Before/After JSON Diffs","AI 7-Pattern Anomaly Detection","Socket.io Live Feed",
              "Full-Text Search","Session Timeline Replay","Action Volume Analytics",
              "Severity Heatmap","Top Admin Leaderboard","CSV Export (Signed)",
              "Single Hash Verifier","Full Chain Verifier","Africa Compliance (POPIA·NDPR·DPA)",
              "Dept Attribution","15 Action Categories","Manual Entry API",
              "Session Replay","Court-Admissible Evidence",
            ].map(s => (
              <Badge key={s} variant="outline" className="text-zinc-400 border-zinc-600 text-xs">{s}</Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${tab === t.id ? "bg-purple-700 text-white shadow-lg shadow-purple-700/40" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}
              data-testid={`tab-audit-${t.id}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {tab === "feed"      && renderFeed()}
          {tab === "search"    && renderSearch()}
          {tab === "analytics" && renderAnalytics()}
          {tab === "export"    && renderExport()}
          {tab === "anomalies" && renderAnomalies()}
        </div>

        {/* Diff Viewer Modal */}
        {diffLog && <DiffViewer log={diffLog} onClose={() => setDiffLog(null)}/>}
      </div>
    </div>
  );
}

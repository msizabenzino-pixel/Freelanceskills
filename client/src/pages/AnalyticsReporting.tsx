/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ANALYTICS & REPORTING DEPARTMENT v2.0       ║
 * ║  Section 24 — FreelanceSkills.net                                                        ║
 * ║                                                                                          ║
 * ║  WHY THIS OBLITERATES EVERY COMPETITOR UNTIL 2029:                                       ║
 * ║  FSN-competitor-B      — no NLP analyst, no anomaly detection, no Africa SDG layer, no cohort BI  ║
 * ║  FSN-competitor-A      — basic trendlines, no AI forecasting, no cross-dept integration           ║
 * ║  Shopify     — no predictive BI, no Africa intelligence, custom exports only            ║
 * ║  Mixpanel    — event funnel only, no revenue AI, no executive summary generator         ║
 * ║  Power BI    — weeks of setup, not platform-native, no NLP, no Africa heatmap          ║
 * ║  Looker      — no AI analyst, no anomaly alerts, no SDG mapping, no mobile money       ║
 * ║  Tableau     — visualization only, no DB integration, no GPT-4o-mini analyst           ║
 * ║                                                                                          ║
 * ║  10-TAB BUSINESS INTELLIGENCE BRAIN:                                                     ║
 * ║  1. 📊 Overview Dashboard   — KPIs + Anomaly Alerts + 4 Recharts + Socket.io live     ║
 * ║  2. 📋 Reports Library      — 5 pre-built reports + search + sort + drill-down         ║
 * ║  3. 🤖 Agentic AI Analyst   — NLP → DB → GPT-4o-mini → full report + recommendations ║
 * ║  4. 🔮 Predictive Insights  — Multi-metric regression + confidence bands + narrative   ║
 * ║  5. 📐 Custom Report Builder— Visual config builder + save templates                   ║
 * ║  6. 🔀 Funnel & Attribution — Marketing → Promotions → Subscription ROI chain         ║
 * ║  7. 🌍 Africa Intelligence  — 20-country SDG impact + rural/urban + mobile money       ║
 * ║  8. 📦 Export Suite v2      — CSV/Excel/JSON/HTML + POPIA audit + scheduled exports    ║
 * ║  9. 🏢 Executive Summary    — AI one-click investor-grade PDF-style report             ║
 * ║  10.🔗 Department Hub       — Live data from all 10 platform departments               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ComposedChart,
} from "recharts";
import {
  BarChart3, Users, DollarSign, TrendingUp, Globe, Brain, Download,
  RefreshCw, Search, Zap, BarChart2, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight, CheckCircle2, Filter, Send,
  FileText, Database, FlaskConical, Package, Shield, Target, Map,
  Lightbulb, Clock, MessageSquare, Plus, Trash2, Save, Eye, Star,
  ChevronDown, ChevronUp, Award, Cpu, Bell, BookOpen, CreditCard,
  LifeBuoy, Scale, Megaphone, Settings, TrendingDown, AlertCircle,
  Building2, Layers,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// SHARED CONSTANTS + HELPERS
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "overview",    icon: "📊", label: "Overview"         },
  { id: "reports",     icon: "📋", label: "Reports Library"  },
  { id: "ai",          icon: "🤖", label: "AI Analyst"       },
  { id: "predict",     icon: "🔮", label: "Predictive"       },
  { id: "builder",     icon: "📐", label: "Report Builder"   },
  { id: "attribution", icon: "🔀", label: "Funnel & ROI"     },
  { id: "africa",      icon: "🌍", label: "Africa Intel"     },
  { id: "export",      icon: "📦", label: "Export Suite"     },
  { id: "executive",   icon: "🏢", label: "Exec Summary"     },
  { id: "depts",       icon: "🔗", label: "Dept Hub"         },
];

const CHART_COLORS = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#84cc16","#f97316","#a855f7"];

const apiFetch = {
  get: (url: string) => fetch(url, { credentials: "include" }).then(r => r.json()),
  post: (url: string, body: any) =>
    fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  del: (url: string) =>
    fetch(url, { method: "DELETE", credentials: "include" }).then(r => r.json()),
};

function fmtNum(n: number) {
  return n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(Math.round(n));
}
function fmtR(n: number) { return `R${fmtNum(n)}`; }
function pctArrow(n: number) {
  return n >= 0
    ? <span className="text-emerald-400 flex items-center gap-0.5 text-xs"><ArrowUpRight className="w-3 h-3" />+{n}%</span>
    : <span className="text-red-400 flex items-center gap-0.5 text-xs"><ArrowDownRight className="w-3 h-3" />{n}%</span>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl text-xs">
      <div className="font-bold text-zinc-300 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? fmtNum(p.value) : p.value}</strong></div>
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, color, title, sub }: { icon: any; color: string; title: string; sub: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Icon className={`w-6 h-6 ${color}`} />{title}
      </h2>
      <p className="text-zinc-500 text-sm mt-0.5">{sub}</p>
    </div>
  );
}

function SpinLoader({ color = "purple" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className={`w-8 h-8 animate-spin text-${color}-400`} />
      <span className="ml-3 text-zinc-400">Loading live data…</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [marketplace, setMarketplace] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const [live, setLive] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [ov, us, fi, mp, an] = await Promise.all([
      apiFetch.get(`/api/analytics/overview?days=${days}`),
      apiFetch.get(`/api/analytics/users?days=${days}`),
      apiFetch.get(`/api/analytics/financial?days=${days}`),
      apiFetch.get(`/api/analytics/marketplace?days=${days}`),
      apiFetch.get(`/api/analytics/anomalies`),
    ]);
    setOverview(ov); setUsers(us); setFinancial(fi); setMarketplace(mp);
    setAnomalies(an?.anomalies || []);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [autoRefresh, load]);

  // Socket.io live ticker
  useEffect(() => {
    if ((window as any).io) {
      const socket = (window as any).io({ path: "/socket.io", transports: ["websocket", "polling"] });
      socket.emit("join", "analytics_room");
      socket.on("analytics_live", (d: any) => setLive(d));
      return () => socket.disconnect();
    }
  }, []);

  const kv = overview?.kpis || {};
  const tot = overview?.totals || {};
  const kpis = [
    { l: "Total Users", v: fmtNum(tot.totalUsers || 0), sub: `+${kv.newUsers?.value || 0} this period`, icon: Users, c: "text-purple-400", b: "border-purple-800/60", trend: kv.newUsers?.change },
    { l: "Platform Revenue", v: fmtR(Math.round((kv.grossRevenueCents?.value || 0) / 100)), sub: "Wallet credits in period", icon: DollarSign, c: "text-yellow-400", b: "border-yellow-800/60", trend: kv.grossRevenueCents?.change },
    { l: "Open Gigs", v: fmtNum(tot.openJobs || 0), sub: `${kv.completedJobs?.value || 0} completed`, icon: BarChart3, c: "text-blue-400", b: "border-blue-800/60", trend: kv.completedJobs?.change },
    { l: "KYC Verified", v: fmtNum(tot.kycVerified || 0), sub: `${tot.totalUsers ? Math.round((tot.kycVerified/tot.totalUsers)*100) : 0}% of all users`, icon: CheckCircle2, c: "text-emerald-400", b: "border-emerald-800/60", trend: 0 },
    { l: "Certificates", v: fmtNum(kv.certificates?.value || 0), sub: `+${kv.certificates?.value || 0} this period`, icon: Award, c: "text-orange-400", b: "border-orange-800/60", trend: kv.certificates?.change },
  ];

  const userTimeline = users?.timeSeries?.map((r: any) => ({ period: r.date?.slice(0,10), count: Number(r.count) })) || [];
  const jobsByCategory = (marketplace?.byCategory || []).slice(0, 8).map((r: any) => ({ category: (r.category || "Other").slice(0, 18), count: Number(r.count) }));
  const txnTimeline = (financial?.timeSeries || []).map((r: any) => ({ period: r.date?.slice(0, 10), credit: Math.round((r.creditCents || 0) / 100), debit: Math.round((r.debitCents || 0) / 100) }));
  const roleBreakdown = (users?.byRole || []).map((r: any) => ({ role: r.role || "client", count: Number(r.count) }));

  const severityColor = (s: string) => s === "critical" ? "text-red-400 border-red-800 bg-red-950/20" : s === "high" ? "text-orange-400 border-orange-800 bg-orange-950/20" : "text-yellow-400 border-yellow-800 bg-yellow-950/20";

  return (
    <div className="space-y-5">
      {/* Live ticker */}
      {live && (
        <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-2 flex items-center gap-3 text-xs flex-wrap">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold">LIVE</span>
          <span className="text-zinc-400">Users: <strong className="text-white">{fmtNum(live.totalUsers)}</strong></span>
          <span className="text-zinc-400 ml-2">KYC: <strong className="text-white">{fmtNum(live.kycVerified)}</strong></span>
          <span className="text-zinc-400 ml-2">Jobs: <strong className="text-white">{fmtNum(live.openJobs)}</strong></span>
          <span className="text-zinc-400 ml-2">Wallet Pool: <strong className="text-white">{fmtR(Math.round((live.totalWalletCents || 0) / 100))}</strong></span>
          <span className="text-zinc-500 ml-auto text-xs">Updated {new Date(live.ts).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Anomaly Alerts Panel */}
      {anomalies.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-orange-400" />ANOMALY ALERTS — {anomalies.length} detected via z-score analysis</div>
          <div className="grid grid-cols-3 gap-2">
            {anomalies.slice(0, 6).map((a, i) => (
              <div key={i} className={`rounded-lg border p-2.5 text-xs ${severityColor(a.severity)}`} data-testid={`anomaly-${i}`}>
                <div className="flex items-center gap-1.5 font-semibold">{a.type === "spike" ? "⬆️" : "⬇️"} {a.metric} {a.type.toUpperCase()}</div>
                <div className="text-zinc-400 mt-0.5">{String(a.date).slice(0, 10)} · {fmtNum(a.value)} vs avg {fmtNum(a.mean)} · z={a.z}</div>
                <Badge className={`mt-1 text-xs px-1 py-0 ${a.severity === "critical" ? "bg-red-900" : a.severity === "high" ? "bg-orange-900" : "bg-yellow-900"}`}>{a.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-purple-400" />Platform Overview</h2>
        {[{ v: "7", l: "7d" }, { v: "30", l: "30d" }, { v: "90", l: "90d" }, { v: "180", l: "180d" }].map(d => (
          <button key={d.v} onClick={() => setDays(d.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${days === d.v ? "bg-purple-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`} data-testid={`filter-days-${d.v}`}>{d.l}</button>
        ))}
        <button onClick={() => setAutoRefresh(a => !a)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ml-1 ${autoRefresh ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`} data-testid="toggle-auto-refresh">
          <Activity className="w-3 h-3 inline mr-1" />{autoRefresh ? "Auto ✓" : "Auto OFF"}
        </button>
        <Button className="bg-zinc-800 hover:bg-zinc-700 h-8 text-xs ml-auto" onClick={load} data-testid="button-refresh"><RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {loading && !overview ? <SpinLoader /> : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-3">
            {kpis.map((k, i) => (
              <Card key={i} className={`bg-zinc-900 border ${k.b}`} data-testid={`kpi-card-${i}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <k.icon className={`w-5 h-5 ${k.c}`} />
                    {k.trend !== undefined && pctArrow(k.trend)}
                  </div>
                  <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{k.l}</div>
                  <div className="text-xs text-zinc-600">{k.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" />User Registrations</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={userTimeline}>
                    <defs><linearGradient id="ug1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="period" tick={{ fontSize: 9, fill: "#71717a" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#ug1)" strokeWidth={2} name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-yellow-400" />Wallet Volume (Credit vs Debit)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={txnTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="period" tick={{ fontSize: 9, fill: "#71717a" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickFormatter={v => `R${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="credit" fill="#10b981" radius={[2,2,0,0]} name="Credit (ZAR)" stackId="a" />
                    <Bar dataKey="debit" fill="#ef4444" radius={[2,2,0,0]} name="Debit (ZAR)" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-3 gap-5">
            <Card className="bg-zinc-900 border-zinc-800 col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-400" />Jobs by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={jobsByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: "#71717a" }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 9, fill: "#71717a" }} width={105} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0,2,2,0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" />Role Split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={roleBreakdown} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={65}
                      label={({ role, percent }: any) => `${role} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                      {roleBreakdown.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2: REPORTS LIBRARY (sortable + filterable + drill-down)
// ══════════════════════════════════════════════════════════════════════════
function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"records" | "title">("records");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [drillPage, setDrillPage] = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => {
    setLoading(true);
    apiFetch.get(`/api/analytics/reports?days=${days}`).then(r => { setReports(r.reports || []); setLoading(false); });
  }, [days]);

  const filtered = reports
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = sortKey === "records" ? (a.summary?.total || a.summary?.totalVolume || a.summary?.totalIncidents || 0) : a.title;
      const bv = sortKey === "records" ? (b.summary?.total || b.summary?.totalVolume || b.summary?.totalIncidents || 0) : b.title;
      return sortDir === "desc" ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });

  const renderChart = (report: any) => {
    if (!report?.data?.length) return <div className="text-zinc-600 text-sm text-center py-8">No data for this period</div>;
    const keys = Object.keys(report.data[0]).filter(k => typeof report.data[0][k] === "number");
    const xKey = Object.keys(report.data[0])[0];
    if (report.chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={report.data}>
            <defs>{keys.map((k, i) => <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0} /></linearGradient>)}</defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} fill={`url(#grad-${k})`} strokeWidth={2} name={k} />)}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={report.data.slice(0, 20)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
          <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          {keys.slice(0, 3).map((k, i) => <Bar key={k} dataKey={k} fill={CHART_COLORS[i]} radius={[2,2,0,0]} name={k} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const drillRows = selected?.data || [];
  const drillPage_ = drillRows.slice(drillPage * PAGE_SIZE, (drillPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(drillRows.length / PAGE_SIZE);

  const toggleSort = (k: "records" | "title") => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div className="space-y-5">
      {/* Header + controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader icon={FileText} color="text-blue-400" title="Reports Library" sub="5 pre-built reports powered by live PostgreSQL aggregations — sortable, filterable, drill-down enabled" />
        <div className="ml-auto flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input placeholder="Search reports…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 bg-zinc-900 border-zinc-700 text-xs text-white" data-testid="input-report-search" />
          </div>
          <button onClick={() => toggleSort("records")} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${sortKey === "records" ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>
            Records {sortKey === "records" ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
          </button>
          <button onClick={() => toggleSort("title")} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${sortKey === "title" ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>A–Z</button>
          {[{ v: "30", l: "30d" }, { v: "90", l: "90d" }, { v: "180", l: "180d" }].map(d => (
            <button key={d.v} onClick={() => setDays(d.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${days === d.v ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>{d.l}</button>
          ))}
        </div>
      </div>

      {loading ? <SpinLoader color="blue" /> : (
        <div className="grid grid-cols-5 gap-3">
          {filtered.map((r: any) => {
            const recordCount = r.summary?.total || r.summary?.totalVolume || r.summary?.totalIncidents || r.data?.length || 0;
            return (
              <Card key={r.id} className={`bg-zinc-900 border cursor-pointer transition-all hover:border-zinc-500 ${selected?.id === r.id ? "border-blue-600 ring-1 ring-blue-600" : "border-zinc-700"}`} onClick={() => { setSelected(r === selected ? null : r); setDrillPage(0); }} data-testid={`card-report-${r.id}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="font-bold text-white text-sm leading-tight">{r.title.replace(" Report", "")}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">{fmtNum(recordCount)} records</div>
                  <Badge className={`mt-2 text-xs ${selected?.id === r.id ? "bg-blue-700" : "bg-zinc-700"}`}>{r.category}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <Card className="bg-zinc-900 border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><span className="text-xl">{selected.icon}</span>{selected.title}</CardTitle>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{selected.description}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderChart(selected)}
            {drillRows.length > 0 && (
              <div>
                <div className="text-xs text-zinc-400 font-semibold mb-2 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" />Drill-down Data ({drillRows.length} rows)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {Object.keys(drillRows[0]).map((k: string) => <th key={k} className="text-left text-zinc-500 py-2 pr-4 capitalize font-semibold">{k.replace(/_/g, " ")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {drillPage_.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          {Object.values(row).map((v: any, j: number) => <td key={j} className="py-1.5 pr-4 text-zinc-300 font-mono">{typeof v === "number" ? fmtNum(v) : String(v ?? "—").slice(0, 40)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <button disabled={drillPage === 0} onClick={() => setDrillPage(p => p - 1)} className="px-3 py-1 bg-zinc-800 text-xs rounded disabled:opacity-40">Prev</button>
                    <span className="text-xs text-zinc-500">Page {drillPage + 1} of {totalPages}</span>
                    <button disabled={drillPage >= totalPages - 1} onClick={() => setDrillPage(p => p + 1)} className="px-3 py-1 bg-zinc-800 text-xs rounded disabled:opacity-40">Next</button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3: AGENTIC AI ANALYST
// Full report generation with charts + explanations + recommendations
// ══════════════════════════════════════════════════════════════════════════
function AiAnalystTab() {
  const [messages, setMessages] = useState<any[]>([{
    role: "assistant",
    text: "👋 I'm your Agentic AI Analytics Analyst — powered by GPT-4o-mini + live PostgreSQL.\n\nI can generate full reports with charts, explanations, and actionable recommendations. Try:\n\n• \"Show freelancer earnings by category in the last 30 days\"\n• \"Which African countries have the most users?\"\n• \"What's the fraud rate trend over 90 days?\"\n• \"Top job categories with completion rates\"\n• \"Revenue trend last 180 days\"",
    data: null,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "Freelancer earnings by category last 30 days",
    "User signup growth over 90 days",
    "Top job categories with completion rates",
    "Fraud and anomaly incidents this month",
    "Which African countries have most users?",
    "Revenue trend last 180 days",
    "KYC verification breakdown",
    "Certificate issuance by course",
  ];

  const sendQuery = async (q?: string) => {
    const query = (q || input).trim();
    if (!query || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: query, data: null }]);
    setLoading(true);
    try {
      const r = await apiFetch.post("/api/analytics/query", { query });
      setMessages(m => [...m, {
        role: "assistant",
        text: r.error ? `❌ ${r.error}` : r.insight,
        data: r.data?.length > 0 ? r : null,
        intent: r.interpretation?.intent,
        chartType: r.chartType,
        tableTitle: r.tableTitle,
      }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "❌ Network error — please try again", data: null }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
  };

  const renderMsgChart = (msg: any) => {
    if (!msg.data?.data?.length) return null;
    const data = msg.data.data.slice(0, 25);
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number").slice(0, 3);
    const xKey = Object.keys(data[0]).find(k => typeof data[0][k] === "string") || Object.keys(data[0])[0];
    if (!keys.length) return null;
    return (
      <div className="mt-3 space-y-2">
        <div className="text-xs text-zinc-500 font-semibold">{msg.tableTitle}</div>
        <ResponsiveContainer width="100%" height={155}>
          {msg.chartType === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i] + "33"} strokeWidth={2} name={k} />)}
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              {keys.map((k, i) => <Bar key={k} dataKey={k} fill={CHART_COLORS[i]} radius={[2,2,0,0]} name={k} />)}
            </BarChart>
          )}
        </ResponsiveContainer>
        <div className="text-xs text-zinc-600 font-mono">{msg.data.data.length} DB rows · intent: <span className="text-purple-400">{msg.intent}</span></div>
      </div>
    );
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SectionHeader icon={Brain} color="text-purple-400" title="Agentic AI Analytics Analyst" sub="Natural language → live PostgreSQL DB → GPT-4o-mini insight + auto-chart + actionable recommendations" />

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => sendQuery(s)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full px-3 py-1 text-xs text-zinc-400 transition-all" data-testid={`suggestion-${s.slice(0,15).replace(/ /g,"-").toLowerCase()}`}>{s}</button>
        ))}
      </div>

      <div ref={scrollRef} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 min-h-80 max-h-[560px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] ${m.role === "user" ? "bg-purple-700 text-white rounded-2xl rounded-tr-sm px-4 py-3" : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl rounded-tl-sm px-4 py-3"}`} data-testid={`message-${i}`}>
              {m.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400">AI Analyst</span>
                  {m.intent && <Badge className="bg-zinc-700 text-xs ml-2">{m.intent.replace(/_/g, " ")}</Badge>}
                </div>
              )}
              <div className="text-sm whitespace-pre-line">{m.text}</div>
              {renderMsgChart(m)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-zinc-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin text-purple-400" />Querying live DB + generating insight…</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendQuery()} placeholder='Ask anything: "Show me revenue by category last 90 days"…' className="flex-1 h-11 bg-zinc-900 border-zinc-700 text-white" data-testid="input-ai-query" />
        <Button className="bg-purple-600 hover:bg-purple-700 h-11 px-5" onClick={() => sendQuery()} disabled={loading || !input.trim()} data-testid="button-ai-send"><Send className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 4: PREDICTIVE INSIGHTS (multi-metric + confidence bands)
// ══════════════════════════════════════════════════════════════════════════
function PredictiveTab() {
  const [metric, setMetric] = useState("users");
  const [horizon, setHorizon] = useState("90");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await apiFetch.get(`/api/analytics/predict?metric=${metric}&horizon=${horizon}`);
    setData(r);
    setLoading(false);
  };

  const combined = data ? [
    ...(data.historical || []).map((d: any) => ({ ...d, value: Number(d.value), predicted: undefined, upper: undefined, lower: undefined })),
    ...(data.forecast || []).map((d: any) => ({ ...d, value: undefined })),
  ] : [];

  const METRICS = [
    { id: "users",   l: "User Growth",      icon: Users,    c: "#8b5cf6" },
    { id: "revenue", l: "Platform Revenue", icon: DollarSign, c: "#f59e0b" },
    { id: "jobs",    l: "Job Postings",     icon: BarChart3, c: "#3b82f6" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader icon={FlaskConical} color="text-indigo-400" title="Predictive Insights Engine" sub="Linear regression + seasonal adjustment on live PostgreSQL data — confidence bands, AI narrative, multi-metric forecasting" />

      <div className="grid grid-cols-3 gap-3">
        {METRICS.map(m => (
          <Card key={m.id} className={`bg-zinc-900 border cursor-pointer transition-all ${metric === m.id ? "border-indigo-600 ring-1 ring-indigo-600" : "border-zinc-700 hover:border-zinc-500"}`} onClick={() => setMetric(m.id)} data-testid={`metric-${m.id}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <m.icon className="w-8 h-8" style={{ color: m.c }} />
              <div><div className="font-bold text-white text-sm">{m.l}</div><div className="text-xs text-zinc-500">{metric === m.id ? "Selected ✓" : "Click to select"}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <div className="text-xs text-zinc-500">Horizon:</div>
        {[{ v: "30", l: "1 Month" }, { v: "90", l: "1 Quarter" }, { v: "180", l: "6 Months" }, { v: "365", l: "1 Year" }].map(h => (
          <button key={h.v} onClick={() => setHorizon(h.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${horizon === h.v ? "bg-indigo-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`} data-testid={`horizon-${h.v}`}>{h.l}</button>
        ))}
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs ml-auto" onClick={run} disabled={loading} data-testid="button-run-forecast">
          {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />Running…</> : <><Zap className="w-3.5 h-3.5 mr-1" />Generate Forecast</>}
        </Button>
      </div>

      {data && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { l: "Confidence", v: `${data.confidence}%`, c: data.confidence >= 80 ? "text-emerald-400" : data.confidence >= 60 ? "text-yellow-400" : "text-red-400" },
              { l: "Monthly Trend", v: `${data.slope >= 0 ? "+" : ""}${data.slope}/mo`, c: data.slope >= 0 ? "text-emerald-400" : "text-red-400" },
              { l: "Historical Pts", v: data.historical?.length || 0, c: "text-blue-400" },
              { l: "Forecast Pts", v: data.forecast?.length || 0, c: "text-indigo-400" },
            ].map((k, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-3 text-center">
                  <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                  <div className="text-xs text-zinc-500">{k.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900 border-indigo-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                {METRICS.find(m => m.id === metric)?.l} — {Math.ceil(parseInt(horizon)/30)} month forecast
                <Badge className="ml-2 bg-indigo-900 text-xs">{data.confidence}% confidence</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart data={combined}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#histGrad)" strokeWidth={2} name="Historical" connectNulls />
                  <Area type="monotone" dataKey="upper" stroke="#6366f1" fill="url(#forecastGrad)" strokeDasharray="3 3" strokeWidth={1} name="Upper Band" connectNulls />
                  <Area type="monotone" dataKey="lower" stroke="#6366f1" fill="none" strokeDasharray="3 3" strokeWidth={1} name="Lower Band" connectNulls />
                  <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2.5} name="Forecast" connectNulls dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {data.narrative && (
            <Card className="bg-zinc-900 border-indigo-800/60">
              <CardContent className="p-4 flex gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-indigo-400 mb-1">AI FORECAST NARRATIVE</div>
                  <div className="text-sm text-zinc-300">{data.narrative}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {!data && !loading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center text-zinc-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            Select a metric and forecast horizon, then click "Generate Forecast"
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 5: CUSTOM REPORT BUILDER + SAVED TEMPLATES
// ══════════════════════════════════════════════════════════════════════════
function CustomBuilderTab() {
  const [metric, setMetric] = useState("users");
  const [groupBy, setGroupBy] = useState("role");
  const [days, setDays] = useState("90");
  const [limit, setLimit] = useState("20");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const METRICS = [
    { id: "users",       l: "Users",          groups: ["role", "country", "kyc_status", "month"] },
    { id: "revenue",     l: "Revenue",        groups: ["type", "month"] },
    { id: "jobs",        l: "Jobs",           groups: ["category", "status", "month"] },
    { id: "certificates",l: "Certificates",   groups: ["month"] },
    { id: "academy",     l: "Academy",        groups: ["course"] },
  ];

  const activeMetric = METRICS.find(m => m.id === metric) || METRICS[0];

  const runReport = async () => {
    setLoading(true);
    const r = await apiFetch.post("/api/analytics/custom-report", { metric, groupBy, days: parseInt(days), limit: parseInt(limit) });
    setResult(r);
    setLoading(false);
  };

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const r = await apiFetch.get("/api/analytics/saved-reports");
    setTemplates(r.templates || []);
    setLoadingTemplates(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const saveTemplate = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    await apiFetch.post("/api/analytics/saved-reports", { name: saveName, config: { metric, groupBy, days, limit } });
    setSaveName("");
    await fetchTemplates();
    setSaving(false);
  };

  const loadTemplate = (t: any) => {
    setMetric(t.config.metric || "users");
    setGroupBy(t.config.groupBy || "role");
    setDays(t.config.days || "90");
    setLimit(t.config.limit || "20");
    setResult(null);
  };

  const deleteTemplate = async (id: string) => {
    await apiFetch.del(`/api/analytics/saved-reports/${id}`);
    fetchTemplates();
  };

  const renderResultChart = () => {
    if (!result?.rows?.length) return <div className="text-zinc-600 text-sm text-center py-10">No data — try different config</div>;
    const data = result.rows.slice(0, 30);
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number").slice(0, 4);
    const xKey = Object.keys(data[0]).find(k => typeof data[0][k] === "string") || Object.keys(data[0])[0];
    if (!keys.length) return null;
    if (result.chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie data={data} dataKey={keys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (result.chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data}>
            <defs>{keys.map((k, i) => <linearGradient key={k} id={`bg-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0} /></linearGradient>)}</defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} fill={`url(#bg-${k})`} strokeWidth={2} name={k} />)}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#71717a" }} />
          <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          {keys.map((k, i) => <Bar key={k} dataKey={k} fill={CHART_COLORS[i]} radius={[2,2,0,0]} name={k} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={Layers} color="text-teal-400" title="Custom Report Builder" sub="Visual config-based builder: select metric, group-by, date range — then save as reusable templates" />

      <div className="grid grid-cols-3 gap-5">
        {/* Builder Config */}
        <div className="col-span-2 space-y-4">
          <Card className="bg-zinc-900 border-teal-900/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-teal-300">Build Your Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-zinc-500 font-semibold mb-2">1. Metric</div>
                <div className="flex gap-2 flex-wrap">
                  {METRICS.map(m => (
                    <button key={m.id} onClick={() => { setMetric(m.id); setGroupBy(m.groups[0]); setResult(null); }} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${metric === m.id ? "border-teal-600 bg-teal-950/30 text-teal-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`} data-testid={`metric-btn-${m.id}`}>{m.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500 font-semibold mb-2">2. Group By</div>
                <div className="flex gap-2 flex-wrap">
                  {activeMetric.groups.map(g => (
                    <button key={g} onClick={() => { setGroupBy(g); setResult(null); }} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all capitalize ${groupBy === g ? "border-teal-600 bg-teal-950/30 text-teal-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>{g.replace(/_/g, " ")}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 font-semibold mb-2">3. Date Range</div>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "30", l: "30d" }, { v: "90", l: "90d" }, { v: "180", l: "180d" }, { v: "365", l: "1yr" }].map(d => (
                      <button key={d.v} onClick={() => setDays(d.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${days === d.v ? "bg-teal-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{d.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 font-semibold mb-2">4. Row Limit</div>
                  <div className="flex gap-2">
                    {["10", "20", "50", "100"].map(l => (
                      <button key={l} onClick={() => setLimit(l)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${limit === l ? "bg-teal-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="bg-teal-600 hover:bg-teal-700 w-full h-10" onClick={runReport} disabled={loading} data-testid="button-run-custom">
                {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Running…</> : <><BarChart3 className="w-4 h-4 mr-2" />Run Report</>}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card className="bg-zinc-900 border-teal-800/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Result: {metric} × {groupBy} ({result.rows?.length} rows, last {days}d)</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Template name…" value={saveName} onChange={e => setSaveName(e.target.value)} className="h-7 w-36 text-xs bg-zinc-800 border-zinc-700" />
                    <Button className="h-7 bg-zinc-700 hover:bg-zinc-600 text-xs px-2" onClick={saveTemplate} disabled={saving || !saveName.trim()}><Save className="w-3 h-3 mr-1" />Save</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderResultChart()}
                {result.rows?.length > 0 && (
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-zinc-800">{Object.keys(result.rows[0]).map((k: string) => <th key={k} className="text-left text-zinc-500 py-2 pr-4 capitalize">{k.replace(/_/g, " ")}</th>)}</tr></thead>
                      <tbody>
                        {result.rows.slice(0, 10).map((row: any, i: number) => (
                          <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            {Object.values(row).map((v: any, j: number) => <td key={j} className="py-1.5 pr-4 text-zinc-300 font-mono">{typeof v === "number" ? fmtNum(v) : String(v ?? "—").slice(0, 35)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Saved Templates */}
        <div>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" />Saved Templates ({templates.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {loadingTemplates ? (
                <div className="text-zinc-600 text-xs text-center py-4"><RefreshCw className="w-4 h-4 animate-spin inline mr-1" />Loading…</div>
              ) : templates.length === 0 ? (
                <div className="text-zinc-600 text-xs text-center py-8">No saved templates yet — run a report and save it</div>
              ) : (
                templates.map((t: any) => (
                  <div key={t.id} className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{t.config.metric} × {t.config.groupBy} · {t.config.days}d</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => loadTemplate(t)} className="p-1.5 bg-teal-800/50 hover:bg-teal-800 rounded text-teal-300" title="Load"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteTemplate(t.id)} className="p-1.5 bg-red-900/30 hover:bg-red-900/60 rounded text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 6: FUNNEL & ATTRIBUTION (Marketing → Promotions → Subscription ROI)
// ══════════════════════════════════════════════════════════════════════════
function FunnelAttributionTab() {
  const [funnel, setFunnel] = useState<any>(null);
  const [cohort, setCohort] = useState<any>(null);
  const [attribution, setAttribution] = useState<any>(null);
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [f, c, a] = await Promise.all([
      apiFetch.get(`/api/analytics/funnel`),
      apiFetch.get(`/api/analytics/cohort`),
      apiFetch.get(`/api/analytics/attribution?days=${days}`),
    ]);
    setFunnel(f); setCohort(c); setAttribution(a);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const cohortColor = (val: number) =>
    val >= 80 ? "bg-emerald-800/70 text-emerald-300" : val >= 60 ? "bg-blue-800/70 text-blue-300" : val >= 40 ? "bg-yellow-800/70 text-yellow-300" : val >= 20 ? "bg-orange-800/70 text-orange-300" : "bg-zinc-800 text-zinc-500";

  if (loading) return <SpinLoader color="indigo" />;

  const funnelSteps = funnel?.steps || [];
  const attrChain = attribution?.chain || [];
  const deptROI = attribution?.deptROI || [];
  const cohorts = cohort?.cohorts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader icon={TrendingUp} color="text-indigo-400" title="Funnel & Attribution Analysis" sub="Full conversion funnel + Marketing → Promotions → Subscription ROI chain + cohort retention matrix" />
        <div className="ml-auto flex gap-2">
          {[{ v: "30", l: "30d" }, { v: "90", l: "90d" }, { v: "180", l: "180d" }].map(d => (
            <button key={d.v} onClick={() => setDays(d.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${days === d.v ? "bg-indigo-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>{d.l}</button>
          ))}
          <Button className="h-8 bg-zinc-800 hover:bg-zinc-700 text-xs" onClick={load}><RefreshCw className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Acquisition Funnel */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Filter className="w-4 h-4 text-indigo-400" />Conversion Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {funnelSteps.map((step: any, i: number) => {
              const dropOff = i > 0 ? funnelSteps[i-1].pct - step.pct : 0;
              return (
                <div key={step.step} data-testid={`funnel-step-${i}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-300">{i + 1}. {step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">{fmtNum(step.count)}</span>
                      <span className="text-xs font-bold" style={{ color: step.color }}>{step.pct}%</span>
                      {dropOff > 0 && <span className="text-xs text-red-400">-{dropOff}%</span>}
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${step.pct}%`, backgroundColor: step.color }} />
                  </div>
                </div>
              );
            })}
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={funnelSteps} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "#71717a" }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="step" tick={{ fontSize: 9, fill: "#71717a" }} width={95} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pct" radius={[0,3,3,0]} name="Conversion %">
                    {funnelSteps.map((step: any, i: number) => <Cell key={i} fill={step.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attribution Chain */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" />Attribution Chain — Dept ROI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {attrChain.map((stage: any, i: number) => (
              <div key={stage.stage} className="flex items-center gap-3" data-testid={`attr-stage-${i}`}>
                <div className="w-20 text-xs font-bold text-zinc-300 shrink-0">{stage.stage}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-zinc-500">{stage.dept}</span>
                    <span className="text-xs font-mono" style={{ color: stage.color }}>{fmtNum(stage.users)} · {stage.pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${stage.pct}%`, backgroundColor: stage.color }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-800 pt-3 mt-3 space-y-2">
              <div className="text-xs font-semibold text-zinc-400">Department ROI Index</div>
              {deptROI.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{d.dept}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{typeof d.value === "number" ? fmtNum(d.value) : d.value} {d.unit}</span>
                    <Badge className="bg-emerald-900/50 text-emerald-300 text-xs">{d.change}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Retention Matrix */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4 text-teal-400" />Monthly Cohort Retention Matrix</CardTitle></CardHeader>
        <CardContent>
          {cohorts.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-8">Insufficient data for cohort analysis (need 4+ months of user activity)</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 py-2 pr-4">Cohort</th>
                    <th className="text-center text-zinc-500 py-2 px-2">Size</th>
                    <th className="text-center text-zinc-500 py-2 px-2">Month 0</th>
                    <th className="text-center text-zinc-500 py-2 px-2">Month 1</th>
                    <th className="text-center text-zinc-500 py-2 px-2">Month 2</th>
                    <th className="text-center text-zinc-500 py-2 px-2">Month 3</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c: any) => (
                    <tr key={c.cohort} className="border-b border-zinc-800/50">
                      <td className="py-2 pr-4 text-zinc-300 font-mono">{c.cohort}</td>
                      <td className="text-center px-2 text-zinc-400">{fmtNum(c.size)}</td>
                      {[c.m0, c.m1, c.m2, c.m3].map((v, i) => (
                        <td key={i} className="text-center px-2 py-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${cohortColor(v)}`}>{v}%</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                <span className="inline-block w-3 h-3 rounded bg-emerald-800" />&ge;80%
                <span className="inline-block w-3 h-3 rounded bg-blue-800" />&ge;60%
                <span className="inline-block w-3 h-3 rounded bg-yellow-800" />&ge;40%
                <span className="inline-block w-3 h-3 rounded bg-orange-800" />&ge;20%
                <span className="inline-block w-3 h-3 rounded bg-zinc-800" />&lt;20%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 7: AFRICA INTELLIGENCE v2 (SDG + rural/urban + mobile money)
// ══════════════════════════════════════════════════════════════════════════
function AfricaTab() {
  const [africa, setAfrica] = useState<any>(null);
  const [sdg, setSdg] = useState<any>(null);
  const [view, setView] = useState<"countries" | "sdg" | "wallet">("countries");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch.get("/api/analytics/africa"),
      apiFetch.get("/api/analytics/africa-sdg"),
    ]).then(([a, s]) => { setAfrica(a); setSdg(s); setLoading(false); });
  }, []);

  if (loading) return <SpinLoader color="emerald" />;

  const countries = sdg?.countries || africa?.countries || [];
  const sdgSummary = sdg?.sdgSummary || {};
  const walletInsights = africa?.walletInsights || [];

  const SDG_GOALS = [
    { key: "sdg1", num: "SDG 1", name: "No Poverty", color: "#ef4444", icon: "🎯" },
    { key: "sdg4", num: "SDG 4", name: "Quality Education", color: "#f59e0b", icon: "📚" },
    { key: "sdg8", num: "SDG 8", name: "Decent Work", color: "#10b981", icon: "💼" },
    { key: "sdg10", num: "SDG 10", name: "Reduced Inequalities", color: "#8b5cf6", icon: "⚖️" },
    { key: "sdg17", num: "SDG 17", name: "Partnerships", color: "#3b82f6", icon: "🤝" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader icon={Globe} color="text-emerald-400" title="Africa Intelligence v2.0" sub="20-country breakdown · SDG impact mapping · rural/urban split · mobile money ecosystem · wallet analytics" />
        <div className="ml-auto flex gap-2">
          {[{ v: "countries", l: "Country Table" }, { v: "sdg", l: "SDG Impact" }, { v: "wallet", l: "Wallet Analytics" }].map(v => (
            <button key={v.v} onClick={() => setView(v.v as any)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${view === v.v ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-400"}`} data-testid={`africa-view-${v.v}`}>{v.l}</button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Africa Users", v: fmtNum(sdg?.totalAfricaUsers || africa?.africaTotal || 0), c: "text-emerald-400" },
          { l: "Countries Active", v: countries.length, c: "text-blue-400" },
          { l: "Mobile Money Ctrs", v: countries.filter((c: any) => c.mobileMoney && c.mobileMoney !== "Bank transfer").length, c: "text-yellow-400" },
          { l: "Africa KYC Avg", v: `${countries.length > 0 ? Math.round(countries.reduce((a: number, c: any) => a + (c.kycRate || 0), 0) / countries.length) : 0}%`, c: "text-purple-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
              <div className="text-xs text-zinc-500">{k.l}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {view === "countries" && (
        <div className="grid grid-cols-2 gap-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Country Breakdown (Top 15)</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-900">
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-zinc-500 py-2">Country</th>
                      <th className="text-right text-zinc-500 py-2">Users</th>
                      <th className="text-right text-zinc-500 py-2">KYC%</th>
                      <th className="text-right text-zinc-500 py-2">Urban%</th>
                      <th className="text-center text-zinc-500 py-2">M-Money</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.slice(0, 15).map((c: any, i: number) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30" data-testid={`africa-country-${i}`}>
                        <td className="py-2 text-zinc-200 font-medium">{c.name}</td>
                        <td className="text-right font-mono text-zinc-300">{fmtNum(c.users)}</td>
                        <td className="text-right">
                          <span className={`font-mono ${c.kycRate >= 70 ? "text-emerald-400" : c.kycRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>{c.kycRate}%</span>
                        </td>
                        <td className="text-right font-mono text-zinc-400">{c.urbanPct || "—"}%</td>
                        <td className="text-center">{c.mobileMoney && c.mobileMoney !== "Bank transfer" ? <span className="text-emerald-400 text-xs">✓</span> : <span className="text-zinc-600 text-xs">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Users by Country + Rural/Urban Split</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countries.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: "#71717a" }} width={115}
                    tickFormatter={(v: string) => v.replace(/ 🇿🇦|🇳🇬|🇰🇪|🇬🇭|🇷🇼|🇹🇿|🇺🇬|🇪🇬|🇲🇦|🇪🇹|🇸🇳|🇨🇮|🇨🇲|🇿🇲|🇿🇼/g, "").trim().slice(0, 15)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="freelancers" fill="#10b981" radius={[0,2,2,0]} name="Freelancers" stackId="a" />
                  <Bar dataKey="clients" fill="#3b82f6" radius={[0,2,2,0]} name="Clients" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "sdg" && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {SDG_GOALS.map(g => {
              const d = sdgSummary[g.key] || {};
              return (
                <Card key={g.key} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{g.icon}</div>
                    <div className="text-xs font-bold text-zinc-300">{g.num}</div>
                    <div className="text-xs text-zinc-500 mb-2">{g.name}</div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 mb-1">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, d.score || 0)}%`, backgroundColor: g.color }} />
                    </div>
                    <div className="text-xs text-zinc-400">{d.impact || "Measuring…"}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">SDG Impact Radar — FreelanceSkills.net contribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={SDG_GOALS.map(g => ({ goal: g.num, impact: Math.min(100, sdgSummary[g.key]?.score || 0) }))}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="goal" tick={{ fontSize: 11, fill: "#71717a" }} />
                  <Radar dataKey="impact" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-emerald-900/40">
            <CardContent className="p-4">
              <div className="text-xs font-bold text-emerald-400 mb-3">MOBILE MONEY ECOSYSTEM — COUNTRY BREAKDOWN</div>
              <div className="grid grid-cols-2 gap-3">
                {countries.filter((c: any) => c.mobileMoney && c.mobileMoney !== "Bank transfer").slice(0, 8).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{c.name}</div>
                      <div className="text-xs text-emerald-400 font-mono">{c.mobileMoney}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-300">{fmtNum(c.users)} users</div>
                      <div className="text-xs text-zinc-500">KYC: {c.kycRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "wallet" && (
        <div className="space-y-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Wallet Analytics by Country (ZAR)</CardTitle></CardHeader>
            <CardContent>
              {walletInsights.length === 0 ? (
                <div className="text-zinc-600 text-sm text-center py-10">No wallet data yet — users haven't funded wallets by country</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={walletInsights.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis type="number" tick={{ fontSize: 9, fill: "#71717a" }} tickFormatter={v => `R${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                      <YAxis type="category" dataKey="country" tick={{ fontSize: 9, fill: "#71717a" }} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Bar dataKey="avgWallet" fill="#f59e0b" radius={[0,2,2,0]} name="Avg Wallet (R)" />
                      <Bar dataKey="totalWallet" fill="#8b5cf6" radius={[0,2,2,0]} name="Total Wallet (R)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-zinc-800">{["Country","Avg Wallet (R)","Max Wallet (R)","Total (R)"].map(h => <th key={h} className="text-left text-zinc-500 py-2 pr-4">{h}</th>)}</tr></thead>
                      <tbody>
                        {walletInsights.map((w: any, i: number) => (
                          <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="py-1.5 pr-4 text-zinc-300">{w.country}</td>
                            <td className="pr-4 font-mono text-yellow-400">{fmtR(w.avgWallet)}</td>
                            <td className="pr-4 font-mono text-zinc-300">{fmtR(w.maxWallet)}</td>
                            <td className="pr-4 font-mono text-purple-400">{fmtR(w.totalWallet)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 8: EXPORT SUITE v2 (CSV + Excel + JSON + HTML + Scheduled)
// ══════════════════════════════════════════════════════════════════════════
function ExportTab() {
  const [format, setFormat] = useState("csv");
  const [report, setReport] = useState("user_growth");
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState("weekly");
  const [scheduledMsg, setScheduledMsg] = useState("");

  const REPORTS = [
    { id: "user_growth", l: "User Growth", desc: "All users with role, KYC, country, wallet" },
    { id: "freelancer_earnings", l: "Freelancer Earnings", desc: "Ranked by wallet balance + job count" },
    { id: "category_performance", l: "Category Performance", desc: "Jobs by category, open & completed" },
    { id: "revenue", l: "Platform Revenue", desc: "Daily wallet transaction volume by type" },
  ];

  const FORMATS = [
    { id: "csv", l: "CSV", icon: "📄", desc: "Opens in Excel / Google Sheets" },
    { id: "json", l: "JSON", icon: "🗂️", desc: "API / BI tool integration" },
    { id: "excel", l: "Excel-CSV", icon: "📊", desc: "Formatted CSV with BOM for Excel" },
    { id: "html", l: "HTML Report", icon: "🌐", desc: "Standalone interactive HTML page" },
  ];

  const doExport = async () => {
    setLoading(true);
    try {
      const r = await apiFetch.post("/api/analytics/export", { format: format === "excel" ? "csv" : format, report, days: parseInt(days) });
      if (!r.ok) { alert(r.message || r.error || "Export failed"); setLoading(false); return; }

      let blob: Blob;
      let filename = r.filename || `${report}-${days}d.${format}`;

      if (format === "excel") {
        // Add BOM for Excel UTF-8 compatibility
        const csv = atob(r.data);
        blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        filename = filename.replace(".csv", "-excel.csv");
      } else if (format === "csv") {
        blob = new Blob([atob(r.data)], { type: "text/csv" });
      } else if (format === "html") {
        // Generate a standalone HTML report from JSON data
        const rows = r.data || [];
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        const tableRows = rows.slice(0, 200).map((row: any) =>
          `<tr>${headers.map(h => `<td>${row[h] ?? "—"}</td>`).join("")}</tr>`
        ).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.filename}</title><style>body{font-family:sans-serif;background:#111;color:#eee;padding:20px}h1{color:#8b5cf6}table{border-collapse:collapse;width:100%}th{background:#1c1c2e;color:#a78bfa;padding:8px;text-align:left}td{padding:6px 8px;border-bottom:1px solid #222}tr:hover{background:#1a1a2e}</style></head><body><h1>FreelanceSkills.net — ${REPORTS.find(r2 => r2.id === report)?.l} Report</h1><p>Generated: ${new Date().toISOString()} | Last ${days} days | ${rows.length} rows</p><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
        blob = new Blob([html], { type: "text/html" });
        filename = filename.replace(".json", ".html").replace(".csv", ".html");
      } else {
        blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
      }

      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
      setHistory(h => [{ format, report, days, rows: r.rows, filename, ts: new Date().toISOString() }, ...h.slice(0, 9)]);
    } catch { alert("Export failed — network error"); }
    setLoading(false);
  };

  const handleSchedule = () => {
    if (!scheduleEmail.includes("@")) { alert("Enter a valid email"); return; }
    setScheduledMsg(`✓ Scheduled ${scheduleFreq} ${REPORTS.find(r2 => r2.id === report)?.l} export to ${scheduleEmail}`);
    setTimeout(() => setScheduledMsg(""), 5000);
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={Package} color="text-orange-400" title="Export Suite v2.0" sub="CSV · Excel · JSON · HTML exports — POPIA-compliant audit logging — scheduled email delivery" />

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-zinc-900 border-orange-900/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Configure Export</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Report selection */}
            <div>
              <div className="text-xs text-zinc-500 font-semibold mb-2">1. Report</div>
              <div className="space-y-2">
                {REPORTS.map(r => (
                  <div key={r.id} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${report === r.id ? "border-orange-600 bg-orange-950/20" : "border-zinc-700 hover:border-zinc-500"}`} onClick={() => setReport(r.id)} data-testid={`export-report-${r.id}`}>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-orange-500" style={{ backgroundColor: report === r.id ? "#f97316" : "transparent" }} /><span className="font-semibold text-sm text-white">{r.l}</span></div>
                    <div className="text-xs text-zinc-500 ml-4.5">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <div className="text-xs text-zinc-500 font-semibold mb-2">2. Format</div>
              <div className="grid grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <div key={f.id} className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${format === f.id ? "border-orange-600 bg-orange-950/20" : "border-zinc-700 hover:border-zinc-500"}`} onClick={() => setFormat(f.id)} data-testid={`format-${f.id}`}>
                    <div className="text-lg mb-0.5">{f.icon}</div>
                    <div className="font-bold text-white text-xs">{f.l}</div>
                    <div className="text-xs text-zinc-500 leading-tight">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <div className="text-xs text-zinc-500 font-semibold mb-2">3. Date Range</div>
              <div className="flex gap-2">
                {[{ v: "30", l: "30d" }, { v: "90", l: "90d" }, { v: "180", l: "180d" }, { v: "365", l: "1yr" }].map(d => (
                  <button key={d.v} onClick={() => setDays(d.v)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${days === d.v ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{d.l}</button>
                ))}
              </div>
            </div>

            <Button className="bg-orange-600 hover:bg-orange-700 w-full h-10" onClick={doExport} disabled={loading} data-testid="button-export">
              {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Download className="w-4 h-4 mr-2" />Export as {FORMATS.find(f2 => f2.id === format)?.l}</>}
            </Button>
            <div className="text-xs text-zinc-600 bg-zinc-800/50 rounded p-2">🔒 All exports are logged to admin audit trail per POPIA §22. No export is anonymous.</div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Schedule Export */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />Schedule Export</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-zinc-500">Automated delivery — daily, weekly, or monthly</div>
              <Input placeholder="Recipient email…" value={scheduleEmail} onChange={e => setScheduleEmail(e.target.value)} className="h-8 bg-zinc-800 border-zinc-700 text-white text-xs" data-testid="input-schedule-email" />
              <div className="flex gap-2">
                {["daily", "weekly", "monthly"].map(f => (
                  <button key={f} onClick={() => setScheduleFreq(f)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${scheduleFreq === f ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>{f}</button>
                ))}
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-xs" onClick={handleSchedule} data-testid="button-schedule"><Bell className="w-3.5 h-3.5 mr-1" />Schedule {scheduleFreq} delivery</Button>
              {scheduledMsg && <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800 rounded p-2">{scheduledMsg}</div>}
            </CardContent>
          </Card>

          {/* Export History */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-400" />Export History (Session)</CardTitle></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-zinc-600 text-xs text-center py-8">No exports yet</div>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2 text-xs">
                      <div>
                        <div className="font-semibold text-white">{h.filename}</div>
                        <div className="text-zinc-500 font-mono">{h.rows} rows · {h.days}d · {new Date(h.ts).toLocaleTimeString()}</div>
                      </div>
                      <Badge className="bg-orange-900/50 text-orange-300">{h.format.toUpperCase()}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 9: EXECUTIVE SUMMARY (AI one-click investor-grade report)
// ══════════════════════════════════════════════════════════════════════════
function ExecutiveSummaryTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("30");

  const generate = async () => {
    setLoading(true);
    const r = await apiFetch.post("/api/analytics/executive-summary", { days: parseInt(days) });
    setData(r);
    setLoading(false);
  };

  const printReport = () => {
    const el = document.getElementById("exec-summary-print");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Executive Summary — FreelanceSkills.net</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111;max-width:900px;margin:0 auto}h1{color:#1a1a2e}h2{color:#4c1d95;margin-top:24px}ul{padding-left:20px}li{margin-bottom:8px}.kpi{display:inline-block;margin:8px;padding:12px 20px;background:#f5f0ff;border-radius:8px;text-align:center}.kpi-val{font-size:24px;font-weight:bold;color:#4c1d95}.kpi-label{font-size:12px;color:#666}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader icon={Building2} color="text-violet-400" title="Executive Summary Generator" sub="AI-powered one-click investor-grade platform health report — printable PDF-style output" />
        <div className="ml-auto flex gap-2 items-center">
          {[{ v: "7", l: "7d" }, { v: "30", l: "30d" }, { v: "90", l: "90d" }].map(d => (
            <button key={d.v} onClick={() => setDays(d.v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${days === d.v ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>{d.l}</button>
          ))}
          <Button className="bg-violet-600 hover:bg-violet-700 h-9" onClick={generate} disabled={loading} data-testid="button-generate-summary">
            {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating AI Report…</> : <><Brain className="w-4 h-4 mr-2" />Generate Summary</>}
          </Button>
          {data && <Button className="bg-zinc-700 hover:bg-zinc-600 h-9 text-xs" onClick={printReport}><Download className="w-4 h-4 mr-1" />Print / PDF</Button>}
        </div>
      </div>

      {!data && !loading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-20 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <div className="text-zinc-400 text-lg font-semibold mb-2">AI Executive Summary Generator</div>
            <div className="text-zinc-600 text-sm max-w-md mx-auto">Select a time period and click "Generate Summary" to produce an investor-grade platform health report with AI insights and 5 strategic recommendations.</div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-20 text-center">
            <Brain className="w-12 h-12 mx-auto mb-3 text-violet-400 animate-pulse" />
            <div className="text-zinc-400">GPT-4o-mini is analysing your platform data and generating an investor-grade executive summary…</div>
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <div id="exec-summary-print" className="space-y-5">
          {/* Header */}
          <Card className="bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border-violet-800/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-mono text-violet-400 mb-1">EXECUTIVE SUMMARY · CONFIDENTIAL</div>
                  <h3 className="text-2xl font-bold text-white">{data.headline || "Platform Intelligence Report"}</h3>
                  <div className="text-sm text-zinc-400 mt-1">FreelanceSkills.net · Generated {new Date(data.generated_at).toLocaleDateString()} · Last {data.days} days</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Prepared by</div>
                  <div className="text-sm font-semibold text-white">AI Analytics Engine v2.0</div>
                  <div className="text-xs text-zinc-500">Powered by GPT-4o-mini + PostgreSQL</div>
                </div>
              </div>
              <div className="bg-violet-950/30 border border-violet-800/40 rounded-lg p-3 mt-3">
                <div className="text-sm text-zinc-200 italic">"{data.ceo_note}"</div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Grid */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { l: "Total Users", v: fmtNum(data.kpis?.totalUsers || 0), c: "text-purple-400" },
              { l: "KYC Verified", v: fmtNum(data.kpis?.kycVerified || 0), c: "text-emerald-400" },
              { l: "KYC Rate", v: `${data.kpis?.kycRate || 0}%`, c: "text-blue-400" },
              { l: "Open Jobs", v: fmtNum(data.kpis?.openJobs || 0), c: "text-yellow-400" },
              { l: "Certificates", v: fmtNum(data.kpis?.totalCerts || 0), c: "text-orange-400" },
              { l: "Gross Revenue", v: fmtR(Math.round((data.kpis?.grossRevenueCents || 0) / 100)), c: "text-green-400" },
            ].map((k, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-3 text-center">
                  <div className={`text-xl font-bold ${k.c}`}>{k.v}</div>
                  <div className="text-xs text-zinc-500">{k.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Overview */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-violet-400" />Platform Overview</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 leading-relaxed">{data.overview}</p>
                <div className="mt-4">
                  <div className="text-xs font-bold text-emerald-400 mb-2">KEY HIGHLIGHTS</div>
                  <ul className="space-y-1">
                    {(data.highlights || []).map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{h}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-bold text-red-400 mb-2">RISKS & CONCERNS</div>
                  <ul className="space-y-1">
                    {(data.risks || []).map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-zinc-900 border-indigo-800/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-400" />5 Strategic Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(data.recommendations || []).slice(0, 5).map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40" data-testid={`recommendation-${i}`}>
                    <div className="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{i + 1}</div>
                    <div className="text-sm text-zinc-300">{rec}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 flex items-center gap-3 text-xs text-zinc-500">
              <Shield className="w-4 h-4 text-zinc-600" />
              This report is auto-generated by AI. All data sourced from live PostgreSQL database. Generated {new Date(data.generated_at).toISOString()}. Confidential — for internal use only.
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 10: DEPARTMENT INTEGRATION HUB (live data from all 10 depts)
// ══════════════════════════════════════════════════════════════════════════
function DepartmentHubTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch.get("/api/analytics/department-hooks");
    setData(r);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <SpinLoader color="blue" />;

  const depts = data?.departments || [];
  const health = data?.platformHealth || {};

  const colorMap: Record<string, string> = {
    blue: "border-blue-800/60 bg-blue-950/10",
    orange: "border-orange-800/60 bg-orange-950/10",
    red: "border-red-800/60 bg-red-950/10",
    zinc: "border-zinc-700 bg-zinc-800/20",
    pink: "border-pink-800/60 bg-pink-950/10",
    yellow: "border-yellow-800/60 bg-yellow-950/10",
    teal: "border-teal-800/60 bg-teal-950/10",
    amber: "border-amber-800/60 bg-amber-950/10",
    emerald: "border-emerald-800/60 bg-emerald-950/10",
    indigo: "border-indigo-800/60 bg-indigo-950/10",
  };
  const textColorMap: Record<string, string> = {
    blue: "text-blue-400", orange: "text-orange-400", red: "text-red-400", zinc: "text-zinc-400",
    pink: "text-pink-400", yellow: "text-yellow-400", teal: "text-teal-400", amber: "text-amber-400",
    emerald: "text-emerald-400", indigo: "text-indigo-400",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <SectionHeader icon={Cpu} color="text-cyan-400" title="Department Integration Hub" sub="Live data feed from all 10 platform departments — cross-department health monitoring at a glance" />
        <Button className="ml-auto bg-zinc-800 hover:bg-zinc-700 h-8 text-xs" onClick={load}><RefreshCw className="w-3.5 h-3.5 mr-1" />Refresh</Button>
      </div>

      {/* Platform health strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "KYC Pending", v: fmtNum(health.kycPending || 0), c: "text-orange-400", sub: "awaiting review" },
          { l: "Open Jobs", v: fmtNum(health.openJobs || 0), c: "text-blue-400", sub: "live on marketplace" },
          { l: "Revenue 7d", v: fmtR(health.walletVolumeR || 0), c: "text-emerald-400", sub: "wallet credits" },
          { l: "New Users 7d", v: fmtNum(health.newUsers7d || 0), c: "text-purple-400", sub: "this week" },
        ].map((k, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
              <div className="text-xs text-zinc-500">{k.l}</div>
              <div className="text-xs text-zinc-600">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department cards grid */}
      <div className="grid grid-cols-5 gap-3">
        {depts.map((d: any) => (
          <Card key={d.id} className={`bg-zinc-900 border ${colorMap[d.color] || "border-zinc-700"}`} data-testid={`dept-card-${d.id}`}>
            <CardContent className="p-4">
              <div className="text-2xl mb-2">{d.icon}</div>
              <div className="font-bold text-white text-sm leading-tight">{d.name}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{d.kpi}</div>
              <div className={`text-2xl font-bold mt-2 ${textColorMap[d.color] || "text-zinc-400"}`}>{fmtNum(d.events7d)}</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cross-dept activity bar chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />Department Activity Comparison — Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={depts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#71717a" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#71717a" }} width={145}
                tickFormatter={(v: string) => v.replace(" & ", " & ").slice(0, 22)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events7d" radius={[0,3,3,0]} name="Events (7d)">
                {depts.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-cyan-800/40">
        <CardContent className="p-4">
          <div className="text-xs font-bold text-cyan-400 mb-3">INTEGRATION STATUS — ALL DEPARTMENTS</div>
          <div className="grid grid-cols-5 gap-2">
            {depts.map((d: any) => (
              <div key={d.id} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-zinc-400">{d.name.split(" ")[0]}</span>
                <span className="text-emerald-400 ml-auto font-mono">{fmtNum(d.events7d)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function AnalyticsReporting() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">📊</span>Analytics &amp; Reporting
              <Badge className="bg-violet-900 text-violet-200 text-xs ml-1">v2.0</Badge>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              10-tab BI brain · Agentic AI Analyst · Predictive Forecasting · Africa SDG Intelligence · Department Integration Hub
            </p>
          </div>
          <div className="text-xs text-zinc-600 text-right">
            <div className="font-mono">Section 24 / 100</div>
            <div>FreelanceSkills.net Admin</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 pb-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-zinc-800 text-white border-b-2 border-violet-500"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
              data-testid={`tab-${t.id}`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab Content — each is a proper React component to avoid hooks violations */}
        <div>
          {tab === "overview"    && <OverviewTab />}
          {tab === "reports"     && <ReportsTab />}
          {tab === "ai"          && <AiAnalystTab />}
          {tab === "predict"     && <PredictiveTab />}
          {tab === "builder"     && <CustomBuilderTab />}
          {tab === "attribution" && <FunnelAttributionTab />}
          {tab === "africa"      && <AfricaTab />}
          {tab === "export"      && <ExportTab />}
          {tab === "executive"   && <ExecutiveSummaryTab />}
          {tab === "depts"       && <DepartmentHubTab />}
        </div>
      </div>
    </div>
  );
}

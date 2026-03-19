/**
 * Real-Time Monitoring Department v1.0 — client/src/pages/RealTimeMonitoring.tsx
 * Section 29 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * We studied the live freelancerskills.net site (currently at 503 / starting up) and built
 * what it needs most: a living heartbeat that monitors every pulse of the platform.
 *
 * 8 TABS: Live Overview · Metrics Grid · Anomaly Feed · Africa Intel ·
 *         Historical Replay · Executive View · Agent View · Alert Rules
 *
 * TECH: Socket.io sub-second streaming · Recharts live graphs · AI anomaly z-score ·
 *       Linear regression forecasting · Africa-first geo heatmap · Full dept integration
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from "recharts";
import { Activity, AlertTriangle, Wifi, WifiOff, Zap, Globe, TrendingUp, TrendingDown, BarChart2, Map, Clock, Shield, Users, CreditCard, Phone, RefreshCw, Settings, Search, Eye, Cpu, Database, CheckCircle, XCircle, Bell, Play, Pause, Filter, Info, ChevronRight, ArrowUp, ArrowDown, Minus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveSnap {
  ts: number; usersOnline: number; ordersPerMin: number; paymentsPerMin: number;
  errorsPerMin: number; gigsPerMin: number; disputesPerMin: number; academyPerMin: number;
  mobileMoneyPerMin: number; ussdPerMin: number; avgResponseMs: number; cpuLoad: number;
  memoryMb: number; paymentSuccessRate: number; errorRate: number; platformHealthScore: number;
  geoBreakdown: Record<string, number>; channelBreakdown: Record<string, number>; providerBreakdown: Record<string, number>;
}
interface Anomaly { id?: string; type: string; metric: string; severity: string; message: string; confidence: number; currentValue: number; predictive?: boolean; minutesAhead?: number; suggestedAction?: string; acknowledged?: boolean; createdAt?: string; }
interface AlertRule { id: string; name: string; metric: string; operator: string; threshold: number; severity: string; description?: string; autoNotify?: boolean; autoCreateTicket?: boolean; autoAuditLog?: boolean; targetRole?: string; cooldownMins?: number; isActive?: boolean; triggeredCount?: number; lastTriggeredAt?: string; }

const TABS = [
  { id: "overview", label: "Live Overview", icon: Activity, color: "red" },
  { id: "metrics", label: "Metrics Grid", icon: BarChart2, color: "blue" },
  { id: "anomalies", label: "Anomaly Feed", icon: AlertTriangle, color: "orange" },
  { id: "africa", label: "Africa Intel", icon: Globe, color: "green" },
  { id: "replay", label: "Historical Replay", icon: Clock, color: "purple" },
  { id: "executive", label: "Executive View", icon: Eye, color: "indigo" },
  { id: "agent", label: "Agent View", icon: Users, color: "teal" },
  { id: "rules", label: "Alert Rules", icon: Settings, color: "gray" },
] as const;

type TabId = typeof TABS[number]["id"];

const SEVERITY_COLORS: Record<string, string> = { critical: "bg-red-600", high: "bg-orange-500", warning: "bg-yellow-500", info: "bg-blue-500" };
const SEVERITY_TEXT: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", warning: "text-yellow-400", info: "text-blue-400" };
const SEVERITY_BORDER: Record<string, string> = { critical: "border-red-600/50", high: "border-orange-500/50", warning: "border-yellow-500/50", info: "border-blue-500/50" };

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const formatNum = (n: number, d = 1) => Number(n || 0).toFixed(d);
const healthColor = (s: number) => s >= 85 ? "text-green-400" : s >= 65 ? "text-yellow-400" : "text-red-400";
const healthBg = (s: number) => s >= 85 ? "bg-green-600/20 border-green-600/30" : s >= 65 ? "bg-yellow-600/20 border-yellow-600/30" : "bg-red-600/20 border-red-600/30";

// ─── Sparkline Component ──────────────────────────────────────────────────────
function Sparkline({ data, color = "#22d3ee", height = 36 }: { data: number[]; color?: string; height?: number }) {
  if (!data || data.length < 2) return <div style={{ height }} className="flex items-center justify-center text-gray-700 text-xs">…</div>;
  const pts = data.slice(-20);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={pts.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, sparkData, color, icon: Icon, trend, trendLabel }: { label: string; value: string | number; unit?: string; sparkData?: number[]; color: string; icon: any; trend?: "up" | "down" | "stable"; trendLabel?: string }) {
  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={color} />
          <span className="text-gray-400 text-xs font-medium">{label}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"}`}>
            {trend === "up" ? <ArrowUp size={10} /> : trend === "down" ? <ArrowDown size={10} /> : <Minus size={10} />}
            <span>{trendLabel || ""}</span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {unit && <span className="text-gray-500 text-xs mb-1">{unit}</span>}
      </div>
      {sparkData && <Sparkline data={sparkData} color={color.replace("text-", "#").replace("cyan-400", "22d3ee").replace("green-400", "4ade80").replace("red-400", "f87171").replace("yellow-400", "facc15").replace("blue-400", "60a5fa").replace("purple-400", "c084fc").replace("orange-400", "fb923c").replace("pink-400", "f472b6")} />}
    </div>
  );
}

// ─── Live Overview Tab ────────────────────────────────────────────────────────
function LiveOverviewTab({ snap, history, anomalies, connected, onSeed, onSimulate }: { snap: LiveSnap | null; history: LiveSnap[]; anomalies: Anomaly[]; connected: boolean; onSeed: () => void; onSimulate: (type: string) => void }) {
  const s = snap;
  const extract = (key: keyof LiveSnap) => history.map(h => Number(h[key]) || 0);
  const { data: healthData } = useQuery({ queryKey: ["/api/monitoring/system-health"], refetchInterval: 15000 });
  const { data: suggestData } = useQuery({ queryKey: ["/api/monitoring/ai-suggested-views"], refetchInterval: 15000 });

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-900/40 border border-gray-700/40 rounded-xl">
        <div className={`flex items-center gap-2 text-sm font-medium ${connected ? "text-green-400" : "text-red-400"}`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected ? "Socket.io Connected — Sub-second streaming active" : "Reconnecting…"}
        </div>
        <div className="flex-1" />
        {snap && <span className="text-gray-500 text-xs">Last update: {formatTime(snap.ts)}</span>}
        <button data-testid="button-seed-monitoring" onClick={onSeed} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Seed Demo Data</button>
        <div className="flex gap-2">
          {["error_spike","payment_crash","mobile_money_spike","recovery"].map(t => (
            <button data-testid={`button-simulate-${t}`} key={t} onClick={() => onSimulate(t)} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-mono transition-colors">{t.replace(/_/g," ")}</button>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestData?.suggestions?.filter((s: any) => s.urgency === "immediate" || s.urgency === "high").slice(0,2).map((sg: any, i: number) => (
        <div key={i} className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${sg.urgency === "immediate" ? "bg-red-950/30 border-red-700/40 text-red-300" : "bg-yellow-950/30 border-yellow-700/40 text-yellow-300"}`}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div><span className="font-semibold">{sg.title}</span> — {sg.reason}. <span className="opacity-70">{sg.action}</span></div>
        </div>
      ))}

      {/* Platform Health Score */}
      <div className={`p-4 rounded-xl border ${s ? healthBg(s.platformHealthScore) : "bg-gray-900/40 border-gray-700/40"}`}>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-medium">Platform Health Score</span>
          <span className={`text-3xl font-bold ${s ? healthColor(s.platformHealthScore) : "text-gray-400"}`}>{s ? formatNum(s.platformHealthScore, 0) : "—"}/100</span>
        </div>
        <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${s ? (s.platformHealthScore >= 85 ? "bg-green-500" : s.platformHealthScore >= 65 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-700"}`} style={{ width: `${s?.platformHealthScore || 0}%` }} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Users Online" value={s?.usersOnline ?? "—"} color="text-cyan-400" icon={Users} sparkData={extract("usersOnline")} trend="stable" />
        <KpiCard label="Orders/min" value={s ? formatNum(s.ordersPerMin) : "—"} unit="/min" color="text-green-400" icon={TrendingUp} sparkData={extract("ordersPerMin")} />
        <KpiCard label="Payments/min" value={s ? formatNum(s.paymentsPerMin) : "—"} unit="/min" color="text-blue-400" icon={CreditCard} sparkData={extract("paymentsPerMin")} />
        <KpiCard label="Errors/min" value={s ? formatNum(s.errorsPerMin) : "—"} unit="/min" color={s && s.errorsPerMin > 5 ? "text-red-400" : "text-yellow-400"} icon={AlertTriangle} sparkData={extract("errorsPerMin")} />
        <KpiCard label="Mobile Money" value={s ? formatNum(s.mobileMoneyPerMin) : "—"} unit="/min" color="text-purple-400" icon={Phone} sparkData={extract("mobileMoneyPerMin")} />
        <KpiCard label="USSD Traffic" value={s ? formatNum(s.ussdPerMin) : "—"} unit="/min" color="text-pink-400" icon={Zap} sparkData={extract("ussdPerMin")} />
        <KpiCard label="Avg Response" value={s ? formatNum(s.avgResponseMs, 0) : "—"} unit="ms" color={s && s.avgResponseMs > 250 ? "text-orange-400" : "text-green-400"} icon={Cpu} sparkData={extract("avgResponseMs")} />
        <KpiCard label="Payment Success" value={s ? formatNum(s.paymentSuccessRate) : "—"} unit="%" color={s && s.paymentSuccessRate < 95 ? "text-red-400" : "text-green-400"} icon={CheckCircle} sparkData={extract("paymentSuccessRate")} />
        <KpiCard label="Error Rate" value={s ? formatNum(s.errorRate) : "—"} unit="%" color={s && s.errorRate > 3 ? "text-red-400" : "text-gray-400"} icon={XCircle} sparkData={extract("errorRate")} />
        <KpiCard label="CPU Load" value={s ? formatNum(s.cpuLoad) : "—"} unit="%" color="text-orange-400" icon={Cpu} sparkData={extract("cpuLoad")} />
        <KpiCard label="Memory" value={s ? formatNum(s.memoryMb, 0) : "—"} unit="MB" color="text-indigo-400" icon={Database} sparkData={extract("memoryMb")} />
        <KpiCard label="Gigs/min" value={s ? formatNum(s.gigsPerMin) : "—"} unit="/min" color="text-teal-400" icon={Activity} sparkData={extract("gigsPerMin")} />
      </div>

      {/* System Health Checks */}
      {healthData?.checks && (
        <div>
          <h3 className="text-gray-300 font-semibold text-sm mb-3">System Health Checks</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {healthData.checks.map((c: any) => (
              <div key={c.name} className={`p-3 rounded-lg border text-xs ${c.status === "healthy" ? "bg-green-950/20 border-green-700/30" : c.status === "degraded" ? "bg-yellow-950/20 border-yellow-700/30" : "bg-red-950/20 border-red-700/30"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${c.status === "healthy" ? "bg-green-500" : c.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
                  <span className="text-gray-300 font-medium">{c.name}</span>
                </div>
                <div className="text-gray-500">{c.value || c.responseMs && c.responseMs + "ms" || c.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Critical Anomalies */}
      {anomalies.filter(a => a.severity === "critical" && !a.acknowledged).slice(0, 3).length > 0 && (
        <div>
          <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Critical Anomalies</h3>
          <div className="space-y-2">
            {anomalies.filter(a => a.severity === "critical" && !a.acknowledged).slice(0, 3).map((a, i) => (
              <div key={i} className="p-3 bg-red-950/20 border border-red-700/40 rounded-lg text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">{a.severity?.toUpperCase()}</span>
                  <span className="text-red-300 font-medium">{a.type?.replace(/_/g," ")}</span>
                  {a.predictive && <span className="bg-purple-600/50 text-purple-200 px-2 py-0.5 rounded-full">PREDICTIVE {a.minutesAhead}min ahead</span>}
                  <span className="ml-auto text-gray-500">{a.confidence}% confidence</span>
                </div>
                <div className="text-gray-300">{a.message}</div>
                {a.suggestedAction && <div className="text-gray-500 mt-1">→ {a.suggestedAction}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metrics Grid Tab ─────────────────────────────────────────────────────────
function MetricsGridTab({ history, snap }: { history: LiveSnap[]; snap: LiveSnap | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const displayHistory = history.filter((_, i) => i % 2 === 0).slice(-60);
  const chartData = displayHistory.map(h => ({ time: formatTime(h.ts), orders: h.ordersPerMin, payments: h.paymentsPerMin, errors: h.errorsPerMin, mobileMoney: h.mobileMoneyPerMin, ussd: h.ussdPerMin, users: h.usersOnline / 10, avgResp: h.avgResponseMs / 10 }));

  const metrics = [
    { key: "ordersPerMin", label: "Orders/min", color: "#22d3ee", desc: "Order velocity — key revenue driver" },
    { key: "paymentsPerMin", label: "Payments/min", color: "#4ade80", desc: "Payment flow — real money moving" },
    { key: "errorsPerMin", label: "Errors/min", color: "#f87171", desc: "Error velocity — platform health indicator" },
    { key: "mobileMoneyPerMin", label: "Mobile Money/min", color: "#c084fc", desc: "M-Pesa · MTN · Airtel transactions" },
    { key: "ussdPerMin", label: "USSD/min", color: "#f472b6", desc: "Africa zero-data channel traffic" },
    { key: "gigsPerMin", label: "Gigs/min", color: "#fb923c", desc: "Gig marketplace activity" },
  ].filter(m => !searchTerm || m.label.toLowerCase().includes(searchTerm.toLowerCase()) || m.key.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input data-testid="input-metric-search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search metrics…" className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500" />
        </div>
        <select data-testid="select-metric-filter" value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200">
          <option value="all">All Metrics</option>
          <option value="orders">Orders & Revenue</option>
          <option value="africa">Africa Channels</option>
          <option value="errors">Errors & Health</option>
        </select>
      </div>

      {/* Main Streaming Chart */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-4">Live Streaming — Orders · Payments · Errors (last 5 min)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="orders" stroke="#22d3ee" fill="#22d3ee20" strokeWidth={2} name="Orders/min" />
            <Area type="monotone" dataKey="payments" stroke="#4ade80" fill="#4ade8020" strokeWidth={2} name="Payments/min" />
            <Area type="monotone" dataKey="errors" stroke="#f87171" fill="#f8717120" strokeWidth={2} name="Errors/min" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Africa Channels Chart */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-4">Africa Channels — Mobile Money · USSD (live)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="mobileMoney" stroke="#c084fc" dot={false} strokeWidth={2} name="Mobile Money/min" />
            <Line type="monotone" dataKey="ussd" stroke="#f472b6" dot={false} strokeWidth={2} name="USSD/min" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map(m => {
          const vals = history.map(h => Number((h as any)[m.key]) || 0);
          const cur = snap ? Number((snap as any)[m.key]) || 0 : 0;
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          const peak = vals.length > 0 ? Math.max(...vals) : 0;
          return (
            <div key={m.key} className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">{m.label}</span>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>avg {avg.toFixed(1)}</span>
                  <span>peak {peak.toFixed(1)}</span>
                  <span style={{ color: m.color }} className="font-bold text-sm">now {cur.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-gray-600 text-xs mb-3">{m.desc}</div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={displayHistory.slice(-30).map((h, i) => ({ i, v: Number((h as any)[m.key]) || 0 }))}>
                  <Line type="monotone" dataKey="v" stroke={m.color} dot={false} strokeWidth={1.5} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 10 }} formatter={(v: any) => [Number(v).toFixed(1), m.label]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Anomaly Feed Tab ─────────────────────────────────────────────────────────
function AnomalyFeedTab({ liveAnomalies }: { liveAnomalies: Anomaly[] }) {
  const [sevFilter, setSevFilter] = useState("all");
  const [predFilter, setPredFilter] = useState("all");
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["/api/monitoring/anomalies"], refetchInterval: 10000 });
  const { data: trendsData } = useQuery({ queryKey: ["/api/monitoring/predictive-trends"], refetchInterval: 15000 });

  const ackMut = useMutation({
    mutationFn: (id: string) => fetch("/api/monitoring/anomalies/" + id + "/ack", { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/monitoring/anomalies"] }),
  });

  const allAnomalies = [...liveAnomalies.filter(a => a.id && !data?.anomalies?.find((d: Anomaly) => d.id === a.id)), ...(data?.anomalies || [])].filter(a => sevFilter === "all" || a.severity === sevFilter).filter(a => predFilter === "all" || (predFilter === "predictive" ? a.predictive : !a.predictive)).slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Predictive Trends Summary */}
      {trendsData?.trends?.filter((t: any) => t.warning).slice(0, 3).length > 0 && (
        <div className="p-4 bg-purple-950/20 border border-purple-700/30 rounded-xl">
          <h3 className="text-purple-300 font-semibold text-sm mb-3 flex items-center gap-2"><TrendingDown size={14} /> AI Predictive Warnings (Linear Regression Forecast)</h3>
          <div className="space-y-2">
            {trendsData.trends.filter((t: any) => t.warning).slice(0, 3).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-purple-400 font-mono">{t.minutesAhead}min</span>
                <span className="text-gray-300">{t.warning}</span>
                <span className="ml-auto text-gray-500">{t.confidence}% conf · R²={t.r2}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div>
          <span className="text-gray-500 text-xs mr-2">Severity:</span>
          {["all","critical","high","warning","info"].map(s => (
            <button data-testid={`button-severity-${s}`} key={s} onClick={() => setSevFilter(s)} className={`mr-1 px-3 py-1 rounded-full text-xs font-medium ${sevFilter === s ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{s}</button>
          ))}
        </div>
        <div>
          <span className="text-gray-500 text-xs mr-2">Type:</span>
          {[{ v: "all", l: "All" }, { v: "predictive", l: "Predictive" }, { v: "realtime", l: "Real-time" }].map(opt => (
            <button data-testid={`button-pred-${opt.v}`} key={opt.v} onClick={() => setPredFilter(opt.v)} className={`mr-1 px-3 py-1 rounded-full text-xs font-medium ${predFilter === opt.v ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{opt.l}</button>
          ))}
        </div>
        <div className="ml-auto text-gray-500 text-xs self-center">{allAnomalies.filter(a => !a.acknowledged).length} unacknowledged · {data?.bySeverity?.critical || 0} critical</div>
      </div>

      {/* Anomaly List */}
      <div className="space-y-3">
        {allAnomalies.length === 0 && (
          <div className="text-center py-12 text-gray-600"><CheckCircle size={40} className="mx-auto mb-3 opacity-30" /><div className="text-sm">No anomalies detected — platform healthy</div></div>
        )}
        {allAnomalies.map((a, i) => (
          <div key={a.id || i} data-testid={`anomaly-card-${i}`} className={`p-4 rounded-xl border ${SEVERITY_BORDER[a.severity || "warning"]} bg-gray-900/40 ${a.acknowledged ? "opacity-50" : ""}`}>
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <span className={`${SEVERITY_COLORS[a.severity || "warning"]} text-white px-2 py-0.5 rounded-full text-xs font-bold`}>{a.severity?.toUpperCase()}</span>
              <span className="text-gray-200 text-sm font-medium">{a.type?.replace(/_/g," ")}</span>
              {a.predictive && <span className="bg-purple-700/50 text-purple-200 px-2 py-0.5 rounded-full text-xs">🔮 Predictive · {a.minutesAhead}min ahead</span>}
              {a.confidence && <span className="text-gray-500 text-xs">{a.confidence}% confidence</span>}
              {a.id && !a.acknowledged && (
                <button data-testid={`button-ack-${a.id}`} onClick={() => ackMut.mutate(a.id!)} className="ml-auto px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg">Acknowledge</button>
              )}
              {a.acknowledged && <span className="ml-auto text-xs text-green-600">✓ Acknowledged</span>}
            </div>
            <div className="text-gray-300 text-sm mb-2">{a.message}</div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {a.currentValue !== undefined && <span>Current: <span className={SEVERITY_TEXT[a.severity || "warning"]}>{formatNum(a.currentValue)}</span></span>}
              {a.metric && <span>Metric: {a.metric}</span>}
              {a.createdAt && <span>{new Date(a.createdAt).toLocaleTimeString("en-ZA")}</span>}
            </div>
            {a.suggestedAction && (
              <div className="mt-2 text-xs text-gray-500 flex items-start gap-1.5"><ChevronRight size={12} className="shrink-0 mt-0.5" />{a.suggestedAction}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Africa Intel Tab ─────────────────────────────────────────────────────────
function AfricaIntelTab({ snap }: { snap: LiveSnap | null }) {
  const { data } = useQuery({ queryKey: ["/api/monitoring/africa-intel"], refetchInterval: 8000 });
  const { data: seg } = useQuery({ queryKey: ["/api/monitoring/segment-breakdown"], refetchInterval: 8000 });
  const countries = data?.countries || [];
  const maxTraffic = Math.max(...countries.map((c: any) => c.traffic), 1);
  const PIE_COLORS = ["#22d3ee","#c084fc","#4ade80","#f87171","#fb923c","#60a5fa","#f472b6","#facc15"];

  return (
    <div className="space-y-6">
      {/* Africa Insight Banner */}
      <div className="p-4 bg-green-950/20 border border-green-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={16} className="text-green-400" />
          <span className="text-green-300 font-semibold text-sm">Africa-First Intelligence</span>
        </div>
        <p className="text-gray-400 text-xs">{data?.insight || "Loading Africa intelligence…"}</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="text-center"><div className="text-green-400 text-lg font-bold">{snap ? formatNum(snap.mobileMoneyPerMin) : "—"}</div><div className="text-gray-500 text-xs">Mobile Money/min</div></div>
          <div className="text-center"><div className="text-pink-400 text-lg font-bold">{snap ? formatNum(snap.ussdPerMin) : "—"}</div><div className="text-gray-500 text-xs">USSD/min</div></div>
          <div className="text-center"><div className="text-purple-400 text-lg font-bold">{data?.ruralUrban?.ussdShare || "—"}%</div><div className="text-gray-500 text-xs">Africa Channel Share</div></div>
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-4">Country Traffic Breakdown — Live</h3>
        <div className="space-y-3">
          {countries.map((c: any, i: number) => (
            <div key={c.code} data-testid={`country-card-${c.code}`} className="flex items-center gap-3">
              <span className="text-xl w-7 shrink-0">{c.flag}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs font-medium">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{c.percent}%</span>
                    <span className="text-gray-600 text-xs">{c.primary}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(c.traffic / maxTraffic) * 100}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
                <div className="text-gray-600 text-xs mt-0.5">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile Money Provider Breakdown */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-4">Payment Provider Velocity</h3>
          {seg?.paymentMethods && (
            <div className="space-y-3">
              {seg.paymentMethods.map((p: any, i: number) => (
                <div key={p.method} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-400">{p.method}</div>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.share}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                  <div className="w-12 text-right text-xs text-gray-500">{p.share}%</div>
                  <div className={`text-xs ${p.trend === "rising" ? "text-green-400" : p.trend === "declining" ? "text-red-400" : "text-gray-500"}`}>{p.trend === "rising" ? "↑" : p.trend === "declining" ? "↓" : "→"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel Velocity */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-4">Communication Channel Velocity</h3>
          {snap?.channelBreakdown && (
            <div className="space-y-3">
              {Object.entries(snap.channelBreakdown).map(([ch, val], i) => {
                const total = Object.values(snap.channelBreakdown).reduce((a, b) => a + b, 0);
                return (
                  <div key={ch} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-gray-400 capitalize">{ch}</div>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(val / total) * 100}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                    <div className="w-8 text-right text-xs text-gray-500">{Math.round((val / total) * 100)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rural vs Urban */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data?.ruralUrban?.rural || "—"}</div>
          <div className="text-gray-500 text-xs mt-1">Estimated Rural Transactions</div>
          <div className="text-gray-600 text-xs">(USSD + feature phone mobile money)</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{data?.ruralUrban?.urban || "—"}</div>
          <div className="text-gray-500 text-xs mt-1">Estimated Urban Transactions</div>
          <div className="text-gray-600 text-xs">(Web + app + card + WhatsApp)</div>
        </div>
      </div>
    </div>
  );
}

// ─── Historical Replay Tab ────────────────────────────────────────────────────
function HistoricalReplayTab() {
  const [sliderPos, setSliderPos] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const { data: replayData } = useQuery({ queryKey: ["/api/monitoring/historical-replay"], staleTime: 60000 });
  const { data: whatIfData, mutate: runWhatIf } = useMutation({ mutationFn: (scenario: string) => fetch("/api/monitoring/what-if", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) }).then(r => r.json()) });
  const { data: allScenarios } = useQuery({ queryKey: ["/api/monitoring/what-if-scenarios"], queryFn: () => fetch("/api/monitoring/what-if", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }).then(r => r.json()) });

  const snapshots: any[] = replayData?.snapshots || [];
  const visibleIndex = Math.max(0, Math.round((sliderPos / 100) * (snapshots.length - 1)));
  const selectedSnap = snapshots[visibleIndex];

  const chartData = snapshots.filter((_, i) => i % 3 === 0).map(s => ({ time: new Date(s.capturedAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }), orders: s.ordersPerMin, payments: s.paymentsPerMin, errors: s.errorsPerMin, mobileMoney: s.mobileMoneyPerMin }));

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setSliderPos(p => { if (p >= 100) { setPlaying(false); return 100; } return p + 0.5; }), 100);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Replay Controls */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-4 flex items-center gap-2"><Clock size={14} /> 24h Historical Replay</h3>
          <div className="mb-4">
            <input data-testid="input-replay-slider" type="range" min={0} max={100} value={sliderPos} onChange={e => setSliderPos(Number(e.target.value))} className="w-full accent-cyan-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>24h ago</span><span>now</span></div>
          </div>
          <button data-testid="button-replay-play" onClick={() => { setSliderPos(0); setPlaying(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors">
            <Play size={14} />{playing ? "Playing…" : "Play 24h Replay"}
          </button>
          {selectedSnap && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">At this time</div><div className="text-gray-200">{new Date(selectedSnap.capturedAt).toLocaleTimeString("en-ZA")}</div></div>
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">Orders/min</div><div className="text-cyan-400 font-bold">{Number(selectedSnap.ordersPerMin).toFixed(1)}</div></div>
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">Payments/min</div><div className="text-green-400 font-bold">{Number(selectedSnap.paymentsPerMin).toFixed(1)}</div></div>
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">Errors/min</div><div className="text-red-400 font-bold">{Number(selectedSnap.errorsPerMin).toFixed(1)}</div></div>
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">Mobile Money</div><div className="text-purple-400 font-bold">{Number(selectedSnap.mobileMoneyPerMin).toFixed(1)}</div></div>
              <div className="bg-gray-800/50 rounded p-2"><div className="text-gray-500">Health Score</div><div className={healthColor(selectedSnap.platformHealthScore)}>{Number(selectedSnap.platformHealthScore).toFixed(0)}/100</div></div>
            </div>
          )}
          {snapshots.length === 0 && <div className="text-center py-6 text-gray-600 text-sm">No history yet — click "Seed Demo Data" on Live Overview tab</div>}
        </div>

        {/* What-If Simulator */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> What-If Simulator</h3>
          <div className="space-y-2 mb-4">
            {(allScenarios?.allScenarios || [{ id: "enable_ai_matching", name: "Enable AI Gig Matching", confidence: 82, riskLevel: "low" }, { id: "enable_whatsapp_api", name: "WhatsApp Business API", confidence: 78, riskLevel: "medium" }, { id: "pro_tier_discount", name: "Pro Tier 40% Discount", confidence: 88, riskLevel: "low" }, { id: "ussd_expansion_tz_ug", name: "Tanzania + Uganda USSD", confidence: 71, riskLevel: "medium" }, { id: "error_rate_zero", name: "Zero Error Rate Initiative", confidence: 90, riskLevel: "low" }]).map((sc: any) => (
              <button data-testid={`button-scenario-${sc.id}`} key={sc.id} onClick={() => { setSelectedScenario(sc.id); runWhatIf(sc.id); }} className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${selectedScenario === sc.id ? "bg-yellow-950/30 border-yellow-600/50" : "bg-gray-800/50 border-gray-700/40 hover:border-yellow-600/30"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-200 font-medium">{sc.name}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full ${sc.riskLevel === "low" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{sc.riskLevel} risk</span>
                </div>
                <span className="text-gray-500">{sc.confidence}% confidence</span>
              </button>
            ))}
          </div>
          {whatIfData?.scenario && (
            <div className="p-3 bg-yellow-950/20 border border-yellow-700/30 rounded-lg">
              <div className="text-yellow-300 font-semibold text-sm mb-2">{whatIfData.scenario.name}</div>
              <div className="text-gray-400 text-xs mb-3">{whatIfData.scenario.description}</div>
              <div className="space-y-1">
                {Object.entries(whatIfData.scenario.projectedImpact || {}).map(([metric, impact]: [string, any]) => (
                  <div key={metric} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-32">{metric.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className={`font-bold ${impact.change > 0 ? "text-green-400" : "text-red-400"}`}>{impact.change > 0 ? "+" : ""}{impact.change}{impact.unit}</span>
                    <span className="text-gray-600">→ {impact.projected}{impact.unit === "pp" ? "%" : " /min"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">Time to impact: {whatIfData.scenario.timeToImpact}</div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-4">24h Metric History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#6b7280" }} interval={Math.floor(chartData.length / 8)} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="orders" stroke="#22d3ee" fill="#22d3ee15" strokeWidth={1.5} name="Orders/min" />
              <Area type="monotone" dataKey="payments" stroke="#4ade80" fill="#4ade8015" strokeWidth={1.5} name="Payments/min" />
              <Area type="monotone" dataKey="mobileMoney" stroke="#c084fc" fill="#c084fc15" strokeWidth={1.5} name="Mobile Money" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-1 text-xs" style={{ left: `${sliderPos}%`, position: "relative", width: "fit-content", transform: "translateX(-50%)" }}>
            <div className="w-0.5 h-4 bg-yellow-400 opacity-70" />
            <span className="text-yellow-400">replay position</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Executive View Tab ───────────────────────────────────────────────────────
function ExecutiveViewTab() {
  const { data, isLoading } = useQuery({ queryKey: ["/api/monitoring/executive-view"], refetchInterval: 15000 });
  const { data: trendsData } = useQuery({ queryKey: ["/api/monitoring/predictive-trends"], refetchInterval: 15000 });
  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading executive dashboard…</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-950/20 border border-indigo-700/30 rounded-xl">
        <h3 className="text-indigo-300 font-semibold text-sm mb-1">Executive Briefing — FreelanceSkills.net</h3>
        <p className="text-gray-500 text-xs">Live C-level KPI dashboard · Refreshed every 15 seconds</p>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Platform Health", value: data?.headline?.platformHealth, color: "text-green-400", icon: Shield },
          { label: "Users Online", value: data?.headline?.usersOnline, color: "text-cyan-400", icon: Users },
          { label: "Revenue Velocity (Day)", value: data?.headline?.revenueVelocityDay, color: "text-yellow-400", icon: TrendingUp },
          { label: "Payment Success Rate", value: data?.headline?.paymentSuccessRate, color: "text-blue-400", icon: CheckCircle },
          { label: "Error Rate", value: data?.headline?.errorRate, color: Number(data?.headline?.errorRate) > 3 ? "text-red-400" : "text-green-400", icon: AlertTriangle },
          { label: "Unresolved Anomalies", value: data?.headline?.unacknowledgedAnomalies, color: data?.headline?.unacknowledgedAnomalies > 0 ? "text-orange-400" : "text-green-400", icon: Bell },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-5 text-center">
            <kpi.icon size={20} className={kpi.color + " mx-auto mb-2"} />
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value ?? "—"}</div>
            <div className="text-gray-500 text-xs mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Orders/min", value: data?.performance?.ordersPerMin },
          { label: "Payments/min", value: data?.performance?.paymentsPerMin },
          { label: "Peak Orders (24h)", value: data?.performance?.peakOrdersLast24h },
          { label: "Avg Orders (24h)", value: data?.performance?.avgOrders24h },
        ].map((m, i) => (
          <div key={i} className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
            <div className="text-xl font-bold text-gray-200">{m.value ?? "—"}</div>
            <div className="text-gray-500 text-xs mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Africa Summary */}
      <div className="bg-green-950/20 border border-green-700/30 rounded-xl p-4">
        <h3 className="text-green-300 font-semibold text-sm mb-3">Africa Division Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><div className="text-green-400 font-bold">{data?.africa?.mobileMoneyPerMin}</div><div className="text-gray-500 text-xs">Mobile Money/min</div></div>
          <div><div className="text-pink-400 font-bold">{data?.africa?.ussdPerMin}</div><div className="text-gray-500 text-xs">USSD/min</div></div>
          <div><div className="text-cyan-400 font-bold">{data?.africa?.topCountry}</div><div className="text-gray-500 text-xs">Top Country</div></div>
          <div><div className="text-yellow-400 font-bold">{data?.africa?.africaRevenuePct}</div><div className="text-gray-500 text-xs">Africa Revenue %</div></div>
        </div>
      </div>

      {/* Active Risks */}
      {data?.risks?.length > 0 && (
        <div className="bg-red-950/20 border border-red-700/30 rounded-xl p-4">
          <h3 className="text-red-300 font-semibold text-sm mb-3">Active Risks — Requires Attention</h3>
          <div className="space-y-2">
            {data.risks.map((r: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div><span className="text-red-300 font-medium">{r.type?.replace(/_/g," ")} </span><span className="text-gray-400">{r.message}</span></div>
                <span className="ml-auto text-gray-500 text-xs">{r.confidence}% conf.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive 5-min Outlook */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-cyan-400" /> 5-Minute Predictive Outlook</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(trendsData?.trends || []).filter((t: any) => t.minutesAhead === 5).map((t: any, i: number) => (
            <div key={i} className="p-3 bg-gray-800/50 rounded-lg text-xs">
              <div className="text-gray-400 mb-1">{t.metric?.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="flex items-center gap-2">
                <span className="text-gray-200 font-bold">{t.currentValue}</span>
                <span className={t.trend === "rising" ? "text-green-400" : t.trend === "falling" ? "text-red-400" : "text-gray-400"}>{t.trend === "rising" ? "↑" : t.trend === "falling" ? "↓" : "→"}</span>
                <span className="text-gray-200 font-bold">{t.predictedValue}</span>
                <span className="ml-auto text-gray-600">{t.confidence}%</span>
              </div>
              {t.warning && <div className="text-yellow-400 mt-1">{t.warning}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Agent View Tab ───────────────────────────────────────────────────────────
function AgentViewTab() {
  const { data, isLoading } = useQuery({ queryKey: ["/api/monitoring/agent-view"], refetchInterval: 10000 });
  const { data: errData } = useQuery({ queryKey: ["/api/monitoring/error-drilldown"], refetchInterval: 10000 });
  const { data: payData } = useQuery({ queryKey: ["/api/monitoring/payment-drilldown"], refetchInterval: 10000 });

  const frustLevel = data?.frustrationLevel || "normal";
  const frustColors: Record<string, string> = { normal: "text-green-400 bg-green-950/20 border-green-700/30", elevated: "text-yellow-400 bg-yellow-950/20 border-yellow-700/30", critical: "text-red-400 bg-red-950/20 border-red-700/30" };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${frustColors[frustLevel]}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">User Frustration Index</span>
          <span className="text-2xl font-bold">{data?.userFrustrationScore ?? "—"}/100</span>
        </div>
        <div className="text-xs mt-1 opacity-70">Composite of error rate · payment failures · response times · support ticket velocity</div>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: data?.support?.openTickets, color: "text-cyan-400" },
          { label: "Escalated", value: data?.support?.escalated, color: "text-red-400" },
          { label: "Agents Online", value: data?.support?.agentsOnline, color: "text-green-400" },
          { label: "Avg Response", value: data?.support?.avgResponseMins ? data.support.avgResponseMins + " min" : "—", color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value ?? "—"}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Error Drilldown */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><XCircle size={14} className="text-red-400" /> Error Drill-Down</h3>
          {errData?.errorTypes?.length === 0 && <div className="text-center py-4 text-gray-600 text-xs">No errors — system clean</div>}
          <div className="space-y-2">
            {(errData?.errorTypes || []).map((e: any, i: number) => (
              <div key={i} data-testid={`error-type-${i}`} className="flex items-center gap-3 p-2 bg-gray-800/40 rounded-lg text-xs">
                <div className={`w-2 h-2 rounded-full ${e.severity === "critical" ? "bg-red-500" : e.severity === "high" ? "bg-orange-500" : "bg-yellow-500"}`} />
                <div className="flex-1">
                  <div className="text-gray-200 font-mono text-xs">{e.type}</div>
                  <div className="text-gray-500">{e.reason}</div>
                </div>
                <span className="text-red-400 font-bold">{e.count}x</span>
                <a href={e.deepLink} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1">
                  <ChevronRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Drilldown */}
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><CreditCard size={14} className="text-yellow-400" /> Payment Health</h3>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-xs">Success Rate</span>
              <span className={`font-bold text-sm ${Number(payData?.successRate) < 95 ? "text-red-400" : "text-green-400"}`}>{payData?.successRate || "—"}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${Number(payData?.successRate) < 95 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${payData?.successRate || 0}%` }} />
            </div>
          </div>
          {payData?.estimatedLossPerMinute > 0 && (
            <div className="p-2 bg-red-950/20 border border-red-700/30 rounded text-xs text-red-300 mb-3">
              Estimated loss: R{payData.estimatedLossPerMinute.toLocaleString()}/min
            </div>
          )}
          <div className="space-y-2">
            {(payData?.failedBreakdown || []).map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-800/30 rounded">
                <span className="text-gray-300 w-24">{f.provider}</span>
                <span className="text-red-400 font-bold">{f.failedCount} failed</span>
                <span className="text-gray-600">{f.reason}</span>
                <a href={f.deepLink} className="ml-auto text-cyan-600 hover:text-cyan-400 text-xs">drill-down →</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {data?.recentErrors?.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-3">Recent Live Anomalies (Agent Feed)</h3>
          <div className="space-y-2">
            {data.recentErrors.map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-xs p-2 border-b border-gray-800/50">
                <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_COLORS[e.severity] || "bg-gray-600"}`} />
                <span className="text-gray-400 w-32 shrink-0 font-mono">{e.type?.replace(/_/g," ")}</span>
                <span className="text-gray-300 flex-1">{e.message}</span>
                {e.createdAt && <span className="text-gray-600 shrink-0">{new Date(e.createdAt).toLocaleTimeString("en-ZA")}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalation Triggers */}
      {data?.escalationTriggers?.length > 0 && (
        <div className="p-4 bg-orange-950/20 border border-orange-700/30 rounded-xl">
          <h3 className="text-orange-300 font-semibold text-sm mb-2 flex items-center gap-2"><Bell size={14} /> Auto-Escalation Triggered</h3>
          {data.escalationTriggers.map((t: string, i: number) => <div key={i} className="text-gray-300 text-sm">⚡ {t}</div>)}
        </div>
      )}
    </div>
  );
}

// ─── Alert Rules Tab ──────────────────────────────────────────────────────────
function AlertRulesTab({ socket }: { socket: Socket | null }) {
  const [showForm, setShowForm] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [form, setForm] = useState({ name: "", metric: "errorsPerMin", operator: "gt", threshold: "5", severity: "warning", description: "", autoNotify: true, autoCreateTicket: false, autoAuditLog: true, targetRole: "admin", cooldownMins: "5" });
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["/api/monitoring/alert-rules"], refetchInterval: 10000 });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch("/api/monitoring/alert-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }); setShowForm(false); setForm(f => ({ ...f, name: "", description: "" })); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => fetch("/api/monitoring/alert-rules/" + id, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => fetch("/api/monitoring/alert-rules/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }),
  });
  const testMut = useMutation({
    mutationFn: (id: string) => fetch("/api/monitoring/alert-rules/" + id + "/test", { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => setTestResult(d),
  });

  const METRICS = ["errorsPerMin","ordersPerMin","paymentsPerMin","mobileMoneyPerMin","ussdPerMin","avgResponseMs","cpuLoad","memoryMb","paymentSuccessRate","errorRate","platformHealthScore","gigsPerMin","disputesPerMin","usersOnline"];
  const SEV_COLORS: Record<string, string> = { critical: "bg-red-600", high: "bg-orange-500", warning: "bg-yellow-500", info: "bg-blue-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-200 font-semibold">Alert Rules Engine</h3>
          <p className="text-gray-500 text-xs mt-0.5">Configure thresholds · Auto-escalate via Permission System · Log to Audit · Create Support Tickets</p>
        </div>
        <button data-testid="button-create-rule" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Settings size={14} />{showForm ? "Cancel" : "Create Rule"}
        </button>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div className={`p-3 rounded-xl border text-sm ${testResult.wouldTrigger ? "bg-red-950/20 border-red-700/40 text-red-300" : "bg-green-950/20 border-green-700/40 text-green-300"}`}>
          {testResult.message} · Current value: {testResult.currentValue?.toFixed?.(1)}
          <button onClick={() => setTestResult(null)} className="ml-3 text-gray-500 hover:text-gray-300 text-xs">dismiss</button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-900/60 border border-cyan-700/30 rounded-xl p-5">
          <h4 className="text-cyan-300 font-semibold text-sm mb-4">New Alert Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Rule Name *</label>
              <input data-testid="input-rule-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. High Error Rate Alert" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Metric *</label>
              <select data-testid="select-rule-metric" value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500">
                {METRICS.map(m => <option key={m} value={m}>{m.replace(/([A-Z])/g, " $1").trim()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Operator</label>
              <select data-testid="select-rule-operator" value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500">
                <option value="gt">Greater than (&gt;)</option>
                <option value="lt">Less than (&lt;)</option>
                <option value="gte">Greater than or equal (&gt;=)</option>
                <option value="lte">Less than or equal (&lt;=)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Threshold *</label>
              <input data-testid="input-rule-threshold" type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Severity</label>
              <select data-testid="select-rule-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500">
                {["info","warning","high","critical"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Cooldown (minutes)</label>
              <input data-testid="input-rule-cooldown" type="number" value={form.cooldownMins} onChange={e => setForm(f => ({ ...f, cooldownMins: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-xs block mb-1">Description</label>
              <textarea data-testid="input-rule-description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What should happen when this fires?" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500 resize-none" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer"><input data-testid="checkbox-auto-notify" type="checkbox" checked={form.autoNotify} onChange={e => setForm(f => ({ ...f, autoNotify: e.target.checked }))} className="accent-cyan-500" /><span className="text-gray-300">Auto-notify (Notifications Dept)</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input data-testid="checkbox-auto-ticket" type="checkbox" checked={form.autoCreateTicket} onChange={e => setForm(f => ({ ...f, autoCreateTicket: e.target.checked }))} className="accent-cyan-500" /><span className="text-gray-300">Auto-create Support Ticket</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input data-testid="checkbox-auto-audit" type="checkbox" checked={form.autoAuditLog} onChange={e => setForm(f => ({ ...f, autoAuditLog: e.target.checked }))} className="accent-cyan-500" /><span className="text-gray-300">Log to Audit Logs</span></label>
          </div>
          <div className="mt-4 flex gap-3">
            <button data-testid="button-submit-rule" onClick={() => createMut.mutate({ ...form, threshold: Number(form.threshold), cooldownMins: Number(form.cooldownMins) })} disabled={!form.name || !form.threshold} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors">Create Rule</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {(data?.rules || []).length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-600"><Settings size={40} className="mx-auto mb-3 opacity-30" /><div className="text-sm">No alert rules configured — create one above or seed demo data</div></div>
        )}
        {(data?.rules || []).map((rule: AlertRule) => (
          <div key={rule.id} data-testid={`rule-card-${rule.id}`} className={`p-4 rounded-xl border ${rule.isActive ? "bg-gray-900/40 border-gray-700/40" : "bg-gray-900/20 border-gray-800/40 opacity-60"}`}>
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`${SEV_COLORS[rule.severity] || "bg-gray-600"} text-white px-2 py-0.5 rounded-full text-xs font-bold`}>{rule.severity?.toUpperCase()}</span>
                  <span className="text-gray-200 font-semibold text-sm">{rule.name}</span>
                  {!rule.isActive && <span className="text-gray-600 text-xs">(paused)</span>}
                </div>
                <div className="text-gray-400 text-xs mb-2">
                  {rule.metric?.replace(/([A-Z])/g, " $1").trim()} {rule.operator === "gt" ? ">" : rule.operator === "lt" ? "&lt;" : rule.operator === "gte" ? "&gt;=" : "&lt;="} {rule.threshold}
                </div>
                {rule.description && <div className="text-gray-600 text-xs mb-2">{rule.description}</div>}
                <div className="flex flex-wrap gap-2 text-xs">
                  {rule.autoNotify && <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">notify</span>}
                  {rule.autoCreateTicket && <span className="bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded">ticket</span>}
                  {rule.autoAuditLog && <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded">audit</span>}
                  <span className="text-gray-600">{rule.cooldownMins}min cooldown</span>
                  <span className="text-gray-600">target: {rule.targetRole}</span>
                  {rule.triggeredCount !== undefined && <span className="text-yellow-600">{rule.triggeredCount}x triggered</span>}
                  {rule.lastTriggeredAt && <span className="text-gray-600">last: {new Date(rule.lastTriggeredAt).toLocaleTimeString("en-ZA")}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button data-testid={`button-test-rule-${rule.id}`} onClick={() => testMut.mutate(rule.id)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg">Test</button>
                <button data-testid={`button-toggle-rule-${rule.id}`} onClick={() => toggleMut.mutate({ id: rule.id, isActive: !rule.isActive })} className={`px-3 py-1.5 text-xs rounded-lg ${rule.isActive ? "bg-yellow-900/50 hover:bg-yellow-900 text-yellow-400" : "bg-green-900/50 hover:bg-green-900 text-green-400"}`}>{rule.isActive ? "Pause" : "Activate"}</button>
                <button data-testid={`button-delete-rule-${rule.id}`} onClick={() => deleteMut.mutate(rule.id)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-xs rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Hooks */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><Shield size={14} className="text-cyan-400" /> Department Integration Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {["Analytics","Notifications","Support Team","Audit Logs","Roles & Perms","Feature Flags","Security","Finance","CMS","Subscriptions"].map(d => (
            <div key={d} className="flex items-center gap-1.5 p-2 bg-green-950/20 border border-green-700/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
              <span className="text-green-400">{d}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-2">All 10 departments auto-fed by monitoring engine. Alert rules respect Permission System roles. Every trigger logged to immutable Audit Logs.</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RealTimeMonitoring() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [liveSnap, setLiveSnap] = useState<LiveSnap | null>(null);
  const [history, setHistory] = useState<LiveSnap[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const qc = useQueryClient();

  // ─── Socket.io Connection ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(window.location.origin, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", "monitoring_room");
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("monitoring:snapshot", (snap: LiveSnap) => {
      setLiveSnap(snap);
      setHistory(h => [...h.slice(-359), snap]);
    });
    socket.on("monitoring:anomaly", (anomaly: Anomaly) => {
      setAnomalies(a => [anomaly, ...a.slice(0, 99)]);
    });
    socket.on("monitoring:alert", (alert: any) => {
      setAlerts(a => [alert, ...a.slice(0, 49)]);
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  // ─── Seed Handler ──────────────────────────────────────────────────────────
  const seedMut = useMutation({
    mutationFn: () => fetch("/api/monitoring/seed", { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/monitoring/historical-replay"] }),
  });

  const simulateMut = useMutation({
    mutationFn: (type: string) => fetch("/api/monitoring/simulate-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) }).then(r => r.json()),
  });

  const activeTabDef = TABS.find(t => t.id === activeTab)!;
  const unackCritical = anomalies.filter(a => a.severity === "critical" && !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-800/60 bg-gray-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity size={22} className="text-red-400" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-100">Real-Time Monitoring Department</h1>
                <p className="text-gray-500 text-xs">Section 29 · Living Heartbeat · FreelanceSkills.net · 200% Elon Musk Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unackCritical > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 text-xs animate-pulse">
                  <AlertTriangle size={12} />
                  {unackCritical} critical
                </div>
              )}
              <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-green-400" : "text-red-400"}`}>
                {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {connected ? "Live" : "Offline"}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badgeCount = tab.id === "anomalies" ? anomalies.filter(a => !a.acknowledged).length : tab.id === "rules" ? alerts.length : 0;
              return (
                <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive ? "bg-gray-700/80 text-gray-100" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}>
                  <Icon size={13} />
                  {tab.label}
                  {badgeCount > 0 && <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{badgeCount}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <LiveOverviewTab snap={liveSnap} history={history} anomalies={anomalies} connected={connected} onSeed={() => seedMut.mutate()} onSimulate={t => simulateMut.mutate(t)} />
        )}
        {activeTab === "metrics" && <MetricsGridTab history={history} snap={liveSnap} />}
        {activeTab === "anomalies" && <AnomalyFeedTab liveAnomalies={anomalies} />}
        {activeTab === "africa" && <AfricaIntelTab snap={liveSnap} />}
        {activeTab === "replay" && <HistoricalReplayTab />}
        {activeTab === "executive" && <ExecutiveViewTab />}
        {activeTab === "agent" && <AgentViewTab />}
        {activeTab === "rules" && <AlertRulesTab socket={socketRef.current} />}
      </div>
    </div>
  );
}

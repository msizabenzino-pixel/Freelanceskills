/**
 * System Performance Department — client/src/pages/SystemPerformance.tsx
 * Section 31 — FreelanceSkills.net
 *
 * Tabs:
 *  1. Live Pulse       — real-time KPI cards + sparklines
 *  2. Service Map      — dependency graph with latency waterfalls
 *  3. Slow Queries     — endpoint + DB query impact table
 *  4. Error Explorer   — error fingerprints + anomaly detector
 *  5. Alert Rules      — threshold CRUD + test fire
 *  6. Capacity Forecast — linear + exponential projections
 *
 * Beats Datadog + New Relic + Grafana + Sentry combined for a freelance marketplace context.
 */
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity, Zap, AlertTriangle, CheckCircle, Database, Globe, Server, Clock, TrendingUp, TrendingDown, RefreshCw, Plus, Trash2, Eye, Shield, Settings, Target, Cpu, Network, Wifi, Bell, Play, ChevronRight, DollarSign, ToggleLeft, ToggleRight, Minus, Gauge, Layers, GitBranch, Sparkles, Radio, BarChart2, Brain, Send, RotateCcw, Link } from "lucide-react";
import { io, Socket } from "socket.io-client";

const TABS = [
  { id: "pulse", label: "Live Pulse", icon: Activity, color: "cyan" },
  { id: "servicemap", label: "Service Map", icon: Network, color: "blue" },
  { id: "slowqueries", label: "Slow Queries", icon: Clock, color: "orange" },
  { id: "errors", label: "Error Explorer", icon: AlertTriangle, color: "red" },
  { id: "alerts", label: "Alert Rules", icon: Bell, color: "yellow" },
  { id: "capacity", label: "Capacity Forecast", icon: TrendingUp, color: "purple" },
  { id: "traces", label: "Distributed Traces", icon: GitBranch, color: "indigo" },
  { id: "correlation", label: "Business Correlation", icon: BarChart2, color: "violet" },
  { id: "signals", label: "Dept Signals", icon: Radio, color: "teal" },
  { id: "aiexplain", label: "AI Explain", icon: Sparkles, color: "pink" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtMs(ms: number): string { return ms >= 1000 ? (ms / 1000).toFixed(1) + "s" : Math.round(ms) + "ms"; }
function statusColor(status: string): string {
  if (status === "healthy") return "text-green-400";
  if (status === "degraded") return "text-yellow-400";
  if (status === "slow") return "text-orange-400";
  return "text-red-400";
}
function statusBg(status: string): string {
  if (status === "healthy") return "bg-green-500";
  if (status === "degraded") return "bg-yellow-500";
  if (status === "slow") return "bg-orange-500";
  return "bg-red-500";
}
function healthGrade(score: number): { grade: string; color: string } {
  if (score >= 95) return { grade: "A+", color: "text-green-400" };
  if (score >= 90) return { grade: "A", color: "text-green-400" };
  if (score >= 80) return { grade: "B", color: "text-cyan-400" };
  if (score >= 70) return { grade: "C", color: "text-yellow-400" };
  return { grade: "D", color: "text-red-400" };
}
function fmtTime(ts: number | string): string {
  const d = new Date(typeof ts === "number" ? ts : ts);
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function severityBadge(s: string) {
  const cls = s === "critical" ? "bg-red-900/50 text-red-300 border border-red-700/40" : s === "warning" ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700/40" : "bg-blue-900/50 text-blue-300 border border-blue-700/40";
  return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{s}</span>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit = "", trend, spark, color = "cyan", warn, crit, icon: Icon }: { label: string; value: number | string; unit?: string; trend?: "up" | "down" | "stable"; spark?: number[]; color?: string; warn?: number; crit?: number; icon?: any }) {
  const numVal = typeof value === "number" ? value : parseFloat(value as string) || 0;
  const isCrit = crit !== undefined && numVal > crit;
  const isWarn = warn !== undefined && numVal > warn;
  const cardColor = isCrit ? "red" : isWarn ? "yellow" : color;
  const clrMap: Record<string, string> = { cyan: "#22d3ee", blue: "#60a5fa", green: "#4ade80", yellow: "#facc15", orange: "#fb923c", red: "#f87171", purple: "#c084fc" };
  const hex = clrMap[cardColor] || "#22d3ee";
  const sparkData = (spark || []).map((v, i) => ({ i, v }));

  return (
    <div className={`bg-gray-900/50 border rounded-xl p-4 relative overflow-hidden ${isCrit ? "border-red-700/50" : isWarn ? "border-yellow-700/50" : "border-gray-700/40"}`}>
      {isCrit && <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-pulse" />}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} style={{ color: hex }} />}
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
        {trend && (
          trend === "up" ? <TrendingUp size={12} className="text-red-400" /> :
          trend === "down" ? <TrendingDown size={12} className="text-green-400" /> :
          <Minus size={12} className="text-gray-600" />
        )}
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold" style={{ color: hex }}>{typeof value === "number" ? Math.round(value) : value}</span>
        {unit && <span className="text-gray-500 text-xs pb-0.5">{unit}</span>}
      </div>
      {sparkData.length > 3 && (
        <div className="h-8 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke={hex} fill={hex} fillOpacity={0.1} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Tab 1 — Live Pulse ───────────────────────────────────────────────────────
function LivePulseTab() {
  const [snap, setSnap] = useState<any>(null);
  const [sparkHistory, setSparkHistory] = useState<any[]>([]);
  const [liveAlert, setLiveAlert] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data, refetch } = useQuery({ queryKey: ["/api/performance/live"], refetchInterval: 10000 });
  const { data: costData } = useQuery({ queryKey: ["/api/performance/cost-impact"] });

  useEffect(() => {
    if (data?.snap) { setSnap(data.snap); if (data.spark) setSparkHistory(data.spark); }
  }, [data]);

  useEffect(() => {
    const s = io({ path: "/socket.io", transports: ["websocket"] });
    socketRef.current = s;
    s.emit("join_room", "performance_room");
    s.on("performance:snapshot", (newSnap: any) => {
      setSnap(newSnap);
      setSparkHistory(prev => { const next = [...prev, newSnap].slice(-60); return next; });
    });
    s.on("performance:alert", (alert: any) => { setLiveAlert(alert); setTimeout(() => setLiveAlert(null), 6000); });
    return () => { s.disconnect(); };
  }, []);

  const current = snap || data?.snap || {};
  const { grade, color: gradeColor } = healthGrade(current.healthScore || 0);
  const apiP99Spark = sparkHistory.map(s => s.apiP99 || 0);
  const heapSpark = sparkHistory.map(s => s.heapUsedMb || 0);
  const elSpark = sparkHistory.map(s => s.eventLoopLagMs || 0);
  const errSpark = sparkHistory.map(s => s.apiErrorRate || 0);
  const paymentSpark = sparkHistory.map(s => s.paymentGatewayMs || 0);
  const mmSpark = sparkHistory.map(s => s.mobileMoneyMs || 0);

  return (
    <div className="space-y-5">
      {/* Live Alert Toast */}
      {liveAlert && (
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${liveAlert.severity === "critical" ? "bg-red-950/30 border-red-700/50" : "bg-yellow-950/30 border-yellow-700/50"}`}>
          <AlertTriangle size={16} className={liveAlert.severity === "critical" ? "text-red-400" : "text-yellow-400"} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-200">{liveAlert.test ? "[TEST] " : ""}{liveAlert.name}</div>
            <div className="text-xs text-gray-500">{liveAlert.metric} = {Math.round(liveAlert.value)} {liveAlert.operator === "gt" ? "&gt;" : "&lt;"} {liveAlert.threshold}</div>
          </div>
          {severityBadge(liveAlert.severity)}
        </div>
      )}

      {/* Health Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="md:col-span-1 bg-gray-900/50 border border-gray-700/40 rounded-xl p-5 flex flex-col items-center justify-center">
          <div className={`text-5xl font-black ${gradeColor}`}>{grade}</div>
          <div className="text-gray-500 text-xs mt-1">Platform Health</div>
          <div className="text-gray-400 text-sm mt-1">{current.healthScore || 0}/100</div>
          <div className={`mt-2 text-xs ${current.healthScore >= 85 ? "text-green-400" : current.healthScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>
            {current.healthScore >= 85 ? "Operational" : current.healthScore >= 70 ? "Degraded" : "Critical"}
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-3 gap-3">
          <KpiCard label="API p99" value={current.apiP99 || 0} unit="ms" spark={apiP99Spark} warn={800} crit={2000} icon={Zap} color="cyan" />
          <KpiCard label="API p95" value={current.apiP95 || 0} unit="ms" spark={[]} icon={Activity} color="blue" />
          <KpiCard label="Req / min" value={current.apiReqPerMin || 0} unit="rpm" icon={Server} color="green" />
          <KpiCard label="Error Rate" value={current.apiErrorRate || 0} unit="%" spark={errSpark} warn={1} crit={5} icon={AlertTriangle} color="red" />
          <KpiCard label="Event Loop" value={current.eventLoopLagMs || 0} unit="ms" spark={elSpark} warn={30} crit={100} icon={Cpu} color="purple" />
          <KpiCard label="Heap Used" value={current.heapUsedMb || 0} unit="MB" spark={heapSpark} warn={250} crit={400} icon={Layers} color="orange" />
        </div>
      </div>

      {/* DB + Runtime */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="DB Avg" value={current.dbQueryAvgMs || 0} unit="ms" icon={Database} color="blue" />
        <KpiCard label="DB p95" value={current.dbQueryP95 || 0} unit="ms" warn={200} crit={500} icon={Database} color="cyan" />
        <KpiCard label="DB Slow Queries" value={current.dbSlowQueryCount || 0} warn={5} crit={15} icon={Database} color="orange" />
        <KpiCard label="Socket Connections" value={current.socketConnections || 0} icon={Wifi} color="green" />
      </div>

      {/* External Services */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Payment Gateway" value={current.paymentGatewayMs || 0} unit="ms" spark={paymentSpark} warn={500} crit={1000} icon={DollarSign} color="cyan" />
        <KpiCard label="Payment Success" value={current.paymentSuccessRate || 0} unit="%" icon={CheckCircle} color="green" />
        <KpiCard label="Mobile Money" value={current.mobileMoneyMs || 0} unit="ms" spark={mmSpark} warn={400} crit={700} icon={Globe} color="emerald" />
        <KpiCard label="USSD Latency" value={current.ussdLatencyMs || 0} unit="ms" warn={500} crit={800} icon={Globe} color="yellow" />
      </div>

      {/* Business KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="Proposal → Order" value={current.proposalToOrderAvgMin || 0} unit="min" icon={Target} color="purple" />
        <KpiCard label="Escrow Hold Avg" value={current.escrowHoldAvgHr || 0} unit="hr" icon={Shield} color="blue" />
        <KpiCard label="Dispute Resolution" value={current.disputeResolutionAvgHr || 0} unit="hr" icon={Shield} color="orange" />
      </div>

      {/* Revenue Impact */}
      {costData && (
        <div className={`p-4 rounded-xl border ${costData.revenueLostPerHourZAR > 0 ? "bg-red-950/20 border-red-700/30" : "bg-green-950/20 border-green-700/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className={costData.revenueLostPerHourZAR > 0 ? "text-red-400" : "text-green-400"} />
            <span className="text-sm font-semibold text-gray-300">Latency Revenue Impact</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><span className="text-gray-500">Extra latency: </span><span className="text-orange-400">{costData.extraLatencyMs}ms above baseline</span></div>
            <div><span className="text-gray-500">Lost/hour: </span><span className={costData.revenueLostPerHourZAR > 0 ? "text-red-400 font-bold" : "text-green-400"}>R{costData.revenueLostPerHourZAR}</span></div>
            <div><span className="text-gray-500">Lost/day: </span><span className="text-orange-400">R{costData.revenueLostPerDayZAR}</span></div>
            <div className="text-gray-500 italic">{costData.recommendation}</div>
          </div>
        </div>
      )}

      {/* Mini sparkline chart */}
      {sparkHistory.length > 5 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="text-gray-400 text-xs mb-3">API p99 + Event Loop Lag — last 5 minutes</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={sparkHistory.map((s, i) => ({ i, p99: s.apiP99, el: s.eventLoopLagMs }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="i" hide />
              <YAxis yAxisId="left" width={40} tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" width={35} tick={{ fill: "#6b7280", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={2000} stroke="#f87171" strokeDasharray="4 2" strokeWidth={1} />
              <Line yAxisId="left" type="monotone" dataKey="p99" stroke="#22d3ee" dot={false} strokeWidth={2} name="API p99 (ms)" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="el" stroke="#c084fc" dot={false} strokeWidth={1.5} name="Event Loop (ms)" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-center">
        <button data-testid="button-refresh-live" onClick={() => refetch()} className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400">
          <RefreshCw size={11} />Refresh now (auto every 10s)
        </button>
      </div>
    </div>
  );
}

// ─── Tab 2 — Service Map ──────────────────────────────────────────────────────
function ServiceMapTab() {
  const { data, refetch, isLoading } = useQuery({ queryKey: ["/api/performance/service-map"], refetchInterval: 15000 });
  const { data: intData } = useQuery({ queryKey: ["/api/performance/integration-status"], refetchInterval: 15000 });

  const TYPE_COLORS: Record<string, string> = { frontend: "#22d3ee", backend: "#4ade80", database: "#60a5fa", realtime: "#a78bfa", external: "#fb923c", ai: "#f472b6" };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-950/20 border border-blue-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-1"><Network size={14} className="text-blue-400" /><span className="text-blue-300 font-semibold text-sm">Service Dependency Graph — Live Latency Waterfall</span></div>
        <p className="text-gray-600 text-xs">Every service the platform depends on, with real-time latency and health status. Red/yellow means revenue impact is happening now.</p>
      </div>

      {/* Visual dependency graph */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-5">
        <h3 className="text-gray-400 text-xs mb-4">Service Dependencies</h3>
        {isLoading ? <div className="text-center py-8 text-gray-600">Loading service map…</div> : (
          <div className="space-y-3">
            {/* Client tier */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-gray-600 text-right">Frontend</div>
              <div className="flex gap-2">
                {(data?.nodes || []).filter((n: any) => n.type === "frontend").map((node: any) => (
                  <div key={node.id} className="px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: TYPE_COLORS.frontend + "40", background: TYPE_COLORS.frontend + "10", color: TYPE_COLORS.frontend }}>{node.label}</div>
                ))}
              </div>
            </div>
            <div className="ml-24 pl-2 border-l-2 border-gray-800 py-1 text-xs text-gray-700">HTTP/WebSocket</div>
            {/* API tier */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-gray-600 text-right">API Server</div>
              <div className="flex gap-2">
                {(data?.nodes || []).filter((n: any) => n.type === "backend" || n.type === "realtime").map((node: any) => (
                  <div key={node.id} className="px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: (TYPE_COLORS[node.type] || "#666") + "40", background: (TYPE_COLORS[node.type] || "#666") + "10", color: TYPE_COLORS[node.type] || "#aaa" }}>
                    {node.label}{node.latencyMs ? <span className="ml-1 opacity-60">{fmtMs(node.latencyMs)}</span> : ""}{node.connections ? <span className="ml-1 opacity-60">{node.connections} conn</span> : ""}
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-24 pl-2 border-l-2 border-gray-800 py-1 text-xs text-gray-700">Drizzle ORM / SDK calls</div>
            {/* Downstream tier */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-gray-600 text-right">Downstream</div>
              <div className="flex flex-wrap gap-2">
                {(data?.nodes || []).filter((n: any) => n.type === "database" || n.type === "external" || n.type === "ai").map((node: any) => {
                  const status = node.status || "healthy";
                  return (
                    <div key={node.id} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: (TYPE_COLORS[node.type] || "#666") + "40", background: (TYPE_COLORS[node.type] || "#666") + "10", color: TYPE_COLORS[node.type] || "#aaa" }}>
                      <div className="flex items-center gap-1.5 font-medium">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusBg(status)}`} />
                        {node.label}
                      </div>
                      {node.latencyMs && <div className="text-xs opacity-60 mt-0.5">{fmtMs(node.latencyMs)}{node.successRate ? " · " + Math.round(node.successRate) + "% ok" : ""}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Latency Waterfall Table */}
      {intData && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-gray-300 text-sm font-semibold">Integration Health — Latency Waterfall</h3>
          </div>
          <div className="divide-y divide-gray-800/60">
            {(intData.services || []).map((svc: any, i: number) => {
              const maxMs = 1200;
              const widthPct = Math.min(100, (svc.latencyMs / maxMs) * 100);
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-36 text-xs text-gray-300 truncate">{svc.name}</div>
                  <div className={`w-16 text-xs text-right ${statusColor(svc.status)}`}>{fmtMs(svc.latencyMs)}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: widthPct + "%", background: svc.status === "healthy" ? "#4ade80" : svc.status === "degraded" ? "#facc15" : "#f87171" }} />
                  </div>
                  <div className={`w-16 text-xs text-right ${statusColor(svc.status)}`}>{svc.status}</div>
                  <div className="w-32 text-xs text-gray-600 truncate">{svc.detail}</div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-2 text-xs text-gray-700">Checked at {intData.checkedAt ? new Date(intData.checkedAt).toLocaleTimeString() : "—"}</div>
        </div>
      )}

      <div className="text-right">
        <button data-testid="button-refresh-servicemap" onClick={() => refetch()} className="flex items-center gap-2 ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={11} />Refresh</button>
      </div>
    </div>
  );
}

// ─── Tab 3 — Slow Queries ─────────────────────────────────────────────────────
function SlowQueriesTab() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { data, refetch } = useQuery({ queryKey: ["/api/performance/slow-queries", typeFilter], queryFn: () => fetch(`/api/performance/slow-queries${typeFilter !== "all" ? "?type=" + typeFilter : ""}`).then(r => r.json()), refetchInterval: 15000 });
  const { data: logData } = useQuery({ queryKey: ["/api/performance/slow-queries/log"], refetchInterval: 15000 });
  const { data: epData } = useQuery({ queryKey: ["/api/performance/endpoint-breakdown"], refetchInterval: 15000 });

  return (
    <div className="space-y-5">
      <div className="p-4 bg-orange-950/20 border border-orange-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-orange-400" /><span className="text-orange-300 font-semibold text-sm">Slowest Endpoints &amp; DB Queries — Auto-Sorted by Business Impact</span></div>
        <p className="text-gray-600 text-xs">Impact score = p95 latency × call count. Fix the top entry first — it hurts the most users. No query tool, no profiler, no external setup needed.</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {["all", "endpoint", "db_query"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs border ${typeFilter === t ? "bg-orange-900/30 border-orange-700/50 text-orange-300" : "bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-gray-600"}`}>{t === "all" ? "All" : t === "endpoint" ? "Endpoints" : "DB Queries"}</button>
        ))}
      </div>

      {/* Aggregated slow query table */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-300 text-sm font-semibold">Aggregated Impact Table <span className="text-gray-600 font-normal text-xs ml-2">(sorted by impact = p95 × calls)</span></h3>
          <button data-testid="button-refresh-slowq" onClick={() => refetch()} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400"><RefreshCw size={10} />refresh</button>
        </div>
        <div className="divide-y divide-gray-800/60">
          <div className="grid grid-cols-12 px-5 py-2 text-xs text-gray-600">
            <div className="col-span-4">Endpoint / Query</div>
            <div className="col-span-1 text-right">Type</div>
            <div className="col-span-1 text-right">Calls</div>
            <div className="col-span-1 text-right">Avg</div>
            <div className="col-span-1 text-right">Max</div>
            <div className="col-span-2 text-right">Impact</div>
            <div className="col-span-2 text-right">Errors</div>
          </div>
          {(data?.slowQueries || []).slice(0, 20).map((row: any, i: number) => (
            <div key={i} data-testid={`slow-query-row-${i}`} className="grid grid-cols-12 px-5 py-2.5 text-xs hover:bg-gray-800/20">
              <div className="col-span-4 font-mono text-gray-300 truncate">{row.method !== "DB" ? <span className="text-gray-600 mr-1">{row.method}</span> : null}{row.label}</div>
              <div className="col-span-1 text-right"><span className={`px-1.5 py-0.5 rounded text-xs ${row.type === "db_query" ? "bg-blue-900/40 text-blue-400" : "bg-green-900/40 text-green-400"}`}>{row.type === "db_query" ? "DB" : "API"}</span></div>
              <div className="col-span-1 text-right text-gray-400">{row.count}</div>
              <div className="col-span-1 text-right text-gray-400">{fmtMs(row.avgMs)}</div>
              <div className="col-span-1 text-right text-orange-400 font-medium">{fmtMs(row.maxMs)}</div>
              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: Math.min(100, (row.count * row.maxMs) / 500) + "%" }} /></div>
                  <span className="text-orange-400">{(row.count * row.avgMs / 1000).toFixed(1)}s</span>
                </div>
              </div>
              <div className="col-span-2 text-right text-gray-600">{row.errorCount || 0} errors</div>
            </div>
          ))}
          {(!data?.slowQueries || data.slowQueries.length === 0) && <div className="px-5 py-6 text-center text-gray-600 text-sm">No slow queries in window — platform is fast!</div>}
        </div>
        <div className="px-5 py-2 text-xs text-gray-700">{data?.totalInWindow || 0} raw entries in 5-min window</div>
      </div>

      {/* Per-endpoint breakdown */}
      {epData && epData.endpoints.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800"><h3 className="text-gray-300 text-sm font-semibold">All Endpoint p50 / p95 / p99</h3></div>
          <div className="divide-y divide-gray-800/60">
            <div className="grid grid-cols-10 px-5 py-2 text-xs text-gray-600">
              <div className="col-span-3">Endpoint</div><div className="col-span-1 text-right">Method</div><div className="col-span-1 text-right">Calls</div><div className="col-span-1 text-right">p50</div><div className="col-span-1 text-right">p95</div><div className="col-span-1 text-right">p99</div><div className="col-span-1 text-right">Err%</div><div className="col-span-1 text-right">Impact</div>
            </div>
            {epData.endpoints.slice(0, 15).map((ep: any, i: number) => (
              <div key={i} className="grid grid-cols-10 px-5 py-2 text-xs hover:bg-gray-800/20">
                <div className="col-span-3 font-mono text-gray-400 truncate text-xs">{ep.path}</div>
                <div className="col-span-1 text-right text-gray-600">{ep.method}</div>
                <div className="col-span-1 text-right text-gray-500">{ep.count}</div>
                <div className="col-span-1 text-right text-green-600">{fmtMs(ep.p50)}</div>
                <div className="col-span-1 text-right text-yellow-500">{fmtMs(ep.p95)}</div>
                <div className="col-span-1 text-right text-orange-400 font-medium">{fmtMs(ep.p99)}</div>
                <div className={`col-span-1 text-right ${ep.errRate > 5 ? "text-red-400" : ep.errRate > 1 ? "text-yellow-400" : "text-gray-600"}`}>{ep.errRate}%</div>
                <div className="col-span-1 text-right text-gray-500">{ep.impact.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw log */}
      {logData && logData.log.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800"><h3 className="text-gray-300 text-sm font-semibold">Raw Slow Log — Most Recent</h3></div>
          <div className="divide-y divide-gray-800/40 max-h-64 overflow-y-auto">
            {logData.log.slice(0, 20).map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2 text-xs hover:bg-gray-800/20">
                <span className="text-gray-700 w-20">{fmtTime(e.ts)}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${e.type === "db_query" ? "bg-blue-900/40 text-blue-400" : "bg-green-900/40 text-green-400"}`}>{e.type === "db_query" ? "DB" : e.method}</span>
                <span className="text-gray-400 font-mono flex-1 truncate">{e.label}</span>
                <span className="text-orange-400 font-medium">{fmtMs(e.durationMs)}</span>
                <span className="text-gray-700 text-xs">{e.corrId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4 — Error Explorer ───────────────────────────────────────────────────
function ErrorExplorerTab() {
  const { data: errData, refetch: refetchErr } = useQuery({ queryKey: ["/api/performance/errors"], refetchInterval: 10000 });
  const { data: anomData, refetch: refetchAnom } = useQuery({ queryKey: ["/api/performance/anomalies"], refetchInterval: 15000 });
  const { data: traces } = useQuery({ queryKey: ["/api/performance/correlation-trace"], refetchInterval: 5000 });
  const qc = useQueryClient();

  const ackMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/performance/anomalies/${id}/ack`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/performance/anomalies"] }),
  });

  return (
    <div className="space-y-5">
      <div className="p-4 bg-red-950/20 border border-red-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-red-400" /><span className="text-red-300 font-semibold text-sm">Error &amp; Anomaly Explorer — Grouped by Fingerprint + 3-Sigma Detection</span></div>
        <p className="text-gray-600 text-xs">Errors are fingerprinted by method + path + status code. Anomalies are detected via z-score (3σ) — fires automatically when any metric deviates 3 standard deviations from its 5-minute baseline.</p>
      </div>

      {/* Error summary */}
      {errData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{errData.totalFingerprints}</div>
            <div className="text-gray-600 text-xs mt-1">Error Fingerprints</div>
          </div>
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{errData.recentErrorCount}</div>
            <div className="text-gray-600 text-xs mt-1">Errors (last 5 min)</div>
          </div>
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{errData.errorsPerMin}</div>
            <div className="text-gray-600 text-xs mt-1">Errors / min</div>
          </div>
        </div>
      )}

      {/* Error fingerprints */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-300 text-sm font-semibold">5xx Error Fingerprints <span className="text-gray-600 font-normal text-xs ml-2">(last 5-min window)</span></h3>
          <button onClick={() => refetchErr()} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400"><RefreshCw size={10} />refresh</button>
        </div>
        {(errData?.errors || []).length === 0 ? (
          <div className="px-5 py-8 text-center text-green-500 text-sm"><CheckCircle size={20} className="mx-auto mb-2" />No 5xx errors in the current window</div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {(errData?.errors || []).map((e: any, i: number) => (
              <div key={i} data-testid={`error-row-${i}`} className="px-5 py-3 hover:bg-gray-800/20">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-0.5 bg-red-900/40 text-red-400 rounded text-xs font-mono">{e.status}</span>
                  <span className="font-mono text-sm text-gray-200">{e.method} {e.path}</span>
                  <span className="ml-auto text-red-400 font-bold text-sm">{e.count}×</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Corr-ID: {e.corrId}</span>
                  <span>Last seen: {fmtTime(e.ts)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anomalies */}
      <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-300 text-sm font-semibold">AI Anomaly Events <span className="text-gray-600 font-normal text-xs ml-2">(3-sigma z-score detector)</span></h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{anomData?.openCount || 0} open</span>
            <button onClick={() => refetchAnom()} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400"><RefreshCw size={10} />refresh</button>
          </div>
        </div>
        {(anomData?.anomalies || []).length === 0 ? (
          <div className="px-5 py-8 text-center text-green-500 text-sm"><CheckCircle size={20} className="mx-auto mb-2" />No anomalies detected — platform metrics are stable</div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {(anomData?.anomalies || []).map((a: any) => (
              <div key={a.id} data-testid={`anomaly-row-${a.id}`} className={`px-5 py-3 hover:bg-gray-800/20 ${a.acknowledged ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3 mb-1">
                  {severityBadge(a.severity)}
                  <span className="text-gray-300 text-sm font-medium">{a.metric}</span>
                  <span className="text-red-400 font-bold">z={Math.round(a.zScore * 10) / 10}</span>
                  <span className="text-gray-600 text-xs ml-auto">{fmtTime(a.detectedAt)}</span>
                  {!a.acknowledged && (
                    <button data-testid={`button-ack-${a.id}`} onClick={() => ackMutation.mutate(a.id)} className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded-lg">
                      <CheckCircle size={11} />Ack
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-1">{a.rootCause}</div>
                {a.recommendations && a.recommendations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.recommendations.map((r: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full text-xs">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Correlation trace */}
      {traces && traces.traces.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800"><h3 className="text-gray-300 text-sm font-semibold">Correlation ID Trace — Last 50 Requests</h3></div>
          <div className="divide-y divide-gray-800/40 max-h-56 overflow-y-auto">
            {traces.traces.slice(0, 20).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-1.5 text-xs hover:bg-gray-800/20">
                <span className="text-gray-700 w-20">{fmtTime(t.ts)}</span>
                <span className={`w-8 text-center font-mono ${t.method === "GET" ? "text-blue-500" : t.method === "POST" ? "text-green-500" : "text-orange-500"}`}>{t.method.slice(0, 4)}</span>
                <span className="text-gray-500 flex-1 truncate font-mono">{t.path}</span>
                <span className={`w-10 text-right ${t.status >= 500 ? "text-red-400" : t.status >= 400 ? "text-yellow-400" : "text-gray-600"}`}>{t.status}</span>
                <span className="text-orange-400 w-16 text-right">{fmtMs(t.durationMs)}</span>
                <span className="text-gray-700 w-20 font-mono">{t.corrId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 5 — Alert Rules ──────────────────────────────────────────────────────
const METRIC_OPTIONS = [
  { value: "apiP99", label: "API p99 latency (ms)" },
  { value: "apiP95", label: "API p95 latency (ms)" },
  { value: "apiErrorRate", label: "Error rate (%)" },
  { value: "heapUsedMb", label: "Heap used (MB)" },
  { value: "eventLoopLagMs", label: "Event loop lag (ms)" },
  { value: "dbQueryP95", label: "DB query p95 (ms)" },
  { value: "dbSlowQueryCount", label: "DB slow query count" },
  { value: "paymentGatewayMs", label: "Payment gateway (ms)" },
  { value: "paymentSuccessRate", label: "Payment success rate (%)" },
  { value: "mobileMoneyMs", label: "Mobile money (ms)" },
  { value: "ussdLatencyMs", label: "USSD latency (ms)" },
  { value: "socketConnections", label: "Socket connections" },
  { value: "cpuPct", label: "CPU usage (%)" },
  { value: "queueBacklog", label: "Queue backlog" },
];

function AlertRulesTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", metric: "apiP99", operator: "gt", threshold: 2000, severity: "warning", cooldownMin: 15, description: "", autoTicket: false, channels: ["email"] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data } = useQuery({ queryKey: ["/api/performance/alerts"], refetchInterval: 15000 });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch("/api/performance/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/performance/alerts"] }); setShowCreate(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/performance/alerts/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/performance/alerts"] }),
  });
  const toggleMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/performance/alerts/${id}/toggle`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/performance/alerts"] }),
  });
  const testMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/performance/alerts/${id}/test`, { method: "POST" }).then(r => r.json()),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: any) => fetch(`/api/performance/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/performance/alerts"] }); setEditingId(null); },
  });

  const togChan = (ch: string) => setForm(f => { const cs = f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch]; return { ...f, channels: cs }; });

  return (
    <div className="space-y-5">
      <div className="p-4 bg-yellow-950/20 border border-yellow-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-1"><Bell size={14} className="text-yellow-400" /><span className="text-yellow-300 font-semibold text-sm">Alert Rules Engine — Threshold Breach → Auto Notification + Ticket</span></div>
        <p className="text-gray-600 text-xs">Set thresholds on any metric. When breached, alerts fire via email/SMS/Slack/ticket with cooldown. autoTicket=true automatically creates a support ticket. Replaces PagerDuty ($21/user/mo).</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-500 text-sm">{(data?.rules || []).length} alert rules configured · {(data?.rules || []).filter((r: any) => r.breaching).length} currently breaching</div>
        <button data-testid="button-create-alert" onClick={() => setShowCreate(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"><Plus size={13} />{showCreate ? "Cancel" : "New Rule"}</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-gray-900/60 border border-yellow-700/30 rounded-xl p-5">
          <h3 className="text-yellow-300 font-semibold text-sm mb-4">Create Alert Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-500 text-xs block mb-1">Rule Name</label>
              <input data-testid="input-alert-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. API p99 spike" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-yellow-600" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">Metric</label>
              <select data-testid="select-alert-metric" value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-yellow-600">
                {METRIC_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-gray-500 text-xs block mb-1">Operator</label>
                <select value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none">
                  <option value="gt">Greater than (&gt;)</option>
                  <option value="lt">Less than (&lt;)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-gray-500 text-xs block mb-1">Threshold</label>
                <input data-testid="input-alert-threshold" type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-gray-500 text-xs block mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-gray-500 text-xs block mb-1">Cooldown (min)</label>
                <input type="number" value={form.cooldownMin} onChange={e => setForm(f => ({ ...f, cooldownMin: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-500 text-xs block mb-1">Channels</label>
              <div className="flex gap-2 flex-wrap">
                {["email", "sms", "slack", "ticket"].map(ch => (
                  <button key={ch} onClick={() => togChan(ch)} className={`px-3 py-1.5 rounded-lg text-xs border ${form.channels.includes(ch) ? "bg-yellow-900/30 border-yellow-700/50 text-yellow-300" : "bg-gray-800 border-gray-700 text-gray-500"}`}>{ch}</button>
                ))}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-800 border-gray-700 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={form.autoTicket} onChange={e => setForm(f => ({ ...f, autoTicket: e.target.checked }))} />
                  Auto-create ticket
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-500 text-xs block mb-1">Description (optional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Why does this matter?" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none" />
            </div>
          </div>
          <button data-testid="button-submit-alert" onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium">
            {createMut.isPending ? <><RefreshCw size={13} className="animate-spin" />Creating…</> : <><Plus size={13} />Create Alert Rule</>}
          </button>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {(data?.rules || []).map((rule: any) => (
          <div key={rule.id} data-testid={`alert-rule-${rule.id}`} className={`bg-gray-900/40 border rounded-xl p-4 ${rule.breaching ? "border-red-700/50" : rule.enabled ? "border-gray-700/40" : "border-gray-800/40 opacity-60"}`}>
            {editingId === rule.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={editForm.name || ""} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none" />
                  <input type="number" value={editForm.threshold ?? rule.threshold} onChange={e => setEditForm((f: any) => ({ ...f, threshold: Number(e.target.value) }))} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateMut.mutate({ id: rule.id, body: editForm })} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {rule.breaching && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                  <span className="text-gray-200 font-medium text-sm truncate">{rule.name}</span>
                  {severityBadge(rule.severity)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">{rule.metric}</code>
                  <span>{rule.operator === "gt" ? "&gt;" : "&lt;"}</span>
                  <span className="text-yellow-400 font-medium">{rule.threshold}</span>
                  {rule.currentValue !== undefined && <span className="text-gray-600">now: <span className={rule.breaching ? "text-red-400 font-bold" : "text-gray-400"}>{Math.round(rule.currentValue)}</span></span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  {(rule.channels || []).map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-600">{c}</span>)}
                  {rule.autoTicket && <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-500 rounded">ticket</span>}
                  <span className="text-gray-700">{rule.fireCount}× fired</span>
                </div>
                <div className="flex items-center gap-1">
                  <button data-testid={`button-toggle-${rule.id}`} onClick={() => toggleMut.mutate(rule.id)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-500">
                    {rule.enabled ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                  </button>
                  <button data-testid={`button-test-${rule.id}`} onClick={() => testMut.mutate(rule.id)} title="Fire test alert" className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-600 hover:text-yellow-400"><Play size={13} /></button>
                  <button onClick={() => { setEditingId(rule.id); setEditForm({ name: rule.name, threshold: rule.threshold }); }} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-600 hover:text-blue-400"><Settings size={13} /></button>
                  <button data-testid={`button-delete-${rule.id}`} onClick={() => deleteMut.mutate(rule.id)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-600 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
            )}
            {rule.description && <div className="text-xs text-gray-600 mt-1 ml-4">{rule.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 6 — Capacity Forecast ────────────────────────────────────────────────
function CapacityForecastTab() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ["/api/performance/capacity"], refetchInterval: 60000 });

  const fLabel = (m: string) => ({
    apiP99: "API p99 (ms)", heapUsedMb: "Heap (MB)", apiReqPerMin: "Requests / min", eventLoopLagMs: "Event Loop Lag (ms)",
  }[m] || m);
  const fColor = (m: string) => ({ apiP99: "#22d3ee", heapUsedMb: "#f87171", apiReqPerMin: "#4ade80", eventLoopLagMs: "#c084fc" }[m] || "#888");
  const trendIcon = (t: string) => t === "rising" ? <TrendingUp size={12} className="text-red-400" /> : t === "falling" ? <TrendingDown size={12} className="text-green-400" /> : <Minus size={12} className="text-gray-500" />;
  const trendClr = (t: string) => t === "rising" ? "text-red-400" : t === "falling" ? "text-green-400" : "text-gray-500";

  return (
    <div className="space-y-5">
      <div className="p-4 bg-purple-950/20 border border-purple-700/30 rounded-xl">
        <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-purple-400" /><span className="text-purple-300 font-semibold text-sm">Predictive Capacity Forecaster — Linear + Exponential Projection</span></div>
        <p className="text-gray-600 text-xs">Uses linear regression on the last hour of 5-second snapshots to forecast where key metrics will be in 1h, 6h, and 24h. Includes time-to-breach estimates. Replaces a $15k/yr APM capacity planning add-on.</p>
      </div>

      {isLoading ? <div className="text-center py-12 text-gray-600">Computing forecast…</div> : data ? (
        <>
          {/* Time-to-breach warning */}
          {data.timeToHeapBreachMin !== null && data.timeToHeapBreachMin > 0 && (
            <div className={`p-4 rounded-xl border ${data.timeToHeapBreachMin < 120 ? "bg-red-950/20 border-red-700/40" : "bg-yellow-950/20 border-yellow-700/40"}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className={data.timeToHeapBreachMin < 120 ? "text-red-400" : "text-yellow-400"} />
                <span className={`text-sm font-semibold ${data.timeToHeapBreachMin < 120 ? "text-red-300" : "text-yellow-300"}`}>
                  Heap breach in ~{data.timeToHeapBreachMin}h at current growth rate ({data.timeToHeapBreachMin < 2 ? "CRITICAL" : data.timeToHeapBreachMin < 12 ? "warning" : "watch"})
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Target: 450MB heap limit. At {data.forecasts?.heapUsedMb?.current}MB now, trending {data.forecasts?.heapUsedMb?.trend}.</div>
            </div>
          )}

          {/* Forecast metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(data.forecasts || {}).map(([m, f]: [string, any]) => (
              <div key={m} className="bg-gray-900/40 border border-gray-700/40 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                  {trendIcon(f.trend)}
                  <span className="text-gray-300 text-sm font-medium">{fLabel(m)}</span>
                  <span className={`text-xs ml-auto ${trendClr(f.trend)}`}>{f.trend}</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                    {[{ label: "Now", val: f.current }, { label: "+1h", val: f.forecast1h }, { label: "+6h", val: f.forecast6h }, { label: "+24h", val: f.forecast24h }].map(({ label, val }) => (
                      <div key={label}>
                        <div className="text-lg font-bold" style={{ color: fColor(m) }}>{Math.round(val)}</div>
                        <div className="text-gray-600 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                  {f.sparkline && f.sparkline.length > 5 && (
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={f.sparkline.map((v: number, i: number) => ({ i, v }))}>
                        <Area type="monotone" dataKey="v" stroke={fColor(m)} fill={fColor(m)} fillOpacity={0.1} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, fontSize: 10 }} formatter={(v: any) => [Math.round(v), fLabel(m)]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  <div className="text-xs text-gray-600 mt-2">Slope: {f.slopePerSnapshot} per 5s · Exp growth factor (24h): {f.expGrowthFactor}×</div>
                </div>
              </div>
            ))}
          </div>

          {/* Historical chart */}
          {data.historyPoints && data.historyPoints.length > 5 && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-5">
              <h3 className="text-gray-400 text-xs mb-3">Historical Baseline ({data.samplesUsed} snapshots used for regression)</h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data.historyPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="ts" hide />
                  <YAxis yAxisId="left" width={40} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" width={35} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="apiP99" stroke="#22d3ee" dot={false} strokeWidth={1.5} name="API p99 (ms)" isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="heapUsedMb" stroke="#f87171" dot={false} strokeWidth={1.5} name="Heap (MB)" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : null}

      <div className="text-right">
        <button data-testid="button-refresh-capacity" onClick={() => refetch()} className="flex items-center gap-2 ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400"><RefreshCw size={11} />Recompute forecast</button>
      </div>
    </div>
  );
}

// ─── [Feature 1] Distributed Traces Tab ──────────────────────────────────────
function DistributedTracesTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/performance/traces"], refetchInterval: 15000 });
  if (isLoading) return <div className="text-gray-500 text-sm py-12 text-center">Loading trace log...</div>;
  const traces: any[] = data?.traces || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-indigo-300 flex items-center gap-2"><GitBranch size={15} /> Distributed Traces — Express → PostgreSQL → OpenAI → PayFast Waterfall</h2>
          <p className="text-xs text-gray-500 mt-0.5">Zero Jaeger/Zipkin needed. Each request generates root + child spans. Wrap db.execute() with synthChildSpan() for real production spans.</p>
        </div>
        <button data-testid="button-refresh-traces" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/30 border border-indigo-700/40 rounded-lg text-xs text-indigo-300"><RefreshCw size={10} />Refresh</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-indigo-300">{data?.total || 0}</div><div className="text-xs text-gray-500 mt-0.5">Recent Traces</div></div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-purple-300">{data?.spanCount || 0}</div><div className="text-xs text-gray-500 mt-0.5">Total Spans (buffer)</div></div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-red-300">{traces.filter((t: any) => t.hasError).length}</div><div className="text-xs text-gray-500 mt-0.5">Error Traces</div></div>
      </div>
      {traces.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">No traces yet — traces are generated every 10s when traffic flows. Check back shortly.</div>
      ) : (
        <div className="space-y-2">
          {traces.slice(0, 20).map((trace: any) => (
            <div key={trace.traceId} data-testid={`trace-${trace.traceId}`} className={`bg-gray-900/60 border ${trace.hasError ? "border-red-800/50" : "border-gray-800"} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${trace.hasError ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="text-xs font-mono text-gray-400">{trace.traceId}</span>
                  {trace.businessContext && <span className="px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/30 rounded text-xs text-indigo-300">{trace.businessContext}</span>}
                </div>
                <span className="text-xs text-gray-500">{trace.totalDurationMs}ms total · {trace.services?.join(" → ")}</span>
              </div>
              <div className="space-y-1">
                {(trace.spans || []).map((span: any, i: number) => {
                  const indent = span.parentSpanId ? "ml-6" : "";
                  const barW = Math.min(100, Math.round((span.duration / (trace.totalDurationMs || 1)) * 100));
                  const color = span.service === "express-api" ? "bg-indigo-500" : span.service === "postgresql" ? "bg-blue-500" : span.service === "openai" ? "bg-purple-500" : span.service === "payfast" ? "bg-green-500" : "bg-gray-500";
                  return (
                    <div key={i} className={`flex items-center gap-2 ${indent}`}>
                      <span className="text-xs text-gray-500 w-24 shrink-0 truncate">{span.service}</span>
                      <span className="text-xs text-gray-400 w-48 shrink-0 truncate">{span.op}</span>
                      <div className="flex-1 bg-gray-800 rounded h-1.5"><div className={`h-full ${color} rounded`} style={{ width: `${barW}%` }} /></div>
                      <span className="text-xs text-gray-400 w-14 text-right shrink-0">{span.duration}ms</span>
                      <span className={`text-xs ${span.status === "error" ? "text-red-400" : "text-green-500"}`}>{span.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── [Feature 2+3] Business Correlation Tab ───────────────────────────────────
function BusinessCorrelationTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/performance/business-correlation"], refetchInterval: 30000 });
  const { data: rcData } = useQuery<any>({ queryKey: ["/api/performance/root-cause"], refetchInterval: 30000 });
  if (isLoading) return <div className="text-gray-500 text-sm py-12 text-center">Loading correlation data...</div>;
  if (data?.status === "collecting") return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
      <BarChart2 size={32} className="mx-auto mb-3 text-violet-500 opacity-40" />
      <p className="text-gray-400 text-sm">{data.message}</p>
    </div>
  );
  const correlations: any[] = data?.correlations || [];
  const rcEntries: any[] = rcData?.slowRootCauses || [];
  const history: any[] = data?.history || [];
  const corrColor = (r: number) => Math.abs(r) > 0.7 ? "text-red-300" : Math.abs(r) > 0.4 ? "text-yellow-300" : "text-gray-400";
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-violet-300 flex items-center gap-2"><BarChart2 size={15} /> Business + Infra Correlation Engine</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pearson r across every business KPI vs every infra metric. When orders/min spikes — does p99 follow? Find out here.</p>
        </div>
        <button data-testid="button-refresh-correlation" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900/30 border border-violet-700/40 rounded-lg text-xs text-violet-300"><RefreshCw size={10} />Refresh</button>
      </div>
      {data?.keyInsight && (
        <div className="bg-violet-950/30 border border-violet-700/40 rounded-xl p-4">
          <p className="text-sm text-violet-200 font-medium">{data.keyInsight}</p>
          <p className="text-xs text-gray-500 mt-1">{data.dataPoints} samples collected ({Math.round((data.dataPoints * 10) / 60)} min of data)</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {correlations.map((c: any, i: number) => (
          <div key={i} data-testid={`correlation-${i}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-300">{c.pair}</span>
              <span className={`text-lg font-bold ${corrColor(c.r)}`}>{c.r > 0 ? "+" : ""}{c.r}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs ${c.strength === "strong" ? "bg-red-900/40 text-red-300" : c.strength === "moderate" ? "bg-yellow-900/40 text-yellow-300" : "bg-gray-800 text-gray-500"}`}>{c.strength}</span>
              <span className="text-xs text-gray-500">{c.direction}</span>
            </div>
            <div className="w-full bg-gray-800 rounded h-1.5 mb-2"><div className={`h-full rounded ${Math.abs(c.r) > 0.7 ? "bg-red-500" : Math.abs(c.r) > 0.4 ? "bg-yellow-500" : "bg-gray-600"}`} style={{ width: `${Math.abs(c.r) * 100}%` }} /></div>
            <p className="text-xs text-gray-500">{c.insight}</p>
          </div>
        ))}
      </div>
      {history.length > 3 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">Orders/min vs API p99 — last {history.length} samples</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={history.slice(-40)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="ts" tick={false} />
              <YAxis yAxisId="left" stroke="#a855f7" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="apiP99" stroke="#a855f7" dot={false} name="API p99 (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="ordersPerMin" stroke="#06b6d4" dot={false} name="Orders/min" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {rcEntries.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">Root-Cause Fingerprints — Business Context</h3>
          <div className="space-y-2">
            {rcEntries.slice(0, 6).map((rc: any, i: number) => (
              <div key={i} data-testid={`rootcause-${i}`} className="flex items-start gap-3 p-3 bg-gray-950/60 border border-gray-800 rounded-lg">
                <AlertTriangle size={13} className="text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-300 font-medium">{rc.correlation}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rc.businessContext}</p>
                  <p className="text-xs text-indigo-400 mt-0.5">{rc.infraContext}</p>
                </div>
                <span className="ml-auto text-xs text-gray-600 shrink-0">{rc.occurrences}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── [Feature 10] Dept Signals Tab ───────────────────────────────────────────
function DeptSignalsTab() {
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ["/api/performance/dept-signals"], refetchInterval: 20000 });
  const { data: carriersData } = useQuery<any>({ queryKey: ["/api/performance/africa/carriers"], refetchInterval: 30000 });
  if (isLoading) return <div className="text-gray-500 text-sm py-12 text-center">Loading department signals...</div>;
  const depts = data?.depts || {};
  const deptList = Object.keys(depts);
  const carriers: any[] = carriersData?.carriers || [];
  const trendIcon = (t: string) => t === "up" ? "↑" : t === "down" ? "↓" : "→";
  const trendColor = (metric: string, t: string) => {
    const isGoodUp = ["delivery_success_rate"].includes(metric);
    if (t === "up") return isGoodUp ? "text-green-400" : "text-yellow-400";
    if (t === "down") return isGoodUp ? "text-yellow-400" : "text-green-400";
    return "text-gray-500";
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-teal-300 flex items-center gap-2"><Radio size={15} /> Department Performance Signals</h2>
          <p className="text-xs text-gray-500 mt-0.5">7 departments reporting live signals. POST /api/performance/dept-signal from any dept route to push metrics here.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{data?.crossDeptHealthScore ?? 100}% health</span>
          <div className={`w-2 h-2 rounded-full ${(data?.crossDeptHealthScore ?? 100) > 70 ? "bg-green-500" : "bg-red-500"}`} />
          <button data-testid="button-refresh-signals" onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/30 border border-teal-700/40 rounded-lg text-xs text-teal-300"><RefreshCw size={10} />Refresh</button>
        </div>
      </div>
      {data?.criticalSignals?.length > 0 && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={13} className="text-red-400" />
          <p className="text-xs text-red-300">{data.criticalSignals.length} critical signal(s) detected across departments. Review below.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deptList.map(dept => (
          <div key={dept} data-testid={`dept-${dept.replace(/ /g, "-").toLowerCase()}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-teal-300 mb-3 flex items-center gap-2"><Layers size={11} />{dept}</h3>
            <div className="space-y-2">
              {(depts[dept] || []).map((sig: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 truncate w-36">{sig.metric.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-white">{typeof sig.value === "number" && sig.value < 1 ? sig.value.toFixed(5) : sig.value}{sig.unit && sig.unit !== "%" ? " " + sig.unit : sig.unit}</span>
                    <span className={`text-xs ${trendColor(sig.metric, sig.trend)}`}>{trendIcon(sig.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
            {depts[dept]?.[0]?.impact && <p className="text-xs text-gray-600 mt-2 border-t border-gray-800 pt-2">{depts[dept][0].impact}</p>}
          </div>
        ))}
      </div>
      {carriers.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2"><Wifi size={11} /> Africa Carrier Latency — Carrier-Level Degradation Detection</h3>
          <p className="text-xs text-gray-600 mb-3">{carriersData?.summary?.degrading?.length > 0 ? `DEGRADING: ${carriersData.summary.degrading.join(", ")}` : "All carriers stable"} · Rural/Urban penalty: +{carriersData?.networkBreakdown?.ruralUrbanPenaltyMs ?? 0}ms</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-600 border-b border-gray-800"><th className="text-left pb-2">Carrier</th><th className="text-left pb-2">Country</th><th className="text-left pb-2">Network</th><th className="text-right pb-2">Avg</th><th className="text-right pb-2">p95</th><th className="text-right pb-2">Success</th><th className="text-right pb-2">Trend</th></tr></thead>
              <tbody>{carriers.map((c: any) => (
                <tr key={c.name} data-testid={`carrier-${c.name.replace(/ /g, "-").toLowerCase()}`} className="border-b border-gray-800/40">
                  <td className="py-2 font-medium text-gray-300">{c.name}</td>
                  <td className="py-2 text-gray-500">{c.country}</td>
                  <td className="py-2 text-gray-500">{c.network}</td>
                  <td className={`py-2 text-right ${c.avgMs > 400 ? "text-red-400" : c.avgMs > 200 ? "text-yellow-400" : "text-green-400"}`}>{c.avgMs}ms</td>
                  <td className="py-2 text-right text-gray-400">{c.p95Ms}ms</td>
                  <td className="py-2 text-right text-gray-400">{c.successRate?.toFixed(1)}%</td>
                  <td className={`py-2 text-right ${c.trend === "degrading" ? "text-red-400" : c.trend === "improving" ? "text-green-400" : "text-gray-500"}`}>{c.trend}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── [Feature 9] AI Explain Tab ───────────────────────────────────────────────
function AiExplainTab() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>("");
  const [replaySessionId, setReplaySessionId] = useState<string>("");
  const [replayStatus, setReplayStatus] = useState<any>(null);
  const { data: anomalies } = useQuery<any>({ queryKey: ["/api/performance/anomalies"], refetchInterval: 15000 });
  const { data: instrData } = useQuery<any>({ queryKey: ["/api/performance/instrumentation"] });
  const { data: advCapacity } = useQuery<any>({ queryKey: ["/api/performance/capacity/advanced"], refetchInterval: 30000 });

  async function explain() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/performance/ai-explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomalyId: selectedAnomaly || undefined }) });
      setResult(await r.json());
    } catch { setResult({ explanation: "Request failed. Check network and retry.", error: true }); }
    setLoading(false);
  }

  async function startReplay() {
    try {
      const r = await fetch("/api/performance/replay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ windowMin: 5 }) });
      const d = await r.json();
      setReplaySessionId(d.sessionId || "");
      setReplayStatus(d);
    } catch {}
  }

  async function pollReplay() {
    if (!replaySessionId) return;
    try {
      const r = await fetch(`/api/performance/replay/${replaySessionId}`);
      setReplayStatus(await r.json());
    } catch {}
  }

  const anomalyList: any[] = anomalies?.anomalies || [];
  const confColor = (c: number) => c > 80 ? "text-green-400" : c > 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-pink-300 flex items-center gap-2"><Sparkles size={15} /> AI Anomaly Explanation — GPT-4o-mini Performance Analyst</h2>
        <p className="text-xs text-gray-500 mt-0.5">Explains latency spikes in plain English. "This spike is 87% correlated with AI proposal ranking calls — reduce token limit or add caching."</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AI Explain Panel */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-pink-300">Explain an Anomaly</h3>
          <select data-testid="select-anomaly" value={selectedAnomaly} onChange={e => setSelectedAnomaly(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
            <option value="">Latest anomaly (auto-select)</option>
            {anomalyList.map((a: any) => (<option key={a.id} value={a.id}>{a.metric} — z={a.zScore?.toFixed(2)} — {new Date(a.timestamp).toLocaleTimeString()}</option>))}
          </select>
          <button data-testid="button-ai-explain" onClick={explain} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-900/40 hover:bg-pink-900/60 border border-pink-700/40 rounded-lg text-sm text-pink-300 disabled:opacity-50 transition-all">
            {loading ? <><RefreshCw size={13} className="animate-spin" />Analyzing with GPT-4o-mini...</> : <><Brain size={13} />Explain This Anomaly</>}
          </button>
          {result && (
            <div className="bg-gray-950/80 border border-pink-800/30 rounded-xl p-4 space-y-3">
              {result.anomaly && (
                <div className="text-xs text-gray-500 border-b border-gray-800 pb-2">
                  Anomaly: <span className="text-gray-300">{result.anomaly.metric}</span> · z={result.anomaly.zScore?.toFixed(2)} · value={result.anomaly.value}
                </div>
              )}
              <p className="text-sm text-gray-200">{result.explanation}</p>
              {result.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-pink-400 mb-1.5">Recommendations</p>
                  <ul className="space-y-1">{result.recommendations.map((r: string, i: number) => <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5"><ChevronRight size={10} className="text-pink-500 mt-0.5 shrink-0" />{r}</li>)}</ul>
                </div>
              )}
              {result.businessImpact && <p className="text-xs text-yellow-400">{result.businessImpact}</p>}
              {result.confidence !== undefined && <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Confidence:</span><span className={`text-sm font-bold ${confColor(result.confidence)}`}>{result.confidence}%</span>{result.fallback && <span className="text-xs text-gray-600">(rule-based fallback)</span>}</div>}
            </div>
          )}
        </div>

        {/* Traffic Replay Panel */}
        <div className="space-y-3">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-indigo-300 flex items-center gap-2"><RotateCcw size={11} /> Traffic Replay Simulator — Last 5 Minutes</h3>
            <p className="text-xs text-gray-500">Fast-forwards historical snapshots. Shows peak p99, heap, req/min from the window. Use to validate infra before deploying a fix.</p>
            <button data-testid="button-start-replay" onClick={startReplay} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-lg text-xs text-indigo-300 transition-all"><Play size={11} />Start 5-min Replay</button>
            {replaySessionId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Session: {replaySessionId}</span>
                  <button data-testid="button-poll-replay" onClick={pollReplay} className="text-xs text-indigo-400 hover:underline">Poll status</button>
                </div>
                {replayStatus && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1"><span className="text-gray-400">{replayStatus.status}</span><span className="text-gray-500">{replayStatus.progress ?? 0}%</span></div>
                    <div className="w-full bg-gray-800 rounded h-1.5"><div className="h-full bg-indigo-500 rounded transition-all" style={{ width: `${replayStatus.progress ?? 0}%` }} /></div>
                    {replayStatus.summary && <p className="text-xs text-gray-400 mt-2">{replayStatus.summary}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* eBPF / Instrumentation Guide */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-orange-300 flex items-center gap-2"><Zap size={11} /> eBPF + clinic.js Instrumentation Guide</h3>
            {instrData?.ebpf?.tools?.slice(0, 3).map((tool: any, i: number) => (
              <div key={i} className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-orange-300">{tool.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tool.output}</p>
                <code className="text-xs text-green-400 font-mono block mt-1 break-all">{tool.run}</code>
              </div>
            ))}
          </div>

          {/* Advanced Capacity */}
          {advCapacity?.heapForecast && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-purple-300 flex items-center gap-2"><TrendingUp size={11} /> Exponential Capacity Forecast</h3>
              <p className="text-xs text-gray-400">{advCapacity.recommendation}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-950/60 rounded-lg p-2"><div className="text-sm font-bold text-purple-300">{advCapacity.heapForecast.monthlyGrowthPct}%</div><div className="text-xs text-gray-600">monthly growth</div></div>
                <div className="bg-gray-950/60 rounded-lg p-2"><div className={`text-sm font-bold ${advCapacity.heapForecast.estimatedBreachDays < 14 ? "text-red-400" : "text-green-400"}`}>{advCapacity.heapForecast.estimatedBreachDays}d</div><div className="text-xs text-gray-600">breach estimate</div></div>
                <div className={`bg-gray-950/60 rounded-lg p-2`}><div className={`text-sm font-bold ${advCapacity.autoScalingTriggers?.currentStatus === "SCALE_UP_NOW" ? "text-red-400" : "text-green-400"}`}>{advCapacity.autoScalingTriggers?.currentStatus}</div><div className="text-xs text-gray-600">scale status</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemPerformance() {
  const [activeTab, setActiveTab] = useState<TabId>("pulse");
  const { data: statsData } = useQuery({ queryKey: ["/api/performance/stats"], refetchInterval: 15000 });

  const tabColorMap: Record<string, string> = { cyan: "border-cyan-500 text-cyan-300", blue: "border-blue-500 text-blue-300", orange: "border-orange-500 text-orange-300", red: "border-red-500 text-red-300", yellow: "border-yellow-500 text-yellow-300", purple: "border-purple-500 text-purple-300", indigo: "border-indigo-500 text-indigo-300", violet: "border-violet-500 text-violet-300", teal: "border-teal-500 text-teal-300", pink: "border-pink-500 text-pink-300" };
  const tabBgMap: Record<string, string> = { cyan: "bg-cyan-950/20", blue: "bg-blue-950/20", orange: "bg-orange-950/20", red: "bg-red-950/20", yellow: "bg-yellow-950/20", purple: "bg-purple-950/20", indigo: "bg-indigo-950/20", violet: "bg-violet-950/20", teal: "bg-teal-950/20", pink: "bg-pink-950/20" };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/30 border border-cyan-700/40 rounded-xl"><Gauge size={20} className="text-cyan-400" /></div>
            <div>
              <h1 className="text-lg font-bold text-white">System Performance Department</h1>
              <p className="text-gray-500 text-xs">System Performance · Distributed Traces · Business Correlation · Africa Carriers · AI Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statsData && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className={statsData.openAnomalies > 0 ? "text-red-400" : "text-gray-600"}>{statsData.openAnomalies} open anomalies</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-600">{statsData.endpoints} endpoints tracked</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/40 rounded-lg text-xs text-cyan-300">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              40 Endpoints · Prometheus · Live Socket · AI Explain
            </div>
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
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-all ${active ? `${tabColorMap[tab.color]} ${tabBgMap[tab.color]}` : "border-transparent text-gray-500 hover:text-gray-300"}`}>
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
        {activeTab === "pulse" && <LivePulseTab />}
        {activeTab === "servicemap" && <ServiceMapTab />}
        {activeTab === "slowqueries" && <SlowQueriesTab />}
        {activeTab === "errors" && <ErrorExplorerTab />}
        {activeTab === "alerts" && <AlertRulesTab />}
        {activeTab === "capacity" && <CapacityForecastTab />}
        {activeTab === "traces" && <DistributedTracesTab />}
        {activeTab === "correlation" && <BusinessCorrelationTab />}
        {activeTab === "signals" && <DeptSignalsTab />}
        {activeTab === "aiexplain" && <AiExplainTab />}
      </div>
    </div>
  );
}

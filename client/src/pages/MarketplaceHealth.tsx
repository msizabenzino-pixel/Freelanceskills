/**
 * Section 35 — Marketplace Health & Anomaly Detection v4.0
 * FreelanceSkills.net Admin Module
 * Real-Time KPIs · AI Anomaly Detection (7D) · Fraud Patterns · Quality Metrics · Executive Insights
 * Beats Datadog + New Relic + Sentry + Grafana + Elastic until 2030
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Anomaly { id: string; type: string; severity: string; zScore: number; value: number; expected: number; deviation: number; ts: string; acked: boolean; }
interface FraudPattern { id: string; pattern: string; count: number; userIds: string[]; ts: string; risk: string; action: string; }
interface QualityMetric { region: string; category: string; avgRating: number; completionRate: number; disputeRate: number; refundRate: number; score: number; trend: string; }
interface Insight { type: string; message: string; region: string; confidence: number; }

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: "rgba(239,68,68,0.2)", text: "#ef4444" },
    high: { bg: "rgba(249,115,22,0.2)", text: "#f97316" },
    medium: { bg: "rgba(234,179,8,0.2)", text: "#eab308" },
    low: { bg: "rgba(107,114,128,0.2)", text: "#9ca3af" },
  };
  const s = colors[severity] || colors.low;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: s.bg, color: s.text }}>{severity}</span>;
}

function MiniLineChart({ data }: { data: { ts: string; value: number }[] }) {
  if (data.length === 0) return <div className="text-xs text-gray-500">No data</div>;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const pct = ((d.value - min) / range) * 100;
    return `${(i / (data.length - 1)) * 100},${100 - pct}`;
  }).join(" ");
  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#1DBF73" strokeWidth="2" />
    </svg>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? "text-white" : "text-gray-500"}`}
      style={{ background: active ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", border: active ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </button>
  );
}

export default function MarketplaceHealth() {
  const [activeTab, setActiveTab] = useState<"kpis" | "anomalies" | "fraud" | "quality" | "insights">("kpis");
  const [selectedMetric, setSelectedMetric] = useState("gmvZar");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: summary } = useQuery({
    queryKey: ["/api/health/summary"],
    queryFn: () => fetch("/api/health/summary", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 30000,
  });

  const { data: timeline } = useQuery({
    queryKey: ["/api/health/kpi-timeline", selectedMetric],
    queryFn: () => fetch(`/api/health/kpi-timeline?metric=${selectedMetric}`, { credentials: "include" }).then(r => r.json()),
    staleTime: 20000,
  });

  const { data: anomalyData } = useQuery({
    queryKey: ["/api/health/anomalies"],
    queryFn: () => fetch("/api/health/anomalies", { credentials: "include" }).then(r => r.json()),
    staleTime: 10000, refetchInterval: 15000,
  });

  const { data: fraudData } = useQuery({
    queryKey: ["/api/health/fraud-patterns"],
    queryFn: () => fetch("/api/health/fraud-patterns", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 20000,
  });

  const { data: qualityData } = useQuery({
    queryKey: ["/api/health/quality-metrics"],
    queryFn: () => fetch("/api/health/quality-metrics", { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });

  const { data: healthScore } = useQuery({
    queryKey: ["/api/health/score"],
    queryFn: () => fetch("/api/health/score", { credentials: "include" }).then(r => r.json()),
    staleTime: 15000, refetchInterval: 30000,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/health/insights"],
    queryFn: () => fetch("/api/health/insights", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const { data: regions } = useQuery({
    queryKey: ["/api/health/regions"],
    queryFn: () => fetch("/api/health/regions", { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/health/categories"],
    queryFn: () => fetch("/api/health/categories", { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });

  const ackMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/health/anomalies/${id}/ack`, { method: "POST", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Anomaly acknowledged ✓" }); qc.invalidateQueries({ queryKey: ["/api/health/anomalies"] }); },
  });

  const quarantineMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/health/fraud-patterns/${id}/quarantine`, { method: "POST", credentials: "include" }).then(r => r.json()),
    onSuccess: (data: any) => { toast({ title: data.message }); qc.invalidateQueries({ queryKey: ["/api/health/fraud-patterns"] }); },
  });

  const s = (summary as any) || {};
  const h = (healthScore as any) || {};
  const a = (anomalyData as any) || {};
  const f = (fraudData as any) || {};
  const q = (qualityData as any) || {};
  const ins = (insights as any) || {};
  const reg = (regions as any) || {};
  const cat = (categories as any) || {};

  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Marketplace Health</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time KPIs · AI Anomaly Detection · Fraud Prevention</p>
            </div>
            <div className={`text-right p-4 rounded-2xl ${h.status === "critical" ? "bg-red-900/20 border border-red-900/40" : h.status === "warning" ? "bg-yellow-900/20 border border-yellow-900/40" : "bg-green-900/20 border border-green-900/40"}`}>
              <div className={`text-3xl font-bold ${h.status === "critical" ? "text-red-400" : h.status === "warning" ? "text-yellow-400" : "text-green-400"}`}>{h.score || 0}</div>
              <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">{h.status || "unknown"}</div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "GMV (ZAR)", value: s.kpis?.gmvZar, delta: s.deltas?.gmv, icon: "💰" },
            { label: "Conversions", value: s.kpis?.conversions, delta: s.deltas?.conversions, icon: "📈" },
            { label: "Churn (%)", value: s.kpis?.churn, delta: s.deltas?.churn, icon: "📉" },
            { label: "Active Users", value: s.kpis?.activeUsers, icon: "👥" },
            { label: "Avg Rating", value: s.kpis?.avgRating, icon: "⭐" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{kpi.icon}</span>
                {kpi.delta && <span className={`text-xs font-bold ${Number(kpi.delta) >= 0 ? "text-green-400" : "text-red-400"}`}>{Number(kpi.delta) > 0 ? "↑" : "↓"}{Math.abs(Number(kpi.delta)).toFixed(1)}%</span>}
              </div>
              <div className="text-xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["kpis", "anomalies", "fraud", "quality", "insights"] as const).map(t => (
            <TabButton key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
              {t === "kpis" ? "📊 KPIs" : t === "anomalies" ? "🔔 Anomalies" : t === "fraud" ? "🚨 Fraud" : t === "quality" ? "⭐ Quality" : "💡 Insights"}
            </TabButton>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "kpis" && (
            <>
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">KPI Timeline (7d)</h3>
                <div className="mb-3 flex gap-2">
                  {["gmvZar", "conversions", "churn", "activeUsers", "avgRating"].map(m => (
                    <button key={m} data-testid={`metric-${m}`}
                      onClick={() => setSelectedMetric(m)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${selectedMetric === m ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                      {m === "gmvZar" ? "GMV" : m === "conversions" ? "Conv" : m === "churn" ? "Churn" : m === "activeUsers" ? "Users" : "Rating"}
                    </button>
                  ))}
                </div>
                <MiniLineChart data={(timeline as any)?.timeline || []} />
              </div>
            </>
          )}

          {activeTab === "anomalies" && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total", value: a.summary?.total || 0, color: "#6b7280" },
                  { label: "Critical", value: a.summary?.critical || 0, color: "#ef4444" },
                  { label: "High", value: a.summary?.high || 0, color: "#f97316" },
                  { label: "Unacked", value: a.summary?.total - (a.anomalies?.filter((x: any) => x.acked).length || 0) || 0, color: "#f97316" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {(a.anomalies || []).slice(0, 15).map((anom: Anomaly) => (
                  <div key={anom.id} data-testid={`anomaly-${anom.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <SeverityBadge severity={anom.severity} />
                          <span className="text-xs text-gray-500 uppercase">{anom.type}</span>
                        </div>
                        <div className="text-sm font-bold text-white">z-score: {anom.zScore.toFixed(2)} (expected {anom.expected.toFixed(0)}, got {anom.value.toFixed(0)})</div>
                        <div className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(anom.ts), { addSuffix: true })}</div>
                      </div>
                      {!anom.acked && (
                        <button data-testid={`ack-${anom.id}`} onClick={() => ackMutation.mutate(anom.id)}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white ml-2" style={{ background: "#1DBF73" }}>ACK</button>
                      )}
                      {anom.acked && <span className="text-xs text-green-600 font-bold">✓ ACKED</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "fraud" && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Patterns", value: f.summary?.total || 0, color: "#ef4444" },
                  { label: "High Risk", value: f.summary?.highRisk || 0, color: "#ef4444" },
                  { label: "Active 24h", value: f.summary?.active24h || 0, color: "#f97316" },
                  { label: "Users at Risk", value: f.summary?.usersAtRisk || 0, color: "#f97316" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {(f.patterns || []).map((pattern: FraudPattern) => (
                  <div key={pattern.id} data-testid={`fraud-${pattern.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-white uppercase">{pattern.pattern.replace(/_/g, " ")}</span>
                          <SeverityBadge severity={pattern.risk} />
                        </div>
                        <div className="text-xs text-gray-500">{pattern.count} occurrences · {pattern.userIds.length} users flagged</div>
                        <div className="text-xs text-gray-600 mt-1">{formatDistanceToNow(new Date(pattern.ts), { addSuffix: true })}</div>
                      </div>
                      {pattern.action !== "quarantine" && (
                        <button data-testid={`quarantine-${pattern.id}`} onClick={() => quarantineMutation.mutate(pattern.id)}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white ml-2" style={{ background: "#ef4444" }}>QUARANTINE</button>
                      )}
                      {pattern.action === "quarantine" && <span className="text-xs text-red-600 font-bold">🔒 QUARANTINED</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "quality" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Regional Performance</h4>
                  <div className="space-y-2">
                    {(reg.regions || []).map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className="text-sm font-semibold text-white">{r.region}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 rounded-full bg-gray-700">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.health}%` }} />
                          </div>
                          <span className="text-sm font-bold" style={{ color: r.health >= 80 ? "#1DBF73" : r.health >= 60 ? "#f97316" : "#ef4444" }}>{r.health}%</span>
                          <span className="text-lg">{r.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Category Demand</h4>
                  <div className="space-y-2">
                    {(cat.categories || []).map((c: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-white">{c.category}</span>
                          <span className="text-xs text-gray-500 uppercase">{c.demand}</span>
                        </div>
                        <div className="text-xs text-gray-600">R{c.avgPrice.toLocaleString()} avg · {c.jobs} jobs</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Top Quality Metrics</h4>
                <div className="space-y-2">
                  {(q.metrics || []).slice(0, 10).map((m: QualityMetric, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div>
                        <span className="text-sm font-semibold text-white">{m.region} · {m.category}</span>
                        <div className="text-xs text-gray-600 mt-0.5">Rating {m.avgRating.toFixed(1)} · {m.completionRate.toFixed(0)}% completion</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: m.score >= 90 ? "#1DBF73" : m.score >= 70 ? "#f97316" : "#ef4444" }}>{m.score}</div>
                        <div className="text-lg">{m.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "insights" && (
            <div className="space-y-3">
              {(ins.insights || []).map((insight: Insight, i: number) => {
                const bgColor = insight.type === "alert" ? "rgba(239,68,68,0.1)" : insight.type === "opportunity" ? "rgba(29,191,115,0.1)" : insight.type === "risk" ? "rgba(249,115,22,0.1)" : "rgba(59,130,246,0.1)";
                const borderColor = insight.type === "alert" ? "rgba(239,68,68,0.3)" : insight.type === "opportunity" ? "rgba(29,191,115,0.3)" : insight.type === "risk" ? "rgba(249,115,22,0.3)" : "rgba(59,130,246,0.3)";
                const icon = insight.type === "alert" ? "🚨" : insight.type === "opportunity" ? "💡" : insight.type === "risk" ? "⚠️" : insight.type === "forecast" ? "🔮" : "📊";
                return (
                  <div key={i} className="rounded-xl p-4" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{insight.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 uppercase font-bold">{insight.type}</span>
                          <span className="text-xs text-gray-600">Confidence: {insight.confidence}%</span>
                          {insight.region !== "All" && <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{insight.region}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

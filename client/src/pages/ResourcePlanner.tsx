/**
 * Section 44 — Resource Planner v4.0
 * FreelanceSkills.net Admin Module
 * Utilization Heatmap · Capacity Forecast · Skill Matrix · Overload Alerts
 * Beats Teamdeck + Float + Resource.Guru + Harvest until 2030
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function ResourcePlanner() {
  const [tab, setTab] = useState<"dashboard" | "resources" | "forecast" | "skills">("dashboard");
  const { data: dash } = useQuery({ queryKey: ["/api/resources/dashboard"], queryFn: () => fetch("/api/resources/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: resources } = useQuery({ queryKey: ["/api/resources/list"], queryFn: () => fetch("/api/resources/list", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "resources" });
  const { data: forecast } = useQuery({ queryKey: ["/api/resources/capacity-forecast"], queryFn: () => fetch("/api/resources/capacity-forecast", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "forecast" });
  const { data: skills } = useQuery({ queryKey: ["/api/resources/skill-matrix"], queryFn: () => fetch("/api/resources/skill-matrix", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "skills" });
  const { data: alerts } = useQuery({ queryKey: ["/api/resources/alerts"], queryFn: () => fetch("/api/resources/alerts", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const d = (dash as any) || {};
  const utilizationColor = (u: number) => u > 85 ? "#ef4444" : u >= 60 ? "#1DBF73" : "#eab308";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Resource Planner</h1>
        <p className="text-sm text-gray-500 mb-6">Utilization Heatmap · Capacity Forecast · Skill Matrix · Burnout Alerts</p>
        {(alerts as any)?.alerts?.length > 0 && (
          <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="text-xs text-red-400 font-bold mb-1">⚠ {(alerts as any).total} Capacity Alerts</div>
            {((alerts as any).alerts || []).slice(0, 3).map((a: any, i: number) => <div key={i} className="text-xs text-gray-400">{a.message}</div>)}
          </div>
        )}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Resources", value: d.total || 0, color: "#6366f1" }, { label: "Avg Utilization", value: `${d.avgUtilization || 0}%`, color: "#1DBF73" }, { label: "Overloaded", value: d.overloaded || 0, color: "#ef4444" }, { label: "Idle", value: d.idle || 0, color: "#eab308" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "resources", "forecast", "skills"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#818cf8" : "#6b7280", border: tab === t ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "resources" ? "👥 Resources" : t === "forecast" ? "📈 Forecast" : "🧠 Skills"}</button>)}
        </div>
        {tab === "resources" && (
          <div className="space-y-2">
            {((resources as any)?.resources || []).map((r: any) => (
              <div key={r.id} data-testid={`resource-${r.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-white">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.role} · {r.region} · R{r.hourlyRate}/hr</div>
                    <div className="flex gap-1 mt-1 flex-wrap">{r.skills.map((s: string) => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s}</span>)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: utilizationColor(r.utilization) }}>{r.utilization}%</div>
                    <div className="text-[10px] text-gray-500">utilization</div>
                    <div className="text-[10px] text-gray-600">{r.allocatedJobs} jobs</div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{ width: `${r.utilization}%`, background: utilizationColor(r.utilization) }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "forecast" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3 mb-2">
              {((forecast as any)?.forecast || []).map((f: any) => (
                <div key={f.week} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-xs text-gray-500 mb-1">Week {f.week}</div>
                  <div className="text-2xl font-black text-white">{f.avgCapacity}%</div>
                  <div className="text-xs text-gray-500">avg capacity</div>
                  <div className="h-1.5 rounded-full bg-gray-800 mt-2"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${f.avgCapacity}%` }} /></div>
                </div>
              ))}
            </div>
            {((forecast as any)?.resources || []).map((r: any) => (
              <div key={r.name} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xs font-bold text-white mb-2">{r.name}</div>
                <div className="flex gap-2">{r.forecast.map((f: any) => <div key={f.week} className="flex-1"><div className="h-8 rounded bg-gray-800 flex items-end"><div className="w-full rounded bg-indigo-600" style={{ height: `${f.capacity}%` }} /></div><div className="text-[9px] text-gray-600 text-center mt-0.5">W{f.week}</div></div>)}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "skills" && (
          <div className="space-y-2">
            {((skills as any)?.skills || []).map((s: any) => (
              <div key={s.skill} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{s.skill}</span>
                  <span className="text-sm font-bold text-indigo-400">{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${(s.count / ((resources as any)?.total || 8)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-indigo-400">{d.avgUtilization || 0}%</div><div className="text-sm text-gray-400 mt-1">Avg Utilization</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-white">{(d.totalCapacity || 0).toFixed(0)}%</div><div className="text-sm text-gray-400 mt-1">Total Available Capacity</div></div></div>}
      </div>
    </div>
  );
}

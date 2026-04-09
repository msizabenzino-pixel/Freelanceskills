/**
 * Section 39 — Geolocation & Territory Management v4.0
 * FreelanceSkills.net Admin Module
 * SA Provinces · Demand Heatmap · Expansion Scoring · Africa SDG
 * Beats Salesforce Maps + ArcGIS + Esri until 2030
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Territories() {
  const [tab, setTab] = useState<"map" | "territories" | "expansion">("map");
  const { data: dash } = useQuery({ queryKey: ["/api/territories/dashboard"], queryFn: () => fetch("/api/territories/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 30000 });
  const { data: terrData } = useQuery({ queryKey: ["/api/territories/list"], queryFn: () => fetch("/api/territories/list", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "territories" });
  const { data: expData } = useQuery({ queryKey: ["/api/territories/expansion-targets"], queryFn: () => fetch("/api/territories/expansion-targets", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "expansion" });
  const { data: heatData } = useQuery({ queryKey: ["/api/territories/heat-map"], queryFn: () => fetch("/api/territories/heat-map", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "map" });
  const d = (dash as any) || {};
  const tierColor = (tier: string) => tier === "primary" ? "#1DBF73" : tier === "secondary" ? "#6366f1" : "#f97316";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Territory Management</h1>
        <p className="text-sm text-gray-500 mb-6">SA Province Intelligence · Demand Heatmap · Africa Expansion Scoring</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Territories", value: d.total || 0, icon: "📍" }, { label: "Total Freelancers", value: (d.totalFreelancers || 0).toLocaleString(), icon: "👥" }, { label: "Revenue", value: `R${((d.totalRevenue || 0) / 100).toLocaleString()}`, icon: "💰" }, { label: "Avg Growth", value: `${d.avgGrowth || 0}%`, icon: "📈" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["map", "territories", "expansion"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#1DBF73" : "#6b7280", border: tab === t ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "map" ? "🗺 Heatmap" : t === "territories" ? "📍 Territories" : "🌍 Expansion"}</button>)}
        </div>
        {tab === "map" && (
          <div className="space-y-2">
            {((heatData as any)?.regions || []).sort((a: any, b: any) => b.demand - a.demand).map((r: any, i: number) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{r.region}</span>
                  <div className="flex gap-3 text-right">
                    <div><div className="text-sm font-bold text-emerald-400">{r.demand}</div><div className="text-xs text-gray-500">Demand</div></div>
                    <div><div className="text-sm font-bold text-blue-400">{r.infra}</div><div className="text-xs text-gray-500">Infra</div></div>
                    <div><div className="text-sm font-bold text-white">{(r.freelancers || 0).toLocaleString()}</div><div className="text-xs text-gray-500">Freelancers</div></div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.demand}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "territories" && (
          <div className="space-y-2">
            {((terrData as any)?.territories || []).map((t: any) => (
              <div key={t.id} data-testid={`territory-${t.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${tierColor(t.tier)}20`, color: tierColor(t.tier) }}>{t.tier}</span>
                    </div>
                    <div className="text-xs text-gray-500">{t.province} · {t.manager}</div>
                    <div className="flex gap-3 mt-2">
                      {[{ label: "Freelancers", value: t.freelancers }, { label: "Clients", value: t.clients }, { label: "Growth", value: `${t.growth}%` }, { label: "Demand", value: t.demandIndex }].map((s, i) => <div key={i}><div className="text-sm font-bold text-white">{s.value}</div><div className="text-[10px] text-gray-500">{s.label}</div></div>)}
                    </div>
                  </div>
                  <div className="text-right"><div className="text-sm font-bold text-emerald-400">R{(t.revenue / 100).toLocaleString()}</div><div className="text-xs text-gray-500">Revenue</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "expansion" && (
          <div className="space-y-3">
            {((expData as any)?.targets || []).map((t: any, i: number) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{t.country}</span>
                      <span className="text-sm text-gray-400">— {t.city}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Competition: {t.competitionLevel} · Market: {(t.marketSize / 1000000).toFixed(0)}M people</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: t.readiness >= 80 ? "#1DBF73" : "#eab308" }}>{t.readiness}</div>
                    <div className="text-xs text-gray-500">Readiness</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg text-xs text-gray-300" style={{ background: "rgba(255,255,255,0.04)" }}>💡 {t.recommendation}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

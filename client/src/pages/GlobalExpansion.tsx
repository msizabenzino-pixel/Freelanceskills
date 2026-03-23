/**
 * Section 50 — Global Expansion & Localisation v4.0
 * 400% ELON MUSK GOD-MODE — SECTION 50 MILESTONE 🎉
 * Market Readiness Scoring · Localisation Engine · Africa-First · Multi-Currency · 7 Languages
 * Beats Deel + Remote + Velocity Global + Papaya Global until 2031
 * HALFWAY TO 100!
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function GlobalExpansion() {
  const [tab, setTab] = useState<"dashboard" | "markets" | "languages" | "currencies">("dashboard");
  const { data: dash } = useQuery({ queryKey: ["/api/expansion/dashboard"], queryFn: () => fetch("/api/expansion/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: markets } = useQuery({ queryKey: ["/api/expansion/markets"], queryFn: () => fetch("/api/expansion/markets", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "markets" });
  const { data: localisations } = useQuery({ queryKey: ["/api/expansion/localisations"], queryFn: () => fetch("/api/expansion/localisations", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "languages" });
  const { data: currencies } = useQuery({ queryKey: ["/api/expansion/currencies"], queryFn: () => fetch("/api/expansion/currencies", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "currencies" });
  const { data: scores } = useQuery({ queryKey: ["/api/expansion/readiness-scores"], queryFn: () => fetch("/api/expansion/readiness-scores", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "dashboard" });
  const d = (dash as any) || {};
  const statusColor = (s: string) => s === "live" ? "#1DBF73" : s === "planned" ? "#6366f1" : "#eab308";
  const statusIcon = (s: string) => s === "live" ? "🟢" : s === "planned" ? "📋" : "🔍";
  const readinessColor = (n: number) => n >= 85 ? "#1DBF73" : n >= 70 ? "#eab308" : "#ef4444";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-white">Global Expansion</h1>
          <div className="px-3 py-1 rounded-full text-xs font-black" style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>🎉 SECTION 50 — HALFWAY TO 100</div>
        </div>
        <p className="text-sm text-gray-500 mb-6">Africa-First · Market Readiness · Localisation Engine · 7 Languages · Multi-Currency</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Live Markets", value: d.live || 0, color: "#1DBF73" }, { label: "Planned", value: d.planned || 0, color: "#6366f1" }, { label: "Languages", value: d.languages || 0, color: "#eab308" }, { label: "Avg Readiness", value: `${d.avgReadiness || 0}%`, color: "#f97316" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "markets", "languages", "currencies"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)", color: tab === t ? "#FFD700" : "#6b7280", border: tab === t ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "markets" ? "🌍 Markets" : t === "languages" ? "🗣 Languages" : "💱 Currencies"}</button>)}
        </div>
        {tab === "markets" && (
          <div className="space-y-3">
            {((markets as any)?.markets || []).map((m: any) => (
              <div key={m.id} data-testid={`market-${m.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${statusColor(m.status)}20` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-bold text-white text-lg">{m.country}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${statusColor(m.status)}20`, color: statusColor(m.status) }}>{statusIcon(m.status)} {m.status}</span></div>
                    <div className="text-xs text-gray-500">{m.currency} · {m.language} · Pop: {(m.population / 1000000).toFixed(0)}M · Internet: {m.internetPenetration}%</div>
                    <div className="text-xs text-gray-500">Competition: {m.competitionLevel} · Mobile Money: {m.mobileMoneyAdoption}%</div>
                    {m.status === "live" && <div className="text-xs text-emerald-400 mt-0.5">{m.freelancers.toLocaleString()} freelancers · R{(m.gmv / 100).toLocaleString()} GMV</div>}
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-2xl font-black" style={{ color: readinessColor(m.readinessScore) }}>{m.readinessScore}</div>
                    <div className="text-[10px] text-gray-500">readiness</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg text-xs text-gray-400" style={{ background: "rgba(255,255,255,0.04)" }}>💡 {m.recommendation}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "languages" && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }}><div className="text-xs text-yellow-400 font-bold">Avg completion: {(localisations as any)?.avgCompletion || 0}% · Fully complete: {(localisations as any)?.fullyComplete || 0} locales</div></div>
            {((localisations as any)?.localisations || []).map((l: any) => (
              <div key={l.locale} data-testid={`locale-${l.locale}`} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                  <div><span className="font-bold text-white text-sm">{l.language}</span><span className="text-[10px] text-gray-500 ml-2">{l.locale}</span></div>
                  <div className="text-right"><span className="text-sm font-black text-white">{l.complete.toLocaleString()}</span><span className="text-xs text-gray-500">/{l.translations.toLocaleString()}</span></div>
                </div>
                <div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{ width: `${(l.complete / l.translations) * 100}%`, background: l.complete === l.translations ? "#1DBF73" : "#6366f1" }} /></div>
                <div className="text-[10px] text-gray-600 mt-0.5">{((l.complete / l.translations) * 100).toFixed(0)}% complete</div>
              </div>
            ))}
          </div>
        )}
        {tab === "currencies" && (
          <div className="space-y-2">
            {((currencies as any)?.currencies || []).map((c: any) => (
              <div key={c.code} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between">
                  <div><div className="font-bold text-white">{c.code} — {c.name}</div><div className="text-xs text-gray-500">Rate to ZAR: {c.rate}</div></div>
                  <div className="flex items-center gap-2">
                    {c.supported ? <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">LIVE</span> : <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-500 font-bold">PLANNED</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && (
          <div className="space-y-3">
            <div className="p-6 rounded-2xl text-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(29,191,115,0.08))", border: "1px solid rgba(255,215,0,0.2)" }}>
              <div className="text-5xl mb-2">🌍</div>
              <div className="text-2xl font-black text-white">50 of 100 Admin Sections Complete</div>
              <div className="text-sm text-yellow-400 font-bold mt-1">Halfway to the Most Advanced Freelance Platform in Africa</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {((scores as any)?.scores || []).slice(0, 4).map((s: any) => (
                <div key={s.country} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between">
                    <div><div className="font-bold text-white">{s.country}</div><div className="text-[10px] text-gray-500">{s.competition} competition</div></div>
                    <div className="text-xl font-black" style={{ color: readinessColor(s.score) }}>{s.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

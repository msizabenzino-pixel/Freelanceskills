/**
 * Section 46 — Platform Monetization v4.0
 * 400% ELON MUSK GOD-MODE
 * MRR · ARR · Revenue Streams · Pricing Experiments · 12-Month Forecast
 * Beats Stripe + ChartMogul + ProfitWell + Baremetrics until 2030
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Monetization() {
  const [tab, setTab] = useState<"dashboard" | "streams" | "experiments" | "forecast">("dashboard");
  const { data: dash } = useQuery({ queryKey: ["/api/monetization/dashboard"], queryFn: () => fetch("/api/monetization/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: streams } = useQuery({ queryKey: ["/api/monetization/streams"], queryFn: () => fetch("/api/monetization/streams", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "streams" });
  const { data: experiments } = useQuery({ queryKey: ["/api/monetization/experiments"], queryFn: () => fetch("/api/monetization/experiments", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "experiments" });
  const { data: forecast } = useQuery({ queryKey: ["/api/monetization/forecast"], queryFn: () => fetch("/api/monetization/forecast", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "forecast" });
  const d = (dash as any) || {};
  const typeColor = (t: string) => ({ subscription: "#1DBF73", commission: "#6366f1", feature: "#f97316", advertising: "#eab308", api: "#06b6d4" }[t] || "#9ca3af");
  const typeIcon = (t: string) => ({ subscription: "🔄", commission: "💸", feature: "⭐", advertising: "📣", api: "🔌" }[t] || "💰");
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Platform Monetization</h1>
        <p className="text-sm text-gray-500 mb-6">MRR · ARR · Revenue Streams · Pricing Experiments · AI Forecast</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "MRR", value: `R${((d.mrr || 0) / 100).toLocaleString()}`, color: "#1DBF73" }, { label: "ARR", value: `R${((d.arr || 0) / 100).toLocaleString()}`, color: "#6366f1" }, { label: "Avg Margin", value: `${d.avgMargin || 0}%`, color: "#f97316" }, { label: "Growth Rate", value: `${d.growthRate || 0}%`, color: "#eab308" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "streams", "experiments", "forecast"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#1DBF73" : "#6b7280", border: tab === t ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "streams" ? "💰 Revenue Streams" : t === "experiments" ? "🧪 Experiments" : "📈 Forecast"}</button>)}
        </div>
        {tab === "streams" && (
          <div className="space-y-2">
            {((streams as any)?.streams || []).map((s: any) => (
              <div key={s.id} data-testid={`stream-${s.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{typeIcon(s.type)}</div>
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-xs text-gray-500">Margin: {s.margin}% · Growth: +{s.growth}%/mo</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black" style={{ color: typeColor(s.type) }}>R{(s.monthly / 100).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">monthly</div>
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{ width: `${s.margin}%`, background: typeColor(s.type) }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "experiments" && (
          <div className="space-y-3">
            {((experiments as any)?.experiments || []).map((e: any) => (
              <div key={e.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: e.winner ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-bold text-white">{e.name}</span>{e.winner && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">WINNER</span>}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Variant: {e.variant}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: e.conversionLift > 0 ? "#1DBF73" : "#ef4444" }}>{e.conversionLift > 0 ? "+" : ""}{e.conversionLift}% conv.</div>
                    <div className="text-xs text-gray-500">R{(e.revenueImpact / 100).toLocaleString()} impact</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "forecast" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="rounded-xl p-4" style={{ background: "rgba(29,191,115,0.08)", border: "1px solid rgba(29,191,115,0.2)" }}><div className="text-xs text-gray-500">Current MRR</div><div className="text-2xl font-black text-emerald-400">R{((forecast as any)?.currentMRR / 100 || 0).toLocaleString()}</div></div>
              <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}><div className="text-xs text-gray-500">Projected ARR (12mo)</div><div className="text-2xl font-black text-indigo-400">R{((forecast as any)?.projectedARR / 100 || 0).toLocaleString()}</div></div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-xs text-gray-500 mb-3">12-Month MRR Forecast</div>
              <div className="flex items-end gap-1 h-24">{((forecast as any)?.forecast || []).map((f: any) => { const max = Math.max(...((forecast as any)?.forecast || []).map((x: any) => x.mrr)); return (<div key={f.month} className="flex-1 flex flex-col items-center"><div className="w-full rounded-t" style={{ height: `${(f.mrr / max) * 80}px`, background: "#1DBF73", opacity: 0.4 + (f.month / 12) * 0.6 }} /><div className="text-[8px] text-gray-600 mt-0.5">{f.month}</div></div>); })}</div>
            </div>
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-3xl font-black text-emerald-400">{d.streams || 0} streams</div><div className="text-sm text-gray-400 mt-1">Top: {d.topStream}</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-3xl font-black text-white">{d.experiments || 0}</div><div className="text-sm text-gray-400 mt-1">Pricing Experiments</div></div></div>}
      </div>
    </div>
  );
}

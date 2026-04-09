/**
 * Section 42 — Customer Success v4.0
 * FreelanceSkills.net Admin Module
 * Account Health · Churn Risk · NPS · LTV · Upsell Opportunities
 * Beats Gainsight + ChurnZero + Totango + Mixpanel until 2030
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function CustomerSuccess() {
  const [tab, setTab] = useState<"dashboard" | "accounts" | "nps" | "upsell">("dashboard");
  const [riskFilter, setRiskFilter] = useState("");
  const { data: dash } = useQuery({ queryKey: ["/api/customer-success/dashboard"], queryFn: () => fetch("/api/customer-success/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: accounts } = useQuery({ queryKey: ["/api/customer-success/accounts", riskFilter], queryFn: () => fetch(`/api/customer-success/accounts${riskFilter ? `?risk=${riskFilter}` : ""}`, { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "accounts" });
  const { data: nps } = useQuery({ queryKey: ["/api/customer-success/nps"], queryFn: () => fetch("/api/customer-success/nps", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "nps" });
  const { data: upsell } = useQuery({ queryKey: ["/api/customer-success/upsell"], queryFn: () => fetch("/api/customer-success/upsell", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "upsell" });
  const d = (dash as any) || {};
  const riskColor = (r: string) => r === "low" ? "#1DBF73" : r === "medium" ? "#eab308" : "#ef4444";
  const statusColor = (s: string) => s === "healthy" ? "#1DBF73" : s === "at-risk" ? "#eab308" : "#ef4444";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Customer Success</h1>
        <p className="text-sm text-gray-500 mb-6">Account Health Scoring · Churn Risk · NPS · LTV · Upsell Intelligence</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Healthy", value: d.healthy || 0, color: "#1DBF73" }, { label: "At-Risk", value: d.atRisk || 0, color: "#eab308" }, { label: "NPS Score", value: d.nps || "--", color: "#6366f1" }, { label: "Upsell Opps", value: d.upsellOpps || 0, color: "#f97316" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs text-gray-500 mb-1">Avg Health Score</div>
            <div className="text-2xl font-black text-white">{d.avgHealth || 0}</div>
            <div className="h-2 rounded-full bg-gray-800 mt-2"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.avgHealth || 0}%` }} /></div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs text-gray-500 mb-1">Total LTV</div>
            <div className="text-2xl font-black text-white">R{((d.totalLtv || 0) / 100).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "accounts", "nps", "upsell"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#1DBF73" : "#6b7280", border: tab === t ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "accounts" ? "👥 Accounts" : t === "nps" ? "💬 NPS" : "📈 Upsell"}</button>)}
        </div>
        {tab === "accounts" && (
          <div className="space-y-2">
            <div className="flex gap-2 mb-3">{["", "low", "medium", "high"].map(r => <button key={r} onClick={() => setRiskFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${riskFilter === r ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-400"}`}>{r || "All Risk"}</button>)}</div>
            {((accounts as any)?.accounts || []).map((a: any) => (
              <div key={a.id} data-testid={`account-${a.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{a.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${statusColor(a.status)}20`, color: statusColor(a.status) }}>{a.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">{a.type} · {a.plan} · CSM: {a.csm}</div>
                    {a.upsellOpportunity !== "None" && <div className="text-xs text-orange-400 mt-0.5">↑ Upsell: {a.upsellOpportunity}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: riskColor(a.churnRisk) }}>{a.healthScore}</div>
                    <div className="text-[10px] text-gray-500">health</div>
                    <div className="text-xs text-gray-400 mt-0.5">R{(a.ltv / 100).toLocaleString()} LTV</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "nps" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[{ label: "NPS Score", value: (nps as any)?.npsScore || 0, color: "#1DBF73" }, { label: "Promoters", value: (nps as any)?.promoters || 0, color: "#6366f1" }, { label: "Detractors", value: (nps as any)?.detractors || 0, color: "#ef4444" }].map((s, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {((nps as any)?.responses || []).slice(0, 8).map((r: any, i: number) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{r.name}</span>
                  <div className="flex gap-0.5">{Array.from({ length: 10 }, (_, j) => <div key={j} className="w-2 h-2 rounded-sm" style={{ background: j < r.score ? "#1DBF73" : "#374151" }} />)}</div>
                </div>
                <div className="text-xs text-gray-500 italic">"{r.comment}"</div>
              </div>
            ))}
          </div>
        )}
        {tab === "upsell" && (
          <div className="space-y-2">
            {((upsell as any)?.opportunities || []).map((a: any) => (
              <div key={a.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between">
                  <div><div className="font-bold text-white text-sm">{a.name}</div><div className="text-xs text-orange-400">{a.upsellOpportunity}</div></div>
                  <div className="text-right"><div className="text-sm font-bold text-emerald-400">R{(a.ltv / 100).toLocaleString()}</div><div className="text-xs text-gray-500">LTV</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="p-4 rounded-xl mt-4" style={{ background: "rgba(29,191,115,0.06)", border: "1px solid rgba(29,191,115,0.15)" }}><div className="text-xs text-emerald-400 font-bold">Total accounts: {d.total || 0} · Churned: {d.churned || 0} · Avg Health: {d.avgHealth || 0}/100</div></div>}
      </div>
    </div>
  );
}

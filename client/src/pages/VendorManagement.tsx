/**
 * Section 47 — Supplier & Vendor Management v4.0
 * 400% ELON MUSK GOD-MODE
 * Vendor Registry · SLA Tracking · Spend Analysis · Risk Rating · Category Breakdown
 * Beats SAP Ariba + Coupa + Jaggaer + Procurify until 2030
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function VendorManagement() {
  const [tab, setTab] = useState<"dashboard" | "vendors" | "spend">("dashboard");
  const { data: dash } = useQuery({ queryKey: ["/api/vendors/dashboard"], queryFn: () => fetch("/api/vendors/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: vendors } = useQuery({ queryKey: ["/api/vendors/list"], queryFn: () => fetch("/api/vendors/list", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "vendors" });
  const { data: spend } = useQuery({ queryKey: ["/api/vendors/spend-analysis"], queryFn: () => fetch("/api/vendors/spend-analysis", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "spend" });
  const d = (dash as any) || {};
  const riskColor = (r: string) => r === "low" ? "#1DBF73" : r === "medium" ? "#eab308" : "#ef4444";
  const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Vendor Management</h1>
        <p className="text-sm text-gray-500 mb-6">Vendor Registry · SLA Tracking · Spend Intelligence · Risk Rating</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Vendors", value: d.total || 0, icon: "🏭" }, { label: "Total Spend", value: `R${((d.totalSpend || 0) / 100).toLocaleString()}`, icon: "💰" }, { label: "Avg SLA Score", value: `${d.avgSLA || 0}%`, icon: "📊" }, { label: "Categories", value: d.categories || 0, icon: "📂" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "vendors", "spend"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#fb923c" : "#6b7280", border: tab === t ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "vendors" ? "🏭 Vendors" : "💰 Spend Analysis"}</button>)}
        </div>
        {tab === "vendors" && (
          <div className="space-y-2">
            {((vendors as any)?.vendors || []).map((v: any) => (
              <div key={v.id} data-testid={`vendor-${v.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{v.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-bold">{v.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${riskColor(v.risk)}15`, color: riskColor(v.risk) }}>{v.risk} risk</span>
                    </div>
                    <div className="text-xs text-gray-500">{v.contact} · {v.country} · {v.paymentTerms}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">{v.services.map((s: string) => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s}</span>)}</div>
                    <div className="text-xs text-yellow-400 mt-1">{stars(v.rating)} {v.rating}/5</div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-bold text-white">R{(v.spend / 100).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">annual spend</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{v.slaScore}%</div>
                    <div className="text-xs text-gray-500">SLA score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "spend" && (
          <div className="space-y-3">
            <div className="rounded-xl p-4 mb-2" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}><div className="text-sm font-bold text-orange-400">Total Annual Spend: R{(((spend as any)?.total || 0) / 100).toLocaleString()}</div></div>
            {Object.entries((spend as any)?.byCategory || {}).map(([cat, amount]: any) => (
              <div key={cat} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{cat}</span>
                  <span className="text-sm font-bold text-orange-400">R{(amount / 100).toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-orange-500" style={{ width: `${(amount / ((spend as any)?.total || 1)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-3xl font-black text-orange-400">{d.avgRating || 0}</div><div className="text-sm text-gray-400 mt-1">Avg Vendor Rating</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}><div className="text-3xl font-black text-red-400">{d.highRisk || 0}</div><div className="text-sm text-gray-400 mt-1">High Risk Vendors</div></div></div>}
      </div>
    </div>
  );
}

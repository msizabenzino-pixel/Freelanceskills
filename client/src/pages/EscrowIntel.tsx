/**
 * Section 45 — Escrow Intelligence v4.0
 * 400% ELON MUSK GOD-MODE
 * Escrow Analytics · Milestone Tracking · Risk Analysis · Auto-Release · Dispute Prevention
 * Beats Escrow.com + PaySafe + Stripe-Connect until 2030
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EscrowIntel() {
  const [tab, setTab] = useState<"dashboard" | "escrow" | "risk">("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/escrow-intel/dashboard"], queryFn: () => fetch("/api/escrow-intel/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: escrowList } = useQuery({ queryKey: ["/api/escrow-intel/list", statusFilter], queryFn: () => fetch(`/api/escrow-intel/list${statusFilter ? `?status=${statusFilter}` : ""}`, { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "escrow" });
  const { data: risk } = useQuery({ queryKey: ["/api/escrow-intel/risk-analysis"], queryFn: () => fetch("/api/escrow-intel/risk-analysis", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "risk" });
  const releaseMut = useMutation({ mutationFn: (id: string) => fetch(`/api/escrow-intel/${id}/release`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Escrow released ✓" }); qc.invalidateQueries({ queryKey: ["/api/escrow-intel"] }); } });
  const disputeMut = useMutation({ mutationFn: (id: string) => fetch(`/api/escrow-intel/${id}/dispute`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Dispute opened" }); qc.invalidateQueries({ queryKey: ["/api/escrow-intel"] }); } });
  const d = (dash as any) || {};
  const statusColor = (s: string) => ({ held: "#6366f1", released: "#1DBF73", disputed: "#ef4444", refunded: "#eab308" }[s] || "#9ca3af");
  const riskColor = (n: number) => n > 70 ? "#ef4444" : n > 40 ? "#eab308" : "#1DBF73";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Escrow Intelligence</h1>
        <p className="text-sm text-gray-500 mb-6">Smart Escrow · Milestone Tracking · AI Risk Scoring · Auto-Release Engine</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Held", value: `R${((d.totalHeld || 0) / 100).toLocaleString()}`, icon: "🔒", color: "#6366f1" }, { label: "In Escrow", value: d.held || 0, icon: "💰", color: "#1DBF73" }, { label: "Disputed", value: d.disputed || 0, icon: "⚠", color: "#ef4444" }, { label: "High Risk", value: d.highRisk || 0, icon: "🚨", color: "#f97316" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "escrow", "risk"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#818cf8" : "#6b7280", border: tab === t ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "escrow" ? "🔒 Escrow Records" : "🧮 Risk Analysis"}</button>)}
        </div>
        {tab === "escrow" && (
          <div className="space-y-2">
            <div className="flex gap-2 mb-3 flex-wrap">{["", "held", "released", "disputed"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusFilter === s ? "bg-indigo-700 text-white" : "bg-gray-800 text-gray-400"}`}>{s || "All"}</button>)}</div>
            {((escrowList as any)?.records || []).map((e: any) => (
              <div key={e.id} data-testid={`escrow-${e.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-blue-400">{e.orderId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${statusColor(e.status)}20`, color: statusColor(e.status) }}>{e.status}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${riskColor(e.riskScore)}15`, color: riskColor(e.riskScore) }}>Risk {e.riskScore}</span>
                    </div>
                    <div className="text-sm text-white">{e.freelancerName} → {e.clientName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Held: {format(new Date(e.holdDate), "MMM d")} {e.autoReleaseAt ? `· Auto-release: ${format(new Date(e.autoReleaseAt), "MMM d")}` : ""}</div>
                    <div className="flex gap-2 mt-1">{(e.milestones || []).map((m: any, i: number) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: m.status === "released" ? "rgba(29,191,115,0.2)" : m.status === "approved" ? "rgba(99,102,241,0.2)" : "rgba(107,114,128,0.2)", color: m.status === "released" ? "#1DBF73" : m.status === "approved" ? "#818cf8" : "#9ca3af" }}>{m.title}</span>)}</div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-bold text-white">R{(e.amount / 100).toLocaleString()}</div>
                    {e.status === "held" && <div className="flex gap-1 mt-1"><button data-testid={`release-${e.id}`} onClick={() => releaseMut.mutate(e.id)} className="px-2 py-1 rounded text-[10px] font-bold text-white bg-emerald-700">Release</button><button data-testid={`dispute-${e.id}`} onClick={() => disputeMut.mutate(e.id)} className="px-2 py-1 rounded text-[10px] font-bold text-red-400 bg-red-900/30">Dispute</button></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "risk" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[{ label: "Avg Risk Score", value: (risk as any)?.avgRisk || 0, color: "#eab308" }, { label: "High Risk Count", value: ((risk as any)?.highRisk?.length || 0), color: "#ef4444" }, { label: "Risk Factors", value: ((risk as any)?.riskFactors?.length || 0), color: "#6366f1" }].map((s, i) => <div key={i} className="rounded-xl p-4 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}><div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div><div className="text-xs text-gray-500 mt-1">{s.label}</div></div>)}
            </div>
            <div className="space-y-2">{((risk as any)?.highRisk || []).map((h: any) => (<div key={h.id} className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}><div className="flex items-center justify-between"><span className="text-sm text-white">{h.client}</span><div className="flex gap-3"><div className="text-right"><div className="text-sm font-bold text-red-400">{h.riskScore}</div><div className="text-[10px] text-gray-500">risk</div></div><div className="text-right"><div className="text-sm font-bold text-white">R{(h.amount / 100).toLocaleString()}</div><div className="text-[10px] text-gray-500">held</div></div></div></div></div>))}</div>
            <div className="p-4 rounded-xl mt-2" style={{ background: "rgba(255,255,255,0.04)" }}><div className="text-xs text-gray-400 font-bold mb-2">Risk Factors</div>{((risk as any)?.riskFactors || []).map((f: string, i: number) => <div key={i} className="text-xs text-gray-500 py-1">⚠ {f}</div>)}</div>
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-indigo-400">{d.autoReleasesPending || 0}</div><div className="text-sm text-gray-400 mt-1">Auto-Releases Pending</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-sm font-bold text-gray-400 mb-1">Avg Hold Duration</div><div className="text-3xl font-black text-white">{d.avgHoldDays || 0} days</div></div></div>}
      </div>
    </div>
  );
}

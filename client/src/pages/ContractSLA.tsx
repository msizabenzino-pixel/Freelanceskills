/**
 * Section 43 — Contract & SLA Management v4.0
 * FreelanceSkills.net Admin Module
 * Contract CRUD · SLA Breach Alerts · Template Library · Auto-Renew · Penalties
 * Beats DocuSign + PandaDoc + Ironclad + LinkSquares until 2030
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ContractSLA() {
  const [tab, setTab] = useState<"dashboard" | "contracts" | "breaches" | "templates">("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/contracts/dashboard"], queryFn: () => fetch("/api/contracts/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: contractList } = useQuery({ queryKey: ["/api/contracts/list", statusFilter], queryFn: () => fetch(`/api/contracts/list${statusFilter ? `?status=${statusFilter}` : ""}`, { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "contracts" });
  const { data: breaches } = useQuery({ queryKey: ["/api/contracts/sla-breaches"], queryFn: () => fetch("/api/contracts/sla-breaches", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "breaches" });
  const { data: templates } = useQuery({ queryKey: ["/api/contracts/templates"], queryFn: () => fetch("/api/contracts/templates", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "templates" });
  const signMut = useMutation({ mutationFn: (id: string) => fetch(`/api/contracts/${id}/sign`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Contract signed & activated ✓" }); qc.invalidateQueries({ queryKey: ["/api/contracts"] }); } });
  const resolveMut = useMutation({ mutationFn: (id: string) => fetch(`/api/contracts/sla-breaches/${id}/resolve`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Breach resolved" }); qc.invalidateQueries({ queryKey: ["/api/contracts/sla-breaches"] }); } });
  const d = (dash as any) || {};
  const statusColor = (s: string) => ({ active: "#1DBF73", expired: "#6b7280", breached: "#ef4444", completed: "#6366f1", draft: "#9ca3af" }[s] || "#9ca3af");
  const severityColor = (s: string) => s === "critical" ? "#ef4444" : s === "major" ? "#f97316" : "#eab308";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Contract & SLA Management</h1>
        <p className="text-sm text-gray-500 mb-6">Contract CRUD · SLA Breach Detection · Templates · Penalty Engine</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Active Contracts", value: d.active || 0, color: "#1DBF73" }, { label: "Breached", value: d.breached || 0, color: "#ef4444" }, { label: "Total Value", value: `R${((d.totalValue || 0) / 100).toLocaleString()}`, color: "#6366f1" }, { label: "Unresolved Breaches", value: d.unresolvedBreaches || 0, color: "#f97316" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "contracts", "breaches", "templates"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#f87171" : "#6b7280", border: tab === t ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "contracts" ? "📋 Contracts" : t === "breaches" ? "🚨 Breaches" : "📁 Templates"}</button>)}
        </div>
        {tab === "contracts" && (
          <div className="space-y-2">
            <div className="flex gap-2 mb-3">{["", "active", "breached", "draft", "completed"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusFilter === s ? "bg-red-700 text-white" : "bg-gray-800 text-gray-400"}`}>{s || "All"}</button>)}</div>
            {((contractList as any)?.contracts || []).map((c: any) => (
              <div key={c.id} data-testid={`contract-${c.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{c.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${statusColor(c.status)}20`, color: statusColor(c.status) }}>{c.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">{c.freelancerName} → {c.clientName} · {c.type.replace("_", " ")}</div>
                    <div className="text-xs text-gray-600 mt-0.5">SLA: {c.slaResponse}h response · {c.slaResolution}h resolution · Penalty: {c.penaltyClause}%</div>
                    {c.startDate && <div className="text-xs text-gray-600">{format(new Date(c.startDate), "MMM d, yyyy")} {c.endDate ? `→ ${format(new Date(c.endDate), "MMM d, yyyy")}` : ""}</div>}
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-bold text-emerald-400">R{(c.value / 100).toLocaleString()}</div>
                    {c.status === "draft" && <button data-testid={`sign-${c.id}`} onClick={() => signMut.mutate(c.id)} className="mt-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-700 text-white">Sign</button>}
                    {c.autoRenew && <div className="text-[10px] text-blue-400 mt-0.5">AUTO-RENEW</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "breaches" && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}><div className="text-xs text-red-400 font-bold">🚨 {(breaches as any)?.unresolved || 0} Unresolved SLA Breaches — Immediate Action Required</div></div>
            {((breaches as any)?.breaches || []).map((b: any) => (
              <div key={b.id} data-testid={`breach-${b.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: b.resolved ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(239,68,68,0.2)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{b.clientName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${severityColor(b.severity)}20`, color: severityColor(b.severity) }}>{b.severity}</span>
                    </div>
                    <div className="text-xs text-gray-400">{b.description}</div>
                    <div className="text-xs text-red-400 mt-0.5">Penalty: R{(b.penalty / 100).toLocaleString()}</div>
                  </div>
                  {!b.resolved && <button data-testid={`resolve-${b.id}`} onClick={() => resolveMut.mutate(b.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 ml-2">Resolve</button>}
                  {b.resolved && <span className="text-xs text-emerald-400 font-bold ml-2">RESOLVED</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "templates" && (
          <div className="space-y-3">
            {((templates as any)?.templates || []).map((t: any, i: number) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-gray-500 mt-1">Type: {t.type.replace("_", " ")} · {t.clauses} standard clauses</div>
                <button className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-900/40 text-indigo-400">Use Template</button>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-white">{d.total || 0}</div><div className="text-sm text-gray-400 mt-1">Total Contracts</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}><div className="text-4xl font-black text-red-400">{d.slaBreaches || 0}</div><div className="text-sm text-gray-400 mt-1">Total SLA Breaches</div></div></div>}
      </div>
    </div>
  );
}

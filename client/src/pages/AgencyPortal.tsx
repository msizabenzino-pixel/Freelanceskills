/**
 * Section 40 — White Label & Agency Portal v4.0
 * FreelanceSkills.net Admin Module
 * Agency Management · White Label Config · Sub-accounts · Branded Portals

 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AgencyPortal() {
  const [tab, setTab] = useState<"dashboard" | "agencies" | "plans">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/agency/dashboard"], queryFn: () => fetch("/api/agency/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: agencyList } = useQuery({ queryKey: ["/api/agency/list"], queryFn: () => fetch("/api/agency/list", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "agencies" });
  const { data: plans } = useQuery({ queryKey: ["/api/agency/plans"], queryFn: () => fetch("/api/agency/plans", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "plans" });
  const suspendMut = useMutation({ mutationFn: (id: string) => fetch(`/api/agency/${id}/suspend`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Agency suspended" }); qc.invalidateQueries({ queryKey: ["/api/agency"] }); } });
  const d = (dash as any) || {};
  const planColor = (plan: string) => plan === "enterprise" ? "#FFD700" : plan === "growth" ? "#1DBF73" : "#6b7280";
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Agency & White Label Portal</h1>
        <p className="text-sm text-gray-500 mb-6">Agency Management · White Label Config · Sub-accounts · Branded Portals</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Total Agencies", value: d.total || 0, icon: "🏢" }, { label: "Enterprise", value: d.enterprise || 0, icon: "⭐" }, { label: "Freelancers", value: d.totalFreelancers || 0, icon: "👥" }, { label: "Monthly GMV", value: `R${((d.totalGMV || 0) / 100).toLocaleString()}`, icon: "💰" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "agencies", "plans"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#1DBF73" : "#6b7280", border: tab === t ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "agencies" ? "🏢 Agencies" : "📦 Plans"}</button>)}
        </div>
        {tab === "agencies" && (
          <div className="space-y-3">
            {((agencyList as any)?.agencies || []).map((a: any) => (
              <div key={a.id} data-testid={`agency-${a.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${a.brandColor}20` }}>{a.logo}</div>
                    <div>
                      <div className="flex items-center gap-2"><span className="font-bold text-white">{a.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${planColor(a.plan)}20`, color: planColor(a.plan) }}>{a.plan}</span>{a.whiteLabel && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 font-bold">WHITE LABEL</span>}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.owner} · {a.commissionRate}% commission</div>
                      {a.domain && <div className="text-xs text-blue-400 mt-0.5">{a.domain}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">R{(a.monthlyGMV / 100).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{a.freelancers} freelancers</div>
                    {a.status === "active" && <button data-testid={`suspend-${a.id}`} onClick={() => suspendMut.mutate(a.id)} className="mt-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-red-900/40 text-red-400">Suspend</button>}
                    {a.status === "suspended" && <span className="text-xs text-red-400 font-bold">SUSPENDED</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "plans" && (
          <div className="grid grid-cols-3 gap-4">
            {((plans as any)?.plans || []).map((p: any, i: number) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-lg font-black text-white mb-1">{p.name}</div>
                <div className="text-3xl font-black text-emerald-400 mb-3">R{(p.price / 100).toFixed(0)}<span className="text-sm text-gray-500">/mo</span></div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div>✓ {p.freelancers === -1 ? "Unlimited" : p.freelancers} freelancers</div>
                  <div>✓ {p.commission}% commission rate</div>
                  {p.whiteLabel && <div>✓ White label branding</div>}
                  {p.domain && <div>✓ Custom domain</div>}
                  {p.api && <div>✓ Full API access</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-emerald-400">{d.whiteLabelActive || 0}</div><div className="text-sm text-gray-400 mt-1">White Label Active</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-white">{d.total || 0}</div><div className="text-sm text-gray-400 mt-1">Total Agencies</div></div></div>}
      </div>
    </div>
  );
}

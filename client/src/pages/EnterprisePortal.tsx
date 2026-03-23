import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function EnterprisePortal() {
  const [tab, setTab] = useState<"dashboard"|"clients"|"approvals">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/enterprise/dashboard"], queryFn:()=>fetch("/api/enterprise/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: clients } = useQuery({ queryKey:["/api/enterprise/clients"], queryFn:()=>fetch("/api/enterprise/clients",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="clients" });
  const { data: approvals } = useQuery({ queryKey:["/api/enterprise/approval-queue"], queryFn:()=>fetch("/api/enterprise/approval-queue",{credentials:"include"}).then(r=>r.json()), staleTime:10000, enabled:tab==="approvals" });
  const d=(dash as any)||{};
  const tierColor=(t:string)=>({gold:"#eab308",platinum:"#9ca3af",diamond:"#818cf8"}[t]||"#9ca3af");
  const tierIcon=(t:string)=>({gold:"⭐",platinum:"💎",diamond:"💠"}[t]||"📋");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Enterprise Client Portal</h1>
        <p className="text-sm text-gray-500 mb-5">Gold · Platinum · Diamond Tiers · Budget Management · Approval Workflows · Dedicated CSM</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Enterprise Clients",v:d.total||0,c:"#818cf8"},{l:"Diamond Tier",v:d.diamond||0,c:"#6366f1"},{l:"Total Budget",v:`R${((d.totalBudget||0)/100/1000000).toFixed(1)}M`,c:"#1DBF73"},{l:"Budget Utilization",v:`${d.avgBudgetUtilization||0}%`,c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","clients","approvals"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(129,140,248,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(129,140,248,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="clients"&&<div className="space-y-3">{((clients as any)?.clients||[]).map((c:any)=><div key={c.id} data-testid={`enterprise-${c.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${tierColor(c.tier)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span>{tierIcon(c.tier)}</span><span className="font-bold text-white text-base">{c.company}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${tierColor(c.tier)}20`,color:tierColor(c.tier)}}>{c.tier}</span></div><div className="text-xs text-gray-500">{c.contact} · CSM: {c.dedicatedCSM} · {c.paymentTerms}</div><div className="text-xs text-gray-600 mt-0.5">{c.activeProjects} projects · {c.freelancersManaged} freelancers</div></div><div className="text-right"><div className="text-sm font-bold text-white">R{((c.monthlyBudget||0)/100/1000).toFixed(0)}K/mo</div><div className="text-xs text-emerald-400">{((c.spent/c.monthlyBudget)*100).toFixed(0)}% used</div></div></div></div>)}</div>}
        {tab==="approvals"&&<div className="space-y-2">{((approvals as any)?.pending||[]).map((a:any)=><div key={a.id} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(129,140,248,0.2)"}}><div className="flex justify-between"><div><div className="text-sm font-bold text-white">{a.description}</div><div className="text-xs text-gray-500">{a.company} · submitted by {a.submittedBy}</div></div><div className="text-right"><div className="text-sm font-bold text-indigo-400">R{(a.amount/100).toLocaleString()}</div><div className="flex gap-1 mt-1"><button className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Approve</button><button className="px-2 py-1 rounded text-[10px] font-bold bg-gray-700 text-white">Reject</button></div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(129,140,248,0.07)",border:"1px solid rgba(129,140,248,0.2)"}}><div className="text-4xl font-black text-indigo-400">R{((d.totalSpent||0)/100/1000000).toFixed(1)}M</div><div className="text-sm text-gray-400 mt-1">Monthly Spend</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.totalFreelancers||0}</div><div className="text-sm text-gray-400 mt-1">Managed Freelancers</div></div></div>}
      </div>
    </div>
  );
}

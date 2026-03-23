import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function RiskInsurance() {
  const [tab, setTab] = useState<"dashboard"|"products"|"alerts">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/risk-insurance/dashboard"], queryFn:()=>fetch("/api/risk-insurance/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: products } = useQuery({ queryKey:["/api/risk-insurance/products"], queryFn:()=>fetch("/api/risk-insurance/products",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="products" });
  const { data: alerts } = useQuery({ queryKey:["/api/risk-insurance/alerts"], queryFn:()=>fetch("/api/risk-insurance/alerts",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="alerts" });
  const d=(dash as any)||{};
  const sevColor=(s:string)=>s==="high"?"#ef4444":s==="medium"?"#f97316":"#eab308";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Risk & Insurance</h1>
        <p className="text-sm text-gray-500 mb-5">Professional Indemnity · Public Liability · Cyber Liability · Risk Alerts · Claims Management</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Insurance Products",v:d.products||0,c:"#6366f1"},{l:"Total Policies",v:(d.totalPolicies||0).toLocaleString(),c:"#1DBF73"},{l:"Risk Alerts",v:d.riskAlerts||0,c:"#f97316"},{l:"High Risk",v:d.highRisk||0,c:"#ef4444"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","products","alerts"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="products"&&<div className="space-y-3">{((products as any)||[]).map((p:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(99,102,241,0.15)"}}><div className="flex items-start justify-between"><div><div className="font-bold text-white mb-0.5">{p.name}</div><div className="text-xs text-gray-500">{p.provider} · {p.policyCount.toLocaleString()} active policies</div><div className="text-xs text-gray-400 mt-1">{p.description}</div></div><div className="text-right ml-4"><div className="text-lg font-black text-indigo-400">R{(p.coverage/100/1000000).toFixed(1)}M</div><div className="text-xs text-gray-500">coverage</div><div className="text-sm text-white mt-1">R{(p.premium/100).toLocaleString()}/mo</div></div></div></div>)}</div>}
        {tab==="alerts"&&<div className="space-y-2">{((alerts as any)||[]).map((a:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sevColor(a.severity)}20`}}><div className="flex items-center justify-between mb-1"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${sevColor(a.severity)}20`,color:sevColor(a.severity)}}>{a.severity}</span><span className="text-xs text-gray-500">{a.type.replace("_"," ")}</span></div><div className="text-sm text-white">{a.description}</div><div className="text-xs text-yellow-400 mt-1">💡 {a.recommendation}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">R{((d.totalCoverage||0)/100/1000000).toFixed(0)}M</div><div className="text-sm text-gray-400 mt-1">Total Coverage</div></div><div className="rounded-2xl p-6" style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}><div className="text-4xl font-black text-red-400">{d.highRisk||0}</div><div className="text-sm text-gray-400 mt-1">High Risk Alerts</div></div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function CarbonESG() {
  const [tab, setTab] = useState<"dashboard"|"carbon"|"social"|"sdg">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/esg/dashboard"], queryFn:()=>fetch("/api/esg/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: carbon } = useQuery({ queryKey:["/api/esg/carbon"], queryFn:()=>fetch("/api/esg/carbon",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="carbon" });
  const { data: social } = useQuery({ queryKey:["/api/esg/social"], queryFn:()=>fetch("/api/esg/social",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="social" });
  const { data: sdg } = useQuery({ queryKey:["/api/esg/sdg"], queryFn:()=>fetch("/api/esg/sdg",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="sdg" });
  const d=(dash as any)||{}; const c=(carbon as any)||{}; const s=(social as any)||{}; const g=(sdg as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Carbon & ESG</h1>
        <p className="text-sm text-gray-500 mb-5">Carbon Footprint (Scope 1-3) · Social Impact · Governance · UN SDGs · B-BBEE · DTIC Report</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"CO₂ Emissions",v:`${(d.carbon||{}).totalEmissions||0} tCO2e`,c:"#1DBF73"},{l:"Freelancers Empowered",v:((d.social||{}).freelancers||0).toLocaleString(),c:"#6366f1"},{l:"Transparency Score",v:`${(d.governance||{}).score||0}%`,c:"#eab308"},{l:"SDG Goals",v:d.sdgGoals||0,c:"#06b6d4"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","carbon","social","sdg"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold uppercase" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t==="sdg"?"UN SDGs":t}</button>)}
        </div>
        {tab==="carbon"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Emissions by Scope</div>{[{l:"Scope 1 (Direct)",v:c.scope1||0,t:100},{l:"Scope 2 (Electricity)",v:c.scope2||0,t:400},{l:"Scope 3 (Supply chain)",v:c.scope3||0,t:600}].map((item,i)=><div key={i} className="mb-2"><div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{item.l}</span><span className="text-white">{item.v} tCO2e</span></div><div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-500" style={{width:`${(item.v/item.t)*100}%`}} /></div></div>)}</div><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Monthly Trend</div><div className="flex items-end gap-2 h-16">{(c.trend||[]).map((w:any,i:number)=><div key={i} className="flex-1 flex flex-col items-center"><div className="w-full rounded-t bg-emerald-600/40" style={{height:`${(w.emissions/80)*100}%`}} /><div className="text-[9px] text-gray-600 mt-1">{w.month}</div></div>)}</div></div></div>}
        {tab==="social"&&<div className="grid grid-cols-2 gap-3">{[{l:"Freelancers Empowered",v:(s.freelancersEmpowered||0).toLocaleString()},{l:"Rural Reach",v:(s.ruralReach||0).toLocaleString()},{l:"Youth Under 25",v:(s.youthUnder25||0).toLocaleString()},{l:"Women Freelancers",v:(s.womenFreelancers||0).toLocaleString()},{l:"Disabled Freelancers",v:(s.disabledFreelancers||0).toLocaleString()},{l:"Jobs Created",v:(s.jobsCreated||0).toLocaleString()}].map((item,i)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="text-2xl font-black text-emerald-400">{item.v}</div><div className="text-xs text-gray-500 mt-1">{item.l}</div></div>)}</div>}
        {tab==="sdg"&&<div className="space-y-2">{(g.goals||[]).map((goal:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(6,182,212,0.15)"}}><div className="flex items-center justify-between mb-1"><div><span className="text-cyan-400 font-bold text-sm">SDG {goal.goal}</span><span className="text-white text-sm ml-2">{goal.name}</span></div><span className="text-emerald-400 font-bold">{goal.progress}%</span></div><div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-cyan-500" style={{width:`${goal.progress}%`}} /></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.governance?.rating||"A+"}</div><div className="text-sm text-gray-400 mt-1">PCC Governance Rating</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-cyan-400">{d.sdgGoals||0}</div><div className="text-sm text-gray-400 mt-1">UN SDG Goals Aligned</div></div></div>}
      </div>
    </div>
  );
}

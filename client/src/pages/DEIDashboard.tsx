import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function DEIDashboard() {
  const [tab, setTab] = useState<"dashboard"|"representation"|"bee">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/dei/dashboard"], queryFn:()=>fetch("/api/dei/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: rep } = useQuery({ queryKey:["/api/dei/representation"], queryFn:()=>fetch("/api/dei/representation",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="representation" });
  const { data: bee } = useQuery({ queryKey:["/api/dei/bee-compliance"], queryFn:()=>fetch("/api/dei/bee-compliance",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="bee" });
  const d=(dash as any)||{}; const r=(rep as any)||{}; const b=(bee as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Diversity & Inclusion Dashboard</h1>
        <p className="text-sm text-gray-500 mb-5">B-BBEE Compliance · Gender Pay Gap · Race Representation · Youth Employment · SDG Tracking</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"BEE Level",v:d.beeLevel||0,c:"#1DBF73"},{l:"BEE Score",v:`${d.beeScore||0}%`,c:"#1DBF73"},{l:"Women Freelancers",v:`${(d.representation||{}).female||0}%`,c:"#f97316"},{l:"Initiatives",v:d.initiatives||0,c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","representation","bee"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t==="bee"?"B-BBEE":t}</button>)}
        </div>
        {tab==="representation"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Race Distribution</div>{[{l:"Black",v:(r.data||{}).black||0,c:"#1DBF73"},{l:"Coloured",v:(r.data||{}).coloured||0,c:"#6366f1"},{l:"Indian",v:(r.data||{}).indian||0,c:"#eab308"},{l:"White",v:(r.data||{}).white||0,c:"#9ca3af"}].map((item,i)=><div key={i} className="mb-2"><div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{item.l}</span><span className="text-white">{item.v}%</span></div><div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${item.v}%`,background:item.c}} /></div></div>)}</div><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Gender Distribution</div>{[{l:"Female",v:(r.data||{}).female||0,c:"#f97316"},{l:"Male",v:(r.data||{}).male||0,c:"#6366f1"},{l:"Non-Binary",v:(r.data||{}).nonBinary||0,c:"#a855f7"}].map((item,i)=><div key={i} className="mb-2"><div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{item.l}</span><span className="text-white">{item.v}%</span></div><div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${item.v}%`,background:item.c}} /></div></div>)}</div></div>}
        {tab==="bee"&&<div className="space-y-3">{[{l:"Black Ownership",v:`${(b.compliance||{}).blackOwnership||0}%`,target:"51%",ok:true},{l:"Youth Employment",v:`${(b.compliance||{}).youthEmployment||0}%`,target:"35%",ok:true},{l:"Rural Freelancers",v:`${(b.compliance||{}).ruralFreelancers||0}%`,target:"10%",ok:true},{l:"Disabled Freelancers",v:`${(b.compliance||{}).disabledFreelancers||0}%`,target:"2%",ok:true}].map((item,i)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div><span className="text-sm text-white">{item.l}</span><div className="text-xs text-gray-500">Target: {item.target}</div></div><span className="text-emerald-400 font-bold text-sm">{item.v}</span></div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-5" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-center"><div className="text-6xl font-black text-emerald-400">Level {d.beeLevel}</div><div className="text-sm text-gray-400 mt-1">B-BBEE Status — Score: {d.beeScore}%</div><div className="text-xs text-gray-600 mt-0.5">Pay Gap: {(d.payGap||{}).genderGap}% gender · {(d.payGap||{}).raceGap}% race</div></div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function TalentAlerts() {
  const [tab, setTab] = useState<"dashboard"|"shortages"|"pipeline">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/talent-alerts/dashboard"], queryFn:()=>fetch("/api/talent-alerts/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: shortages } = useQuery({ queryKey:["/api/talent-alerts/shortages"], queryFn:()=>fetch("/api/talent-alerts/shortages",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="shortages" });
  const { data: pipeline } = useQuery({ queryKey:["/api/talent-alerts/pipeline"], queryFn:()=>fetch("/api/talent-alerts/pipeline",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="pipeline" });
  const d=(dash as any)||{};
  const sevColor=(s:string)=>s==="critical"?"#ef4444":"#f97316";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Talent Shortage Alerts</h1>
        <p className="text-sm text-gray-500 mb-5">Real-time Gap Index · Waiting Clients · Bootcamp Partnerships · AI Recruitment Campaigns</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Critical Shortages",v:d.criticalShortages||0,c:"#ef4444"},{l:"High Shortages",v:d.highShortages||0,c:"#f97316"},{l:"Clients Waiting",v:d.totalWaiting||0,c:"#eab308"},{l:"Skills Tracked",v:(d.pipeline||[]).length,c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","shortages","pipeline"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#f87171":"#6b7280",border:tab===t?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="shortages"&&<div className="space-y-3">{((shortages as any)?.alerts||[]).map((a:any,i:number)=><div key={i} data-testid={`shortage-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sevColor(a.severity)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${sevColor(a.severity)}20`,color:sevColor(a.severity)}}>{a.severity}</span><span className="font-bold text-white">{a.skill}</span></div><div className="text-xs text-gray-500">Gap Index: {a.gapIndex} · {a.waitingClients} clients waiting · {a.avgWaitDays}d avg wait</div><div className="text-xs text-yellow-400 mt-1">💡 {a.recommendation}</div></div><div className="text-right ml-4"><div className="text-2xl font-black text-red-400">{a.gapIndex}</div><div className="text-[10px] text-gray-500">gap index</div></div></div></div>)}</div>}
        {tab==="pipeline"&&<div className="space-y-2">{((pipeline as any)?.pipeline||[]).map((p:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-center justify-between mb-2"><span className="font-bold text-white">{p.skill}</span><div className="flex gap-3 text-xs"><span className="text-gray-400">Available: <strong className="text-white">{p.available}</strong></span><span className="text-gray-400">Requested: <strong className="text-white">{p.requested}</strong></span><span style={{color:p.utilization>=100?"#ef4444":"#1DBF73"}}>Util: {p.utilization}%</span></div></div><div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${Math.min(p.utilization,100)}%`,background:p.utilization>=100?"#ef4444":"#1DBF73"}} /></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)"}}><div className="text-4xl font-black text-red-400">{(d.criticalShortages||0)+(d.highShortages||0)}</div><div className="text-sm text-gray-400 mt-1">Total Skill Shortages</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.totalWaiting||0}</div><div className="text-sm text-gray-400 mt-1">Clients Waiting for Talent</div></div></div>}
      </div>
    </div>
  );
}

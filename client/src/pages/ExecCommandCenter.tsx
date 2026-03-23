import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function ExecCommandCenter() {
  const [tab, setTab] = useState<"dashboard"|"kpis"|"reports">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/exec-command/dashboard"], queryFn:()=>fetch("/api/exec-command/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:10000, refetchInterval:30000 });
  const { data: kpis } = useQuery({ queryKey:["/api/exec-command/kpis"], queryFn:()=>fetch("/api/exec-command/kpis",{credentials:"include"}).then(r=>r.json()), staleTime:20000, enabled:tab==="kpis" });
  const { data: reports } = useQuery({ queryKey:["/api/exec-command/reports"], queryFn:()=>fetch("/api/exec-command/reports",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="reports" });
  const d=(dash as any)||{}; const snap=d.snapshot||{}; const kpiList=(kpis as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-3xl font-bold text-white mb-0.5">Executive Command Center</h1><p className="text-sm text-gray-500">100 Sections · Real-time Platform Snapshot · Board Pack · DTIC Report</p></div>
          <div className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">🟢 ALL SYSTEMS OPERATIONAL</div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"GMV (ZAR)",v:`R${((snap.gmv||0)/100/1000000).toFixed(0)}M`,c:"#1DBF73"},{l:"MRR",v:`R${((snap.mrr||0)/100/1000).toFixed(0)}K`,c:"#6366f1"},{l:"Freelancers",v:(snap.freelancers||0).toLocaleString(),c:"#eab308"},{l:"Platform Health",v:`${snap.platformHealthScore||0}`,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","kpis","reports"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold uppercase" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4">{[{l:"New Today",v:snap.newToday,c:"#1DBF73"},{l:"Orders Today",v:snap.ordersToday,c:"#6366f1"},{l:"Open Incidents",v:snap.openIncidents,c:"#ef4444"},{l:"Open Disputes",v:snap.openDisputes,c:"#f97316"},{l:"Awaiting KYC",v:snap.awaitingKYC,c:"#eab308"},{l:"Admin Sections",v:snap.sectionCount||100,c:"#818cf8"}].map((item,i)=><div key={i} className="rounded-2xl p-4" style={{background:`${item.c}08`,border:`1px solid ${item.c}20`}}><div className="text-3xl font-black" style={{color:item.c}}>{item.v||0}</div><div className="text-xs text-gray-500 mt-1">{item.l}</div></div>)}</div>}
        {tab==="kpis"&&<div className="space-y-2">{((kpiList.kpis||[]) as any[]).map((kpi:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-center mb-1"><div className="text-sm font-bold text-white">{kpi.name}</div><div className="text-right"><span className="text-lg font-black text-emerald-400">{kpi.value?.toLocaleString()}</span>{kpi.unit&&<span className="text-xs text-gray-500 ml-1">{kpi.unit}</span>}<div className="text-xs text-gray-500">Target: {kpi.target?.toLocaleString()}</div></div></div>{kpi.target&&<div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-500" style={{width:`${Math.min((kpi.value/kpi.target)*100,100)}%`}} /></div>}</div>)}</div>}
        {tab==="reports"&&<div className="space-y-2">{((reports as any)?.available||[]).map((r:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-center"><div><div className="font-bold text-white">{r.name}</div><div className="text-xs text-gray-500">{r.pages} pages · {r.type.toUpperCase()}</div></div><button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700">↓ Download</button></div></div>)}</div>}
        {(d.alerts||[]).length>0&&<div className="mt-4 space-y-2">{d.alerts.map((a:any,i:number)=><div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{background:a.type==="action_required"?"rgba(249,115,22,0.1)":"rgba(99,102,241,0.1)",border:a.type==="action_required"?"1px solid rgba(249,115,22,0.3)":"1px solid rgba(99,102,241,0.3)"}}><span>{a.type==="action_required"?"⚠️":"🎉"}</span><span className="text-sm" style={{color:a.type==="action_required"?"#f97316":"#818cf8"}}>{a.msg}</span></div>)}</div>}
      </div>
    </div>
  );
}

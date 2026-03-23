import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function BackgroundChecks() {
  const [tab, setTab] = useState<"dashboard"|"checks">("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: dash } = useQuery({ queryKey:["/api/background-checks/dashboard"], queryFn:()=>fetch("/api/background-checks/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: checks } = useQuery({ queryKey:["/api/background-checks/list",statusFilter], queryFn:()=>fetch(`/api/background-checks/list${statusFilter?`?status=${statusFilter}`:""}`,{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="checks" });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>s==="passed"?"#1DBF73":s==="failed"?"#ef4444":s==="in_progress"?"#6366f1":"#9ca3af";
  const typeIcon=(t:string)=>({criminal:"🔍",qualification:"🎓",reference:"👥",identity:"🪪",credit:"💳"}[t]||"📋");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Background Check & Verification</h1>
        <p className="text-sm text-gray-500 mb-5">Criminal · Qualification (SAQA) · Reference · Identity · Credit — TransUnion, SAPS, ITC</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Pass Rate",v:`${d.passRate||0}%`,c:"#1DBF73"},{l:"Passed",v:d.passed||0,c:"#1DBF73"},{l:"Failed",v:d.failed||0,c:"#ef4444"},{l:"In Progress",v:d.inProgress||0,c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","checks"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="checks"&&<div className="space-y-2"><div className="flex gap-2 mb-3">{["","passed","failed","in_progress"].map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusFilter===s?"bg-emerald-700 text-white":"bg-gray-800 text-gray-400"}`}>{s||"All"}</button>)}</div>{((checks as any)?.checks||[]).map((c:any)=><div key={c.id} data-testid={`check-${c.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-lg">{typeIcon(c.type)}</span><span className="font-bold text-white">{c.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(c.status)}20`,color:statusColor(c.status)}}>{c.status.replace("_"," ")}</span></div><div className="text-xs text-gray-500">{c.type} · {c.provider}</div>{c.result&&<div className="text-xs text-gray-400 mt-0.5">{c.result}</div>}</div><div className="text-right"><div className="text-sm font-bold text-white">R{(c.cost/100).toLocaleString()}</div><div className="text-xs text-gray-500">cost</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Checks</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-emerald-400">R{((d.totalCost||0)/100).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Cost</div></div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
export default function ProjectHub() {
  const [tab, setTab] = useState<"dashboard"|"projects">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/projects/dashboard"], queryFn:()=>fetch("/api/projects/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: projects } = useQuery({ queryKey:["/api/projects/list"], queryFn:()=>fetch("/api/projects/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="projects" });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({active:"#1DBF73",completed:"#6366f1",paused:"#eab308",planning:"#9ca3af"}[s]||"#9ca3af");
  const pct=(p:any)=>((p.spent/p.budget)*100).toFixed(0);
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Project Management Hub</h1>
        <p className="text-sm text-gray-500 mb-5">Kanban · Timeline · Milestones · Budget Tracking · Task Management</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Active",v:d.active||0,c:"#1DBF73"},{l:"Avg Progress",v:`${d.avgProgress||0}%`,c:"#6366f1"},{l:"Total Budget",v:`R${((d.totalBudget||0)/100).toLocaleString()}`,c:"#eab308"},{l:"Over Budget",v:d.overBudget||0,c:"#ef4444"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","projects"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="projects"&&<div className="space-y-3">{((projects as any)?.projects||[]).map((p:any)=><div key={p.id} data-testid={`project-${p.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${statusColor(p.status)}20`}}><div className="flex items-start justify-between mb-2"><div><div className="flex items-center gap-2 mb-0.5"><span className="font-bold text-white">{p.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(p.status)}20`,color:statusColor(p.status)}}>{p.status}</span></div><div className="text-xs text-gray-500">{p.freelancer} → {p.client}</div><div className="text-xs text-gray-600">Due: {format(new Date(p.dueDate),"MMM d, yyyy")}</div></div><div className="text-right"><div className="text-lg font-black text-emerald-400">{p.progress}%</div><div className="text-xs text-gray-500">R{(p.spent/100).toLocaleString()} / R{(p.budget/100).toLocaleString()}</div><div className="text-xs" style={{color:p.spent>p.budget?"#ef4444":"#9ca3af"}}>Budget: {pct(p)}%</div></div></div><div className="h-2 rounded-full bg-gray-800 mb-2"><div className="h-full rounded-full bg-emerald-500" style={{width:`${p.progress}%`}} /></div><div className="flex gap-1 flex-wrap">{(p.tasks||[]).map((t:any)=><span key={t.id} className="text-[9px] px-1.5 py-0.5 rounded" style={{background:t.done?"rgba(29,191,115,0.2)":"rgba(107,114,128,0.2)",color:t.done?"#1DBF73":"#9ca3af"}}>{t.done?"✓ ":""}{t.title}</span>)}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Projects</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.completed||0}</div><div className="text-sm text-gray-400 mt-1">Completed</div></div></div>}
      </div>
    </div>
  );
}

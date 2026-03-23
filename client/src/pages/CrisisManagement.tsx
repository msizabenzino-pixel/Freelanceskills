import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function CrisisManagement() {
  const [tab, setTab] = useState<"dashboard"|"incidents"|"playbooks">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/crisis/dashboard"], queryFn:()=>fetch("/api/crisis/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:10000 });
  const { data: incidents } = useQuery({ queryKey:["/api/crisis/incidents"], queryFn:()=>fetch("/api/crisis/incidents",{credentials:"include"}).then(r=>r.json()), staleTime:10000, enabled:tab==="incidents" });
  const { data: playbooks } = useQuery({ queryKey:["/api/crisis/playbooks"], queryFn:()=>fetch("/api/crisis/playbooks",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="playbooks" });
  const updateMut = useMutation({ mutationFn:({id,update,status}:{id:string;update:string;status?:string})=>fetch(`/api/crisis/incidents/${id}/update`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({update,status})}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Incident updated ✓"}); qc.invalidateQueries({queryKey:["/api/crisis"]}); } });
  const d=(dash as any)||{};
  const sevColor=(s:string)=>({P1:"#ef4444",P2:"#f97316",P3:"#eab308",P4:"#9ca3af"}[s]||"#9ca3af");
  const statusColor=(s:string)=>({open:"#ef4444",investigating:"#f97316",contained:"#eab308",resolved:"#1DBF73"}[s]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Crisis Management</h1>
        <p className="text-sm text-gray-500 mb-5">P1–P4 Incidents · Response Playbooks · MTTR Tracking · Stakeholder Alerts · Postmortems</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Open Incidents",v:d.open||0,c:"#ef4444"},{l:"P1 Open",v:d.p1Open||0,c:"#ef4444"},{l:"Resolved",v:d.resolved||0,c:"#1DBF73"},{l:"MTTR",v:d.mttr||"—",c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","incidents","playbooks"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#f87171":"#6b7280",border:tab===t?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="incidents"&&<div className="space-y-3">{((incidents as any)?.incidents||[]).map((inc:any)=><div key={inc.id} data-testid={`incident-${inc.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sevColor(inc.severity)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-black text-sm" style={{color:sevColor(inc.severity)}}>{inc.severity}</span><span className="font-bold text-white">{inc.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${statusColor(inc.status)}20`,color:statusColor(inc.status)}}>{inc.status}</span></div><div className="text-xs text-gray-500">Type: {inc.type} · Lead: {inc.lead}</div>{(inc.updates||[]).length>0&&<div className="text-xs text-gray-400 mt-1 italic">Latest: {(inc.updates||[]).at(-1)}</div>}</div>{inc.status!=="resolved"&&<button onClick={()=>updateMut.mutate({id:inc.id,update:"Status updated by admin",status:"resolved"})} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white ml-2">Resolve</button>}</div></div>)}</div>}
        {tab==="playbooks"&&<div className="space-y-2">{((playbooks as any)||[]).map((p:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div><div className="font-bold text-white">{p.name}</div><div className="text-xs text-gray-500">{p.steps} steps · Last reviewed: {new Date(p.lastReviewed).toLocaleDateString()}</div></div><button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gray-700">View</button></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:d.open?"rgba(239,68,68,0.08)":"rgba(29,191,115,0.07)",border:d.open?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black" style={{color:d.open?"#ef4444":"#1DBF73"}}>{d.open||0}</div><div className="text-sm text-gray-400 mt-1">Open Incidents</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.playbooks||0}</div><div className="text-sm text-gray-400 mt-1">Response Playbooks</div></div></div>}
      </div>
    </div>
  );
}

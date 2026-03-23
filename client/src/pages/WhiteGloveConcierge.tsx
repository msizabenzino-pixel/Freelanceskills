import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function WhiteGloveConcierge() {
  const [tab, setTab] = useState<"dashboard"|"requests">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/concierge/dashboard"], queryFn:()=>fetch("/api/concierge/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:10000 });
  const { data: requests } = useQuery({ queryKey:["/api/concierge/requests"], queryFn:()=>fetch("/api/concierge/requests",{credentials:"include"}).then(r=>r.json()), staleTime:10000, enabled:tab==="requests" });
  const resolveMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/concierge/requests/${id}/resolve`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Request resolved ✓"}); qc.invalidateQueries({queryKey:["/api/concierge"]}); } });
  const d=(dash as any)||{};
  const priColor=(p:string)=>({vip:"#818cf8",priority:"#f97316",standard:"#9ca3af"}[p]||"#9ca3af");
  const typeIcon=(t:string)=>({talent_search:"🔍",project_scoping:"📋",contract_review:"📜",onboarding:"🤝",dispute_resolution:"⚖️"}[t]||"💼");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">White-Glove Concierge</h1>
        <p className="text-sm text-gray-500 mb-5">VIP Client Management · Talent Search · Project Scoping · 98.2% Satisfaction · 2.4h Avg Response</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Open Requests",v:d.open||0,c:"#6366f1"},{l:"VIP Requests",v:d.vip||0,c:"#818cf8"},{l:"Avg Response",v:`${d.avgResponseH||0}h`,c:"#1DBF73"},{l:"Satisfaction",v:`${d.satisfaction||0}%`,c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","requests"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(129,140,248,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(129,140,248,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="requests"&&<div className="space-y-2">{((requests as any)?.requests||[]).map((r:any)=><div key={r.id} data-testid={`concierge-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${priColor(r.priority)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-lg">{typeIcon(r.type)}</span><span className="font-bold text-white">{r.clientName}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${priColor(r.priority)}20`,color:priColor(r.priority)}}>{r.priority}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{r.status}</span></div><div className="text-xs text-gray-500">{r.company} · {r.type.replace("_"," ")}</div><div className="text-xs text-gray-400 mt-0.5">{r.request}</div><div className="text-xs text-gray-600 mt-0.5">Assigned: {r.assignedTo}</div></div>{r.status!=="resolved"&&<button data-testid={`resolve-${r.id}`} onClick={()=>resolveMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white ml-2">Resolve</button>}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(129,140,248,0.07)",border:"1px solid rgba(129,140,248,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Requests</div></div><div className="rounded-2xl p-6" style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)"}}><div className="text-4xl font-black text-yellow-400">{d.satisfaction||0}%</div><div className="text-sm text-gray-400 mt-1">Client Satisfaction</div></div></div>}
      </div>
    </div>
  );
}

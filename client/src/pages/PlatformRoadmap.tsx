import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function PlatformRoadmap() {
  const [tab, setTab] = useState<"dashboard"|"items">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/roadmap/dashboard"], queryFn:()=>fetch("/api/roadmap/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: items } = useQuery({ queryKey:["/api/roadmap/items"], queryFn:()=>fetch("/api/roadmap/items",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="items" });
  const voteMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/roadmap/${id}/vote`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Vote counted ✓"}); qc.invalidateQueries({queryKey:["/api/roadmap"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({in_progress:"#6366f1",planned:"#eab308",completed:"#1DBF73",cancelled:"#ef4444"}[s]||"#9ca3af");
  const effortColor=(e:string)=>({S:"#1DBF73",M:"#eab308",L:"#f97316",XL:"#ef4444"}[e]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Platform Roadmap</h1>
        <p className="text-sm text-gray-500 mb-5">Product Roadmap · Feature Voting · Quarterly Planning · Release Timeline</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"In Progress",v:d.inProgress||0,c:"#6366f1"},{l:"Planned",v:d.planned||0,c:"#eab308"},{l:"Completed",v:d.completed||0,c:"#1DBF73"},{l:"Total Votes",v:(d.totalVotes||0).toLocaleString(),c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","items"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="items"&&<div className="space-y-2">{((items as any)?.items||[]).map((item:any)=><div key={item.id} data-testid={`roadmap-${item.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${statusColor(item.status)}15`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{item.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${statusColor(item.status)}20`,color:statusColor(item.status)}}>{item.status.replace("_"," ")}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${effortColor(item.effort)}20`,color:effortColor(item.effort)}}>{item.effort}</span></div><div className="text-xs text-gray-500">{item.description}</div><div className="text-xs text-gray-600 mt-0.5">{item.quarter} · {item.team}</div></div><div className="text-right ml-4"><button data-testid={`vote-${item.id}`} onClick={()=>voteMut.mutate(item.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700/60 hover:bg-indigo-700"><span>▲</span><span>{item.votes}</span></button></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Roadmap Items</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.completed||0}</div><div className="text-sm text-gray-400 mt-1">Features Shipped</div></div></div>}
      </div>
    </div>
  );
}

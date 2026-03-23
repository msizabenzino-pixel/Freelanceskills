import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function B2BProcurement() {
  const [tab, setTab] = useState<"dashboard"|"rfqs">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/procurement/dashboard"], queryFn:()=>fetch("/api/procurement/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: rfqs } = useQuery({ queryKey:["/api/procurement/rfqs"], queryFn:()=>fetch("/api/procurement/rfqs",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="rfqs" });
  const awardMut = useMutation({ mutationFn:({id,winner}:{id:string;winner:string})=>fetch(`/api/procurement/rfqs/${id}/award`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({winner})}).then(r=>r.json()), onSuccess:()=>{ toast({title:"RFQ awarded ✓"}); qc.invalidateQueries({queryKey:["/api/procurement"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({open:"#1DBF73",awarded:"#6366f1",closed:"#9ca3af",draft:"#eab308"}[s]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">B2B Procurement</h1>
        <p className="text-sm text-gray-500 mb-5">RFQ Management · Vendor Comparison · Bid Management · Contract Negotiation · Enterprise Procurement</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Open RFQs",v:d.open||0,c:"#1DBF73"},{l:"Total Budget",v:`R${((d.totalBudget||0)/100/1000000).toFixed(0)}M`,c:"#6366f1"},{l:"Avg Proposals",v:d.avgProposals||0,c:"#eab308"},{l:"Awarded",v:d.awarded||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","rfqs"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold uppercase" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t==="rfqs"?"RFQs":t}</button>)}
        </div>
        {tab==="rfqs"&&<div className="space-y-3">{((rfqs as any)?.rfqs||[]).map((r:any)=><div key={r.id} data-testid={`rfq-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${statusColor(r.status)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{r.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(r.status)}20`,color:statusColor(r.status)}}>{r.status}</span></div><div className="text-xs text-gray-500">{r.company} · {r.proposals} proposals · Due: {new Date(r.deadline).toLocaleDateString()}</div><div className="flex gap-1 mt-1">{(r.skills||[]).map((s:string)=><span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s}</span>)}</div>{r.winner&&<div className="text-xs text-emerald-400 mt-1">Winner: {r.winner}</div>}</div><div className="text-right ml-4"><div className="text-lg font-black text-indigo-400">R{((r.budget||0)/100/1000000).toFixed(0)}M</div>{r.status==="open"&&<button onClick={()=>awardMut.mutate({id:r.id,winner:"FreelanceSkills Top Bidder"})} className="mt-1 px-2 py-1 rounded text-[10px] font-bold bg-indigo-700 text-white">Award</button>}</div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-emerald-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total RFQs</div></div><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">R{((d.totalBudget||0)/100/1000000).toFixed(0)}M</div><div className="text-sm text-gray-400 mt-1">Total Budget Managed</div></div></div>}
      </div>
    </div>
  );
}

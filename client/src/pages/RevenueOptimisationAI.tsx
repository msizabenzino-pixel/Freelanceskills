import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function RevenueOptimisationAI() {
  const [tab, setTab] = useState<"dashboard"|"recommendations">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/revenue-ai/dashboard"], queryFn:()=>fetch("/api/revenue-ai/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: recs } = useQuery({ queryKey:["/api/revenue-ai/recommendations"], queryFn:()=>fetch("/api/revenue-ai/recommendations",{credentials:"include"}).then(r=>r.json()), staleTime:20000, enabled:tab==="recommendations" });
  const actionMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/revenue-ai/recommendations/${id}/action`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:(d)=>toast({title:`Actioned — ticket ${d.ticket} created ✓`}) });
  const d=(dash as any)||{};
  const typeColor=(t:string)=>({pricing:"#6366f1",upsell:"#1DBF73",retention:"#eab308",new_stream:"#f97316"}[t]||"#9ca3af");
  const typeIcon=(t:string)=>({pricing:"💲",upsell:"⬆️",retention:"🔄",new_stream:"✨"}[t]||"💡");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Revenue Optimisation AI</h1>
        <p className="text-sm text-gray-500 mb-5">AI-Powered Pricing · Upsell Engine · Retention Tactics · New Revenue Streams</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Recommendations",v:d.recommendations||0,c:"#6366f1"},{l:"Opt. Score",v:`${d.optimisationScore||0}%`,c:"#1DBF73"},{l:"Total Opportunity",v:`R${((d.totalOpportunity||0)/100).toLocaleString()}/mo`,c:"#eab308"},{l:"High Confidence",v:d.highConfidence||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","recommendations"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="recommendations"&&<div className="space-y-3">{((recs as any)?.recommendations||[]).map((r:any)=><div key={r.id} data-testid={`revopp-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${typeColor(r.type)}20`}}><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span>{typeIcon(r.type)}</span><span className="font-bold text-white">{r.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${typeColor(r.type)}20`,color:typeColor(r.type)}}>{r.type.replace("_"," ")}</span></div><div className="text-xs text-gray-500">{r.action}</div><div className="flex gap-3 mt-1"><span className="text-emerald-400 text-xs font-bold">{r.impact}</span><span className="text-gray-500 text-xs">Confidence: {r.confidence}%</span><span className="text-gray-500 text-xs">Effort: {r.effort}</span></div></div><button data-testid={`action-${r.id}`} onClick={()=>actionMut.mutate(r.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 ml-2">Action It</button></div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-center"><div className="text-6xl font-black text-emerald-400">R{((d.totalOpportunity||0)/100).toLocaleString()}</div><div className="text-white text-lg mt-2">Monthly Revenue Opportunity Identified</div><div className="text-sm text-gray-500 mt-1">{d.recommendations} AI-powered recommendations · Opt. Score: {d.optimisationScore}%</div></div></div>}
      </div>
    </div>
  );
}

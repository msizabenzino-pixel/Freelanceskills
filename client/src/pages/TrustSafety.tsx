import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function TrustSafety() {
  const [tab, setTab] = useState<"dashboard"|"events">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/trust-safety/dashboard"], queryFn:()=>fetch("/api/trust-safety/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: events } = useQuery({ queryKey:["/api/trust-safety/events"], queryFn:()=>fetch("/api/trust-safety/events",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="events" });
  const actionMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/trust-safety/${id}/action`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Action taken ✓"}); qc.invalidateQueries({queryKey:["/api/trust-safety"]}); } });
  const dismissMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/trust-safety/${id}/dismiss`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Dismissed"}); qc.invalidateQueries({queryKey:["/api/trust-safety"]}); } });
  const d=(dash as any)||{};
  const sevColor=(s:string)=>({low:"#1DBF73",medium:"#eab308",high:"#f97316",critical:"#ef4444"}[s]||"#9ca3af");
  const typeLabel=(t:string)=>({fake_review:"Fake Review",impersonation:"Impersonation",spam:"Spam",scam:"Scam",policy_violation:"Policy Violation",hate_speech:"Hate Speech"}[t]||t);
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Trust & Safety Intelligence</h1>
        <p className="text-sm text-gray-500 mb-5">AI Detection · Fake Reviews · Impersonation · Scams · Policy Violations · NLP Sentiment</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Open Events",v:d.open||0,c:"#f97316"},{l:"Critical",v:d.critical||0,c:"#ef4444"},{l:"Actioned",v:d.actioned||0,c:"#1DBF73"},{l:"AI Confidence",v:`${d.avgAiConfidence||0}%`,c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","events"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#f87171":"#6b7280",border:tab===t?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="events"&&<div className="space-y-2">{((events as any)?.events||[]).map((e:any)=><div key={e.id} data-testid={`event-${e.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sevColor(e.severity)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{e.userName}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${sevColor(e.severity)}20`,color:sevColor(e.severity)}}>{e.severity}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{typeLabel(e.type)}</span><span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:e.status==="open"?"rgba(249,115,22,0.2)":e.status==="actioned"?"rgba(29,191,115,0.2)":"rgba(107,114,128,0.2)",color:e.status==="open"?"#f97316":e.status==="actioned"?"#1DBF73":"#9ca3af"}}>{e.status}</span></div><div className="text-xs text-gray-400">{e.description}</div><div className="text-xs text-gray-600 mt-0.5">AI Confidence: {e.aiConfidence}%</div></div>{e.status==="open"&&<div className="flex gap-1 ml-2"><button onClick={()=>actionMut.mutate(e.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-red-700 text-white">Action</button><button onClick={()=>dismissMut.mutate(e.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-700 text-white">Dismiss</button></div>}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4">{Object.entries(d.byType||{}).map(([type,count]:any)=><div key={type} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><span className="text-sm text-white">{typeLabel(type)}</span><span className="text-sm font-bold text-orange-400">{count}</span></div></div>)}</div>}
      </div>
    </div>
  );
}

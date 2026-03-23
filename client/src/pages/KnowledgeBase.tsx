import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function KnowledgeBase() {
  const [tab, setTab] = useState<"dashboard"|"articles">("dashboard");
  const [langFilter, setLangFilter] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/knowledge-base/dashboard"], queryFn:()=>fetch("/api/knowledge-base/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: articles } = useQuery({ queryKey:["/api/knowledge-base/articles",langFilter], queryFn:()=>fetch(`/api/knowledge-base/articles${langFilter?`?lang=${langFilter}`:""}`,{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="articles" });
  const feedbackMut = useMutation({ mutationFn:({id,helpful}:{id:string;helpful:boolean})=>fetch(`/api/knowledge-base/${id}/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({helpful})}).then(r=>r.json()), onSuccess:()=>toast({title:"Feedback recorded ✓"}) });
  const d=(dash as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Knowledge Base</h1>
        <p className="text-sm text-gray-500 mb-5">AI-Generated Articles · 11 SA Languages · Full-text Search · Feedback Loop · POPIA</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Articles",v:d.total||0,c:"#6366f1"},{l:"Total Views",v:(d.totalViews||0).toLocaleString(),c:"#1DBF73"},{l:"Helpful Rate",v:`${d.avgHelpful||0}%`,c:"#eab308"},{l:"Languages",v:d.languages||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","articles"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="articles"&&<div className="space-y-2"><div className="flex gap-2 mb-3">{["","en","af","zu","xh"].map(l=><button key={l} onClick={()=>setLangFilter(l)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${langFilter===l?"bg-indigo-700 text-white":"bg-gray-800 text-gray-400"}`}>{l||"All"}</button>)}</div>{((articles as any)?.articles||[]).map((a:any)=><div key={a.id} data-testid={`article-${a.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{a.title}</span>{a.aiGenerated&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 font-bold">AI</span>}<span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{a.language}</span></div><div className="text-xs text-gray-500">{a.category} · {a.views.toLocaleString()} views</div></div><div className="flex gap-1 ml-2"><button onClick={()=>feedbackMut.mutate({id:a.id,helpful:true})} className="px-2 py-1 rounded text-[10px] bg-emerald-900/40 text-emerald-400">👍 {a.helpful}</button><button onClick={()=>feedbackMut.mutate({id:a.id,helpful:false})} className="px-2 py-1 rounded text-[10px] bg-red-900/40 text-red-400">👎 {a.notHelpful}</button></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Articles</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.aiGenerated||0}</div><div className="text-sm text-gray-400 mt-1">AI Generated</div></div></div>}
      </div>
    </div>
  );
}

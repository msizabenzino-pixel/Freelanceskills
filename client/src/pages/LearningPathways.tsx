import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function LearningPathways() {
  const [tab, setTab] = useState<"dashboard"|"paths">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/learning/dashboard"], queryFn:()=>fetch("/api/learning/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: paths } = useQuery({ queryKey:["/api/learning/paths"], queryFn:()=>fetch("/api/learning/paths",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="paths" });
  const d=(dash as any)||{};
  const levelColor=(l:string)=>({beginner:"#1DBF73",intermediate:"#eab308",advanced:"#f97316"}[l]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Learning Pathways</h1>
        <p className="text-sm text-gray-500 mb-5">AI-Personalised · 11 SA Languages · SAQA-Aligned · SETA-Registered · Certification</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Enrolled",v:(d.totalEnrolled||0).toLocaleString(),c:"#6366f1"},{l:"Avg Completion",v:`${d.avgCompletion||0}%`,c:"#1DBF73"},{l:"Certified Paths",v:d.certified||0,c:"#eab308"},{l:"AI Personalised",v:d.aiPersonalized||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","paths"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="paths"&&<div className="space-y-3">{((paths as any)?.paths||[]).map((p:any)=><div key={p.id} data-testid={`path-${p.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${levelColor(p.level)}20`}}><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{p.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize" style={{background:`${levelColor(p.level)}20`,color:levelColor(p.level)}}>{p.level}</span>{p.aiPersonalized&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 font-bold">AI</span>}{p.certAwarded&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 font-bold">CERT</span>}</div><div className="text-xs text-gray-500">{p.skill} · {p.modules} modules · {p.duration}h total</div><div className="flex gap-1 mt-1">{(p.languages||[]).slice(0,5).map((lang:string)=><span key={lang} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{lang}</span>)}</div></div><div className="text-right ml-4"><div className="text-lg font-black text-indigo-400">{p.enrolled.toLocaleString()}</div><div className="text-[10px] text-gray-500">enrolled</div><div className="text-sm font-bold text-emerald-400 mt-1">{p.completionRate}%</div><div className="text-[10px] text-gray-500">completion</div></div></div><div className="mt-2 h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-indigo-500" style={{width:`${p.completionRate}%`}} /></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.totalPaths||0}</div><div className="text-sm text-gray-400 mt-1">Learning Paths</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{(d.totalEnrolled||0).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Learners</div></div></div>}
      </div>
    </div>
  );
}

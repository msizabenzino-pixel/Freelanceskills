import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function SkillAssessments() {
  const [tab, setTab] = useState<"dashboard"|"assessments"|"results">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/assessments/dashboard"], queryFn:()=>fetch("/api/assessments/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: assessments } = useQuery({ queryKey:["/api/assessments/list"], queryFn:()=>fetch("/api/assessments/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="assessments" });
  const { data: results } = useQuery({ queryKey:["/api/assessments/results"], queryFn:()=>fetch("/api/assessments/results",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="results" });
  const d=(dash as any)||{};
  const diffColor=(d:string)=>({beginner:"#1DBF73",intermediate:"#eab308",advanced:"#f97316",expert:"#ef4444"}[d]||"#9ca3af");
  const typeIcon=(t:string)=>({mcq:"📋",coding:"💻",portfolio:"🎨",live:"🎙"}[t]||"📝");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Skill Assessment & Testing</h1>
        <p className="text-sm text-gray-500 mb-5">MCQ · Coding Challenges · Portfolio Review · Live Coding · HackerRank-level quality</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Attempts",v:(d.totalAttempts||0).toLocaleString(),c:"#6366f1"},{l:"Avg Pass Rate",v:`${d.avgPassRate||0}%`,c:"#1DBF73"},{l:"Active Tests",v:d.active||0,c:"#eab308"},{l:"Recent Results",v:d.recentResults||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","assessments","results"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="assessments"&&<div className="space-y-2">{((assessments as any)?.assessments||[]).map((a:any)=><div key={a.id} data-testid={`assessment-${a.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-lg">{typeIcon(a.type)}</span><span className="font-bold text-white">{a.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize" style={{background:`${diffColor(a.difficulty)}20`,color:diffColor(a.difficulty)}}>{a.difficulty}</span></div><div className="text-xs text-gray-500">{a.skill} · {a.questions} questions · {a.duration} min</div></div><div className="text-right"><div className="text-lg font-black text-emerald-400">{a.passRate}%</div><div className="text-[10px] text-gray-500">pass rate</div><div className="text-sm text-white">{a.attempts.toLocaleString()} attempts</div></div></div><div className="mt-2 h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-500" style={{width:`${a.passRate}%`}} /></div></div>)}</div>}
        {tab==="results"&&<div className="space-y-2">{((results as any)?.results||[]).map((r:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div><div className="text-sm font-bold text-white">{r.name}</div><div className="text-xs text-gray-500">{r.assessmentName}</div></div><div className="text-right"><div className="text-lg font-black" style={{color:r.passed?"#1DBF73":"#ef4444"}}>{r.score}%</div><div className="text-[10px]" style={{color:r.passed?"#1DBF73":"#ef4444"}}>{r.passed?"PASSED":"FAILED"}</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.totalPaths||d.total||0}</div><div className="text-sm text-gray-400 mt-1">Active Assessments</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.avgPassRate||0}%</div><div className="text-sm text-gray-400 mt-1">Avg Pass Rate</div></div></div>}
      </div>
    </div>
  );
}

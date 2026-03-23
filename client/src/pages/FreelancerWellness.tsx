import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function FreelancerWellness() {
  const [tab, setTab] = useState<"dashboard"|"burnout"|"resources">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/wellness/dashboard"], queryFn:()=>fetch("/api/wellness/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: burnout } = useQuery({ queryKey:["/api/wellness/burnout-alerts"], queryFn:()=>fetch("/api/wellness/burnout-alerts",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="burnout" });
  const { data: resources } = useQuery({ queryKey:["/api/wellness/resources"], queryFn:()=>fetch("/api/wellness/resources",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="resources" });
  const d=(dash as any)||{}; const b=(burnout as any)||{}; const r=(resources as any)||{};
  const riskColor=(l:string)=>l==="high"?"#ef4444":l==="medium"?"#f97316":"#1DBF73";
  const typeIcon=(t:string)=>({article:"📄",video:"🎥",guide:"📚",checklist:"✅"}[t]||"📋");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Freelancer Wellness</h1>
        <p className="text-sm text-gray-500 mb-5">Burnout Detection · Mental Health Resources · Mood Pulse · 11 Languages · Counselling Referrals</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Avg Hours/Week",v:d.avgHoursPerWeek||0,c:"#6366f1"},{l:"% Overworked",v:`${d.pctOverworked||0}%`,c:"#ef4444"},{l:"Burnout Alerts",v:d.burnoutAlerts||0,c:"#f97316"},{l:"Resources",v:d.resourceCount||0,c:"#1DBF73"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","burnout","resources"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="burnout"&&<div className="space-y-2">{(b.alerts||[]).map((a:any,i:number)=><div key={i} data-testid={`burnout-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${riskColor(a.riskLevel)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{a.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${riskColor(a.riskLevel)}20`,color:riskColor(a.riskLevel)}}>{a.riskLevel} risk</span></div><div className="text-xs text-gray-500">This week: <strong className="text-white">{a.hoursThisWeek}h</strong> · 4-week avg: {a.avgLast4Weeks}h</div><div className="text-xs text-yellow-400 mt-0.5">💡 {a.recommendation}</div></div></div></div>)}</div>}
        {tab==="resources"&&<div className="space-y-2">{(r.resources||[]).map((res:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex items-center gap-3"><span className="text-xl">{typeIcon(res.type)}</span><div><div className="text-sm font-bold text-white">{res.title}</div><div className="flex gap-2 mt-0.5">{(res.tags||[]).map((tag:string)=><span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{tag}</span>)}<span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400">{res.language}</span></div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Weekly Mood Pulse</div><div className="flex items-end gap-2 h-16">{(d.moodTrend||[]).map((w:any,i:number)=><div key={i} className="flex-1 flex flex-col items-center"><div className="w-full rounded-t" style={{height:`${(w.avg/5)*100}%`,background:"rgba(29,191,115,0.5)"}} /><div className="text-[9px] text-gray-600 mt-1">{w.week}</div></div>)}</div></div></div>}
      </div>
    </div>
  );
}

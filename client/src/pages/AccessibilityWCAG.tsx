import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function AccessibilityWCAG() {
  const [tab, setTab] = useState<"dashboard"|"issues"|"features">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/accessibility/dashboard"], queryFn:()=>fetch("/api/accessibility/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: issues } = useQuery({ queryKey:["/api/accessibility/issues"], queryFn:()=>fetch("/api/accessibility/issues",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="issues" });
  const { data: features } = useQuery({ queryKey:["/api/accessibility/features"], queryFn:()=>fetch("/api/accessibility/features",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="features" });
  const d=(dash as any)||{};
  const sevColor=(s:string)=>({critical:"#ef4444",serious:"#f97316",moderate:"#eab308",minor:"#9ca3af"}[s]||"#9ca3af");
  const featStatus=(s:string)=>s==="full"?"#1DBF73":s==="partial"?"#eab308":"#ef4444";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Accessibility &amp; WCAG</h1>
        <p className="text-sm text-gray-500 mb-5">WCAG 2.1 AA · Screen Reader · Keyboard Nav · USSD · High Contrast · Reduced Motion</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"WCAG Score",v:`${d.wcagScore||0}%`,c:"#1DBF73"},{l:"WCAG Level",v:d.level||"AA",c:"#6366f1"},{l:"Open Issues",v:d.issues||0,c:"#ef4444"},{l:"Critical",v:d.critical||0,c:"#ef4444"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","issues","features"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="issues"&&<div className="space-y-2">{((issues as any)||[]).map((iss:any,i:number)=><div key={i} data-testid={`a11y-issue-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sevColor(iss.severity)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${sevColor(iss.severity)}20`,color:sevColor(iss.severity)}}>{iss.severity}</span><span className="font-mono text-xs text-indigo-400">{iss.guideline}</span><span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:iss.status==="open"?"rgba(239,68,68,0.2)":"rgba(99,102,241,0.2)",color:iss.status==="open"?"#ef4444":"#818cf8"}}>{iss.status}</span></div><div className="text-sm text-white">{iss.description}</div><div className="text-xs text-gray-500 mt-0.5">Count: {iss.count}</div></div></div></div>)}</div>}
        {tab==="features"&&<div className="space-y-2">{((features as any)||[]).map((f:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${featStatus(f.status)}15`}}><div className="flex items-center justify-between"><div><div className="font-bold text-white">{f.name}</div><div className="text-xs text-gray-500">{f.notes}</div></div><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${featStatus(f.status)}20`,color:featStatus(f.status)}}>{f.status}</span></div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8 text-center" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-7xl font-black text-emerald-400 mb-1">{d.wcagScore||0}%</div><div className="text-white text-lg">WCAG 2.1 Level {d.level} Compliance</div><div className="text-sm text-gray-500 mt-1">NVDA · JAWS · VoiceOver · USSD · High Contrast · Reduced Motion</div><div className="text-sm text-gray-600 mt-0.5">{d.features||0} accessibility features fully supported</div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
export default function LegalCompliance() {
  const [tab, setTab] = useState<"dashboard"|"regulations"|"templates">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/legal-compliance/dashboard"], queryFn:()=>fetch("/api/legal-compliance/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: regulations } = useQuery({ queryKey:["/api/legal-compliance/regulations"], queryFn:()=>fetch("/api/legal-compliance/regulations",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="regulations" });
  const { data: templates } = useQuery({ queryKey:["/api/legal-compliance/templates"], queryFn:()=>fetch("/api/legal-compliance/templates",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="templates" });
  const d=(dash as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Legal & Regulatory Compliance</h1>
        <p className="text-sm text-gray-500 mb-5">POPIA · FICA · B-BBEE · Companies Act 71 · Audit Calendar · Legal Templates</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Regulations",v:d.regulations||0,c:"#6366f1"},{l:"Compliant",v:d.compliant||0,c:"#1DBF73"},{l:"Avg Score",v:`${d.avgScore||0}%`,c:"#eab308"},{l:"Templates",v:d.templates||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","regulations","templates"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="regulations"&&<div className="space-y-3">{((regulations as any)||[]).map((r:any)=><div key={r.id} data-testid={`reg-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(29,191,115,0.15)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-emerald-400 font-black text-lg">{r.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">COMPLIANT</span></div><div className="text-xs text-gray-400">{r.fullName}</div><div className="text-xs text-gray-500 mt-0.5">{r.jurisdiction} · Last audit: {format(new Date(r.lastAudit),"MMM d, yyyy")}</div></div><div className="text-right"><div className="text-2xl font-black text-white">{r.score}%</div><div className="text-xs text-gray-500">compliance score</div></div></div><div className="mt-2 h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-500" style={{width:`${r.score}%`}} /></div></div>)}</div>}
        {tab==="templates"&&<div className="space-y-2">{((templates as any)||[]).map((t:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div><span className="font-bold text-white">{t.name}</span><span className="ml-2 text-xs text-gray-500">v{t.version}</span></div>{t.approved&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">APPROVED</span>}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8 text-center" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-6xl font-black text-emerald-400 mb-2">{d.avgScore||0}%</div><div className="text-white">Avg Compliance Score — All Regulations</div><div className="text-sm text-gray-500 mt-1">POPIA · FICA · B-BBEE · Companies Act 71 · 100% Compliant</div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PlatformMigration() {
  const [tab, setTab] = useState<"dashboard"|"jobs"|"imported">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/migration/dashboard"], queryFn:()=>fetch("/api/migration/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: jobs } = useQuery({ queryKey:["/api/migration/jobs"], queryFn:()=>fetch("/api/migration/jobs",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="jobs" });
  const { data: imported } = useQuery({ queryKey:["/api/migration/imported"], queryFn:()=>fetch("/api/migration/imported",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="imported" });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({completed:"#1DBF73",in_progress:"#6366f1",queued:"#eab308",failed:"#ef4444"}[s]||"#9ca3af");
  const platformIcon=(p:string)=>({External:"💼",Portfolio:"🟢","Other":"🔵"}[p]||"📋");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Platform Migration Tools</h1>
        <p className="text-sm text-gray-500 mb-5">Import from other platforms · Portfolio Transfer · Review Migration · Profile Mapping</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Migrated",v:d.totalMigrated||0,c:"#1DBF73"},{l:"In Progress",v:d.inProgress||0,c:"#6366f1"},{l:"Platforms",v:d.platforms||0,c:"#eab308"},{l:"Portfolios",v:d.portfoliosImported||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","jobs","imported"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="jobs"&&<div className="space-y-2">{((jobs as any)?.jobs||[]).map((j:any,i:number)=><div key={i} data-testid={`migration-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${statusColor(j.status)}15`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-xl">{platformIcon(j.source)}</span><span className="font-bold text-white">{j.source}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${statusColor(j.status)}20`,color:statusColor(j.status)}}>{j.status.replace("_"," ")}</span></div><div className="text-xs text-gray-500">{j.freelancers} freelancers · {j.portfoliosImported} portfolios · {j.gigsCreated} gigs created</div></div>{j.completedAt&&<div className="text-xs text-gray-500">{new Date(j.completedAt).toLocaleDateString()}</div>}</div></div>)}</div>}
        {tab==="imported"&&<div className="space-y-2">{((imported as any)?.imported||[]).map((imp:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-start"><div><div className="flex items-center gap-2 mb-1"><span className="text-xl">{platformIcon(imp.platform)}</span><span className="font-bold text-white">{imp.platform}</span></div><div className="flex gap-1">{(imp.topSkills||[]).map((s:string)=><span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{s}</span>)}</div></div><div className="text-right"><div className="text-xl font-black text-emerald-400">{imp.count.toLocaleString()}</div><div className="text-xs text-gray-500">★ {imp.avgRating} avg</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.totalMigrated||0}</div><div className="text-sm text-gray-400 mt-1">Freelancers Migrated</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.portfoliosImported||0}</div><div className="text-sm text-gray-400 mt-1">Portfolios Imported</div></div></div>}
      </div>
    </div>
  );
}

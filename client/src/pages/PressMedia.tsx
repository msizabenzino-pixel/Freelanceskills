import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PressMedia() {
  const [tab, setTab] = useState<"dashboard"|"releases"|"mentions">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/press/dashboard"], queryFn:()=>fetch("/api/press/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: releases } = useQuery({ queryKey:["/api/press/releases"], queryFn:()=>fetch("/api/press/releases",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="releases" });
  const { data: mentions } = useQuery({ queryKey:["/api/press/mentions"], queryFn:()=>fetch("/api/press/mentions",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="mentions" });
  const d=(dash as any)||{};
  const sentColor=(s:string)=>s==="positive"?"#1DBF73":s==="negative"?"#ef4444":"#eab308";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Press & Media Relations</h1>
        <p className="text-sm text-gray-500 mb-5">Press Releases · Media Contacts · Social Mentions · Sentiment Analysis · PR Calendar</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Press Releases",v:d.releases||0,c:"#6366f1"},{l:"Total Views",v:(d.totalViews||0).toLocaleString(),c:"#1DBF73"},{l:"Mentions",v:(d.mentions||0).toLocaleString(),c:"#eab308"},{l:"Total Reach",v:(d.totalReach||0).toLocaleString(),c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","releases","mentions"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="releases"&&<div className="space-y-2">{((releases as any)?.releases||[]).map((r:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between"><div><div className="font-bold text-white">{r.title}</div><div className="text-xs text-gray-500">{r.outlet||"Not published"} · {new Date(r.date).toLocaleDateString()}</div></div><div className="text-right"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:r.status==="published"?"rgba(29,191,115,0.2)":"rgba(234,179,8,0.2)",color:r.status==="published"?"#1DBF73":"#eab308"}}>{r.status}</span>{r.views>0&&<div className="text-xs text-gray-400 mt-1">{r.views.toLocaleString()} views</div>}</div></div></div>)}</div>}
        {tab==="mentions"&&<div className="space-y-2">{((mentions as any)||[]).map((m:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${sentColor(m.sentiment)}20`}}><div className="flex items-center justify-between"><div><div className="font-bold text-white">{m.source}</div><div className="text-xs text-gray-500">{m.count.toLocaleString()} mentions · {m.reach.toLocaleString()} reach</div></div><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${sentColor(m.sentiment)}20`,color:sentColor(m.sentiment)}}>{m.sentiment}</span></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.published||0}</div><div className="text-sm text-gray-400 mt-1">Published Releases</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{(d.totalReach||0).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Media Reach</div></div></div>}
      </div>
    </div>
  );
}

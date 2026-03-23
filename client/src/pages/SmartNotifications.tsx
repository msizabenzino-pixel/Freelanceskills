import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function SmartNotifications() {
  const [tab, setTab] = useState<"dashboard"|"channels"|"rules">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/smart-notifications/dashboard"], queryFn:()=>fetch("/api/smart-notifications/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: channels } = useQuery({ queryKey:["/api/smart-notifications/channels"], queryFn:()=>fetch("/api/smart-notifications/channels",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="channels" });
  const { data: rules } = useQuery({ queryKey:["/api/smart-notifications/rules"], queryFn:()=>fetch("/api/smart-notifications/rules",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="rules" });
  const d=(dash as any)||{};
  const channelIcon=(n:string)=>({Email:"📧",SMS:"📱",WhatsApp:"💬",Push:"🔔",USSD:"*#",["In-App"]:"🖥️"}[n]||"📣");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Smart Notification Orchestrator</h1>
        <p className="text-sm text-gray-500 mb-5">6 Channels · Cascade Rules · USSD · WhatsApp · Push · Email · SMS · AI Timing · Suppression</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Channels",v:d.channels||0,c:"#6366f1"},{l:"Total Delivered",v:(d.totalDelivered||0).toLocaleString(),c:"#1DBF73"},{l:"Avg CTR",v:`${d.avgCTR||0}%`,c:"#eab308"},{l:"Suppressions",v:(d.suppressions||0).toLocaleString(),c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","channels","rules"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="channels"&&<div className="space-y-2">{((channels as any)?.channels||[]).map((c:any,i:number)=><div key={i} data-testid={`channel-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-2xl">{channelIcon(c.name)}</span><div><div className="font-bold text-white">{c.name}</div><div className="text-xs text-gray-500">{(c.delivered||0).toLocaleString()} delivered</div></div></div><div className="text-right"><div className="text-lg font-black text-emerald-400">{c.ctr}%</div><div className="text-[10px] text-gray-500">CTR</div></div></div></div>)}</div>}
        {tab==="rules"&&<div className="space-y-2">{((rules as any)?.rules||[]).map((r:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-start"><div><div className="font-bold text-white">{r.name}</div><div className="text-xs text-gray-500">Trigger: {r.trigger} · {r.channels} channels</div></div><div className="text-right"><div className="text-sm font-bold text-emerald-400">{r.successRate}%</div><div className="text-[10px] text-gray-500">success</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.channels||0}</div><div className="text-sm text-gray-400 mt-1">Active Channels</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.rules||0}</div><div className="text-sm text-gray-400 mt-1">Orchestration Rules</div></div></div>}
      </div>
    </div>
  );
}

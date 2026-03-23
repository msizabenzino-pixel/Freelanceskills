import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PartnerHub() {
  const [tab, setTab] = useState<"dashboard"|"partners">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/partners/dashboard"], queryFn:()=>fetch("/api/partners/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: partners } = useQuery({ queryKey:["/api/partners/list"], queryFn:()=>fetch("/api/partners/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="partners" });
  const d=(dash as any)||{};
  const typeColor=(t:string)=>({technology:"#6366f1",payment:"#1DBF73",finance:"#eab308",media:"#f97316",education:"#a855f7",logistics:"#06b6d4"}[t]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Partner & Integration Hub</h1>
        <p className="text-sm text-gray-500 mb-5">Technology · Finance · Payments · Media · Education — API Sync & Revenue Share</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Active Partners",v:d.active||0,c:"#1DBF73"},{l:"Pending",v:d.pending||0,c:"#eab308"},{l:"Monthly API Calls",v:(d.totalApiCalls||0).toLocaleString(),c:"#6366f1"},{l:"Endpoints",v:d.totalEndpoints||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","partners"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="partners"&&<div className="space-y-2">{((partners as any)?.partners||[]).map((p:any)=><div key={p.id} data-testid={`partner-${p.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${typeColor(p.type)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-xl">{p.logo}</span><span className="font-bold text-white">{p.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${typeColor(p.type)}20`,color:typeColor(p.type)}}>{p.type}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:p.status==="active"?"rgba(29,191,115,0.2)":"rgba(234,179,8,0.2)",color:p.status==="active"?"#1DBF73":"#eab308"}}>{p.status}</span></div><div className="text-xs text-gray-500">{p.category} · {p.endpoints} endpoints · {p.monthlyApiCalls.toLocaleString()} calls/mo</div></div><div className="text-right"><div className="text-sm text-gray-400">{p.revenueShare}% rev share</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Partners</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{(d.totalApiCalls||0).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Monthly API Calls</div></div></div>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
export default function EventManagement() {
  const [tab, setTab] = useState<"dashboard"|"events">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/events/dashboard"], queryFn:()=>fetch("/api/events/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: events } = useQuery({ queryKey:["/api/events/list"], queryFn:()=>fetch("/api/events/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="events" });
  const d=(dash as any)||{};
  const typeIcon=(t:string)=>({webinar:"🖥️",workshop:"🛠️",meetup:"🤝",virtual:"💻",conference:"🏛️"}[t]||"📅");
  const statusColor=(s:string)=>({upcoming:"#6366f1",live:"#ef4444",completed:"#9ca3af"}[s]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Event Management</h1>
        <p className="text-sm text-gray-500 mb-5">Webinars · Workshops · Meetups · Conferences · Video Streaming · Attendance Tracking</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Upcoming",v:d.upcoming||0,c:"#6366f1"},{l:"Total Registered",v:(d.totalRegistered||0).toLocaleString(),c:"#1DBF73"},{l:"Avg Capacity Fill",v:`${d.avgCapacityFill||0}%`,c:"#eab308"},{l:"Free Events",v:d.freeEvents||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","events"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="events"&&<div className="space-y-3">{((events as any)?.events||[]).map((e:any)=><div key={e.id} data-testid={`event-${e.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${statusColor(e.status)}15`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="text-xl">{typeIcon(e.type)}</span><span className="font-bold text-white">{e.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${statusColor(e.status)}20`,color:statusColor(e.status)}}>{e.status}</span>{e.free&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">FREE</span>}</div><div className="text-xs text-gray-500">{e.location} · hosted by {e.host}</div><div className="text-xs text-gray-600">{format(new Date(e.date),"EEEE, MMM d, yyyy")}</div><div className="text-xs text-gray-400 mt-1">{e.description}</div></div><div className="text-right ml-4"><div className="text-lg font-black text-indigo-400">{e.registered.toLocaleString()}</div><div className="text-xs text-gray-500">/{e.capacity.toLocaleString()} registered</div><div className="mt-1 h-1.5 rounded-full bg-gray-800 w-24"><div className="h-full rounded-full bg-indigo-500" style={{width:`${(e.registered/e.capacity)*100}%`}} /></div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Events</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{(d.totalRegistered||0).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Registrations</div></div></div>}
      </div>
    </div>
  );
}

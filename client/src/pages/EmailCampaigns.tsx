import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function EmailCampaigns() {
  const [tab, setTab] = useState<"dashboard"|"campaigns"|"templates">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/email-campaigns/dashboard"], queryFn:()=>fetch("/api/email-campaigns/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: campaigns } = useQuery({ queryKey:["/api/email-campaigns/list"], queryFn:()=>fetch("/api/email-campaigns/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="campaigns" });
  const { data: templates } = useQuery({ queryKey:["/api/email-campaigns/templates"], queryFn:()=>fetch("/api/email-campaigns/templates",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="templates" });
  const sendMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/email-campaigns/${id}/send`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Campaign send initiated 📧"}); qc.invalidateQueries({queryKey:["/api/email-campaigns"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>s==="sent"?"#1DBF73":s==="running"?"#6366f1":s==="scheduled"?"#eab308":"#9ca3af";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Email Marketing Automation</h1>
        <p className="text-sm text-gray-500 mb-5">POPIA Compliant · 11 Language Variants · Drip · Broadcast · Transactional</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Sent",v:(d.totalSent||0).toLocaleString(),c:"#6366f1"},{l:"Open Rate",v:`${d.openRate||0}%`,c:"#1DBF73"},{l:"Click Rate",v:`${d.clickRate||0}%`,c:"#f97316"},{l:"Bounce Rate",v:`${d.bounceRate||0}%`,c:"#ef4444"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","campaigns","templates"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="campaigns" && <div className="space-y-2">{((campaigns as any)?.campaigns||[]).map((c:any)=><div key={c.id} data-testid={`campaign-${c.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex gap-2 mb-1"><span className="font-bold text-white text-sm">{c.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(c.status)}20`,color:statusColor(c.status)}}>{c.status}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{c.type}</span></div><div className="text-xs text-gray-400 italic">{c.subject}</div><div className="flex gap-3 mt-1"><span className="text-xs text-gray-500">Sent: {c.sent.toLocaleString()}</span>{c.sent>0&&<><span className="text-xs text-emerald-400">Open: {((c.opened/c.sent)*100).toFixed(1)}%</span><span className="text-xs text-blue-400">Click: {((c.clicked/c.sent)*100).toFixed(1)}%</span></>}</div></div>{c.status==="draft"&&<button data-testid={`send-${c.id}`} onClick={()=>sendMut.mutate(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700 ml-2">Send</button>}</div></div>)}</div>}
        {tab==="templates" && <div className="space-y-2">{((templates as any)?.templates||[]).map((t:any)=><div key={t.id} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><span className="text-sm font-bold text-white">{t.name}</span><span className="text-xs text-gray-500">{t.category}</span></div><div className="text-xs text-gray-500 mt-1">{t.previewText}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.campaigns||0}</div><div className="text-sm text-gray-400 mt-1">Total Campaigns</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.templates||0}</div><div className="text-sm text-gray-400 mt-1">Templates Available</div></div></div>}
      </div>
    </div>
  );
}

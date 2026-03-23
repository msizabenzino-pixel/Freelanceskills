import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function RevenueShare() {
  const [tab, setTab] = useState<"dashboard"|"partners">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/revenue-share/dashboard"], queryFn:()=>fetch("/api/revenue-share/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: partners } = useQuery({ queryKey:["/api/revenue-share/partners"], queryFn:()=>fetch("/api/revenue-share/partners",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="partners" });
  const payMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/revenue-share/partners/${id}/pay`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:(d)=>{ toast({title:`Paid ${d.message||"via EFT"} ✓`}); qc.invalidateQueries({queryKey:["/api/revenue-share"]}); } });
  const d=(dash as any)||{};
  const typeColor=(t:string)=>({content_creator:"#f97316",educator:"#6366f1",community_lead:"#1DBF73",ambassador:"#eab308"}[t]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Revenue Share Program</h1>
        <p className="text-sm text-gray-500 mb-5">Content Creators · Educators · Community Leads · Ambassadors · EFT Payouts</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Active Partners",v:d.active||0,c:"#1DBF73"},{l:"Total Revenue",v:`R${((d.totalRevenue||0)/100).toLocaleString()}`,c:"#6366f1"},{l:"Total Earnings",v:`R${((d.totalEarnings||0)/100).toLocaleString()}`,c:"#eab308"},{l:"Total Followers",v:(d.totalFollowers||0).toLocaleString(),c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","partners"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="partners"&&<div className="space-y-2">{((partners as any)?.partners||[]).map((p:any)=><div key={p.id} data-testid={`revshare-${p.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${typeColor(p.type)}15`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{p.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${typeColor(p.type)}20`,color:typeColor(p.type)}}>{p.type.replace("_"," ")}</span></div><div className="text-xs text-gray-500">{p.followers.toLocaleString()} followers · {p.sharePercent}% share</div></div><div className="text-right"><div className="text-lg font-black text-emerald-400">R{((p.earnings||0)/100).toLocaleString()}</div><div className="text-[10px] text-gray-500">earnings</div><button data-testid={`pay-${p.id}`} onClick={()=>payMut.mutate(p.id)} className="mt-1 px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Pay EFT</button></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Revenue Share Partners</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">R{((d.totalEarnings||0)/100).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Earnings Paid</div></div></div>}
      </div>
    </div>
  );
}

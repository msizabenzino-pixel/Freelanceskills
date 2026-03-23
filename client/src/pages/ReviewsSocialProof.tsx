import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function ReviewsSocialProof() {
  const [tab, setTab] = useState<"dashboard"|"reviews"|"flagged">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/reviews/dashboard"], queryFn:()=>fetch("/api/reviews/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: reviews } = useQuery({ queryKey:["/api/reviews/list"], queryFn:()=>fetch("/api/reviews/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="reviews" });
  const { data: flagged } = useQuery({ queryKey:["/api/reviews/list/flagged"], queryFn:()=>fetch("/api/reviews/list?flagged=true",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="flagged" });
  const approveMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/reviews/${id}/approve`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Review approved ✓"}); qc.invalidateQueries({queryKey:["/api/reviews"]}); } });
  const deleteMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/reviews/${id}`,{method:"DELETE",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Review removed"}); qc.invalidateQueries({queryKey:["/api/reviews"]}); } });
  const d=(dash as any)||{};
  const stars=(n:number)=>"★".repeat(Math.round(n))+"☆".repeat(5-Math.round(n));
  const ReviewCard=({r,showActions}:{r:any,showActions?:boolean})=>(
    <div data-testid={`review-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:r.flagged?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(255,255,255,0.08)"}}>
      <div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white text-sm">{r.freelancerName}</span>{r.verified&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">VERIFIED</span>}</div><div className="text-yellow-400 text-sm">{stars(r.rating)} {r.rating}</div><div className="text-xs text-gray-500 mt-0.5">by {r.clientName}</div><div className="text-sm text-white mt-1 italic">"{r.title}"</div></div>{showActions&&<div className="flex gap-1 ml-2"><button onClick={()=>approveMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Approve</button><button onClick={()=>deleteMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-red-700 text-white">Remove</button></div>}</div>
    </div>
  );
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Reviews & Social Proof</h1>
        <p className="text-sm text-gray-500 mb-5">Review Management · AI Fraud Detection · Verified Badges · Platform Trust</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Avg Rating",v:d.avgRating||0,c:"#FFD700"},{l:"Verified",v:d.verified||0,c:"#1DBF73"},{l:"Flagged",v:d.flagged||0,c:"#ef4444"},{l:"5-Star Reviews",v:d.fiveStar||0,c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","reviews","flagged"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(255,215,0,0.12)":"rgba(255,255,255,0.04)",color:tab===t?"#FFD700":"#6b7280",border:tab===t?"1px solid rgba(255,215,0,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t==="flagged"?"🚩 Flagged":t}</button>)}
        </div>
        {tab==="reviews"&&<div className="space-y-2">{((reviews as any)?.reviews||[]).map((r:any)=><ReviewCard key={r.id} r={r} />)}</div>}
        {tab==="flagged"&&<div className="space-y-2">{((flagged as any)?.reviews||[]).map((r:any)=><ReviewCard key={r.id} r={r} showActions />)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.2)"}}><div className="text-4xl font-black text-yellow-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Reviews</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.responded||0}</div><div className="text-sm text-gray-400 mt-1">With Owner Response</div></div></div>}
      </div>
    </div>
  );
}

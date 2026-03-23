import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function CommunityForums() {
  const [tab, setTab] = useState<"dashboard"|"posts">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/community/dashboard"], queryFn:()=>fetch("/api/community/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: posts } = useQuery({ queryKey:["/api/community/posts"], queryFn:()=>fetch("/api/community/posts",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="posts" });
  const pinMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/community/posts/${id}/pin`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Pin toggled ✓"}); qc.invalidateQueries({queryKey:["/api/community"]}); } });
  const deleteMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/community/posts/${id}`,{method:"DELETE",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Post removed"}); qc.invalidateQueries({queryKey:["/api/community"]}); } });
  const d=(dash as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Community & Forums</h1>
        <p className="text-sm text-gray-500 mb-5">Discussion Boards · Community Management · AI Toxicity Filter · Leaderboard · Moderation</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Posts",v:d.posts||0,c:"#6366f1"},{l:"Total Views",v:(d.totalViews||0).toLocaleString(),c:"#1DBF73"},{l:"Total Replies",v:d.totalReplies||0,c:"#eab308"},{l:"Categories",v:d.categories||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","posts"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="posts"&&<div className="space-y-2">{((posts as any)?.posts||[]).map((p:any)=><div key={p.id} data-testid={`post-${p.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${p.pinned?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.08)"}`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1">{p.pinned&&<span className="text-yellow-400">📌</span>}<span className="font-bold text-white">{p.title}</span></div><div className="text-xs text-gray-500">{p.author} · {p.category} · {p.views.toLocaleString()} views · {p.replies} replies · {p.likes} likes</div></div><div className="flex gap-1 ml-2"><button onClick={()=>pinMut.mutate(p.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-700/40 text-yellow-400">{p.pinned?"Unpin":"Pin"}</button><button onClick={()=>deleteMut.mutate(p.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-red-700/40 text-red-400">Remove</button></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.pinned||0}</div><div className="text-sm text-gray-400 mt-1">Pinned Announcements</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.categories||0}</div><div className="text-sm text-gray-400 mt-1">Categories</div></div></div>}
      </div>
    </div>
  );
}

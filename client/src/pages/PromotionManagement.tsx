/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PROMOTION MANAGEMENT v2.0 — 200% ELON MUSK INTELLIGENCE                    ║
 * ║  9 Tabs. 20 Superpowers. 3 Years ahead of every competitor.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 9 TABS vs Fiverr=0, Freelancer=1, Upwork=0, Toptal=0, PPH=1
 *
 * 📋 Active       — sortable by ROI/CTR/predicted uplift + bulk + extend
 * 🛍️ Catalog     — 6 slot types, live inventory, AI pricing preview, create
 * 💰 AI Pricing   — demand signals, live market heat, 10 dynamic rules
 * 📊 Analytics    — full funnel, predictive lift, A/B, country, ROI by slot
 * 🎨 Creative AI  — auto-generate banner variants, A/B test, declare winner
 * 🔨 Auction      — real-time prime slot bidding, reserve price, close auction
 * ⏰ Scheduler    — DOW peak heatmap, auto-renew, smart launch timing
 * 🌍 Africa Hub   — R5–R50 micro-tiers, USSD flow, mobile money, zero-data
 * ⏳ Approvals    — pre-approval queue, approve/reject, linked to Moderation
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell, PieChart, Pie, Legend,
} from "recharts";

// ── Design tokens ──────────────────────────────────────────────────────────────
const G = "#1DBF73";
const GOLD = "#f59e0b";
const R = "#ef4444";
const O = "#f97316";
const P = "#8b5cf6";
const B = "#0891b2";

const STATUS_COL: Record<string, string> = {
  active: G, pending_approval: "#6366f1", paused: O, expired: "#9ca3af",
  rejected: R, cancelled: "#6b7280", won: GOLD, open: B, no_winner: R,
};
const SLOT_ICON: Record<string, string> = {
  homepage_banner: "🏠", featured_gig: "⭐", featured_freelancer: "👤",
  featured_job: "💼", sponsored_search: "🔍", email_spotlight: "📧",
};
const SLOT_COL: Record<string, string> = {
  homepage_banner: "#7c3aed", featured_gig: GOLD, featured_freelancer: G,
  featured_job: B, sponsored_search: O, email_spotlight: R,
};
const PIE_COL = [G, GOLD, O, P, R, B];

// ── API ────────────────────────────────────────────────────────────────────────
const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};
const zarFmt = (c: number) => `R${(c / 100).toFixed(2)}`;
const zarK = (c: number) => c >= 100000 ? `R${(c / 100000).toFixed(1)}K` : zarFmt(c);
const pctFmt = (n: number) => `${(Number(n) * 100).toFixed(2)}%`;
const fmtDate = (d: string | null) => !d ? "—" : new Date(d).toLocaleDateString("en-ZA", { day:"2-digit", month:"short", year:"numeric" });
const timeLeft = (d: string) => { const s = Math.floor((new Date(d).getTime()-Date.now())/1000); if(s<0)return"Closed"; if(s<3600)return`${Math.floor(s/60)}m`; if(s<86400)return`${Math.floor(s/3600)}h`; return`${Math.floor(s/86400)}d`; };

// ── Types ──────────────────────────────────────────────────────────────────────
interface Promo { id:number; slot_type:string; subject_type:string; subject_id:string; user_id:string; title:string; description:string|null; price_paid_cents:number; duration_days:number; starts_at:string|null; ends_at:string|null; status:string; ai_score:number; merit_boost:boolean; merit_discount_pct:number; moderation_approved:boolean|null; moderation_note:string|null; created_at:string; days_remaining:number; impressions:number; clicks:number; conversions:number; revenue_generated_cents:number; avg_ctr:number; has_auto_renew:boolean; }
interface Slot { id:number; slot_type:string; display_name:string; description:string; max_concurrent:number; base_price_cents:number; min_duration_days:number; max_duration_days:number; is_active:boolean; africa_micro_tier:boolean; africa_price_cents:number|null; ussd_enabled:boolean; active_count:number; available:number; }
interface PricingRule { id:number; slot_type:string; rule_name:string; rule_type:string; multiplier:string; flat_discount_cents:number; conditions:any; priority:number; is_active:boolean; }
interface Creative { id:number; promotion_id:number; creative_name:string; headline:string; subheadline:string; cta_text:string; bg_color:string; accent_color:string; image_style:string; ab_group:string; ai_generated:boolean; is_active:boolean; impressions:number; clicks:number; ctr:string; }
interface Auction { id:number; slot_type:string; slot_date:string; slot_position:number; status:string; reserve_price_cents:number; current_bid_cents:number; winning_user_id:string|null; bid_count:number; closes_at:string; }
interface MeritUser { userId:string; name:string; reason:string; meritType:string; suggestedSlot:string; suggestedDuration:number; estimatedValue:number; achievedAt:string; }
interface AiRec { rank:number; subjectType:string; title:string; userId:string; aiScore:number; reason:string; meritEligible:boolean; estimatedRoi:string; suggestedSlot:string; suggestedDuration:number; estimatedImpressions:number; estimatedConversions:number; demandScore:number; optimalDow:string; }
interface Stats { total:number; active:number; pending:number; expired:number; paused:number; meritPromotions:number; revenueActiveZar:number; revenueTotalZar:number; totalImpressions:number; totalClicks:number; totalConversions:number; totalRoiZar:number; avgCtr:number; avgCvr:number; openAuctions:number; highestBidZar:number; scheduledAutoRenew:number; }

// ── Shared Micro-Components ────────────────────────────────────────────────────
function Spinner() { return <div className="w-5 h-5 animate-spin border-2 rounded-full" style={{ borderColor:`${G} transparent` }} />; }
function StaBadge({ v }:{ v:string }) { return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background:STATUS_COL[v]||"#6b7280" }}>{v.replace(/_/g," ")}</span>; }
function SlotBadge({ v }:{ v:string }) { return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background:SLOT_COL[v]||"#6b7280" }}>{SLOT_ICON[v]} {v.replace(/_/g," ")}</span>; }
function ScoreBar({ score, col }:{ score:number; col?:string }) {
  const c = col||(score>=80?G:score>=60?GOLD:score>=40?O:R);
  return <div className="flex items-center gap-1.5"><div className="flex-1 h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width:`${score}%`, background:c }} /></div><span className="text-xs font-bold w-7 text-right" style={{ color:c }}>{score}</span></div>;
}
function SortTh({ label, col, sortBy, sortDir, onSort }:{ label:string; col:string; sortBy:string; sortDir:string; onSort:(c:string)=>void }) {
  const a = sortBy===col;
  return <th className="px-3 py-3 text-left cursor-pointer" onClick={()=>onSort(col)}><span className={`flex items-center gap-1 text-xs uppercase tracking-wide font-semibold ${a?"text-amber-500":"text-gray-400 hover:text-gray-600"}`}>{label}<span className="text-[9px]">{a?(sortDir==="asc"?"▲":"▼"):"⇅"}</span></span></th>;
}
function KpiCard({ label, value, sub, col="#374151", bg="bg-white" }:{ label:string; value:string|number; sub?:string; col?:string; bg?:string }) {
  return <div className={`rounded-xl border border-gray-100 p-3.5 ${bg}`}><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p><p className="text-xl font-black mt-1" style={{ color:col }}>{value}</p>{sub&&<p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: ACTIVE PROMOTIONS
// ═══════════════════════════════════════════════════════════════════════════════
function ActiveTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Promo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterSlot, setFilterSlot] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [extending, setExtending] = useState<Promo|null>(null);
  const [extraDays, setExtraDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ status:filterStatus, page:String(page), limit:"20", sortBy, sortDir });
      if (filterSlot !== "all") p.set("slotType", filterSlot);
      if (search) p.set("search", search);
      const d = await api(`/api/promotions?${p}`);
      setItems(d.items); setTotal(d.total);
    } catch (e:any) { toast({ title:"Error", description:e.message, variant:"destructive" }); }
    finally { setLoading(false); }
  }, [filterStatus, filterSlot, page, sortBy, sortDir, search, toast]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id:number) => { try { const r = await api(`/api/promotions/${id}/toggle`,{method:"POST",body:"{}"}); toast({title:r.message}); load(); } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }};
  const extend = async () => { if(!extending)return; try { await api(`/api/promotions/${extending.id}/extend`,{method:"POST",body:JSON.stringify({extraDays})}); toast({title:"Extended!"}); setExtending(null); load(); } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }};
  const doBulk = async (action:string) => { if(!selected.size)return; try { const r = await api("/api/promotions/bulk",{method:"POST",body:JSON.stringify({ids:[...selected],action})}); toast({title:r.message}); setSelected(new Set()); load(); } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }};
  const toggleSel = (id:number) => setSelected(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const onSort = (col:string) => { if(sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortBy(col); setSortDir("desc"); } };
  const ctrPct = (c:number, i:number) => i>0 ? `${((c/i)*100).toFixed(2)}%` : "—";
  const roiX = (rev:number, cost:number) => cost>0 ? `${(Number(rev)/Number(cost)).toFixed(1)}x` : "—";

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <Input placeholder="Search promotions…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-44 h-8 text-xs" data-testid="input-search-promos" />
        <Select value={filterStatus} onValueChange={v=>{setFilterStatus(v);setPage(1);}}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="filter-status"><SelectValue /></SelectTrigger>
          <SelectContent>{["active","pending_approval","paused","expired","rejected","all"].map(s=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterSlot} onValueChange={v=>{setFilterSlot(v);setPage(1);}}>
          <SelectTrigger className="w-44 h-8 text-xs" data-testid="filter-slot"><SelectValue placeholder="Slot" /></SelectTrigger>
          <SelectContent>{["all","homepage_banner","featured_gig","featured_freelancer","featured_job","sponsored_search","email_spotlight"].map(s=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex-1" />
        {selected.size>0&&<div className="flex gap-1.5 items-center">
          <span className="text-xs text-gray-400">{selected.size} sel.</span>
          {[{a:"pause",c:"bg-orange-500",l:"⏸ Pause"},{a:"resume",c:"",l:"▶ Resume",s:G},{a:"cancel",c:"bg-red-500",l:"✕ Cancel"}].map(({a,c,l,s})=>(
            <button key={a} onClick={()=>doBulk(a)} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${c}`} style={s?{background:s}:{}}>{l}</button>
          ))}
        </div>}
        <button onClick={load} className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">↻</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Spinner /></div> : items.length===0 ? (
          <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">📋</div><p>No promotions found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-3 py-3 w-8"><input type="checkbox" onChange={e=>setSelected(e.target.checked?new Set(items.map(i=>i.id)):new Set())} checked={selected.size===items.length&&items.length>0} /></th>
                <SortTh label="Title" col="title" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase font-semibold">Slot</th>
                <SortTh label="Price" col="price_paid_cents" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="Left" col="ends_at" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="Impr." col="impressions" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="CTR" col="ctr" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="Conv." col="conversions" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="ROI" col="roi" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <SortTh label="AI Score" col="ai_score" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase font-semibold">Status</th>
                <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase font-semibold">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item=>(
                  <tr key={item.id} data-testid={`row-promo-${item.id}`} className={`hover:bg-gray-50 ${selected.has(item.id)?"bg-amber-50":""}`}>
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(item.id)} onChange={()=>toggleSel(item.id)} /></td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <p className="text-xs font-semibold text-gray-700 truncate">{item.title}</p>
                      <div className="flex gap-1 mt-0.5">
                        {item.merit_boost&&<span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-600 font-bold">🎓</span>}
                        {item.has_auto_renew&&<span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 font-bold">↻</span>}
                        <span className="text-[9px] text-gray-400">#{item.id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><SlotBadge v={item.slot_type} /></td>
                    <td className="px-3 py-2.5 text-xs font-bold" style={{color:GOLD}}>{zarFmt(item.price_paid_cents)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-bold ${item.days_remaining<=1?"text-red-500":item.days_remaining<=3?"text-orange-500":"text-gray-600"}`}>
                        {item.status==="active"?`${item.days_remaining}d`:"—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-700">{Number(item.impressions||0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold" style={{color:G}}>{ctrPct(Number(item.clicks||0),Number(item.impressions||0))}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-indigo-600">{Number(item.conversions||0)}</td>
                    <td className="px-3 py-2.5 text-xs font-black" style={{color:Number(item.revenue_generated_cents||0)>0?G:"#9ca3af"}}>{roiX(Number(item.revenue_generated_cents||0),item.price_paid_cents)}</td>
                    <td className="px-3 py-2.5 w-20">{item.ai_score>0?<ScoreBar score={item.ai_score} />:<span className="text-xs text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5"><StaBadge v={item.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {(item.status==="active"||item.status==="paused")&&<button data-testid={`btn-toggle-${item.id}`} onClick={()=>toggle(item.id)} className="px-2 py-1 rounded text-[10px] font-bold text-white" style={{background:item.status==="active"?O:G}}>{item.status==="active"?"⏸":"▶"}</button>}
                        {item.status==="active"&&<button data-testid={`btn-extend-${item.id}`} onClick={()=>setExtending(item)} className="px-2 py-1 rounded text-[10px] bg-indigo-50 text-indigo-600 font-bold">+d</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {Math.ceil(total/20)>1&&<div className="flex justify-center gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">← Prev</button>
        <span className="px-4 py-1.5 text-sm text-gray-500">{page}/{Math.ceil(total/20)} ({total})</span>
        <button onClick={()=>setPage(p=>Math.min(Math.ceil(total/20),p+1))} disabled={page>=Math.ceil(total/20)} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">Next →</button>
      </div>}

      <Dialog open={!!extending} onOpenChange={()=>setExtending(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Extend Promotion</DialogTitle></DialogHeader>
          {extending&&<div className="space-y-4">
            <p className="text-sm text-gray-600">{extending.title}</p>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Extra Days</p>
              <Input type="number" min={1} max={90} value={extraDays} onChange={e=>setExtraDays(parseInt(e.target.value)||1)} />
              <p className="text-xs text-gray-400 mt-1">Cost: {zarFmt(Math.round(extending.price_paid_cents/extending.duration_days)*extraDays)}</p>
            </div>
            <DialogFooter>
              <button onClick={()=>setExtending(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-extend" onClick={extend} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{background:G}}>Extend</button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: CATALOG
// ═══════════════════════════════════════════════════════════════════════════════
function CatalogTab() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<Slot|null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot|null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subjectType:"gig", subjectId:"", userId:"", title:"", description:"", durationDays:7, userCountry:"ZA", isMeritUser:false, isFirstPromotion:false, categoryTrendScore:50, aiScore:0, scheduleAutoRenew:false });

  useEffect(()=>{ setLoading(true); api("/api/promotions/catalog/slots").then(setSlots).catch(e=>toast({title:"Error",description:e.message,variant:"destructive"})).finally(()=>setLoading(false)); },[]);

  const loadPreview = async (slot:Slot) => {
    setPreviewLoading(true);
    try { const p = await api("/api/promotions/pricing/preview",{method:"POST",body:JSON.stringify({slotType:slot.slot_type,durationDays:form.durationDays,userCountry:form.userCountry,isMeritUser:form.isMeritUser,isFirstPromotion:form.isFirstPromotion,categoryTrendScore:form.categoryTrendScore,aiScore:form.aiScore})}); setPreview(p); } catch {}
    finally { setPreviewLoading(false); }
  };

  const openCreate = (slot:Slot) => { setCreating(slot); setPreview(null); loadPreview(slot); };

  const submitCreate = async () => {
    if(!creating||!form.subjectId||!form.userId||!form.title)return;
    setSubmitting(true);
    try {
      const r = await api("/api/promotions",{method:"POST",body:JSON.stringify({slotType:creating.slot_type,...form})});
      toast({title:"Promotion created!",description:r.message}); setCreating(null); setPreview(null);
    } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setSubmitting(false); }
  };

  const saveSlot = async () => {
    if(!editingSlot)return;
    try { await api(`/api/promotions/catalog/slots/${editingSlot.id}`,{method:"PUT",body:JSON.stringify({displayName:editingSlot.display_name,maxConcurrent:editingSlot.max_concurrent,basePriceCents:editingSlot.base_price_cents,isActive:editingSlot.is_active,africaPriceCents:editingSlot.africa_price_cents,ussdEnabled:editingSlot.ussd_enabled})}); toast({title:"Slot updated"}); setEditingSlot(null); api("/api/promotions/catalog/slots").then(setSlots).catch(()=>{}); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h3 className="font-bold text-amber-800 mb-1">6 Slot Types — Africa-first promotion system</h3>
        <p className="text-xs text-amber-600">Each slot is an independent visibility channel. AI generates creatives automatically for every promotion created.</p>
      </div>
      {loading?<div className="flex justify-center py-8"><Spinner /></div>:(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slots.map(slot=>(
            <div key={slot.id} data-testid={`slot-${slot.slot_type}`} className={`bg-white rounded-xl border-2 p-5 ${slot.is_active?"border-gray-100":"border-gray-100 opacity-60"}`}>
              <div className="flex items-start gap-2 mb-3">
                <span className="text-2xl">{SLOT_ICON[slot.slot_type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{slot.display_name}</span>
                    {slot.ussd_enabled&&<span className="text-[9px] px-1 py-0.5 rounded bg-orange-100 text-orange-600 font-bold">USSD</span>}
                    {slot.africa_micro_tier&&<span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-600 font-bold">🌍</span>}
                    {!slot.is_active&&<span className="text-[9px] px-1 py-0.5 rounded bg-gray-200 text-gray-400 font-bold">OFF</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{slot.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-amber-50 rounded-lg p-2 text-center"><div className="text-sm font-black" style={{color:GOLD}}>{zarFmt(slot.base_price_cents)}</div><div className="text-[9px] text-gray-400">per day ZA</div></div>
                {slot.africa_price_cents&&<div className="bg-green-50 rounded-lg p-2 text-center"><div className="text-sm font-black text-green-600">{zarFmt(slot.africa_price_cents)}</div><div className="text-[9px] text-gray-400">Africa tier</div></div>}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>{slot.active_count}/{slot.max_concurrent} filled</span>
                  <span className={Number(slot.available)<=1?"text-red-500 font-bold":"text-green-600 font-bold"}>{slot.available} avail.</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{width:`${(Number(slot.active_count)/Number(slot.max_concurrent))*100}%`,background:Number(slot.available)<=1?R:GOLD}} /></div>
              </div>
              <div className="flex gap-2">
                <button data-testid={`btn-create-${slot.slot_type}`} onClick={()=>openCreate(slot)} disabled={!slot.is_active||Number(slot.available)<=0}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{background:SLOT_COL[slot.slot_type]}}>
                  {Number(slot.available)<=0?"Sold Out":"+ Create Promotion"}
                </button>
                <button onClick={()=>setEditingSlot({...slot})} className="px-3 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">⚙</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Promotion Dialog */}
      <Dialog open={!!creating} onOpenChange={()=>{setCreating(null);setPreview(null);}}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2">{creating&&<span>{SLOT_ICON[creating.slot_type]}</span>}Create {creating?.display_name}</DialogTitle></DialogHeader>
          {creating&&<div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Subject Type</p>
                <Select value={form.subjectType} onValueChange={v=>setForm(p=>({...p,subjectType:v}))}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["gig","freelancer","job","banner"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration</p>
                <Input type="number" min={creating.min_duration_days} max={creating.max_duration_days} value={form.durationDays} onChange={e=>{setForm(p=>({...p,durationDays:parseInt(e.target.value)||7}));loadPreview(creating);}} className="text-xs" /></div>
            </div>
            {[{l:"Subject ID",k:"subjectId"},{l:"User ID",k:"userId"}].map(({l,k})=>(
              <div key={k}><p className="text-xs font-bold text-gray-400 uppercase mb-1">{l}</p><Input value={(form as any)[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="text-xs" /></div>
            ))}
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Promotion Title</p><Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="text-xs" /></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Description</p><Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} className="text-xs" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Country</p>
                <Select value={form.userCountry} onValueChange={v=>{setForm(p=>({...p,userCountry:v}));loadPreview(creating);}}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["ZA","NG","KE","GH","ZW","US","GB","AU"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Category Score</p><Input type="number" min={0} max={100} value={form.categoryTrendScore} onChange={e=>{setForm(p=>({...p,categoryTrendScore:parseInt(e.target.value)||50}));loadPreview(creating);}} className="text-xs" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">AI Score</p><Input type="number" min={0} max={100} value={form.aiScore} onChange={e=>{setForm(p=>({...p,aiScore:parseInt(e.target.value)||0}));loadPreview(creating);}} className="text-xs" /></div>
            </div>
            <div className="flex gap-4">
              {[{l:"Merit User (30% off)",k:"isMeritUser"},{l:"First promoter (20% off)",k:"isFirstPromotion"},{l:"Auto-Renew",k:"scheduleAutoRenew"}].map(({l,k})=>(
                <label key={k} className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"><input type="checkbox" checked={(form as any)[k]} onChange={e=>{setForm(p=>({...p,[k]:e.target.checked}));if(k!=="scheduleAutoRenew")loadPreview(creating);}} className="rounded" />{l}</label>
              ))}
            </div>
            {/* Pricing Preview */}
            {previewLoading?<div className="flex justify-center py-3"><Spinner /></div>:preview&&(
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase mb-2">💰 AI Dynamic Pricing Preview</p>
                <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                  {[{l:"Per Day",v:zarFmt(preview.perDayCents)},{l:`Total ${form.durationDays}d`,v:zarFmt(preview.totalCents)},{l:"Savings",v:preview.totalSavingsCents>0?zarFmt(preview.totalSavingsCents):"—"},{l:"Pred. ROI",v:`${preview.predictedRoiMultiplier}x`}].map(({l,v})=>(
                    <div key={l} className="bg-white rounded-lg p-2"><div className="text-sm font-black text-gray-800">{v}</div><div className="text-[9px] text-gray-400">{l}</div></div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                  {[{l:"Pred. Impr.",v:(preview.estimatedImpressions||0).toLocaleString()},{l:"Pred. Clicks",v:(preview.estimatedClicks||0).toLocaleString()},{l:"Pred. Conv.",v:preview.estimatedConversions||0}].map(({l,v})=>(
                    <div key={l} className="bg-white/60 rounded-lg p-1.5 text-center"><div className="text-xs font-bold text-gray-700">{v}</div><div className="text-[9px] text-gray-400">{l}</div></div>
                  ))}
                </div>
                <div className="mb-2"><p className="text-[9px] text-amber-600 font-bold uppercase mb-1">Demand: <span className="font-black">{preview.demandScore}/100</span> · Multiplier: ×{preview.demandMultiplier}</p></div>
                {preview.appliedRules?.length>0&&<div>{preview.appliedRules.map((r:string)=><p key={r} className="text-[11px] text-amber-700">• {r}</p>)}</div>}
              </div>
            )}
            <DialogFooter>
              <button onClick={()=>{setCreating(null);setPreview(null);}} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-create" onClick={submitCreate} disabled={submitting||!form.title||!form.subjectId||!form.userId}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:GOLD}}>
                {submitting?"Creating…":"Create + AI Generate Creatives"}
              </button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={()=>setEditingSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Slot — {editingSlot?.display_name}</DialogTitle></DialogHeader>
          {editingSlot&&<div className="space-y-3">
            {[{l:"Display Name",k:"display_name"},{l:"Max Concurrent",k:"max_concurrent",t:"number"},{l:"Base Price (cents ZAR)",k:"base_price_cents",t:"number"},{l:"Africa Price (cents)",k:"africa_price_cents",t:"number"}].map(({l,k,t="text"})=>(
              <div key={k}><p className="text-xs font-bold text-gray-400 uppercase mb-1">{l}</p><Input type={t} value={(editingSlot as any)[k]||""} onChange={e=>setEditingSlot(p=>p?({...p,[k]:t==="number"?parseInt(e.target.value)||0:e.target.value}):null)} className="text-xs" /></div>
            ))}
            {[{l:"Active",k:"is_active"},{l:"USSD Enabled",k:"ussd_enabled"}].map(({l,k})=>(
              <label key={k} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={(editingSlot as any)[k]} onChange={e=>setEditingSlot(p=>p?({...p,[k]:e.target.checked}):null)} className="rounded" />{l}</label>
            ))}
            <DialogFooter>
              <button onClick={()=>setEditingSlot(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button onClick={saveSlot} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{background:G}}>Save</button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: AI PRICING ENGINE (demand signals + rules)
// ═══════════════════════════════════════════════════════════════════════════════
function PricingTab() {
  const { toast } = useToast();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({ slotType:"featured_gig", ruleName:"", ruleType:"multiplier", multiplier:"1.00", priority:10 });

  const load = () => {
    setLoading(true);
    Promise.all([api("/api/promotions/pricing/rules"),api("/api/promotions/pricing/demand")])
      .then(([r,d])=>{ setRules(r); setDemand(d); })
      .catch(e=>toast({title:"Error",description:e.message,variant:"destructive"}))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const toggle = async (r:PricingRule) => { try { await api(`/api/promotions/pricing/rules/${r.id}/toggle`,{method:"POST",body:"{}"}); load(); } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }};
  const remove = async (id:number) => { if(!confirm("Delete rule?"))return; try { await api(`/api/promotions/pricing/rules/${id}`,{method:"DELETE"}); load(); } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }};
  const addRule = async () => {
    if(!newRule.ruleName)return; setAdding(true);
    try { await api("/api/promotions/pricing/rules",{method:"POST",body:JSON.stringify(newRule)}); toast({title:"Rule added"}); setShowAdd(false); load(); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setAdding(false); }
  };

  const bySlot = Array.from(new Set(rules.map(r=>r.slot_type)));

  return (
    <div className="space-y-4">
      {/* Live Demand Signals */}
      {demand&&(
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800">📡 Live Market Demand Signals</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {demand.isPeakDay?"🔥 Peak Day (Mon–Wed)":"Moderate Day"} · {demand.isPeakHour?"⚡ Peak Hour (9–11 or 14–16)":"Off-peak Hour"} · Updates every minute
              </p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100">↻ Refresh</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {(demand.demand||[]).map((s:any)=>(
              <div key={s.slot_type} className="border border-gray-100 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{SLOT_ICON[s.slot_type]}</div>
                <div className="text-[10px] font-bold text-gray-500 mb-1.5">{(s.display_name||"").split(" ").slice(0,2).join(" ")}</div>
                <div className="h-1.5 bg-gray-100 rounded-full mb-1">
                  <div className="h-full rounded-full" style={{width:`${s.demandScore}%`,background:s.demandScore>=80?R:s.demandScore>=60?GOLD:G}} />
                </div>
                <div className="text-xs font-black" style={{color:s.demandScore>=80?R:s.demandScore>=60?GOLD:G}}>{s.demandScore}</div>
                <div className="text-[9px] text-gray-400">{s.active}/{s.max} slots</div>
                <div className="text-[9px] font-bold text-indigo-600 mt-0.5">×{s.priceMultiplier}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-1 mr-4">
          <h3 className="font-bold text-indigo-800 mb-1">Dynamic Pricing Engine — {rules.length} Rules Active</h3>
          <p className="text-xs text-indigo-600">Rules stack in priority order. Demand surge, Africa micro-tier, merit discount, peak season, long-campaign all calculate independently. Active rules: {rules.length}+.</p>
        </div>
        <button data-testid="btn-add-pricing-rule" onClick={()=>setShowAdd(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0" style={{background:GOLD}}>+ Add Rule</button>
      </div>

      {loading?<div className="flex justify-center py-8"><Spinner /></div>:bySlot.map(slot=>(
        <div key={slot} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <SlotBadge v={slot} />
            <span className="text-xs text-gray-400">{rules.filter(r=>r.slot_type===slot).length} rules</span>
          </div>
          {rules.filter(r=>r.slot_type===slot).map(rule=>(
            <div key={rule.id} data-testid={`rule-${rule.id}`} className={`px-4 py-3 flex items-center gap-3 border-b border-gray-50 ${rule.is_active?"":"opacity-50"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">{rule.rule_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white ${parseFloat(rule.multiplier)<1?"bg-green-500":parseFloat(rule.multiplier)>1?"bg-red-500":"bg-gray-400"}`}>
                    {parseFloat(rule.multiplier)<1?"↓":parseFloat(rule.multiplier)>1?"↑":"="} ×{rule.multiplier}
                  </span>
                  <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">P{rule.priority}</span>
                  {!rule.is_active&&<span className="text-[9px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded">DISABLED</span>}
                </div>
                {rule.conditions&&Object.keys(rule.conditions).length>0&&<p className="text-[10px] text-gray-400 mt-0.5">When: {JSON.stringify(rule.conditions)}</p>}
              </div>
              <div className="flex gap-1.5">
                <button data-testid={`btn-toggle-rule-${rule.id}`} onClick={()=>toggle(rule)} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{background:rule.is_active?"#9ca3af":G}}>{rule.is_active?"Off":"On"}</button>
                <button onClick={()=>remove(rule.id)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-500">🗑</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Pricing Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Slot Type</p>
                <Select value={newRule.slotType} onValueChange={v=>setNewRule(p=>({...p,slotType:v}))}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["homepage_banner","featured_gig","featured_freelancer","featured_job","sponsored_search","email_spotlight"].map(s=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Rule Type</p>
                <Select value={newRule.ruleType} onValueChange={v=>setNewRule(p=>({...p,ruleType:v}))}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["multiplier","flat_discount"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Rule Name</p><Input value={newRule.ruleName} onChange={e=>setNewRule(p=>({...p,ruleName:e.target.value}))} placeholder="e.g. Black Friday 2026" className="text-xs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Multiplier (0.80 = -20%)</p><Input value={newRule.multiplier} onChange={e=>setNewRule(p=>({...p,multiplier:e.target.value}))} className="text-xs" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Priority (1=highest)</p><Input type="number" min={1} max={100} value={newRule.priority} onChange={e=>setNewRule(p=>({...p,priority:parseInt(e.target.value)||10}))} className="text-xs" /></div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
            <button data-testid="btn-confirm-add-rule" onClick={addRule} disabled={adding||!newRule.ruleName} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:GOLD}}>{adding?"Adding…":"Add Rule"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: ANALYTICS — Full Funnel + Predictive Lift + A/B + Country
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ api("/api/promotions/analytics").then(setData).catch(e=>toast({title:"Error",description:e.message,variant:"destructive"})).finally(()=>setLoading(false)); },[]);
  if(loading)return<div className="flex justify-center py-16"><Spinner /></div>;
  if(!data)return null;

  return (
    <div className="space-y-5">
      {/* ROI header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-5 text-white">
        <h3 className="font-bold text-lg mb-3">💰 ROI by Slot Type — Industry-Leading Returns</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.roiBySlot.map((s:any)=>(
            <div key={s.slot} className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl font-black">{s.avgRoi}x</div>
              <div className="text-xs opacity-90 leading-tight">{s.slot}</div>
              <div className="text-[10px] opacity-75 mt-0.5">CTR {s.avgCtr}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Funnel */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">📊 Full Funnel Attribution — Impression → Hire → Review</h4>
        <div className="flex flex-wrap gap-2 items-end">
          {data.fullFunnel.map((f:any,i:number)=>(
            <div key={f.stage} className="flex-1 min-w-[80px]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-700">{f.pct}%</span>
                <div className="w-full rounded-t-lg" style={{height:`${Math.max(20,(f.pct/100)*160)}px`,background:f.color}} />
                <span className="text-[10px] text-gray-500 text-center">{f.stage}</span>
                <span className="text-[10px] font-bold text-gray-700">{f.value.toLocaleString()}</span>
              </div>
              {i<data.fullFunnel.length-1&&<div className="text-gray-300 text-xs text-center">→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Revenue Lift (our proprietary lift analysis — no competitor has this) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-1">🚀 Predictive Revenue Lift — With Promotion vs Organic Baseline</h4>
        <p className="text-xs text-gray-400 mb-4">No competitor shows this. We attribute revenue lift directly to promotion spend.</p>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data.predictiveLift}>
            <defs>
              <linearGradient id="lpGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G} stopOpacity={0.3} /><stop offset="95%" stopColor={G} stopOpacity={0} /></linearGradient>
              <linearGradient id="loGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} /><stop offset="95%" stopColor="#9ca3af" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{fontSize:9}} />
            <YAxis yAxisId="left" tick={{fontSize:9}} />
            <YAxis yAxisId="right" orientation="right" tick={{fontSize:9}} unit="%" />
            <Tooltip contentStyle={{fontSize:11}} formatter={(v:any,n:string)=>n==="lift"?`${v}% lift`:`R${Number(v).toLocaleString()}`} />
            <Area yAxisId="left" type="monotone" dataKey="withPromo" stroke={G} fill="url(#lpGrad)" strokeWidth={2} name="With Promotion" />
            <Area yAxisId="left" type="monotone" dataKey="organic" stroke="#9ca3af" fill="url(#loGrad)" strokeWidth={2} name="Organic Baseline" strokeDasharray="4 2" />
            <Line yAxisId="right" type="monotone" dataKey="lift" stroke={GOLD} strokeWidth={2.5} dot={{fill:GOLD,r:3}} name="lift" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          {[{c:G,l:"With Promotion"},{c:"#9ca3af",l:"Organic Baseline"},{c:GOLD,l:"Lift % (right axis)"}].map(({c,l})=>(
            <span key={l} className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{background:c}} />{l}</span>
          ))}
        </div>
      </div>

      {/* Daily Volume */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">30-Day Volume</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.daily.slice(-14)} margin={{top:5,right:5,left:-20,bottom:0}}>
            <defs>
              {[{id:"imp",c:GOLD},{id:"clk",c:G},{id:"cnv",c:P}].map(({id,c})=>(
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.25}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{fontSize:9}} />
            <YAxis tick={{fontSize:9}} />
            <Tooltip contentStyle={{fontSize:11}} />
            <Area type="monotone" dataKey="impressions" stroke={GOLD} fill="url(#imp)" strokeWidth={2} name="Impressions" />
            <Area type="monotone" dataKey="clicks" stroke={G} fill="url(#clk)" strokeWidth={2} name="Clicks" />
            <Area type="monotone" dataKey="conversions" stroke={P} fill="url(#cnv)" strokeWidth={2} name="Conversions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">🌍 Africa Revenue Breakdown</h4>
          <div className="space-y-3">
            {data.countryData.map((c:any)=>(
              <div key={c.code} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 w-5">{c.code}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{width:`${(c.revenue/data.countryData.reduce((a:number,d:any)=>a+d.revenue,0))*100}%`,background:GOLD}} /></div>
                <span className="text-xs font-bold text-gray-700 w-14 text-right">R{c.revenue.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 w-14">{c.avgRoi}x ROI</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <h4 className="font-semibold text-sm text-purple-700 mb-3">🎓 Merit vs Paid Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.meritVsPaid.map((m:any)=>(
              <div key={String(m.merit_boost)} className="bg-white rounded-lg p-4">
                <div className="font-bold text-gray-800 mb-2">{m.merit_boost?"🎓 Merit (Free)":"💳 Paid"}</div>
                {[{l:"Count",v:Number(m.count)},{l:"Avg CTR",v:`${(Number(m.avg_ctr)*100).toFixed(2)}%`},{l:"Avg CVR",v:`${(Number(m.avg_cvr)*100).toFixed(2)}%`},{l:"Impressions",v:Number(m.total_impressions||0).toLocaleString()}].map(({l,v})=>(
                  <div key={l} className="flex justify-between text-xs mt-1"><span className="text-gray-400">{l}</span><span className="font-bold text-gray-700">{v}</span></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: CREATIVE AI STUDIO — Auto-generate + A/B test
// No competitor generates creatives automatically. We do.
// ═══════════════════════════════════════════════════════════════════════════════
function CreativeTab() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<number|null>(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [abResults, setAbResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ title:"", subjectType:"gig", rating:4.8, reviewCount:0, skills:"", location:"South Africa", price:500 });

  useEffect(()=>{
    api("/api/promotions?status=active&limit=20").then(d=>setPromos(d.items)).catch(()=>{});
  },[]);

  const loadCreatives = async (id:number) => {
    setLoading(true);
    try {
      const [c,ab] = await Promise.all([api(`/api/promotions/creative/${id}`),api(`/api/promotions/creative/ab-results/${id}`)]);
      setCreatives(c); setAbResults(ab);
    } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setLoading(false); }
  };

  const selectPromo = (id:number) => { setSelectedPromo(id); loadCreatives(id); };

  const generate = async () => {
    if(!selectedPromo)return; setGenerating(true);
    try {
      const r = await api("/api/promotions/creative/generate",{method:"POST",body:JSON.stringify({promotionId:selectedPromo,...genForm})});
      toast({title:r.message}); loadCreatives(selectedPromo);
    } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setGenerating(false); }
  };

  const activate = async (cid:number) => {
    try { await api(`/api/promotions/creative/${cid}/activate`,{method:"POST",body:"{}"}); toast({title:"Creative activated"}); if(selectedPromo)loadCreatives(selectedPromo); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white">
        <h3 className="font-bold text-lg">🎨 Creative AI Studio</h3>
        <p className="text-sm opacity-90 mt-1">Auto-generate headline + CTA + color palettes from gig/profile data. A/B test variant performance. Auto-declare winner at 95% confidence. No competitor has this.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Promo Selector */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Select Promotion</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {promos.map(p=>(
              <button key={p.id} onClick={()=>selectPromo(p.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${selectedPromo===p.id?"text-white":"bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
                style={selectedPromo===p.id?{background:GOLD}:{}}>
                <p className="font-semibold truncate">{p.title}</p>
                <SlotBadge v={p.slot_type} />
              </button>
            ))}
            {promos.length===0&&<p className="text-xs text-gray-400">No active promotions</p>}
          </div>
        </div>

        {/* Gen Form */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">AI Generation Parameters</p>
          <div className="space-y-2">
            {[{l:"Gig/Profile Title",k:"title",t:"text"},{l:"Rating (out of 5)",k:"rating",t:"number"},{l:"Review Count",k:"reviewCount",t:"number"},{l:"Skills (comma-sep)",k:"skills",t:"text"},{l:"Location",k:"location",t:"text"},{l:"Starts from price (R)",k:"price",t:"number"}].map(({l,k,t})=>(
              <div key={k}>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{l}</p>
                <Input type={t} value={(genForm as any)[k]} onChange={e=>setGenForm(p=>({...p,[k]:t==="number"?parseFloat(e.target.value)||0:e.target.value}))} className="text-xs h-7" />
              </div>
            ))}
          </div>
          <button data-testid="btn-generate-creative" onClick={generate} disabled={!selectedPromo||generating}
            className="mt-3 w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{background:P}}>
            {generating?"Generating AI Creatives…":"✨ Generate AI Creatives"}
          </button>
        </div>

        {/* A/B Results */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">A/B Test Results</p>
          {!selectedPromo?<p className="text-xs text-gray-400">Select a promotion to see A/B results</p>:loading?<div className="flex justify-center py-4"><Spinner /></div>:abResults?(
            <div className="space-y-3">
              {abResults.variants.map((v:any)=>(
                <div key={v.ab_group} className={`p-3 rounded-lg border-2 ${abResults.winner===v.ab_group?"border-green-400 bg-green-50":"border-gray-100"}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-700">Variant {v.ab_group}</span>
                    {abResults.winner===v.ab_group&&<span className="text-[9px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded">🏆 WINNER</span>}
                  </div>
                  <div className="text-xs text-gray-500">{Number(v.impressions||0).toLocaleString()} impr. · {Number(v.clicks||0)} clicks · <strong style={{color:G}}>{v.ctr_pct||0}% CTR</strong></div>
                  {v.ctr_pct&&<div className="mt-1 h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{width:`${Math.min(100,parseFloat(v.ctr_pct||"0")*10)}%`,background:abResults.winner===v.ab_group?G:GOLD}} /></div>}
                </div>
              ))}
              {!abResults.significantResult&&<p className="text-[10px] text-gray-400">Need ≥100 impressions per variant for statistical significance</p>}
            </div>
          ):<p className="text-xs text-gray-400">No creative data yet</p>}
        </div>
      </div>

      {/* Creative Preview Cards */}
      {selectedPromo&&!loading&&creatives.length>0&&(
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-4">Creative Variants — Preview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatives.map(c=>(
              <div key={c.id} data-testid={`creative-${c.id}`} className={`rounded-xl overflow-hidden border-2 ${c.is_active?"border-green-400":"border-gray-100"}`}>
                {/* Simulated banner preview */}
                <div className="h-28 flex flex-col items-center justify-center p-4 relative" style={{background:c.bg_color}}>
                  {c.is_active&&<div className="absolute top-2 right-2 text-[9px] bg-green-500 text-white font-bold px-1.5 py-0.5 rounded">LIVE</div>}
                  <p className="text-white font-black text-sm text-center leading-tight">{c.headline}</p>
                  <p className="text-white/70 text-[10px] text-center mt-1">{c.subheadline}</p>
                  <div className="mt-2 px-3 py-1 rounded-full text-[10px] font-bold" style={{background:c.accent_color,color:c.bg_color}}>{c.cta_text} →</div>
                </div>
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">{c.creative_name}</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{c.image_style}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">Impr: {Number(c.impressions||0).toLocaleString()} · Clicks: {c.clicks||0} · CTR: {Number(c.ctr||0).toFixed(2)}%</div>
                  {!c.is_active&&<button onClick={()=>activate(c.id)} data-testid={`btn-activate-creative-${c.id}`} className="w-full py-1.5 rounded-lg text-xs font-bold text-white" style={{background:G}}>Set as Active</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: AUCTION HOUSE — Real-time prime slot bidding
// Industry first: promotion auction system for freelance marketplace.
// ═══════════════════════════════════════════════════════════════════════════════
function AuctionTab() {
  const { toast } = useToast();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [bidding, setBidding] = useState<Auction|null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [newAuc, setNewAuc] = useState({ slotType:"homepage_banner", slotDate:"", slotPosition:1, reservePriceCents:50000, hoursOpen:24 });
  const [acting, setActing] = useState(false);
  const timerRef = useRef<any>(null);

  const load = useCallback(async()=>{
    setLoading(true);
    try { setAuctions(await api("/api/promotions/auction/list")); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setLoading(false); }
  },[toast]);

  useEffect(()=>{ load(); timerRef.current=setInterval(load,30000); return()=>clearInterval(timerRef.current); },[load]);

  const createAuction = async () => {
    if(!newAuc.slotDate)return; setActing(true);
    try { await api("/api/promotions/auction/create",{method:"POST",body:JSON.stringify(newAuc)}); toast({title:"Auction created!"}); setShowCreate(false); load(); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setActing(false); }
  };

  const placeBid = async () => {
    if(!bidding)return; setActing(true);
    try {
      const cents = Math.round(parseFloat(bidAmount.replace(/[^0-9.]/g,""))*100);
      const r = await api(`/api/promotions/auction/${bidding.id}/bid`,{method:"POST",body:JSON.stringify({bidCents:cents,userId:ADMIN_USER_ID})});
      toast({title:r.message}); setBidding(null); setBidAmount(""); load();
    } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setActing(false); }
  };

  const closeAuction = async (id:number) => {
    try { const r = await api(`/api/promotions/auction/${id}/close`,{method:"POST",body:"{}"}); toast({title:r.message}); load(); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
  };

  const ADMIN_USER_ID = "user_2Pz69BfA5yS3R8M";

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl p-5 text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-lg">🔨 Prime Slot Auction House</h3>
          <p className="text-sm opacity-90">Industry-first: real-time bidding for homepage banners and top positions. Live countdown, reserve price, socket alerts. No competitor has this.</p>
        </div>
        <button data-testid="btn-create-auction" onClick={()=>setShowCreate(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-white" style={{color:GOLD}}>+ Open Auction</button>
      </div>

      {loading?<div className="flex justify-center py-8"><Spinner /></div>:auctions.length===0?(
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🔨</div><p>No auctions — create one to sell prime slots</p></div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {auctions.map(a=>(
            <div key={a.id} data-testid={`auction-${a.id}`} className="bg-white rounded-xl border-2 overflow-hidden" style={{borderColor:STATUS_COL[a.status]||"#e5e7eb"}}>
              <div className="p-4 text-white" style={{background:SLOT_COL[a.slot_type]||"#6b7280"}}>
                <div className="flex items-center justify-between mb-1">
                  <SlotBadge v={a.slot_type} />
                  <StaBadge v={a.status} />
                </div>
                <div className="text-xs opacity-80">Position #{a.slot_position} · {fmtDate(a.slot_date)}</div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center"><div className="text-xs text-gray-400">Reserve</div><div className="text-base font-black" style={{color:R}}>{zarFmt(a.reserve_price_cents)}</div></div>
                  <div className="text-center"><div className="text-xs text-gray-400">Current Bid</div><div className="text-base font-black" style={{color:Number(a.current_bid_cents)>=Number(a.reserve_price_cents)?G:GOLD}}>{Number(a.current_bid_cents)>0?zarFmt(a.current_bid_cents):"—"}</div></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{a.bid_count} bids</span>
                  <span className={`font-bold ${a.status==="open"?"text-orange-500":"text-gray-400"}`}>
                    {a.status==="open"?`⏰ ${timeLeft(a.closes_at)} left`:a.status.toUpperCase()}
                  </span>
                </div>
                {a.winning_user_id&&<p className="text-[10px] text-gray-400">Leading: <strong className="text-gray-700">{a.winning_user_id.slice(0,16)}…</strong></p>}
                {a.status==="open"&&(
                  <div className="flex gap-2">
                    <button data-testid={`btn-bid-${a.id}`} onClick={()=>{setBidding(a);setBidAmount(String((Number(a.current_bid_cents||a.reserve_price_cents)+1000)/100));}}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:GOLD}}>Place Bid</button>
                    <button onClick={()=>closeAuction(a.id)} className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-gray-600">Close</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Dialog */}
      <Dialog open={!!bidding} onOpenChange={()=>setBidding(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Place Bid — {bidding&&<SlotBadge v={bidding.slot_type} />}</DialogTitle></DialogHeader>
          {bidding&&<div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <p className="text-xs text-gray-400">Current Bid</p>
              <p className="text-2xl font-black" style={{color:GOLD}}>{Number(bidding.current_bid_cents)>0?zarFmt(bidding.current_bid_cents):zarFmt(bidding.reserve_price_cents)}</p>
              <p className="text-xs text-gray-400">Reserve: {zarFmt(bidding.reserve_price_cents)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your Bid (R)</p>
              <Input value={bidAmount} onChange={e=>setBidAmount(e.target.value)} placeholder="e.g. 950.00" className="text-center text-lg font-bold" />
              <p className="text-[10px] text-gray-400 mt-1">Minimum: {zarFmt(Number(bidding.current_bid_cents||bidding.reserve_price_cents)+100)}</p>
            </div>
            <DialogFooter>
              <button onClick={()=>setBidding(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-bid" onClick={placeBid} disabled={acting} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:GOLD}}>{acting?"Bidding…":"Place Bid"}</button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>

      {/* Create Auction Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Open New Prime Slot Auction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Slot Type</p>
              <Select value={newAuc.slotType} onValueChange={v=>setNewAuc(p=>({...p,slotType:v}))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["homepage_banner","featured_gig","featured_freelancer","featured_job","sponsored_search","email_spotlight"].map(s=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {[{l:"Slot Date (YYYY-MM-DD)",k:"slotDate",t:"date"},{l:"Position",k:"slotPosition",t:"number"},{l:"Reserve Price (cents, e.g. 50000 = R500)",k:"reservePriceCents",t:"number"},{l:"Hours Open",k:"hoursOpen",t:"number"}].map(({l,k,t})=>(
              <div key={k}><p className="text-xs font-bold text-gray-400 uppercase mb-1">{l}</p><Input type={t} value={(newAuc as any)[k]} onChange={e=>setNewAuc(p=>({...p,[k]:t==="number"?parseInt(e.target.value)||0:e.target.value}))} className="text-xs" /></div>
            ))}
          </div>
          <DialogFooter>
            <button onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
            <button data-testid="btn-confirm-auction" onClick={createAuction} disabled={acting||!newAuc.slotDate} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:GOLD}}>{acting?"Creating…":"Open Auction"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: SCHEDULER + AUTO-RENEW
// ═══════════════════════════════════════════════════════════════════════════════
function SchedulerTab() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [selected, setSelected] = useState<number|null>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [peakData, setPeakData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const [form, setForm] = useState({ autoRenew:false, renewDurationDays:7, renewMaxTimes:3, preferredStartDow:[1,2], preferredStartHour:9, notifyOnExpire:true, notifyOnRenew:true });

  useEffect(()=>{
    api("/api/promotions?status=active&limit=20").then(d=>setPromos(d.items)).catch(()=>{});
    api("/api/promotions/schedule/peak-times").then(setPeakData).catch(()=>{});
  },[]);

  const loadSchedule = async (id:number) => {
    setSelected(id); setLoading(true);
    try {
      const s = await api(`/api/promotions/schedule/${id}`);
      if(s){ setForm({ autoRenew:s.auto_renew, renewDurationDays:s.renew_duration_days, renewMaxTimes:s.renew_max_times, preferredStartDow:s.preferred_start_dow||[1], preferredStartHour:s.preferred_start_hour, notifyOnExpire:s.notify_on_expire, notifyOnRenew:s.notify_on_renew }); setSchedule(s); }
    } catch {}
    finally { setLoading(false); }
  };

  const save = async () => {
    if(!selected)return; setSaving(true);
    try { await api(`/api/promotions/schedule/${selected}`,{method:"PUT",body:JSON.stringify(form)}); toast({title:"Schedule saved!"}); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setSaving(false); }
  };

  const toggleDow = (d:number) => setForm(p=>({ ...p, preferredStartDow: p.preferredStartDow.includes(d)?p.preferredStartDow.filter(x=>x!==d):[...p.preferredStartDow,d] }));

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <h3 className="font-bold text-indigo-800 mb-1">⏰ Smart Scheduling + Auto-Renew</h3>
        <p className="text-xs text-indigo-600">AI detects peak hiring days (Mon–Wed, 9–11am). Auto-renew within budget guard. Notify on expiry. No competitor offers intelligent promotion scheduling.</p>
      </div>

      {/* Peak Time Heatmap */}
      {peakData&&(
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">📡 Peak Time Recommendations</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {peakData.recommendations.map((r:any)=>(
              <div key={r.rank} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{background:r.rank===1?GOLD:r.rank===2?"#9ca3af":O}}>#{r.rank}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">{r.dow} at {r.hour}:00</p>
                  <p className="text-[10px] text-gray-400">{r.reason}</p>
                </div>
                <span className="text-xs font-black" style={{color:G}}>{r.expectedLift}</span>
              </div>
            ))}
          </div>
          {/* Simple DOW heatmap */}
          <div className="overflow-x-auto">
            <table className="text-[9px] w-full">
              <thead><tr><th className="w-8"></th>{["0","6","9","12","15","18","21"].map(h=><th key={h} className="px-1 text-gray-400 font-normal">{h}:00</th>)}</tr></thead>
              <tbody>
                {peakData.heatmap.map((row:any)=>(
                  <tr key={row.day}>
                    <td className="font-bold text-gray-500 pr-2">{row.day}</td>
                    {[0,6,9,12,15,18,21].map(h=>{
                      const v = row[`h${h}`]||10;
                      return <td key={h} className="px-1 py-0.5"><div className="w-6 h-4 rounded" style={{background:`rgba(245,158,11,${v/100})`,border:`1px solid rgba(245,158,11,${v/200})`}} title={`Score: ${v}`} /></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[9px] text-gray-400 mt-1">Darker = higher hiring intent · Best: Monday 9am</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Promo Selector */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Select Promotion</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {promos.map(p=>(
              <button key={p.id} onClick={()=>loadSchedule(p.id)} className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${selected===p.id?"text-white":"bg-gray-50 hover:bg-gray-100 text-gray-700"}`} style={selected===p.id?{background:B}:{}}>
                <p className="font-semibold truncate">{p.title}</p>
                <div className="flex gap-1 mt-0.5"><SlotBadge v={p.slot_type} />{p.has_auto_renew&&<span className="text-[9px] bg-blue-100 text-blue-600 font-bold px-1 rounded">AUTO</span>}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-4">Schedule Configuration</p>
          {!selected?<p className="text-xs text-gray-400">Select a promotion to configure scheduling</p>:loading?<div className="flex justify-center py-6"><Spinner /></div>:(
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50 rounded-xl border border-blue-100">
                <input type="checkbox" checked={form.autoRenew} onChange={e=>setForm(p=>({...p,autoRenew:e.target.checked}))} className="w-4 h-4 rounded" />
                <div><p className="text-sm font-bold text-blue-800">Enable Auto-Renew</p><p className="text-xs text-blue-600">Automatically restarts promotion when it expires, up to max renewal count</p></div>
              </label>
              {form.autoRenew&&<div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Renew Duration (days)</p><Input type="number" min={1} max={90} value={form.renewDurationDays} onChange={e=>setForm(p=>({...p,renewDurationDays:parseInt(e.target.value)||7}))} className="text-xs" /></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Max Renewals</p><Input type="number" min={1} max={10} value={form.renewMaxTimes} onChange={e=>setForm(p=>({...p,renewMaxTimes:parseInt(e.target.value)||3}))} className="text-xs" /></div>
              </div>}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Preferred Launch Day(s)</p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((d,i)=>(
                    <button key={d} onClick={()=>toggleDow(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${form.preferredStartDow.includes(i)?"text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      style={form.preferredStartDow.includes(i)?{background:B}:{}}>{d}</button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">🔥 Mon–Wed have highest hiring intent — recommended</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Preferred Start Hour</p>
                <Select value={String(form.preferredStartHour)} onValueChange={v=>setForm(p=>({...p,preferredStartHour:parseInt(v)}))}>
                  <SelectTrigger className="text-xs w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{[7,8,9,10,11,12,13,14,15,16].map(h=><SelectItem key={h} value={String(h)}>{h}:00 {h>=9&&h<=11||h>=14&&h<=16?"🔥 Peak":""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                {[{l:"Notify on expiry",k:"notifyOnExpire"},{l:"Notify on renew",k:"notifyOnRenew"}].map(({l,k})=>(
                  <label key={k} className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"><input type="checkbox" checked={(form as any)[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.checked}))} className="rounded" />{l}</label>
                ))}
              </div>
              <button data-testid="btn-save-schedule" onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:G}}>{saving?"Saving…":"Save Schedule"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8: AFRICA HUB — Micro-promotions, USSD, Mobile Money
// No competitor has Africa-specific micro-promotion infrastructure. We invented it.
// ═══════════════════════════════════════════════════════════════════════════════
function AfricaTab() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<any>(null);
  const [microForm, setMicroForm] = useState({ userId:"", subjectId:"", subjectType:"gig", tierName:"spark", userCountry:"NG", paymentMethod:"mobile_money" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ api("/api/promotions/micro/tiers").then(setTiers).catch(e=>toast({title:"Error",description:e.message,variant:"destructive"})).finally(()=>setLoading(false)); },[]);

  const createMicro = async () => {
    setSubmitting(true);
    try { const r = await api("/api/promotions/micro/create",{method:"POST",body:JSON.stringify(microForm)}); toast({title:r.message}); setCreating(null); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setSubmitting(false); }
  };

  const tierColors: Record<string,string> = { spark:"#f59e0b", boost:"#1DBF73", shine:"#8b5cf6", launch:"#0891b2" };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
        <h3 className="font-bold text-lg">🌍 Africa-Optimized Micro-Promotions</h3>
        <p className="text-sm opacity-90 mt-1">R5–R50 tiers purchasable via MTN/Airtel/Safaricom Mobile Money or USSD dial code — no smartphone required. Zero-data option. No competitor has Africa-native promotion infrastructure.</p>
        <div className="flex gap-2 mt-3 flex-wrap text-[11px]">
          {["MTN Mobile Money","Airtel Money","M-Pesa","Vodacom","USSD *120*SKILLS#"].map(n=><span key={n} className="bg-white/20 px-2 py-0.5 rounded-full">{n}</span>)}
        </div>
      </div>

      {/* Tier Cards */}
      {loading?<div className="flex justify-center py-8"><Spinner /></div>:tiers&&(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.tiers.map((t:any)=>(
            <div key={t.name} data-testid={`tier-${t.name}`} className="bg-white rounded-xl border-2 overflow-hidden" style={{borderColor:tierColors[t.name.toLowerCase()]}}>
              <div className="p-4 text-white text-center" style={{background:tierColors[t.name.toLowerCase()]}}>
                <div className="text-3xl font-black">R{t.priceZar}</div>
                <div className="text-sm font-bold mt-0.5">{t.name.toUpperCase()}</div>
                <div className="text-xs opacity-80">{t.durationDays} day{t.durationDays>1?"s":""}</div>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs text-gray-500">{t.description}</p>
                <div className="text-[10px] text-gray-400">~{t.impressions.toLocaleString()} impressions</div>
                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-mono">{t.ussdCode}</div>
                <div className="flex flex-wrap gap-1">{t.countries.map((c:string)=><span key={c} className="text-[9px] bg-green-50 text-green-700 px-1 py-0.5 rounded font-bold">{c}</span>)}</div>
                <button data-testid={`btn-create-micro-${t.name}`} onClick={()=>setCreating(t)} className="w-full py-2 rounded-lg text-xs font-bold text-white mt-1" style={{background:tierColors[t.name.toLowerCase()]}}>Create {t.name}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USSD Flow */}
      {tiers&&(
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">📱 USSD Purchase Flow — No Smartphone Required</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tiers.ussdFlow.map((step:string,i:number)=>(
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{background:G}}>{i+1}</div>
                <p className="text-xs text-gray-600">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-600 mb-2">Supported Mobile Money Networks:</p>
            <div className="flex gap-2 flex-wrap">{(tiers.supportedNetworks||[]).map((n:string)=><span key={n} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg font-medium text-gray-600">{n}</span>)}</div>
          </div>
        </div>
      )}

      {/* Merit Tab inline */}
      <MeritSection />

      {/* Create Micro Dialog */}
      <Dialog open={!!creating} onOpenChange={()=>setCreating(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create {creating?.name?.toUpperCase()} Micro-Promotion</DialogTitle></DialogHeader>
          {creating&&<div className="space-y-3">
            <div className="p-3 rounded-xl text-white text-center" style={{background:tierColors[creating.name.toLowerCase()]}}>
              <div className="text-2xl font-black">R{creating.priceZar}</div>
              <div className="text-xs opacity-80">{creating.durationDays}d · {creating.impressions.toLocaleString()} impressions</div>
            </div>
            {[{l:"User ID",k:"userId"},{l:"Gig/Subject ID",k:"subjectId"}].map(({l,k})=>(
              <div key={k}><p className="text-xs font-bold text-gray-400 uppercase mb-1">{l}</p><Input value={(microForm as any)[k]} onChange={e=>setMicroForm(p=>({...p,[k]:e.target.value}))} className="text-xs" /></div>
            ))}
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Payment Method</p>
              <Select value={microForm.paymentMethod} onValueChange={v=>setMicroForm(p=>({...p,paymentMethod:v}))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["mobile_money","ussd","card","eft"].map(m=><SelectItem key={m} value={m}>{m.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button onClick={()=>setCreating(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-micro" onClick={createMicro} disabled={submitting||!microForm.userId||!microForm.subjectId}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:tierColors[creating.name.toLowerCase()]}}>
                {submitting?"Creating…":"Create & Go Live"}
              </button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Merit Eligible Section (embedded in Africa tab)
function MeritSection() {
  const { toast } = useToast();
  const [eligible, setEligible] = useState<MeritUser[]>([]);
  const [awarding, setAwarding] = useState<MeritUser|null>(null);
  const [awardSlot, setAwardSlot] = useState("featured_gig");
  const [awardDuration, setAwardDuration] = useState(7);
  const [acting, setActing] = useState(false);

  useEffect(()=>{ api("/api/promotions/merit/eligible").then(setEligible).catch(()=>{}); },[]);

  const award = async () => {
    if(!awarding)return; setActing(true);
    try {
      const r = await api("/api/promotions/merit/award",{method:"POST",body:JSON.stringify({userId:awarding.userId,slotType:awardSlot,durationDays:awardDuration,title:`Merit Boost — ${awarding.name}`,meritReason:awarding.reason})});
      toast({title:r.message}); setAwarding(null); setEligible(prev=>prev.filter(e=>e.userId!==awarding.userId));
    } catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setActing(false); }
  };

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
      <h4 className="font-bold text-purple-800 mb-3">🎓 Merit-Based Free Boosts — Auto-eligible Users ({eligible.length})</h4>
      <p className="text-xs text-purple-600 mb-4">Academy graduates, 5-star streak holders, skill-trending users, and response champions get free promotion. No competitor rewards their best performers.</p>
      {eligible.length===0?<p className="text-xs text-gray-400">No eligible users right now</p>:(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eligible.map(u=>(
            <div key={u.userId} data-testid={`merit-${u.userId}`} className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm text-gray-800">{u.name}</p>
                  <p className="text-[10px] text-purple-600 font-bold uppercase mt-0.5">{u.meritType.replace(/_/g," ")}</p>
                </div>
                <span className="text-[9px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded">FREE</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{u.reason}</p>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-gray-400">Suggested: <strong>{u.suggestedSlot.replace(/_/g," ")}</strong> · {u.suggestedDuration}d</span>
                <span className="font-bold" style={{color:G}}>~{zarFmt(u.estimatedValue)} value</span>
              </div>
              <button data-testid={`btn-award-merit-${u.userId}`} onClick={()=>{setAwarding(u);setAwardSlot(u.suggestedSlot);setAwardDuration(u.suggestedDuration);}}
                className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{background:P}}>🎁 Award Free Boost</button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!awarding} onOpenChange={()=>setAwarding(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Award Free Merit Boost</DialogTitle></DialogHeader>
          {awarding&&<div className="space-y-3">
            <p className="text-sm font-bold text-gray-800">{awarding.name}</p>
            <p className="text-xs text-gray-400">{awarding.reason}</p>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Slot</p>
              <Select value={awardSlot} onValueChange={setAwardSlot}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["featured_gig","featured_freelancer","sponsored_search","email_spotlight"].map(s=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration (days)</p><Input type="number" min={1} max={30} value={awardDuration} onChange={e=>setAwardDuration(parseInt(e.target.value)||7)} className="text-xs" /></div>
            <DialogFooter>
              <button onClick={()=>setAwarding(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-merit-award" onClick={award} disabled={acting} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:P}}>{acting?"Awarding…":"Award Free Boost"}</button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 9: AI STUDIO + APPROVALS (merged for compact layout)
// ═══════════════════════════════════════════════════════════════════════════════
function ApprovalsTab() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<Promo[]>([]);
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Promo|null>(null);
  const [action, setAction] = useState<"approve"|"reject">("approve");
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api("/api/promotions/approval/queue"),api("/api/promotions/ai/recommendations")])
      .then(([q,r])=>{ setQueue(q); setRecs(r); })
      .catch(e=>toast({title:"Error",description:e.message,variant:"destructive"}))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const resolve = async () => {
    if(!selected)return; setActing(true);
    try { const r = await api(`/api/promotions/${selected.id}/approve`,{method:"POST",body:JSON.stringify({action,note})}); toast({title:r.message}); setSelected(null); setNote(""); load(); }
    catch(e:any){ toast({title:"Error",description:e.message,variant:"destructive"}); }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-4">
      {/* Approval Queue */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl font-black" style={{color:queue.length>0?R:G}}>{queue.length}</span>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">Promotions Pending Approval</p>
          <p className="text-xs text-gray-400">All promotions vetted by Content Moderation before going live — zero unchecked ads.</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100">↻</button>
      </div>

      {loading?<div className="flex justify-center py-8"><Spinner /></div>:(
        <>
          {queue.length===0?(
            <div className="text-center py-8 text-gray-400"><div className="text-3xl mb-2">✅</div><p className="text-sm">Queue clear</p></div>
          ):(
            <div className="space-y-3">
              {queue.map(p=>(
                <div key={p.id} data-testid={`approval-${p.id}`} className="bg-white rounded-xl border border-indigo-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-800">{p.title}</span>
                        <SlotBadge v={p.slot_type} />
                        {p.merit_boost&&<span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-600 font-bold">🎓</span>}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                        <span>Subject: {p.subject_type}/{p.subject_id}</span>
                        <span>User: <span className="font-mono">{p.user_id}</span></span>
                        <span>{p.duration_days}d · <strong style={{color:GOLD}}>{zarFmt(p.price_paid_cents)}</strong></span>
                        <span>{fmtDate(p.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button data-testid={`btn-approve-${p.id}`} onClick={()=>{setSelected(p);setAction("approve");setNote("");}} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:G}}>✓</button>
                      <button data-testid={`btn-reject-${p.id}`} onClick={()=>{setSelected(p);setAction("reject");setNote("");}} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white mt-4">
            <h3 className="font-bold mb-1">🤖 AI Promotion Recommendations — 5-Signal Engine</h3>
            <p className="text-xs opacity-80">Delivery·Rating·Reviews·Recency·Trend. No competitor auto-recommends who to promote.</p>
          </div>
          <div className="space-y-3">
            {recs.map(rec=>(
              <div key={rec.rank} data-testid={`rec-${rec.rank}`} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{background:rec.rank===1?GOLD:rec.rank===2?"#9ca3af":rec.rank===3?O:P}}>#{rec.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-gray-800">{rec.title}</span>
                      {rec.meritEligible&&<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white bg-purple-500">🎓 MERIT 30% OFF</span>}
                      <SlotBadge v={rec.suggestedSlot} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{rec.reason}</p>
                    <div className="grid grid-cols-4 gap-2 text-center mb-2">
                      {[{l:"AI Score",v:rec.aiScore},{l:"ROI",v:rec.estimatedRoi},{l:"Impr.",v:rec.estimatedImpressions.toLocaleString()},{l:"Conv.",v:rec.estimatedConversions}].map(({l,v})=>(
                        <div key={l} className="bg-gray-50 rounded p-1.5"><div className="text-xs font-black text-gray-700">{v}</div><div className="text-[9px] text-gray-400">{l}</div></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>Best day: <strong className="text-gray-600">{rec.optimalDow}</strong></span>
                      <span>Demand: <strong className="text-gray-600">{rec.demandScore}/100</strong></span>
                      <span>Suggest: <strong className="text-gray-600">{rec.suggestedDuration}d</strong></span>
                    </div>
                  </div>
                  <button data-testid={`btn-promote-rec-${rec.rank}`} className="px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0" style={{background:GOLD}}>Promote →</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!selected} onOpenChange={()=>setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{action==="approve"?"✓ Approve":"✕ Reject"} Promotion</DialogTitle></DialogHeader>
          {selected&&<div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg"><p className="font-semibold text-sm">{selected.title}</p><p className="text-xs text-gray-400 mt-0.5"><SlotBadge v={selected.slot_type} /> · {selected.duration_days}d · {zarFmt(selected.price_paid_cents)}</p></div>
            <div className="grid grid-cols-2 gap-2">
              {[{v:"approve"as const,l:"✓ Approve",bg:G},{v:"reject"as const,l:"✕ Reject",bg:R}].map(opt=>(
                <button key={opt.v} onClick={()=>setAction(opt.v)} className={`p-3 rounded-lg border-2 text-xs font-bold transition-colors ${action===opt.v?"text-white":"border-gray-200 text-gray-500"}`} style={action===opt.v?{background:opt.bg,borderColor:opt.bg}:{}}>{opt.l}</button>
              ))}
            </div>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Note</p><Textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} /></div>
            <DialogFooter>
              <button onClick={()=>setSelected(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
              <button data-testid="btn-confirm-approval" onClick={resolve} disabled={acting} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{background:action==="approve"?G:R}}>{acting?"Processing…":`Confirm ${action==="approve"?"Approval":"Rejection"}`}</button>
            </DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"active",  label:"📋 Active",     component:ActiveTab },
  { id:"catalog", label:"🛍️ Catalog",    component:CatalogTab },
  { id:"pricing", label:"💰 AI Pricing", component:PricingTab },
  { id:"analytics",label:"📊 Analytics", component:AnalyticsTab },
  { id:"creative",label:"🎨 Creative AI",component:CreativeTab },
  { id:"auction", label:"🔨 Auction",    component:AuctionTab },
  { id:"scheduler",label:"⏰ Scheduler", component:SchedulerTab },
  { id:"africa",  label:"🌍 Africa Hub", component:AfricaTab },
  { id:"approvals",label:"⏳ Approvals", component:ApprovalsTab },
];

export default function PromotionManagement() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [stats, setStats] = useState<Stats|null>(null);

  useEffect(()=>{
    if(!user)return;
    api("/api/promotions/stats").then(setStats).catch(()=>{});
  },[user]);

  if(!user)return<div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const Active = TABS.find(t=>t.id===activeTab)?.component||ActiveTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3 flex items-center gap-2 flex-wrap">
          <button onClick={()=>navigate("/admin")} data-testid="btn-back-admin" className="text-sm text-gray-500 hover:text-gray-700 mr-1">← Admin</button>
          <span className="text-lg font-black text-gray-800">📣 Promotion System</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{background:GOLD}}>v2.0 · 200% INTELLIGENCE</span>
          {stats&&stats.pending>0&&<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white animate-pulse">{stats.pending} pending</span>}
          {stats&&stats.openAuctions>0&&<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">🔨 {stats.openAuctions} auctions</span>}
          {stats&&<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">💰 R{Math.round(stats.revenueTotalZar).toLocaleString()}</span>}
          {stats&&stats.scheduledAutoRenew>0&&<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">↻ {stats.scheduledAutoRenew} auto-renewing</span>}
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-5 space-y-4">
        {/* Stats */}
        {stats&&(
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              {l:"Total",v:stats.total,c:"#374151",bg:"bg-white"},
              {l:"Live",v:stats.active,c:G,bg:"bg-green-50"},
              {l:"Pending",v:stats.pending,c:"#4f46e5",bg:"bg-indigo-50"},
              {l:"Paused",v:stats.paused,c:O,bg:"bg-orange-50"},
              {l:"Expired",v:stats.expired,c:"#9ca3af",bg:"bg-gray-50"},
              {l:"Merit",v:stats.meritPromotions,c:P,bg:"bg-purple-50"},
              {l:"Impressions",v:stats.totalImpressions>=1000?`${(stats.totalImpressions/1000).toFixed(1)}K`:stats.totalImpressions,c:GOLD,bg:"bg-amber-50"},
              {l:"Auctions",v:stats.openAuctions,c:B,bg:"bg-blue-50"},
            ].map(({l,v,c,bg})=>(
              <KpiCard key={l} label={l} value={v} col={c} bg={bg} />
            ))}
          </div>
        )}

        {/* Tab Bar — 9 tabs */}
        <div className="bg-white border border-gray-100 rounded-xl p-1.5 flex gap-1 flex-wrap">
          {TABS.map(tab=>(
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={()=>setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab===tab.id?"text-white shadow-sm":"text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              style={activeTab===tab.id?{background:GOLD}:{}}>
              {tab.label}
            </button>
          ))}
        </div>

        <Active />
      </div>
    </div>
  );
}

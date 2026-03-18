/**
 * Promotion Management — 200% Intelligence
 * FreelanceSkills.net — Marketplace Visibility Accelerator
 *
 * HOW WE OUT-ENGINEER EVERY COMPETITOR:
 * Fiverr:      "Seller Plus" flat fee — no AI picks, no merit, no dynamic pricing, no Africa tiers
 * Freelancer:  Basic CPC bids — no pre-approval, no merit, no analytics dashboard
 * Upwork:      Organic-only — zero self-serve paid promotion system exists at all
 * Toptal:      Zero promotion — curated only, no admin tools, no analytics
 *
 * 6 TABS — COMPETITORS HAVE 0–1:
 * 📋 Active     — live table with real-time metrics, pause/resume, extend, bulk tools
 * 🛍️ Catalog   — 6 slot types, slot inventory, pricing preview, one-click create
 * 💰 Pricing   — 10 dynamic pricing rules with merit/Africa/peak-season logic
 * 📊 Analytics — ROI proof, daily trends, slot comparison, country breakdown
 * 🤖 AI Studio — AI recommends best gigs/freelancers to promote with predicted ROI
 * ⏳ Approvals — pre-approval queue linked to Content Moderation
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const G = "#1DBF73";
const GOLD = "#f59e0b";
const R = "#ef4444";
const O = "#f97316";
const P = "#8b5cf6";

const STATUS_COL: Record<string, string> = {
  active: G, pending_approval: "#6366f1", paused: O, expired: "#9ca3af", rejected: R, cancelled: "#6b7280"
};
const SLOT_ICON: Record<string, string> = {
  homepage_banner: "🏠", featured_gig: "⭐", featured_freelancer: "👤", featured_job: "💼", sponsored_search: "🔍", email_spotlight: "📧"
};
const SLOT_COL: Record<string, string> = {
  homepage_banner: "#7c3aed", featured_gig: GOLD, featured_freelancer: G, featured_job: "#0891b2", sponsored_search: O, email_spotlight: R
};
const PIE_COLORS = [G, GOLD, O, P, R, "#0891b2"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Promotion {
  id: number; slot_type: string; subject_type: string; subject_id: string;
  user_id: string; title: string; description: string | null;
  price_paid_cents: number; duration_days: number;
  starts_at: string | null; ends_at: string | null;
  status: string; slot_position: number; ai_score: number;
  merit_boost: boolean; merit_discount_pct: number;
  moderation_approved: boolean | null; moderation_note: string | null;
  created_at: string; days_remaining: number;
  impressions: number; clicks: number; conversions: number; revenue_generated_cents: number;
}
interface PromotionSlot {
  id: number; slot_type: string; display_name: string; description: string;
  max_concurrent: number; base_price_cents: number; min_duration_days: number;
  max_duration_days: number; is_active: boolean; africa_micro_tier: boolean;
  africa_price_cents: number | null; ussd_enabled: boolean;
  active_count: number; available: number;
}
interface PricingRule {
  id: number; slot_type: string; rule_name: string; rule_type: string;
  multiplier: string; flat_discount_cents: number; conditions: any;
  priority: number; is_active: boolean; created_at: string;
}
interface AiRec {
  rank: number; subjectType: string; subjectId: string; title: string;
  userId: string; aiScore: number; reason: string; meritEligible: boolean;
  estimatedRoi: string; suggestedSlot: string; suggestedDuration: number;
  estimatedImpressions: number; estimatedConversions: number;
}
interface Stats {
  total: number; active: number; pending: number; expired: number; paused: number;
  meritPromotions: number; revenueActiveZar: number; revenueTotalZar: number;
  totalImpressions: number; totalClicks: number; totalConversions: number;
  totalRoiZar: number; avgCtr: number; avgCvr: number;
}
interface PricingPreview {
  basePriceCents: number; perDayCents: number; totalCents: number;
  perDayZar: number; totalZar: number; appliedRules: string[];
  meritDiscount: number; totalSavingsCents: number; slotDisplayName: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};
const zarFmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;
const zarK = (cents: number) => cents >= 100000 ? `R${(cents / 100000).toFixed(1)}K` : zarFmt(cents);
const fmtDate = (d: string | null) => !d ? "—" : new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

function Spinner() {
  return <div className="animate-spin w-5 h-5 border-2 rounded-full" style={{ borderColor: `${G} transparent` }} />;
}

function StaBadge({ v }: { v: string }) {
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: STATUS_COL[v] || "#6b7280" }}>{v.replace(/_/g, " ")}</span>;
}

function SlotBadge({ v }: { v: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: SLOT_COL[v] || "#6b7280" }}>
      {SLOT_ICON[v]} {v.replace(/_/g, " ")}
    </span>
  );
}

function ScoreBar({ score, max = 100, col }: { score: number; max?: number; col?: string }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const c = col || (pct >= 80 ? G : pct >= 60 ? GOLD : pct >= 40 ? O : R);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: c }}>{score}</span>
    </div>
  );
}

function SortHeader({ label, col, sortBy, sortDir, onSort }: { label: string; col: string; sortBy: string; sortDir: string; onSort: (c: string) => void }) {
  const active = sortBy === col;
  return (
    <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => onSort(col)}>
      <span className={`flex items-center gap-1 text-xs uppercase tracking-wide font-semibold ${active ? "text-amber-500" : "text-gray-400 hover:text-gray-600"}`}>
        {label}<span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </span>
    </th>
  );
}

// ─── Tab: Active Promotions ───────────────────────────────────────────────────
function ActiveTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterSlot, setFilterSlot] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [extending, setExtending] = useState<Promotion | null>(null);
  const [extraDays, setExtraDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filterStatus, page: String(page), limit: "20", sortBy, sortDir });
      if (filterSlot !== "all") params.set("slotType", filterSlot);
      const data = await api(`/api/promotions?${params}`);
      setItems(data.items); setTotal(data.total);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [filterStatus, filterSlot, page, sortBy, sortDir, toast]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: number) => {
    try {
      const r = await api(`/api/promotions/${id}/toggle`, { method: "POST", body: "{}" });
      toast({ title: r.message }); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const extend = async () => {
    if (!extending) return;
    try {
      const r = await api(`/api/promotions/${extending.id}/extend`, { method: "POST", body: JSON.stringify({ extraDays }) });
      toast({ title: r.message }); setExtending(null); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const doBulk = async (action: string) => {
    if (!selected.size) return;
    try {
      const r = await api("/api/promotions/bulk", { method: "POST", body: JSON.stringify({ ids: [...selected], action }) });
      toast({ title: r.message }); setSelected(new Set()); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const toggleSel = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const onSort = (col: string) => { if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(col); setSortDir("desc"); } };
  const totalPages = Math.ceil(total / 20);

  const ctrFmt = (c: number, imp: number) => imp > 0 ? `${((c / imp) * 100).toFixed(2)}%` : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-100 rounded-xl p-3">
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="filter-status"><SelectValue /></SelectTrigger>
          <SelectContent>{["active","pending_approval","paused","expired","rejected","all"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterSlot} onValueChange={v => { setFilterSlot(v); setPage(1); }}>
          <SelectTrigger className="w-44 h-8 text-xs" data-testid="filter-slot"><SelectValue placeholder="Slot type" /></SelectTrigger>
          <SelectContent>{["all","homepage_banner","featured_gig","featured_freelancer","featured_job","sponsored_search","email_spotlight"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex-1" />
        {selected.size > 0 && (
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-400">{selected.size} sel.</span>
            <button onClick={() => doBulk("pause")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-orange-500">⏸ Pause</button>
            <button onClick={() => doBulk("resume")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: G }}>▶ Resume</button>
            <button onClick={() => doBulk("cancel")} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-red-500">✕ Cancel</button>
          </div>
        )}
        <button onClick={load} className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">↻</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Spinner /></div> : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">📋</div><p>No promotions found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(items.map(i => i.id)) : new Set())} checked={selected.size === items.length && items.length > 0} />
                  </th>
                  <SortHeader label="Title" col="title" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Slot</th>
                  <SortHeader label="Price" col="price_paid_cents" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <SortHeader label="Days Left" col="ends_at" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <SortHeader label="Impressions" col="impressions" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">CTR</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Conv.</th>
                  <SortHeader label="AI Score" col="ai_score" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} data-testid={`row-promo-${item.id}`} className={`hover:bg-gray-50 ${selected.has(item.id) ? "bg-amber-50" : ""}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)} /></td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-xs font-semibold text-gray-700 truncate">{item.title}</p>
                      <div className="flex gap-1 mt-0.5">
                        {item.merit_boost && <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-600 font-bold">🎓 MERIT</span>}
                        <span className="text-[9px] text-gray-400">#{item.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><SlotBadge v={item.slot_type} /></td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: GOLD }}>{zarFmt(item.price_paid_cents)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${item.days_remaining <= 1 ? "text-red-500" : item.days_remaining <= 3 ? "text-orange-500" : "text-gray-600"}`}>
                        {item.status === "active" ? `${item.days_remaining}d` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{Number(item.impressions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: G }}>{ctrFmt(Number(item.clicks || 0), Number(item.impressions || 0))}</td>
                    <td className="px-4 py-3 text-xs font-bold text-indigo-600">{Number(item.conversions || 0)}</td>
                    <td className="px-4 py-3 w-24">
                      {item.ai_score > 0 ? <ScoreBar score={item.ai_score} /> : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3"><StaBadge v={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(item.status === "active" || item.status === "paused") && (
                          <button data-testid={`btn-toggle-${item.id}`} onClick={() => toggle(item.id)}
                            className="px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: item.status === "active" ? O : G }}>
                            {item.status === "active" ? "⏸" : "▶"}
                          </button>
                        )}
                        {item.status === "active" && (
                          <button data-testid={`btn-extend-${item.id}`} onClick={() => setExtending(item)}
                            className="px-2 py-1 rounded text-[10px] bg-indigo-50 text-indigo-600 font-bold">+days</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-gray-500">{page}/{totalPages} ({total})</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 disabled:opacity-40">Next →</button>
        </div>
      )}

      <Dialog open={!!extending} onOpenChange={() => setExtending(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Extend Promotion</DialogTitle></DialogHeader>
          {extending && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{extending.title}</p>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Additional Days</p>
                <Input type="number" min={1} max={90} value={extraDays} onChange={e => setExtraDays(parseInt(e.target.value) || 1)} />
                <p className="text-xs text-gray-400 mt-1">Cost: {zarFmt(Math.round(extending.price_paid_cents / extending.duration_days) * extraDays)}</p>
              </div>
              <DialogFooter>
                <button onClick={() => setExtending(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-extend" onClick={extend} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: G }}>Extend</button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Catalog ─────────────────────────────────────────────────────────────
function CatalogTab() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<PromotionSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<PromotionSlot | null>(null);
  const [editingSlot, setEditingSlot] = useState<PromotionSlot | null>(null);
  const [preview, setPreview] = useState<PricingPreview | null>(null);
  const [form, setForm] = useState({ subjectType: "gig", subjectId: "", userId: "", title: "", description: "", durationDays: 7, userCountry: "ZA", isMeritUser: false, isFirstPromotion: false });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api("/api/promotions/catalog/slots").then(setSlots).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  }, []);

  const loadPreview = async (slot: PromotionSlot) => {
    setPreviewLoading(true);
    try {
      const p = await api("/api/promotions/pricing/preview", { method: "POST", body: JSON.stringify({ slotType: slot.slot_type, durationDays: form.durationDays, userCountry: form.userCountry, isMeritUser: form.isMeritUser, isFirstPromotion: form.isFirstPromotion }) });
      setPreview(p);
    } catch {}
    finally { setPreviewLoading(false); }
  };

  const openCreate = (slot: PromotionSlot) => { setCreating(slot); setPreview(null); loadPreview(slot); };

  const submitCreate = async () => {
    if (!creating || !form.subjectId || !form.userId || !form.title) return;
    setSubmitting(true);
    try {
      const r = await api("/api/promotions", { method: "POST", body: JSON.stringify({ slotType: creating.slot_type, subjectType: form.subjectType, subjectId: form.subjectId, userId: form.userId, title: form.title, description: form.description, durationDays: form.durationDays, userCountry: form.userCountry, isMeritUser: form.isMeritUser, isFirstPromotion: form.isFirstPromotion }) });
      toast({ title: "Promotion created!", description: r.message });
      setCreating(null); setPreview(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const saveSlot = async () => {
    if (!editingSlot) return;
    try {
      await api(`/api/promotions/catalog/slots/${editingSlot.id}`, { method: "PUT", body: JSON.stringify({ displayName: editingSlot.display_name, maxConcurrent: editingSlot.max_concurrent, basePriceCents: editingSlot.base_price_cents, isActive: editingSlot.is_active, africaPriceCents: editingSlot.africa_price_cents, ussdEnabled: editingSlot.ussd_enabled }) });
      toast({ title: "Slot updated" }); setEditingSlot(null);
      api("/api/promotions/catalog/slots").then(setSlots).catch(() => {});
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h3 className="font-bold text-amber-800 mb-1">6 Promotion Slot Types — No competitor has more than 2</h3>
        <p className="text-xs text-amber-600">Each slot is a distinct visibility channel. Create any combination. AI recommends the best slot per subject.</p>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slots.map(slot => (
            <div key={slot.id} data-testid={`slot-${slot.slot_type}`}
              className={`bg-white rounded-xl border-2 p-5 ${slot.is_active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{SLOT_ICON[slot.slot_type]}</span>
                    <span className="font-bold text-gray-800 text-sm">{slot.display_name}</span>
                    {slot.ussd_enabled && <span className="text-[9px] px-1 py-0.5 rounded bg-orange-100 text-orange-600 font-bold">USSD</span>}
                    {slot.africa_micro_tier && <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-600 font-bold">🌍 MICRO</span>}
                    {!slot.is_active && <span className="text-[9px] px-1 py-0.5 rounded bg-gray-200 text-gray-400 font-bold">INACTIVE</span>}
                  </div>
                  <p className="text-xs text-gray-400">{slot.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-amber-50 rounded-lg p-2 text-center">
                  <div className="text-base font-black" style={{ color: GOLD }}>{zarFmt(slot.base_price_cents)}</div>
                  <div className="text-[10px] text-gray-400">per day (ZA)</div>
                </div>
                {slot.africa_price_cents && (
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-base font-black text-green-600">{zarFmt(slot.africa_price_cents)}</div>
                    <div className="text-[10px] text-gray-400">Africa micro-tier</div>
                  </div>
                )}
              </div>
              {/* Inventory bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Inventory: {slot.active_count}/{slot.max_concurrent} filled</span>
                  <span className={slot.available <= 1 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{slot.available} available</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(slot.active_count / slot.max_concurrent) * 100}%`, background: slot.available <= 1 ? R : GOLD }} />
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mb-3">{slot.min_duration_days}–{slot.max_duration_days} day campaigns</div>
              <div className="flex gap-2">
                <button data-testid={`btn-create-${slot.slot_type}`} onClick={() => openCreate(slot)} disabled={!slot.is_active || slot.available <= 0}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40 transition-colors" style={{ background: SLOT_COL[slot.slot_type] }}>
                  {slot.available <= 0 ? "Sold Out" : "+ Create Promotion"}
                </button>
                <button data-testid={`btn-edit-slot-${slot.id}`} onClick={() => setEditingSlot({ ...slot })} className="px-3 py-2 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">⚙</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={!!creating} onOpenChange={() => { setCreating(null); setPreview(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {creating && <span>{SLOT_ICON[creating.slot_type]}</span>}
              Create {creating?.display_name} Promotion
            </DialogTitle>
          </DialogHeader>
          {creating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Subject Type</p>
                  <Select value={form.subjectType} onValueChange={v => setForm(p => ({ ...p, subjectType: v }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["gig","freelancer","job","banner"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration (days)</p>
                  <Input type="number" min={creating.min_duration_days} max={creating.max_duration_days}
                    value={form.durationDays} onChange={e => { setForm(p => ({ ...p, durationDays: parseInt(e.target.value) || 7 })); loadPreview(creating); }} className="text-xs" />
                </div>
              </div>
              {[{ label: "Subject ID", key: "subjectId" }, { label: "User ID", key: "userId" }].map(({ label, key }) => (
                <div key={key}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                  <Input value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="text-xs" />
                </div>
              ))}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Promotion Title</p>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Hire Africa's Best React Developer" className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Description (optional)</p>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">User Country</p>
                  <Select value={form.userCountry} onValueChange={v => { setForm(p => ({ ...p, userCountry: v })); loadPreview(creating); }}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["ZA","NG","KE","GH","ZW","US","GB","AU"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-4">
                  {[{ label: "Merit User (Academy top performer)", key: "isMeritUser" }, { label: "First-time promoter", key: "isFirstPromotion" }].map(({ label, key }) => (
                    <label key={key} className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" checked={(form as any)[key]} onChange={e => { setForm(p => ({ ...p, [key]: e.target.checked })); loadPreview(creating); }} className="rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing Preview */}
              {previewLoading ? (
                <div className="flex justify-center py-3"><Spinner /></div>
              ) : preview && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase mb-2">💰 Pricing Preview — Dynamic Engine</p>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                    {[{ label: "Per Day", value: zarFmt(preview.perDayCents) }, { label: `Total (${form.durationDays}d)`, value: zarFmt(preview.totalCents) }, { label: "Savings", value: preview.totalSavingsCents > 0 ? zarFmt(preview.totalSavingsCents) : "—" }].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-lg p-2">
                        <div className="text-base font-black text-gray-800">{value}</div>
                        <div className="text-[10px] text-gray-400">{label}</div>
                      </div>
                    ))}
                  </div>
                  {preview.appliedRules.length > 0 && (
                    <div>
                      <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Applied Rules</p>
                      {preview.appliedRules.map(r => <p key={r} className="text-xs text-amber-700">• {r}</p>)}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <button onClick={() => { setCreating(null); setPreview(null); }} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-create" onClick={submitCreate} disabled={submitting || !form.title || !form.subjectId || !form.userId}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>
                  {submitting ? "Creating…" : "Create Promotion"}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Slot — {editingSlot?.display_name}</DialogTitle></DialogHeader>
          {editingSlot && (
            <div className="space-y-3">
              {[{ label: "Display Name", key: "display_name" }, { label: "Max Concurrent", key: "max_concurrent", type: "number" }, { label: "Base Price (cents, ZAR)", key: "base_price_cents", type: "number" }, { label: "Africa Price (cents)", key: "africa_price_cents", type: "number" }].map(({ label, key, type = "text" }) => (
                <div key={key}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                  <Input type={type} value={(editingSlot as any)[key] || ""} onChange={e => setEditingSlot(p => p ? ({ ...p, [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value }) : null)} className="text-xs" />
                </div>
              ))}
              {[{ label: "Active", key: "is_active" }, { label: "USSD Enabled", key: "ussd_enabled" }].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={(editingSlot as any)[key]} onChange={e => setEditingSlot(p => p ? ({ ...p, [key]: e.target.checked }) : null)} className="rounded" />
                  {label}
                </label>
              ))}
              <DialogFooter>
                <button onClick={() => setEditingSlot(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-save-slot" onClick={saveSlot} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: G }}>Save Slot</button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Pricing Engine ──────────────────────────────────────────────────────
function PricingTab() {
  const { toast } = useToast();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ slotType: "featured_gig", ruleName: "", ruleType: "multiplier", multiplier: "1.00", flatDiscountCents: 0, priority: 10 });
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/promotions/pricing/rules").then(setRules).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (r: PricingRule) => {
    try { await api(`/api/promotions/pricing/rules/${r.id}/toggle`, { method: "POST", body: "{}" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this pricing rule?")) return;
    try { await api(`/api/promotions/pricing/rules/${id}`, { method: "DELETE" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const addRule = async () => {
    if (!newRule.ruleName) return;
    setAdding(true);
    try {
      await api("/api/promotions/pricing/rules", { method: "POST", body: JSON.stringify(newRule) });
      toast({ title: "Rule added" }); setShowAdd(false); load();
      setNewRule({ slotType: "featured_gig", ruleName: "", ruleType: "multiplier", multiplier: "1.00", flatDiscountCents: 0, priority: 10 });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const bySlot = Array.from(new Set(rules.map(r => r.slot_type)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-1 mr-4">
          <h3 className="font-bold text-indigo-800 mb-1">Dynamic Pricing Engine — {rules.length} Active Rules</h3>
          <p className="text-xs text-indigo-600">Multipliers apply in priority order. Africa micro-tier, merit discounts, peak season, and long-campaign rules are all independent. Fiverr has 0 dynamic rules — we have {rules.length}.</p>
        </div>
        <button data-testid="btn-add-pricing-rule" onClick={() => setShowAdd(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0" style={{ background: GOLD }}>+ Add Rule</button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : bySlot.map(slot => (
        <div key={slot} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <SlotBadge v={slot} />
            <span className="text-xs text-gray-400">{rules.filter(r => r.slot_type === slot).length} rules</span>
          </div>
          <div className="divide-y divide-gray-50">
            {rules.filter(r => r.slot_type === slot).map(rule => (
              <div key={rule.id} data-testid={`rule-${rule.id}`} className={`px-4 py-3 flex items-center gap-3 ${rule.is_active ? "" : "opacity-50"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-700">{rule.rule_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white ${parseFloat(rule.multiplier) < 1 ? "bg-green-500" : parseFloat(rule.multiplier) > 1 ? "bg-red-500" : "bg-gray-400"}`}>
                      {parseFloat(rule.multiplier) === 1 ? "=" : parseFloat(rule.multiplier) < 1 ? "↓" : "↑"} ×{rule.multiplier}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">P{rule.priority}</span>
                    {!rule.is_active && <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">DISABLED</span>}
                  </div>
                  {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                    <p className="text-[10px] text-gray-400">Conditions: {JSON.stringify(rule.conditions)}</p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button data-testid={`btn-toggle-rule-${rule.id}`} onClick={() => toggle(rule)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: rule.is_active ? "#9ca3af" : G }}>
                    {rule.is_active ? "Off" : "On"}
                  </button>
                  <button onClick={() => remove(rule.id)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Pricing Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Slot Type", key: "slotType", opts: ["homepage_banner","featured_gig","featured_freelancer","featured_job","sponsored_search","email_spotlight"] },
                { label: "Rule Type", key: "ruleType", opts: ["multiplier","flat_discount"] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                  <Select value={(newRule as any)[key]} onValueChange={v => setNewRule(p => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rule Name</p>
              <Input value={newRule.ruleName} onChange={e => setNewRule(p => ({ ...p, ruleName: e.target.value }))} placeholder="e.g. Black Friday 2026" className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Multiplier (e.g. 0.80, 1.50)</p>
                <Input value={newRule.multiplier} onChange={e => setNewRule(p => ({ ...p, multiplier: e.target.value }))} className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Priority (1=highest)</p>
                <Input type="number" min={1} max={100} value={newRule.priority} onChange={e => setNewRule(p => ({ ...p, priority: parseInt(e.target.value) || 10 }))} className="text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
            <button data-testid="btn-confirm-add-rule" onClick={addRule} disabled={adding || !newRule.ruleName}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>
              {adding ? "Adding…" : "Add Rule"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/api/promotions/analytics").then(setData).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* ROI by Slot Type — headline */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-5 text-white">
        <h3 className="font-bold text-lg mb-3">💰 ROI by Promotion Type — Industry-Leading Visibility Returns</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.roiBySlot.map((s: any) => (
            <div key={s.slot} className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl font-black">{s.avgRoi}x</div>
              <div className="text-xs opacity-90 leading-tight">{s.slot}</div>
              <div className="text-[10px] opacity-75 mt-0.5">CTR {s.avgCtr}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Volume */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h4 className="font-semibold text-sm text-gray-700 mb-4">30-Day Promotion Performance</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.daily.slice(-14)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {[{ id: "imp", col: GOLD }, { id: "click", col: G }, { id: "conv", col: P }].map(({ id, col }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={col} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={col} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="impressions" stroke={GOLD} fill="url(#imp)" strokeWidth={2} name="Impressions" />
            <Area type="monotone" dataKey="clicks" stroke={G} fill="url(#click)" strokeWidth={2} name="Clicks" />
            <Area type="monotone" dataKey="conversions" stroke={P} fill="url(#conv)" strokeWidth={2} name="Conversions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* By Slot Type Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">Impressions by Slot Type</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.bySlot.map((s: any) => ({ ...s, impressions: Number(s.impressions || 0) }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="slot_type" tick={{ fontSize: 9 }} tickFormatter={v => v.replace(/_/g, " ").slice(0, 10)} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
              <Bar dataKey="impressions" name="Impressions" radius={[4, 4, 0, 0]}>
                {data.bySlot.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="font-semibold text-sm text-gray-700 mb-4">Country Revenue Distribution</h4>
          <div className="space-y-3">
            {data.countryData.map((c: any) => (
              <div key={c.code} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600 w-4">{c.code}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.revenue / data.countryData.reduce((a: number, d: any) => a + d.revenue, 0)) * 100}%`, background: GOLD }} />
                </div>
                <span className="text-xs font-bold text-gray-700 w-16 text-right">R{c.revenue.toLocaleString()}</span>
                <span className="text-xs text-gray-400 w-12">CTR {(c.avgCtr * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merit vs Paid */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
        <h4 className="font-semibold text-sm text-purple-700 mb-3">🎓 Merit vs Paid Promotion Performance</h4>
        <div className="grid grid-cols-2 gap-4">
          {data.meritVsPaid.map((m: any) => (
            <div key={String(m.merit_boost)} className="bg-white rounded-lg p-4">
              <div className="font-bold text-gray-800 mb-2">{m.merit_boost ? "🎓 Merit (Academy)" : "💳 Paid"}</div>
              {[{ label: "Promotions", value: Number(m.count) }, { label: "Avg CTR", value: `${(Number(m.avg_ctr) * 100).toFixed(2)}%` }, { label: "Avg CVR", value: `${(Number(m.avg_cvr) * 100).toFixed(2)}%` }, { label: "Total Impressions", value: Number(m.total_impressions || 0).toLocaleString() }].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{label}</span><span className="font-bold text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: AI Studio ───────────────────────────────────────────────────────────
function AiStudioTab() {
  const { toast } = useToast();
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/promotions/ai/recommendations").then(setRecs).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-lg">🤖 AI Recommendation Engine</h3>
            <p className="text-sm opacity-90 mt-1">5-signal scoring: completion rate, rating, review count, recency, category trend. No competitor has automated recommendation.</p>
          </div>
          <button data-testid="btn-refresh-ai" onClick={load} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-white/20 hover:bg-white/30">↻ Refresh</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : recs.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🤖</div><p>No recommendations available</p></div>
      ) : (
        <div className="space-y-3">
          {recs.map(rec => (
            <div key={rec.rank} data-testid={`rec-${rec.rank}`} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ background: rec.rank === 1 ? GOLD : rec.rank === 2 ? "#9ca3af" : rec.rank === 3 ? O : P }}>
                  #{rec.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-bold text-gray-800 text-sm">{rec.title}</span>
                    {rec.meritEligible && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-purple-500">🎓 MERIT 30% OFF</span>}
                    <SlotBadge v={rec.suggestedSlot} />
                    <span className="text-xs text-gray-400 capitalize">{rec.subjectType}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{rec.reason}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "AI Score", value: rec.aiScore, icon: "🤖" },
                      { label: "Est. ROI", value: rec.estimatedRoi, icon: "💰" },
                      { label: "Est. Impressions", value: rec.estimatedImpressions.toLocaleString(), icon: "👁️" },
                      { label: "Est. Conversions", value: rec.estimatedConversions, icon: "✅" },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-base">{icon}</div>
                        <div className="text-sm font-black text-gray-800">{value}</div>
                        <div className="text-[10px] text-gray-400">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="w-full mb-2">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>AI Recommendation Score</span><span className="font-bold" style={{ color: rec.aiScore >= 85 ? G : rec.aiScore >= 70 ? GOLD : O }}>{rec.aiScore}/100</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${rec.aiScore}%`, background: rec.aiScore >= 85 ? G : rec.aiScore >= 70 ? GOLD : O }} /></div>
                  </div>
                </div>
                <div className="shrink-0">
                  <p className="text-xs text-gray-400 mb-1">Suggest: {rec.suggestedDuration}d</p>
                  <button data-testid={`btn-promote-rec-${rec.rank}`}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white block" style={{ background: GOLD }}>
                    Promote →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Approvals ───────────────────────────────────────────────────────────
function ApprovalsTab() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/promotions/approval/queue").then(setQueue).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resolve = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const r = await api(`/api/promotions/${selected.id}/approve`, { method: "POST", body: JSON.stringify({ action, note }) });
      toast({ title: r.message }); setSelected(null); setNote(""); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <span className="text-2xl font-black" style={{ color: queue.length > 0 ? R : G }}>{queue.length}</span>
        <div>
          <p className="font-bold text-gray-800 text-sm">Promotions Pending Approval</p>
          <p className="text-xs text-gray-400">All promotions require content moderation approval before going live — no ad goes live unchecked.</p>
        </div>
        <button onClick={load} className="ml-auto px-3 py-1.5 rounded-lg text-xs bg-gray-100 hover:bg-gray-200">↻ Refresh</button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : queue.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">✅</div><p>All promotions approved — queue clear</p></div>
      ) : (
        <div className="space-y-3">
          {queue.map(p => (
            <div key={p.id} data-testid={`approval-${p.id}`} className="bg-white rounded-xl border border-indigo-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-bold text-gray-800">{p.title}</span>
                    <SlotBadge v={p.slot_type} />
                    {p.merit_boost && <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-600 font-bold">🎓 MERIT</span>}
                  </div>
                  {p.description && <p className="text-xs text-gray-400 mb-2">{p.description}</p>}
                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                    <span>Subject: <strong className="text-gray-600">{p.subject_type} — {p.subject_id}</strong></span>
                    <span>User: <strong className="text-gray-600 font-mono">{p.user_id}</strong></span>
                    <span>Duration: <strong>{p.duration_days}d</strong></span>
                    <span>Price: <strong style={{ color: GOLD }}>{zarFmt(p.price_paid_cents)}</strong></span>
                    <span>Filed: {fmtDate(p.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button data-testid={`btn-approve-${p.id}`} onClick={() => { setSelected(p); setAction("approve"); setNote(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: G }}>✓ Approve</button>
                  <button data-testid={`btn-reject-${p.id}`} onClick={() => { setSelected(p); setAction("reject"); setNote(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500">✕ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{action === "approve" ? "✓ Approve" : "✕ Reject"} Promotion</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-sm text-gray-800">{selected.title}</p>
                <p className="text-xs text-gray-400 mt-1">{selected.slot_type.replace(/_/g," ")} · {selected.duration_days}d · {zarFmt(selected.price_paid_cents)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: "approve" as const, label: "✓ Approve — Go Live", bg: G }, { v: "reject" as const, label: "✕ Reject — Decline", bg: R }].map(opt => (
                  <button key={opt.v} onClick={() => setAction(opt.v)} data-testid={`btn-action-${opt.v}`}
                    className={`p-3 rounded-lg border-2 text-xs font-bold transition-colors ${action === opt.v ? "text-white" : "border-gray-200 text-gray-500"}`}
                    style={action === opt.v ? { background: opt.bg, borderColor: opt.bg } : {}}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Note to advertiser (optional)</p>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Content approved — will go live at midnight…" rows={2} />
              </div>
              <DialogFooter>
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                <button data-testid="btn-confirm-approval" onClick={resolve} disabled={acting}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: action === "approve" ? G : R }}>
                  {acting ? "Processing…" : `Confirm ${action === "approve" ? "Approval" : "Rejection"}`}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "active", label: "📋 Active", component: ActiveTab },
  { id: "catalog", label: "🛍️ Catalog", component: CatalogTab },
  { id: "pricing", label: "💰 Pricing Engine", component: PricingTab },
  { id: "analytics", label: "📊 Analytics", component: AnalyticsTab },
  { id: "ai", label: "🤖 AI Studio", component: AiStudioTab },
  { id: "approvals", label: "⏳ Approvals", component: ApprovalsTab },
];

export default function PromotionManagement() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    api("/api/promotions/stats").then(setStats).catch(() => {});
  }, [user]);

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const Active = TABS.find(t => t.id === activeTab)?.component || ActiveTab;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate("/admin")} data-testid="btn-back-admin" className="text-sm text-gray-500 hover:text-gray-700 mr-1">← Admin</button>
          <span className="text-lg font-black text-gray-800">📣 Promotion System</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: GOLD }}>200% INTELLIGENCE</span>
          {stats && stats.pending > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white animate-pulse">{stats.pending} pending approval</span>
          )}
          {stats && stats.active > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{stats.active} live promotions</span>
          )}
          {stats && stats.revenueTotalZar > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">💰 R{stats.revenueTotalZar.toLocaleString("en-ZA")} total revenue</span>
          )}
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-6 space-y-5">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Total", value: stats.total, bg: "bg-white border-gray-100", tc: "#374151" },
              { label: "Live", value: stats.active, bg: "bg-green-50 border-green-100", tc: G },
              { label: "Pending", value: stats.pending, bg: "bg-indigo-50 border-indigo-100", tc: "#4f46e5" },
              { label: "Paused", value: stats.paused, bg: "bg-orange-50 border-orange-100", tc: O },
              { label: "Expired", value: stats.expired, bg: "bg-gray-50 border-gray-100", tc: "#9ca3af" },
              { label: "Merit", value: stats.meritPromotions, bg: "bg-purple-50 border-purple-100", tc: P },
              { label: "Impressions", value: stats.totalImpressions >= 1000 ? `${(stats.totalImpressions / 1000).toFixed(1)}K` : stats.totalImpressions, bg: "bg-amber-50 border-amber-100", tc: GOLD },
              { label: "ROI Tracked", value: `R${Math.round(stats.totalRoiZar).toLocaleString()}`, bg: "bg-green-50 border-green-100", tc: G },
            ].map(({ label, value, bg, tc }) => (
              <div key={label} data-testid={`stat-${label.toLowerCase()}`}
                className={`rounded-xl p-3.5 border ${bg} flex flex-col gap-1`}>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-xl font-black" style={{ color: tc }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-1 flex-wrap bg-white border border-gray-100 rounded-xl p-1.5">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              style={activeTab === tab.id ? { background: GOLD } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab */}
        <Active />
      </div>
    </div>
  );
}

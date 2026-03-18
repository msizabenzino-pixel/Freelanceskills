/**
 * Marketing System v2.0 — 200% Intelligence
 * The ultimate growth & viral acquisition engine
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const G = "#1DBF73";
const GOLD = "#f59e0b";
const R = "#ef4444";
const O = "#f97316";
const P = "#8b5cf6";
const B = "#0891b2";

const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};

const zarFmt = (c: number) => `R${(c / 100).toFixed(2)}`;
const pctFmt = (n: number) => `${(Number(n) * 100).toFixed(1)}%`;

interface Campaign { id: number; name: string; type: string; status: string; subject?: string; recipients_count?: number; opens?: number; clicks?: number; conversions?: number; revenue_generated_cents?: number; created_at: string; }
interface Referral { id: number; referrer_id: string; referral_code: string; referral_link: string; total_referrals: number; successful_referrals: number; viral_coefficient: number; total_bonus_paid_cents: number; }
interface Coupon { id: number; code: string; discount_type: string; discount_value: number; usage_limit_total?: number; current_usage: number; redemptions: number; is_active: boolean; expires_at?: string; }
interface Affiliate { id: number; affiliate_id: string; affiliate_name?: string; commission_type: string; commission_value: number; total_referrals: number; total_conversions: number; total_commission_earned_cents: number; }

function Spinner() { return <div className="w-5 h-5 animate-spin border-2 rounded-full" style={{ borderColor: `${G} transparent` }} />; }
function StaBadge({ v }: { v: string }) { return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white" style={{ background: v === "active" ? G : v === "draft" ? "#9ca3af" : O }}>{v.replace(/_/g, " ")}</span>; }

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════════════
function CampaignsTab() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", type: "newsletter", subject: "", headline: "", target_segment: "all" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setCampaigns(await api("/api/marketing/campaigns")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setCreating(true);
    try { const r = await api("/api/marketing/campaigns", { method: "POST", body: JSON.stringify(form) }); toast({ title: "Campaign created!" }); setForm({ name: "", type: "newsletter", subject: "", headline: "", target_segment: "all" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const send = async (id: number) => {
    setSending(id);
    try { const r = await api(`/api/marketing/campaigns/${id}/send`, { method: "POST", body: "{}" }); toast({ title: r.message }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSending(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1"><Input placeholder="Campaign name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="text-sm" /></div>
        <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{["newsletter", "announcement", "win_back", "referral_push"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={create} disabled={creating || !form.name} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>{creating ? "Creating…" : "+ Create"}</button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No campaigns yet</p></div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.type} · {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <StaBadge v={c.status} />
              </div>
              {c.status === "active" && (
                <div className="flex gap-4 mt-3 text-xs">
                  <div><span className="text-gray-400">Sent:</span> <span className="font-bold">{c.recipients_count || 0}</span></div>
                  <div><span className="text-gray-400">Open:</span> <span className="font-bold" style={{ color: G }}>{pctFmt((c.opens || 0) / Math.max(c.recipients_count || 1, 1))}</span></div>
                  <div><span className="text-gray-400">Click:</span> <span className="font-bold" style={{ color: B }}>{pctFmt((c.clicks || 0) / Math.max(c.recipients_count || 1, 1))}</span></div>
                  <div><span className="text-gray-400">Conv:</span> <span className="font-bold" style={{ color: P }}>{c.conversions || 0}</span></div>
                  <div><span className="text-gray-400">Revenue:</span> <span className="font-bold" style={{ color: GOLD }}>{zarFmt(c.revenue_generated_cents || 0)}</span></div>
                </div>
              )}
              {c.status === "draft" && <button onClick={() => send(c.id)} disabled={sending === c.id} className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: G }}>{sending === c.id ? "Sending…" : "Send Now"}</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2: REFERRALS
// ═══════════════════════════════════════════════════════════════════════════
function ReferralsTab() {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ referrer_id: "", bonus_amount_cents: 5000 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [refs, board] = await Promise.all([api("/api/marketing/referrals"), api("/api/marketing/referrals/leaderboard")]);
      setReferrals(refs);
      setLeaderboard(board);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.referrer_id) return;
    setCreating(true);
    try { const r = await api("/api/marketing/referrals/create", { method: "POST", body: JSON.stringify(form) }); toast({ title: "Referral created!" }); setForm({ referrer_id: "", bonus_amount_cents: 5000 }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex gap-2"><Input placeholder="User ID" value={form.referrer_id} onChange={e => setForm(p => ({ ...p, referrer_id: e.target.value }))} className="text-sm flex-1" /></div>
        <div><Input type="number" placeholder="Bonus (cents)" value={form.bonus_amount_cents} onChange={e => setForm(p => ({ ...p, bonus_amount_cents: parseInt(e.target.value) || 0 }))} className="text-sm" /></div>
        <button onClick={create} disabled={creating || !form.referrer_id} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: G }}>{creating ? "Creating…" : "+ New Referral"}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold text-sm mb-4">Active Referral Codes</h3>
          {loading ? <Spinner /> : (
            <div className="space-y-2">
              {referrals.map(ref => (
                <div key={ref.id} className="text-xs p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between"><span className="font-mono font-bold text-indigo-600">{ref.referral_code}</span><span className="text-gray-400">{ref.total_referrals} refs</span></div>
                  <div className="flex gap-2 mt-1 text-gray-400"><span>✓ {ref.successful_referrals}</span><span>k={Number(ref.viral_coefficient).toFixed(2)}</span><span>{zarFmt(ref.total_bonus_paid_cents)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold text-sm mb-4">🏆 Top Referrers (Bonus Paid)</h3>
          {loading ? <Spinner /> : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((ref, i) => (
                <div key={i} className="text-xs flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="font-bold text-gray-700">#{i + 1} {ref.referrer_id.substring(0, 16)}…</span>
                  <span style={{ color: GOLD }} className="font-bold">{zarFmt(ref.total_bonus_paid_cents)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3: COUPONS
// ═══════════════════════════════════════════════════════════════════════════
function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: "10", usage_limit_total: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await api("/api/marketing/coupons")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.code) return;
    setCreating(true);
    try { const r = await api("/api/marketing/coupons", { method: "POST", body: JSON.stringify({ ...form, discount_value: parseFloat(form.discount_value), usage_limit_total: form.usage_limit_total ? parseInt(form.usage_limit_total) : null }) }); toast({ title: "Coupon created!" }); setForm({ code: "", discount_type: "percentage", discount_value: "10", usage_limit_total: "" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Input placeholder="Code" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} className="text-sm" />
        <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["percentage", "fixed_amount"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="number" placeholder="Value" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} className="text-sm" />
        <button onClick={create} disabled={creating || !form.code} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: O }}>{creating ? "Creating…" : "+ Create"}</button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No coupons</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map(c => (
            <div key={c.id} className={`rounded-xl border-2 p-4 ${c.is_active ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold font-mono text-indigo-600">{c.code}</span>
                <StaBadge v={c.is_active ? "active" : "inactive"} />
              </div>
              <p className="text-sm text-gray-700 mb-2">{c.discount_type === "percentage" ? `${c.discount_value}% off` : zarFmt(Math.round(c.discount_value * 100))}</p>
              <div className="text-xs text-gray-400"><span>{c.current_usage}/{c.usage_limit_total || "∞"} used</span> · <span>{c.redemptions} redemptions</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4: AFFILIATES
// ═══════════════════════════════════════════════════════════════════════════
function AffiliatesTab() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ affiliate_id: "", affiliate_name: "", commission_type: "percentage", commission_value: "5" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setAffiliates(await api("/api/marketing/affiliates")); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.affiliate_id) return;
    setCreating(true);
    try { const r = await api("/api/marketing/affiliates", { method: "POST", body: JSON.stringify({ ...form, commission_value: parseFloat(form.commission_value) }) }); toast({ title: "Affiliate added!" }); setForm({ affiliate_id: "", affiliate_name: "", commission_type: "percentage", commission_value: "5" }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Input placeholder="Affiliate ID" value={form.affiliate_id} onChange={e => setForm(p => ({ ...p, affiliate_id: e.target.value }))} className="text-sm" />
        <Input placeholder="Name" value={form.affiliate_name} onChange={e => setForm(p => ({ ...p, affiliate_name: e.target.value }))} className="text-sm" />
        <Select value={form.commission_type} onValueChange={v => setForm(p => ({ ...p, commission_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["percentage", "fixed_per_referral"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={create} disabled={creating || !form.affiliate_id} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: P }}>{creating ? "Creating…" : "+ Add Affiliate"}</button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : affiliates.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No affiliates</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-bold text-gray-600">Affiliate</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Commission</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Referrals</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Conversions</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-gray-700">{a.affiliate_name || a.affiliate_id}</td>
                  <td className="px-4 py-2 text-gray-600">{a.commission_value}{a.commission_type === "percentage" ? "%" : " per"}</td>
                  <td className="px-4 py-2 text-gray-600">{a.total_referrals}</td>
                  <td className="px-4 py-2 font-bold" style={{ color: G }}>{a.total_conversions} ({pctFmt(a.total_referrals > 0 ? a.total_conversions / a.total_referrals : 0)})</td>
                  <td className="px-4 py-2 font-bold" style={{ color: GOLD }}>{zarFmt(a.total_commission_earned_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5: ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/marketing/analytics").then(setData).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Campaigns</p>
          <p className="text-2xl font-black" style={{ color: GOLD }}>{data.campaign_summary.sent}</p>
          <p className="text-xs text-gray-400 mt-1">sent · reached {data.campaign_summary.reached.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Referrals</p>
          <p className="text-2xl font-black" style={{ color: G }}>{data.referral_summary.conversions}</p>
          <p className="text-xs text-gray-400 mt-1">conversions · {zarFmt(data.referral_summary.spent)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">LTV Prediction</p>
          <p className="text-2xl font-black" style={{ color: B }}>Coming soon</p>
          <p className="text-xs text-gray-400 mt-1">ML-powered lifetime value forecasts</p>
        </div>
      </div>

      {data.daily_metrics.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4">30-Day Growth Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.daily_metrics.slice(-30)}>
              <defs>
                {[{ id: "new_users", color: G }, { id: "campaign_conversions", color: GOLD }, { id: "affiliate_conversions", color: P }].map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric_date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend />
              <Area type="monotone" dataKey="new_users" stroke={G} fill={`url(#new_users)`} name="New Users" />
              <Area type="monotone" dataKey="campaign_conversions" stroke={GOLD} fill={`url(#campaign_conversions)`} name="Campaign Conv" />
              <Area type="monotone" dataKey="affiliate_conversions" stroke={P} fill={`url(#affiliate_conversions)`} name="Affiliate Conv" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "campaigns", label: "📧 Campaigns", component: CampaignsTab },
  { id: "referrals", label: "🎯 Referrals", component: ReferralsTab },
  { id: "coupons", label: "🎟️ Coupons", component: CouponsTab },
  { id: "affiliates", label: "💼 Affiliates", component: AffiliatesTab },
  { id: "analytics", label: "📊 Analytics", component: AnalyticsTab },
];

export default function MarketingSystem() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("campaigns");

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const Active = TABS.find(t => t.id === activeTab)?.component || CampaignsTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3 flex items-center gap-2">
          <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 hover:text-gray-700 mr-2">← Admin</button>
          <span className="text-lg font-black text-gray-800">💰 Marketing System</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: GOLD }}>v2.0 · 20 SUPERPOWERS</span>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-5">
        <div className="bg-white border border-gray-100 rounded-xl p-1.5 flex gap-1 mb-5 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              style={activeTab === tab.id ? { background: GOLD } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        <Active />
      </div>
    </div>
  );
}

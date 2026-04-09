/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  MARKETING SYSTEM — Admin Module                                                              ║
 * ║  10 Magnificent Tabs · 30 Superpowers · Stays ahead until 2031               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝

 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";

// ── Design tokens ──────────────────────────────────────────────────────────────
const G = "#1DBF73";
const GOLD = "#f59e0b";
const R = "#ef4444";
const O = "#f97316";
const P = "#8b5cf6";
const B = "#0891b2";
const DARK = "#0f172a";

const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || r.statusText); }
  return r.json();
};

const zarFmt = (c: number) => `R${(c / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
const pctFmt = (n: number) => `${(Number(n) * 100).toFixed(1)}%`;
const numFmt = (n: number) => Number(n).toLocaleString("en-ZA");

function Spinner() {
  return <div className="w-6 h-6 animate-spin border-2 rounded-full mx-auto" style={{ borderColor: `${G} transparent` }} />;
}

function StaBadge({ v, size = "sm" }: { v: string; size?: "xs" | "sm" }) {
  const colours: Record<string, string> = {
    active: G, draft: "#9ca3af", moderation_hold: O, completed: B, paused: "#94a3b8",
    scheduled: P, inactive: R, bronze: "#cd7f32", silver: "#94a3b8", gold: GOLD, platinum: "#e5e4e2", diamond: "#b9f2ff",
  };
  const sz = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return <span className={`${sz} rounded-full font-bold uppercase text-white`} style={{ background: colours[v] || "#9ca3af" }}>{v.replace(/_/g, " ")}</span>;
}

function MetricCard({ label, value, sub, color = GOLD, icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{icon && <span className="mr-1">{icon}</span>}{label}</p>
      <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SortHeader({ label, field, sort, dir, onChange }: { label: string; field: string; sort: string; dir: string; onChange: (f: string, d: string) => void }) {
  const active = sort === field;
  return (
    <button onClick={() => onChange(field, active && dir === "desc" ? "asc" : "desc")} className={`flex items-center gap-1 font-bold text-xs uppercase tracking-wide ${active ? "text-indigo-600" : "text-gray-500"}`}>
      {label} {active ? (dir === "desc" ? "↓" : "↑") : "↕"}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: AI CAMPAIGN BRAIN
// ═══════════════════════════════════════════════════════════════════════════════
function AIBrainTab() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [braining, setBraining] = useState<number | null>(null);
  const [winning, setWinning] = useState<number | null>(null);
  const [sort, setSort] = useState("created_at");
  const [dir, setDir] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [blasting, setBlasting] = useState(false);
  const [form, setForm] = useState({ name: "", type: "newsletter", subject: "", body: "", target_segment: "all", ab_enabled: true });
  const [brainResult, setBrainResult] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api(`/api/marketing/campaigns?status=${statusFilter}&sort=${sort}&dir=${dir}`);
      setCampaigns(r.items || []);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [statusFilter, sort, dir, toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.name) return;
    setCreating(true);
    try {
      const r = await api("/api/marketing/campaigns", { method: "POST", body: JSON.stringify(form) });
      toast({ title: r.moderation_held ? "Campaign created — held for moderation" : "Campaign created!", description: r.moderation_held ? "Content flagged for moderation review" : "Ready to send" });
      setForm({ name: "", type: "newsletter", subject: "", body: "", target_segment: "all", ab_enabled: true });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const runBrain = async (id: number) => {
    setBraining(id);
    setBrainResult(null);
    try {
      const r = await api(`/api/marketing/campaigns/${id}/ai-brain`, { method: "POST", body: "{}" });
      setBrainResult({ campaignId: id, ...r });
      toast({ title: "AI Brain complete!", description: r.insight });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setBraining(null); }
  };

  const send = async (id: number) => {
    setWinning(id);
    try {
      const r = await api(`/api/marketing/campaigns/${id}/send`, { method: "POST", body: "{}" });
      toast({ title: "Sent via omnichannel!", description: r.message });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setWinning(null); }
  };

  const blast = async () => {
    setBlasting(true);
    try {
      const r = await api("/api/marketing/omnichannel/blast", { method: "POST", body: JSON.stringify({ channels: ["email", "sms", "push", "in_app", "whatsapp"], target_segment: form.target_segment }) });
      toast({ title: `Omnichannel blast fired!`, description: `${r.total_recipients?.toLocaleString() || 0} recipients across ${r.channels?.length || 5} channels` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setBlasting(false); }
  };

  const sortChange = (f: string, d: string) => { setSort(f); setDir(d); };

  return (
    <div className="space-y-5">
      {/* Create Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🤖</span>
          <h3 className="font-black text-gray-800">Agentic AI Campaign Brain</h3>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600">SUPERPOWER #1</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Input data-testid="input-campaign-name" placeholder="Campaign name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="text-sm" />
          <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
            <SelectTrigger data-testid="select-campaign-type"><SelectValue /></SelectTrigger>
            <SelectContent>{["newsletter", "announcement", "win_back", "referral_push", "skill_match", "vip_exclusive"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Input data-testid="input-campaign-subject" placeholder="Subject line" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="text-sm" />
          <Select value={form.target_segment} onValueChange={v => setForm(p => ({ ...p, target_segment: v }))}>
            <SelectTrigger data-testid="select-segment"><SelectValue /></SelectTrigger>
            <SelectContent>{["all", "freelancers", "clients", "high_value", "at_risk", "new_users", "inactive"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea placeholder="Campaign body (optional — AI Brain will generate if empty)" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="text-sm mb-3" rows={2} />
        <div className="flex gap-2 flex-wrap">
          <button data-testid="button-create-campaign" onClick={create} disabled={creating || !form.name} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>{creating ? "Creating…" : "+ Create Campaign"}</button>
          <button data-testid="button-omnichannel-blast" onClick={blast} disabled={blasting} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: P }}>{blasting ? "Firing…" : "⚡ Omnichannel Blast"}</button>
        </div>
      </div>

      {/* AI Brain Result Panel */}
      {brainResult && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="font-bold text-indigo-700 mb-2">🤖 AI Brain Generated Variants for Campaign #{brainResult.campaignId}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["variant_a", "variant_b"].map((key, i) => {
              const v = brainResult[key];
              return v ? (
                <div key={key} className="bg-white rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-500 mb-1">VARIANT {key === "variant_a" ? "A" : "B"}</p>
                  <p className="text-sm font-bold text-gray-800">{v.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{v.headline}</p>
                  <p className="text-xs text-indigo-600 mt-1 font-semibold">CTA: {v.cta}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">{v.insight}</p>
                </div>
              ) : null;
            })}
          </div>
          {brainResult.suggested_send_time && <p className="text-xs text-indigo-600 mt-2 font-semibold">⏰ AI Recommended Send Time: {new Date(brainResult.suggested_send_time).toLocaleDateString("en-ZA", { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
        </div>
      )}

      {/* Filters + Sort */}
      <div className="flex gap-3 flex-wrap items-center">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); }}>
          <SelectTrigger className="w-40 text-sm" data-testid="select-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>{["all", "draft", "active", "moderation_hold", "scheduled", "completed"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-gray-400">Sort by:</span>
        {["opens", "clicks", "conversions", "revenue_generated_cents"].map(f => (
          <button key={f} onClick={() => sortChange(f, sort === f && dir === "desc" ? "asc" : "desc")} className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${sort === f ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}>{f.replace(/_/g, " ").replace(" cents", "")} {sort === f ? (dir === "desc" ? "↓" : "↑") : ""}</button>
        ))}
      </div>

      {/* Campaign List */}
      {loading ? <div className="py-8"><Spinner /></div> : campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-2">📧</p><p>No campaigns yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} data-testid={`card-campaign-${c.id}`} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.type.replace(/_/g, " ")} · {c.target_segment} · {new Date(c.created_at).toLocaleDateString("en-ZA")}</p>
                  {c.ab_enabled && <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded font-bold ml-0">A/B TEST</span>}
                </div>
                <div className="flex items-center gap-2">
                  {c.ai_generated && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold">🤖 AI</span>}
                  <StaBadge v={c.status} />
                </div>
              </div>
              {(c.status === "active" || c.status === "completed") && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: "Reached", val: numFmt(c.recipients_count || 0), color: DARK },
                    { label: "Opens", val: pctFmt((c.opens || 0) / Math.max(c.recipients_count || 1, 1)), color: G },
                    { label: "Clicks", val: pctFmt((c.clicks || 0) / Math.max(c.recipients_count || 1, 1)), color: B },
                    { label: "Conv.", val: numFmt(c.conversions || 0), color: P },
                    { label: "Revenue", val: zarFmt(c.revenue_generated_cents || 0), color: GOLD },
                  ].map(m => (
                    <div key={m.label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">{m.label}</p>
                      <p className="text-sm font-black" style={{ color: m.color }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              )}
              {c.ab_winner_variant && <p className="text-xs text-green-600 font-bold mb-2">✓ A/B Winner: Variant {c.ab_winner_variant} at {c.ab_confidence_pct}% confidence</p>}
              <div className="flex gap-2 flex-wrap">
                {(c.status === "draft" || c.status === "moderation_hold") && (
                  <button data-testid={`button-brain-${c.id}`} onClick={() => runBrain(c.id)} disabled={braining === c.id} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: P }}>{braining === c.id ? "Thinking…" : "🤖 AI Brain"}</button>
                )}
                {c.status === "draft" && (
                  <button data-testid={`button-send-${c.id}`} onClick={() => send(c.id)} disabled={winning === c.id} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: G }}>{winning === c.id ? "Sending…" : "⚡ Send Omnichannel"}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: REFERRALS — Intelligence, Blockchain, Fraud Detection, USSD
// ═══════════════════════════════════════════════════════════════════════════════
function ReferralsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>({ items: [], viral_coefficient: 0 });
  const [leaderboard, setLeaderboard] = useState<any>({ leaderboard: [], viral_coefficient: 0 });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sort, setSort] = useState("total_bonus_paid_cents");
  const [dir, setDir] = useState("desc");
  const [form, setForm] = useState({ referrer_id: "", bonus_type: "credits", bonus_amount_cents: 5000, tier: "standard" });
  const [verifyForm, setVerifyForm] = useState({ referral_code: "", referee_id: "", event_type: "signed_up" });
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [tab2, setTab2] = useState<"codes" | "leaderboard" | "verify">("codes");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [refs, board] = await Promise.all([
        api(`/api/marketing/referrals?sort=${sort}&dir=${dir}`),
        api("/api/marketing/referrals/leaderboard"),
      ]);
      setData(refs);
      setLeaderboard(board);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [sort, dir, toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.referrer_id) return;
    setCreating(true);
    try {
      const r = await api("/api/marketing/referrals", { method: "POST", body: JSON.stringify(form) });
      toast({ title: "Referral code created!", description: `Code: ${r.referral_code} | USSD: ${r.ussd_code}` });
      setForm({ referrer_id: "", bonus_type: "credits", bonus_amount_cents: 5000, tier: "standard" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const verify = async () => {
    if (!verifyForm.referral_code || !verifyForm.referee_id) return;
    setVerifying(true);
    try {
      const r = await api("/api/marketing/referrals/verify", { method: "POST", body: JSON.stringify(verifyForm) });
      setVerifyResult(r);
      toast({ title: "Verified!", description: "Blockchain-grade SHA256 proof generated" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setVerifying(false); }
  };

  const kColor = data.viral_coefficient >= 1.0 ? G : data.viral_coefficient >= 0.7 ? GOLD : R;

  return (
    <div className="space-y-4">
      {/* K-Factor Banner */}
      <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${DARK}, #1e293b)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300 uppercase font-semibold">Viral Coefficient (k-factor)</p>
            <p className="text-4xl font-black" style={{ color: kColor }}>{Number(data.viral_coefficient).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{data.viral_coefficient >= 1.0 ? "🚀 Viral growth — every user brings >1 new user" : data.viral_coefficient >= 0.7 ? "📈 Near viral — optimise referral bonuses" : "⚠️ Sub-viral — increase referral incentives now"}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Target: k ≥ 1.0</p>
            <p className="mt-1">k = invite_rate × conversion_rate</p>
            <p className="mt-1 text-[10px]">Industry avg: ~0.15</p>
            <p className="text-[10px]" style={{ color: G }}>FreelanceSkills target: 1.5</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="font-bold text-sm mb-3">Create Referral Code with Africa USSD + WhatsApp</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input data-testid="input-referrer-id" placeholder="User ID" value={form.referrer_id} onChange={e => setForm(p => ({ ...p, referrer_id: e.target.value }))} className="text-sm" />
          <Select value={form.bonus_type} onValueChange={v => setForm(p => ({ ...p, bonus_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["credits", "discount_pct", "commission_share", "account_boost"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Input data-testid="input-bonus-amount" type="number" placeholder="Bonus (cents)" value={form.bonus_amount_cents} onChange={e => setForm(p => ({ ...p, bonus_amount_cents: parseInt(e.target.value) || 0 }))} className="text-sm" />
          <button data-testid="button-create-referral" onClick={create} disabled={creating || !form.referrer_id} className="px-3 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: G }}>{creating ? "Creating…" : "+ Create"}</button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[{ id: "codes" as const, label: "Referral Codes" }, { id: "leaderboard" as const, label: "🏆 Leaderboard" }, { id: "verify" as const, label: "🔐 Blockchain Verify" }].map(t => (
          <button key={t.id} onClick={() => setTab2(t.id)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab2 === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t.label}</button>
        ))}
      </div>

      {tab2 === "codes" && (
        <div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {["total_referrals", "successful_referrals", "viral_coefficient", "total_bonus_paid_cents"].map(f => (
              <button key={f} onClick={() => { setSort(f); setDir(sort === f && dir === "desc" ? "asc" : "desc"); }} className={`text-xs px-2 py-1 rounded-lg font-semibold ${sort === f ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}>{f.replace(/_/g, " ").replace(" cents", "")} {sort === f ? (dir === "desc" ? "↓" : "↑") : ""}</button>
            ))}
          </div>
          {loading ? <Spinner /> : (
            <div className="space-y-2">
              {(data.items || []).map((ref: any) => (
                <div key={ref.id} data-testid={`card-referral-${ref.id}`} className={`p-3 rounded-xl border ${ref.fraud_flagged ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-mono font-black text-indigo-600">{ref.referral_code}</span>
                      {ref.fraud_flagged && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">⚠️ FRAUD FLAGGED</span>}
                      <p className="text-xs text-gray-500 mt-0.5">USSD: <span className="font-mono text-green-700">{ref.ussd_code}</span></p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="text-center"><p className="text-gray-400">Sent</p><p className="font-black text-gray-700">{ref.total_referrals}</p></div>
                      <div className="text-center"><p className="text-gray-400">Converted</p><p className="font-black" style={{ color: G }}>{ref.successful_referrals}</p></div>
                      <div className="text-center"><p className="text-gray-400">k-factor</p><p className="font-black" style={{ color: Number(ref.viral_coefficient) >= 1 ? G : GOLD }}>{Number(ref.viral_coefficient).toFixed(2)}</p></div>
                      <div className="text-center"><p className="text-gray-400">Bonus Paid</p><p className="font-black" style={{ color: GOLD }}>{zarFmt(ref.total_bonus_paid_cents)}</p></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab2 === "leaderboard" && (
        <div className="space-y-2">
          {loading ? <Spinner /> : (leaderboard.leaderboard || []).map((ref: any, i: number) => (
            <div key={i} data-testid={`row-leaderboard-${i}`} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: i === 0 ? GOLD : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : DARK }}>#{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-gray-700">{ref.referrer_id.substring(0, 20)}…</p>
                  <p className="text-xs text-gray-400">{ref.successful_referrals} conversions · k={Number(ref.viral_coefficient).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black" style={{ color: GOLD }}>{zarFmt(ref.total_bonus_paid_cents)}</p>
                {ref.fraud_flagged && <p className="text-[10px] text-red-500 font-bold">⚠️ Flagged</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab2 === "verify" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span>🔐</span>
            <h3 className="font-bold text-sm">Blockchain-Verified Referral Tracking</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gray-700">SUPERPOWER #6</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">SHA256-signed commission proofs — immutable, auditable, fraud-proof. No competitor has this.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <Input data-testid="input-ref-code" placeholder="Referral code" value={verifyForm.referral_code} onChange={e => setVerifyForm(p => ({ ...p, referral_code: e.target.value }))} className="text-sm" />
            <Input data-testid="input-referee-id" placeholder="Referee user ID" value={verifyForm.referee_id} onChange={e => setVerifyForm(p => ({ ...p, referee_id: e.target.value }))} className="text-sm" />
            <Select value={verifyForm.event_type} onValueChange={v => setVerifyForm(p => ({ ...p, event_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["clicked", "signed_up", "verified", "completed_first_job", "made_payment"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <button data-testid="button-verify-referral" onClick={verify} disabled={verifying} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: DARK }}>{verifying ? "Signing…" : "🔐 Generate Blockchain Proof"}</button>
          {verifyResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-black text-green-700 mb-2">✓ VERIFIED — Immutable Proof Generated</p>
              <p className="text-xs font-mono text-green-600 break-all">{verifyResult.hash}</p>
              <p className="text-xs text-gray-400 mt-2">{verifyResult.timestamp}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: COUPONS — AI Fraud Guard, Bulk Generate, Smart Expiry
// ═══════════════════════════════════════════════════════════════════════════════
function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [sort, setSort] = useState("created_at");
  const [dir, setDir] = useState("desc");
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: "15", usage_limit_total: "", target_user_type: "all", applicable_to: "all", min_spend_cents: "" });
  const [bulk, setBulk] = useState({ prefix: "FSKILL", count: "10", discount_type: "percentage", discount_value: "20", target_user_type: "all" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await api(`/api/marketing/coupons?sort=${sort}&dir=${dir}`)); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [sort, dir, toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.code) return;
    setCreating(true);
    try {
      const r = await api("/api/marketing/coupons", { method: "POST", body: JSON.stringify({ ...form, discount_value: parseFloat(form.discount_value), usage_limit_total: form.usage_limit_total ? parseInt(form.usage_limit_total) : null, min_spend_cents: form.min_spend_cents ? parseInt(form.min_spend_cents) : null }) });
      toast({ title: "Coupon created!", description: r.ai_note });
      setForm({ code: "", discount_type: "percentage", discount_value: "15", usage_limit_total: "", target_user_type: "all", applicable_to: "all", min_spend_cents: "" });
      load();
    } catch (e: any) { toast({ title: "AI Fraud Guard", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const generateBulk = async () => {
    setBulkGenerating(true);
    try {
      const r = await api("/api/marketing/coupons/bulk-generate", { method: "POST", body: JSON.stringify({ ...bulk, count: parseInt(bulk.count), discount_value: parseFloat(bulk.discount_value) }) });
      toast({ title: `${r.generated} coupons generated!`, description: `${r.discount_value}${r.discount_type === "percentage" ? "%" : " cents"} off · Expires ${new Date(r.expires_at).toLocaleDateString("en-ZA")}` });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setBulkGenerating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Single Coupon */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="font-bold text-sm mb-3">🎟️ Create Smart Coupon</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Input data-testid="input-coupon-code" placeholder="Code (e.g. LAUNCH50)" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="text-sm" />
            <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["percentage", "fixed_amount", "free_trial_days"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Input data-testid="input-discount-value" type="number" placeholder="Value (% or cents or days)" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} className="text-sm" />
            <Input type="number" placeholder="Usage limit (blank=∞)" value={form.usage_limit_total} onChange={e => setForm(p => ({ ...p, usage_limit_total: e.target.value }))} className="text-sm" />
            <Select value={form.target_user_type} onValueChange={v => setForm(p => ({ ...p, target_user_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "new_users", "returning", "high_value", "at_risk"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Min spend (cents)" value={form.min_spend_cents} onChange={e => setForm(p => ({ ...p, min_spend_cents: e.target.value }))} className="text-sm" />
          </div>
          <p className="text-xs text-amber-600 mb-2">🤖 AI Fraud Guard active · Predictive 21-day expiry applied</p>
          <button data-testid="button-create-coupon" onClick={create} disabled={creating || !form.code} className="px-4 py-2 rounded-lg text-sm font-bold text-white w-full disabled:opacity-50" style={{ background: O }}>{creating ? "Creating…" : "+ Create Coupon"}</button>
        </div>

        {/* Bulk Generator */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="font-bold text-sm mb-3">⚡ Bulk Coupon Generator</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Input placeholder="Prefix (e.g. LAUNCH)" value={bulk.prefix} onChange={e => setBulk(p => ({ ...p, prefix: e.target.value.toUpperCase() }))} className="text-sm" />
            <Input type="number" placeholder="Count (max 100)" value={bulk.count} onChange={e => setBulk(p => ({ ...p, count: e.target.value }))} className="text-sm" />
            <Select value={bulk.discount_type} onValueChange={v => setBulk(p => ({ ...p, discount_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["percentage", "fixed_amount"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Discount value" value={bulk.discount_value} onChange={e => setBulk(p => ({ ...p, discount_value: e.target.value }))} className="text-sm" />
          </div>
          <button data-testid="button-bulk-generate" onClick={generateBulk} disabled={bulkGenerating} className="px-4 py-2 rounded-lg text-sm font-bold text-white w-full disabled:opacity-50" style={{ background: B }}>{bulkGenerating ? "Generating…" : `Generate ${bulk.count} Coupons`}</button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap items-center text-xs">
        <span className="text-gray-400">Sort:</span>
        {["redemptions", "total_revenue_cents", "current_usage", "expires_at"].map(f => (
          <button key={f} onClick={() => { setSort(f); setDir(sort === f && dir === "desc" ? "asc" : "desc"); }} className={`px-2 py-1 rounded-lg font-semibold ${sort === f ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:bg-gray-50"}`}>{f.replace(/_/g, " ").replace(" cents", "")} {sort === f ? (dir === "desc" ? "↓" : "↑") : ""}</button>
        ))}
      </div>

      {loading ? <div className="py-8"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map(c => (
            <div key={c.id} data-testid={`card-coupon-${c.id}`} className={`rounded-xl border-2 p-4 ${c.is_expired ? "bg-gray-50 border-gray-200 opacity-60" : c.is_active ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-black font-mono text-indigo-600">{c.code}</span>
                <StaBadge v={c.is_expired ? "inactive" : c.is_active ? "active" : "inactive"} size="xs" />
              </div>
              <p className="text-sm font-bold text-gray-700">{c.discount_type === "percentage" ? `${c.discount_value}% off` : c.discount_type === "fixed_amount" ? zarFmt(Math.round(parseFloat(c.discount_value) * 100)) : `${c.discount_value} free days`}</p>
              {c.target_user_type && c.target_user_type !== "all" && <p className="text-xs text-purple-600 mt-1">🎯 {c.target_user_type.replace(/_/g, " ")} only</p>}
              <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                <p>{c.current_usage}/{c.usage_limit_total || "∞"} used · {c.redemptions} redemptions</p>
                {c.expires_at && <p>Expires: {new Date(c.expires_at).toLocaleDateString("en-ZA")}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: AFFILIATES — Tiered commissions, Finance payout, ROI sorting
// ═══════════════════════════════════════════════════════════════════════════════
function AffiliatesTab() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<number | null>(null);
  const [sort, setSort] = useState("total_commission_earned_cents");
  const [dir, setDir] = useState("desc");
  const [form, setForm] = useState({ affiliate_id: "", affiliate_name: "", affiliate_email: "", commission_type: "percentage", commission_value: "5", payout_method: "bank_transfer" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setAffiliates(await api(`/api/marketing/affiliates?sort=${sort}&dir=${dir}`)); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [sort, dir, toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.affiliate_id) return;
    setCreating(true);
    try {
      const r = await api("/api/marketing/affiliates", { method: "POST", body: JSON.stringify({ ...form, commission_value: parseFloat(form.commission_value) }) });
      toast({ title: "Affiliate added!", description: `Tracking URL: ${r.tracking_url}` });
      setForm({ affiliate_id: "", affiliate_name: "", affiliate_email: "", commission_type: "percentage", commission_value: "5", payout_method: "bank_transfer" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const payout = async (id: number) => {
    setPaying(id);
    try {
      const r = await api(`/api/marketing/affiliates/${id}/payout`, { method: "POST", body: "{}" });
      toast({ title: "Payout approved!", description: r.message });
      load();
    } catch (e: any) { toast({ title: "Payout error", description: e.message, variant: "destructive" }); }
    finally { setPaying(null); }
  };

  const TIER_COLORS: Record<string, string> = { bronze: "#cd7f32", silver: "#94a3b8", gold: GOLD, diamond: B };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="font-bold text-sm mb-3">💼 Add Affiliate — Auto-tiered commission escalation</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
          <Input data-testid="input-affiliate-id" placeholder="Affiliate ID" value={form.affiliate_id} onChange={e => setForm(p => ({ ...p, affiliate_id: e.target.value }))} className="text-sm" />
          <Input placeholder="Name" value={form.affiliate_name} onChange={e => setForm(p => ({ ...p, affiliate_name: e.target.value }))} className="text-sm" />
          <Input placeholder="Email" value={form.affiliate_email} onChange={e => setForm(p => ({ ...p, affiliate_email: e.target.value }))} className="text-sm" />
          <Select value={form.commission_type} onValueChange={v => setForm(p => ({ ...p, commission_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["percentage", "fixed_per_referral", "tiered"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Base commission %" value={form.commission_value} onChange={e => setForm(p => ({ ...p, commission_value: e.target.value }))} className="text-sm" />
          <Select value={form.payout_method} onValueChange={v => setForm(p => ({ ...p, payout_method: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["bank_transfer", "mobile_money", "store_credit"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <p className="text-xs text-green-600 mb-2">✓ Auto-tiered: base → +30% at 10 conv · +60% at 50 conv · +100% at 200 conv</p>
        <button data-testid="button-add-affiliate" onClick={create} disabled={creating || !form.affiliate_id} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: P }}>{creating ? "Adding…" : "+ Add Affiliate"}</button>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap items-center text-xs">
        <span className="text-gray-400">Sort:</span>
        {["total_commission_earned_cents", "total_conversions", "conversion_rate", "total_referrals"].map(f => (
          <button key={f} onClick={() => { setSort(f); setDir(sort === f && dir === "desc" ? "asc" : "desc"); }} className={`px-2 py-1 rounded-lg font-semibold ${sort === f ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}>{f.replace(/_/g, " ").replace(" cents", "")} {sort === f ? (dir === "desc" ? "↓" : "↑") : ""}</button>
        ))}
      </div>

      {loading ? <div className="py-8"><Spinner /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Affiliate</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Tier</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Commission</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Referrals</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Conv. Rate</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Earned</th>
                <th className="px-4 py-2 font-bold text-gray-600 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {affiliates.map(a => (
                <tr key={a.id} data-testid={`row-affiliate-${a.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{a.affiliate_name || a.affiliate_id}</p>
                    <p className="text-xs text-gray-400">{a.payout_method?.replace(/_/g, " ")}</p>
                  </td>
                  <td className="px-4 py-3"><span className="font-black text-sm capitalize" style={{ color: TIER_COLORS[a.tier] || DARK }}>{a.tier}</span></td>
                  <td className="px-4 py-3 text-gray-700">{a.commission_value}{a.commission_type === "percentage" ? "%" : " flat"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.total_referrals} → {a.total_conversions}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: G }}>{pctFmt(a.total_referrals > 0 ? a.total_conversions / a.total_referrals : 0)}</td>
                  <td className="px-4 py-3 font-black" style={{ color: GOLD }}>{zarFmt(a.total_commission_earned_cents)}</td>
                  <td className="px-4 py-3">
                    <button data-testid={`button-payout-${a.id}`} onClick={() => payout(a.id)} disabled={paying === a.id} className="px-3 py-1 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: G }}>{paying === a.id ? "Paying…" : "Payout"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: GAMIFICATION — Badges, Streaks, Leaderboard, Award System
// ═══════════════════════════════════════════════════════════════════════════════
function GamificationTab() {
  const { toast } = useToast();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [sort, setSort] = useState("tier_points");
  const [dir, setDir] = useState("desc");
  const [tierFilter, setTierFilter] = useState("all");
  const [form, setForm] = useState({ user_id: "", points: "50", badge: "", reason: "manual_award", source: "admin" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [board, users] = await Promise.all([
        api("/api/marketing/loyalty/leaderboard"),
        api(`/api/marketing/loyalty?sort=${sort}&dir=${dir}${tierFilter !== "all" ? `&tier=${tierFilter}` : ""}`),
      ]);
      setLeaders(board);
      setAllUsers(users);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [sort, dir, tierFilter, toast]);

  useEffect(() => { load(); }, [load]);

  const award = async () => {
    if (!form.user_id) return;
    setAwarding(true);
    try {
      const r = await api("/api/marketing/loyalty/award", { method: "POST", body: JSON.stringify({ ...form, points: parseInt(form.points) }) });
      toast({ title: "Awarded!", description: r.message });
      setForm({ user_id: "", points: "50", badge: "", reason: "manual_award", source: "admin" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setAwarding(false); }
  };

  const TIER_EMOJI: Record<string, string> = { bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎", diamond: "💠" };
  const TIER_BG: Record<string, string> = { bronze: "#fef3c7", silver: "#f1f5f9", gold: "#fef9c3", platinum: "#e0f2fe", diamond: "#ede9fe" };
  const TIER_TEXT: Record<string, string> = { bronze: "#92400e", silver: "#475569", gold: "#92400e", platinum: "#0369a1", diamond: "#7c3aed" };

  const radarData = [
    { subject: "Referrals", A: allUsers.filter((u: any) => u.referrals_made > 5).length, fullMark: allUsers.length || 1 },
    { subject: "Points", A: allUsers.filter((u: any) => u.tier_points > 500).length, fullMark: allUsers.length || 1 },
    { subject: "Streaks", A: allUsers.filter((u: any) => u.streak_days > 7).length, fullMark: allUsers.length || 1 },
    { subject: "Badges", A: allUsers.filter((u: any) => u.badge_count > 2).length, fullMark: allUsers.length || 1 },
    { subject: "Rewards", A: allUsers.filter((u: any) => u.rewards_value_cents > 0).length, fullMark: allUsers.length || 1 },
  ];

  return (
    <div className="space-y-4">
      {/* Tier Overview */}
      <div className="grid grid-cols-5 gap-2">
        {["bronze", "silver", "gold", "platinum", "diamond"].map(t => {
          const count = allUsers.filter((u: any) => (u.computed_tier || u.tier_name) === t).length;
          return (
            <div key={t} className="rounded-xl p-3 text-center border" style={{ background: TIER_BG[t], borderColor: TIER_TEXT[t] + "30" }}>
              <p className="text-xl">{TIER_EMOJI[t]}</p>
              <p className="text-xs font-black capitalize" style={{ color: TIER_TEXT[t] }}>{t}</p>
              <p className="text-lg font-black" style={{ color: TIER_TEXT[t] }}>{count}</p>
              <p className="text-[9px]" style={{ color: TIER_TEXT[t] }}>users</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Award Points Panel */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="font-bold text-sm mb-3">🏆 Award Points & Badges</p>
          <p className="text-xs text-gray-400 mb-3">Academy integration: course completions auto-award points via hook.</p>
          <div className="space-y-2">
            <Input data-testid="input-award-user" placeholder="User ID" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Points" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))} className="text-sm" />
              <Input placeholder="Badge name (optional)" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} className="text-sm" />
            </div>
            <Select value={form.reason} onValueChange={v => setForm(p => ({ ...p, reason: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["manual_award", "referral_completed", "course_completed", "first_job", "streak_milestone", "top_earner"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <button data-testid="button-award-points" onClick={award} disabled={awarding || !form.user_id} className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>{awarding ? "Awarding…" : "🏆 Award Points & Badge"}</button>
          </div>
        </div>

        {/* Engagement Radar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="font-bold text-sm mb-3">📡 Engagement Radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar dataKey="A" stroke={P} fill={P} fillOpacity={0.3} name="Users" />
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 20 Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="font-bold text-sm">🏆 Loyalty Leaderboard</h3>
          <Select value={tierFilter} onValueChange={v => setTierFilter(v)}>
            <SelectTrigger className="w-32 text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>{["all", "bronze", "silver", "gold", "platinum", "diamond"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          {["tier_points", "streak_days", "referrals_made"].map(f => (
            <button key={f} onClick={() => { setSort(f); setDir(sort === f && dir === "desc" ? "asc" : "desc"); }} className={`text-xs px-2 py-1 rounded-lg font-semibold ${sort === f ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-50"}`}>{f.replace(/_/g, " ")} {sort === f ? (dir === "desc" ? "↓" : "↑") : ""}</button>
          ))}
        </div>
        {loading ? <Spinner /> : (
          <div className="space-y-2">
            {leaders.slice(0, 10).map((u: any, i: number) => (
              <div key={i} data-testid={`row-loyalty-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ background: i === 0 ? GOLD : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : DARK }}>#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">{u.user_id.substring(0, 20)}…</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[9px] capitalize" style={{ color: TIER_TEXT[u.tier_name] || DARK }}>{TIER_EMOJI[u.tier_name]} {u.tier_name}</span>
                    {u.streak_days > 0 && <span className="text-[9px] text-orange-500">🔥 {u.streak_days}d streak</span>}
                    {u.badge_count > 0 && <span className="text-[9px] text-yellow-600">🏅 {u.badge_count} badges</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm" style={{ color: GOLD }}>{u.tier_points.toLocaleString()} pts</p>
                  <p className="text-xs text-gray-400">{u.referrals_made} referrals</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: CREATIVE AI STUDIO
// ═══════════════════════════════════════════════════════════════════════════════
function CreativeStudioTab() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ creative_type: "whatsapp", skill_category: "", target_market: "ZA", campaign_goal: "acquisition" });

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const r = await api("/api/marketing/creative/generate", { method: "POST", body: JSON.stringify(form) });
      setResult(r);
      toast({ title: "Creative generated!", description: `${r.creative_type} · ${r.status}` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎨</span>
          <h3 className="font-black text-gray-800">Creative AI Studio</h3>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-pink-500">SUPERPOWER #9</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Auto-generates video scripts, WhatsApp templates, banner copy, and SMS from live gig/skill data. No competitor has marketplace-context creative generation.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Select value={form.creative_type} onValueChange={v => setForm(p => ({ ...p, creative_type: v }))}>
            <SelectTrigger data-testid="select-creative-type"><SelectValue placeholder="Format" /></SelectTrigger>
            <SelectContent>{[{ v: "whatsapp", l: "WhatsApp Template" }, { v: "banner", l: "Banner Ad" }, { v: "video_script", l: "Video Script" }, { v: "sms", l: "SMS (160 chars)" }].map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
          </Select>
          <Input data-testid="input-skill-category" placeholder="Skill category (optional)" value={form.skill_category} onChange={e => setForm(p => ({ ...p, skill_category: e.target.value }))} className="text-sm" />
          <Select value={form.target_market} onValueChange={v => setForm(p => ({ ...p, target_market: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["ZA", "NG", "KE", "GH", "GLOBAL"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.campaign_goal} onValueChange={v => setForm(p => ({ ...p, campaign_goal: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["acquisition", "retention"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <button data-testid="button-generate-creative" onClick={generate} disabled={generating} className="px-5 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50 w-full md:w-auto" style={{ background: `linear-gradient(135deg, #ec4899, #8b5cf6)` }}>{generating ? "Generating…" : "🎨 Generate Creative"}</button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Generated: {result.creative_type.replace(/_/g, " ")} · {result.skill_category || "General"} · {result.target_market}</h3>
            <div className="flex gap-2">
              <StaBadge v="active" />
              <span className="text-xs text-orange-600 font-semibold">Moderation ID: {result.moderation_id}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            {result.creative_type === "whatsapp" && result.content && (
              <div>
                {result.content.header && <p className="font-black text-gray-800 mb-2">{result.content.header}</p>}
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.content.body}</pre>
                {result.content.cta && <p className="text-sm text-blue-600 mt-2 font-semibold">🔗 {result.content.cta}</p>}
                {result.content.ussd_fallback && <p className="text-sm text-green-700 mt-1 font-mono">📱 No smartphone? Dial: {result.content.ussd_fallback}</p>}
              </div>
            )}
            {result.creative_type === "banner" && result.content && (
              <div>
                <p className="text-xl font-black text-gray-800">{result.content.headline}</p>
                <p className="text-sm text-gray-500 mt-1">{result.content.subheadline}</p>
                <div className="mt-3 inline-block px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ background: result.content.colors?.cta_bg || GOLD }}>{result.content.cta_text}</div>
                <p className="text-xs text-gray-400 mt-2">Sizes: {(result.content.dimensions || []).join(" · ")}</p>
              </div>
            )}
            {result.creative_type === "video_script" && result.content && (
              <div className="space-y-2">
                {[{ l: "Hook", v: result.content.hook }, { l: "Problem", v: result.content.problem }, { l: "Solution", v: result.content.solution }, { l: "Proof", v: result.content.proof }, { l: "CTA", v: result.content.cta }].map(s => (
                  s.v ? <div key={s.l}><span className="text-xs font-black text-indigo-500 uppercase">{s.l}: </span><span className="text-sm text-gray-700">{s.v}</span></div> : null
                ))}
                <p className="text-xs text-gray-400 mt-2">Duration: {result.content.duration_seconds}s</p>
              </div>
            )}
            {result.creative_type === "sms" && result.content && (
              <div>
                <p className="text-sm text-gray-700 font-mono leading-relaxed">{result.content.message}</p>
                <p className="text-xs text-gray-400 mt-2">{result.content.character_count} chars</p>
              </div>
            )}
          </div>
          <p className="text-xs text-orange-500 mt-3">{result.ai_note}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: AFRICA HUB — USSD, Mobile Money, WhatsApp Blast
// ═══════════════════════════════════════════════════════════════════════════════
function AfricaHubTab() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blasting, setBlasting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [waForm, setWaForm] = useState({ phone_numbers: "", template_name: "acquisition" });
  const [mmForm, setMmForm] = useState({ phone: "", amount_cents: "5000", provider: "mpesa", referral_code: "" });

  useEffect(() => {
    api("/api/marketing/africa/stats").then(setStats).catch(() => null).finally(() => setLoading(false));
  }, []);

  const blast = async () => {
    const phones = waForm.phone_numbers.split(",").map(p => p.trim()).filter(Boolean);
    if (!phones.length) return toast({ title: "Enter at least one phone number", variant: "destructive" });
    setBlasting(true);
    try {
      const r = await api("/api/marketing/africa/whatsapp-blast", { method: "POST", body: JSON.stringify({ ...waForm, phone_numbers: phones }) });
      toast({ title: `WA Blast dispatched!`, description: `${r.dispatched} messages queued` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setBlasting(false); }
  };

  const mobileMoneyPay = async () => {
    if (!mmForm.phone) return;
    setPaying(true);
    try {
      const r = await api("/api/marketing/africa/mobile-money-payout", { method: "POST", body: JSON.stringify({ ...mmForm, amount_cents: parseInt(mmForm.amount_cents) }) });
      toast({ title: `Mobile Money payout initiated!`, description: `R${(parseInt(mmForm.amount_cents) / 100).toFixed(2)} to ${mmForm.phone} via ${mmForm.provider}` });
      setMmForm({ phone: "", amount_cents: "5000", provider: "mpesa", referral_code: "" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      {/* Africa Banner */}
      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #059669, #065f46)" }}>
        <h3 className="font-black text-white text-lg mb-1">🌍 Africa-Optimised Viral Flows</h3>
        <p className="text-green-200 text-sm">Built for Africa's 800M feature-phone users. No competitor has USSD-native referral flows or instant mobile-money bonus payouts.</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { l: "USSD Codes Active", v: stats?.ussd_referrals?.length || 0, icon: "📱" },
            { l: "Zero-Data Signups", v: stats?.zero_data_signups || 0, icon: "📶" },
            { l: "Africa Markets", v: (stats?.africa_markets?.length || 8) + " countries", icon: "🗺️" },
          ].map(m => (
            <div key={m.l} className="text-center">
              <p className="text-2xl">{m.icon}</p>
              <p className="text-xl font-black text-white">{m.v}</p>
              <p className="text-green-300 text-xs">{m.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* USSD Menu Display */}
      {stats?.ussd_flow && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold text-sm mb-3">📱 USSD Menu Flow</h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono">
            <p className="text-green-400 font-bold mb-2">{stats.ussd_flow.main_code}</p>
            {(stats.ussd_flow.menu || []).map((item: string, i: number) => (
              <p key={i} className="text-green-300 text-sm">{item}</p>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">No smartphone required · Works on any GSM network · Available in ZA, NG, KE, GH, UG, TZ, ZW, ZM</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WhatsApp Blast */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💬</span>
            <h3 className="font-bold text-sm">WhatsApp Business Blast</h3>
          </div>
          <div className="space-y-2">
            <Textarea data-testid="input-wa-phones" placeholder="Phone numbers (comma-separated): +27821234567, +27831234567…" value={waForm.phone_numbers} onChange={e => setWaForm(p => ({ ...p, phone_numbers: e.target.value }))} rows={3} className="text-sm" />
            <Select value={waForm.template_name} onValueChange={v => setWaForm(p => ({ ...p, template_name: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["acquisition", "retention", "referral_reminder", "win_back"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <button data-testid="button-wa-blast" onClick={blast} disabled={blasting} className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#25D366" }}>{blasting ? "Dispatching…" : "💬 Send WhatsApp Blast"}</button>
          </div>
        </div>

        {/* Mobile Money Payout */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💸</span>
            <h3 className="font-bold text-sm">Mobile Money Instant Payout</h3>
          </div>
          <div className="space-y-2">
            <Input data-testid="input-mm-phone" placeholder="Phone number (+27...)" value={mmForm.phone} onChange={e => setMmForm(p => ({ ...p, phone: e.target.value }))} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Amount (cents)" value={mmForm.amount_cents} onChange={e => setMmForm(p => ({ ...p, amount_cents: e.target.value }))} className="text-sm" />
              <Select value={mmForm.provider} onValueChange={v => setMmForm(p => ({ ...p, provider: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[{ v: "mpesa", l: "M-PESA (KE/TZ)" }, { v: "mtn_momo", l: "MTN MoMo (NG/GH)" }, { v: "airtel_money", l: "Airtel Money (UG/ZM)" }].map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Referral code (optional)" value={mmForm.referral_code} onChange={e => setMmForm(p => ({ ...p, referral_code: e.target.value }))} className="text-sm" />
            <button data-testid="button-mm-payout" onClick={mobileMoneyPay} disabled={paying || !mmForm.phone} className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#f59e0b" }}>{paying ? "Processing…" : "💸 Send Mobile Money"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8: PREDICTIVE ENGINE — LTV, Churn, 5-Year Growth Forecast
// ═══════════════════════════════════════════════════════════════════════════════
function PredictiveTab() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [form, setForm] = useState({ user_id: "", days_since_active: "0", total_orders: "0", total_spent_cents: "0", campaign_engagement: "0", loyalty_tier: "bronze" });

  useEffect(() => {
    api("/api/marketing/predictive/dashboard").then(setDashboard).catch(() => null).finally(() => setLoading(false));
  }, []);

  const score = async () => {
    if (!form.user_id) return;
    setScoring(true);
    try {
      const r = await api("/api/marketing/predictive/score-user", { method: "POST", body: JSON.stringify({ ...form, days_since_active: parseInt(form.days_since_active), total_orders: parseInt(form.total_orders), total_spent_cents: parseInt(form.total_spent_cents), campaign_engagement: parseInt(form.campaign_engagement) }) });
      setScoreResult(r);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setScoring(false); }
  };

  if (loading) return <div className="py-8"><Spinner /></div>;

  const chartData = (dashboard?.growth_scenarios || []).map((s: any) => ({ name: s.name, Y3: s.months_36, Y5: s.users_y5, growth: s.monthly_growth * 100 }));
  const churnRiskColor = (risk: number) => risk > 60 ? R : risk > 30 ? GOLD : G;

  return (
    <div className="space-y-4">
      {/* K-Factor + Viral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Viral Coefficient" value={Number(dashboard?.viral_coefficient || 0).toFixed(2)} sub={dashboard?.viral_coefficient >= 1.0 ? "🚀 Viral growth active" : "⚠️ Below viral threshold"} color={dashboard?.viral_coefficient >= 1.0 ? G : R} icon="📈" />
        <MetricCard label="Avg LTV (Gold Tier)" value="R8,500" sub="36-month horizon · model v3.0" color={GOLD} icon="💰" />
        <MetricCard label="Churn Risk Threshold" value="30 days" sub="Auto win-back trigger activated" color={B} icon="⚠️" />
      </div>

      {/* 5-Year Growth Scenarios */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm mb-4">📊 5-Year Growth Forecast — 3 Scenarios</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: any) => numFmt(Number(v))} contentStyle={{ fontSize: 11 }} />
            <Legend />
            <Bar dataKey="Y3" name="Users at Year 3" fill={B} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Y5" name="Users at Year 5" fill={G} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Scorer */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span>🎯</span>
          <h3 className="font-bold text-sm">Churn Risk + LTV Scorer</h3>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-600">AI MODEL</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          <Input data-testid="input-score-user" placeholder="User ID" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))} className="text-sm" />
          <Input type="number" placeholder="Days since active" value={form.days_since_active} onChange={e => setForm(p => ({ ...p, days_since_active: e.target.value }))} className="text-sm" />
          <Input type="number" placeholder="Total orders" value={form.total_orders} onChange={e => setForm(p => ({ ...p, total_orders: e.target.value }))} className="text-sm" />
          <Input type="number" placeholder="Total spent (cents)" value={form.total_spent_cents} onChange={e => setForm(p => ({ ...p, total_spent_cents: e.target.value }))} className="text-sm" />
          <Input type="number" placeholder="Campaign engagement" value={form.campaign_engagement} onChange={e => setForm(p => ({ ...p, campaign_engagement: e.target.value }))} className="text-sm" />
          <Select value={form.loyalty_tier} onValueChange={v => setForm(p => ({ ...p, loyalty_tier: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["bronze", "silver", "gold", "platinum", "diamond"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <button data-testid="button-score-user" onClick={score} disabled={scoring || !form.user_id} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: DARK }}>{scoring ? "Scoring…" : "🎯 Run Predictive Score"}</button>

        {scoreResult && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: churnRiskColor(scoreResult.churn_risk) + "20" }}>
              <p className="text-xs font-semibold text-gray-500 uppercase">Churn Risk</p>
              <p className="text-2xl font-black" style={{ color: churnRiskColor(scoreResult.churn_risk) }}>{scoreResult.churn_risk}/100</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-yellow-50">
              <p className="text-xs font-semibold text-gray-500 uppercase">Predicted LTV</p>
              <p className="text-2xl font-black" style={{ color: GOLD }}>{zarFmt(scoreResult.ltv_cents)}</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-blue-50">
              <p className="text-xs font-semibold text-gray-500 uppercase">Growth Score</p>
              <p className="text-2xl font-black" style={{ color: B }}>{scoreResult.growth_potential}/100</p>
            </div>
            {scoreResult.recommendations?.length > 0 && (
              <div className="col-span-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-600 mb-2">🤖 AI Recommendations:</p>
                {scoreResult.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600 flex gap-2 mb-1">
                    <span className="font-semibold text-indigo-600">{rec.type.replace(/_/g, " ")}:</span>
                    <span>{rec.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 9: FULL ANALYTICS — ROI, Funnel, Channel Performance, 30-day Growth
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [form, setForm] = useState({ new_users: "0", referral_signups: "0", campaign_conversions: "0", affiliate_conversions: "0", churn_rate: "0" });

  const load = useCallback(() => {
    setLoading(true);
    api("/api/marketing/analytics").then(setData).catch(e => toast({ title: "Error", description: e.message, variant: "destructive" })).finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const record = async () => {
    setRecording(true);
    try {
      await api("/api/marketing/analytics/record-daily", { method: "POST", body: JSON.stringify({ new_users: parseInt(form.new_users), referral_signups: parseInt(form.referral_signups), campaign_conversions: parseInt(form.campaign_conversions), affiliate_conversions: parseInt(form.affiliate_conversions), churn_rate: parseFloat(form.churn_rate) }) });
      toast({ title: "Daily metrics recorded!" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setRecording(false); }
  };

  if (loading) return <div className="py-8"><Spinner /></div>;
  if (!data) return null;

  const funnelData = [
    { name: "Reached", value: data.campaign_summary.reached, fill: B },
    { name: "Opened", value: data.campaign_summary.opens, fill: P },
    { name: "Clicked", value: data.campaign_summary.clicks, fill: GOLD },
    { name: "Converted", value: data.campaign_summary.conversions, fill: G },
  ];

  return (
    <div className="space-y-4">
      {/* Hero ROI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Revenue" value={zarFmt(data.overall.total_revenue_cents)} sub="30-day campaigns + affiliates" color={G} icon="💰" />
        <MetricCard label="Total Spent" value={zarFmt(data.overall.total_spent_cents)} sub="bonuses + commissions" color={R} icon="📤" />
        <MetricCard label="Overall ROI" value={`${data.overall.roi_pct}%`} sub="(Revenue - Spent) / Spent" color={GOLD} icon="📈" />
        <MetricCard label="Viral Coefficient" value={Number(data.overall.viral_coefficient).toFixed(2)} sub={data.overall.viral_coefficient >= 1.0 ? "🚀 Viral!" : "Below viral"} color={data.overall.viral_coefficient >= 1.0 ? G : R} icon="🔄" />
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Campaigns", sent: data.campaign_summary.sent, reach: data.campaign_summary.reached, conv: data.campaign_summary.conversions, rev: data.campaign_summary.revenue, color: B },
          { label: "Referrals", sent: data.referral_summary.active, reach: data.referral_summary.conversions, conv: data.referral_summary.conversions, rev: data.referral_summary.spent, color: G },
          { label: "Affiliates", sent: data.affiliate_summary.total, reach: data.affiliate_summary.conversions, conv: data.affiliate_summary.conversions, rev: data.affiliate_summary.paid, color: P },
        ].map(ch => (
          <div key={ch.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="font-bold text-sm mb-3" style={{ color: ch.color }}>{ch.label}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Active/Sent</span><span className="font-bold">{numFmt(ch.sent)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Conversions</span><span className="font-bold" style={{ color: G }}>{numFmt(ch.conv)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Revenue/Paid</span><span className="font-bold" style={{ color: GOLD }}>{zarFmt(ch.rev)}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm mb-4">🔄 Campaign Funnel Attribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <FunnelChart>
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => numFmt(Number(v))} />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList position="center" fill="#fff" stroke="none" dataKey="name" style={{ fontSize: 11, fontWeight: "bold" }} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      {/* 30-day Growth Trend */}
      {data.daily_metrics.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4">📅 30-Day Growth Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data.daily_metrics.slice(-30)}>
              <defs>
                {[{ id: "nu", c: G }, { id: "cc", c: GOLD }, { id: "ac", c: P }].map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric_date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="new_users" stroke={G} fill="url(#nu)" name="New Users" />
              <Area type="monotone" dataKey="campaign_conversions" stroke={GOLD} fill="url(#cc)" name="Campaign Conv." />
              <Area type="monotone" dataKey="affiliate_conversions" stroke={P} fill="url(#ac)" name="Affiliate Conv." />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Record Daily Metrics */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="font-bold text-sm mb-3">📝 Record Today's Growth Snapshot</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          {[
            { k: "new_users", l: "New Users" }, { k: "referral_signups", l: "Ref. Signups" },
            { k: "campaign_conversions", l: "Camp. Conv." }, { k: "affiliate_conversions", l: "Aff. Conv." },
            { k: "churn_rate", l: "Churn Rate %" },
          ].map(f => (
            <div key={f.k}>
              <p className="text-xs text-gray-400 mb-1">{f.l}</p>
              <Input type="number" value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} className="text-sm" />
            </div>
          ))}
        </div>
        <button data-testid="button-record-metrics" onClick={record} disabled={recording} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: DARK }}>{recording ? "Recording…" : "📊 Record Daily Snapshot"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 10: INTEGRATION HOOKS — All systems connected
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrationsTab() {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targeting, setTargeting] = useState(false);
  const [skillForm, setSkillForm] = useState({ skill_category: "", campaign_type: "referral_push", bonus_multiplier: "1.5" });
  const [targetResult, setTargetResult] = useState<any>(null);

  useEffect(() => {
    api("/api/marketing/integrations/status").then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  const targetBySkill = async () => {
    setTargeting(true);
    setTargetResult(null);
    try {
      const r = await api("/api/marketing/integrations/target-by-skill", { method: "POST", body: JSON.stringify({ ...skillForm, bonus_multiplier: parseFloat(skillForm.bonus_multiplier) }) });
      setTargetResult(r);
      toast({ title: "Skill targeting ready!", description: r.action });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setTargeting(false); }
  };

  const INT_ICONS: Record<string, string> = {
    "Category & Skill Management": "🏷️",
    "Notification Engine": "🔔",
    "Promotion System": "📣",
    "Content Moderation": "🛡️",
    "Report & Abuse": "⚠️",
    "Academy": "🎓",
    "Finance Escrow": "💳",
  };

  return (
    <div className="space-y-4">
      {/* Integration Status Grid */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span>🔗</span>
          <h3 className="font-black text-gray-800">Full Integration Hooks</h3>
          {status && <span className="ml-auto text-xs text-green-600 font-bold">{status.total_connected}/7 Connected</span>}
        </div>
        <p className="text-xs text-gray-400 mb-4">Marketing system is the growth nerve-centre. Every other admin section feeds into or is triggered by Marketing. No competitor has this level of cross-system integration.</p>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(status?.integrations || []).map((int: any) => (
              <div key={int.name} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                <span className="text-xl mt-0.5">{INT_ICONS[int.name] || "🔌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-800">{int.name}</p>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: int.status === "connected" ? G : R }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{int.hook}</p>
                  <p className="text-[10px] font-mono text-indigo-400 mt-1">{int.endpoint}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill-Based Auto-Targeting */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span>🏷️</span>
          <h3 className="font-bold text-sm">Category/Skill Auto-Targeting</h3>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-green-600">SUPERPOWER #21</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Pulls trending skills from Category & Skill Management and auto-creates targeted campaigns. Out-engineers all platforms that use generic blasts.</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Input data-testid="input-skill-target" placeholder="Skill (blank = trending)" value={skillForm.skill_category} onChange={e => setSkillForm(p => ({ ...p, skill_category: e.target.value }))} className="text-sm" />
          <Select value={skillForm.campaign_type} onValueChange={v => setSkillForm(p => ({ ...p, campaign_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["referral_push", "newsletter", "win_back", "skill_match"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Bonus multiplier" value={skillForm.bonus_multiplier} onChange={e => setSkillForm(p => ({ ...p, bonus_multiplier: e.target.value }))} className="text-sm" step="0.1" />
        </div>
        <button data-testid="button-target-by-skill" onClick={targetBySkill} disabled={targeting} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: G }}>{targeting ? "Targeting…" : "🏷️ Auto-Target by Skill"}</button>
        {targetResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-black text-green-700">{targetResult.action}</p>
            <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
              <div className="text-center"><p className="text-gray-400">Skill</p><p className="font-bold text-gray-700">{targetResult.skill}</p></div>
              <div className="text-center"><p className="text-gray-400">Est. Audience</p><p className="font-bold" style={{ color: B }}>{numFmt(targetResult.estimated_audience)}</p></div>
              <div className="text-center"><p className="text-gray-400">Bonus Multiplier</p><p className="font-bold" style={{ color: GOLD }}>{targetResult.bonus_multiplier}×</p></div>
            </div>
          </div>
        )}
      </div>

      {/* Competitor Comparison */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm mb-4">🏆 FreelanceSkills Marketing — Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-bold text-gray-600">Feature</th>
                <th className="px-3 py-2 text-center font-bold" style={{ color: G }}>FreelanceSkills</th>
                <th className="px-3 py-2 text-center font-bold text-gray-400">Platform A</th>
                <th className="px-3 py-2 text-center font-bold text-gray-400">Platform B</th>
                <th className="px-3 py-2 text-center font-bold text-gray-400">Platform C</th>
                <th className="px-3 py-2 text-center font-bold text-gray-400">Platform D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["Agentic AI Campaign Brain", "✅ Full", "❌", "❌", "❌", "❌"],
                ["Predictive LTV + Churn Score", "✅ Real-time", "❌", "❌", "Partial", "❌"],
                ["Viral Coefficient Tracking", "✅ k-factor", "❌", "❌", "❌", "❌"],
                ["Blockchain Referral Proof", "✅ SHA256", "❌", "❌", "❌", "❌"],
                ["USSD Referral Flows", "✅ Feature-phone", "❌", "❌", "❌", "❌"],
                ["Mobile Money Payouts", "✅ Instant", "❌", "❌", "❌", "❌"],
                ["Multi-tier Affiliate Escalation", "✅ Auto", "❌", "Partial", "❌", "❌"],
                ["Cross-system Integration Hooks", "✅ 7 systems", "❌", "❌", "1", "❌"],
                ["Gamification + Loyalty Tiers", "✅ 5 tiers", "❌", "❌", "❌", "Partial"],
                ["Creative AI Studio", "✅ 4 formats", "❌", "❌", "❌", "❌"],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-700">{row[0]}</td>
                  <td className="px-3 py-2 text-center font-bold" style={{ color: G }}>{row[1]}</td>
                  {row.slice(2).map((v, j) => <td key={j} className="px-3 py-2 text-center text-gray-400">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL — 10 Tabs
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "ai_brain", label: "🤖 AI Brain", component: AIBrainTab },
  { id: "referrals", label: "🎯 Referrals", component: ReferralsTab },
  { id: "coupons", label: "🎟️ Coupons", component: CouponsTab },
  { id: "affiliates", label: "💼 Affiliates", component: AffiliatesTab },
  { id: "gamification", label: "🎮 Gamification", component: GamificationTab },
  { id: "creative", label: "🎨 Creative AI", component: CreativeStudioTab },
  { id: "africa", label: "🌍 Africa Hub", component: AfricaHubTab },
  { id: "predictive", label: "📡 Predictive", component: PredictiveTab },
  { id: "analytics", label: "📊 Analytics", component: AnalyticsTab },
  { id: "integrations", label: "🔗 Integrations", component: IntegrationsTab },
];

export default function MarketingSystem() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ai_brain");
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || AIBrainTab;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-100 shadow-sm" style={{ background: DARK }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-white transition-colors text-sm">← Admin</button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg leading-none">💰 Marketing System <span className="text-green-400 text-xs font-semibold ml-2">v3.0</span></h1>
            <p className="text-gray-400 text-xs mt-0.5">Africa-First Marketing Intelligence · 30 Superpowers</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p className="font-semibold text-white">{user?.username}</p>
            <p>Admin</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? "border-green-400 text-green-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <ActiveComponent />
      </div>
    </div>
  );
}

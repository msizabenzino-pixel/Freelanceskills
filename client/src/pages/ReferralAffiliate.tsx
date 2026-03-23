/**
 * Section 36 — Referral & Affiliate System v4.0 — FreelanceSkills.net
 * 400% ELON MUSK GOD-MODE
 * Referral Tracking · Commission Tiers · Payout Engine · Campaign Builder
 * A/B Testing · Fraud Detection · Leaderboard · Africa-First
 * Beats Impact.com + ShareASale + PartnerStack + Tapfiliate + Rewardful until 2030
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

interface Referral { id: string; code: string; affiliateId: string; affiliateName: string; referredName: string; plan: string; value: number; commission: number; tier: string; status: "pending" | "converted" | "rejected"; ts: string; fraudFlag: boolean; region: string }
interface Commission { id: string; affiliateId: string; affiliateName: string; amount: number; status: "pending" | "approved" | "paid"; ts: string; paidAt?: string; paymentRef?: string }
interface Campaign { id: string; name: string; type: string; code: string; discount: number; commissionRate: number; bonusOnFirst: number; uses: number; conversions: number; revenue: number; active: boolean; abTest?: { variantA: string; variantB: string; splitPct: number; winnerConv?: number } }
interface Tier { id: string; name: string; minReferrals: number; rate: number; bonus: number; perks: string[] }
interface FraudFlag { id: string; affiliateId: string; type: string; severity: string; details: string; ts: string; resolved: boolean }
interface LeaderEntry { rank: number; id: string; name: string; conversions: number; revenue: number; commissions: number; tier: string; region: string }

const TABS = ["dashboard", "referrals", "commissions", "campaigns", "leaderboard", "fraud"] as const;
type Tab = typeof TABS[number];

const statusColor = (s: string) => s === "converted" ? { bg: "rgba(29,191,115,0.15)", text: "#1DBF73" } : s === "pending" ? { bg: "rgba(234,179,8,0.15)", text: "#eab308" } : { bg: "rgba(239,68,68,0.15)", text: "#ef4444" };
const severityColor = (s: string) => s === "critical" ? "#ef4444" : s === "high" ? "#f97316" : "#eab308";

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: bg, color }}>{label}</span>;
}

function StatCard({ label, value, sub, color = "#1DBF73", icon }: { label: string; value: string | number; sub?: string; color?: string; icon: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function TabBtn({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className="relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
      style={{ background: active ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: active ? "#1DBF73" : "#9ca3af", border: active ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
      {label}
      {badge ? <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">{badge}</span> : null}
    </button>
  );
}

export default function ReferralAffiliate() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: "", type: "referral", discount: 10, commissionRate: 12, bonusOnFirst: 0 });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({ queryKey: ["/api/referrals/dashboard"], queryFn: () => fetch("/api/referrals/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000, refetchInterval: 30000 });
  const { data: referralData } = useQuery({ queryKey: ["/api/referrals/list"], queryFn: () => fetch("/api/referrals/list?limit=30", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "referrals" });
  const { data: commissionData } = useQuery({ queryKey: ["/api/referrals/commissions"], queryFn: () => fetch("/api/referrals/commissions", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "commissions" });
  const { data: campaignData } = useQuery({ queryKey: ["/api/referrals/campaigns"], queryFn: () => fetch("/api/referrals/campaigns", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "campaigns" });
  const { data: leaderData } = useQuery({ queryKey: ["/api/referrals/leaderboard"], queryFn: () => fetch("/api/referrals/leaderboard", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "leaderboard" });
  const { data: fraudData } = useQuery({ queryKey: ["/api/referrals/fraud-flags"], queryFn: () => fetch("/api/referrals/fraud-flags", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "fraud" });
  const { data: tierData } = useQuery({ queryKey: ["/api/referrals/tiers"], queryFn: () => fetch("/api/referrals/tiers", { credentials: "include" }).then(r => r.json()), staleTime: 60000 });

  const approveMut = useMutation({ mutationFn: (id: string) => fetch(`/api/referrals/commissions/${id}/approve`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Commission approved ✓" }); qc.invalidateQueries({ queryKey: ["/api/referrals/commissions"] }); } });
  const payMut = useMutation({ mutationFn: (id: string) => fetch(`/api/referrals/commissions/${id}/pay`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Commission marked paid ✓" }); qc.invalidateQueries({ queryKey: ["/api/referrals/commissions"] }); } });
  const processMut = useMutation({ mutationFn: () => fetch("/api/referrals/payouts/process", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "payfast" }) }).then(r => r.json()), onSuccess: (d: any) => { toast({ title: `Payout processed: R${(d.totalZar / 100).toFixed(2)}` }); qc.invalidateQueries({ queryKey: ["/api/referrals/commissions"] }); } });
  const createCampMut = useMutation({ mutationFn: (data: any) => fetch("/api/referrals/campaigns", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { toast({ title: "Campaign created ✓" }); setShowNewCampaign(false); qc.invalidateQueries({ queryKey: ["/api/referrals/campaigns"] }); } });
  const resolveFraudMut = useMutation({ mutationFn: (id: string) => fetch(`/api/referrals/fraud-flags/${id}/resolve`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Fraud flag resolved ✓" }); qc.invalidateQueries({ queryKey: ["/api/referrals/fraud-flags"] }); } });

  const d = (dashboard as any) || {};
  const tiers = (tierData as any)?.tiers || [];
  const fraudUnresolved = (fraudData as any)?.unresolved || 0;

  const tierBadgeColor = (name: string) => name === "Platinum" ? "#E5E4E2" : name === "Gold" ? "#FFD700" : name === "Silver" ? "#C0C0C0" : "#CD7F32";

  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Referral &amp; Affiliate System</h1>
          <p className="text-sm text-gray-500">Commission Tiers · Payout Engine · Campaign Builder · A/B Testing · Fraud Detection</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Referrals" value={d.totalReferrals || 0} sub={`${d.convRate || "0%"} conv rate`} icon="🔗" />
          <StatCard label="Revenue Generated" value={`R${((d.totalRevenueZar || 0) / 100).toLocaleString()}`} icon="💰" color="#1DBF73" />
          <StatCard label="Commissions Owed" value={`R${((d.pendingPayoutsZar || 0) / 100).toLocaleString()}`} icon="💸" color="#eab308" />
          <StatCard label="Active Affiliates" value={d.activeAffiliates || 0} sub={`${d.activeCampaigns || 0} campaigns`} icon="👥" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map(t => <TabBtn key={t} label={t === "dashboard" ? "📊 Dashboard" : t === "referrals" ? "🔗 Referrals" : t === "commissions" ? "💸 Commissions" : t === "campaigns" ? "📣 Campaigns" : t === "leaderboard" ? "🏆 Leaderboard" : "🚨 Fraud"} active={tab === t} onClick={() => setTab(t)} badge={t === "fraud" ? fraudUnresolved || undefined : undefined} />)}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Commission Tiers */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Commission Tier Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tiers.map((tier: Tier) => (
                  <div key={tier.id} className="rounded-xl p-4" style={{ background: `${tierBadgeColor(tier.name)}12`, border: `1px solid ${tierBadgeColor(tier.name)}30` }}>
                    <div className="text-xl font-bold mb-1" style={{ color: tierBadgeColor(tier.name) }}>{tier.name}</div>
                    <div className="text-3xl font-black text-white mb-1">{tier.rate}%</div>
                    <div className="text-xs text-gray-500 mb-2">from {tier.minReferrals} referrals</div>
                    {tier.bonus > 0 && <div className="text-xs font-bold text-emerald-400 mb-2">+R{tier.bonus} bonus</div>}
                    <div className="space-y-1">
                      {tier.perks.map((p, i) => <div key={i} className="text-xs text-gray-500">✓ {p}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Paid Out" value={`R${((d.paidOutZar || 0) / 100).toLocaleString()}`} icon="✅" color="#1DBF73" />
              <StatCard label="Total Commissions" value={`R${((d.totalCommissionsZar || 0) / 100).toLocaleString()}`} icon="📊" />
              <StatCard label="Fraud Alerts" value={d.fraudAlerts || 0} icon="🚨" color={d.fraudAlerts > 0 ? "#ef4444" : "#1DBF73"} />
              <StatCard label="Converted" value={d.converted || 0} icon="🎯" />
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {tab === "referrals" && (
          <div className="space-y-2">
            {((referralData as any)?.referrals || []).map((r: Referral) => {
              const sc = statusColor(r.status);
              return (
                <div key={r.id} data-testid={`referral-${r.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-blue-400">{r.code}</span>
                        <Pill label={r.status} bg={sc.bg} color={sc.text} />
                        <Pill label={r.tier} bg={`${tierBadgeColor(r.tier)}20`} color={tierBadgeColor(r.tier)} />
                        {r.fraudFlag && <Pill label="⚠ Fraud" bg="rgba(239,68,68,0.15)" color="#ef4444" />}
                      </div>
                      <div className="text-sm font-semibold text-white">{r.affiliateName} → {r.referredName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.plan} · R{(r.value / 100).toFixed(0)} · Commission: R{(r.commission / 100).toFixed(0)} · {r.region}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{formatDistanceToNow(new Date(r.ts), { addSuffix: true })}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Commissions Tab */}
        {tab === "commissions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Pending", value: `R${(((commissionData as any)?.summary?.pending || 0) / 100).toLocaleString()}`, color: "#eab308" },
                { label: "Approved", value: `R${(((commissionData as any)?.summary?.approved || 0) / 100).toLocaleString()}`, color: "#6366f1" },
                { label: "Paid", value: `R${(((commissionData as any)?.summary?.paid || 0) / 100).toLocaleString()}`, color: "#1DBF73" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mb-2">
              <button data-testid="btn-process-payouts" onClick={() => processMut.mutate()} disabled={processMut.isPending} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: "#1DBF73" }}>
                {processMut.isPending ? "Processing..." : "⚡ Batch Payout via PayFast"}
              </button>
            </div>
            <div className="space-y-2">
              {((commissionData as any)?.commissions || []).map((c: Commission) => {
                const sc = statusColor(c.status);
                return (
                  <div key={c.id} data-testid={`commission-${c.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">R{(c.amount / 100).toFixed(2)}</span>
                          <Pill label={c.status} bg={sc.bg} color={sc.text} />
                        </div>
                        <div className="text-xs text-gray-500">{c.affiliateName} · {formatDistanceToNow(new Date(c.ts), { addSuffix: true })}</div>
                        {c.paymentRef && <div className="text-xs text-gray-600 mt-0.5 font-mono">{c.paymentRef}</div>}
                      </div>
                      <div className="flex gap-2">
                        {c.status === "pending" && <button data-testid={`approve-${c.id}`} onClick={() => approveMut.mutate(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#6366f1" }}>Approve</button>}
                        {c.status === "approved" && <button data-testid={`pay-${c.id}`} onClick={() => payMut.mutate(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#1DBF73" }}>Mark Paid</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-2">
              <button data-testid="btn-new-campaign" onClick={() => setShowNewCampaign(!showNewCampaign)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1DBF73" }}>
                + New Campaign
              </button>
            </div>
            {showNewCampaign && (
              <div className="rounded-2xl p-6 mb-4" style={{ background: "rgba(29,191,115,0.05)", border: "1px solid rgba(29,191,115,0.2)" }}>
                <h4 className="text-sm font-bold text-white mb-4">Create Campaign</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Campaign Name</label>
                    <input data-testid="input-camp-name" value={newCamp.name} onChange={e => setNewCamp({ ...newCamp, name: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-900 border border-gray-700" placeholder="Summer Launch 2025" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Type</label>
                    <select data-testid="select-camp-type" value={newCamp.type} onChange={e => setNewCamp({ ...newCamp, type: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-900 border border-gray-700">
                      <option value="referral">Referral</option>
                      <option value="affiliate">Affiliate</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Commission Rate (%)</label>
                    <input data-testid="input-camp-rate" type="number" value={newCamp.commissionRate} onChange={e => setNewCamp({ ...newCamp, commissionRate: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-900 border border-gray-700" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Discount (%)</label>
                    <input data-testid="input-camp-discount" type="number" value={newCamp.discount} onChange={e => setNewCamp({ ...newCamp, discount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-900 border border-gray-700" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button data-testid="btn-create-campaign" onClick={() => createCampMut.mutate(newCamp)} disabled={!newCamp.name} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1DBF73" }}>Create Campaign</button>
                  <button onClick={() => setShowNewCampaign(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-gray-800">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((campaignData as any)?.campaigns || []).map((c: Campaign) => (
                <div key={c.id} data-testid={`campaign-${c.id}`} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-base font-bold text-white">{c.name}</div>
                      <div className="flex gap-2 mt-1">
                        <Pill label={c.type} bg="rgba(99,102,241,0.15)" color="#6366f1" />
                        <Pill label={c.active ? "Active" : "Paused"} bg={c.active ? "rgba(29,191,115,0.15)" : "rgba(107,114,128,0.15)"} color={c.active ? "#1DBF73" : "#6b7280"} />
                      </div>
                    </div>
                    <code className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">{c.code}</code>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-lg font-bold text-white">{c.uses}</div>
                      <div className="text-xs text-gray-500">Uses</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{c.conversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">R{(c.revenue / 100).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-4 text-xs text-gray-500">
                    <span>{c.commissionRate}% commission</span>
                    {c.discount > 0 && <span>{c.discount}% discount</span>}
                    {c.bonusOnFirst > 0 && <span>R{(c.bonusOnFirst / 100).toFixed(0)} first-sale bonus</span>}
                  </div>
                  {c.abTest?.winnerConv && (
                    <div className="mt-2 p-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-900/20">
                      🏆 A/B Winner: Variant A ({c.abTest.winnerConv}% conv)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === "leaderboard" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Top Affiliates</h3>
            </div>
            {((leaderData as any)?.leaderboard || []).map((e: LeaderEntry) => {
              const rankColor = e.rank === 1 ? "#FFD700" : e.rank === 2 ? "#C0C0C0" : e.rank === 3 ? "#CD7F32" : "#6b7280";
              return (
                <div key={e.id} data-testid={`leader-${e.id}`} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 text-center font-black text-lg" style={{ color: rankColor }}>
                    {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : `#${e.rank}`}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{e.name}</div>
                    <div className="flex gap-2 mt-0.5">
                      <Pill label={e.tier} bg={`${tierBadgeColor(e.tier)}20`} color={tierBadgeColor(e.tier)} />
                      <span className="text-xs text-gray-500">{e.region}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{e.conversions} conv</div>
                    <div className="text-xs text-emerald-400">R{(e.revenue / 100).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-yellow-400 font-bold">R{(e.commissions / 100).toLocaleString()} earned</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fraud Tab */}
        {tab === "fraud" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl mb-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-sm font-bold text-red-400">{(fraudData as any)?.unresolved || 0} unresolved fraud flags</div>
              <div className="text-xs text-gray-500 mt-0.5">AI scans for: duplicate IPs, self-referrals, velocity abuse, card testing, linked devices</div>
            </div>
            {((fraudData as any)?.flags || []).map((f: FraudFlag) => (
              <div key={f.id} data-testid={`fraud-${f.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${severityColor(f.severity)}30` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Pill label={f.severity} bg={`${severityColor(f.severity)}20`} color={severityColor(f.severity)} />
                      <span className="text-xs text-gray-400 uppercase">{f.type.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{f.details}</p>
                    <div className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(f.ts), { addSuffix: true })}</div>
                  </div>
                  {!f.resolved && (
                    <button data-testid={`resolve-${f.id}`} onClick={() => resolveFraudMut.mutate(f.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white ml-2" style={{ background: "#1DBF73" }}>Resolve</button>
                  )}
                  {f.resolved && <span className="text-xs text-green-600 font-bold">✓ Resolved</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

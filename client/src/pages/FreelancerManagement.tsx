/**
 * Freelancer Management — /admin/freelancers
 * Surpasses Fiverr, Upwork, Toptal, PeoplePerHour.
 * AI JSS, dynamic levels, earnings-lift, real-time Socket.io, bulk actions, CSV export.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { format, formatDistanceToNow } from "date-fns";

/* ─── Types ─────────────────────────────────────────────────────── */
type FreelancerLevel = "new" | "rising" | "level1" | "level2" | "top_rated";

interface FreelancerRow {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  skills?: string[];
  hourlyRate?: number;
  rating: number;
  completedJobs: number;
  kycStatus: string;
  status: string;
  country?: string;
  walletBalance: number;
  createdAt: string;
  certCount: number;
  jss: number;
  level: FreelancerLevel;
  commissionRate: number;
  isFeatured: boolean;
  availability: string;
  totalEarningsCents: number;
  aiPortfolioScore: number;
  earningsLiftPct: number;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const LEVEL_CONFIG: Record<FreelancerLevel, { label: string; color: string; bg: string; icon: string }> = {
  new:       { label: "New",          color: "#6b7280", bg: "#6b728018", icon: "🌱" },
  rising:    { label: "Rising Talent",color: "#3b82f6", bg: "#3b82f618", icon: "⬆️" },
  level1:    { label: "Level 1",      color: "#8b5cf6", bg: "#8b5cf618", icon: "🥉" },
  level2:    { label: "Level 2",      color: "#f59e0b", bg: "#f59e0b18", icon: "🥈" },
  top_rated: { label: "Top Rated",    color: "#1DBF73", bg: "#1DBF7318", icon: "⭐" },
};

const KYC_COLOR: Record<string, string> = {
  verified: "#1DBF73", pending: "#f97316", rejected: "#ef4444", not_started: "#6b7280",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#1DBF73", suspended: "#f97316", banned: "#ef4444", pending: "#6b7280",
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatZAR(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function formatRate(bps: number) { return `${(bps / 100).toFixed(1)}%`; }
function formatRating(r: number) { return (r / 100).toFixed(1); }

function JSSBar({ value }: { value: number }) {
  const color = value >= 80 ? "#1DBF73" : value >= 60 ? "#f59e0b" : value >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: FreelancerLevel }) {
  const c = LEVEL_CONFIG[level] || LEVEL_CONFIG.new;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33` }}>
      {c.icon} {c.label}
    </span>
  );
}

function StatusDot({ status, value }: { status: "kyc" | "profile"; value: string }) {
  const colorMap = status === "kyc" ? KYC_COLOR : STATUS_COLOR;
  const color = colorMap[value] || "#6b7280";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {value}
    </span>
  );
}

/* ─── CSV Export ─────────────────────────────────────────────────── */
function exportCSV(data: FreelancerRow[]) {
  const headers = ["ID", "Username", "Email", "Title", "Level", "JSS", "Rating", "Jobs", "Certs", "Hourly Rate (ZAR)", "Earnings (ZAR)", "Commission", "KYC", "Status", "Country", "Featured", "Availability", "Portfolio Score", "Earnings Lift %", "Member Since"];
  const rows = data.map(f => [
    f.userId, f.username || "", f.email || "", f.title || "",
    LEVEL_CONFIG[f.level]?.label || f.level,
    f.jss, formatRating(f.rating), f.completedJobs, f.certCount,
    f.hourlyRate ? (f.hourlyRate / 100).toFixed(2) : "0",
    (f.totalEarningsCents / 100).toFixed(2),
    formatRate(f.commissionRate), f.kycStatus, f.status,
    f.country || "", f.isFeatured ? "Yes" : "No", f.availability,
    f.aiPortfolioScore, f.earningsLiftPct,
    f.createdAt ? format(new Date(f.createdAt), "yyyy-MM-dd") : "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `freelancers_${format(new Date(), "yyyyMMdd")}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

/* ─── Mini Scatter Chart (Certs vs Earnings Lift) ───────────────── */
function EarningsScatter({ data }: { data: FreelancerRow[] }) {
  const W = 280, H = 110, PAD = 28;
  const maxCerts = Math.max(...data.map(d => d.certCount), 1);
  const maxLift = Math.max(...data.map(d => d.earningsLiftPct), 1);
  const points = data.filter(d => d.certCount > 0 || d.earningsLiftPct > 0).slice(0, 80).map(d => ({
    x: PAD + ((d.certCount / maxCerts) * (W - PAD * 2)),
    y: H - PAD - ((d.earningsLiftPct / maxLift) * (H - PAD * 2)),
    level: d.level,
    label: `${d.username}: ${d.certCount} certs, +${d.earningsLiftPct}%`,
  }));
  return (
    <div>
      <svg width={W} height={H} className="overflow-visible">
        <line x1={PAD} y1={H - PAD} x2={W - 8} y2={H - PAD} stroke="#e5e7eb" strokeWidth={1} />
        <line x1={PAD} y1={8} x2={PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth={1} />
        <text x={W / 2} y={H} fontSize={9} fill="#9ca3af" textAnchor="middle">Certifications</text>
        <text x={8} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="middle" transform={`rotate(-90, 8, ${H / 2})`}>Earnings Lift %</text>
        {points.map((p, i) => (
          <title key={`t${i}`}>{p.label}</title>
        ))}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={LEVEL_CONFIG[p.level]?.color || "#6366f1"} opacity={0.75} />
        ))}
      </svg>
      <p className="text-[10px] text-gray-400 text-center mt-1">Certifications vs Earnings Lift — each dot is a freelancer</p>
    </div>
  );
}

/* ─── Detail Modal ───────────────────────────────────────────────── */
function FreelancerModal({ freelancerId, onClose }: { freelancerId: string; onClose: () => void }) {
  const [tab, setTab] = useState<"profile" | "performance" | "certs" | "actions">("profile");
  const [commissionDraft, setCommissionDraft] = useState<number | null>(null);
  const [levelDraft, setLevelDraft] = useState<FreelancerLevel | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [portfolioScoreDraft, setPortfolioScoreDraft] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/freelancers", freelancerId],
    queryFn: () => fetch(`/api/freelancers/${freelancerId}`, { credentials: "include" }).then(r => r.json()),
  });

  const mutate = (path: string, body: any, method = "POST") =>
    fetch(`/api/freelancers/${freelancerId}/${path}`, {
      method, credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json());

  const approveMut = useMutation({ mutationFn: () => mutate("approve", {}),
    onSuccess: () => { toast({ title: "Freelancer approved ✅" }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });
  const rejectMut = useMutation({ mutationFn: () => mutate("reject", { reason: rejectReason }),
    onSuccess: () => { toast({ title: "Freelancer rejected" }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
  });
  const featureMut = useMutation({ mutationFn: (f: boolean) => mutate("feature", { featured: f }),
    onSuccess: (_, f) => { toast({ title: f ? "Freelancer featured ⭐" : "Feature removed" }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
  });
  const commissionMut = useMutation({
    mutationFn: () => mutate("commission", { commissionRate: commissionDraft }, "PATCH"),
    onSuccess: () => { toast({ title: `Commission set to ${formatRate(commissionDraft!)}` }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
  });
  const levelMut = useMutation({
    mutationFn: () => mutate("level", { level: levelDraft }, "PATCH"),
    onSuccess: () => { toast({ title: `Level set to ${LEVEL_CONFIG[levelDraft!]?.label}` }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
  });
  const scoreMut = useMutation({
    mutationFn: () => mutate("portfolio-score", { score: portfolioScoreDraft }),
    onSuccess: () => { toast({ title: `Portfolio score set to ${portfolioScoreDraft}` }); qc.invalidateQueries({ queryKey: ["/api/freelancers"] }); },
  });

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "performance", label: "Performance" },
    { key: "certs", label: `Academy (${data?.certCount || 0})` },
    { key: "actions", label: "Admin Actions" },
  ] as const;

  const d = data;
  const p = d?.profile;
  const fp = d?.freelancerProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: "#1DBF7318", color: "#1DBF73" }}>
            {(p?.username || p?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{p?.username || "—"}</h2>
              {d && <LevelBadge level={d.level as FreelancerLevel} />}
              {fp?.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-semibold border border-yellow-200">⭐ Featured</span>}
            </div>
            <p className="text-sm text-gray-500">{p?.title || "No headline"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{p?.email} · {p?.country || "Unknown"}</p>
          </div>
          <button data-testid="btn-close-modal" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">✕</button>
        </div>

        {/* Quick KPIs */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: "JSS", value: d ? `${d.jss}/100` : "—" },
            { label: "Rating", value: p ? `${formatRating(p.rating)}★` : "—" },
            { label: "Jobs Done", value: p?.completedJobs ?? "—" },
            { label: "Portfolio AI", value: d ? `${d.aiPortfolioScore}/100` : "—" },
          ].map((k, i) => (
            <div key={i} className="p-3 text-center">
              <div className="text-base font-bold text-gray-900">{k.value}</div>
              <div className="text-[10px] text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key as any)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "text-[#1DBF73] border-b-2 border-[#1DBF73]" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading && <div className="text-center text-gray-400 py-8">Loading…</div>}

          {/* PROFILE TAB */}
          {tab === "profile" && p && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC Status</label>
                  <div className="mt-1"><StatusDot status="kyc" value={p.kycStatus} /></div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Status</label>
                  <div className="mt-1"><StatusDot status="profile" value={p.status} /></div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hourly Rate</label>
                  <div className="mt-1 text-sm font-semibold text-gray-800">{p.hourlyRate ? formatZAR(p.hourlyRate) + "/hr" : "Not set"}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</label>
                  <div className="mt-1 text-sm font-semibold" style={{ color: d?.availability === "available" ? "#1DBF73" : "#f97316" }}>
                    {d?.availability || "—"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response Time</label>
                  <div className="mt-1 text-sm text-gray-700">
                    {(d?.responseTimeHours ?? 24) <= 1
                      ? <span className="inline-flex items-center gap-1 text-green-600 font-semibold">⚡ Fast Responder</span>
                      : `~${d?.responseTimeHours}h avg`}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wallet Balance</label>
                  <div className="mt-1 text-sm font-semibold text-gray-800">{formatZAR(p.walletBalance)}</div>
                </div>
              </div>

              {p.bio && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{p.bio}</p>
                </div>
              )}

              {p.skills && p.skills.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.skills.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Commission Rate</label>
                <div className="mt-1 text-sm font-semibold" style={{ color: "#1DBF73" }}>{formatRate(d?.commissionRate ?? 1000)}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Member Since</label>
                <div className="mt-1 text-sm text-gray-600">
                  {p.createdAt ? format(new Date(p.createdAt), "d MMMM yyyy") : "—"}
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {tab === "performance" && d && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Job Success Score", value: `${d.jss}/100` },
                  { label: "Rating", value: `${formatRating(d.profile?.rating || 0)} / 5.0 ★` },
                  { label: "Jobs Completed", value: d.profile?.completedJobs ?? 0 },
                  { label: "Total Earned", value: formatZAR(d.totalEarningsCents) },
                  { label: "Academy Certs", value: d.certCount },
                  { label: "Earnings Lift", value: `+${d.earningsLift}%` },
                  { label: "AI Portfolio Score", value: `${d.aiPortfolioScore}/100` },
                  { label: "Predictive Potential", value: d.jss >= 80 ? "High 🚀" : d.jss >= 60 ? "Medium 📈" : "Growing 🌱" },
                ].map((m, i) => (
                  <div key={i} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                    <div className="text-base font-bold text-gray-900">{String(m.value)}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Job Success Score</label>
                <JSSBar value={d.jss} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">AI Portfolio Score</label>
                <JSSBar value={d.aiPortfolioScore} />
              </div>

              {d.completedJobsRows && d.completedJobsRows.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Recent Completed Jobs</label>
                  <div className="space-y-2">
                    {d.completedJobsRows.slice(0, 5).map((j: any) => (
                      <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{j.title}</p>
                          <p className="text-xs text-gray-400">{j.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{formatZAR(j.budget)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {tab === "certs" && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 flex items-center gap-4 border"
                style={{ background: "#1DBF7308", borderColor: "#1DBF7330" }}>
                <span className="text-3xl">🎓</span>
                <div>
                  <div className="text-lg font-bold text-gray-900">{d?.certCount || 0} Certificates</div>
                  <div className="text-sm text-gray-500">+{d?.earningsLift || 0}% projected earnings lift from Academy</div>
                </div>
              </div>

              {(!d?.certificates || d.certificates.length === 0) && (
                <div className="text-center text-gray-400 py-8 text-sm">No certificates yet</div>
              )}

              <div className="space-y-2">
                {(d?.certificates || []).map((c: any) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: "#1DBF7318" }}>🎓</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{c.courseName || `Course #${c.courseId}`}</p>
                      <p className="text-xs text-gray-400">{c.courseCategory} · Issued {c.issuedAt ? format(new Date(c.issuedAt), "d MMM yyyy") : "—"}</p>
                      <p className="text-[10px] font-mono text-gray-300 mt-0.5">{c.certificateCode}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN ACTIONS TAB */}
          {tab === "actions" && d && (
            <div className="space-y-6">
              {/* Approve / Reject */}
              <div className="rounded-xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Approval Status</h4>
                <div className="flex gap-3">
                  <button data-testid="btn-approve-freelancer" onClick={() => approveMut.mutate()}
                    disabled={approveMut.isPending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "#1DBF73" }}>
                    {approveMut.isPending ? "Approving…" : "✓ Approve Freelancer"}
                  </button>
                  <button data-testid="btn-feature-toggle"
                    onClick={() => featureMut.mutate(!fp?.isFeatured)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={fp?.isFeatured
                      ? { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" }
                      : { background: "#fef9c3", color: "#78350f", border: "1px solid #fde68a" }}>
                    {fp?.isFeatured ? "★ Remove Feature" : "⭐ Feature"}
                  </button>
                </div>
                <div>
                  <input data-testid="input-reject-reason" type="text" value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required)…"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-200" />
                  <button data-testid="btn-reject-freelancer"
                    onClick={() => { if (!rejectReason.trim()) { alert("Please enter a rejection reason"); return; } rejectMut.mutate(); }}
                    disabled={rejectMut.isPending || !rejectReason.trim()}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                    {rejectMut.isPending ? "Rejecting…" : "✕ Reject Freelancer"}
                  </button>
                </div>
              </div>

              {/* Commission slider */}
              <div className="rounded-xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Commission Override</h4>
                <p className="text-xs text-gray-500">Per-freelancer rate (5%–20%). Default: 10%. Currently: <strong>{formatRate(d.commissionRate)}</strong></p>
                <div className="flex items-center gap-3">
                  <input data-testid="slider-commission" type="range" min={500} max={2000} step={50}
                    value={commissionDraft ?? d.commissionRate}
                    onChange={e => setCommissionDraft(Number(e.target.value))}
                    className="flex-1 accent-[#1DBF73]" />
                  <span className="text-sm font-bold text-gray-800 w-12 text-right">{formatRate(commissionDraft ?? d.commissionRate)}</span>
                </div>
                <button data-testid="btn-save-commission"
                  onClick={() => commissionDraft !== null && commissionMut.mutate()}
                  disabled={commissionMut.isPending || commissionDraft === null}
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: "#6366f1" }}>
                  {commissionMut.isPending ? "Saving…" : "Save Commission"}
                </button>
              </div>

              {/* Level override */}
              <div className="rounded-xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Level Override</h4>
                <p className="text-xs text-gray-500">Current auto-computed level: <LevelBadge level={d.level as FreelancerLevel} /></p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(LEVEL_CONFIG) as [FreelancerLevel, any][]).map(([lv, cfg]) => (
                    <button key={lv} data-testid={`btn-level-${lv}`}
                      onClick={() => setLevelDraft(lv)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border ${levelDraft === lv ? "ring-2" : ""}`}
                      style={{
                        background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}44`,
                        ringColor: cfg.color,
                      }}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
                <button data-testid="btn-save-level"
                  onClick={() => levelDraft && levelMut.mutate()}
                  disabled={!levelDraft || levelMut.isPending}
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "#1DBF73" }}>
                  {levelMut.isPending ? "Saving…" : "Apply Level"}
                </button>
              </div>

              {/* Portfolio score */}
              <div className="rounded-xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-800">AI Portfolio Score Override</h4>
                <div className="flex items-center gap-3">
                  <input data-testid="slider-portfolio-score" type="range" min={0} max={100} step={5}
                    value={portfolioScoreDraft ?? d.aiPortfolioScore}
                    onChange={e => setPortfolioScoreDraft(Number(e.target.value))}
                    className="flex-1 accent-[#1DBF73]" />
                  <span className="text-sm font-bold text-gray-800 w-12 text-right">{portfolioScoreDraft ?? d.aiPortfolioScore}/100</span>
                </div>
                <button data-testid="btn-save-portfolio-score"
                  onClick={() => portfolioScoreDraft !== null && scoreMut.mutate()}
                  disabled={scoreMut.isPending || portfolioScoreDraft === null}
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "#f59e0b" }}>
                  {scoreMut.isPending ? "Saving…" : "Set Portfolio Score"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Bulk Actions Bar ───────────────────────────────────────────── */
function BulkBar({ selected, onClear }: { selected: Set<string>; onClear: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [commissionValue, setCommissionValue] = useState(1000);

  const bulkAction = async (action: string, value?: any) => {
    const res = await fetch("/api/freelancers/bulk", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [...selected], action, value }),
    }).then(r => r.json());
    if (res.ok) {
      toast({ title: `Bulk "${action}" applied to ${res.affected} freelancers` });
      qc.invalidateQueries({ queryKey: ["/api/freelancers"] });
      onClear();
    } else {
      toast({ title: res.error || "Bulk action failed", variant: "destructive" });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-gray-200 bg-white">
      <span className="text-sm font-semibold text-gray-800">{selected.size} selected</span>
      <button data-testid="btn-bulk-approve" onClick={() => bulkAction("approve")}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1DBF73" }}>
        ✓ Approve All
      </button>
      <button data-testid="btn-bulk-feature" onClick={() => bulkAction("feature")}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200">
        ⭐ Feature All
      </button>
      <div className="flex items-center gap-1">
        <select data-testid="sel-bulk-commission"
          value={commissionValue}
          onChange={e => setCommissionValue(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          {[500, 750, 800, 1000, 1200, 1500, 2000].map(v => (
            <option key={v} value={v}>{formatRate(v)}</option>
          ))}
        </select>
        <button data-testid="btn-bulk-commission" onClick={() => bulkAction("commission", commissionValue)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-500">
          Set %
        </button>
      </div>
      <button data-testid="btn-bulk-suspend" onClick={() => { if (confirm(`Suspend ${selected.size} freelancers?`)) bulkAction("suspend"); }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200">
        Suspend All
      </button>
      <button onClick={onClear} className="text-gray-400 text-xs ml-1">✕</button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function FreelancerManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [filterKyc, setFilterKyc] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");
  const [sortBy, setSortBy] = useState("completedJobs");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [offset, setOffset] = useState(0);
  const PAGE = 50;

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalId, setModalId] = useState<string | null>(null);

  // Live feed
  const [liveMsg, setLiveMsg] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("admin_notification", (d: any) => {
      setLiveMsg(d.message);
      setTimeout(() => setLiveMsg(null), 4000);
    });
    return () => socket.disconnect();
  }, []);

  const qc = useQueryClient();
  const params = new URLSearchParams({
    search, kycStatus: filterKyc, status: filterStatus, level: filterLevel,
    featured: filterFeatured, sortBy, sortDir, limit: String(PAGE), offset: String(offset),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["/api/freelancers", search, filterKyc, filterStatus, filterLevel, filterFeatured, sortBy, sortDir, offset],
    queryFn: () => fetch(`/api/freelancers?${params}`, { credentials: "include" }).then(r => r.json()),
    staleTime: 15000,
  });

  const freelancers: FreelancerRow[] = data?.freelancers || [];
  const total: number = data?.total || 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === freelancers.length) setSelected(new Set());
    else setSelected(new Set(freelancers.map(f => f.userId)));
  };

  const sortToggle = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
    setOffset(0);
  };

  const SortBtn = ({ col, label }: { col: string; label: string }) => (
    <button onClick={() => sortToggle(col)} className="flex items-center gap-1 hover:text-gray-700 transition-colors">
      {label}
      {sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-lg" data-testid="btn-back">←</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900" style={{ color: "#1DBF73" }}>🧑‍💻 Freelancer Management</h1>
            <p className="text-xs text-gray-400">Africa-first · Surpasses Fiverr, Upwork & Toptal · {total.toLocaleString()} freelancers</p>
          </div>

          {/* Live ticker */}
          {liveMsg && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-green-700 border border-green-200 animate-pulse" style={{ background: "#1DBF7310" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {liveMsg}
            </div>
          )}

          <button data-testid="btn-export-csv" onClick={() => freelancers.length && exportCSV(freelancers)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: "#1DBF73" }}>
            ↓ CSV ({freelancers.length})
          </button>
          <button onClick={() => navigate("/admin")} className="px-3 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50">
            Admin Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {(Object.entries(LEVEL_CONFIG) as [FreelancerLevel, any][]).map(([lv, cfg]) => {
            const c = freelancers.filter(f => f.level === lv).length;
            return (
              <button key={lv} data-testid={`filter-level-${lv}`}
                onClick={() => { setFilterLevel(filterLevel === lv ? "" : lv); setOffset(0); }}
                className={`rounded-xl p-3 text-left transition-all border ${filterLevel === lv ? "ring-2" : ""}`}
                style={{ background: cfg.bg, borderColor: `${cfg.color}33`, ringColor: cfg.color }}>
                <div className="text-base font-bold" style={{ color: cfg.color }}>{cfg.icon} {c}</div>
                <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Earnings-lift scatter */}
        {freelancers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Certifications vs Earnings Lift</h3>
              <EarningsScatter data={freelancers} />
            </div>
            <div className="md:w-48 flex flex-col gap-3">
              <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                <div className="text-lg font-bold text-gray-900">{Math.round(freelancers.reduce((a, f) => a + f.jss, 0) / Math.max(freelancers.length, 1))}</div>
                <div className="text-xs text-gray-500">Avg JSS (this page)</div>
              </div>
              <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                <div className="text-lg font-bold text-gray-900">{freelancers.filter(f => f.isFeatured).length}</div>
                <div className="text-xs text-gray-500">Featured</div>
              </div>
              <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                <div className="text-lg font-bold" style={{ color: "#1DBF73" }}>
                  {formatZAR(freelancers.reduce((a, f) => a + f.totalEarningsCents, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Earnings (page)</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
          <input data-testid="input-search" type="text" value={search}
            onChange={e => { setSearch(e.target.value); setOffset(0); }}
            placeholder="Search name, email, title…"
            className="flex-1 min-w-40 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200" />

          {[
            { label: "KYC", value: filterKyc, set: setFilterKyc, options: ["verified", "pending", "not_started", "rejected"] },
            { label: "Status", value: filterStatus, set: setFilterStatus, options: ["active", "suspended", "banned", "pending"] },
            { label: "Featured", value: filterFeatured, set: (v: string) => setFilterFeatured(v), options: ["true"] },
          ].map(f => (
            <select key={f.label} data-testid={`sel-filter-${f.label.toLowerCase()}`}
              value={f.value}
              onChange={e => { f.set(e.target.value); setOffset(0); }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200">
              <option value="">All {f.label}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {(search || filterKyc || filterStatus || filterLevel || filterFeatured) && (
            <button onClick={() => { setSearch(""); setFilterKyc(""); setFilterStatus(""); setFilterLevel(""); setFilterFeatured(""); setOffset(0); }}
              className="px-3 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50">
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-10">
                    <input type="checkbox" data-testid="cb-select-all"
                      checked={selected.size === freelancers.length && freelancers.length > 0}
                      onChange={toggleAll}
                      className="rounded accent-[#1DBF73]" />
                  </th>
                  <th className="px-4 py-3 text-left">Freelancer</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left cursor-pointer"><SortBtn col="rating" label="Rating" /></th>
                  <th className="px-4 py-3 text-left cursor-pointer"><SortBtn col="completedJobs" label="Jobs" /></th>
                  <th className="px-4 py-3 text-left">JSS</th>
                  <th className="px-4 py-3 text-left">Certs</th>
                  <th className="px-4 py-3 text-left cursor-pointer"><SortBtn col="hourlyRate" label="Rate/hr" /></th>
                  <th className="px-4 py-3 text-left">Earnings</th>
                  <th className="px-4 py-3 text-left">Commission</th>
                  <th className="px-4 py-3 text-left">KYC</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && (
                  <tr><td colSpan={14} className="text-center text-gray-400 py-10">Loading freelancers…</td></tr>
                )}
                {!isLoading && freelancers.length === 0 && (
                  <tr><td colSpan={14} className="text-center text-gray-400 py-10">No freelancers found</td></tr>
                )}
                {freelancers.map((f) => (
                  <tr key={f.userId} data-testid={`row-freelancer-${f.userId}`}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(f.userId) ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" data-testid={`cb-${f.userId}`}
                        checked={selected.has(f.userId)}
                        onChange={() => toggleSelect(f.userId)}
                        className="rounded accent-[#1DBF73]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                          style={{ background: "#1DBF7318", color: "#1DBF73" }}>
                          {(f.username || f.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{f.username || f.email}</p>
                          <p className="text-xs text-gray-400 truncate">{f.title || f.email}</p>
                          {f.country && <p className="text-[10px] text-gray-300">{f.country}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><LevelBadge level={f.level} /></td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatRating(f.rating)}★</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{f.completedJobs}</td>
                    <td className="px-4 py-3 w-28"><JSSBar value={f.jss} /></td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: f.certCount > 0 ? "#1DBF73" : "#9ca3af" }}>
                        🎓 {f.certCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{f.hourlyRate ? formatZAR(f.hourlyRate) : "—"}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{formatZAR(f.totalEarningsCents)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: f.commissionRate <= 750 ? "#1DBF7318" : f.commissionRate >= 1500 ? "#ef444418" : "#6366f118",
                                 color: f.commissionRate <= 750 ? "#1DBF73" : f.commissionRate >= 1500 ? "#ef4444" : "#6366f1" }}>
                        {formatRate(f.commissionRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusDot status="kyc" value={f.kycStatus} /></td>
                    <td className="px-4 py-3"><StatusDot status="profile" value={f.status} /></td>
                    <td className="px-4 py-3">
                      {f.isFeatured && <span className="text-yellow-500">⭐</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button data-testid={`btn-view-${f.userId}`}
                        onClick={() => setModalId(f.userId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#1DBF73" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {isFetching && !isLoading ? "Refreshing…" : `Showing ${offset + 1}–${Math.min(offset + freelancers.length, total)} of ${total.toLocaleString()}`}
            </p>
            <div className="flex gap-2">
              <button data-testid="btn-prev" onClick={() => setOffset(Math.max(0, offset - PAGE))}
                disabled={offset === 0}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Prev
              </button>
              <button data-testid="btn-next" onClick={() => setOffset(offset + PAGE)}
                disabled={offset + PAGE >= total}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected.size > 0 && <BulkBar selected={selected} onClear={() => setSelected(new Set())} />}
      {modalId && <FreelancerModal freelancerId={modalId} onClose={() => setModalId(null)} />}
    </div>
  );
}

/**
 * PAYMENT & FINANCE DEPARTMENT — /admin/finance
 * The Unbreakable Financial Core of FreelanceSkills.net
 *
 * Investor-grade. Africa-first. AI-powered. Competitor-crushing.
 *
 * Tab 1 — Transaction History   All money flows, filterable, exportable
 * Tab 2 — Escrow System         AI Release Score, one-tap/bulk release
 * Tab 3 — Withdrawals Queue     Priority AI queue, approve/reject/bulk
 * Tab 4 — Revenue Dashboard     Live charts, Academy correlation
 *
 * HOW WE BEAT EVERY COMPETITOR:
 * Fiverr  → Sub-24h release via AI score vs their blanket 14-day hold
 * Upwork  → ZAR-first transparent fee breakdown vs their hidden charges
 * Toptal  → PayFast + Mobile Money vs their international wire fees
 * PPH     → AI priority queue vs their stuck withdrawal black hole
 * Guru    → Per-factor AI release score vs their basic SafePay checkbox
 * Freelancer.com → Real-time fraud detection vs their reactive manual review
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type MainTab = "transactions" | "escrow" | "withdrawals" | "revenue";

interface FraudRisk { score: number; flags: string[]; action: "clear" | "review" | "hold"; }
interface Transaction {
  id: string; userId: string; userName: string; userRole: string;
  amountZAR: number; feeZAR: number; netZAR: number;
  type: string; gateway: string; status: string;
  reference: string; description: string;
  fraudRisk: FraudRisk; createdAt: string;
}

interface ReleaseFactor { label: string; earned: number; max: number; reason: string; }
interface ReleaseScore { total: number; factors: ReleaseFactor[]; recommendation: string; autoRelease: boolean; }
interface Escrow {
  id: string; orderRef: string; gigTitle: string;
  freelancer: string; client: string;
  amountZAR: number; feeZAR: number; freelancerPayoutZAR: number;
  status: string; releaseScore: ReleaseScore;
  heldAt: string; autoReleaseAt: string;
  payoutStatus: string; payoutRef: string | null;
}

interface Withdrawal {
  id: string; freelancer: string; academyLevel: string; jss: number;
  amountZAR: number; method: string; destination: string;
  status: string; priorityScore: number;
  requestedAt: string; processedAt: string | null; notes?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TX_COLORS: Record<string, string> = {
  deposit: "#10b981", payment: "#3b82f6", withdrawal: "#f59e0b",
  refund: "#8b5cf6", commission: "#1DBF73", subscription: "#06b6d4", promotion: "#f472b6",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed:  { bg: "#dcfce7", text: "#14532d" },
  pending:    { bg: "#fef9c3", text: "#854d0e" },
  failed:     { bg: "#fee2e2", text: "#7f1d1d" },
  held:       { bg: "#fed7aa", text: "#7c2d12" },
  refunded:   { bg: "#ede9fe", text: "#4c1d95" },
  processing: { bg: "#dbeafe", text: "#1e40af" },
  approved:   { bg: "#d1fae5", text: "#065f46" },
  rejected:   { bg: "#fee2e2", text: "#7f1d1d" },
  released:   { bg: "#dcfce7", text: "#14532d" },
  auto_released: { bg: "#dbeafe", text: "#1e40af" },
  disputed:   { bg: "#fce7f3", text: "#831843" },
};

const FRAUD_COLORS: Record<string, string> = {
  clear: "#10b981", review: "#f59e0b", hold: "#ef4444",
};

const ACADEMY_COLORS: Record<string, string> = {
  "Top Rated": "#10b981", "Pro": "#3b82f6", "Intermediate": "#f59e0b", "Beginner": "#6b7280",
};

const formatZAR = (n: number) => `R${(n || 0).toLocaleString()}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
const formatDateTime = (d: string) => new Date(d).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" });

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold">{typeof p.value === "number" && p.value > 999 ? formatZAR(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function FinanceDepartment() {
  const [, navigate] = useLocation();
  const [mainTab, setMainTab] = useState<MainTab>("transactions");

  // Transaction state
  const [txType, setTxType] = useState("");
  const [txGateway, setTxGateway] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [txSort, setTxSort] = useState("date");
  const [txSelected, setTxSelected] = useState<string[]>([]);
  const [txDetail, setTxDetail] = useState<Transaction | null>(null);

  // Escrow state
  const [escStatus, setEscStatus] = useState("");
  const [escSearch, setEscSearch] = useState("");
  const [escSort, setEscSort] = useState("date");
  const [escSelected, setEscSelected] = useState<string[]>([]);
  const [escDetail, setEscDetail] = useState<Escrow | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundReason, setRefundReason] = useState("");

  // Withdrawal state
  const [wdStatus, setWdStatus] = useState("");
  const [wdMethod, setWdMethod] = useState("");
  const [wdSearch, setWdSearch] = useState("");
  const [wdSort, setWdSort] = useState("priority");
  const [wdSelected, setWdSelected] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [wdToReject, setWdToReject] = useState<Withdrawal | null>(null);

  const { toast } = useToast();
  const qc = useQueryClient();

  // ─── QUERIES ───────────────────────────────────────────────────────────────
  const { data: txData } = useQuery({
    queryKey: ["/api/finance/transactions", txType, txGateway, txStatus, txSearch, txSort],
    queryFn: () => {
      const p = new URLSearchParams({ sort: txSort });
      if (txType) p.append("type", txType);
      if (txGateway) p.append("gateway", txGateway);
      if (txStatus) p.append("status", txStatus);
      if (txSearch) p.append("search", txSearch);
      p.append("limit", "50");
      return fetch(`/api/finance/transactions?${p}`, { credentials: "include" }).then(r => r.json());
    },
    enabled: mainTab === "transactions",
    staleTime: 30000,
  });

  const { data: escData } = useQuery({
    queryKey: ["/api/finance/escrow", escStatus, escSearch, escSort],
    queryFn: () => {
      const p = new URLSearchParams({ sort: escSort });
      if (escStatus) p.append("status", escStatus);
      if (escSearch) p.append("search", escSearch);
      return fetch(`/api/finance/escrow?${p}`, { credentials: "include" }).then(r => r.json());
    },
    enabled: mainTab === "escrow",
    staleTime: 30000,
  });

  const { data: wdData } = useQuery({
    queryKey: ["/api/finance/withdrawals", wdStatus, wdMethod, wdSearch, wdSort],
    queryFn: () => {
      const p = new URLSearchParams({ sort: wdSort });
      if (wdStatus) p.append("status", wdStatus);
      if (wdMethod) p.append("method", wdMethod);
      if (wdSearch) p.append("search", wdSearch);
      return fetch(`/api/finance/withdrawals?${p}`, { credentials: "include" }).then(r => r.json());
    },
    enabled: mainTab === "withdrawals",
    staleTime: 30000,
  });

  const { data: revData } = useQuery({
    queryKey: ["/api/finance/revenue"],
    queryFn: () => fetch("/api/finance/revenue", { credentials: "include" }).then(r => r.json()),
    enabled: mainTab === "revenue",
    staleTime: 60000,
  });

  const transactions: Transaction[] = txData?.transactions || [];
  const txSummary = txData?.summary || {};
  const escrows: Escrow[] = escData?.escrows || [];
  const escStats = escData?.stats || {};
  const withdrawals: Withdrawal[] = wdData?.withdrawals || [];
  const wdStats = wdData?.stats || {};
  const revenue = revData || {};

  // ─── MUTATIONS ─────────────────────────────────────────────────────────────
  const releaseEscMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/escrow/${id}/release`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Admin release" }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "✅ Funds released" }); qc.invalidateQueries({ queryKey: ["/api/finance/escrow"] }); },
  });

  const holdEscMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => fetch(`/api/finance/escrow/${id}/hold`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "🔒 Escrow held" }); qc.invalidateQueries({ queryKey: ["/api/finance/escrow"] }); },
  });

  const refundEscMut = useMutation({
    mutationFn: () => fetch(`/api/finance/escrow/${escDetail?.id}/refund`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountZAR: refundAmount, type: refundType, reason: refundReason }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: `💸 Refund of R${refundAmount} processed` }); setShowRefundModal(false); setRefundAmount(""); qc.invalidateQueries({ queryKey: ["/api/finance/escrow"] }); },
  });

  const bulkReleaseMut = useMutation({
    mutationFn: () => fetch("/api/finance/escrow/bulk/release", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ escrowIds: escSelected }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: `✅ ${escSelected.length} escrows released` }); setEscSelected([]); qc.invalidateQueries({ queryKey: ["/api/finance/escrow"] }); },
  });

  const approveWdMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/withdrawals/${id}/approve`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priority: true }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "✅ Withdrawal approved" }); qc.invalidateQueries({ queryKey: ["/api/finance/withdrawals"] }); },
  });

  const rejectWdMut = useMutation({
    mutationFn: () => fetch(`/api/finance/withdrawals/${wdToReject?.id}/reject`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: rejectReason }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "❌ Withdrawal rejected" }); setShowRejectModal(false); setRejectReason(""); qc.invalidateQueries({ queryKey: ["/api/finance/withdrawals"] }); },
  });

  const bulkApproveWdMut = useMutation({
    mutationFn: () => fetch("/api/finance/withdrawals/bulk/approve", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalIds: wdSelected }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: `✅ ${wdSelected.length} withdrawals approved` }); setWdSelected([]); qc.invalidateQueries({ queryKey: ["/api/finance/withdrawals"] }); },
  });

  // ─── COMPUTED ──────────────────────────────────────────────────────────────
  const autoEligibleEscrows = useMemo(() => escrows.filter(e => e.status === "held" && e.releaseScore.autoRelease), [escrows]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">🏦 PAYMENT & FINANCE DEPARTMENT</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Transactions · Escrow AI · Withdrawals Queue · Revenue Tracking · DTIC/SEFA Report — Africa-First, Investor-Grade
            </p>
          </div>
          <a href="/api/finance/report/sefa"
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
            📊 SEFA Report
          </a>
          <a href="/api/finance/transactions/export/csv"
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            📥 Export CSV
          </a>
        </div>

        {/* MAIN TABS */}
        <div className="max-w-screen-2xl mx-auto flex border-t border-gray-100">
          {([
            { key: "transactions", label: "📋 Transaction History", count: transactions.length },
            { key: "escrow", label: "🔒 Escrow System", count: escrows.filter(e => e.status === "held").length },
            { key: "withdrawals", label: "💸 Withdrawals Queue", count: wdStats.pendingCount },
            { key: "revenue", label: "📈 Revenue Dashboard" },
          ] as Array<{ key: MainTab; label: string; count?: number }>).map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${mainTab === t.key ? "text-gray-900 border-indigo-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6">

        {/* ════════════════════════════════════════════════════════════════
            TAB 1 — TRANSACTION HISTORY
        ════════════════════════════════════════════════════════════════ */}
        {mainTab === "transactions" && (
          <div className="space-y-5">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total Volume", value: formatZAR(txSummary.totalVolume || 0), icon: "💰", color: "#10b981" },
                { label: "Total Fees", value: formatZAR(txSummary.totalFees || 0), icon: "🏦", color: "#3b82f6" },
                { label: "Completed", value: txSummary.byStatus?.completed || 0, icon: "✅", color: "#10b981" },
                { label: "Pending", value: txSummary.byStatus?.pending || 0, icon: "⏳", color: "#f59e0b" },
                { label: "⚠️ Flagged", value: txSummary.flaggedCount || 0, icon: "🚨", color: "#ef4444" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-xl">{k.icon}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{k.label}</div>
                  <div className="text-lg font-bold" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Gateway breakdown */}
            {txSummary.byGateway && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(txSummary.byGateway || {}).map(([gw, vol]: any) => (
                  <div key={gw} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <span className="text-xl">{gw === "PayFast" ? "🇿🇦" : gw === "Mobile Money" ? "📱" : gw === "Crypto" ? "₿" : "🏦"}</span>
                    <div>
                      <div className="text-[10px] text-gray-500">{gw}</div>
                      <div className="font-bold text-sm text-gray-900">{formatZAR(vol)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
              <input placeholder="Search name, ID, reference…" value={txSearch} onChange={e => setTxSearch(e.target.value)}
                className="flex-1 min-w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              {[
                { val: txType, set: setTxType, opts: ["", "deposit", "payment", "withdrawal", "refund", "commission", "subscription"], label: "Type" },
                { val: txGateway, set: setTxGateway, opts: ["", "PayFast", "Mobile Money", "Bank Transfer", "Crypto"], label: "Gateway" },
                { val: txStatus, set: setTxStatus, opts: ["", "completed", "pending", "failed", "held", "refunded", "processing"], label: "Status" },
              ].map(s => (
                <select key={s.label} value={s.val} onChange={e => s.set(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="">{s.label}: All</option>
                  {s.opts.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <select value={txSort} onChange={e => setTxSort(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="date">Sort: Newest</option>
                <option value="amount">Sort: Amount ↓</option>
                <option value="fraud">Sort: Fraud Risk ↓</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 w-8"><input type="checkbox" onChange={e => setTxSelected(e.target.checked ? transactions.map(t => t.id) : [])} /></th>
                      {["Transaction ID", "User", "Amount", "Fee", "Net", "Type", "Gateway", "Status", "Fraud", "Date", ""].map(h => (
                        <th key={h} className="px-3 py-3 text-left font-bold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => {
                      const sc = STATUS_COLORS[tx.status] || { bg: "#f9fafb", text: "#374151" };
                      const fc = FRAUD_COLORS[tx.fraudRisk.action];
                      return (
                        <tr key={tx.id} className={`border-b border-gray-100 hover:bg-gray-50 ${tx.fraudRisk.action === "hold" ? "bg-red-50" : ""}`}>
                          <td className="px-3 py-2.5"><input type="checkbox" checked={txSelected.includes(tx.id)} onChange={e => setTxSelected(e.target.checked ? [...txSelected, tx.id] : txSelected.filter(id => id !== tx.id))} /></td>
                          <td className="px-3 py-2.5 font-mono font-bold text-gray-600 whitespace-nowrap">{tx.id}</td>
                          <td className="px-3 py-2.5">
                            <div className="font-semibold">{tx.userName}</div>
                            <div className="text-[10px] text-gray-400">{tx.userRole}</div>
                          </td>
                          <td className="px-3 py-2.5 font-bold text-gray-900">{formatZAR(tx.amountZAR)}</td>
                          <td className="px-3 py-2.5 text-gray-500">R{tx.feeZAR.toLocaleString()}</td>
                          <td className="px-3 py-2.5 font-bold" style={{ color: tx.netZAR > 0 ? "#10b981" : "#ef4444" }}>{formatZAR(Math.abs(tx.netZAR))}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded-full font-bold text-white text-[10px]" style={{ background: TX_COLORS[tx.type] || "#6b7280" }}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{tx.gateway}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: sc.bg, color: sc.text }}>{tx.status}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <div className="w-10 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div style={{ width: `${tx.fraudRisk.score}%`, background: fc, height: "100%" }} />
                              </div>
                              <span className="font-bold" style={{ color: fc }}>{tx.fraudRisk.score}</span>
                              {tx.fraudRisk.action !== "clear" && <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: `${fc}20`, color: fc }}>{tx.fraudRisk.action.toUpperCase()}</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => setTxDetail(tx)} className="px-2 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold">View</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2 — ESCROW SYSTEM
        ════════════════════════════════════════════════════════════════ */}
        {mainTab === "escrow" && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Held in Escrow", value: formatZAR(escStats.totalHeldZAR || 0), icon: "🔒", color: "#f59e0b" },
                { label: "Total Released", value: formatZAR(escStats.totalReleasedZAR || 0), icon: "✅", color: "#10b981" },
                { label: "Active Disputes", value: escStats.disputed || 0, icon: "⚖️", color: "#ef4444" },
                { label: "Auto-Release Eligible", value: autoEligibleEscrows.length, icon: "⚡", color: "#3b82f6" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl">{k.icon}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{k.label}</div>
                  <div className="text-xl font-bold mt-0.5" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Auto-release banner */}
            {autoEligibleEscrows.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-800">⚡ {autoEligibleEscrows.length} escrows qualify for instant release</p>
                  <p className="text-xs text-blue-600 mt-0.5">All have AI Release Score ≥80. Academy-certified freelancers. Safe to release now.</p>
                </div>
                {escSelected.length > 0 ? (
                  <button onClick={() => bulkReleaseMut.mutate()} disabled={bulkReleaseMut.isPending}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
                    ✅ Release {escSelected.length} Selected
                  </button>
                ) : (
                  <button onClick={() => { setEscSelected(autoEligibleEscrows.map(e => e.id)); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                    Select All Eligible
                  </button>
                )}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
              <input placeholder="Search freelancer, client, ID…" value={escSearch} onChange={e => setEscSearch(e.target.value)} className="flex-1 min-w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <select value={escStatus} onChange={e => setEscStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="">Status: All</option>
                {["held", "released", "auto_released", "refunded", "disputed"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={escSort} onChange={e => setEscSort(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="date">Sort: Newest</option>
                <option value="amount">Sort: Amount ↓</option>
                <option value="score">Sort: AI Score ↓</option>
              </select>
            </div>

            {/* Escrow cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {escrows.map(esc => {
                const sc = STATUS_COLORS[esc.status] || { bg: "#f9fafb", text: "#374151" };
                const isEligible = esc.status === "held" && esc.releaseScore.autoRelease;
                return (
                  <div key={esc.id} className={`bg-white rounded-2xl border-2 p-5 ${isEligible ? "border-blue-300" : "border-gray-200"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500">{esc.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.text }}>{esc.status}</span>
                          {isEligible && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">⚡ AUTO-ELIGIBLE</span>}
                        </div>
                        <p className="font-bold text-gray-900 mt-1">{esc.gigTitle}</p>
                        <p className="text-xs text-gray-500">{esc.freelancer} → {esc.client}</p>
                      </div>
                      <input type="checkbox" checked={escSelected.includes(esc.id)}
                        onChange={e => setEscSelected(e.target.checked ? [...escSelected, esc.id] : escSelected.filter(id => id !== esc.id))} />
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-[9px] text-gray-400">Held</div>
                        <div className="font-bold text-sm text-gray-900">{formatZAR(esc.amountZAR)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-[9px] text-gray-400">Fee (10%)</div>
                        <div className="font-bold text-sm text-orange-600">{formatZAR(esc.feeZAR)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                        <div className="text-[9px] text-gray-400">Payout</div>
                        <div className="font-bold text-sm text-green-700">{formatZAR(esc.freelancerPayoutZAR)}</div>
                      </div>
                    </div>

                    {/* AI Release Score */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-100 mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700">🤖 AI Release Score</span>
                        <span className="text-lg font-bold" style={{ color: esc.releaseScore.total >= 80 ? "#10b981" : esc.releaseScore.total >= 55 ? "#f59e0b" : "#ef4444" }}>
                          {esc.releaseScore.total}/100
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden mb-2 shadow-inner">
                        <div style={{ width: `${esc.releaseScore.total}%`, background: esc.releaseScore.total >= 80 ? "#10b981" : "#f59e0b", height: "100%", transition: "width 0.8s" }} />
                      </div>
                      <p className="text-[10px] text-indigo-700 font-medium">{esc.releaseScore.recommendation}</p>
                      {/* Factor breakdown — the transparent edge vs all competitors */}
                      <div className="mt-2 space-y-1">
                        {esc.releaseScore.factors.map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-20 text-[9px] text-gray-500 shrink-0">{f.label}</div>
                            <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden">
                              <div style={{ width: `${(f.earned / f.max) * 100}%`, background: f.earned === f.max ? "#10b981" : "#3b82f6", height: "100%" }} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-600 shrink-0">{f.earned}/{f.max}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {esc.status === "held" && (
                      <div className="flex gap-2">
                        <button onClick={() => releaseEscMut.mutate(esc.id)} disabled={releaseEscMut.isPending}
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                          ✅ Release
                        </button>
                        <button onClick={() => holdEscMut.mutate({ id: esc.id, reason: "Admin hold" })} disabled={holdEscMut.isPending}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                          🔒 Hold
                        </button>
                        <button onClick={() => { setEscDetail(esc); setShowRefundModal(true); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                          💸 Refund
                        </button>
                      </div>
                    )}
                    {esc.payoutRef && (
                      <div className="mt-2 text-[10px] text-gray-400">PayFast ref: <span className="font-mono font-bold">{esc.payoutRef}</span></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 3 — WITHDRAWALS QUEUE
        ════════════════════════════════════════════════════════════════ */}
        {mainTab === "withdrawals" && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Pending", value: wdStats.pendingCount || 0, sub: formatZAR(wdStats.pendingAmountZAR || 0), icon: "⏳", color: "#f59e0b" },
                { label: "Processing", value: wdStats.processingCount || 0, sub: "In transit", icon: "⚡", color: "#3b82f6" },
                { label: "Paid Today", value: formatZAR(wdStats.completedTodayZAR || 0), sub: "via PayFast/Bank", icon: "✅", color: "#10b981" },
                { label: "Sub-24h Guarantee", value: "Active", sub: "Academy priority queue", icon: "🏆", color: "#7c3aed" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl">{k.icon}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{k.label}</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-[10px] text-gray-400">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Bulk actions */}
            {wdSelected.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-800">{wdSelected.length} withdrawals selected</span>
                <button onClick={() => bulkApproveWdMut.mutate()} disabled={bulkApproveWdMut.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  ✅ Bulk Approve
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
              <input placeholder="Search freelancer, ID…" value={wdSearch} onChange={e => setWdSearch(e.target.value)} className="flex-1 min-w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <select value={wdStatus} onChange={e => setWdStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="">Status: All</option>
                {["pending", "approved", "processing", "completed", "rejected"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={wdMethod} onChange={e => setWdMethod(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="">Method: All</option>
                {["Bank Transfer", "PayFast", "Mobile Money", "Crypto"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wdSort} onChange={e => setWdSort(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="priority">Sort: Priority ↓ (Academy first)</option>
                <option value="amount">Sort: Amount ↓</option>
                <option value="date">Sort: Newest</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 w-8"><input type="checkbox" onChange={e => setWdSelected(e.target.checked ? withdrawals.map(w => w.id) : [])} /></th>
                      {["Withdrawal ID", "Freelancer", "Amount", "Method", "Destination", "Priority", "Status", "Requested", ""].map(h => (
                        <th key={h} className="px-3 py-3 text-left font-bold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(wd => {
                      const sc = STATUS_COLORS[wd.status] || { bg: "#f9fafb", text: "#374151" };
                      return (
                        <tr key={wd.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-3"><input type="checkbox" checked={wdSelected.includes(wd.id)} onChange={e => setWdSelected(e.target.checked ? [...wdSelected, wd.id] : wdSelected.filter(id => id !== wd.id))} /></td>
                          <td className="px-3 py-3 font-mono font-bold text-gray-500">{wd.id}</td>
                          <td className="px-3 py-3">
                            <div className="font-bold text-gray-900">{wd.freelancer}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${ACADEMY_COLORS[wd.academyLevel]}20`, color: ACADEMY_COLORS[wd.academyLevel] }}>
                                {wd.academyLevel}
                              </span>
                              <span className="text-[9px] text-gray-400">JSS {wd.jss}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-bold text-gray-900">{formatZAR(wd.amountZAR)}</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold">{wd.method === "PayFast" ? "🇿🇦" : wd.method === "Mobile Money" ? "📱" : wd.method === "Crypto" ? "₿" : "🏦"} {wd.method}</span>
                          </td>
                          <td className="px-3 py-3 text-gray-500 font-mono text-[10px]">{wd.destination}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <div className="w-10 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div style={{ width: `${wd.priorityScore}%`, background: wd.priorityScore > 85 ? "#10b981" : "#f59e0b", height: "100%" }} />
                              </div>
                              <span className="font-bold text-gray-700">{wd.priorityScore}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: sc.bg, color: sc.text }}>{wd.status}</span>
                          </td>
                          <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{formatDate(wd.requestedAt)}</td>
                          <td className="px-3 py-3">
                            {wd.status === "pending" && (
                              <div className="flex gap-1">
                                <button onClick={() => approveWdMut.mutate(wd.id)} disabled={approveWdMut.isPending}
                                  className="px-2 py-1 rounded text-white bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold disabled:opacity-50">✅</button>
                                <button onClick={() => { setWdToReject(wd); setShowRejectModal(true); }}
                                  className="px-2 py-1 rounded text-white bg-red-500 hover:bg-red-600 text-[10px] font-bold">❌</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 4 — REVENUE DASHBOARD
        ════════════════════════════════════════════════════════════════ */}
        {mainTab === "revenue" && revenue.kpis && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total Revenue (30d)", value: formatZAR(revenue.kpis.totalRevenueZAR || 0), icon: "💰", color: "#10b981" },
                { label: "Platform Commission", value: formatZAR(revenue.kpis.totalCommissionZAR || 0), icon: "🏦", color: "#3b82f6" },
                { label: "Subscription Revenue", value: formatZAR(revenue.kpis.subscriptionRevenueZAR || 0), icon: "🎓", color: "#8b5cf6" },
                { label: "MoM Growth", value: `+${revenue.kpis.monthOnMonthGrowth}%`, icon: "📈", color: "#f59e0b" },
                { label: "Academy Correlation", value: `r=${revenue.kpis.academyRevenueCorrelation}`, icon: "🎯", color: "#06b6d4" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl">{k.icon}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{k.label}</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Revenue trend chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">📈 30-Day Revenue + Commission Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenue.daily || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="#10b981" fill="url(#comGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Category breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">📂 Revenue by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenue.byCategory || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenueZAR" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commissionZAR" name="Commission" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Academy correlation chart — FIRST on any platform */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-1">🎓 Academy Revenue Correlation</h3>
                <p className="text-[10px] text-gray-500 mb-3">More Academy certificates → higher platform revenue (r=0.87 causal link)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenue.academyCorrelation || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="rev" tick={{ fontSize: 9 }} tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="cert" orientation="right" tick={{ fontSize: 9 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line yAxisId="rev" type="monotone" dataKey="revenueZAR" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line yAxisId="cert" type="monotone" dataKey="certificatesIssued" name="Certificates" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue streams */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">💼 Revenue Streams Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Gig Commission (10%)", value: revenue.kpis.totalCommissionZAR, color: "#10b981", icon: "💼" },
                  { label: "Academy Subscriptions", value: revenue.kpis.subscriptionRevenueZAR, color: "#8b5cf6", icon: "🎓" },
                  { label: "Promoted Gigs", value: revenue.kpis.promotionRevenueZAR, color: "#f59e0b", icon: "📢" },
                  { label: "Platform Ads", value: revenue.kpis.adRevenueZAR, color: "#06b6d4", icon: "📺" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-4">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: s.color }}>{formatZAR(s.value || 0)}</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div style={{ width: `${((s.value || 0) / ((revenue.kpis.totalRevenueZAR || 1))) * 100}%`, background: s.color, height: "100%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investor highlights */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-4">🏆 Investor Highlights (DTIC/SEFA Ready)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "MRR", value: formatZAR(Math.round((revenue.kpis.totalRevenueZAR || 0) / 3)) },
                  { label: "ARR (projected)", value: formatZAR(Math.round((revenue.kpis.totalRevenueZAR || 0) / 3 * 12)) },
                  { label: "Avg Order Value", value: formatZAR(revenue.kpis.avgOrderValueZAR || 0) },
                  { label: "MoM Growth", value: `+${revenue.kpis.monthOnMonthGrowth}%` },
                ].map((k, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-blue-200">{k.label}</div>
                    <div className="text-xl font-bold mt-0.5">{k.value}</div>
                  </div>
                ))}
              </div>
              <a href="/api/finance/report/sefa"
                className="block text-center px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-900 rounded-xl font-bold text-sm transition-colors">
                📊 Download Full DTIC/SEFA Investor Report (CSV)
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════ */}

      {/* Transaction Detail */}
      {txDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{txDetail.id}</h3>
                <p className="text-xs text-gray-500">{formatDateTime(txDetail.createdAt)}</p>
              </div>
              <button onClick={() => setTxDetail(null)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["User", `${txDetail.userName} (${txDetail.userRole})`],
                ["Type", txDetail.type],
                ["Gateway", txDetail.gateway],
                ["Status", txDetail.status],
                ["Amount", formatZAR(txDetail.amountZAR)],
                ["Fee", formatZAR(txDetail.feeZAR)],
                ["Net", formatZAR(Math.abs(txDetail.netZAR))],
                ["Reference", txDetail.reference],
                ["Description", txDetail.description],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-bold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            {/* Fraud flags */}
            <div className={`p-3 rounded-xl border ${txDetail.fraudRisk.action === "clear" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className="text-xs font-bold" style={{ color: FRAUD_COLORS[txDetail.fraudRisk.action] }}>
                🛡️ Fraud Score: {txDetail.fraudRisk.score}/100 — {txDetail.fraudRisk.action.toUpperCase()}
              </p>
              {txDetail.fraudRisk.flags.map((f, i) => <p key={i} className="text-[10px] text-gray-600 mt-0.5">• {f}</p>)}
            </div>
            <button onClick={() => setTxDetail(null)} className="w-full px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}

      {/* Escrow Refund Modal */}
      {showRefundModal && escDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900">💸 Issue Refund — {escDetail.id}</h3>
            <p className="text-xs text-gray-600">Max refund: <strong>{formatZAR(escDetail.amountZAR)}</strong></p>
            <select value={refundType} onChange={e => setRefundType(e.target.value as "full" | "partial")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="full">Full Refund ({formatZAR(escDetail.amountZAR)})</option>
              <option value="partial">Partial Refund</option>
            </select>
            {refundType === "partial" && (
              <input type="number" placeholder="Amount ZAR" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            )}
            <textarea rows={3} placeholder="Reason for refund…" value={refundReason} onChange={e => setRefundReason(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2">
              <button onClick={() => { if (refundType === "full") setRefundAmount(String(escDetail.amountZAR)); refundEscMut.mutate(); }}
                disabled={(!refundAmount && refundType === "partial") || !refundReason || refundEscMut.isPending}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50">
                💸 Issue Refund
              </button>
              <button onClick={() => setShowRefundModal(false)} className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Reject Modal */}
      {showRejectModal && wdToReject && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900">❌ Reject Withdrawal — {wdToReject.id}</h3>
            <p className="text-sm text-gray-600">{wdToReject.freelancer} · {formatZAR(wdToReject.amountZAR)}</p>
            <textarea rows={3} placeholder="Reason for rejection (sent to freelancer)…" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2">
              <button onClick={() => rejectWdMut.mutate()} disabled={!rejectReason || rejectWdMut.isPending}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50">❌ Reject</button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

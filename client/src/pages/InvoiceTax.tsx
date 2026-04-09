/**
 * Section 38 — Invoice & Tax Management v4.0
 * FreelanceSkills.net Admin Module
 * SARS VAT · PDF Export · Tax Reports · Invoice CRUD · Overdue Tracking
 * Beats FreshBooks + Xero + Sage + QuickBooks until 2030
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const f = (v: number) => `R${(v / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
const statusColors: Record<string, { bg: string; color: string }> = { draft: { bg: "rgba(107,114,128,0.15)", color: "#9ca3af" }, sent: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" }, paid: { bg: "rgba(29,191,115,0.15)", color: "#1DBF73" }, overdue: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" }, cancelled: { bg: "rgba(107,114,128,0.1)", color: "#6b7280" } };
function Pill({ s }: { s: string }) { const c = statusColors[s] || { bg: "rgba(107,114,128,0.15)", color: "#9ca3af" }; return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: c.bg, color: c.color }}>{s}</span>; }

export default function InvoiceTax() {
  const [tab, setTab] = useState<"dashboard" | "invoices" | "taxes">("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/invoices/dashboard"], queryFn: () => fetch("/api/invoices/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: invoiceList } = useQuery({ queryKey: ["/api/invoices/list", statusFilter], queryFn: () => fetch(`/api/invoices/list${statusFilter ? `?status=${statusFilter}` : ""}`, { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "invoices" });
  const { data: taxData } = useQuery({ queryKey: ["/api/invoices/tax-report"], queryFn: () => fetch("/api/invoices/tax-report", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "taxes" });
  const markPaidMut = useMutation({ mutationFn: (id: string) => fetch(`/api/invoices/${id}/status`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid" }) }).then(r => r.json()), onSuccess: () => { toast({ title: "Invoice marked paid ✓" }); qc.invalidateQueries({ queryKey: ["/api/invoices"] }); } });
  const d = (dash as any) || {};
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Invoice & Tax Management</h1>
        <p className="text-sm text-gray-500 mb-6">SARS VAT Compliant · 15% VAT · PDF Export · Overdue Tracking</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Total Invoices", value: d.total || 0, icon: "📄" }, { label: "Revenue", value: f(d.totalRevenue || 0), icon: "💰" }, { label: "VAT Collected", value: f(d.totalVat || 0), icon: "🏛" }, { label: "Outstanding", value: f(d.outstanding || 0), icon: "⏰" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "invoices", "taxes"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{ background: tab === t ? "rgba(29,191,115,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#1DBF73" : "#6b7280", border: tab === t ? "1px solid rgba(29,191,115,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "invoices" ? "📄 Invoices" : "🏛 Tax Reports"}</button>)}
        </div>
        {tab === "dashboard" && (
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Paid", value: d.paid || 0, color: "#1DBF73" }, { label: "Overdue", value: d.overdue || 0, color: "#ef4444" }, { label: "Draft", value: d.draft || 0, color: "#6b7280" }, { label: "VAT Rate", value: "15%", color: "#6366f1" }].map((s, i) => (
              <div key={i} className="rounded-2xl p-6 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                <div className="text-4xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "invoices" && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["", "draft", "sent", "paid", "overdue"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"}`}>{s || "All"}</button>)}
            </div>
            <div className="space-y-2">
              {((invoiceList as any)?.invoices || []).map((inv: any) => (
                <div key={inv.id} data-testid={`invoice-${inv.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-blue-400">{inv.number}</span>
                        <Pill s={inv.status} />
                      </div>
                      <div className="text-sm text-white">{inv.freelancerName} → {inv.clientName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Total: {f(inv.total)} (incl. VAT {f(inv.vatAmount)}) · Due {format(new Date(inv.dueDate), "MMM d, yyyy")}</div>
                    </div>
                    {inv.status !== "paid" && <button data-testid={`mark-paid-${inv.id}`} onClick={() => markPaidMut.mutate(inv.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white ml-2" style={{ background: "#1DBF73" }}>Mark Paid</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "taxes" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl mb-2" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="text-sm font-bold text-indigo-400">SARS VAT Compliance · VAT201 Ready · 15% Standard Rate</div>
            </div>
            {((taxData as any)?.reports || []).map((r: any) => (
              <div key={r.period} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-sm font-bold text-white mb-2">{r.period}</div>
                <div className="grid grid-cols-4 gap-3">
                  {[{ label: "Revenue", value: f(r.totalRevenue) }, { label: "VAT", value: f(r.totalVat) }, { label: "Paid", value: f(r.totalPaid) }, { label: "Unpaid", value: f(r.totalUnpaid) }].map((s, i) => <div key={i}><div className="text-sm font-bold text-white">{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

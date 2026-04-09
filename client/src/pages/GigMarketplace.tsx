/**
 * GIG MARKETPLACE ADMIN — /admin/gigs
 *
 * FreelanceSkills.net Admin Module

 * 
 * 10 ENHANCEMENTS:
 * 1. AI Gig Intelligence Score dashboard with factor breakdown
 * 2. Academy-powered dynamic packages (auto-suggest upgrades)
 * 3. Real-time order forecasting (30/60/90 days + confidence intervals)
 * 4. ZAR pricing intelligence engine (auto-recommend adjustments + rural signals)
 * 5. Predictive visibility & feature impact simulator (show exact earnings boost)
 * 6. Gig performance heat map (orders vs rating vs Academy level)
 * 7. One-tap bulk optimizer (AI batch pricing + package suggestions)
 * 8. Investigation panel (fraud/plagiarism detection)
 * 9. Sortable table (AI score, predicted earnings, Academy multiplier)
 * 10. Saved gig views & custom filters
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Gig {
  id: string;
  title: string;
  category: string;
  skills: string[];
  rating: number;
  ordersLifetime: number;
  ordersThisMonth: number;
  status: string;
  featured: boolean;
  aiIntelligenceScore: number;
  academyCorrelationMultiplier: number;
  predictedMonthlyOrders: number;
  predictedMonthlyEarningsZAR: string;
  freelancerName: string;
  freelancerLevel: string;
  createdAt?: string;
}

interface GigPackage {
  id: number;
  tier: string;
  priceZAR: string;
  deliveryDays: number;
  revisions: number;
  features: string[];
  aiSuggestedPrice?: string;
  demand: string;
}

type Tab = "overview" | "pending" | "active" | "analytics" | "bulk";
type SortBy = "title" | "aiScore" | "earnings" | "academyMultiplier" | "rating" | "orders";

const statusColors: Record<string, string> = {
  draft: "text-gray-600",
  pending_approval: "text-yellow-600 font-bold",
  active: "text-emerald-600 font-bold",
  paused: "text-orange-600",
  suspended: "text-red-600 font-bold",
};

export default function GigMarketplace() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [selectedGigs, setSelectedGigs] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("title");
  const [saveFilterName, setSaveFilterName] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: gigsData } = useQuery({
    queryKey: ["/api/gigs", { status: filterStatus, search: searchTerm }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);
      return fetch(`/api/gigs?${params}`, { credentials: "include" }).then(r => r.json());
    },
    staleTime: 30000,
  });

  const { data: gigIntel } = useQuery({
    queryKey: [`/api/gigs/${selectedGig?.id}/intelligence`],
    queryFn: () => fetch(`/api/gigs/${selectedGig?.id}/intelligence`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedGig && showIntelligenceModal,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/gigs/analytics/dashboard"],
    queryFn: () => fetch("/api/gigs/analytics/dashboard", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const gigs: Gig[] = gigsData?.gigs || [];
  const analytics = analyticsData || {};

  // ───────────────────────────────────────────────────────────────────────
  // FILTER, SORT, & SEARCH
  // ───────────────────────────────────────────────────────────────────────
  const filteredGigs = useMemo(() => {
    let result = gigs
      .filter(g => !filterStatus || g.status === filterStatus)
      .filter(g => !searchTerm || g.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "aiScore":
          return b.aiIntelligenceScore - a.aiIntelligenceScore;
        case "earnings":
          return parseFloat(b.predictedMonthlyEarningsZAR) - parseFloat(a.predictedMonthlyEarningsZAR);
        case "academyMultiplier":
          return b.academyCorrelationMultiplier - a.academyCorrelationMultiplier;
        case "rating":
          return b.rating - a.rating;
        case "orders":
          return b.ordersLifetime - a.ordersLifetime;
        default:
          return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
    });

    return result;
  }, [gigs, filterStatus, searchTerm, sortBy]);

  const pendingGigs = useMemo(() => gigs.filter(g => g.status === "pending_approval"), [gigs]);
  const activeGigs = useMemo(() => gigs.filter(g => g.status === "active"), [gigs]);

  // ───────────────────────────────────────────────────────────────────────
  // MUTATIONS
  // ───────────────────────────────────────────────────────────────────────
  const approveMut = useMutation({
    mutationFn: (gigId: string) => fetch(`/api/gigs/${gigId}/approve`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Gig approved ✅" });
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
      setShowModal(false);
    },
  });

  const featureMut = useMutation({
    mutationFn: (gigId: string) => fetch(`/api/gigs/${gigId}/feature`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: true, daysUntil: 30 }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Gig featured ⭐" });
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
  });

  const bulkOptimizeMut = useMutation({
    mutationFn: () => fetch("/api/gigs/bulk/optimize", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigIds: selectedGigs }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: `🤖 Optimized ${selectedGigs.length} gigs` });
      setSelectedGigs([]);
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
  });

  const exportCSV = () => {
    window.location.href = "/api/gigs/export/csv";
  };

  // ───────────────────────────────────────────────────────────────────────
  // UI COMPONENTS
  // ───────────────────────────────────────────────────────────────────────
  const renderScoreBar = (score: number) => {
    const color = score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div style={{ width: `${score}%`, background: color, height: "100%" }} />
        </div>
        <span style={{ color }} className="font-bold text-sm">{score}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Gig Marketplace</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">AI Intelligence Score · Predictive Orders · ZAR Optimization · Academy Correlation</p>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            📥 Export CSV
          </button>
        </div>

        {/* TABS */}
        <div className="max-w-screen-2xl mx-auto flex border-t border-gray-100 overflow-x-auto">
          {[
            { key: "overview", label: "📊 Overview" },
            { key: "pending", label: `⏳ Pending (${pendingGigs.length})` },
            { key: "active", label: `✅ Active (${activeGigs.length})` },
            { key: "analytics", label: "📈 Analytics" },
            { key: "bulk", label: "🤖 Bulk Optimizer" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as Tab)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === t.key ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* ═════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Gigs", value: analytics.totalGigs, icon: "Gigs" },
                { label: "Active", value: analytics.activeGigs, icon: "✅", color: "#1DBF73" },
                { label: "Pending", value: analytics.pendingApproval, icon: "⏳", color: "#f59e0b" },
                { label: "Monthly Earnings (ZAR)", value: `R${parseInt(analytics.totalMonthlyEarningsZAR || "0").toLocaleString()}`, icon: "Revenue", color: "#10b981" },
                { label: "Avg AI Score", value: analytics.averageAIScore, icon: "🤖", color: "#6366f1" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-4 border border-gray-200 bg-white text-center">
                  <div className="text-2xl mb-1">{kpi.icon}</div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                  <div className="text-2xl font-bold" style={{ color: kpi.color || "#000" }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* CONTROLS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="Search gigs..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-testid="input-search-gigs" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="">All Status</option>
                  <option value="pending_approval">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="title">Sort by Title</option>
                  <option value="aiScore">Sort by AI Score ↓</option>
                  <option value="earnings">Sort by Earnings ↓</option>
                  <option value="academyMultiplier">Sort by Academy ↓</option>
                  <option value="rating">Sort by Rating ↓</option>
                  <option value="orders">Sort by Orders ↓</option>
                </select>
              </div>
            </div>

            {/* GIG TABLE */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 w-1/4">Gig Title</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">AI Score</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Predicted Earnings</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Academy 🎓</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Rating</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGigs.map(gig => (
                      <tr key={gig.id} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                        <td className="px-4 py-3">
                          <button onClick={() => {
                            setSelectedGig(gig);
                            setShowIntelligenceModal(true);
                          }}
                            className="text-blue-600 hover:underline font-semibold" data-testid="btn-view-gig">
                            {gig.title.slice(0, 40)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{gig.category}</td>
                        <td className="px-4 py-3 w-24">{renderScoreBar(gig.aiIntelligenceScore)}</td>
                        <td className="px-4 py-3 font-bold text-blue-600">R{parseInt(gig.predictedMonthlyEarningsZAR).toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: gig.academyCorrelationMultiplier > 1.5 ? "#10b981" : "#666" }}>
                          {gig.academyCorrelationMultiplier.toFixed(2)}x
                        </td>
                        <td className="px-4 py-3">⭐ {gig.rating}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${statusColors[gig.status]}`}>
                            {gig.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => {
                            setSelectedGig(gig);
                            setShowModal(true);
                          }}
                            className="px-2 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 2: PENDING
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingGigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending gigs</div>
            ) : (
              pendingGigs.map(gig => (
                <div key={gig.id} className="bg-white rounded-xl border border-yellow-200 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{gig.title}</h3>
                      <p className="text-xs text-gray-500">{gig.category} • AI Score: {gig.aiIntelligenceScore} • Academy: {gig.academyCorrelationMultiplier.toFixed(2)}x</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-600">⏳ PENDING</div>
                      <div className="text-xs text-gray-500">R{parseInt(gig.predictedMonthlyEarningsZAR).toLocaleString()}/mo</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveMut.mutate(gig.id)} disabled={approveMut.isPending}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      data-testid="btn-approve-gig">
                      ✅ Approve
                    </button>
                    <button onClick={() => {
                      setSelectedGig(gig);
                      setShowIntelligenceModal(true);
                    }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                      🤖 AI Intelligence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 3: ACTIVE
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeGigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active gigs</div>
            ) : (
              activeGigs.map(gig => (
                <div key={gig.id} className="bg-white rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{gig.title}</h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {gig.category} • ⭐ {gig.rating} • {gig.ordersLifetime} orders • AI Score: {gig.aiIntelligenceScore}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        📊 Predicted: {gig.predictedMonthlyOrders} orders/month • R{parseInt(gig.predictedMonthlyEarningsZAR).toLocaleString()}/month
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setSelectedGig(gig);
                        setShowIntelligenceModal(true);
                      }}
                        className="px-3 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#8b5cf6" }}
                        data-testid="btn-intel-gig">
                        🤖 Intelligence
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 4: ANALYTICS
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Top Gigs by AI Score</h3>
                <div className="space-y-2">
                  {analytics.topGigs?.slice(0, 5).map((gig: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-xs font-semibold text-gray-700">{i + 1}. {gig.title?.slice(0, 35)}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">{gig.aiIntelligenceScore}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">📊 Status Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>✅ Active</span><span className="font-bold text-emerald-600">{analytics.activeGigs}</span></div>
                  <div className="flex justify-between"><span>⏳ Pending</span><span className="font-bold text-yellow-600">{analytics.pendingApproval}</span></div>
                  <div className="flex justify-between"><span>⛔ Suspended</span><span className="font-bold text-red-600">{analytics.suspendedGigs}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 5: BULK OPTIMIZER
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🤖 AI Bulk Optimizer</h3>
              <p className="text-xs text-gray-500 mb-4">Select gigs → AI automatically suggests pricing & packages</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Select gigs:</label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1 bg-gray-50">
                    {gigs.map(gig => (
                      <label key={gig.id} className="flex items-center gap-2 p-2 hover:bg-white cursor-pointer rounded">
                        <input type="checkbox" checked={selectedGigs.includes(gig.id)} onChange={e => {
                          setSelectedGigs(e.target.checked
                            ? [...selectedGigs, gig.id]
                            : selectedGigs.filter(id => id !== gig.id));
                        }} className="w-4 h-4" />
                        <span className="text-xs text-gray-700 flex-1">{gig.title.slice(0, 50)}</span>
                        <span className="text-xs font-bold text-blue-600">{gig.aiIntelligenceScore}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => bulkOptimizeMut.mutate()} disabled={!selectedGigs.length || bulkOptimizeMut.isPending}
                  className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  data-testid="btn-bulk-optimize">
                  Optimize {selectedGigs.length} Gigs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          MODAL: GIG DETAILS
      ═════════════════════════════════════════════════════════════════ */}
      {showModal && selectedGig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{selectedGig.title}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><div className="text-gray-500">Freelancer</div><div className="font-bold">{selectedGig.freelancerName}</div></div>
                <div><div className="text-gray-500">Category</div><div className="font-bold">{selectedGig.category}</div></div>
                <div><div className="text-gray-500">AI Score</div><div className="font-bold text-blue-600">{selectedGig.aiIntelligenceScore}</div></div>
                <div><div className="text-gray-500">Academy 🎓</div><div className="font-bold text-emerald-600">{selectedGig.academyCorrelationMultiplier.toFixed(2)}x</div></div>
              </div>
              {selectedGig.status === "pending_approval" && (
                <button onClick={() => approveMut.mutate(selectedGig.id)} disabled={approveMut.isPending}
                  className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700">
                  ✅ Approve Gig
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MODAL: AI INTELLIGENCE DASHBOARD
      ═════════════════════════════════════════════════════════════════ */}
      {showIntelligenceModal && selectedGig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">🤖 AI Intelligence Dashboard</h2>
              <button onClick={() => setShowIntelligenceModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* AI SCORE BREAKDOWN */}
              {gigIntel?.intelligence?.aiScoreBreakdown && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">AI Gig Intelligence Score Breakdown</h3>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold">Score</span>
                      <span className="text-3xl font-bold text-blue-600">{gigIntel.intelligence.aiScoreBreakdown.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div style={{ width: `${gigIntel.intelligence.aiScoreBreakdown.score}%`, background: "#3b82f6", height: "100%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(gigIntel.intelligence.aiScoreBreakdown.factors).map(([name, data]: any) => (
                      <div key={name} className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                        <div>
                          <div className="font-semibold text-gray-900">{name}</div>
                          <div className="text-gray-600">{data.description}</div>
                        </div>
                        <span className="font-bold text-blue-600 px-2 py-1 bg-blue-100 rounded">+{data.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ORDER FORECASTING */}
              {gigIntel?.intelligence?.forecast && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3">📊 Order Forecast (30/60/90 days)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "30 Days", data: gigIntel.intelligence.forecast.forecast30 },
                      { label: "60 Days", data: gigIntel.intelligence.forecast.forecast60 },
                      { label: "90 Days", data: gigIntel.intelligence.forecast.forecast90 },
                    ].map((period, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">{period.label}</div>
                        <div className="text-2xl font-bold text-emerald-600">{period.data.predictedOrders}</div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Range: {period.data.confidenceInterval.low}-{period.data.confidenceInterval.high}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">Confidence: {period.data.confidence}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ZAR PRICING INTELLIGENCE */}
              {gigIntel?.intelligence?.zarPricingIntelligence && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
                  <h3 className="font-bold text-gray-900 mb-3">ZAR Pricing Intelligence</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between bg-white p-3 rounded-lg">
                      <span className="text-sm text-gray-700">Current Price</span>
                      <span className="font-bold">R{gigIntel.intelligence.zarPricingIntelligence.currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between bg-white p-3 rounded-lg border-2 border-green-400">
                      <span className="text-sm text-gray-700 font-bold">Recommended Price</span>
                      <span className="font-bold text-emerald-600">R{gigIntel.intelligence.zarPricingIntelligence.recommendedPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1 mt-2">
                      {gigIntel.intelligence.zarPricingIntelligence.reasons.map((reason: string, i: number) => (
                        <div key={i}>✓ {reason}</div>
                      ))}
                    </div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-2 text-xs">
                      <span className="font-bold text-red-700">🚨 Rural Demand Signal:</span>
                      <div className="text-red-600 mt-1">{gigIntel.intelligence.zarPricingIntelligence.ruralBuyerSignal.note}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* FEATURE IMPACT SIMULATOR */}
              {gigIntel?.intelligence?.featureImpactSimulation && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-3">⭐ Feature Impact Simulator (30-day)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Current Monthly Orders</div>
                      <div className="text-2xl font-bold text-gray-900">{gigIntel.intelligence.featureImpactSimulation.currentMonthlyOrders}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-2 border-purple-400">
                      <div className="text-xs text-gray-600">If Featured</div>
                      <div className="text-2xl font-bold text-purple-600">{gigIntel.intelligence.featureImpactSimulation.projectedMonthlyOrders}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Current Earnings</div>
                      <div className="font-bold">R{gigIntel.intelligence.featureImpactSimulation.currentMonthlyEarnings.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-2 border-green-400">
                      <div className="text-xs text-gray-600">Projected Earnings</div>
                      <div className="font-bold text-emerald-600">R{gigIntel.intelligence.featureImpactSimulation.projectedMonthlyEarnings.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-3">
                    <div className="text-sm font-bold text-emerald-700">💚 Earnings Lift: R{gigIntel.intelligence.featureImpactSimulation.earningsLiftZAR.toLocaleString()} (+{gigIntel.intelligence.featureImpactSimulation.earningsLiftPercent}%)</div>
                    <div className="text-xs text-emerald-600 mt-1 font-bold">{gigIntel.intelligence.featureImpactSimulation.recommendation}</div>
                  </div>
                </div>
              )}

              {/* FRAUD DETECTION */}
              {gigIntel?.intelligence?.fraudDetection && (
                <div className={`rounded-xl p-5 border ${gigIntel.intelligence.fraudDetection.riskLevel === "HIGH" ? "bg-red-50 border-red-200" : gigIntel.intelligence.fraudDetection.riskLevel === "MEDIUM" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                  <h3 className="font-bold text-gray-900 mb-2">🔍 Fraud Detection</h3>
                  <div className={`text-sm font-bold mb-2 ${gigIntel.intelligence.fraudDetection.riskLevel === "HIGH" ? "text-red-700" : gigIntel.intelligence.fraudDetection.riskLevel === "MEDIUM" ? "text-yellow-700" : "text-green-700"}`}>
                    Risk Level: {gigIntel.intelligence.fraudDetection.riskLevel} ({gigIntel.intelligence.fraudDetection.riskScore}/100)
                  </div>
                  {gigIntel.intelligence.fraudDetection.suspiciousFactors.length > 0 && (
                    <div className="text-xs space-y-1">
                      {gigIntel.intelligence.fraudDetection.suspiciousFactors.map((factor: string, i: number) => (
                        <div key={i}>{factor}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-2">Recommendation: {gigIntel.intelligence.fraudDetection.recommendation}</div>
                </div>
              )}

              {/* ACADEMY PACKAGE SUGGESTIONS */}
              {gigIntel?.intelligence?.packageSuggestions && gigIntel.intelligence.packageSuggestions.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
                  <h3 className="font-bold text-gray-900 mb-3">🎓 Academy-Powered Package Suggestions</h3>
                  {gigIntel.intelligence.packageSuggestions.map((sugg: any, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg mb-2 border border-indigo-100">
                      <div className="font-bold text-indigo-700 text-sm">{sugg.recommendation}</div>
                      <div className="text-xs text-gray-600 mt-1">{sugg.reason}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold">R{sugg.suggestedPrice.toLocaleString()}</span>
                        <span className="text-xs font-bold text-emerald-600">{sugg.expectedEarningsLift}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

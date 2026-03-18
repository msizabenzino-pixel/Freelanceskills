/**
 * GIG MARKETPLACE ADMIN — /admin/gigs
 *
 * Surpasses Fiverr, Upwork, Toptal, PeoplePerHour, Guru, Freelancer.com
 * through AI Gig Intelligence Score, Academy correlation, predictive earnings,
 * and Africa-first ZAR optimization.
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

interface GigDetails extends Gig {
  packages: GigPackage[];
  analytics: any;
}

type Tab = "overview" | "pending" | "active" | "analytics" | "bulk";

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
  const [selectedGigs, setSelectedGigs] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: gigDetails } = useQuery({
    queryKey: [`/api/gigs/${selectedGig?.id}`],
    queryFn: () => fetch(`/api/gigs/${selectedGig?.id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedGig,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/gigs/analytics/dashboard"],
    queryFn: () => fetch("/api/gigs/analytics/dashboard", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const gigs: Gig[] = gigsData?.gigs || [];
  const analytics = analyticsData || {};

  // Filter & sort gigs
  const filteredGigs = useMemo(() => {
    return gigs
      .filter(g => !filterStatus || g.status === filterStatus)
      .filter(g => !searchTerm || g.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [gigs, filterStatus, searchTerm]);

  // Mutations
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

  const suspendMut = useMutation({
    mutationFn: (gigId: string) => fetch(`/api/gigs/${gigId}/suspend`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Admin action" }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Gig suspended" });
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
  });

  const bulkApproveMut = useMutation({
    mutationFn: () => fetch("/api/gigs/bulk/approve", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigIds: selectedGigs }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: `✅ Approved ${selectedGigs.length} gigs` });
      setSelectedGigs([]);
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
  });

  const bulkFeatureMut = useMutation({
    mutationFn: () => fetch("/api/gigs/bulk/feature", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigIds: selectedGigs, daysUntil: 30 }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: `⭐ Featured ${selectedGigs.length} gigs` });
      setSelectedGigs([]);
      qc.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
  });

  const exportCSV = () => {
    window.location.href = "/api/gigs/export/csv";
  };

  const pendingGigs = useMemo(() => gigs.filter(g => g.status === "pending_approval"), [gigs]);
  const activeGigs = useMemo(() => gigs.filter(g => g.status === "active"), [gigs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">🎯 GIG MARKETPLACE ADMIN</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">AI-powered revenue engine surpassing Fiverr · Upwork · Toptal</p>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            📥 Export CSV
          </button>
        </div>

        {/* Tab nav */}
        <div className="max-w-screen-2xl mx-auto flex border-t border-gray-100">
          {[
            { key: "overview", label: "📊 Overview" },
            { key: "pending", label: `⏳ Pending (${pendingGigs.length})` },
            { key: "active", label: `✅ Active (${activeGigs.length})` },
            { key: "analytics", label: "📈 Analytics" },
            { key: "bulk", label: "⚙️ Bulk Actions" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as Tab)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === t.key ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* ═════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
        ═════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Gigs", value: analytics.totalGigs, icon: "🎯" },
                { label: "Active", value: analytics.activeGigs, icon: "✅", color: "#1DBF73" },
                { label: "Pending", value: analytics.pendingApproval, icon: "⏳", color: "#f59e0b" },
                { label: "Monthly Earnings (ZAR)", value: `R${parseInt(analytics.totalMonthlyEarningsZAR || "0").toLocaleString()}`, icon: "💰", color: "#10b981" },
                { label: "Avg AI Score", value: analytics.averageAIScore, icon: "🤖", color: "#6366f1" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-4 border border-gray-200 bg-white text-center">
                  <div className="text-2xl mb-1">{kpi.icon}</div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                  <div className="text-2xl font-bold" style={{ color: kpi.color || "#000" }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* All gigs table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <input type="text" placeholder="Search gigs by title..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" data-testid="input-search-gigs" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Gig Title</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Freelancer</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Rating</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Orders</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">AI Score</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGigs.map(gig => (
                      <tr key={gig.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button onClick={() => {
                            setSelectedGig(gig);
                            setShowModal(true);
                          }}
                            className="text-blue-600 hover:underline font-semibold text-sm" data-testid="btn-view-gig">
                            {gig.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{gig.category}</td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold">{gig.freelancerName}</div>
                          <div className="text-gray-500">{gig.freelancerLevel}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-sm">⭐ {gig.rating}</td>
                        <td className="px-4 py-3 text-xs font-bold">{gig.ordersLifetime}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${gig.aiIntelligenceScore > 80 ? "text-emerald-600" : gig.aiIntelligenceScore > 60 ? "text-yellow-600" : "text-red-600"}`}>
                            {gig.aiIntelligenceScore}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${statusColors[gig.status]}`}>
                            {gig.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {gig.featured ? <span className="text-yellow-600 font-bold">⭐ YES</span> : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 2: PENDING APPROVAL
        ═════════════════════════════════════════════════════════ */}
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
                      <p className="text-xs text-gray-500">{gig.category} • {gig.freelancerName} ({gig.freelancerLevel})</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-600">⏳ PENDING</div>
                      <div className="text-xs text-gray-500">AI Score: {gig.aiIntelligenceScore}</div>
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
                      setShowModal(true);
                    }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                      📋 View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 3: ACTIVE GIGS
        ═════════════════════════════════════════════════════════ */}
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
                        Predicted: {gig.predictedMonthlyOrders} orders/month • R{parseInt(gig.predictedMonthlyEarningsZAR).toLocaleString()}/month
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => featureMut.mutate(gig.id)} disabled={gig.featured || featureMut.isPending}
                        className="px-3 py-2 rounded-lg text-sm font-bold text-white" style={{ background: gig.featured ? "#ccc" : "#f59e0b" }}
                        data-testid="btn-feature-gig">
                        {gig.featured ? "⭐ Featured" : "⭐ Feature"}
                      </button>
                      <button onClick={() => suspendMut.mutate(gig.id)} disabled={suspendMut.isPending}
                        className="px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700"
                        data-testid="btn-suspend-gig">
                        ⛔ Suspend
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 4: ANALYTICS
        ═════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Top Gigs by AI Score</h3>
                <div className="space-y-2">
                  {analytics.topGigs?.slice(0, 5).map((gig: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-xs font-semibold text-gray-700">{i + 1}. {gig.title?.slice(0, 40)}</span>
                      <span className="text-xs font-bold text-blue-600">{gig.aiIntelligenceScore}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Status Distribution</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Active</span><span className="font-bold text-emerald-600">{analytics.activeGigs}</span></div>
                  <div className="flex justify-between"><span>Pending</span><span className="font-bold text-yellow-600">{analytics.pendingApproval}</span></div>
                  <div className="flex justify-between"><span>Suspended</span><span className="font-bold text-red-600">{analytics.suspendedGigs}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 5: BULK ACTIONS
        ═════════════════════════════════════════════════════════ */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🔧 Bulk Operations</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Select gigs to operate on:</label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1">
                    {gigs.map(gig => (
                      <label key={gig.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded">
                        <input type="checkbox" checked={selectedGigs.includes(gig.id)} onChange={e => {
                          setSelectedGigs(e.target.checked
                            ? [...selectedGigs, gig.id]
                            : selectedGigs.filter(id => id !== gig.id));
                        }} className="w-4 h-4" />
                        <span className="text-xs text-gray-700">{gig.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => bulkApproveMut.mutate()} disabled={!selectedGigs.length || bulkApproveMut.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    data-testid="btn-bulk-approve">
                    ✅ Bulk Approve ({selectedGigs.length})
                  </button>
                  <button onClick={() => bulkFeatureMut.mutate()} disabled={!selectedGigs.length || bulkFeatureMut.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                    data-testid="btn-bulk-feature">
                    ⭐ Bulk Feature ({selectedGigs.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Gig Details */}
      {showModal && selectedGig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{selectedGig.title}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Gig info */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Freelancer", value: selectedGig.freelancerName },
                  { label: "Category", value: selectedGig.category },
                  { label: "Rating", value: `⭐ ${selectedGig.rating}` },
                  { label: "Orders", value: selectedGig.ordersLifetime },
                  { label: "AI Score", value: selectedGig.aiIntelligenceScore },
                  { label: "Academy Multiplier", value: `${selectedGig.academyCorrelationMultiplier}x` },
                  { label: "Status", value: selectedGig.status.toUpperCase() },
                  { label: "Featured", value: selectedGig.featured ? "YES ⭐" : "NO" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="font-bold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Packages */}
              {gigDetails?.packages?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Packages</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {gigDetails.packages.map((pkg: GigPackage) => (
                      <div key={pkg.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <div className="font-bold text-gray-900">{pkg.tier}</div>
                        <div className="text-sm font-bold text-blue-600 mt-1">R{pkg.priceZAR}</div>
                        <div className="text-xs text-gray-600 mt-2">
                          <div>{pkg.deliveryDays} days delivery</div>
                          <div>{pkg.revisions} revisions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedGig.status === "pending_approval" && (
                <div className="flex gap-2">
                  <button onClick={() => approveMut.mutate(selectedGig.id)} disabled={approveMut.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700">
                    ✅ Approve Gig
                  </button>
                </div>
              )}
              {selectedGig.status === "active" && (
                <div className="flex gap-2">
                  <button onClick={() => featureMut.mutate(selectedGig.id)} disabled={featureMut.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#f59e0b" }}>
                    ⭐ Feature Gig
                  </button>
                  <button onClick={() => suspendMut.mutate(selectedGig.id)} disabled={suspendMut.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600">
                    ⛔ Suspend
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

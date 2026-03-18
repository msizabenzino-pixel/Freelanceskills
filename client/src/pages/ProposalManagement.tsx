/**
 * PROPOSAL MANAGEMENT ADMIN — /admin/proposals
 *
 * 200% INTELLIGENCE: AI Quality Score, Win Probability, Spam Detection, Academy Correlation
 * Surpasses Upwork (JSS) + Fiverr (requests) + Toptal (screening) with real-time intelligence
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Proposal {
  id: string;
  freelancerName: string;
  freelancerAcademyLevel: string;
  jobTitle: string;
  jobBudget: string;
  proposedBudgetZAR: string;
  status: string;
  aiQualityScore: number;
  aiWinProbability: string;
  spamScore: number;
  fraudFlaggedAt?: string;
  isFeatured: boolean;
  coverLetter: string;
  createdAt: string;
}

type Tab = "overview" | "pending" | "shortlisted" | "quality" | "spam" | "analytics";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 font-bold",
  shortlisted: "text-blue-600 font-bold",
  accepted: "text-emerald-600 font-bold",
  rejected: "text-red-600 font-bold",
  withdrawn: "text-gray-600",
};

export default function ProposalManagement() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: proposalsData } = useQuery({
    queryKey: ["/api/proposals", { status: filterStatus, search: searchTerm }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);
      return fetch(`/api/proposals?${params}`, { credentials: "include" }).then(r => r.json());
    },
    staleTime: 30000,
  });

  const { data: proposalIntel } = useQuery({
    queryKey: [`/api/proposals/${selectedProposal?.id}/intelligence`],
    queryFn: () => fetch(`/api/proposals/${selectedProposal?.id}/intelligence`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedProposal && showIntelligenceModal,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/proposals/analytics/dashboard"],
    queryFn: () => fetch("/api/proposals/analytics/dashboard", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const proposals: Proposal[] = proposalsData?.proposals || [];
  const analytics = analyticsData || {};

  const filteredProposals = useMemo(() => {
    return proposals
      .filter(p => !filterStatus || p.status === filterStatus)
      .filter(p => !searchTerm || p.freelancerName?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [proposals, filterStatus, searchTerm]);

  const pendingProposals = useMemo(() => proposals.filter(p => p.status === "pending"), [proposals]);
  const shortlistedProposals = useMemo(() => proposals.filter(p => p.status === "shortlisted"), [proposals]);
  const spamProposals = useMemo(() => proposals.filter(p => p.spamScore > 30), [proposals]);

  // Mutations
  const shortlistMut = useMutation({
    mutationFn: (proposalId: string) => fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "shortlisted" }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Proposal shortlisted ✅" });
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
      setShowModal(false);
    },
  });

  const rejectMut = useMutation({
    mutationFn: (proposalId: string) => fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Proposal rejected" });
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
    },
  });

  const bulkRemoveSpamMut = useMutation({
    mutationFn: () => fetch("/api/proposals/bulk/remove-spam", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalIds: selectedProposals }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: `✅ Removed ${selectedProposals.length} spam proposals` });
      setSelectedProposals([]);
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
    },
  });

  const bulkShortlistMut = useMutation({
    mutationFn: () => fetch("/api/proposals/bulk/shortlist", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalIds: selectedProposals }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: `✅ Shortlisted ${selectedProposals.length} proposals` });
      setSelectedProposals([]);
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
    },
  });

  const exportCSV = () => {
    window.location.href = "/api/proposals/export/csv";
  };

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
            <h1 className="text-2xl font-bold text-gray-900">💬 PROPOSAL MANAGEMENT (200% Intelligence)</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">AI Quality Score · Win Probability · Spam Detection · Academy Correlation</p>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            📥 Export CSV
          </button>
        </div>

        {/* TABS */}
        <div className="max-w-screen-2xl mx-auto flex border-t border-gray-100 overflow-x-auto">
          {[
            { key: "overview", label: "📊 Overview" },
            { key: "pending", label: `⏳ Pending (${pendingProposals.length})` },
            { key: "shortlisted", label: `✅ Shortlisted (${shortlistedProposals.length})` },
            { key: "quality", label: "⭐ Quality Review" },
            { key: "spam", label: `🚨 Spam (${spamProposals.length})` },
            { key: "analytics", label: "📈 Analytics" },
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { label: "Total Proposals", value: analytics.totalProposals, icon: "💬" },
                { label: "Pending", value: analytics.pending, icon: "⏳", color: "#f59e0b" },
                { label: "Shortlisted", value: analytics.shortlisted, icon: "✅", color: "#3b82f6" },
                { label: "Accepted", value: analytics.accepted, icon: "🎉", color: "#10b981" },
                { label: "Spam Detected", value: analytics.spamDetected, icon: "🚨", color: "#ef4444" },
                { label: "Avg Quality", value: analytics.averageQualityScore, icon: "⭐", color: "#6366f1" },
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
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Search freelancer..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* PROPOSALS TABLE */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Freelancer</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Job</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Proposed</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Quality</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Win %</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Academy</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map(proposal => (
                      <tr key={proposal.id} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                        <td className="px-4 py-3 font-semibold">{proposal.freelancerName}</td>
                        <td className="px-4 py-3 text-gray-600">{proposal.jobTitle?.slice(0, 30)}</td>
                        <td className="px-4 py-3 font-bold text-blue-600">R{parseInt(proposal.proposedBudgetZAR).toLocaleString()}</td>
                        <td className="px-4 py-3 w-20">{renderScoreBar(proposal.aiQualityScore)}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{(parseFloat(proposal.aiWinProbability) * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 font-bold" style={{ color: proposal.freelancerAcademyLevel === "Top Rated" ? "#10b981" : "#666" }}>
                          {proposal.freelancerAcademyLevel || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${statusColors[proposal.status]}`}>
                            {proposal.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => {
                            setSelectedProposal(proposal);
                            setShowIntelligenceModal(true);
                          }}
                            className="px-2 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                            🤖 Intel
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
            {pendingProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending proposals</div>
            ) : (
              pendingProposals.map(proposal => (
                <div key={proposal.id} className="bg-white rounded-xl border border-yellow-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{proposal.freelancerName}</h3>
                      <p className="text-xs text-gray-500">{proposal.jobTitle} • Quality: {proposal.aiQualityScore} • Win: {(parseFloat(proposal.aiWinProbability) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-600">⏳ PENDING</div>
                      <div className="text-xs text-gray-500">R{parseInt(proposal.proposedBudgetZAR).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => shortlistMut.mutate(proposal.id)} disabled={shortlistMut.isPending}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                      ✅ Shortlist
                    </button>
                    <button onClick={() => rejectMut.mutate(proposal.id)} disabled={rejectMut.isPending}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                      ❌ Reject
                    </button>
                    <button onClick={() => {
                      setSelectedProposal(proposal);
                      setShowIntelligenceModal(true);
                    }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                      🤖 Intelligence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 3: SHORTLISTED
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "shortlisted" && (
          <div className="space-y-4">
            {shortlistedProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No shortlisted proposals</div>
            ) : (
              shortlistedProposals.map(proposal => (
                <div key={proposal.id} className="bg-white rounded-xl border border-blue-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{proposal.freelancerName}</h3>
                      <p className="text-xs text-gray-500">{proposal.jobTitle} • Academy: {proposal.freelancerAcademyLevel}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">✅ SHORTLISTED</div>
                      <div className="text-xs text-gray-500">Estimated ROI: {proposal.freelancerAcademyLevel ? "High" : "Medium"}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 4: QUALITY REVIEW
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "quality" && (
          <div className="space-y-4">
            {proposals.filter(p => p.aiQualityScore > 75).length === 0 ? (
              <div className="text-center py-8 text-gray-500">No high-quality proposals yet</div>
            ) : (
              proposals.filter(p => p.aiQualityScore > 75).map(proposal => (
                <div key={proposal.id} className="bg-white rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{proposal.freelancerName}</h3>
                      <div className="text-xs text-gray-500 mt-1">Quality: {proposal.aiQualityScore} | Win: {(parseFloat(proposal.aiWinProbability) * 100).toFixed(0)}% | {proposal.jobTitle}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">⭐ {proposal.aiQualityScore}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 5: SPAM DETECTION
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "spam" && (
          <div className="space-y-4">
            {spamProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No spam detected</div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <label className="text-sm font-bold text-gray-700 block mb-2">Select spam to remove:</label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1 bg-gray-50">
                    {spamProposals.map(proposal => (
                      <label key={proposal.id} className="flex items-center gap-2 p-2 hover:bg-white cursor-pointer rounded">
                        <input type="checkbox" checked={selectedProposals.includes(proposal.id)} onChange={e => {
                          setSelectedProposals(e.target.checked
                            ? [...selectedProposals, proposal.id]
                            : selectedProposals.filter(id => id !== proposal.id));
                        }} className="w-4 h-4" />
                        <span className="text-xs text-gray-700 flex-1">{proposal.freelancerName} - {proposal.jobTitle}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded">Spam: {proposal.spamScore}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => bulkRemoveSpamMut.mutate()} disabled={!selectedProposals.length || bulkRemoveSpamMut.isPending}
                  className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                  🗑️ Remove {selectedProposals.length} Spam
                </button>
              </>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 6: ANALYTICS
        ═════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">⭐ Top Quality Proposals</h3>
                <div className="space-y-2">
                  {analytics.topProposals?.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-xs font-semibold text-gray-700">{i + 1}. {p.freelancerName?.slice(0, 30)}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">{p.aiQualityScore}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">📊 Status Distribution</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>⏳ Pending</span><span className="font-bold text-yellow-600">{analytics.pending}</span></div>
                  <div className="flex justify-between"><span>✅ Shortlisted</span><span className="font-bold text-blue-600">{analytics.shortlisted}</span></div>
                  <div className="flex justify-between"><span>🎉 Accepted</span><span className="font-bold text-emerald-600">{analytics.accepted}</span></div>
                  <div className="flex justify-between"><span>🚨 Spam</span><span className="font-bold text-red-600">{analytics.spamDetected}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          MODAL: AI INTELLIGENCE DASHBOARD
      ═════════════════════════════════════════════════════════════════ */}
      {showIntelligenceModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">🤖 AI Intelligence Dashboard</h2>
              <button onClick={() => setShowIntelligenceModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* QUALITY SCORE */}
              {proposalIntel?.intelligence?.qualityScore && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">⭐ AI Quality Score</h3>
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-blue-600">{proposalIntel.intelligence.qualityScore.score}</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                      <div style={{ width: `${proposalIntel.intelligence.qualityScore.score}%`, background: "#3b82f6", height: "100%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(proposalIntel.intelligence.qualityScore.factors).map(([name, points]: any) => (
                      <div key={name} className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                        <span className="text-gray-700">{name}</span>
                        <span className="font-bold text-blue-600">+{points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WIN PROBABILITY */}
              {proposalIntel?.intelligence?.winProbability && (
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                  <h3 className="font-bold text-gray-900 mb-3">🎯 Win Probability</h3>
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-emerald-600">{(proposalIntel.intelligence.winProbability.probability * 100).toFixed(0)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                      <div style={{ width: `${proposalIntel.intelligence.winProbability.probability * 100}%`, background: "#10b981", height: "100%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(proposalIntel.intelligence.winProbability.factors).map(([name, score]: any) => (
                      <div key={name} className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                        <span className="text-gray-700">{name}</span>
                        <span className="font-bold text-emerald-600">{(score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FRAUD DETECTION */}
              {proposalIntel?.intelligence?.fraudDetection && (
                <div className={`rounded-xl p-5 border ${proposalIntel.intelligence.fraudDetection.spamScore > 50 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                  <h3 className="font-bold text-gray-900 mb-2">🔍 Fraud Detection</h3>
                  <div className={`text-sm font-bold mb-2 ${proposalIntel.intelligence.fraudDetection.spamScore > 50 ? "text-red-700" : "text-green-700"}`}>
                    Spam Score: {proposalIntel.intelligence.fraudDetection.spamScore}/100
                  </div>
                  {proposalIntel.intelligence.fraudDetection.flags.length > 0 && (
                    <div className="text-xs space-y-1">
                      {proposalIntel.intelligence.fraudDetection.flags.map((flag: string, i: number) => (
                        <div key={i} className="text-gray-700">{flag}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

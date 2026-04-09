import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  Briefcase, DollarSign, Users, TrendingUp, Eye, CheckCircle, Clock,
  MessageSquare, Star, ArrowRight, Filter, Download, MoreHorizontal,
  Zap, AlertCircle, ChevronDown, Eye as EyeIcon,
} from "lucide-react";

interface ClientJob {
  id: string;
  title: string;
  budget: number;
  status: string;
  freelancerId?: string;
  createdAt: string;
  bidCount: number;
}

interface BidWithFreelancer {
  id: string;
  freelancerId: string;
  amount: number;
  message: string;
  estimatedDelivery: number;
  status: string;
  createdAt: string;
  freelancer: { title: string; rating: number };
}

export default function ClientDashboard() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [expandedBid, setExpandedBid] = useState<string | null>(null);

  // Fetch client's jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["clientJobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs?clientId=me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json() as Promise<ClientJob[]>;
    },
  });

  // Fetch bids for selected job
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["jobBids", selectedJob],
    queryFn: async () => {
      if (!selectedJob) return [];
      const res = await fetch(`/api/jobs/${selectedJob}/bids`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bids");
      return res.json() as Promise<BidWithFreelancer[]>;
    },
    enabled: !!selectedJob,
  });

  // Accept bid mutation
  const acceptBidMutation = useMutation({
    mutationFn: async ({ jobId, bidId }: { jobId: string; bidId: string }) => {
      const res = await fetch(`/api/jobs/${jobId}/accept-bid/${bidId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to accept bid");
      return res.json();
    },
    onSuccess: () => {
      setSelectedJob(null);
    },
  });

  // Release escrow mutation
  const releaseEscrowMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      const res = await fetch(`/api/escrow/release/${escrowId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to release escrow");
      return res.json();
    },
  });

  const openJobs = (jobs || []).filter(j => j.status === "open").length;
  const activeJobs = (jobs || []).filter(j => ["hired", "in_progress"].includes(j.status)).length;
  const completedJobs = (jobs || []).filter(j => j.status === "completed").length;
  const totalSpent = (jobs || []).reduce((sum, j) => sum + (j.budget / 100), 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
            </div>
            <p className="text-gray-400">Manage your jobs, review bids, and release payments</p>
          </div>

          {/* Loading state */}
          {jobsLoading && (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Loading your dashboard…
              </div>
            </div>
          )}

          {/* KPI Cards + Main Content */}
          {!jobsLoading && <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Open Jobs", value: openJobs, icon: <Clock className="w-5 h-5" />, color: "blue" },
              { label: "Active", value: activeJobs, icon: <Zap className="w-5 h-5" />, color: "emerald" },
              { label: "Completed", value: completedJobs, icon: <CheckCircle className="w-5 h-5" />, color: "purple" },
              { label: "Total Spent", value: `R${totalSpent.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "amber" },
            ].map(kpi => (
              <div key={kpi.label} className={`bg-gray-900 border border-gray-700 rounded-xl p-4 text-${kpi.color}-400`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{kpi.label}</span>
                  {kpi.icon}
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Your Jobs
                </h2>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {jobs && jobs.length > 0 ? (
                    jobs.map(job => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        data-testid={`job-card-${job.id}`}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedJob === job.id
                            ? "bg-blue-600/20 border-blue-500"
                            : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                        }`}>
                        <p className="font-medium text-white text-sm line-clamp-2">{job.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            job.status === "open" ? "bg-blue-600/20 text-blue-400" :
                            job.status === "hired" ? "bg-emerald-600/20 text-emerald-400" :
                            "bg-gray-700/40 text-gray-400"
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-xs text-gray-500">{job.bidCount} bids</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No jobs posted yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bids & Details */}
            <div className="lg:col-span-2">
              {selectedJob ? (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5" /> Bids
                    </h2>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition">
                      Close
                    </button>
                  </div>

                  {bidsLoading ? (
                    <p className="text-gray-400">Loading bids...</p>
                  ) : bids && bids.length > 0 ? (
                    <div className="space-y-3">
                      {bids.map(bid => (
                        <div key={bid.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-white text-sm">{bid.freelancer?.title || "Freelancer"}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-xs text-gray-400">{bid.freelancer?.rating || "N/A"}★</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-400">R {(bid.amount / 100).toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{bid.estimatedDelivery} days</p>
                            </div>
                          </div>

                          {bid.message && (
                            <button
                              onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                              className="w-full text-left mb-3 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition">
                              <p className="text-xs text-gray-400 line-clamp-1">{bid.message}</p>
                              <p className="text-xs text-gray-600 mt-1">Click to read full message</p>
                            </button>
                          )}

                          {expandedBid === bid.id && bid.message && (
                            <div className="mb-3 p-2 bg-gray-700/20 rounded-lg border border-gray-700">
                              <p className="text-sm text-gray-300">{bid.message}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {bid.status === "pending" && (
                              <button
                                onClick={() =>
                                  acceptBidMutation.mutate({
                                    jobId: selectedJob,
                                    bidId: bid.id,
                                  })
                                }
                                disabled={acceptBidMutation.isPending}
                                data-testid={`accept-bid-${bid.id}`}
                                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition">
                                {acceptBidMutation.isPending ? "Accepting..." : "Accept"}
                              </button>
                            )}
                            {bid.status === "accepted" && (
                              <div className="flex-1 px-3 py-2 bg-emerald-600/20 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-600/50 flex items-center justify-center">
                                ✓ Accepted
                              </div>
                            )}
                            <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No bids yet. Be patient or boost your job listing!</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-12 text-center">
                  <EyeIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a job to view and manage bids</p>
                </div>
              )}
            </div>
          </div>
          </>}
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}

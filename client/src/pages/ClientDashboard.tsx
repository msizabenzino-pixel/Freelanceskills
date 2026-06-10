import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import {
  Briefcase, DollarSign, CheckCircle, Clock, MessageSquare, Star,
  Zap, Users, ChevronDown, ChevronUp, UserCheck, XCircle, CalendarClock,
  FileText, Eye, LayoutList, Columns,
} from "lucide-react";

interface ClientJob {
  id: string;
  title: string;
  budget: number;
  status: string;
  freelancerId?: string;
  createdAt: string;
  applicantCount?: number;
}

interface Applicant {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  coverLetter: string | null;
  resumeSummary: string | null;
  status: string;
  appliedAt: string;
  freelancerName: string;
  freelancerEmail: string | null;
  profileTitle: string | null;
  profileBio: string | null;
  profilePhotoUrl: string | null;
  hourlyRate: number | null;
  rating: number | null;
  completedJobs: number;
  employabilityScore: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  applied:     { label: "Applied",      color: "bg-slate-600/20 text-slate-400 border-slate-600/40" },
  reviewing:   { label: "Reviewing",    color: "bg-blue-600/20 text-blue-400 border-blue-600/40" },
  shortlisted: { label: "Shortlisted",  color: "bg-amber-600/20 text-amber-400 border-amber-600/40" },
  interview:   { label: "Interview",    color: "bg-purple-600/20 text-purple-400 border-purple-600/40" },
  offer:       { label: "Offer Sent",   color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40" },
  rejected:    { label: "Rejected",     color: "bg-red-600/20 text-red-400 border-red-600/40" },
  hired:       { label: "Hired",        color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40" },
};

// ── Pipeline column definitions ────────────────────────────────────────────────
const PIPELINE_COLUMNS: Array<{
  key: string;
  label: string;
  headerColor: string;
  dotColor: string;
  dropBg: string;
}> = [
  { key: "applied",     label: "Applied",     headerColor: "text-slate-300",   dotColor: "bg-slate-500",   dropBg: "bg-slate-800/80" },
  { key: "shortlisted", label: "Shortlisted", headerColor: "text-amber-300",   dotColor: "bg-amber-500",   dropBg: "bg-amber-900/20" },
  { key: "interview",   label: "Interview",   headerColor: "text-purple-300",  dotColor: "bg-purple-500",  dropBg: "bg-purple-900/20" },
  { key: "offer",       label: "Offer",       headerColor: "text-emerald-300", dotColor: "bg-emerald-500", dropBg: "bg-emerald-900/20" },
  { key: "hired",       label: "Hired",       headerColor: "text-green-300",   dotColor: "bg-green-500",   dropBg: "bg-green-900/20" },
];

// ── Shared initials helper ─────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

// ── List view card ─────────────────────────────────────────────────────────────
function ApplicantCard({
  applicant,
  onStatusChange,
  isPending,
}: {
  applicant: Applicant;
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  const statusCfg = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.applied;
  const initials = getInitials(applicant.freelancerName);

  return (
    <div
      data-testid={`applicant-card-${applicant.id}`}
      className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {applicant.profilePhotoUrl ? (
            <img
              src={applicant.profilePhotoUrl}
              alt={applicant.freelancerName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{applicant.freelancerName}</p>
            {applicant.profileTitle && (
              <p className="text-xs text-slate-400 truncate">{applicant.profileTitle}</p>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {applicant.hourlyRate !== null && (
                <span className="text-xs text-emerald-400">
                  R{(applicant.hourlyRate / 100).toLocaleString()}/hr
                </span>
              )}
              {applicant.rating !== null && applicant.rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {(applicant.rating / 100).toFixed(1)}
                </span>
              )}
              {applicant.completedJobs > 0 && (
                <span className="text-xs text-slate-500">{applicant.completedJobs} jobs done</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <span className="text-xs text-slate-600">
            {new Date(applicant.appliedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* Cover letter preview */}
      {(applicant.coverLetter || applicant.resumeSummary) && (
        <div>
          <button
            data-testid={`toggle-cover-${applicant.id}`}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            {expanded ? "Hide cover letter" : "View cover letter"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-700/60 text-sm text-slate-300 whitespace-pre-line">
              {applicant.coverLetter || applicant.resumeSummary}
            </div>
          )}
        </div>
      )}

      {/* Bio */}
      {!expanded && applicant.profileBio && (
        <p className="text-xs text-slate-500 line-clamp-2">{applicant.profileBio}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap pt-1">
        {applicant.status !== "hired" && applicant.status !== "rejected" && (
          <>
            {applicant.status !== "shortlisted" && (
              <button
                data-testid={`shortlist-${applicant.id}`}
                disabled={isPending}
                onClick={() => onStatusChange(applicant.id, "shortlisted")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/40 rounded-lg transition disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Shortlist
              </button>
            )}
            {applicant.status !== "interview" && (
              <button
                data-testid={`interview-${applicant.id}`}
                disabled={isPending}
                onClick={() => onStatusChange(applicant.id, "interview")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/40 rounded-lg transition disabled:opacity-50"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                Interview
              </button>
            )}
            <button
              data-testid={`reject-${applicant.id}`}
              disabled={isPending}
              onClick={() => onStatusChange(applicant.id, "rejected")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 rounded-lg transition disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </>
        )}
        <button
          data-testid={`message-${applicant.id}`}
          onClick={() => setLocation(`/messages?new=${applicant.userId}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/40 rounded-lg transition"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Message
        </button>
      </div>
    </div>
  );
}

// ── Pipeline kanban card (draggable, compact) ──────────────────────────────────
function PipelineCard({
  applicant,
  onDragStart,
  onStatusChange,
  isPending,
}: {
  applicant: Applicant;
  onDragStart: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}) {
  const [, setLocation] = useLocation();
  const initials = getInitials(applicant.freelancerName);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(applicant.id)}
      data-testid={`pipeline-card-${applicant.id}`}
      className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-slate-500 transition-colors select-none"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-2 mb-2">
        {applicant.profilePhotoUrl ? (
          <img
            src={applicant.profilePhotoUrl}
            alt={applicant.freelancerName}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-[11px] font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{applicant.freelancerName}</p>
          {applicant.profileTitle && (
            <p className="text-[10px] text-slate-400 truncate">{applicant.profileTitle}</p>
          )}
        </div>
      </div>

      {/* Rate + rating */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {applicant.hourlyRate !== null && (
          <span className="text-[10px] text-emerald-400">
            R{(applicant.hourlyRate / 100).toLocaleString()}/hr
          </span>
        )}
        {applicant.rating !== null && applicant.rating > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {(applicant.rating / 100).toFixed(1)}
          </span>
        )}
        <span className="text-[10px] text-slate-600 ml-auto">
          {new Date(applicant.appliedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1">
        <button
          data-testid={`pipeline-message-${applicant.id}`}
          onClick={(e) => { e.stopPropagation(); setLocation(`/messages?new=${applicant.userId}`); }}
          className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-slate-400 hover:text-slate-300 bg-slate-700/40 hover:bg-slate-700 rounded transition"
        >
          <MessageSquare className="w-3 h-3" /> Msg
        </button>
        {applicant.status !== "hired" && applicant.status !== "rejected" && (
          <button
            data-testid={`pipeline-reject-${applicant.id}`}
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); onStatusChange(applicant.id, "rejected"); }}
            className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 rounded transition disabled:opacity-50"
          >
            <XCircle className="w-3 h-3" /> Reject
          </button>
        )}
      </div>
    </div>
  );
}

// ── Pipeline kanban board ──────────────────────────────────────────────────────
function PipelineView({
  applicants,
  onStatusChange,
  isPending,
}: {
  applicants: Applicant[];
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  // Optimistic local status overrides (cleared once server refetch lands)
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const dragCounter = useRef<Record<string, number>>({});

  function getStatus(a: Applicant) {
    return localStatuses[a.id] ?? a.status;
  }

  function handleDrop(colKey: string) {
    if (!draggedId) return;
    const applicant = applicants.find((a) => a.id === draggedId);
    if (!applicant) return;
    const currentStatus = getStatus(applicant);
    if (currentStatus === colKey) {
      setDraggedId(null);
      setDragOverCol(null);
      return;
    }
    // Optimistic update
    setLocalStatuses((prev) => ({ ...prev, [draggedId]: colKey }));
    onStatusChange(draggedId, colKey);
    setDraggedId(null);
    setDragOverCol(null);
    dragCounter.current = {};
  }

  function handleDragEnter(colKey: string) {
    dragCounter.current[colKey] = (dragCounter.current[colKey] ?? 0) + 1;
    setDragOverCol(colKey);
  }

  function handleDragLeave(colKey: string) {
    dragCounter.current[colKey] = (dragCounter.current[colKey] ?? 0) - 1;
    if ((dragCounter.current[colKey] ?? 0) <= 0) {
      dragCounter.current[colKey] = 0;
      setDragOverCol((prev) => (prev === colKey ? null : prev));
    }
  }

  return (
    <div
      className="overflow-x-auto pb-2"
      data-testid="pipeline-view"
    >
      <div className="flex gap-3 min-w-max">
        {PIPELINE_COLUMNS.map((col) => {
          const colApplicants = applicants.filter((a) => getStatus(a) === col.key);
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              data-testid={`pipeline-column-${col.key}`}
              className={`w-48 flex flex-col rounded-xl border transition-colors ${
                isOver
                  ? `${col.dropBg} border-slate-500`
                  : "bg-slate-800/40 border-slate-700/60"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => handleDragEnter(col.key)}
              onDragLeave={() => handleDragLeave(col.key)}
              onDrop={() => handleDrop(col.key)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-700/60">
                <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
                <span className={`text-xs font-semibold ${col.headerColor} flex-1`}>{col.label}</span>
                <span className="text-xs text-slate-500 font-medium">{colApplicants.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {colApplicants.length === 0 ? (
                  <div className={`h-full flex items-center justify-center text-[10px] text-slate-600 ${isOver ? "text-slate-400" : ""}`}>
                    {isOver ? "Drop here" : "Empty"}
                  </div>
                ) : (
                  colApplicants.map((a) => (
                    <PipelineCard
                      key={a.id}
                      applicant={{ ...a, status: getStatus(a) }}
                      onDragStart={setDraggedId}
                      onStatusChange={(id, status) => {
                        setLocalStatuses((prev) => ({ ...prev, [id]: status }));
                        onStatusChange(id, status);
                      }}
                      isPending={isPending}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["clientJobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs?clientId=me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      return (Array.isArray(data) ? data : data.jobs ?? []) as ClientJob[];
    },
  });

  const jobs = jobsData ?? [];

  const { data: applicantsData, isLoading: applicantsLoading } = useQuery({
    queryKey: ["jobApplicants", selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return { applicants: [], total: 0 };
      const res = await fetch(`/api/jobs/${selectedJobId}/applicants`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json() as Promise<{ applicants: Applicant[]; total: number }>;
    },
    enabled: !!selectedJobId,
  });

  const applicants = applicantsData?.applicants ?? [];

  const statusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const res = await fetch(`/api/job-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplicants", selectedJobId] });
    },
  });

  const handleStatusChange = (applicationId: string, status: string) => {
    statusMutation.mutate({ applicationId, status });
  };

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const activeJobs = jobs.filter((j) => ["hired", "in_progress"].includes(j.status)).length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const totalSpent = jobs.reduce((sum, j) => sum + j.budget / 100, 0);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const applicantsByStatus = {
    new: applicants.filter((a) => a.status === "applied").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    interview: applicants.filter((a) => a.status === "interview").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
            </div>
            <p className="text-slate-400">Manage your jobs, review applicants, and hire top talent</p>
          </div>

          {jobsLoading && (
            <div className="flex items-center justify-center py-24 text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Loading your dashboard…
              </div>
            </div>
          )}

          {!jobsLoading && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Open Jobs",    value: openJobs,                             icon: <Clock className="w-5 h-5" />,        color: "blue" },
                  { label: "Active",       value: activeJobs,                           icon: <Zap className="w-5 h-5" />,           color: "emerald" },
                  { label: "Completed",    value: completedJobs,                        icon: <CheckCircle className="w-5 h-5" />,   color: "purple" },
                  { label: "Total Spent",  value: `R${totalSpent.toLocaleString()}`,    icon: <DollarSign className="w-5 h-5" />,    color: "amber" },
                ].map((kpi) => (
                  <div key={kpi.label} className={`bg-slate-900 border border-slate-700 rounded-xl p-4 text-${kpi.color}-400`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">{kpi.label}</span>
                      {kpi.icon}
                    </div>
                    <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Main layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Jobs list */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" /> Your Jobs
                    </h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {jobs.length > 0 ? (
                        jobs.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => setSelectedJobId(job.id === selectedJobId ? null : job.id)}
                            data-testid={`job-card-${job.id}`}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedJobId === job.id
                                ? "bg-blue-600/20 border-blue-500"
                                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <p className="font-medium text-white text-sm line-clamp-2">{job.title}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  job.status === "open"
                                    ? "bg-blue-600/20 text-blue-400"
                                    : job.status === "hired"
                                    ? "bg-emerald-600/20 text-emerald-400"
                                    : "bg-slate-700/40 text-slate-400"
                                }`}
                              >
                                {job.status}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Users className="w-3 h-3" />
                                {job.applicantCount ?? 0}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No jobs posted yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applicants panel */}
                <div className="lg:col-span-2">
                  {selectedJobId && selectedJob ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                      {/* Panel header */}
                      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" /> Applicants
                          </h2>
                          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{selectedJob.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* View mode toggle */}
                          {applicants.length > 0 && (
                            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                              <button
                                data-testid="view-mode-list"
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  viewMode === "list"
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-slate-300"
                                }`}
                              >
                                <LayoutList className="w-3.5 h-3.5" />
                                List
                              </button>
                              <button
                                data-testid="view-mode-pipeline"
                                onClick={() => setViewMode("pipeline")}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  viewMode === "pipeline"
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-slate-300"
                                }`}
                              >
                                <Columns className="w-3.5 h-3.5" />
                                Pipeline
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedJobId(null)}
                            data-testid="close-applicants"
                            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      {/* Summary bar (list view only) */}
                      {applicants.length > 0 && viewMode === "list" && (
                        <div className="grid grid-cols-4 gap-2 mb-5">
                          {[
                            { label: "New",        value: applicantsByStatus.new,         color: "text-slate-400" },
                            { label: "Shortlisted", value: applicantsByStatus.shortlisted, color: "text-amber-400" },
                            { label: "Interview",  value: applicantsByStatus.interview,   color: "text-purple-400" },
                            { label: "Rejected",   value: applicantsByStatus.rejected,    color: "text-red-400" },
                          ].map((s) => (
                            <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                              <p className="text-xs text-slate-500">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      {applicantsLoading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Loading applicants…
                        </div>
                      ) : applicants.length > 0 ? (
                        viewMode === "pipeline" ? (
                          <PipelineView
                            applicants={applicants}
                            onStatusChange={handleStatusChange}
                            isPending={statusMutation.isPending}
                          />
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {applicants.map((a) => (
                              <ApplicantCard
                                key={a.id}
                                applicant={a}
                                onStatusChange={handleStatusChange}
                                isPending={statusMutation.isPending}
                              />
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">No applicants yet</p>
                          <p className="text-slate-600 text-xs mt-1">
                            Share your job post to attract more talent
                          </p>
                        </div>
                      )}

                      {/* Status mutation error */}
                      {statusMutation.isError && (
                        <p className="text-red-400 text-xs mt-3 text-center">
                          {(statusMutation.error as Error).message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
                      <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Select a job to review its applicants</p>
                      <p className="text-slate-600 text-sm mt-2">
                        Click any job on the left to see who has applied
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}

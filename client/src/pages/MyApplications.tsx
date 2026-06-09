/**
 * FreelanceSkills — My Applications Dashboard
 * Full Kanban-style pipeline: Applied → Under Review → Interview → Offer / Rejected
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Briefcase, Building2, MapPin, Clock, Copy, ExternalLink, CheckCircle,
  BrainCircuit, ChevronRight, Loader2, Star, Zap, AlertCircle, Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { JobApplication } from "@shared/models/jobs";

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  applied:        { label: "Applied",        color: "text-blue-400",    bg: "bg-blue-500/15",    border: "border-blue-500/30" },
  reviewing:      { label: "Under Review",   color: "text-violet-400",  bg: "bg-violet-500/15",  border: "border-violet-500/30" },
  interview:      { label: "Interview",      color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30" },
  offer:          { label: "Offer Received", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  rejected:       { label: "Rejected",       color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/30" },
  withdrawn:      { label: "Withdrawn",      color: "text-slate-400",   bg: "bg-slate-500/15",   border: "border-slate-500/30" },
};

const PIPELINE_STAGES = ["applied", "reviewing", "interview", "offer", "rejected"];

// ── Score badge ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
    : score >= 70 ? "text-blue-400 bg-blue-500/15 border-blue-500/30"
    : "text-amber-400 bg-amber-500/15 border-amber-500/30";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      <Star className="w-2.5 h-2.5" /> {score}%
    </span>
  );
}

// ── Application card ───────────────────────────────────────────────────────

function AppCard({ app, onUpdate }: { app: JobApplication; onUpdate: () => void }) {
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
  const daysAgo = Math.floor((Date.now() - new Date(app.appliedAt || Date.now()).getTime()) / 86400000);

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; notes?: string }) =>
      apiRequest("PATCH", `/api/my-applications/${app.id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      onUpdate();
    },
  });

  function handleCopy() {
    const text = app.aiCoverLetter || app.coverLetter || "";
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Cover letter copied!" });
  }

  return (
    <>
      <div
        className="bg-card border border-border rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer"
        onClick={() => setShowDetail(true)}
        data-testid={`app-card-${app.id}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight mb-1 line-clamp-1">
              {app.jobTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{app.company || "Company"}</span>
              {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.label}
            </span>
            {app.employabilityScore && <ScoreBadge score={app.employabilityScore} />}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
          <div className="flex items-center gap-2">
            {(app.aiCoverLetter || app.coverLetter) && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" /> AI Letter
              </span>
            )}
            {app.applyUrl && (
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Live Link
              </span>
            )}
          </div>
        </div>

        {/* Status pipeline indicator */}
        <div className="flex items-center gap-1 mt-3">
          {PIPELINE_STAGES.slice(0, 4).map((stage, i) => {
            const stages = ["applied", "reviewing", "interview", "offer"];
            const currentIdx = stages.indexOf(app.status);
            const isActive = i === currentIdx;
            const isPast = i < currentIdx;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className={`h-1.5 w-full rounded-full ${
                  isPast ? "bg-emerald-500" :
                  isActive ? "bg-blue-400" :
                  "bg-border"
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{app.jobTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Job details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-4 text-sm text-white/70 flex-wrap">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{app.company}</span>
                {app.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.location}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Applied {daysAgo === 0 ? "today" : `${daysAgo} days ago`}</span>
              </div>
              {app.employabilityScore && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-sm text-white/60">Employability match:</div>
                  <ScoreBadge score={app.employabilityScore} />
                </div>
              )}
            </div>

            {/* Status updater */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Update Status</label>
              <Select
                value={app.status}
                onValueChange={(val) => updateMutation.mutate({ status: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white" data-testid="select-app-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Cover Letter */}
            {(app.aiCoverLetter || app.coverLetter) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    {app.aiCoverLetter ? "AI Cover Letter" : "Cover Letter"}
                  </label>
                  <Button size="sm" variant="outline" className="border-white/20 text-white/60 h-7 text-xs gap-1" onClick={handleCopy}>
                    {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-white/70 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                  {app.aiCoverLetter || app.coverLetter}
                </div>
              </div>
            )}

            {/* Notes */}
            <NoteEditor app={app} onSave={(notes) => updateMutation.mutate({ notes })} />

            {/* Interview date */}
            {app.status === "interview" && (
              <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Interview stage!</span>
                <span className="text-white/60">Prepare well — review the job description and practice your answers.</span>
              </div>
            )}

            {app.status === "offer" && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Congratulations!</span>
                <span className="text-white/60">You received an offer. Review it carefully before accepting.</span>
              </div>
            )}

            {/* Apply link */}
            {app.applyUrl && (
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold gap-2"
                onClick={() => window.open(app.applyUrl!, "_blank", "noopener")}
                data-testid="btn-open-job-listing"
              >
                <ExternalLink className="w-4 h-4" /> Open Job Listing
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NoteEditor({ app, onSave }: { app: JobApplication; onSave: (notes: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(app.notes || "");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Notes</label>
        {!editing && (
          <button className="text-xs text-blue-400 hover:text-blue-300" onClick={() => setEditing(true)}>
            {app.notes ? "Edit" : "+ Add note"}
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white/5 border-white/15 text-white placeholder:text-white/30 min-h-[80px] resize-none text-sm"
            placeholder="Add notes, recruiter name, salary discussed..."
          />
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white" onClick={() => { onSave(notes); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-white/60" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        app.notes && <p className="text-sm text-white/60 bg-white/5 rounded-lg p-3 border border-white/10">{app.notes}</p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function MyApplications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/my-applications");
      return res.json() as Promise<{ applications: JobApplication[]; total: number }>;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in required</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your applications.</p>
            <Button onClick={() => navigate("/auth")} className="bg-emerald-500 hover:bg-emerald-400 text-white">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const applications = data?.applications || [];
  const filtered = filterStatus === "all" ? applications : applications.filter(a => a.status === filterStatus);

  const stats = {
    total: applications.length,
    active: applications.filter(a => !["rejected", "withdrawn"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "interview").length,
    offers: applications.filter(a => a.status === "offer").length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <div className="bg-slate-950 text-white pt-28 pb-10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Application Intelligence</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">My Applications</h1>
            <p className="text-white/60 mb-6">Track every application, interview, and offer — all in one place.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Applied", value: stats.total, icon: Briefcase, color: "text-white" },
                { label: "Active", value: stats.active, icon: Zap, color: "text-emerald-400" },
                { label: "Interviews", value: stats.interviews, icon: Star, color: "text-amber-400" },
                { label: "Offers", value: stats.offers, icon: CheckCircle, color: "text-emerald-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">

          {/* Filter by status */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[{ key: "all", label: `All (${applications.length})` }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
              key, label: `${cfg.label} (${applications.filter(a => a.status === key).length})`,
            }))].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filterStatus === key
                    ? "bg-emerald-500 border-emerald-400 text-white"
                    : "border-border text-muted-foreground hover:border-emerald-500/40"
                }`}
                data-testid={`filter-status-${key}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-muted-foreground">Loading your applications…</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground/40" />
              <h3 className="text-xl font-bold text-foreground">
                {applications.length === 0 ? "No applications yet" : "No applications in this stage"}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {applications.length === 0
                  ? "Browse the AI Job Board and use our AI Apply feature to start tracking your applications here."
                  : "No applications match this status filter."}
              </p>
              {applications.length === 0 && (
                <Button
                  onClick={() => navigate("/jobs")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2"
                >
                  <ChevronRight className="w-4 h-4" /> Browse Jobs
                </Button>
              )}
            </div>
          )}

          {/* Application cards grid */}
          {!isLoading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(app => (
                <AppCard key={app.id} app={app} onUpdate={refetch} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin, Clock, Users, Eye, Zap, Wifi, Building2,
  TrendingUp, ExternalLink, ChevronDown, ChevronUp, Star,
  Shield, Briefcase,
} from "lucide-react";

export interface AggregatedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements?: string | null;
  location: string;
  province: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: string | null;
  source: string;
  sourceUrl?: string | null;
  category: string;
  jobType: string;
  experienceLevel?: string | null;
  postedDate?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  aiScore?: number | null;
  skills?: string | null;
  isUrgent?: boolean | null;
  applicationCount?: number | null;
  viewCount?: number | null;
  upgradeCount?: number | null;
  isRemote?: boolean | null;
  companySize?: string | null;
  beeLevel?: string | null;
  agentGenerated?: boolean | null;
}

// Internal source quality tiers — generic labels only, no third-party brand names
const SOURCE_COLOURS: Record<string, string> = {
  "FreelanceSkills AI":   "bg-emerald-600 text-white",
  "Verified Employer":    "bg-blue-600 text-white",
  "Featured Listing":     "bg-violet-600 text-white",
  "Tech Hub Africa":      "bg-sky-600 text-white",
  "Government Portal":    "bg-amber-600 text-black",
  "Remote-First":         "bg-teal-600 text-white",
  "Startup Ecosystem":    "bg-orange-500 text-white",
  "Enterprise Direct":    "bg-indigo-600 text-white",
  "Professional Network": "bg-pink-600 text-white",
  "Industry Partner":     "bg-rose-600 text-white",
};

function getSourceColour(source: string): string {
  if (SOURCE_COLOURS[source]) return SOURCE_COLOURS[source];
  // Fallback: deterministic colour based on source string hash
  const fallbacks = ["bg-emerald-700 text-white", "bg-blue-700 text-white", "bg-violet-700 text-white", "bg-teal-700 text-white"];
  const idx = source.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % fallbacks.length;
  return fallbacks[idx];
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  "contract": "Contract",
  "freelance": "Freelance",
  "internship": "Internship",
  "learnership": "Learnership",
};

const EXP_LABELS: Record<string, string> = {
  "entry": "Entry Level",
  "junior": "Junior",
  "mid": "Mid-Level",
  "senior": "Senior",
  "executive": "Executive",
};

function AIScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "bg-emerald-500 text-white" :
    score >= 80 ? "bg-blue-500 text-white" :
    score >= 70 ? "bg-yellow-500 text-black" :
    "bg-slate-500 text-white";

  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}
      title="AI Quality Score — how competitive this opportunity is"
      data-testid="job-ai-score"
    >
      <Star className="w-3 h-3" />
      {score}
    </div>
  );
}

function daysUntilExpiry(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatSalary(min?: number | null, max?: number | null, period?: string | null): string | null {
  if (!min && !max) return null;
  const fmt = (v: number) => `R${v.toLocaleString("en-ZA")}`;
  const periodLabel = period === "month" ? "/mo" : period === "year" ? "/yr" : period === "hour" ? "/hr" : "";
  if (min && max) return `${fmt(min)} – ${fmt(max)}${periodLabel}`;
  if (min) return `From ${fmt(min)}${periodLabel}`;
  return `Up to ${fmt(max!)}${periodLabel}`;
}

interface Props {
  job: AggregatedJob;
  onApply: (job: AggregatedJob) => void;
  isApplying?: boolean;
}

export function AggregatedJobCard({ job, onApply, isApplying }: Props) {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntilExpiry(job.expiresAt);
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
  const skillList = job.skills ? job.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const visibleSkills = expanded ? skillList : skillList.slice(0, 4);
  const sourceColour = getSourceColour(job.source);
  const aiScore = job.aiScore ?? 75;

  return (
    <Card
      className="group border border-border bg-card hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200"
      data-testid={`aggregated-job-card-${job.id}`}
    >
      <CardContent className="p-5">
        {/* Top row: source badge + AI score + urgency */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sourceColour}`} data-testid="job-source-badge">
              {job.source}
            </span>
            {job.isUrgent && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full" data-testid="job-urgent-badge">
                <Zap className="w-3 h-3" /> Urgent
              </span>
            )}
            {job.isRemote && (
              <span className="flex items-center gap-1 text-xs font-semibold text-sky-400 bg-sky-400/10 border border-sky-400/30 px-2 py-0.5 rounded-full" data-testid="job-remote-badge">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}
            {(job.upgradeCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-400/10 border border-violet-400/30 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> Boosted
              </span>
            )}
          </div>
          <AIScoreBadge score={aiScore} />
        </div>

        {/* Title + company */}
        <h3 className="font-bold text-foreground text-lg leading-tight mb-1 group-hover:text-emerald-400 transition-colors" data-testid="job-title">
          {job.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span data-testid="job-company">{job.company}</span>
          {job.companySize && (
            <span className="text-xs text-muted-foreground/60">· {job.companySize}</span>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span data-testid="job-location">{job.location}, {job.province}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span data-testid="job-salary">{salary}</span>
            </div>
          )}
          <Badge variant="secondary" className="text-xs px-2 py-0 h-5" data-testid="job-type">
            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
          </Badge>
          {job.experienceLevel && (
            <Badge variant="outline" className="text-xs px-2 py-0 h-5" data-testid="job-exp-level">
              {EXP_LABELS[job.experienceLevel] || job.experienceLevel}
            </Badge>
          )}
        </div>

        {/* Category + BEE */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
            <Briefcase className="w-3 h-3" />
            <span>{job.category}</span>
          </div>
          {job.beeLevel && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>BEE {job.beeLevel}</span>
            </div>
          )}
        </div>

        {/* Description preview */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2" data-testid="job-description">
          {job.description}
        </p>

        {/* Expanded: full description + requirements */}
        {expanded && (
          <div className="mt-2 mb-3 space-y-3 text-sm text-muted-foreground">
            <div className="bg-muted/30 rounded-lg p-3 whitespace-pre-line leading-relaxed">
              {job.description}
            </div>
            {job.requirements && (
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Requirements</h4>
                <div className="bg-muted/30 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skillList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md"
                data-testid={`job-skill-${skill.replace(/\s+/g, "-")}`}
              >
                {skill}
              </span>
            ))}
            {!expanded && skillList.length > 4 && (
              <span className="text-xs text-muted-foreground px-1">+{skillList.length - 4} more</span>
            )}
          </div>
        )}

        {/* Social proof + expiry */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {(job.viewCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {job.viewCount?.toLocaleString()} views
            </span>
          )}
          {(job.applicationCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {job.applicationCount} applied
            </span>
          )}
          {days !== null && (
            <span className={`flex items-center gap-1 font-medium ${days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-muted-foreground"}`} data-testid="job-expiry">
              <Clock className="w-3 h-3" />
              {days === 0 ? "Expires today" : `${days}d left`}
            </span>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
            onClick={() => onApply(job)}
            disabled={isApplying}
            data-testid={`btn-apply-${job.id}`}
          >
            {isApplying ? "Applying…" : "Apply Now"}
          </Button>
          {job.sourceUrl && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => window.open(job.sourceUrl!, "_blank", "noopener")}
              data-testid={`btn-external-${job.id}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on {job.source}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
            data-testid={`btn-expand-${job.id}`}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

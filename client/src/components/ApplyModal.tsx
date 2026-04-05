/**
 * FreelanceSkills — AI-Powered Apply Modal
 * The most advanced job application assistant in Africa.
 *
 * Flow:
 *  Step 1 → Job overview + profile summary input
 *  Step 2 → AI generates cover letter + employability score
 *  Step 3 → Review, copy, then apply directly on the real job listing
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  BrainCircuit, CheckCircle, Copy, ExternalLink, Loader2,
  Star, MapPin, Building2, Briefcase, Zap, TrendingUp,
  ChevronRight, AlertCircle, Wifi,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AggregatedJob } from "@/components/AggregatedJobCard";

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 85 ? "#10b981" : // emerald
    score >= 70 ? "#3b82f6" : // blue
    score >= 60 ? "#f59e0b" : // amber
    "#ef4444";                 // red

  const label =
    score >= 85 ? "Excellent" :
    score >= 70 ? "Strong" :
    score >= 60 ? "Good" :
    "Developing";

  const circumference = 2 * Math.PI * 42;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="50" y="45" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">/ 100</text>
      </svg>
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color }}>{label} Match</div>
        <div className="text-xs text-white/50">Employability Score</div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AIApplyResponse {
  success: boolean;
  applicationId: string | null;
  aiCoverLetter: string;
  employabilityScore: number;
  interviewTips: string[];
  applyUrl: string | null;
  message: string;
}

interface Props {
  job: AggregatedJob | null;
  open: boolean;
  onClose: () => void;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ApplyModal({ job, open, onClose }: Props) {
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [resumeSummary, setResumeSummary] = useState("");
  const [aiResult, setAiResult] = useState<AIApplyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!job) throw new Error("No job selected");
      const res = await apiRequest("POST", `/api/aggregated-jobs/${job.id}/ai-apply`, {
        resumeSummary,
        userProfile: {},
      });
      if (!res.ok) throw new Error("AI apply failed");
      return res.json() as Promise<AIApplyResponse>;
    },
    onMutate: () => setStep("generating"),
    onSuccess: (data) => {
      setAiResult(data);
      setStep("result");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("input");
    },
  });

  function handleCopy() {
    if (!aiResult?.aiCoverLetter) return;
    navigator.clipboard.writeText(aiResult.aiCoverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: "Cover letter copied!", description: "Paste it into the application form." });
  }

  function handleDirectApply() {
    const url = aiResult?.applyUrl || job?.sourceUrl || job?.applyUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast({ title: "No direct apply link", description: "Use the cover letter to apply via email or the company website." });
    }
  }

  function handleClose() {
    setStep("input");
    setAiResult(null);
    setResumeSummary("");
    onClose();
  }

  if (!job) return null;

  const score = aiResult?.employabilityScore ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            AI Application Assistant
          </DialogTitle>
        </DialogHeader>

        {/* Job summary strip */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg leading-tight mb-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm text-white/60 flex-wrap">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}, {job.province}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.category}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {job.isRemote && (
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                  <Wifi className="w-2.5 h-2.5 mr-1" /> Remote
                </Badge>
              )}
              {job.isUrgent && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  <Zap className="w-2.5 h-2.5 mr-1" /> Urgent
                </Badge>
              )}
              {job.aiScore && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <Star className="w-3 h-3" /> {job.aiScore} AI Score
                </div>
              )}
            </div>
          </div>
          {(job.applyUrl || job.sourceUrl) && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Real job listing with direct apply link
            </div>
          )}
        </div>

        {/* ── Step 1: Input ─────────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Your Profile / Skills Summary <span className="text-white/40 font-normal">(optional but improves accuracy)</span>
              </label>
              <Textarea
                value={resumeSummary}
                onChange={(e) => setResumeSummary(e.target.value)}
                placeholder="e.g. 5 years as a React developer, worked at Standard Bank and MTN. Strong in TypeScript, Node.js, AWS. BCOM Computer Science from UCT. Based in Cape Town, open to remote..."
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 min-h-[100px] resize-none"
                data-testid="input-resume-summary"
              />
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> What our AI will do for you:
              </h4>
              <ul className="space-y-1.5 text-sm text-white/70">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Write a personalised, employer-ready cover letter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Calculate your employability score for this specific role</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Give you 4 tailored interview tips</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Track your application in your dashboard</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12 text-base gap-2"
                onClick={() => applyMutation.mutate()}
                data-testid="btn-generate-ai-apply"
              >
                <BrainCircuit className="w-5 h-5" /> Generate AI Application
              </Button>
              {(job.applyUrl || job.sourceUrl) && (
                <Button
                  variant="outline"
                  className="border-white/20 text-white/70 hover:text-white gap-2"
                  onClick={() => window.open((job.applyUrl || job.sourceUrl)!, "_blank", "noopener")}
                >
                  <ExternalLink className="w-4 h-4" /> Quick Apply
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Generating ────────────────────────────────────────────── */}
        {step === "generating" && (
          <div className="py-12 flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-1">AI is crafting your application…</p>
              <p className="text-white/50 text-sm">Analysing the role, matching your profile, writing your cover letter</p>
            </div>
            <div className="flex gap-2">
              {["Analysing job", "Matching skills", "Writing letter", "Scoring match"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-white/40">
                  <Loader2 className="w-3 h-3 animate-spin" style={{ animationDelay: `${i * 200}ms` }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Result ────────────────────────────────────────────────── */}
        {step === "result" && aiResult && (
          <div className="space-y-5">
            {/* Employability score + summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 border border-white/10 flex items-center gap-6">
              <ScoreRing score={score} />
              <div className="flex-1">
                <p className="text-white font-bold text-lg mb-1">{aiResult.message}</p>
                <p className="text-white/60 text-sm">
                  {score >= 80
                    ? "You are a highly competitive candidate for this role. Apply now!"
                    : score >= 70
                    ? "Strong match! Your cover letter has been tailored to maximise your chances."
                    : "Good potential — our AI has crafted your best possible application."}
                </p>
                <div className="flex gap-2 mt-3">
                  {score >= 85 && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Top Candidate</Badge>}
                  {score >= 70 && score < 85 && <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Strong Applicant</Badge>}
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">AI-Optimised</Badge>
                </div>
              </div>
            </div>

            {/* Cover letter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">AI Cover Letter</h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white/70 hover:text-white gap-1.5 h-7 text-xs"
                  onClick={handleCopy}
                >
                  {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-white/80 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                {aiResult.aiCoverLetter}
              </div>
            </div>

            {/* Interview tips */}
            {aiResult.interviewTips.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">
                  AI Interview Tips for This Role
                </h4>
                <div className="space-y-2">
                  {aiResult.interviewTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-lg p-3 border border-white/8">
                      <ChevronRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-white/75">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application tracked notice */}
            {aiResult.applicationId && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Application tracked in your dashboard. You can monitor its status under "My Applications".
              </div>
            )}

            {!aiResult.applyUrl && (
              <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                No direct apply URL for this listing. Copy the cover letter and apply via the company's website or email.
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3">
              {aiResult.applyUrl ? (
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12 text-base gap-2"
                  onClick={handleDirectApply}
                  data-testid="btn-direct-apply"
                >
                  <ExternalLink className="w-5 h-5" /> Apply Directly Now
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12 text-base gap-2"
                  onClick={handleCopy}
                  data-testid="btn-copy-apply"
                >
                  <Copy className="w-5 h-5" /> {copied ? "Copied!" : "Copy Cover Letter"}
                </Button>
              )}
              <Button
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white"
                onClick={() => setStep("input")}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

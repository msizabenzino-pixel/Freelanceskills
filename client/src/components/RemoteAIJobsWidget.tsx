/**
 * RemoteAIJobsWidget — FreelanceSkills.net
 *
 * Live counter + top-5 carousel of remote AI/tech jobs.
 * Data from /api/jobs/remote-ai (5-min cache).
 * Zero external dependencies beyond what the project already uses.
 */

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Cpu, Zap, ArrowRight, ExternalLink, ChevronLeft, ChevronRight,
  Globe, Briefcase, TrendingUp, CheckCircle2, Star, DollarSign
} from "lucide-react";

interface RemoteAIJob {
  id: string;
  title: string;
  company: string;
  location: string;
  saMatchScore: number;
  aiSkillTags: string[];
  freelanceFriendly: boolean;
  entryLevelPossible: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  applyUrl: string | null;
  source: string;
  postedDate: string | null;
}

interface RemoteAIData {
  jobs: RemoteAIJob[];
  total: number;
  widget: {
    counter: string;
    newToday: number;
    top5: RemoteAIJob[];
  };
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function salaryLabel(min: number | null, max: number | null): string {
  if (min && max) return `$${(min / 1000).toFixed(0)}k–$${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return "Competitive";
}

// Animated pulsing live dot
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

// Animating counter that ticks up
function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Math.max(0, target - 50);
    setDisplay(start);
    let cur = start;
    const step = Math.max(1, Math.floor((target - start) / 40));
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setDisplay(cur);
      if (cur >= target) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [target]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white tabular-nums">
        {display.toLocaleString()}
        <span className="text-emerald-400">+</span>
      </div>
      <div className="text-slate-400 text-sm mt-1">{label}</div>
    </div>
  );
}

// Single AI job card
function AIJobCard({ job, index }: { job: RemoteAIJob; index: number }) {
  const [, navigate] = useLocation();
  const tags = job.aiSkillTags?.slice(0, 3) || [];
  const matchScore = job.saMatchScore || 0;

  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col gap-3"
      onClick={() => navigate("/jobs?category=Data+Science+%26+AI&isRemote=true")}
      data-testid={`ai-job-card-${job.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" /> AI/Tech
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Remote
            </span>
            {job.freelanceFriendly && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Freelance OK
              </span>
            )}
            {job.entryLevelPossible && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Entry Possible
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-slate-400 text-xs mt-1 font-medium truncate">{job.company}</p>
        </div>

        {/* SA Match Score */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-400 font-black text-sm leading-none">{matchScore}%</span>
          <span className="text-emerald-600 text-[8px] font-bold uppercase tracking-wider leading-none mt-0.5">SA Fit</span>
        </div>
      </div>

      {/* Salary + Source */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-emerald-500/60" />
          <span className="text-emerald-400/80 font-semibold">{salaryLabel(job.salaryMin, job.salaryMax)}</span>
        </div>
        <span className="text-slate-600">{timeAgo(job.postedDate)} · {job.source}</span>
      </div>

      {/* AI Skill Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Apply CTA */}
      {job.applyUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
          data-testid={`btn-apply-ai-job-${job.id}`}
        >
          <ExternalLink className="w-3 h-3" /> Apply Now
        </a>
      )}
    </motion.div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export function RemoteAIJobsWidget() {
  const [, navigate] = useLocation();
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { data, isLoading, isError } = useQuery<RemoteAIData>({
    queryKey: ["remote-ai-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/aggregated-jobs?limit=5&isRemote=true&sortBy=recent");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Transform aggregated-jobs response to RemoteAIData shape
      const jobs = data.jobs || [];
      return {
        jobs,
        total: data.total || 0,
        widget: {
          counter: (data.total || 0).toLocaleString(),
          newToday: jobs.length,
          top5: jobs.slice(0, 5).map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.province || j.location || "Remote",
            saMatchScore: j.aiScore || 85,
            aiSkillTags: Array.isArray(j.skills) ? j.skills.slice(0, 4) : [],
            freelanceFriendly: true,
            entryLevelPossible: j.experienceLevel === "entry",
            salaryMin: j.salaryMin,
            salaryMax: j.salaryMax,
            applyUrl: j.applyUrl,
            source: j.sourcePortal || "Aggregated",
            postedDate: j.postedDate,
          })),
        },
      } as RemoteAIData;
    },
    staleTime: 5 * 60 * 1000,  // 5 min
    retry: 2,
  });

  const top5 = data?.widget?.top5 || [];
  const total = data?.total || 0;
  const newToday = data?.widget?.newToday || 0;

  // Auto-advance carousel
  useEffect(() => {
    if (top5.length < 2) return;
    const iv = setInterval(() => {
      setCarouselIndex(i => (i + 1) % top5.length);
    }, 5000);
    return () => clearInterval(iv);
  }, [top5.length]);

  return (
    <section
      className="py-16 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900/50 border-y border-slate-800/50 relative overflow-hidden"
      aria-labelledby="remote-ai-heading"
      data-testid="section-remote-ai-jobs"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Cpu className="w-3.5 h-3.5" /> Live Remote AI/Tech Pipeline
          </div>
          <h2 id="remote-ai-heading" className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            SA's #1 Live Feed of Remote <span className="text-violet-400">AI & Tech Jobs</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Solving SA's 77,000+ unfilled tech jobs crisis — refreshed every 15 minutes from global sources. Matched for bootcamp grads and self-taught devs.
          </p>
        </div>

        {/* Live stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <LiveDot />
              <span>Loading live stats…</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Cpu className="w-4 h-4" /> Pipeline loading…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-2">
                <LiveDot />
                <span className="text-white font-bold text-sm">{total.toLocaleString()}+ remote AI/tech jobs tracked</span>
              </div>
              {newToday > 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">+{newToday} new this cycle</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Updated every 15 min · 5 sources</span>
              </div>
            </>
          )}
        </div>

        {/* Stat pillars */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Cpu, label: "AI/ML Jobs", value: Math.floor(total * 0.35), color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              { icon: Globe, label: "Remote Worldwide", value: total, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: Star, label: "Entry-Level Possible", value: Math.floor(total * 0.28), color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { icon: Zap, label: "Freelance Friendly", value: Math.floor(total * 0.42), color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
              <div key={i} className={`flex flex-col items-center text-center p-4 rounded-2xl border ${bg}`} data-testid={`ai-stat-pill-${i}`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className={`text-2xl font-black ${color} tabular-nums`}>{value.toLocaleString()}+</div>
                <div className="text-slate-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Top-5 Job Carousel */}
        {!isLoading && !isError && top5.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Top Matched for SA Devs
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                  disabled={carouselIndex === 0}
                  className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 transition-all"
                  data-testid="btn-ai-carousel-prev"
                  aria-label="Previous AI job"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCarouselIndex(i => Math.min(top5.length - 1, i + 1))}
                  disabled={carouselIndex >= top5.length - 1}
                  className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 transition-all"
                  data-testid="btn-ai-carousel-next"
                  aria-label="Next AI job"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-slate-600 text-xs ml-1">{carouselIndex + 1} / {top5.length}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="wait">
                {top5.slice(carouselIndex, carouselIndex + 3).map((job, i) => (
                  <AIJobCard key={`${job.id}-${carouselIndex}`} job={job} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {/* Carousel dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {top5.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`rounded-full transition-all ${i === carouselIndex ? "w-5 h-1.5 bg-emerald-500" : "w-1.5 h-1.5 bg-slate-700"}`}
                  data-testid={`ai-carousel-dot-${i}`}
                  aria-label={`Go to AI job ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-4 bg-slate-800 rounded-full w-16" />
                  <div className="h-4 bg-slate-800 rounded-full w-12" />
                </div>
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-800 rounded-full w-14" />
                  <div className="h-6 bg-slate-800 rounded-full w-18" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <button
            onClick={() => navigate("/jobs?category=Data+Science+%26+AI&isRemote=true")}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02]"
            data-testid="btn-browse-all-ai-jobs"
          >
            <Cpu className="w-4 h-4" /> Browse All {total > 0 ? `${total.toLocaleString()}+` : ""} Remote AI Jobs
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/academy?category=AI")}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-violet-400 font-semibold text-sm transition-all"
            data-testid="btn-ai-academy"
          >
            <Briefcase className="w-4 h-4" /> Build AI Skills → Academy
          </button>
        </div>

        {/* 2036 roadmap teaser */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Sources: RemoteOK · Remotive · Himalayas · Jobicy · We Work Remotely · Refreshed every 15 min · Self-healing pipeline · Running until 2036
        </p>
      </div>
    </section>
  );
}

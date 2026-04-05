import { useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/JobCard";
import { AggregatedJobCard, type AggregatedJob } from "@/components/AggregatedJobCard";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Search, MapPin, AlertCircle, Zap, Wifi,
  BrainCircuit, TrendingUp, Briefcase, Users, RefreshCw,
  SlidersHorizontal, X,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import {
  applyForJobInFirestore, fetchApplicationsForFreelancer,
  fetchJobsFromFirestore, type Job,
} from "@/lib/firebaseAppData";
import { apiRequest } from "@/lib/queryClient";

// ── Constants ────────────────────────────────────────────────────────────────

const SA_PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Limpopo", "Mpumalanga", "Free State", "North West", "Northern Cape",
];

const CATEGORIES = [
  "Software Engineering", "Data Science & AI", "Cybersecurity", "Cloud & DevOps",
  "Finance & Accounting", "Sales & Business Development", "Marketing & Digital",
  "Healthcare & Medical", "Legal & Compliance", "Engineering (Civil/Structural)",
  "Engineering (Electrical)", "Engineering (Mechanical)", "Mining & Resources",
  "Trades (Plumbing)", "Trades (Electrical)", "Trades (Construction)",
  "Education & Training", "Human Resources", "Supply Chain & Logistics",
  "Retail & FMCG", "Hospitality & Tourism", "Agriculture & Farming",
  "Banking & Insurance", "Project Management", "Creative & Design",
  "Customer Service", "Operations & Admin", "Environmental & ESG",
  "Manufacturing", "Government & Public Sector",
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "learnership", label: "Learnership" },
];

const EXP_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "executive", label: "Executive" },
];

const SOURCES = [
  "PNet", "Career24", "LinkedIn", "Indeed SA", "CareerJunction",
  "OfferZen", "Bizcommunity", "JobMail", "Government Vacancies", "BestJobs",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, color = "emerald" }: {
  icon: React.ElementType; label: string; value: number | string; color?: string;
}) {
  const colours: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${colours[color]}`}>
      <Icon className="w-4 h-4" />
      <span>{value}</span>
      <span className="text-xs font-normal opacity-70">{label}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [expLevelFilter, setExpLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // ── Firebase jobs (user-posted) ───────────────────────────────────────────
  const firebaseJobsQuery = useQuery({
    queryKey: ["firebase", "jobs"],
    queryFn: fetchJobsFromFirestore,
  });

  const myApplicationsQuery = useQuery({
    queryKey: ["firebase", "my-applications", user?.id],
    queryFn: () => fetchApplicationsForFreelancer(user!.id),
    enabled: Boolean(user?.id),
  });

  const appliedJobIds = useMemo(
    () => new Set((myApplicationsQuery.data || []).map((app) => app.jobId)),
    [myApplicationsQuery.data],
  );

  // ── Aggregated jobs (AI job board) ───────────────────────────────────────
  const aggJobsQuery = useQuery({
    queryKey: [
      "aggregated-jobs",
      { province: provinceFilter, category: categoryFilter, jobType: jobTypeFilter,
        expLevel: expLevelFilter, source: sourceFilter, urgent: urgentOnly, remote: remoteOnly, search: query },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (provinceFilter && provinceFilter !== "all") params.set("province", provinceFilter);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      if (jobTypeFilter && jobTypeFilter !== "all") params.set("jobType", jobTypeFilter);
      if (expLevelFilter && expLevelFilter !== "all") params.set("experienceLevel", expLevelFilter);
      if (sourceFilter && sourceFilter !== "all") params.set("source", sourceFilter);
      if (urgentOnly) params.set("isUrgent", "true");
      if (remoteOnly) params.set("isRemote", "true");
      if (query) params.set("search", query);
      params.set("limit", "200");

      const res = await apiRequest("GET", `/api/aggregated-jobs?${params.toString()}`);
      const data = await res.json();
      return data.jobs as AggregatedJob[];
    },
    staleTime: 2 * 60 * 1000,
  });

  // ── Firebase apply ────────────────────────────────────────────────────────
  const firebaseApplyMutation = useMutation({
    mutationFn: async (job: Job) => {
      if (!user?.id) throw new Error("Please sign in first.");
      return applyForJobInFirestore({
        jobId: job.id,
        freelancerId: user.id,
        freelancerName: user.firstName || user.email || "Freelancer",
      });
    },
    onSuccess: (result) => {
      toast({
        title: result.applied ? "Application submitted!" : "Already applied",
        description: result.applied ? "Your application was sent successfully." : "You have already applied for this role.",
      });
      myApplicationsQuery.refetch();
    },
    onError: (err: Error) => {
      toast({ title: "Application failed", description: err.message, variant: "destructive" });
    },
  });

  // ── Aggregated apply ──────────────────────────────────────────────────────
  const handleAggregatedApply = useCallback(async (job: AggregatedJob) => {
    if (!user?.id) {
      toast({ title: "Sign in required", description: "Please sign in to apply for jobs." });
      navigate(`/login?redirect=${encodeURIComponent("/jobs")}`);
      return;
    }
    setApplyingId(job.id);
    try {
      const res = await apiRequest("POST", `/api/aggregated-jobs/${job.id}/apply`, { coverLetter: "" });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Application tracked!",
          description: `Redirecting you to ${job.source}…`,
        });
        if (data.redirectUrl) {
          window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
        }
        // Refresh job list to show updated application count
        queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  }, [user, navigate, toast, queryClient]);

  // ── Filtered Firebase jobs ────────────────────────────────────────────────
  const filteredFirebaseJobs = useMemo(() => {
    const items = firebaseJobsQuery.data || [];
    const q = query.trim().toLowerCase();
    const loc = locationFilter.trim().toLowerCase();

    return items.filter((job) => {
      if (q) {
        const hay = `${job.title} ${job.description} ${job.category} ${job.clientName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (loc && !(job.location || "").toLowerCase().includes(loc)) return false;
      if (urgentOnly && job.urgency !== "urgent") return false;
      if (remoteOnly && job.locationType !== "remote") return false;
      return true;
    });
  }, [firebaseJobsQuery.data, query, locationFilter, urgentOnly, remoteOnly]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const aggJobs = aggJobsQuery.data || [];
  const urgentCount = aggJobs.filter(j => j.isUrgent).length;
  const remoteCount = aggJobs.filter(j => j.isRemote).length;
  const totalJobs = aggJobs.length + filteredFirebaseJobs.length;

  const hasActiveFilters = provinceFilter !== "all" || categoryFilter !== "all" ||
    jobTypeFilter !== "all" || expLevelFilter !== "all" || sourceFilter !== "all" ||
    urgentOnly || remoteOnly || query || locationFilter;

  const clearFilters = () => {
    setProvinceFilter("all");
    setCategoryFilter("all");
    setJobTypeFilter("all");
    setExpLevelFilter("all");
    setSourceFilter("all");
    setUrgentOnly(false);
    setRemoteOnly(false);
    setQuery("");
    setLocationFilter("");
  };

  const isLoading = aggJobsQuery.isLoading || firebaseJobsQuery.isLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="bg-slate-950 text-white pt-28 pb-10 border-b border-border relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                AI Job Intelligence — South Africa &amp; Global
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Find Your Perfect Job
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Aggregating jobs from PNet, Career24, LinkedIn, Indeed SA, OfferZen and more — all in one place, powered by AI.
            </p>

            {/* Search bar */}
            <div className="grid md:grid-cols-[1fr_220px_auto] gap-3 mb-5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
                  placeholder="Job title, skill, or company…"
                  data-testid="jobs-input-query"
                />
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
                  placeholder="City or province"
                  data-testid="jobs-input-location"
                />
              </div>
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold gap-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] })}
                data-testid="btn-search-jobs"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
            </div>

            {/* Quick toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setUrgentOnly(!urgentOnly)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${urgentOnly ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "border-white/20 text-white/70 hover:border-white/40"}`}
                data-testid="toggle-urgent"
              >
                <Zap className="w-3.5 h-3.5" /> Urgent
              </button>
              <button
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${remoteOnly ? "bg-sky-500/20 border-sky-500/50 text-sky-300" : "border-white/20 text-white/70 hover:border-white/40"}`}
                data-testid="toggle-remote"
              >
                <Wifi className="w-3.5 h-3.5" /> Remote
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${showFilters ? "bg-violet-500/20 border-violet-500/50 text-violet-300" : "border-white/20 text-white/70 hover:border-white/40"}`}
                data-testid="toggle-filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Advanced Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                  data-testid="btn-clear-filters"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Advanced filters panel */}
            {showFilters && (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9" data-testid="select-province">
                    <SelectValue placeholder="Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {SA_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9" data-testid="select-job-type">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {JOB_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={expLevelFilter} onValueChange={setExpLevelFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9" data-testid="select-exp-level">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {EXP_LEVELS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9" data-testid="select-source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
          <div className="container mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
            <StatPill icon={Briefcase} value={totalJobs.toLocaleString()} label="live jobs" color="emerald" />
            <StatPill icon={Zap} value={urgentCount} label="urgent" color="amber" />
            <StatPill icon={Wifi} value={remoteCount} label="remote" color="sky" />
            <StatPill icon={BrainCircuit} value={aggJobs.length} label="AI-aggregated" color="violet" />
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground h-8"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] });
                  queryClient.invalidateQueries({ queryKey: ["firebase", "jobs"] });
                }}
                data-testid="btn-refresh-jobs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tabs + Job lists ──────────────────────────────────────────── */}
        <div className="container mx-auto px-4 md:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-muted/40" data-testid="jobs-tabs">
              <TabsTrigger value="all" data-testid="tab-all">
                All Jobs {totalJobs > 0 && <Badge variant="secondary" className="ml-2 text-xs">{totalJobs}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="ai-board" data-testid="tab-ai-board">
                <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                AI Job Board {aggJobs.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{aggJobs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="marketplace" data-testid="tab-marketplace">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Marketplace {filteredFirebaseJobs.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{filteredFirebaseJobs.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Loading state */}
            {isLoading && (
              <div className="py-16 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-muted-foreground">Loading jobs from all sources…</p>
              </div>
            )}

            {/* ALL JOBS tab */}
            {!isLoading && (
              <TabsContent value="all">
                {totalJobs === 0 ? (
                  <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} />
                ) : (
                  <div className="space-y-8">
                    {/* AI Job Board section */}
                    {aggJobs.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <BrainCircuit className="w-4 h-4 text-emerald-500" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            AI Job Board — PNet · Career24 · LinkedIn · OfferZen · +7 more
                          </h2>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{aggJobs.length} jobs</span>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4">
                          {aggJobs.map((job) => (
                            <AggregatedJobCard
                              key={job.id}
                              job={job}
                              onApply={handleAggregatedApply}
                              isApplying={applyingId === job.id}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Marketplace section */}
                    {filteredFirebaseJobs.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            FreelanceSkills Marketplace — Client-Posted Jobs
                          </h2>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{filteredFirebaseJobs.length} jobs</span>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4">
                          {filteredFirebaseJobs.map((job) => (
                            <JobCard
                              key={job.id}
                              id={job.id}
                              title={job.title}
                              company={job.clientName || "Client"}
                              type={job.urgency === "urgent" ? "Urgent" : job.locationType === "remote" ? "Remote" : "Onsite"}
                              budget={formatAmount(job.budget)}
                              location={job.location}
                              postedAt={job.createdAt ? job.createdAt.toLocaleDateString() : "Recently"}
                              tags={[job.category]}
                              description={job.description}
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              onApply={() => {
                                if (appliedJobIds.has(job.id)) {
                                  toast({ title: "Already applied", description: "You already applied to this job." });
                                  return;
                                }
                                if (!user?.id) {
                                  navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
                                  return;
                                }
                                firebaseApplyMutation.mutate(job);
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </TabsContent>
            )}

            {/* AI JOB BOARD tab */}
            {!isLoading && (
              <TabsContent value="ai-board">
                {aggJobsQuery.isError ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                    <p className="text-destructive font-semibold mb-2">Failed to load AI job board.</p>
                    <Button variant="outline" size="sm" onClick={() => aggJobsQuery.refetch()}>Retry</Button>
                  </div>
                ) : aggJobs.length === 0 ? (
                  <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} />
                ) : (
                  <div className="grid lg:grid-cols-2 gap-4" data-testid="aggregated-jobs-grid">
                    {aggJobs.map((job) => (
                      <AggregatedJobCard
                        key={job.id}
                        job={job}
                        onApply={handleAggregatedApply}
                        isApplying={applyingId === job.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {/* MARKETPLACE tab */}
            {!isLoading && (
              <TabsContent value="marketplace">
                {firebaseJobsQuery.isError ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                    <p className="text-destructive font-semibold">Failed to load marketplace jobs.</p>
                  </div>
                ) : filteredFirebaseJobs.length === 0 ? (
                  <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} message="No marketplace jobs found. Try adjusting your search." />
                ) : (
                  <div className="grid lg:grid-cols-2 gap-4" data-testid="marketplace-jobs-grid">
                    {filteredFirebaseJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        company={job.clientName || "Client"}
                        type={job.urgency === "urgent" ? "Urgent" : job.locationType === "remote" ? "Remote" : "Onsite"}
                        budget={formatAmount(job.budget)}
                        location={job.location}
                        postedAt={job.createdAt ? job.createdAt.toLocaleDateString() : "Recently"}
                        tags={[job.category]}
                        description={job.description}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        onApply={() => {
                          if (appliedJobIds.has(job.id)) {
                            toast({ title: "Already applied", description: "You already applied to this job." });
                            return;
                          }
                          if (!user?.id) {
                            navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
                            return;
                          }
                          firebaseApplyMutation.mutate(job);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear, hasFilters, message }: { onClear: () => void; hasFilters: boolean; message?: string }) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
        <Search className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground mb-1">No jobs found</p>
        <p className="text-muted-foreground text-sm max-w-sm">
          {message || "No results match your current filters. Try broadening your search."}
        </p>
      </div>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear} className="gap-2">
          <X className="w-3.5 h-3.5" /> Clear all filters
        </Button>
      )}
    </div>
  );
}

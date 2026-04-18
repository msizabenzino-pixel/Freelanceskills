import { useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ApplyModal } from "@/components/ApplyModal";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { AIBriefGenerator } from "@/components/AIBriefGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/JobCard";
import { AggregatedJobCard, type AggregatedJob } from "@/components/AggregatedJobCard";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Search, AlertCircle, Zap, Wifi, Globe,
  BrainCircuit, TrendingUp, Briefcase, Users, RefreshCw,
  SlidersHorizontal, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import {
  applyForJobInFirestore, fetchApplicationsForFreelancer,
  fetchJobsFromFirestore, type Job,
} from "@/lib/firebaseAppData";
import { apiRequest } from "@/lib/queryClient";

// ── Constants ────────────────────────────────────────────────────────────────

// Pan-African country config with flags and SA provinces
const AFRICA_COUNTRIES = [
  { name: "South Africa",   flag: "🇿🇦", provinces: ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","Free State","North West","Northern Cape"] },
  { name: "Nigeria",        flag: "🇳🇬", provinces: [] },
  { name: "Kenya",          flag: "🇰🇪", provinces: [] },
  { name: "Ghana",          flag: "🇬🇭", provinces: [] },
  { name: "Egypt",          flag: "🇪🇬", provinces: [] },
  { name: "Morocco",        flag: "🇲🇦", provinces: [] },
  { name: "Ethiopia",       flag: "🇪🇹", provinces: [] },
  { name: "Tanzania",       flag: "🇹🇿", provinces: [] },
  { name: "Uganda",         flag: "🇺🇬", provinces: [] },
  { name: "Rwanda",         flag: "🇷🇼", provinces: [] },
  { name: "Senegal",        flag: "🇸🇳", provinces: [] },
  { name: "Côte d'Ivoire",  flag: "🇨🇮", provinces: [] },
  { name: "Zimbabwe",       flag: "🇿🇼", provinces: [] },
  { name: "Zambia",         flag: "🇿🇲", provinces: [] },
  { name: "Botswana",       flag: "🇧🇼", provinces: [] },
  { name: "Namibia",        flag: "🇳🇦", provinces: [] },
  { name: "Mozambique",     flag: "🇲🇿", provinces: [] },
  { name: "Cameroon",       flag: "🇨🇲", provinces: [] },
  { name: "Angola",         flag: "🇦🇴", provinces: [] },
  { name: "Tunisia",        flag: "🇹🇳", provinces: [] },
  { name: "Algeria",        flag: "🇩🇿", provinces: [] },
  { name: "Malawi",         flag: "🇲🇼", provinces: [] },
  { name: "Lesotho",        flag: "🇱🇸", provinces: [] },
  { name: "Eswatini",       flag: "🇸🇿", provinces: [] },
  { name: "Libya",          flag: "🇱🇾", provinces: [] },
  { name: "Sudan",          flag: "🇸🇩", provinces: [] },
  { name: "Remote",         flag: "🌍", provinces: [] },
];
const AFRICA_COUNTRY_NAMES = new Set(AFRICA_COUNTRIES.map((country) => country.name).filter((name) => name !== "Remote"));

// SA province shortnames for display
const SA_PROV_SHORT: Record<string, string> = {
  "Gauteng": "Gauteng", "Western Cape": "W. Cape", "KwaZulu-Natal": "KZN",
  "Eastern Cape": "E. Cape", "Limpopo": "Limpopo", "Mpumalanga": "Mpumalanga",
  "Free State": "Free State", "North West": "N. West", "Northern Cape": "N. Cape",
};

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
  "Fintech & Payments", "Telecommunications", "Property & Real Estate",
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
  // GeoIntelligence state — drives all location filtering
  const [selectedCountry, setSelectedCountry] = useState("all"); // "all" | country name
  const [selectedProvince, setSelectedProvince] = useState("all"); // "all" | SA province name
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [expLevelFilter, setExpLevelFilter] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyModalJob, setApplyModalJob] = useState<AggregatedJob | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRedirect, setAuthModalRedirect] = useState("/jobs");

  // 400ms debounce prevents an API call on every keystroke.
  // Users see results update smoothly ~400ms after they stop typing.
  const debouncedQuery = useDebounce(query, 400);

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

  // ── Job stats (for live counts on geo-pills) ─────────────────────────────
  const statsQuery = useQuery({
    queryKey: ["aggregated-jobs-stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/aggregated-jobs/stats");
      return res.json() as Promise<{ totalActive: number; byProvince: Record<string, number>; byCountry: Record<string, number>; urgent: number; remote: number }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build unified geo counts map: { "all": 150, "South Africa": 90, "Gauteng": 35, "Nigeria": 22, ... }
  const countryJobCounts = useMemo(() => {
    const d = statsQuery.data;
    const result: Record<string, number> = { all: d?.totalActive || 0 };
    if (d?.byProvince) Object.assign(result, d.byProvince);
    if (d?.byCountry) Object.assign(result, d.byCountry);
    return result;
  }, [statsQuery.data]);

  // ── Aggregated jobs (AI job board) ───────────────────────────────────────
  const aggJobsQuery = useQuery({
    queryKey: [
      "aggregated-jobs",
      { country: selectedCountry, province: selectedProvince, category: categoryFilter,
        jobType: jobTypeFilter, expLevel: expLevelFilter, urgent: urgentOnly, remote: remoteOnly,
        // debouncedQuery — NOT raw `query` — prevents a new request on every keystroke
        search: debouncedQuery },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Country-aware location filtering
      if (selectedCountry !== "all") {
        if (selectedCountry === "South Africa" && selectedProvince !== "all") {
          params.set("province", selectedProvince); // specific SA province
        } else {
          params.set("country", selectedCountry); // backend handles country filter
        }
      }
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      if (jobTypeFilter && jobTypeFilter !== "all") params.set("jobType", jobTypeFilter);
      if (expLevelFilter && expLevelFilter !== "all") params.set("experienceLevel", expLevelFilter);
      if (urgentOnly) params.set("isUrgent", "true");
      if (remoteOnly) params.set("isRemote", "true");
      if (debouncedQuery) params.set("search", debouncedQuery);
      params.set("limit", "200");

      const res = await apiRequest("GET", `/api/aggregated-jobs?${params.toString()}`);
      const data = await res.json();
      return {
        jobs: (data.jobs || []) as AggregatedJob[],
        remoteFallback: data.remoteFallback as boolean,
        remoteFallbackCountry: data.remoteFallbackCountry as string | undefined,
      };
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

  // ── Aggregated apply — opens AI Apply Modal ───────────────────────────────
  const handleAggregatedApply = useCallback((job: AggregatedJob) => {
    if (!user?.id) {
      setAuthModalRedirect("/jobs");
      setShowAuthModal(true);
      return;
    }
    setApplyModalJob(job);
  }, [user]);

  // ── Filtered Firebase jobs ────────────────────────────────────────────────
  const filteredFirebaseJobs = useMemo(() => {
    const items = firebaseJobsQuery.data || [];
    const q = query.trim().toLowerCase();
    const geoFilter = selectedCountry !== "all" ? selectedCountry.toLowerCase() : "";
    const provFilter = selectedProvince !== "all" ? selectedProvince.toLowerCase() : "";

    return items.filter((job) => {
      if (q) {
        const hay = `${job.title} ${job.description} ${job.category} ${job.clientName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Apply geo filter to firebase jobs via location text matching
      if (provFilter && !(job.location || "").toLowerCase().includes(provFilter)) return false;
      else if (geoFilter && !provFilter && !(job.location || "").toLowerCase().includes(geoFilter)) return false;
      if (urgentOnly && job.urgency !== "urgent") return false;
      if (remoteOnly && job.locationType !== "remote") return false;
      return true;
    });
  }, [firebaseJobsQuery.data, query, selectedCountry, selectedProvince, urgentOnly, remoteOnly]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const aggJobs = aggJobsQuery.data?.jobs || [];
  const aggRemoteFallback = aggJobsQuery.data?.remoteFallback || false;
  const aggRemoteFallbackCountry = aggJobsQuery.data?.remoteFallbackCountry;
  const showAfricaFallbackBanner = !!aggRemoteFallback && !!aggRemoteFallbackCountry && AFRICA_COUNTRY_NAMES.has(aggRemoteFallbackCountry);
  const urgentCount = aggJobs.filter(j => j.isUrgent).length;
  const remoteCount = aggJobs.filter(j => j.isRemote).length;
  const totalJobs = aggJobs.length + filteredFirebaseJobs.length;

  const hasActiveFilters = selectedCountry !== "all" || categoryFilter !== "all" ||
    jobTypeFilter !== "all" || expLevelFilter !== "all" ||
    urgentOnly || remoteOnly || !!debouncedQuery;

  const clearFilters = () => {
    setSelectedCountry("all");
    setSelectedProvince("all");
    setCategoryFilter("all");
    setJobTypeFilter("all");
    setExpLevelFilter("all");
    setUrgentOnly(false);
    setRemoteOnly(false);
    setQuery("");
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
                AI Job Intelligence — Africa &amp; Beyond
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Find Your Perfect Job
            </h1>
            <p className="text-white/70 text-lg mb-6">
              The most powerful job intelligence platform on the African continent — AI-matched opportunities across 17 countries, 80+ cities.
            </p>

            {/* Keyword search bar — full width */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] })}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 h-11"
                  placeholder="Job title, skill, or company…"
                  data-testid="jobs-input-query"
                />
              </div>
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold gap-2 h-11 px-6"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] })}
                data-testid="btn-search-jobs"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
            </div>

            {/* ── Hiring? AI Brief Generator callout ───────────────────── */}
            <div className="mb-4 bg-emerald-500/8 border border-emerald-500/25 rounded-xl p-3 flex items-center gap-3" data-testid="ai-brief-callout">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-300 mb-1">Posting a job? Let AI write your brief</p>
                <AIBriefGenerator compact />
              </div>
            </div>

            {/* ── GeoIntelligence Selector ─────────────────────────────── */}
            <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Where do you want to work?</span>
                {selectedCountry !== "all" && (
                  <button onClick={() => { setSelectedCountry("all"); setSelectedProvince("all"); }}
                    className="ml-auto text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Clear location
                  </button>
                )}
              </div>

              {/* Top-level continent + remote pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => { setSelectedCountry("all"); setSelectedProvince("all"); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${selectedCountry === "all" ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25" : "border-white/20 text-white/70 hover:border-emerald-500/50 hover:text-white"}`}
                  data-testid="geo-all-africa"
                >
                  🌍 All Africa
                  {countryJobCounts["all"] ? <span className="text-[10px] opacity-70 ml-0.5">({countryJobCounts["all"]})</span> : null}
                </button>
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${remoteOnly ? "bg-sky-500/30 border-sky-400 text-sky-200" : "border-white/20 text-white/70 hover:border-sky-500/50 hover:text-white"}`}
                  data-testid="toggle-remote"
                >
                  🌐 Remote
                  {statsQuery.data?.remote ? <span className="text-[10px] opacity-70 ml-0.5">({statsQuery.data.remote})</span> : null}
                </button>
              </div>

              {/* Country pills row */}
              <div className="flex flex-wrap gap-1.5">
                {(showAllCountries ? AFRICA_COUNTRIES : AFRICA_COUNTRIES.slice(0, 8)).map((c) => {
                  const isSelected = selectedCountry === c.name;
                  const jobCount = countryJobCounts[c.name] || 0;
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCountry("all");
                          setSelectedProvince("all");
                        } else {
                          setSelectedCountry(c.name);
                          setSelectedProvince("all");
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${isSelected ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm" : "border-white/15 text-white/60 hover:border-white/35 hover:text-white/90"}`}
                      data-testid={`geo-country-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {c.flag} {c.name}
                      {jobCount > 0 && <span className="text-[9px] opacity-60 ml-0.5">({jobCount})</span>}
                      {isSelected && c.provinces.length > 0 && <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
                    </button>
                  );
                })}
                {AFRICA_COUNTRIES.length > 8 && (
                  <button
                    onClick={() => setShowAllCountries(!showAllCountries)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 text-white/40 hover:border-white/25 hover:text-white/60 transition-all"
                    data-testid="geo-show-more"
                  >
                    {showAllCountries ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{AFRICA_COUNTRIES.length - 8} more</>}
                  </button>
                )}
              </div>

              {/* SA Province drill-down — only when South Africa is selected */}
              {selectedCountry === "South Africa" && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Province</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedProvince("all")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selectedProvince === "all" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"}`}
                      data-testid="geo-prov-all"
                    >
                      All SA {countryJobCounts["South Africa"] ? `(${countryJobCounts["South Africa"]})` : ""}
                    </button>
                    {AFRICA_COUNTRIES[0].provinces.map((prov) => {
                      const isProvSelected = selectedProvince === prov;
                      const cnt = countryJobCounts[prov] || 0;
                      return (
                        <button
                          key={prov}
                          onClick={() => setSelectedProvince(isProvSelected ? "all" : prov)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${isProvSelected ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"}`}
                          data-testid={`geo-prov-${prov.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {SA_PROV_SHORT[prov] || prov}
                          {cnt > 0 && <span className="opacity-60 ml-0.5">({cnt})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick toggles + advanced filters */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setUrgentOnly(!urgentOnly)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${urgentOnly ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "border-white/20 text-white/70 hover:border-white/40"}`}
                data-testid="toggle-urgent"
              >
                <Zap className="w-3.5 h-3.5" /> Urgent
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${showFilters ? "bg-violet-500/20 border-violet-500/50 text-violet-300" : "border-white/20 text-white/70 hover:border-white/40"}`}
                data-testid="toggle-filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                  data-testid="btn-clear-filters"
                >
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
              {/* Active location indicator */}
              {selectedCountry !== "all" && (
                <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  {AFRICA_COUNTRIES.find(c => c.name === selectedCountry)?.flag} {selectedProvince !== "all" ? selectedProvince : selectedCountry}
                  <button onClick={() => { setSelectedCountry("all"); setSelectedProvince("all"); }} className="hover:text-white ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Advanced filters panel (category / type / exp only — location handled by GeoSelector) */}
            {showFilters && (
              <div className="mt-3 grid sm:grid-cols-3 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
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
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-emerald-400 hover:text-emerald-300 h-8 font-medium"
                  onClick={() => navigate("/my-applications")}
                  data-testid="btn-my-applications"
                >
                  <Briefcase className="w-3.5 h-3.5" /> My Applications
                </Button>
              )}
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
                <p className="text-muted-foreground">Loading AI-matched opportunities…</p>
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
                            AI Job Board — Pan-African Intelligence
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
                                  setAuthModalRedirect(`/jobs/${job.id}`);
                                  setShowAuthModal(true);
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
                  <>
                    {showAfricaFallbackBanner && (
                      <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm" data-testid="remote-fallback-banner">
                        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <div>
                          <span className="font-semibold text-emerald-300">No local listings for {aggRemoteFallbackCountry} yet.</span>
                          <span className="ml-1 text-white/70">Showing <span className="font-medium text-white">{aggJobs.length.toLocaleString()} remote &amp; global jobs</span> you can apply for from {aggRemoteFallbackCountry}.</span>
                        </div>
                      </div>
                    )}
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
                  </>
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
                            setAuthModalRedirect(`/jobs/${job.id}`);
                            setShowAuthModal(true);
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
      {applyModalJob && (
        <ApplyModal
          job={applyModalJob}
          onClose={() => {
            setApplyModalJob(null);
            queryClient.invalidateQueries({ queryKey: ["aggregated-jobs"] });
          }}
        />
      )}
      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectPath={authModalRedirect}
        context="apply"
      />
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

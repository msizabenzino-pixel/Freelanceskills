import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/JobCard";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/lib/currency";
import { apiFetch, apiPost } from "@/lib/api";
import { AlertCircle, Briefcase, MapPin, Search, Sparkles, Zap } from "lucide-react";

const STATE_KEY = "freelanceskills_explore_filters";

interface ExploreFilterState {
  query: string;
  location: string;
  category: string;
  urgentOnly: boolean;
  remoteOnly: boolean;
  under5kOnly: boolean;
}

interface ApiJob {
  id: string;
  title: string;
  description: string;
  category: string;
  locationType: string;
  location: string | null;
  budget: number;
  urgency: string;
  status: string;
  clientId: string;
  clientName?: string;
  budgetFormatted?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Explore() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();

  const [filters, setFilters] = useState<ExploreFilterState>({
    query: "",
    location: "",
    category: "",
    urgentOnly: false,
    remoteOnly: false,
    under5kOnly: false,
  });
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ExploreFilterState;
      setFilters(parsed);
      setDebouncedQuery(parsed.query);
    } catch {
      // Ignore malformed persisted filter state.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STATE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 250);
    return () => clearTimeout(t);
  }, [filters.query]);

  // Build query params from filters
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.location) params.set("location", filters.location);
    if (filters.category) params.set("category", filters.category);
    if (filters.urgentOnly) params.set("urgency", "urgent");
    if (filters.remoteOnly) params.set("locationType", "remote");
    if (filters.under5kOnly) {
      params.set("minBudget", "0");
      params.set("maxBudget", "5000");
    }
    return params;
  }, [debouncedQuery, filters]);

  const jobsQuery = useQuery<{ jobs: ApiJob[]; total: number }>({
    queryKey: ["api", "jobs", searchParams.toString()],
    queryFn: async () => {
      const res = await apiFetch(`/api/jobs?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const myApplicationsQuery = useQuery({
    queryKey: ["api", "applications", user?.id],
    queryFn: async () => {
      const res = await apiFetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: Boolean(user?.id),
  });

  const appliedJobIds = useMemo(
    () => new Set((myApplicationsQuery.data || []).map((app: any) => app.jobId || app.aggregatedJobId)),
    [myApplicationsQuery.data]
  );

  const applyMutation = useMutation({
    mutationFn: async (job: ApiJob) => {
      if (!user?.id) {
        throw new Error("Please sign in to apply.");
      }
      return apiPost("/api/applications", {
        jobId: job.id,
        jobTitle: job.title,
        company: job.clientName || "Client",
        coverLetter: "",
        source: "explore",
      });
    },
    onSuccess: () => {
      setStatusText("Application submitted successfully.");
      myApplicationsQuery.refetch();
    },
    onError: (error: Error) => {
      setStatusText(error.message);
    },
  });

  const allJobs = jobsQuery.data?.jobs || [];

  const recommendedJobs = useMemo(() => {
    if (filters.query.trim() || filters.location.trim() || filters.category || filters.urgentOnly || filters.remoteOnly || filters.under5kOnly) {
      return allJobs;
    }
    return allJobs.slice(0, 12);
  }, [allJobs, filters]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1">
        <section className="bg-gradient-to-br from-primary via-primary to-primary/80 text-white pt-28 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Jobs</h1>
              <p className="text-white/80">Search by title, keyword, location, and filters.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-3 shadow-xl grid md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title or keyword"
                  className="pl-9 h-12 text-foreground"
                  value={filters.query}
                  onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                  data-testid="explore-input-query"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-9 h-12 text-foreground"
                  value={filters.location}
                  onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                  data-testid="explore-input-location"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setDebouncedQuery(filters.query);
                    setStatusText(`Searching...`);
                  }}
                  data-testid="explore-button-search"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 justify-center text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={filters.urgentOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, urgentOnly: checked === true }))}
                />
                Urgent
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={filters.remoteOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, remoteOnly: checked === true }))}
                />
                Remote
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={filters.under5kOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, under5kOnly: checked === true }))}
                />
                Under 5K
              </label>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/20 border-b">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SERVICE_CATEGORIES.map((category) => {
                const selected = filters.category === category.id;
                return (
                  <button
                    key={category.id}
                    className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                      selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                    }`}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        category: prev.category === category.id ? "" : category.id,
                      }));
                    }}
                    data-testid={`explore-category-${category.id}`}
                  >
                    <p className="text-sm font-semibold">{category.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 md:px-6">
            {statusText && (
              <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-foreground">
                {statusText}
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">{filters.query.trim() || filters.location.trim() ? "Search Results" : "Latest Jobs"}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{recommendedJobs.length} jobs</p>
            </div>

            {jobsQuery.isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[230px] rounded-xl" />
                ))}
              </div>
            ) : jobsQuery.isError ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                <p className="font-semibold text-destructive">Failed to load jobs.</p>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <p className="font-medium">No results found</p>
                <p className="text-sm text-muted-foreground mt-1">Try another keyword, location, or remove filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      query: "",
                      location: "",
                      category: "",
                      urgentOnly: false,
                      remoteOnly: false,
                      under5kOnly: false,
                    })
                  }
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.clientName || "Client"}
                    type={job.urgency === "urgent" ? "Urgent" : job.locationType === "remote" ? "Remote" : "On-site"}
                    budget={formatAmount(job.budget || 0)}
                    location={job.location || "Unknown"}
                    postedAt={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                    tags={[job.category || "General", job.locationType === "remote" ? "Remote" : "On-site"]}
                    description={job.description || "No description provided."}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    onApply={() => {
                      if (appliedJobIds.has(job.id)) {
                        setStatusText("You already applied to this job.");
                        return;
                      }
                      if (!user?.id) {
                        navigate(`/auth?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
                        return;
                      }
                      applyMutation.mutate(job);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-10 border-t bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="rounded-2xl border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" />Need services instead of jobs?</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse taskers and instant service packages.</p>
              </div>
              <Button onClick={() => navigate("/services")}>
                <Zap className="w-4 h-4 mr-2" />
                View Services
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

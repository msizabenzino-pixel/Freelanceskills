import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, Briefcase, Sparkles, Loader2, X } from "lucide-react";
import { AIProposalHelper } from "@/components/AIProposalHelper";
import { useCurrency } from "@/lib/currency";

interface DisplayJob {
  title: string;
  company: string;
  type: string;
  budget: string;
  budgetNumeric: number;
  location: string;
  postedAt: string;
  postedTimestamp: number;
  tags: string[];
  description: string;
}

interface ApiJob {
  id: string;
  title: string;
  description: string;
  category: string;
  locationType: string;
  location?: string;
  budget: number;
  status: string;
  clientId: string;
  clientName?: string;
  createdAt: string;
}

const JOB_TYPES = ["Remote", "Onsite", "Contract", "Full-time", "Part-time", "Hourly", "Project", "Urgent"];
const EXPERIENCE_LEVELS = ["Entry Level", "Intermediate", "Expert"];

function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
}

function mapApiJobToDisplay(apiJob: ApiJob, formatAmount: (amount: number) => string): DisplayJob {
  return {
    title: apiJob.title,
    company: apiJob.clientName || "FreelanceSkills Client",
    type: apiJob.locationType === "remote" ? "Remote" : "Onsite",
    budget: formatAmount(apiJob.budget),
    budgetNumeric: apiJob.budget,
    location: apiJob.location || "South Africa",
    postedAt: formatTimeAgo(apiJob.createdAt),
    postedTimestamp: new Date(apiJob.createdAt).getTime(),
    tags: [apiJob.category],
    description: apiJob.description,
  };
}

const SAMPLE_JOBS = (formatAmount: (amount: number) => string, formatRateRange: (min: number, max: number, type: string) => string, formatRate: (amount: number, type: string) => string): DisplayJob[] => [
  {
    title: "Senior React Developer",
    company: "Capitec Bank",
    type: "Remote",
    budget: formatRateRange(650, 850, "hr"),
    budgetNumeric: 850,
    location: "Cape Town",
    postedAt: "2h ago",
    postedTimestamp: Date.now() - 7200000,
    tags: ["React", "TypeScript"],
    description: "Building secure, high-performance banking interfaces."
  },
  {
    title: "Graphic Designer for Rebranding",
    company: "Woolworths",
    type: "Project",
    budget: formatAmount(45000),
    budgetNumeric: 45000,
    location: "Remote",
    postedAt: "5h ago",
    postedTimestamp: Date.now() - 18000000,
    tags: ["Design", "Branding"],
    description: "Complete visual overhaul for our new summer campaign."
  },
  {
    title: "SEO Copywriter",
    company: "Discovery",
    type: "Part-time",
    budget: formatRate(350, "hr"),
    budgetNumeric: 350,
    location: "Sandton",
    postedAt: "1d ago",
    postedTimestamp: Date.now() - 86400000,
    tags: ["Copywriting", "SEO"],
    description: "Weekly blog content on investment trends."
  },
  {
    title: "Mobile App Developer (Flutter)",
    company: "Startup Inc",
    type: "Contract",
    budget: formatAmount(60000),
    budgetNumeric: 60000,
    location: "Remote",
    postedAt: "2d ago",
    postedTimestamp: Date.now() - 172800000,
    tags: ["Flutter", "Dart"],
    description: "MVP development for a new logistics app."
  },
  {
    title: "Data Analyst",
    company: "MTN",
    type: "Full-time",
    budget: formatRate(45000, "mo"),
    budgetNumeric: 45000,
    location: "Johannesburg",
    postedAt: "3d ago",
    postedTimestamp: Date.now() - 259200000,
    tags: ["Python", "SQL", "Tableau"],
    description: "Analyze customer usage patterns and generate insights."
  },
  {
    title: "Virtual Assistant",
    company: "Private Client",
    type: "Hourly",
    budget: formatRate(150, "hr"),
    budgetNumeric: 150,
    location: "Remote",
    postedAt: "4d ago",
    postedTimestamp: Date.now() - 345600000,
    tags: ["Admin", "Scheduling"],
    description: "Managing calendar and emails for an executive."
  }
];

export default function Jobs() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialQuery = urlParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<number[]>([100]);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [showProposalHelper, setShowProposalHelper] = useState(false);
  const { formatAmount, formatRateRange, formatRate } = useCurrency();
  const [, navigate] = useLocation();

  const { data: apiJobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json() as Promise<ApiJob[]>;
    },
  });

  const sampleJobs = useMemo(() => SAMPLE_JOBS(formatAmount, formatRateRange, formatRate), []);
  const displayApiJobs = useMemo(() => apiJobs.map((job) => mapApiJobToDisplay(job, formatAmount)), [apiJobs]);

  const allJobs = useMemo(() => {
    const combined = [
      ...displayApiJobs.map((job) => ({ ...job, source: "real" as const })),
      ...sampleJobs.map((job) => ({ ...job, source: "sample" as const })),
    ];
    return combined;
  }, [displayApiJobs, sampleJobs]);

  const filteredJobs = useMemo(() => {
    let jobs = [...allJobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          job.location.toLowerCase().includes(q)
      );
    }

    if (selectedTypes.length > 0) {
      jobs = jobs.filter((job) =>
        selectedTypes.some((t) => job.type.toLowerCase() === t.toLowerCase())
      );
    }

    const maxBudget = budgetRange[0] * 100;
    if (maxBudget < 10000) {
      jobs = jobs.filter((job) => job.budgetNumeric <= maxBudget);
    }

    if (sortBy === "newest") {
      jobs.sort((a, b) => b.postedTimestamp - a.postedTimestamp);
    } else if (sortBy === "budget") {
      jobs.sort((a, b) => b.budgetNumeric - a.budgetNumeric);
    }

    return jobs;
  }, [allJobs, searchQuery, selectedTypes, budgetRange, sortBy]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setBudgetRange([100]);
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || budgetRange[0] < 100;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content">
      <div className="bg-primary pb-16 pt-32">
        <div className="container mx-auto px-4 md:px-6 text-center text-white">
          <h1 className="text-4xl font-display font-bold mb-4">Find Your Next Opportunity</h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Browse thousands of jobs from top South African companies and international clients.</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                className="pl-10 h-12 bg-white text-foreground border-0"
                placeholder="Search by skill, keyword, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-jobs"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 bg-accent text-primary hover:bg-accent/90 font-bold" data-testid="button-search-jobs">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-16 pb-20 flex-1">
        <div className="grid lg:grid-cols-4 gap-8">
          
          <div className="hidden lg:block space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Filter className="w-5 h-5" /> Filters
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {JOB_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                          data-testid={`filter-type-${type.toLowerCase().replace(/\s/g, '-')}`}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                 <div>
                  <h4 className="text-sm font-semibold mb-3">Budget Range</h4>
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={100}
                    step={1}
                    className="my-4"
                    data-testid="slider-budget"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatAmount(100)}</span>
                    <span>{budgetRange[0] >= 100 ? "Any" : formatAmount(budgetRange[0] * 100)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl p-3 flex items-center justify-between border border-border shadow-sm">
               <span className="text-sm font-medium px-2 text-muted-foreground">
                 {isLoading ? (
                   <>
                     <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                     Loading jobs...
                   </>
                 ) : (
                   <>
                     Showing <span className="text-foreground font-bold">{filteredJobs.length}</span> jobs
                     {hasActiveFilters && (
                       <span className="text-xs ml-1">(filtered)</span>
                     )}
                   </>
                 )}
               </span>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">Sort by:</span>
                 <select
                   className="text-sm font-medium bg-transparent border border-border rounded-md px-2 py-1 cursor-pointer focus:ring-1 focus:ring-primary"
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   data-testid="select-sort"
                 >
                   <option value="newest">Newest First</option>
                   <option value="budget">Highest Budget</option>
                 </select>
               </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-search">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {visibleJobs.map((job, i) => (
                  <div key={`${job.source}-${i}`} onClick={() => { setSelectedJob(job); setShowProposalHelper(true); }} className="cursor-pointer" data-testid={`job-card-${i}`}>
                    <JobCard {...job} />
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  className="w-full max-w-xs"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  data-testid="button-load-more"
                >
                  Load More Jobs ({filteredJobs.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      </main>
      <Footer />

      <Dialog open={showProposalHelper} onOpenChange={setShowProposalHelper}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Apply for: {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              Use our AI assistant to craft a compelling proposal for this job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <AIProposalHelper
              jobTitle={selectedJob.title}
              jobDescription={selectedJob.description}
              onApply={(proposal) => {
                console.log("Proposal submitted:", proposal);
                setShowProposalHelper(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

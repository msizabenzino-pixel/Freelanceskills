import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, RefreshCw, MapPin, Building2, Clock, 
  Briefcase, Zap, Sparkles, ExternalLink, Send, 
  Loader2, Filter, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AggregatedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string | null;
  location: string;
  province: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  source: string;
  sourceUrl: string | null;
  category: string;
  jobType: string;
  postedDate: string;
}

interface JobBoardResponse {
  jobs: AggregatedJob[];
  totalCount: number;
  lastUpdated: string;
}

const SOURCES = [
  "PNet", "CareerJunction", "LinkedIn", "Indeed SA", 
  "Careers24", "Gumtree Jobs", "Government Vacancies", "Bizcommunity"
];

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", 
  "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
];

const JOB_TYPES = ["full-time", "part-time", "contract", "remote", "hybrid"];

const SOURCE_COLORS: Record<string, string> = {
  "PNet": "bg-blue-100 text-blue-800 border-blue-200",
  "CareerJunction": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "LinkedIn": "bg-sky-100 text-sky-800 border-sky-200",
  "Indeed SA": "bg-blue-50 text-blue-700 border-blue-100",
  "Careers24": "bg-orange-100 text-orange-800 border-orange-200",
  "Gumtree Jobs": "bg-green-100 text-green-800 border-green-200",
  "Government Vacancies": "bg-red-100 text-red-800 border-red-200",
  "Bizcommunity": "bg-purple-100 text-purple-800 border-purple-200",
};

export default function JobBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [province, setProvince] = useState<string>("all");
  const [category, setCategory] = useState<string>("");
  const [source, setSource] = useState<string>("all");
  const [jobType, setJobType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AggregatedJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery<JobBoardResponse>({
    queryKey: ["/api/job-board", { province, category: searchQuery || category, source, jobType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (province !== "all") params.append("province", province);
      if (searchQuery || category) params.append("category", searchQuery || category);
      if (source !== "all") params.append("source", source);
      if (jobType !== "all") params.append("jobType", jobType);
      
      const res = await fetch(`/api/job-board?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/job-board/refresh", { 
        province: province !== "all" ? province : undefined, 
        category: searchQuery || category || undefined 
      });
    },
    onSuccess: () => {
      toast({ title: "Scanning...", description: "Looking for new South African opportunities." });
      refetch();
    }
  });

  const formatSalary = (min: number | null, max: number | null, period: string | null) => {
    if (!min && !max) return "Market Related";
    const p = period || "month";
    if (min && max) {
      return `R ${min.toLocaleString('en-ZA')} - R ${max.toLocaleString('en-ZA')} /${p}`;
    }
    return `R ${(min || max || 0).toLocaleString('en-ZA')} /${p}`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshMutation.mutate()} 
                disabled={refreshMutation.isPending || isFetching}
                className="gap-2"
                data-testid="button-refresh-jobs"
              >
                <RefreshCw className={cn("h-4 w-4", (refreshMutation.isPending || isFetching) && "animate-spin")} />
                Refresh
              </Button>
            </div>
            
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="text-page-title">SA Job Board</h1>
              <p className="text-lg text-slate-600 mb-6">All South African opportunities in one place. Aggregated from top boards and government portals.</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {SOURCES.map(s => (
                  <Badge key={s} variant="secondary" className={cn("px-3 py-1 text-xs font-medium border", SOURCE_COLORS[s] || "bg-slate-100 text-slate-700")}>
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-slate-900" data-testid="text-total-jobs">
                    {data?.totalCount || 0}
                  </span> live jobs
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last updated: <span className="font-medium" data-testid="text-last-updated">{data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-20 z-30 container mx-auto px-4 mb-8">
          <Card className="shadow-md border-primary/10">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger data-testid="select-province">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Category (e.g. Design)" 
                    className="pl-9"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    data-testid="input-category"
                  />
                </div>

                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger data-testid="select-source">
                    <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger data-testid="select-job-type">
                    <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    {JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                  onClick={() => setSearchQuery(category)}
                  data-testid="button-search"
                >
                  Search Opportunities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-40 bg-white" data-testid="skeleton-job-card" />
              ))}
            </div>
          ) : data?.jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Scanning SA job boards...</h3>
              <p className="text-slate-500 mb-6 max-w-xs mx-auto">We couldn't find matches. Try broadening your search or refresh our engine.</p>
              <Button 
                onClick={() => refreshMutation.mutate()}
                className="gap-2"
                data-testid="button-empty-refresh"
              >
                <RefreshCw className="h-4 w-4" />
                Trigger Deep Scan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {data?.jobs.map(job => (
                <Card 
                  key={job.id} 
                  className={cn(
                    "transition-all duration-200 border-l-4",
                    expandedJobId === job.id ? "border-l-primary shadow-md" : "border-l-transparent hover:shadow-sm"
                  )}
                  data-testid={`card-job-${job.id}`}
                >
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className={cn("font-semibold border", SOURCE_COLORS[job.source])} data-testid={`badge-source-${job.id}`}>
                            {job.source}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 capitalize">
                            {job.jobType.replace('-', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1" data-testid={`text-job-title-${job.id}`}>{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" /> <span data-testid={`text-company-${job.id}`}>{job.company}</span></span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> <span data-testid={`text-location-${job.id}`}>{job.location}, {job.province}</span></span>
                          <span className="flex items-center gap-1 font-medium text-emerald-600" data-testid={`text-salary-${job.id}`}>
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {getTimeAgo(job.postedDate)}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-accent text-primary hover:bg-accent/90 font-bold"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsApplyModalOpen(true);
                          }}
                          data-testid={`button-quick-apply-${job.id}`}
                        >
                          Quick Apply
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div 
                      className={cn("text-slate-600 text-sm line-clamp-2", expandedJobId === job.id && "line-clamp-none")}
                    >
                      {job.description.replace(/<[^>]*>?/gm, '')}
                    </div>
                    
                    {expandedJobId === job.id && job.requirements && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2">Requirements:</h4>
                        <div className="text-slate-600 text-sm whitespace-pre-line">
                          {job.requirements}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-4 p-0 h-auto text-primary hover:bg-transparent hover:underline flex items-center gap-1"
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      data-testid={`button-expand-${job.id}`}
                    >
                      {expandedJobId === job.id ? (
                        <>Show less <ChevronUp className="h-4 w-4" /></>
                      ) : (
                        <>Read more & requirements <ChevronDown className="h-4 w-4" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <QuickApplyModal 
        job={selectedJob} 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        user={user}
      />
    </div>
  );
}

function QuickApplyModal({ job, isOpen, onClose, user }: { job: AggregatedJob | null, isOpen: boolean, onClose: () => void, user: any }) {
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/generate-cover-letter", {
        jobTitle: job?.title,
        company: job?.company,
        jobDescription: job?.description,
        userSkills: user?.skills || [],
        userName: user?.firstName || "Candidate"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
    },
    onError: () => {
      toast({ title: "AI Generation Failed", description: "Please try writing manually.", variant: "destructive" });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/applications", {
        jobTitle: job?.title,
        company: job?.company,
        coverLetter,
        source: job?.source,
        aggregatedJobId: job?.id
      });
    },
    onSuccess: () => {
      toast({ title: "Application Sent!", description: "Your details have been submitted to " + job?.company });
      onClose();
      setCoverLetter("");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Send className="h-6 w-6 text-primary" />
            Apply for {job?.title}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 font-medium">{job?.company}</span>
            <Badge variant="outline" className="ml-2">{job?.source}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Job Context:</h4>
            <div className="text-slate-600 text-xs line-clamp-3">
              {job?.description.replace(/<[^>]*>?/gm, '') || ''}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900">Cover Letter</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80 gap-1 h-auto py-1"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-ai-generate"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generate with AI
              </Button>
            </div>
            {generateMutation.isError && (
              <p className="text-xs text-red-500 mt-1" data-testid="text-ai-error">
                Failed to generate cover letter. Please try again or write manually.
              </p>
            )}
            <Textarea 
              placeholder="Why are you a great fit for this role?"
              className="min-h-[250px] resize-none"
              value={coverLetter}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value)}
              data-testid="textarea-cover-letter"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button 
              className="flex-1 bg-primary text-white font-bold" 
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !coverLetter.trim()}
              data-testid="button-submit-application"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

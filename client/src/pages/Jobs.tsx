import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCard } from "@/components/JobCard";
import { Loader2, Search, MapPin, AlertCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import { applyForJobInFirestore, fetchApplicationsForFreelancer, fetchJobsFromFirestore, type Job } from "@/lib/firebaseAppData";

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [under5kOnly, setUnder5kOnly] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const jobsQuery = useQuery({
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
    [myApplicationsQuery.data]
  );

  const applyMutation = useMutation({
    mutationFn: async (job: Job) => {
      if (!user?.id) throw new Error("Please sign in first.");
      const result = await applyForJobInFirestore({
        jobId: job.id,
        freelancerId: user.id,
        freelancerName: user.firstName || user.email || "Freelancer",
      });
      return result;
    },
    onSuccess: (result) => {
      setStatusText(result.applied ? "Application submitted successfully." : "You already applied to this job.");
      myApplicationsQuery.refetch();
    },
    onError: (error: Error) => {
      setStatusText(error.message);
    },
  });

  const filteredJobs = useMemo(() => {
    const items = jobsQuery.data || [];
    const q = query.trim().toLowerCase();
    const loc = locationFilter.trim().toLowerCase();

    return items.filter((job) => {
      if (q) {
        const haystack = `${job.title} ${job.description} ${job.category} ${job.clientName || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (loc && !(job.location || "").toLowerCase().includes(loc)) return false;
      if (urgentOnly && job.urgency !== "urgent") return false;
      if (remoteOnly && job.locationType !== "remote") return false;
      if (under5kOnly && job.budget > 5000) return false;
      return true;
    });
  }, [jobsQuery.data, query, locationFilter, urgentOnly, remoteOnly, under5kOnly]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="bg-primary text-white pt-28 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-3">Find Jobs</h1>
            <p className="text-white/80">Search by keyword and location, then apply instantly.</p>
            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 bg-white text-foreground"
                  placeholder="Job title or keyword"
                  data-testid="jobs-input-query"
                />
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 bg-white text-foreground"
                  placeholder="Location"
                  data-testid="jobs-input-location"
                />
              </div>
              <Button onClick={() => setStatusText(null)} className="bg-accent text-primary hover:bg-accent/90">
                Search
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><Checkbox checked={urgentOnly} onCheckedChange={(v) => setUrgentOnly(Boolean(v))} /> Urgent</label>
              <label className="flex items-center gap-2"><Checkbox checked={remoteOnly} onCheckedChange={(v) => setRemoteOnly(Boolean(v))} /> Remote</label>
              <label className="flex items-center gap-2"><Checkbox checked={under5kOnly} onCheckedChange={(v) => setUnder5kOnly(Boolean(v))} /> Under 5K</label>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 space-y-4">
          {statusText && (
            <div className="rounded-lg border border-border bg-card p-3 text-sm">{statusText}</div>
          )}

          {jobsQuery.isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : jobsQuery.isError ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-semibold">Failed to load jobs.</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No results found. Try a different keyword or location.</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
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
                      setStatusText("You already applied to this job.");
                      return;
                    }
                    if (!user?.id) {
                      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
                      return;
                    }
                    applyMutation.mutate(job);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

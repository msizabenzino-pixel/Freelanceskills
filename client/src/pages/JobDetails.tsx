import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";

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

export default function JobDetails() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();

  const jobQuery = useQuery<ApiJob>({
    queryKey: ["api", "job", params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${params!.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Job not found");
      return res.json();
    },
    enabled: Boolean(params?.id),
  });

  const myAppsQuery = useQuery({
    queryKey: ["api", "applications", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/applications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: Boolean(user?.id),
  });

  const alreadyApplied = Boolean(
    myAppsQuery.data?.some((app: any) => app.jobId === params?.id)
  );

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!jobQuery.data || !user?.id) throw new Error("Please sign in first.");
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          jobId: jobQuery.data.id,
          jobTitle: jobQuery.data.title,
          company: jobQuery.data.clientName || "Client",
          coverLetter: "",
          source: "job-details",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to apply");
      }
      return res.json();
    },
    onSuccess: () => {
      myAppsQuery.refetch();
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {jobQuery.isLoading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : jobQuery.isError || !jobQuery.data ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-semibold">Job not found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-primary">{jobQuery.data.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge>{jobQuery.data.urgency === "urgent" ? "Urgent" : "Normal"}</Badge>
                <Badge variant="secondary">{jobQuery.data.locationType === "remote" ? "Remote" : "On-site"}</Badge>
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" />{jobQuery.data.location || "Not specified"}</span>
              </div>
              <div className="text-lg font-bold">{formatAmount(jobQuery.data.budget)}</div>
              <div className="rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-foreground">
                {jobQuery.data.description}
              </div>
              <div className="text-sm text-muted-foreground">
                Client: {jobQuery.data.clientName || jobQuery.data.clientId} • Posted: {jobQuery.data.createdAt ? new Date(jobQuery.data.createdAt).toLocaleDateString() : "Recently"}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={alreadyApplied || applyMutation.isPending}
                  onClick={() => {
                    if (!user?.id) {
                      navigate(`/auth?redirect=${encodeURIComponent(`/jobs/${jobQuery.data!.id}`)}`);
                      return;
                    }
                    applyMutation.mutate();
                  }}
                >
                  {alreadyApplied ? "Applied" : applyMutation.isPending ? "Applying..." : "Apply"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
              </div>
              {applyMutation.isError && (
                <p className="text-sm text-destructive">{(applyMutation.error as Error).message}</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

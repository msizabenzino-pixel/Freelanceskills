import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import { applyForJobInFirestore, fetchApplicationsForFreelancer, fetchJobById } from "@/lib/firebaseAppData";

export default function JobDetails() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();

  const jobQuery = useQuery({
    queryKey: ["firebase", "job", params?.id],
    queryFn: () => fetchJobById(params!.id),
    enabled: Boolean(params?.id),
  });

  const myAppsQuery = useQuery({
    queryKey: ["firebase", "apps", user?.id],
    queryFn: () => fetchApplicationsForFreelancer(user!.id),
    enabled: Boolean(user?.id),
  });

  const alreadyApplied = Boolean(
    myAppsQuery.data?.some((app) => app.jobId === params?.id)
  );

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!jobQuery.data || !user?.id) throw new Error("Please sign in first.");
      return applyForJobInFirestore({
        jobId: jobQuery.data.id,
        freelancerId: user.id,
        freelancerName: user.firstName || user.email || "Freelancer",
      });
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
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" />{jobQuery.data.location}</span>
              </div>
              <div className="text-lg font-bold">{formatAmount(jobQuery.data.budget)}</div>
              <div className="rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-foreground">
                {jobQuery.data.description}
              </div>
              <div className="text-sm text-muted-foreground">
                Client: {jobQuery.data.clientName || jobQuery.data.clientId} • Posted: {jobQuery.data.createdAt?.toLocaleDateString() || "Recently"}
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

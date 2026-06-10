import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);

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

  const alreadyApplied = applied || Boolean(
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
          coverLetter: coverLetter.trim(),
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
      setApplied(true);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent. Track it in My Applications.",
      });
      myAppsQuery.refetch();
    },
    onError: (err: Error) => {
      toast({
        title: "Application failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {jobQuery.isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobQuery.isError || !jobQuery.data ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-semibold">Job not found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-3">{jobQuery.data.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge>{jobQuery.data.urgency === "urgent" ? "🔥 Urgent" : "Normal"}</Badge>
                  <Badge variant="secondary">
                    {jobQuery.data.locationType === "remote" ? "Remote" : "On-site"}
                  </Badge>
                  {jobQuery.data.location && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />{jobQuery.data.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xl font-bold text-emerald-600">
                {formatAmount(jobQuery.data.budget)}
              </div>

              <div className="rounded-xl border border-border bg-card p-5 whitespace-pre-wrap text-foreground leading-relaxed">
                {jobQuery.data.description}
              </div>

              <div className="text-sm text-muted-foreground">
                Posted by: {jobQuery.data.clientName || jobQuery.data.clientId} •{" "}
                {jobQuery.data.createdAt
                  ? new Date(jobQuery.data.createdAt).toLocaleDateString()
                  : "Recently"}
              </div>

              {/* Application section */}
              {alreadyApplied ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-600">Application submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track your progress in{" "}
                      <button
                        className="underline text-emerald-600 hover:text-emerald-500"
                        onClick={() => navigate("/my-applications")}
                      >
                        My Applications
                      </button>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Write a cover letter (optional)
                  </div>
                  <Textarea
                    placeholder="Introduce yourself and explain why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[120px] resize-none text-sm"
                    maxLength={2000}
                    data-testid="textarea-cover-letter"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {coverLetter.length}/2000
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={applyMutation.isPending}
                      onClick={() => {
                        if (!user?.id) {
                          navigate(`/auth?redirect=${encodeURIComponent(`/jobs/${jobQuery.data!.id}`)}`);
                          return;
                        }
                        applyMutation.mutate();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white"
                      data-testid="button-apply-job"
                    >
                      {applyMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying…</>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/jobs")} data-testid="button-back-jobs">
                      Back to Jobs
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

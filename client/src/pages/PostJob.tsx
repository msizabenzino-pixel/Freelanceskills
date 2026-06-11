import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Wand2, Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Briefcase, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AIJobPostHelper } from "@/components/AIJobPostHelper";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck } from "lucide-react";
import { apiPost } from "@/lib/api";

interface JobPostSuggestion {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedBudget: { min: number; max: number };
  requiredSkills: string[];
  questions: string[];
}

export default function PostJob() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const targetFreelancerId = new URLSearchParams(window.location.search).get("hire");

  const { data: targetFreelancer } = useQuery<any>({
    queryKey: ["/api/freelancers", targetFreelancerId],
    queryFn: async () => {
      const res = await fetch(`/api/freelancers/${targetFreelancerId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!targetFreelancerId,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationType, setLocationType] = useState<"onsite" | "remote">("onsite");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successJobId, setSuccessJobId] = useState<string | null>(null);

  // Hydrate from AI Brief Generator URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTitle = params.get("title");
    const urlDescription = params.get("description");
    const urlBudgetMin = params.get("budgetMin");
    const urlBudgetMax = params.get("budgetMax");
    const urlSkills = params.get("skills");
    const urlTimeline = params.get("timeline");
    const urlJobType = params.get("jobType");

    if (urlTitle) setTitle(urlTitle);
    if (urlDescription) setDescription(urlDescription);
    if (urlBudgetMin && urlBudgetMax) setBudget(urlBudgetMax);
    if (urlSkills) setSkills(urlSkills.split(",").filter(Boolean));
    if (urlTimeline) setDescription((prev) => prev ? `${prev}\n\nTimeline: ${urlTimeline}` : `Timeline: ${urlTimeline}`);
    if (urlJobType) setDescription((prev) => prev ? `${prev}\n\nType: ${urlJobType}` : `Type: ${urlJobType}`);
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (): Promise<{ description: string; suggestedBudget: { min: number; max: number } }> => {
      const response = await fetch("/api/ai/generate-job-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ briefDescription: title }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      return response.json();
    },
    onSuccess: (data) => {
      setDescription(data.description);
      setBudget(data.suggestedBudget?.max?.toString() || "15000");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      locationType: string;
      location?: string;
      budget: number;
      skills?: string[];
    }) => {
      return apiPost("/api/jobs", data);
    },
    onSuccess: (job) => {
      setSuccessJobId(job.id);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAIGenerate = () => {
    if (title.length >= 5) generateMutation.mutate();
  };

  const handleApplyAISuggestion = (suggestion: JobPostSuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setCategory(suggestion.suggestedCategory);
    setBudget(suggestion.suggestedBudget.max.toString());
    setSkills(suggestion.requiredSkills);
    setShowAIHelper(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 3) return setError("Job title must be at least 3 characters.");
    if (!description.trim() || description.length < 10) return setError("Description must be at least 10 characters.");
    if (!category) return setError("Please select a category.");
    const budgetRands = parseFloat(budget);
    if (!budget || isNaN(budgetRands) || budgetRands < 1) return setError("Please enter a valid budget in ZAR.");

    submitMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      locationType,
      location: locationType === "onsite" && location.trim() ? location.trim() : undefined,
      budget: Math.round(budgetRands * 100),
      skills,
      urgency,
      ...(targetFreelancerId ? { targetFreelancerId } : {}),
    });
  };

  if (successJobId) {
    return (
      <AuthGuard message="Sign in to post a job and find talented freelancers.">
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
          <Navbar />
          <main id="main-content" className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 max-w-2xl flex-1 pb-20 flex items-start justify-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center w-full mt-8" data-testid="job-posted-success">
              <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Job Posted Successfully!</h2>
              <p className="text-slate-400 mb-2">
                Your job is now live and visible to <span className="font-semibold text-white">verified freelancers</span> across South Africa and beyond.
              </p>
              <p className="text-sm text-slate-400 mb-8">Expect your first proposals within minutes.</p>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left mb-8 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Job Title</span>
                  <span className="font-medium text-white max-w-[60%] text-right">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget</span>
                  <span className="font-bold text-emerald-400">R{parseFloat(budget).toLocaleString("en-ZA")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Open</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                  View My Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setSuccessJobId(null);
                    setTitle(""); setDescription(""); setCategory(""); setBudget(""); setSkills([]);
                  }}
                  data-testid="button-post-another"
                >
                  Post Another Job
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard message="Sign in to post a job and find talented freelancers.">
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Navbar />

        <main id="main-content" className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 max-w-3xl flex-1 pb-20">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>

          {targetFreelancer && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5" data-testid="banner-targeted-hire">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Hiring <span className="text-emerald-400">{targetFreelancer.name || targetFreelancer.title || "this freelancer"}</span> directly
                </p>
                <p className="text-xs text-muted-foreground">Your job will be sent directly to this freelancer once posted.</p>
              </div>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={targetFreelancer.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-emerald-500/20 text-emerald-300">
                  {(targetFreelancer.name || targetFreelancer.title || "?")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary mb-2">Post a New Job</h1>
              <p className="text-muted-foreground">Reach thousands of verified South African freelancers in minutes.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </div>
          </div>

          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="w-full justify-between"
              data-testid="button-toggle-ai-helper"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Need help writing your job post? Try our AI Assistant
              </span>
              {showAIHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {showAIHelper && (
              <div className="mt-4">
                <AIJobPostHelper onApply={handleApplyAISuggestion} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg">
            <form className="space-y-8" onSubmit={handleSubmit}>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400" data-testid="error-message">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Certified Safety Officer for 6 Months"
                    className="h-12 text-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-job-title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-accent hover:text-accent hover:bg-accent/10 h-8"
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={generateMutation.isPending || title.length < 5}
                    data-testid="button-ai-write"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3 mr-1" />
                    )}
                    {generateMutation.isPending ? "Generating..." : "AI Auto-Write"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the project, requirements, and deliverables..."
                  className="min-h-[200px] text-base resize-none p-4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-description"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`border-2 p-4 rounded-xl text-left transition-all ${locationType === "onsite" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setLocationType("onsite")}
                      data-testid="button-location-type-onsite"
                    >
                      <div className={`font-bold ${locationType === "onsite" ? "text-primary" : "text-foreground"}`}>On-site</div>
                      <div className="text-xs text-muted-foreground">Work at a specific location</div>
                    </button>
                    <button
                      type="button"
                      className={`border-2 p-4 rounded-xl text-left transition-all ${locationType === "remote" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setLocationType("remote")}
                      data-testid="button-location-type-remote"
                    >
                      <div className={`font-bold ${locationType === "remote" ? "text-primary" : "text-foreground"}`}>Remote</div>
                      <div className="text-xs text-muted-foreground">Work from anywhere</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (ZAR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 25000"
                    className="h-[60px] text-lg"
                    value={budget}
                    min="1"
                    onChange={(e) => setBudget(e.target.value)}
                    data-testid="input-budget"
                    required
                  />
                </div>
              </div>

              {locationType === "onsite" && (
                <div className="space-y-2">
                  <Label htmlFor="location">Job Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Sandton, Johannesburg"
                    className="h-12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    data-testid="input-location"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <Input
                  placeholder="Type a skill and press Enter (e.g. React, Python)"
                  className="h-12"
                  data-testid="input-skills"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !skills.includes(value)) {
                        setSkills([...skills, value]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 pt-2" data-testid="skills-list">
                  {skills.map((skill, i) => (
                    <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        className="hover:text-destructive ml-1"
                        onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {budget && parseFloat(budget) > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-sm">
                  <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300">
                    <span className="font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Cost breakdown
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">10% platform fee applies</span>
                  </div>
                  <div className="mt-2 space-y-1 text-emerald-700 dark:text-emerald-400">
                    <div className="flex justify-between">
                      <span>Job budget</span>
                      <span className="font-semibold">R{parseFloat(budget || "0").toLocaleString("en-ZA")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Freelancer receives</span>
                      <span>R{(parseFloat(budget || "0") * 0.9).toLocaleString("en-ZA")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border flex justify-end gap-4">
                <Button
                  variant="ghost"
                  className="h-12 px-8"
                  type="button"
                  data-testid="button-save-draft"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg"
                  type="submit"
                  disabled={submitMutation.isPending}
                  data-testid="button-post-job"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting Job...</>
                  ) : (
                    "Post Job Now"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}

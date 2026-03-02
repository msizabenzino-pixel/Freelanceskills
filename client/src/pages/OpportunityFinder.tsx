import { useState } from "react";
import {
  Button,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Input,
} from "@/components/ui/input";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  Search,
  MapPin,
  Building2,
  Clock,
  Target,
  Zap,
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  Send,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const OPPORTUNITY_TYPES = [
  { id: "Jobs", label: "Jobs", color: "bg-blue-500" },
  { id: "Apprenticeships", label: "Apprenticeships", color: "bg-orange-500" },
  { id: "Bursaries", label: "Bursaries", color: "bg-green-500" },
  { id: "Learnerships", label: "Learnerships", color: "bg-purple-500" },
  { id: "Internships", label: "Internships", color: "bg-teal-500" },
  { id: "Graduate Programmes", label: "Graduate Programmes", color: "bg-indigo-500" },
];

const PROVINCES = [
  "Nationwide",
  "Remote",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const AGENT_STEPS = [
  "Scanning SA job boards...",
  "Checking government programmes...",
  "Finding bursaries & learnerships...",
  "Matching to your profile...",
  "Ranking best opportunities...",
];

function ScoreRing({ score, size = 64, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold">{score}%</span>
    </div>
  );
}

export default function OpportunityFinder() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [location, setLocation] = useState("Nationwide");
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(OPPORTUNITY_TYPES.map((t) => t.id));
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const searchMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/opportunities/search", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setIsSearching(false);
    },
    onError: (error: Error) => {
        setIsSearching(false);
        toast({
          title: "Search Failed",
          description: error.message || "Failed to find opportunities. Please try again.",
          variant: "destructive"
        });
    }
  });

  const coverLetterMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/ai/generate-cover-letter", data);
      return res.json();
    },
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
      toast({
        title: "Cover Letter Generated",
        description: "AI has generated a tailored cover letter for you.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate cover letter.",
        variant: "destructive"
      });
    }
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: () => {
      setApplyingJob(null);
      setCoverLetter("");
      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchProgress(0);
    setResults(null);

    // Simulate progress animation
    const interval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    searchMutation.mutate({
      skills,
      interests,
      location,
      types: selectedTypes,
      experienceLevel,
    });
  };

  const currentStepIndex = Math.min(
    Math.floor((searchProgress / 100) * AGENT_STEPS.length),
    AGENT_STEPS.length - 1
  );

  const filteredOpportunities = results?.opportunities.filter((opp: any) => 
    activeTab === "All" || opp.type === activeTab
  ) || [];

  const handleGenerateCoverLetter = () => {
    if (!applyingJob) return;
    coverLetterMutation.mutate({
      jobTitle: applyingJob.title,
      company: applyingJob.organization,
      jobDescription: applyingJob.description,
      userSkills: skills,
      userName: user?.firstName || "Candidate",
    });
  };

  const handleSubmitApplication = () => {
    if (!applyingJob) return;
    applicationMutation.mutate({
      jobTitle: applyingJob.title,
      company: applyingJob.organization,
      coverLetter,
      source: "Opportunity Finder",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* HERO SECTION */}
        <section className="relative py-20 px-4 overflow-hidden animated-gradient-bg text-white">
          <div className="container mx-auto text-center relative z-10">
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-4 py-1" data-testid="badge-hero">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Sourcing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 flex items-center justify-center gap-3" data-testid="text-hero-title">
              <Sparkles className="w-8 h-8 md:w-12 md:h-12" />
              AI Opportunity Finder
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Your personal AI agent that sources jobs, bursaries, learnerships & more across South Africa
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/20"></div>
        </section>

        {/* SEARCH FORM */}
        <section className="py-12 px-4 -mt-10 relative z-20">
          <div className="container mx-auto max-w-4xl">
            <Card className="shadow-2xl border-primary/10">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Your Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        placeholder="React, Python, Project Management..."
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        data-testid="input-skills"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interests">Interests / Industry</Label>
                      <Input
                        id="interests"
                        placeholder="Tech, Finance, Healthcare..."
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        data-testid="input-interests"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger data-testid="select-location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          <SelectItem value="Entry">Entry</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Opportunity Types</Label>
                    <div className="flex flex-wrap gap-4">
                      {OPPORTUNITY_TYPES.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={type.id}
                            checked={selectedTypes.includes(type.id)}
                            onCheckedChange={(checked) => {
                              setSelectedTypes(checked
                                ? [...selectedTypes, type.id]
                                : selectedTypes.filter(t => t !== type.id)
                              );
                            }}
                            data-testid={`checkbox-type-${type.id.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <Label htmlFor={type.id} className="text-sm cursor-pointer">{type.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold shadow-lg" 
                    disabled={isSearching}
                    data-testid="button-find-opportunities"
                  >
                    {isSearching ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI Sourcing Agent Working...</>
                    ) : (
                      <><Search className="w-5 h-5 mr-2" /> Find Opportunities</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AGENT PROGRESS */}
        {isSearching && (
          <section className="py-12 px-4" data-testid="section-agent-progress">
            <div className="container mx-auto max-w-2xl text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2" data-testid="text-progress-step">{AGENT_STEPS[currentStepIndex]}</h3>
                <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${searchProgress}%` }}
                    data-testid="progress-bar"
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  {AGENT_STEPS.map((step, i) => (
                    <div key={i} className={cn(
                      "flex flex-col items-center gap-1",
                      i <= currentStepIndex ? "text-primary" : "opacity-30"
                    )} data-testid={`step-${i}`}>
                      {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RESULTS SECTION */}
        {results && (
          <section className="py-12 px-4 bg-muted/30" data-testid="section-results">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-border">
                <div>
                  <h2 className="text-2xl font-bold" data-testid="text-results-count">Found {results.summary.total} opportunities</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(results.summary.byType).map(([type, count]: [string, any]) => (
                      <Badge key={type} variant="secondary" className="text-xs" data-testid={`badge-summary-${type.toLowerCase().replace(/\s+/g, '-')}`}>
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
                {results.summary.topMatch && (
                  <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10" data-testid="top-match-highlight">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">Top Match Found</p>
                      <p className="text-sm font-semibold">{results.summary.topMatch}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
                {["All", ...OPPORTUNITY_TYPES.map(t => t.id)].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "outline"}
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full px-6 whitespace-nowrap"
                    data-testid={`button-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredOpportunities.map((opp: any) => (
                  <Card key={opp.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/5" data-testid={`card-opportunity-${opp.id}`}>
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={cn(
                                "text-white border-none",
                                OPPORTUNITY_TYPES.find(t => t.id === opp.type)?.color || "bg-gray-500"
                              )} data-testid={`badge-type-${opp.id}`}>
                                {opp.type}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1" data-testid={`badge-sector-${opp.id}`}>
                                <TrendingUp className="w-3 h-3" /> {opp.sector}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-bold mb-1" data-testid={`text-opp-title-${opp.id}`}>{opp.title}</h3>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4 flex-wrap">
                              <span className="flex items-center gap-1" data-testid={`text-org-${opp.id}`}><Building2 className="w-4 h-4" /> {opp.organization}</span>
                              <span className="flex items-center gap-1" data-testid={`text-loc-${opp.id}`}><MapPin className="w-4 h-4" /> {opp.location}</span>
                              <span className="flex items-center gap-1" data-testid={`text-deadline-${opp.id}`}><Clock className="w-4 h-4" /> {opp.deadline}</span>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mb-4">
                              <p className="text-sm italic text-primary font-medium flex items-center gap-2" data-testid={`text-match-reason-${opp.id}`}>
                                <Sparkles className="w-4 h-4" /> AI Match Reason: {opp.matchReason}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center md:border-l md:pl-6 gap-4 min-w-[150px]">
                            <ScoreRing score={opp.matchScore} size={80} strokeWidth={6} />
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Match Score</p>
                              <p className="text-lg font-bold text-primary" data-testid={`text-value-${opp.id}`}>{opp.value || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
                            data-testid={`button-toggle-details-${opp.id}`}
                          >
                            {expandedId === opp.id ? (
                              <><ChevronUp className="w-4 h-4" /> Hide Details</>
                            ) : (
                              <><ChevronDown className="w-4 h-4" /> View Details</>
                            )}
                          </Button>
                          <Button 
                            className="ml-auto gap-2 px-8" 
                            onClick={() => setApplyingJob(opp)}
                            data-testid={`button-apply-${opp.id}`}
                          >
                            <Zap className="w-4 h-4" /> Apply Now
                          </Button>
                        </div>

                        {expandedId === opp.id && (
                          <div className="mt-6 pt-6 border-t border-dashed animate-in fade-in slide-in-from-top-4" data-testid={`details-opp-${opp.id}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="font-bold flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-primary" /> Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{opp.description}</p>
                              </div>
                              <div>
                                <h4 className="font-bold flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-primary" /> Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {opp.requirements.map((req: string, i: number) => (
                                    <li key={i}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* QUICK APPLY MODAL */}
        <Dialog open={!!applyingJob} onOpenChange={(open: boolean) => !open && setApplyingJob(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="dialog-apply">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" data-testid="dialog-title">
                Apply for {applyingJob?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted rounded-lg" data-testid="apply-job-summary">
                <p className="font-bold">{applyingJob?.organization}</p>
                <p className="text-sm text-muted-foreground">{applyingJob?.location} • {applyingJob?.type}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-primary border-primary hover:bg-primary/5"
                    onClick={handleGenerateCoverLetter}
                    disabled={coverLetterMutation.isPending}
                    data-testid="button-ai-cover-letter"
                  >
                    {coverLetterMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate with AI</>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="cover-letter"
                  placeholder="Tell them why you're a great fit..."
                  className="min-h-[200px]"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  data-testid="textarea-cover-letter"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setApplyingJob(null)} data-testid="button-cancel-apply">Cancel</Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleSubmitApplication}
                  disabled={applicationMutation.isPending || !coverLetter}
                  data-testid="button-submit-application"
                >
                  {applicationMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Application</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import {
  Brain,
  Sparkles,
  Search,
  Users,
  Zap,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  ArrowRight,
  Bot,
  Activity,
  Target,
  Shield,
  Eye,
  MessageSquare,
  Briefcase,
  MapPin,
  ThumbsUp,
  BarChart3,
  Loader2,
} from "lucide-react";

const mockFreelancers = [
  {
    id: 1,
    name: "Sipho M.",
    title: "Full-Stack Developer",
    location: "Johannesburg, Gauteng",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200",
    matchScore: 97,
    skillOverlap: 95,
    availability: 100,
    priceFit: 92,
    cultureFit: 98,
    hourlyRate: "R450/hr",
    completedJobs: 142,
    rating: 4.9,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    responseTime: "< 1 hour",
    verified: true,
  },
  {
    id: 2,
    name: "Amara O.",
    title: "UI/UX Designer & Developer",
    location: "Cape Town, Western Cape",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200",
    matchScore: 94,
    skillOverlap: 88,
    availability: 100,
    priceFit: 96,
    cultureFit: 95,
    hourlyRate: "R380/hr",
    completedJobs: 89,
    rating: 4.8,
    skills: ["React", "Figma", "Tailwind CSS", "Next.js"],
    responseTime: "< 2 hours",
    verified: true,
  },
  {
    id: 3,
    name: "Thando K.",
    title: "Backend Engineer",
    location: "Durban, KwaZulu-Natal",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200",
    matchScore: 91,
    skillOverlap: 92,
    availability: 85,
    priceFit: 88,
    cultureFit: 96,
    hourlyRate: "R520/hr",
    completedJobs: 203,
    rating: 4.9,
    skills: ["Node.js", "Python", "PostgreSQL", "AWS"],
    responseTime: "< 30 min",
    verified: true,
  },
  {
    id: 4,
    name: "Lerato P.",
    title: "React Developer",
    location: "Pretoria, Gauteng",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    matchScore: 87,
    skillOverlap: 82,
    availability: 90,
    priceFit: 94,
    cultureFit: 85,
    hourlyRate: "R350/hr",
    completedJobs: 56,
    rating: 4.7,
    skills: ["React", "JavaScript", "CSS", "Firebase"],
    responseTime: "< 3 hours",
    verified: false,
  },
];

const agentActivityFeed = [
  {
    id: 1,
    time: "Just now",
    action: "Analyzing project requirements",
    detail: "Extracted 12 key skills from your description using NLP",
    icon: Brain,
    status: "complete",
  },
  {
    id: 2,
    time: "2 min ago",
    action: "Scanning freelancer database",
    detail: "Evaluated 2,847 profiles matching your criteria",
    icon: Search,
    status: "complete",
  },
  {
    id: 3,
    time: "3 min ago",
    action: "Running compatibility algorithms",
    detail: "Multi-factor scoring: skills, availability, price, culture fit",
    icon: BarChart3,
    status: "complete",
  },
  {
    id: 4,
    time: "4 min ago",
    action: "Verifying freelancer credentials",
    detail: "Cross-referenced blockchain-verified certificates for top matches",
    icon: Shield,
    status: "complete",
  },
  {
    id: 5,
    time: "5 min ago",
    action: "Checking real-time availability",
    detail: "Confirmed calendar availability for next 2 weeks",
    icon: Clock,
    status: "complete",
  },
  {
    id: 6,
    time: "Active",
    action: "Monitoring for better matches",
    detail: "Continuously scanning for new freelancers joining the platform",
    icon: Eye,
    status: "active",
  },
];

const autoHireSettings = [
  {
    id: "recurring-tasks",
    label: "Auto-Hire for Recurring Tasks",
    description: "AI automatically hires your top-rated freelancer for repeat work",
    enabled: true,
  },
  {
    id: "instant-match",
    label: "Instant Match & Notify",
    description: "Get notified instantly when a 95%+ match becomes available",
    enabled: true,
  },
  {
    id: "budget-protection",
    label: "Budget-Aware Matching",
    description: "AI only suggests freelancers within your budget range",
    enabled: true,
  },
  {
    id: "auto-negotiate",
    label: "AI Rate Negotiation",
    description: "AI negotiates optimal rates based on market data",
    enabled: false,
  },
  {
    id: "auto-shortlist",
    label: "Auto-Shortlist Top 5",
    description: "Automatically create shortlists for new project postings",
    enabled: false,
  },
];

function ScoreRing({ score, size = 64, strokeWidth = 5, color = "text-primary" }: { score: number; size?: number; strokeWidth?: number; color?: string }) {
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
          className="text-muted/40"
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
          className={color}
        />
      </svg>
      <span className="absolute text-sm font-bold">{score}%</span>
    </div>
  );
}

export default function AISmartMatch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [autoHireToggles, setAutoHireToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(autoHireSettings.map((s) => [s.id, s.enabled]))
  );
  const [expandedFreelancer, setExpandedFreelancer] = useState<number | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasResults(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasResults(true);
    }, 2000);
  };

  const toggleAutoHire = (id: string) => {
    setAutoHireToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="animated-gradient-bg text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-lg" data-testid="badge-ai-match-hero">
              <Brain className="w-3 h-3 mr-1" /> Autonomous AI Agents • 2031 Vision
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-ai-match-title">
              AI Smart Matching
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed" data-testid="text-ai-match-subtitle">
              Describe what you need in plain language. Our autonomous AI agent finds, ranks, and can even hire the perfect freelancer — while you focus on your business.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
              {[
                { icon: Target, label: "97% Match Accuracy", testId: "stat-matches" },
                { icon: Clock, label: "Results in Seconds", testId: "stat-time" },
                { icon: Users, label: "50,000+ Profiles Analyzed", testId: "stat-profiles" },
                { icon: Bot, label: "Fully Autonomous", testId: "stat-autonomous" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 glass-dark px-4 py-2 rounded-full border border-white/10" data-testid={stat.testId}>
                  <stat.icon className="w-4 h-4 text-accent" /> {stat.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30" data-testid="section-search">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-xl border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground" data-testid="text-search-heading">Describe Your Need</h2>
                      <p className="text-sm text-muted-foreground">Tell the AI what you're looking for in natural language</p>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g., I need a React developer who knows TypeScript and has experience building e-commerce platforms. Budget is around R400/hr, and I need someone available to start next week in Cape Town or remote..."
                      className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                      data-testid="input-ai-search"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gap-2 font-bold px-8 shadow-lg"
                      onClick={handleSearch}
                      disabled={isSearching}
                      data-testid="button-ai-search"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          AI Agent Working...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Find My Perfect Match
                        </>
                      )}
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      {["React Developer", "Plumber Cape Town", "Logo Designer"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          data-testid={`button-suggestion-${suggestion.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {isSearching && (
          <section className="py-12" data-testid="section-searching">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI Agent is Working...</h3>
                <p className="text-muted-foreground mb-6">Analyzing your requirements and scanning 50,000+ freelancer profiles</p>
                <div className="space-y-3">
                  {["Parsing natural language requirements", "Scanning freelancer database", "Running multi-factor matching"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {i < 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
                      )}
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {hasResults && !isSearching && (
          <>
            <section className="py-12 md:py-16" data-testid="section-results">
              <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary" data-testid="text-results-heading">
                      AI-Ranked Matches
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      4 freelancers matched from 2,847 evaluated profiles
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>AI agent active — continuously monitoring for better matches</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {mockFreelancers.map((freelancer, index) => (
                    <Card
                      key={freelancer.id}
                      className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${index === 0 ? "border-primary/30 ring-1 ring-primary/10" : "border-border"}`}
                      data-testid={`card-match-${freelancer.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative">
                              <img
                                src={freelancer.avatar}
                                alt={freelancer.name}
                                className="w-16 h-16 rounded-xl object-cover"
                                data-testid={`img-match-${freelancer.id}`}
                              />
                              {index === 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                  <Star className="w-3 h-3 text-primary" />
                                </div>
                              )}
                              {freelancer.verified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-foreground" data-testid={`text-match-name-${freelancer.id}`}>
                                  {freelancer.name}
                                </h3>
                                {index === 0 && (
                                  <Badge className="bg-accent/10 text-accent border-accent/20 text-xs" data-testid="badge-top-match">
                                    Top Match
                                  </Badge>
                                )}
                                {freelancer.verified && (
                                  <Badge variant="outline" className="text-green-600 border-green-200 text-xs" data-testid={`badge-verified-${freelancer.id}`}>
                                    <Shield className="w-3 h-3 mr-1" /> Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground" data-testid={`text-match-title-${freelancer.id}`}>{freelancer.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {freelancer.location}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {freelancer.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 rounded-full bg-primary/5 text-xs font-medium text-primary"
                                    data-testid={`badge-skill-${freelancer.id}-${skill.toLowerCase().replace(/[.\s]/g, "-")}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {freelancer.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" /> {freelancer.completedJobs} jobs
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {freelancer.responseTime}
                                </span>
                                <span className="font-semibold text-foreground">{freelancer.hourlyRate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-3 lg:border-l lg:pl-6 lg:border-border">
                            <ScoreRing
                              score={freelancer.matchScore}
                              size={80}
                              strokeWidth={6}
                              color={freelancer.matchScore >= 95 ? "text-green-500" : freelancer.matchScore >= 90 ? "text-blue-500" : "text-amber-500"}
                            />
                            <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-match-score-${freelancer.id}`}>
                              Match Score
                            </span>
                            <Button
                              size="sm"
                              className="gap-1 w-full"
                              onClick={() => setExpandedFreelancer(expandedFreelancer === freelancer.id ? null : freelancer.id)}
                              data-testid={`button-details-${freelancer.id}`}
                            >
                              <BarChart3 className="w-3 h-3" /> Details
                            </Button>
                          </div>
                        </div>

                        {expandedFreelancer === freelancer.id && (
                          <div className="mt-6 pt-6 border-t border-border" data-testid={`details-panel-${freelancer.id}`}>
                            <h4 className="text-sm font-bold text-foreground mb-4">AI Match Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                { label: "Skill Overlap", value: freelancer.skillOverlap, icon: Target, color: "text-blue-500" },
                                { label: "Availability", value: freelancer.availability, icon: Clock, color: "text-green-500" },
                                { label: "Price Fit", value: freelancer.priceFit, icon: DollarSign, color: "text-amber-500" },
                                { label: "Culture Fit", value: freelancer.cultureFit, icon: ThumbsUp, color: "text-purple-500" },
                              ].map((metric) => (
                                <div key={metric.label} className="text-center">
                                  <ScoreRing score={metric.value} size={56} strokeWidth={4} color={metric.color} />
                                  <p className="text-xs text-muted-foreground mt-2 font-medium">{metric.label}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                              <Button className="gap-2 flex-1" data-testid={`button-hire-${freelancer.id}`}>
                                <Zap className="w-4 h-4" /> Hire Now
                              </Button>
                              <Button variant="outline" className="gap-2 flex-1" data-testid={`button-message-${freelancer.id}`}>
                                <MessageSquare className="w-4 h-4" /> Message
                              </Button>
                              <Button variant="outline" className="gap-2 flex-1" data-testid={`button-profile-${freelancer.id}`} onClick={() => navigate(`/profile/${freelancer.id}`)}>
                                <Eye className="w-4 h-4" /> View Profile
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-12 md:py-16 bg-muted/30" data-testid="section-agent-feed">
              <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground" data-testid="text-agent-feed-heading">AI Agent Activity Feed</h2>
                        <p className="text-sm text-muted-foreground">What your autonomous agent has been doing</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {agentActivityFeed.map((activity) => (
                        <Card key={activity.id} className={`transition-all ${activity.status === "active" ? "border-primary/30 bg-primary/5" : ""}`} data-testid={`card-activity-${activity.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.status === "active" ? "bg-primary/20" : "bg-muted"}`}>
                                {activity.status === "active" ? (
                                  <activity.icon className="w-4 h-4 text-primary animate-pulse" />
                                ) : (
                                  <activity.icon className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-foreground" data-testid={`text-activity-action-${activity.id}`}>{activity.action}</p>
                                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                              </div>
                              {activity.status === "complete" && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                              )}
                              {activity.status === "active" && (
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 mt-2" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground" data-testid="text-auto-hire-heading">Auto-Hire Settings</h2>
                        <p className="text-sm text-muted-foreground">Configure your autonomous AI agent</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {autoHireSettings.map((setting) => (
                        <Card key={setting.id} data-testid={`card-setting-${setting.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground" data-testid={`text-setting-label-${setting.id}`}>
                                  {setting.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                              </div>
                              <Switch
                                checked={autoHireToggles[setting.id]}
                                onCheckedChange={() => toggleAutoHire(setting.id)}
                                data-testid={`switch-${setting.id}`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="mt-4 bg-primary/5 border-primary/10" data-testid="card-agent-status">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Agent Status: Active</p>
                            <p className="text-xs text-muted-foreground">Monitoring 24/7 for new opportunities matching your criteria</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <section className="py-16 md:py-20" data-testid="section-how-it-works">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-how-heading">How AI Smart Matching Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our autonomous agent handles the entire hiring pipeline — from understanding your needs to making recommendations
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Describe Your Need",
                  description: "Tell the AI what you need in plain language — skills, budget, timeline, location preferences",
                  icon: MessageSquare,
                  color: "bg-blue-500/10 text-blue-600",
                },
                {
                  step: 2,
                  title: "AI Analyzes & Searches",
                  description: "The agent scans thousands of profiles using NLP, skill graphs, and behavioral data",
                  icon: Brain,
                  color: "bg-purple-500/10 text-purple-600",
                },
                {
                  step: 3,
                  title: "Multi-Factor Scoring",
                  description: "Each freelancer is scored on skill overlap, availability, price fit, and culture match",
                  icon: BarChart3,
                  color: "bg-amber-500/10 text-amber-600",
                },
                {
                  step: 4,
                  title: "Hire or Auto-Hire",
                  description: "Review ranked matches and hire instantly, or enable auto-hire for recurring tasks",
                  icon: Zap,
                  color: "bg-green-500/10 text-green-600",
                },
              ].map((item) => (
                <Card key={item.step} className="text-center border-border card-glow" data-testid={`card-step-${item.step}`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-orange-400 text-primary text-xs font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 animated-gradient-bg text-white relative overflow-hidden" data-testid="section-cta">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl glass-dark flex items-center justify-center border border-white/20 shadow-xl">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-cta-heading">
              Let AI Find Your Perfect Match
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
              Stop scrolling through profiles. Our autonomous AI agent works 24/7 to find, evaluate, and recommend the best talent for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-accent text-primary hover:bg-accent/90 font-bold text-lg px-8 shadow-xl shadow-accent/20 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                data-testid="button-cta-try-matching"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Sparkles className="w-5 h-5" /> Try AI Matching
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2 backdrop-blur-sm"
                data-testid="button-cta-post-job"
                onClick={() => navigate("/post-job")}
              >
                Post a Job <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
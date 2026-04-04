import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import {
  Brain, Sparkles, Search, Users, Zap, Clock, DollarSign,
  Star, CheckCircle2, ArrowRight, Bot, Activity, Target,
  Shield, Eye, MessageSquare, Briefcase, MapPin, ThumbsUp,
  BarChart3, Loader2, ChevronRight, PlayCircle, XCircle,
  TrendingUp, Award, Calendar, Globe, Code, Paintbrush,
  PenTool, Video, Mic, Wrench, ShoppingCart, ChevronDown,
  ChevronUp, RefreshCw, Bookmark, Phone, Send, UserCheck,
  Filter, SlidersHorizontal, Layers,
} from "lucide-react";

// ─── DATA ───────────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  { id: "web-dev", label: "Web Development", icon: Code },
  { id: "design", label: "UI/UX Design", icon: Paintbrush },
  { id: "writing", label: "Writing & Copy", icon: PenTool },
  { id: "video", label: "Video & Motion", icon: Video },
  { id: "voice", label: "Voice & Audio", icon: Mic },
  { id: "trades", label: "Trades & Artisan", icon: Wrench },
  { id: "marketing", label: "Marketing", icon: TrendingUp },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
];

const POPULAR_SKILLS = [
  "React", "Node.js", "TypeScript", "Python", "Figma", "PostgreSQL",
  "Tailwind CSS", "Next.js", "AWS", "Firebase", "SEO", "Copywriting",
  "Logo Design", "Video Editing", "WordPress", "Shopify",
];

const TIMELINES = ["ASAP", "Within 1 week", "2–4 weeks", "1–3 months", "Flexible"];
const LOCATIONS = ["Anywhere in SA", "Cape Town", "Johannesburg", "Durban", "Pretoria", "Remote only"];

const MOCK_FREELANCERS = [
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
    hourlyRate: 450,
    completedJobs: 142,
    rating: 4.9,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    responseTime: "< 1 hour",
    verified: true,
    topRated: true,
    bio: "Senior full-stack developer with 8+ years. Built platforms serving 500K+ users. Expert in South African fintech and e-commerce.",
    successRate: 99,
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
    hourlyRate: 380,
    completedJobs: 89,
    rating: 4.8,
    skills: ["React", "Figma", "Tailwind CSS", "Next.js"],
    responseTime: "< 2 hours",
    verified: true,
    topRated: false,
    bio: "Award-winning designer with product background. Designed apps used by MTN, Discovery, and Absa. Figma expert.",
    successRate: 97,
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
    hourlyRate: 520,
    completedJobs: 203,
    rating: 4.9,
    skills: ["Node.js", "Python", "PostgreSQL", "AWS"],
    responseTime: "< 30 min",
    verified: true,
    topRated: false,
    bio: "Cloud infrastructure specialist. AWS certified. Built scalable microservices for SA's top banks and insurance companies.",
    successRate: 98,
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
    hourlyRate: 350,
    completedJobs: 56,
    rating: 4.7,
    skills: ["React", "JavaScript", "CSS", "Firebase"],
    responseTime: "< 3 hours",
    verified: false,
    topRated: false,
    bio: "Fast-growing React dev with a passion for pixel-perfect UIs. 3 years professional experience. Portfolio available.",
    successRate: 94,
  },
];

const AI_SCAN_STEPS = [
  { label: "Parsing natural language requirements", duration: 600 },
  { label: "Extracting 14 key skills with NLP", duration: 700 },
  { label: "Scanning 47,382 freelancer profiles", duration: 800 },
  { label: "Running skill-graph compatibility", duration: 700 },
  { label: "Calculating budget & availability fit", duration: 600 },
  { label: "Verifying blockchain credentials", duration: 500 },
  { label: "Generating culture fit scores", duration: 500 },
  { label: "Ranking top candidates", duration: 400 },
];

const AUTO_HIRE_OPTIONS = [
  { id: "recurring", label: "Auto-Hire for Recurring Tasks", description: "AI automatically re-hires your top-rated freelancer for repeat work", enabled: true },
  { id: "instant", label: "Instant Match & Notify", description: "Get notified the moment a 95%+ match becomes available", enabled: true },
  { id: "budget", label: "Budget-Aware Matching", description: "Only suggest freelancers within your confirmed budget range", enabled: true },
  { id: "negotiate", label: "AI Rate Negotiation", description: "AI negotiates optimal rates based on live market data", enabled: false },
  { id: "shortlist", label: "Auto-Shortlist Top 5", description: "Automatically create shortlists whenever you post a new project", enabled: false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64, strokeWidth = 5, color = "text-emerald-500" }: {
  score: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className="absolute text-xs font-bold">{score}%</span>
    </div>
  );
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

// ─── STEP INDICATORS ─────────────────────────────────────────────────────
const STEPS = [
  { num: 1, title: "Describe Your Need", icon: MessageSquare, color: "blue" },
  { num: 2, title: "AI Analyzes & Searches", icon: Brain, color: "purple" },
  { num: 3, title: "Multi-Factor Scoring", icon: BarChart3, color: "amber" },
  { num: 4, title: "Hire or Auto-Hire", icon: Zap, color: "emerald" },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-500 border-blue-500/30 ring-blue-500/20",
  purple: "bg-purple-500/15 text-purple-500 border-purple-500/30 ring-purple-500/20",
  amber: "bg-amber-500/15 text-amber-500 border-amber-500/30 ring-amber-500/20",
  emerald: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 ring-emerald-500/20",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function AISmartMatch() {
  const [, navigate] = useLocation();

  // Wizard state
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Step 1 state
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budget, setBudget] = useState([250, 600]);
  const [timeline, setTimeline] = useState("");
  const [locationPref, setLocationPref] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // Step 2 state
  const [scanStep, setScanStep] = useState(-1);
  const [scanDone, setScanDone] = useState(false);

  // Step 3 state
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price">("match");
  const [savedFreelancers, setSavedFreelancers] = useState<Set<number>>(new Set());

  // Step 4 state
  const [autoHireToggles, setAutoHireToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(AUTO_HIRE_OPTIONS.map((o) => [o.id, o.enabled]))
  );
  const [hiredId, setHiredId] = useState<number | null>(null);
  const [showHireModal, setShowHireModal] = useState<number | null>(null);
  const [hireType, setHireType] = useState<"instant" | "interview" | "message" | null>(null);

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // ── Helpers
  const canProceedStep1 = description.trim().length > 10 && projectType !== "";

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const s = skillInput.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  };

  const sortedFreelancers = [...MOCK_FREELANCERS].sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "rating") return b.rating - a.rating;
    return a.hourlyRate - b.hourlyRate;
  });

  // ── Step navigation
  const goToStep = (step: number) => {
    setActiveStep(step);
    setTimeout(() => {
      const refs: Record<number, React.RefObject<HTMLDivElement>> = {
        2: step2Ref, 3: step3Ref, 4: step4Ref,
      };
      refs[step]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  // ── Step 1 → 2
  const startAIAnalysis = () => {
    if (!canProceedStep1) return;
    completeStep(1);
    goToStep(2);
    setScanStep(0);
    setScanDone(false);
    runScan(0);
  };

  const runScan = (idx: number) => {
    if (idx >= AI_SCAN_STEPS.length) {
      setScanDone(true);
      completeStep(2);
      return;
    }
    setScanStep(idx);
    setTimeout(() => {
      setScanStep(idx + 1);
      runScan(idx + 1);
    }, AI_SCAN_STEPS[idx]?.duration ?? 600);
  };

  // ── Step 2 → 3
  const viewResults = () => {
    goToStep(3);
  };

  // ── Step 3 → 4
  const proceedToHire = (id?: number) => {
    completeStep(3);
    goToStep(4);
    if (id) setShowHireModal(id);
  };

  // ── Hire action
  const executeHire = (freelancerId: number, type: "instant" | "interview" | "message") => {
    setHireType(type);
    setHiredId(freelancerId);
    setShowHireModal(null);
    completeStep(4);
  };

  const toggleSave = (id: number) => {
    setSavedFreelancers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: number) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const stepColor = (num: number) => {
    const c = STEPS[num - 1]?.color ?? "blue";
    return COLOR_MAP[c];
  };

  const isStepActive = (num: number) => activeStep === num;
  const isStepDone = (num: number) => completedSteps.has(num);
  const isStepReachable = (num: number) => {
    if (num === 1) return true;
    if (num === 2) return isStepDone(1) || completedSteps.size >= 1;
    if (num === 3) return isStepDone(2);
    if (num === 4) return isStepDone(3) || isStepDone(2);
    return false;
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <main id="main-content" role="main">

        {/* ── HERO ── */}
        <section className="animated-gradient-bg text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm" data-testid="badge-hero">
              <Brain className="w-3 h-3 mr-1" /> Inspired by Toptal · Upwork Uma · Fiverr Dynamic Matching
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-hero-title">
              How AI Smart Matching Works
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-subtitle">
              Our autonomous agent handles the entire hiring pipeline — from understanding your needs to making recommendations. Follow the 4 steps below.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
              {[
                { icon: Target, label: "97% Match Accuracy" },
                { icon: Clock, label: "Results in Seconds" },
                { icon: Users, label: "47K+ Profiles Analysed" },
                { icon: Bot, label: "Fully Autonomous" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  <s.icon className="w-4 h-4 text-emerald-400" /> {s.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4-STEP PROGRESS BAR ── */}
        <section className="sticky top-[64px] z-30 bg-background/95 backdrop-blur border-b border-border shadow-sm" data-testid="section-step-bar">
          <div className="container mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
              {STEPS.map((step, idx) => {
                const done = isStepDone(step.num);
                const active = isStepActive(step.num);
                const reachable = isStepReachable(step.num);
                return (
                  <div key={step.num} className="flex items-center flex-1">
                    <button
                      className={`flex items-center gap-2 flex-1 rounded-xl px-3 py-2 text-left transition-all ${
                        active ? `ring-2 ${stepColor(step.num)} bg-background` :
                        done ? "opacity-80 hover:opacity-100" :
                        reachable ? "opacity-60 hover:opacity-80" : "opacity-30 cursor-not-allowed"
                      }`}
                      onClick={() => reachable && goToStep(step.num)}
                      disabled={!reachable}
                      data-testid={`step-btn-${step.num}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                        done ? "bg-emerald-500 border-emerald-500 text-white" :
                        active ? stepColor(step.num) + " border" : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                      </div>
                      <span className={`hidden sm:block text-xs font-semibold truncate ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.title}
                      </span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-px flex-none w-4 md:w-8 mx-1 transition-colors ${done ? "bg-emerald-500" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STEP 1 — DESCRIBE YOUR NEED
        ════════════════════════════════════════════ */}
        <section className="py-12 md:py-16 bg-muted/30" data-testid="section-step-1">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">

              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Step 1</span>
                    {isStepDone(1) && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed ✓</Badge>}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground" data-testid="text-step1-heading">Describe Your Need</h2>
                  <p className="text-sm text-muted-foreground">Tell the AI exactly what you're looking for</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Project type */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-foreground mb-4">What type of project is this? <span className="text-red-400">*</span></p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROJECT_TYPES.map((pt) => (
                        <button
                          key={pt.id}
                          onClick={() => setProjectType(pt.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                            projectType === pt.id
                              ? "border-blue-500 bg-blue-500/10 text-blue-600 ring-2 ring-blue-500/20"
                              : "border-border hover:border-blue-300 hover:bg-blue-500/5 text-muted-foreground"
                          }`}
                          data-testid={`btn-project-type-${pt.id}`}
                        >
                          <pt.icon className="w-5 h-5" />
                          {pt.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Natural language description */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-foreground mb-2">Describe your project in plain language <span className="text-red-400">*</span></p>
                    <p className="text-xs text-muted-foreground mb-4">Our AI understands plain English and isiZulu. Include skills, goals, and any preferences.</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g. I need a React developer who knows TypeScript and has built e-commerce platforms before. Budget around R400/hr, available next week, Cape Town or remote OK..."
                      className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none text-sm"
                      data-testid="input-description"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["React developer R400/hr next week", "Plumber in Cape Town urgently", "Logo designer under R5000", "Content writer for tech blog"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setDescription(s)}
                          className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                          data-testid={`btn-suggestion-${s.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills picker */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-foreground mb-4">Add specific skills (optional — AI will also detect from your description)</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {POPULAR_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            selectedSkills.includes(skill)
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                              : "bg-muted border-border text-muted-foreground hover:border-blue-300"
                          }`}
                          data-testid={`btn-skill-${skill.toLowerCase().replace(/[.\s]/g, "-")}`}
                        >
                          {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                        placeholder="Add a custom skill..."
                        className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        data-testid="input-custom-skill"
                      />
                      <Button size="sm" variant="outline" onClick={addCustomSkill} data-testid="btn-add-skill">Add</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget + Timeline + Location in a grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Budget */}
                  <Card className="border-border sm:col-span-3 md:col-span-1">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" /> Budget Range (R/hr)
                      </p>
                      <Slider
                        min={50} max={1500} step={50}
                        value={budget}
                        onValueChange={setBudget}
                        className="mb-3"
                        data-testid="slider-budget"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>R{budget[0]}/hr</span>
                        <span className="font-semibold text-foreground">R{budget[0]}–R{budget[1]}/hr</span>
                        <span>R{budget[1]}/hr</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" /> Timeline
                      </p>
                      <div className="flex flex-col gap-2">
                        {TIMELINES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setTimeline(t)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                              timeline === t ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "border-border text-muted-foreground hover:border-blue-300"
                            }`}
                            data-testid={`btn-timeline-${t.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" /> Location
                      </p>
                      <div className="flex flex-col gap-2">
                        {LOCATIONS.map((l) => (
                          <button
                            key={l}
                            onClick={() => setLocationPref(l)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                              locationPref === l ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "border-border text-muted-foreground hover:border-blue-300"
                            }`}
                            data-testid={`btn-location-${l.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-bold px-8 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={startAIAnalysis}
                    disabled={!canProceedStep1}
                    data-testid="btn-start-analysis"
                  >
                    <Sparkles className="w-5 h-5" /> Analyse & Find Matches
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {!canProceedStep1 && (
                    <p className="text-xs text-muted-foreground">Select a project type and write a description to continue</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STEP 2 — AI ANALYZES & SEARCHES
        ════════════════════════════════════════════ */}
        <section ref={step2Ref} className="py-12 md:py-16" data-testid="section-step-2">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">

              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 ${!isStepDone(1) ? "opacity-40" : ""}`}>
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Step 2</span>
                    {isStepDone(2) && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed ✓</Badge>}
                  </div>
                  <h2 className={`text-2xl font-bold text-foreground ${!isStepDone(1) ? "opacity-40" : ""}`} data-testid="text-step2-heading">AI Analyzes & Searches</h2>
                  <p className={`text-sm text-muted-foreground ${!isStepDone(1) ? "opacity-40" : ""}`}>
                    {isStepDone(1) ? "Watching the AI brain work in real time" : "Complete Step 1 first"}
                  </p>
                </div>
              </div>

              {!isStepDone(1) ? (
                <Card className="border-dashed border-2 border-purple-200/30">
                  <CardContent className="p-12 text-center">
                    <Brain className="w-12 h-12 text-purple-300 mx-auto mb-4 opacity-40" />
                    <p className="text-muted-foreground text-sm">Complete Step 1 to activate the AI analysis engine</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => goToStep(1)} data-testid="btn-go-step1">
                      ← Go to Step 1
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Live scan steps */}
                  <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center ${!scanDone ? "animate-pulse" : ""}`}>
                          <Brain className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">
                            {scanDone ? "Analysis Complete" : "AI Engine Working..."}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scanDone ? "Found 4 premium matches from 47,382 profiles" : "Scanning South Africa's freelancer network"}
                          </p>
                        </div>
                        {!scanDone && <Loader2 className="w-5 h-5 text-purple-500 animate-spin ml-auto" />}
                        {scanDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                      </div>

                      <div className="space-y-3">
                        {AI_SCAN_STEPS.map((step, idx) => {
                          const done = scanStep > idx;
                          const active = scanStep === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                done ? "bg-emerald-500/10" : active ? "bg-purple-500/10" : "opacity-30"
                              }`}
                              data-testid={`scan-step-${idx}`}
                            >
                              {done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : active ? (
                                <Loader2 className="w-4 h-4 text-purple-500 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                              )}
                              <span className={`text-sm ${done ? "text-emerald-700 dark:text-emerald-400" : active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live stats */}
                  {scanDone && (
                    <div className="grid grid-cols-3 gap-4" data-testid="scan-stats">
                      {[
                        { label: "Profiles Scanned", value: 47382, icon: Users },
                        { label: "Skills Extracted", value: 14, icon: Target },
                        { label: "Matches Found", value: 4, icon: Award },
                      ].map((stat) => (
                        <Card key={stat.label} className="border-purple-500/20 bg-purple-500/5">
                          <CardContent className="p-4 text-center">
                            <stat.icon className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                            <p className="text-xl font-bold text-foreground">
                              <AnimatedCounter target={stat.value} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Detected skills */}
                  {scanDone && (
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <p className="text-sm font-bold text-foreground mb-3">Skills AI Detected from Your Description</p>
                        <div className="flex flex-wrap gap-2">
                          {[...selectedSkills, "React", "TypeScript", "PostgreSQL", "Node.js", "Git", "Agile"].slice(0, 12).map((skill) => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium border border-purple-500/20">
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {scanDone && (
                    <Button
                      size="lg"
                      className="gap-2 font-bold px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                      onClick={viewResults}
                      data-testid="btn-view-results"
                    >
                      <BarChart3 className="w-5 h-5" /> View Scored Matches
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STEP 3 — MULTI-FACTOR SCORING
        ════════════════════════════════════════════ */}
        <section ref={step3Ref} className="py-12 md:py-16 bg-muted/30" data-testid="section-step-3">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">

              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 ${!isStepDone(2) ? "opacity-40" : ""}`}>
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Step 3</span>
                    {isStepDone(3) && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed ✓</Badge>}
                  </div>
                  <h2 className={`text-2xl font-bold text-foreground ${!isStepDone(2) ? "opacity-40" : ""}`} data-testid="text-step3-heading">Multi-Factor Scoring</h2>
                  <p className={`text-sm text-muted-foreground ${!isStepDone(2) ? "opacity-40" : ""}`}>
                    {isStepDone(2) ? "AI-ranked matches with full breakdown — sortable, comparable, saveable" : "Complete Step 2 first"}
                  </p>
                </div>
                {isStepDone(2) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline" size="sm"
                      className={`gap-2 text-xs ${compareMode ? "border-amber-500 text-amber-600" : ""}`}
                      onClick={() => setCompareMode(!compareMode)}
                      data-testid="btn-compare-mode"
                    >
                      <Layers className="w-3 h-3" /> {compareMode ? "Exit Compare" : "Compare"}
                    </Button>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
                      data-testid="select-sort"
                    >
                      <option value="match">Sort: Best Match</option>
                      <option value="rating">Sort: Highest Rating</option>
                      <option value="price">Sort: Lowest Price</option>
                    </select>
                  </div>
                )}
              </div>

              {!isStepDone(2) ? (
                <Card className="border-dashed border-2 border-amber-200/30">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-amber-300 mx-auto mb-4 opacity-40" />
                    <p className="text-muted-foreground text-sm">Complete the AI analysis in Step 2 to see scored matches</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => goToStep(1)} data-testid="btn-go-step1-from3">
                      ← Start from Step 1
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Compare panel */}
                  {compareMode && compareList.length > 0 && (
                    <Card className="mb-6 border-amber-500/30 bg-amber-500/5" data-testid="compare-panel">
                      <CardContent className="p-4">
                        <p className="text-sm font-bold text-foreground mb-3">Comparing {compareList.length}/2 freelancers</p>
                        <div className={`grid gap-4 ${compareList.length === 2 ? "grid-cols-2" : "grid-cols-1 max-w-sm"}`}>
                          {compareList.map((id) => {
                            const f = MOCK_FREELANCERS.find((x) => x.id === id)!;
                            return (
                              <div key={id} className="p-3 rounded-xl bg-background border border-border">
                                <div className="flex items-center gap-3 mb-3">
                                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                                  <div>
                                    <p className="text-sm font-bold">{f.name}</p>
                                    <p className="text-xs text-muted-foreground">{f.title}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {[
                                    { label: "Match", value: f.matchScore + "%" },
                                    { label: "Rating", value: f.rating + "★" },
                                    { label: "Rate", value: "R" + f.hourlyRate + "/hr" },
                                    { label: "Jobs", value: f.completedJobs },
                                  ].map((row) => (
                                    <div key={row.label} className="flex justify-between">
                                      <span className="text-muted-foreground">{row.label}</span>
                                      <span className="font-semibold">{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {compareList.length === 2 && (
                          <Button size="sm" className="mt-4 gap-2" onClick={() => proceedToHire(compareList[0])} data-testid="btn-hire-compare">
                            <Zap className="w-3 h-3" /> Proceed with Top Match
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-5">
                    {sortedFreelancers.map((f, idx) => (
                      <Card
                        key={f.id}
                        className={`overflow-hidden transition-all duration-300 hover:shadow-xl cursor-default ${
                          idx === 0 ? "border-amber-500/30 ring-1 ring-amber-500/10" : "border-border"
                        } ${compareList.includes(f.id) ? "ring-2 ring-amber-500/40" : ""}`}
                        data-testid={`card-freelancer-${f.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Avatar + info */}
                            <div className="flex items-start gap-4 flex-1">
                              <div className="relative shrink-0">
                                <img src={f.avatar} alt={f.name} className="w-16 h-16 rounded-2xl object-cover" data-testid={`img-freelancer-${f.id}`} />
                                {f.topRated && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                                    <Star className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                {f.verified && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <h3 className="text-base font-bold text-foreground" data-testid={`text-name-${f.id}`}>{f.name}</h3>
                                  {idx === 0 && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">🏆 Top Match</Badge>}
                                  {f.verified && <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs"><Shield className="w-3 h-3 mr-1" />Verified</Badge>}
                                  {f.topRated && <Badge variant="outline" className="text-amber-600 border-amber-200 text-xs"><Star className="w-3 h-3 mr-1" />Top Rated</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{f.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{f.location}</p>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{f.bio}</p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {f.skills.map((skill) => (
                                    <span key={skill} className="px-2 py-0.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/10">{skill}</span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{f.rating}</span>
                                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{f.completedJobs} jobs</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.responseTime}</span>
                                  <span className="flex items-center gap-1"><Award className="w-3 h-3 text-emerald-500" />{f.successRate}% success</span>
                                  <span className="font-semibold text-foreground text-sm">R{f.hourlyRate}/hr</span>
                                </div>
                              </div>
                            </div>

                            {/* Score ring + actions */}
                            <div className="flex flex-row lg:flex-col items-center gap-3 lg:border-l lg:pl-6 lg:border-border shrink-0">
                              <ScoreRing
                                score={f.matchScore} size={80} strokeWidth={6}
                                color={f.matchScore >= 95 ? "text-emerald-500" : f.matchScore >= 90 ? "text-blue-500" : "text-amber-500"}
                              />
                              <span className="text-xs font-medium text-muted-foreground">AI Match</span>
                              <div className="flex flex-col gap-2 w-full">
                                <Button size="sm" className="gap-1 w-full text-xs" onClick={() => setExpandedCard(expandedCard === f.id ? null : f.id)} data-testid={`btn-breakdown-${f.id}`}>
                                  <BarChart3 className="w-3 h-3" /> Breakdown
                                  {expandedCard === f.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 w-full text-xs" onClick={() => toggleSave(f.id)} data-testid={`btn-save-${f.id}`}>
                                  <Bookmark className={`w-3 h-3 ${savedFreelancers.has(f.id) ? "fill-current text-amber-500" : ""}`} />
                                  {savedFreelancers.has(f.id) ? "Saved" : "Save"}
                                </Button>
                                {compareMode && (
                                  <Button size="sm" variant="outline" className={`gap-1 w-full text-xs ${compareList.includes(f.id) ? "border-amber-500 text-amber-600" : ""}`} onClick={() => toggleCompare(f.id)} disabled={!compareList.includes(f.id) && compareList.length >= 2} data-testid={`btn-compare-${f.id}`}>
                                    <Layers className="w-3 h-3" /> {compareList.includes(f.id) ? "Remove" : "Compare"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded breakdown */}
                          {expandedCard === f.id && (
                            <div className="mt-6 pt-6 border-t border-border" data-testid={`breakdown-${f.id}`}>
                              <p className="text-sm font-bold text-foreground mb-4">AI Match Breakdown</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                  { label: "Skill Overlap", value: f.skillOverlap, color: "text-blue-500" },
                                  { label: "Availability", value: f.availability, color: "text-emerald-500" },
                                  { label: "Price Fit", value: f.priceFit, color: "text-amber-500" },
                                  { label: "Culture Fit", value: f.cultureFit, color: "text-purple-500" },
                                ].map((m) => (
                                  <div key={m.label} className="text-center">
                                    <ScoreRing score={m.value} size={56} strokeWidth={4} color={m.color} />
                                    <p className="text-xs text-muted-foreground mt-2">{m.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                {[
                                  { label: "Hourly Rate", value: `R${f.hourlyRate}/hr` },
                                  { label: "Success Rate", value: `${f.successRate}%` },
                                  { label: "Response Time", value: f.responseTime },
                                  { label: "Jobs Completed", value: f.completedJobs },
                                ].map((row) => (
                                  <div key={row.label} className="p-3 rounded-xl bg-muted/50 text-center">
                                    <p className="font-bold text-foreground">{row.value}</p>
                                    <p className="text-muted-foreground mt-0.5">{row.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                                <Button className="gap-2 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => proceedToHire(f.id)} data-testid={`btn-hire-${f.id}`}>
                                  <Zap className="w-4 h-4" /> Hire Now
                                </Button>
                                <Button variant="outline" className="gap-2 flex-1" onClick={() => navigate(`/profile/${f.id}`)} data-testid={`btn-profile-${f.id}`}>
                                  <Eye className="w-4 h-4" /> View Profile
                                </Button>
                                <Button variant="outline" className="gap-2 flex-1" data-testid={`btn-message-${f.id}`}>
                                  <MessageSquare className="w-4 h-4" /> Message First
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Button
                      size="lg"
                      className="gap-2 font-bold px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                      onClick={() => proceedToHire(sortedFreelancers[0].id)}
                      data-testid="btn-proceed-hire"
                    >
                      <Zap className="w-5 h-5" /> Proceed to Hire
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => { setScanStep(-1); setScanDone(false); goToStep(1); }} data-testid="btn-restart">
                      <RefreshCw className="w-4 h-4" /> Refine Search
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STEP 4 — HIRE OR AUTO-HIRE
        ════════════════════════════════════════════ */}
        <section ref={step4Ref} className="py-12 md:py-16" data-testid="section-step-4">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">

              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 ${!isStepDone(2) ? "opacity-40" : ""}`}>
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Step 4</span>
                    {isStepDone(4) && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed ✓</Badge>}
                  </div>
                  <h2 className={`text-2xl font-bold text-foreground ${!isStepDone(2) ? "opacity-40" : ""}`} data-testid="text-step4-heading">Hire or Auto-Hire</h2>
                  <p className={`text-sm text-muted-foreground ${!isStepDone(2) ? "opacity-40" : ""}`}>
                    {isStepDone(2) ? "Review your options and take action" : "Complete Steps 1–3 first"}
                  </p>
                </div>
              </div>

              {!isStepDone(2) ? (
                <Card className="border-dashed border-2 border-emerald-200/30">
                  <CardContent className="p-12 text-center">
                    <Zap className="w-12 h-12 text-emerald-300 mx-auto mb-4 opacity-40" />
                    <p className="text-muted-foreground text-sm">Work through Steps 1, 2 & 3 to unlock hiring</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => goToStep(1)} data-testid="btn-go-step1-from4">
                      ← Start from Step 1
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Success message if hired */}
                  {hiredId && (
                    <Card className="mb-8 border-emerald-500/30 bg-emerald-500/5" data-testid="card-hire-success">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-foreground text-lg">
                              {hireType === "instant" ? "🎉 Hired Successfully!" : hireType === "interview" ? "📅 Interview Scheduled!" : "💬 Message Sent!"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {hireType === "instant"
                                ? `You've hired ${MOCK_FREELANCERS.find((f) => f.id === hiredId)?.name}. Escrow activated via PayFast. Work begins immediately.`
                                : hireType === "interview"
                                ? `Interview with ${MOCK_FREELANCERS.find((f) => f.id === hiredId)?.name} booked for tomorrow. You'll receive a calendar invite.`
                                : `Your message has been sent to ${MOCK_FREELANCERS.find((f) => f.id === hiredId)?.name}. Typical reply time: ${MOCK_FREELANCERS.find((f) => f.id === hiredId)?.responseTime}.`}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} data-testid="btn-go-dashboard">
                            Go to Dashboard <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Manual hire options */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-500" /> Hire Your Top Match
                      </h3>
                      <Card className="border-emerald-500/20 mb-4">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <img src={MOCK_FREELANCERS[0].avatar} alt={MOCK_FREELANCERS[0].name} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-foreground">{MOCK_FREELANCERS[0].name}</p>
                              <p className="text-xs text-muted-foreground">{MOCK_FREELANCERS[0].title}</p>
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs mt-1">97% Match</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              className="flex-col gap-1 h-auto py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                              onClick={() => executeHire(1, "instant")}
                              data-testid="btn-instant-hire"
                            >
                              <Zap className="w-5 h-5" />
                              Hire Instantly
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-col gap-1 h-auto py-4 text-xs font-semibold hover:border-blue-400"
                              onClick={() => executeHire(1, "interview")}
                              data-testid="btn-schedule-interview"
                            >
                              <Phone className="w-5 h-5" />
                              Schedule Interview
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-col gap-1 h-auto py-4 text-xs font-semibold hover:border-purple-400"
                              onClick={() => executeHire(1, "message")}
                              data-testid="btn-message-first"
                            >
                              <Send className="w-5 h-5" />
                              Message First
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            PayFast escrow protection · 10% platform fee · POPIA compliant
                          </p>
                        </CardContent>
                      </Card>

                      {/* All matches quick hire */}
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">All Matches</p>
                      <div className="space-y-2">
                        {MOCK_FREELANCERS.slice(1).map((f) => (
                          <Card key={f.id} className="border-border">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                                  <p className="text-xs text-muted-foreground">{f.matchScore}% match · R{f.hourlyRate}/hr</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => executeHire(f.id, "instant")} data-testid={`btn-quick-hire-${f.id}`}>
                                    Hire
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => executeHire(f.id, "message")} data-testid={`btn-quick-msg-${f.id}`}>
                                    <Send className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Auto-hire settings */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-emerald-500" /> Auto-Hire Settings
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs ml-1">AI-Powered</Badge>
                      </h3>
                      <div className="space-y-3 mb-4">
                        {AUTO_HIRE_OPTIONS.map((opt) => (
                          <Card key={opt.id} className={`transition-all ${autoHireToggles[opt.id] ? "border-emerald-500/20 bg-emerald-500/5" : "border-border"}`} data-testid={`card-autohire-${opt.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                </div>
                                <Switch
                                  checked={autoHireToggles[opt.id]}
                                  onCheckedChange={() => setAutoHireToggles((p) => ({ ...p, [opt.id]: !p[opt.id] }))}
                                  data-testid={`switch-${opt.id}`}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Card className="bg-emerald-500/5 border-emerald-500/20" data-testid="card-agent-live">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-sm font-bold text-foreground">AI Agent: Active</p>
                          </div>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" />Monitoring 47K+ profiles 24/7</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" />Will alert you when 95%+ match joins</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" />Auto-shortlist enabled for new projects</p>
                          </div>
                          <Button size="sm" className="mt-4 w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate("/dashboard")} data-testid="btn-manage-agent">
                            <Bot className="w-4 h-4" /> Manage Agent in Dashboard
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 animated-gradient-bg text-white relative overflow-hidden" data-testid="section-cta">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-cta-heading">
              Let AI Find Your Perfect Match
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
              Stop scrolling. Our autonomous AI works 24/7 to find, score, and recommend the best African talent — you just confirm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 text-white hover:bg-emerald-400 font-bold text-lg px-8 shadow-xl gap-2 hover:scale-[1.02] transition-transform"
                data-testid="btn-cta-start"
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setActiveStep(1); }}
              >
                <Sparkles className="w-5 h-5" /> Start AI Matching
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2 backdrop-blur-sm"
                data-testid="btn-cta-post-job"
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

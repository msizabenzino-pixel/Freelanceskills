import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth, syncSessionNow } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { earnPoints } from "@/lib/earnPoints";
import { apiJson } from "@/lib/api";
import { saveFreelancerProfile } from "@/lib/firebaseAppData";
import { calcStrength } from "@/lib/profileStrength";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { SERVICE_CATEGORIES } from "@shared/categories";
import {
  Upload, FileText, Sparkles, User, Briefcase, MapPin, DollarSign, Award, X, Loader2, ChevronRight,
  Globe, Github, Linkedin, Star, Clock, Camera, Eye, RefreshCw, Plus, Zap, Shield, TrendingUp, Brain,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Languages, Phone, Calendar, BarChart3, Target,
} from "lucide-react";

type Phase = "upload" | "parsing" | "review";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  location: string;
  experienceLevel: string;
  category: string;
  certifications: string;
  photo: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  languages: string[];
  availability: string;
  availableNow: boolean;
  phone: string;
  tagline: string;
};

type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  link: string;
  technologies: string[];
};

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "web-development": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS", "Docker"],
  design: ["Figma", "Photoshop", "Illustrator", "After Effects", "Framer", "Canva"],
  writing: ["Copywriting", "SEO Writing", "Content Strategy", "Blog Writing", "Technical Writing"],
  marketing: ["Google Ads", "Facebook Ads", "SEO", "Email Marketing", "Analytics"],
  video: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics"],
  default: ["Communication", "Problem Solving", "Leadership", "Project Management", "Excel"],
};

const MARKET_RATES: Record<string, { low: number; avg: number; high: number }> = {
  "web-development": { low: 350, avg: 520, high: 950 },
  design: { low: 280, avg: 420, high: 750 },
  writing: { low: 150, avg: 280, high: 500 },
  marketing: { low: 200, avg: 380, high: 700 },
  video: { low: 250, avg: 400, high: 800 },
  default: { low: 150, avg: 300, high: 600 },
};

const LANGUAGES_LIST = ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Tswana", "Venda", "Tsonga", "French", "Portuguese", "Arabic", "Swahili"];
const SA_LOCATIONS = ["Cape Town, WC", "Johannesburg, GP", "Durban, KZN", "Pretoria, GP", "Port Elizabeth, EC", "Bloemfontein, FS", "East London, EC", "Polokwane, LP", "Remote (South Africa)"];
const AVAILABILITY_OPTIONS = ["Available now", "Available in 1 week", "Available in 2 weeks", "Part-time only", "Weekends only"];

const AI_PARSE_STEPS = [
  { label: "Reading CV structure" },
  { label: "Extracting personal information" },
  { label: "Identifying skills & expertise" },
  { label: "Detecting experience level" },
  { label: "Generating professional bio" },
  { label: "Suggesting market rate" },
  { label: "Building profile preview" },
  { label: "Profile ready!" },
];

const defaultForm: ProfileFormData = {
  firstName: "",
  lastName: "",
  title: "",
  bio: "",
  skills: [],
  hourlyRate: "",
  location: "",
  experienceLevel: "",
  category: "",
  certifications: "",
  photo: "",
  portfolioUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  languages: [],
  availability: "Available now",
  availableNow: true,
  phone: "",
  tagline: "",
};

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: 8 + Math.random() * 12,
    h: 5 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 6)],
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 8,
  }));
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate);
    else { canvas.remove(); }
  };
  animate();
}

function parseResponse(data: any, prev: ProfileFormData): ProfileFormData {
  return {
    ...prev,
    firstName: data.firstName || prev.firstName,
    lastName: data.lastName || prev.lastName,
    title: data.title || prev.title,
    bio: data.bio || prev.bio,
    skills: data.skills?.length ? data.skills : prev.skills,
    hourlyRate: data.hourlyRate?.toString() || prev.hourlyRate,
    location: data.location || prev.location,
    experienceLevel: data.experienceLevel || prev.experienceLevel,
    category: data.category || prev.category,
    certifications: data.certifications || prev.certifications,
  };
}

export default function CVUpload() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("upload");
  const [cvText, setCvText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileRef, setUploadedFileRef] = useState<File | null>(null);
  const [parseScanStep, setParseScanStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>(defaultForm);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [activeTab, setActiveTab] = useState<"basics" | "skills" | "portfolio" | "rates" | "preview">("basics");
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: "", description: "", link: "", technologies: "" });
  const [projectSaving, setProjectSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { score: completionScore, tips: completionTips, label: scoreLabel } = calcStrength(formData);
  const scoreColor = completionScore >= 80 ? "text-emerald-500" : completionScore >= 50 ? "text-amber-500" : "text-red-500";
  const marketRate = MARKET_RATES[formData.category] ?? MARKET_RATES.default;
  const skillSuggestions = SKILL_SUGGESTIONS[formData.category] ?? SKILL_SUGGESTIONS.default;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      const t = setTimeout(() => toast({ title: "Welcome to FreelanceSkills! 🎉", description: "Upload your CV or paste your details below — our AI will build your profile in seconds." }), 600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(profile => {
        if (!profile) return;
        try {
          const raw = profile.portfolioProjectsJson;
          if (typeof raw === "string" && raw.trim().startsWith("[")) {
            const parsed: PortfolioProject[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) setPortfolioProjects(parsed);
          }
        } catch { /* ignore parse errors */ }
      })
      .catch(() => {});
  }, []);

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file.name);
    setUploadedFileRef(file);
    const isPdfOrDoc = /\.(pdf|docx?)/i.test(file.name) || file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isPdfOrDoc) {
      const reader = new FileReader();
      reader.onload = (e) => setCvText((e.target?.result as string) || "");
      reader.readAsText(file);
    }
  }, []);

  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      try {
        return await apiJson<any>("/api/cv/parse", { method: "POST", json: { cvText: text } });
      } catch (err: any) {
        if (String(err?.message || "").includes("401")) {
          await syncSessionNow();
          return apiJson<any>("/api/cv/parse", { method: "POST", json: { cvText: text } });
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setFormData((prev) => parseResponse(data, prev));
      toast({ title: "AI extracted your profile!", description: "Review the details below and make any adjustments." });
      setPhase("review");
    },
    onError: (error: Error) => {
      const msg = error.message || "";
      toast({
        variant: "destructive",
        title: msg.includes("Could not read this file") ? "Upload failed" : "AI extraction unavailable",
        description: msg.includes("Could not read this file") ? "We couldn’t read this file. Try a clean PDF or paste the text below." : "Fill in your details below — it only takes 2 minutes.",
      });
      setShowRawPaste(true);
      setPhase("upload");
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (fd: globalThis.FormData) => {
      try {
        return await apiJson<any>("/api/cv/upload", { method: "POST", body: fd });
      } catch (err: any) {
        if (String(err?.message || "").includes("401")) {
          await syncSessionNow();
          return apiJson<any>("/api/cv/upload", { method: "POST", body: fd });
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setFormData((prev) => parseResponse(result.data, prev));
        toast({ title: "CV analysed! ✨", description: `Extracted ${result.extractedLength ?? "?"} characters of experience.` });
        setPhase("review");
      } else if (result.extractedText && result.extractedText.length > 30) {
        toast({ title: "Running AI analysis...", description: "Got your text — extracting profile details now." });
        parseMutation.mutate(result.extractedText);
      } else {
        toast({ title: "Partial extraction", description: result.message || "We extracted limited data. Fill in the details below." });
        setPhase("review");
      }
    },
    onError: (error: Error) => {
      const errMsg = error.message || '';
      const isReadErr = errMsg.includes('Could not read') || errMsg.includes('empty') || errMsg.includes('image-only');
      toast({
        variant: 'destructive',
        title: isReadErr ? 'Couldn’t read that file' : 'Upload failed',
        description: isReadErr
          ? 'This file may be image-based. A paste box has opened — paste your CV text to continue.'
          : 'Something went wrong. Paste your CV text below and our AI will still extract everything.',
      });
      setShowRawPaste(true);
      setPhase('upload');
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!data.title) throw new Error("Please add your professional title before going live.");
      await syncSessionNow();
      return apiJson<any>("/api/profile/go-live", {
        method: "POST",
        json: {
          bio: data.bio,
          title: data.title,
          skills: data.skills,
          hourlyRate: data.hourlyRate ? Math.round(parseFloat(data.hourlyRate) * 100) : 0,
          location: data.location,
          isPro: false,
        },
      });
    },
    onSuccess: async (res) => {
      // Immediately bust the readiness-gate cache so Apply sees the new profile
      // right away instead of serving the stale "No Profile" result for 30-60s.
      queryClient.invalidateQueries({ queryKey: ["/api/profile/check-readiness"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-status"] });
      fireConfetti();
      if (user?.id) {
        try {
          await saveFreelancerProfile({
            userId: user.id,
            fullName: `${formData.firstName} ${formData.lastName}`.trim() || user.displayName || "Freelancer",
            profilePhotoUrl: formData.photo || "",
            bio: formData.bio,
            title: formData.title,
            skills: formData.skills,
            expertise: [],
            categories: formData.category ? [formData.category] : [],
            hourlyRate: formData.hourlyRate ? Math.round(parseFloat(formData.hourlyRate) * 100) : 0,
            location: formData.location,
            portfolioLinks: formData.portfolioUrl ? [formData.portfolioUrl] : [],
            experienceLevel: formData.experienceLevel,
            availability: formData.availability,
            role: "freelancer",
            onboardingCompleted: true,
            publishedProfile: true,
          });
        } catch {}
      }
      try {
        const pts = await earnPoints("profile_complete", user?.id ?? "");
        if (pts?.success) {
          toast({ title: `+${pts.points} points earned!`, description: "Keep building your profile to unlock more rewards." });
        }
      } catch {}
      toast({ title: "Your profile is now LIVE! 🎉", description: res?.message || "Employers can now find and hire you on FreelanceSkills." });
      setTimeout(() => setLocation("/dashboard"), 1800);
    },
    onError: (error: Error) => {
      const msg = error.message || "";
      if (msg.includes("401") || msg.includes("Session")) {
        toast({ variant: "destructive", title: "Session expired", description: "Signing you back in — please tap Go Live again in a moment." });
        syncSessionNow();
      } else {
        toast({ variant: "destructive", title: "Could not publish profile", description: msg || "Please check your details and try again." });
      }
    },
  });

  const startParsing = () => {
    if (!cvText.trim() && !uploadedFile) return;
    setPhase("parsing");
    setParseScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setParseScanStep(step);
      if (step >= AI_PARSE_STEPS.length) {
        clearInterval(interval);
        if (uploadedFileRef) {
          const fd = new window.FormData();
          fd.append("cv", uploadedFileRef);
          uploadFileMutation.mutate(fd);
        } else {
          parseMutation.mutate(cvText || "Sample CV text for profile building");
        }
      }
    }, 500);
  };

  const loadSampleCV = () => {
    setCvText(`John Doe\nSenior Full Stack Developer | Cape Town, South Africa\njohn.doe@email.com | +27 82 123 4567`);
    setUploadedFile(null);
  };

  const updateField = (key: keyof ProfileFormData, value: any) => setFormData((p) => ({ ...p, [key]: value }));
  const addSkill = (s: string) => { if (s && !formData.skills.includes(s)) updateField("skills", [...formData.skills, s]); };
  const removeSkill = (s: string) => updateField("skills", formData.skills.filter((x) => x !== s));
  const toggleLanguage = (l: string) => updateField("languages", formData.languages.includes(l) ? formData.languages.filter((x) => x !== l) : [...formData.languages, l]);

  const openAddProject = () => setProjectModalOpen(true);
  const saveProject = async () => {
    if (!projectDraft.title.trim() || projectSaving) return;
    setProjectSaving(true);
    try {
      await syncSessionNow();
      const result = await apiJson<any>("/api/profile/projects", {
        method: "POST",
        json: {
          title: projectDraft.title.trim(),
          description: projectDraft.description.trim(),
          link: projectDraft.link.trim(),
          technologies: projectDraft.technologies.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      const item: PortfolioProject = {
        id: String(result?.profile?.portfolioProjectsJson?.[0]?.id ?? Date.now()),
        title: projectDraft.title.trim(),
        description: projectDraft.description.trim(),
        link: projectDraft.link.trim(),
        technologies: projectDraft.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      };
      setPortfolioProjects((prev) => [item, ...prev]);
      setProjectModalOpen(false);
      setProjectDraft({ title: "", description: "", link: "", technologies: "" });
      toast({ title: "Project added successfully!", description: "Your portfolio update is saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Could not save project", description: error?.message || "Please try again." });
    } finally {
      setProjectSaving(false);
    }
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!user) { setLocation("/"); return null; }

  if (phase === "upload") return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="animated-gradient-bg text-white pt-32 pb-16 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl">
            <div className="mx-auto text-center">
              <Badge className="mb-6 bg-white/10 border-white/20 text-white text-sm" data-testid="badge-hero">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> AI-Powered Profile Builder
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-5 leading-tight">Turn Your CV into a <span className="text-emerald-400">Winning Profile</span></h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">Upload or paste your CV — our AI extracts your skills, writes your bio, benchmarks your rate and builds your profile in seconds.</p>
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-white/70 mb-8">
                {["Upload CV", "AI Extracts", "Review & Improve", "Go Live"].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2"><div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full"><span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold flex items-center justify-center">{i + 1}</span>{s}</div>{i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-white/40" />}</div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-left">
                <Card className={`bg-slate-950/40 border-white/10 transition-all duration-300 ${showRawPaste ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/20" : ""}`}><CardContent className="p-5 space-y-3">{showRawPaste && <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1"><Sparkles className="w-3 h-3" /> Paste your CV here — AI will extract everything</div>}<Label className="text-white/80">Paste CV text</Label><Textarea value={cvText} onChange={(e) => setCvText(e.target.value)} className="min-h-[160px] bg-white/5 border-white/10 text-white" placeholder="Paste CV text here..." data-testid="textarea-cv-paste" /><button onClick={() => setShowRawPaste((v) => !v)} className="text-xs text-emerald-300" data-testid="btn-toggle-raw-paste">{showRawPaste ? "Hide" : "Show"} manual mode</button></CardContent></Card>
                <Card className="bg-slate-950/40 border-white/10"><CardContent className="p-5 space-y-4"><div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }} className={`rounded-2xl border-2 border-dashed p-8 text-center ${dragOver ? "border-emerald-400 bg-emerald-500/10" : "border-white/20 bg-white/5"}`}><Upload className="w-10 h-10 mx-auto mb-3 text-emerald-400" /><div className="font-semibold">Drop PDF/DOCX here</div><div className="text-xs text-white/60">or choose a file</div></div><Input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} data-testid="input-cv-file" /><div className="flex gap-2"><Button onClick={() => fileInputRef.current?.click()} className="flex-1" data-testid="btn-upload-cv">Upload CV</Button><Button variant="outline" onClick={loadSampleCV} className="flex-1" data-testid="btn-load-sample">Try sample</Button></div></CardContent></Card>
              </div>
              <div className="mt-6 flex gap-3 justify-center"><Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={startParsing} disabled={!cvText.trim() && !uploadedFile} data-testid="btn-extract-ai"><Sparkles className="w-5 h-5" />Extract Profile with AI <ChevronRight className="w-5 h-5" /></Button><Button size="lg" variant="outline" onClick={() => { setManualMode(true); setPhase("review"); }} data-testid="btn-manual-mode">Paste / manual mode</Button></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  if (phase === "parsing") return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center" data-testid="section-parsing">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 relative">
              <Brain className="w-12 h-12 text-emerald-500" />
              {parseScanStep < AI_PARSE_STEPS.length && <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/40 animate-ping" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">AI is building your profile</h2>
            <p className="text-muted-foreground mb-8 text-sm">{AI_PARSE_STEPS[Math.min(parseScanStep, AI_PARSE_STEPS.length - 1)]?.label || "Parsing..."}</p>
            <div className="space-y-3 text-left mb-8">
              {AI_PARSE_STEPS.map((step, idx) => {
                const done = parseScanStep > idx;
                const active = parseScanStep === idx;
                return <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? "bg-emerald-500/10" : active ? "bg-primary/5" : "opacity-30"}`} data-testid={`parse-step-${idx}`}>{done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : active ? <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />}<span className={`text-sm ${done ? "text-emerald-700 dark:text-emerald-400 font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{step.label}</span>{done && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}</div>;
              })}
            </div>
            <Progress value={(parseScanStep / AI_PARSE_STEPS.length) * 100} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-3">{Math.min(Math.round((parseScanStep / AI_PARSE_STEPS.length) * 100), 99)}% complete</p>
          </div>
        </div>
      </main>
    </div>
  );

  const TABS = [
    { id: "basics", label: "Basics", icon: User },
    { id: "skills", label: "Skills", icon: Target },
    { id: "portfolio", label: "Portfolio", icon: Globe },
    { id: "rates", label: "Rates", icon: DollarSign },
    { id: "preview", label: "Preview", icon: Eye },
  ] as const;

  const saveProfile = () => profileMutation.mutate(formData);
  const publishLabel = manualMode ? "Go Live — Create My Profile" : "Go Live — Create My Profile";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-border bg-background/95 backdrop-blur sticky top-[64px] z-20" data-testid="review-header">
          <div className="container mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-foreground">AI-Extracted Profile</p>
                  <p className="text-xs text-muted-foreground">Review and improve before going live</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right"><p className={`text-sm font-bold ${scoreColor}`}>{completionScore}% — {scoreLabel}</p><p className="text-xs text-muted-foreground">Profile strength</p></div>
                <div className="w-12 h-12 rounded-full border-4 border-border flex items-center justify-center relative" data-testid="completion-ring"><span className={`text-xs font-bold ${scoreColor}`}>{completionScore}</span></div>
                <Button size="sm" variant="ghost" onClick={() => { setPhase("upload"); setFormData(defaultForm); }} data-testid="btn-start-over" className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Start over</Button>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-2"><Progress value={completionScore} className="h-1.5" /></div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_340px] gap-8">
              <div>
                <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-6 overflow-x-auto" data-testid="tab-bar">
                  {TABS.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid={`tab-${tab.id}`}><tab.icon className="w-4 h-4" /> {tab.label}</button>)}
                </div>

                {activeTab === "basics" && (
                  <div className="space-y-6" data-testid="tab-content-basics">
                    <Card className="border-border"><CardContent className="p-6"><Label className="text-sm font-semibold mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-500" /> Profile Photo</Label><div className="flex items-center gap-5"><div className="w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors" onClick={() => photoInputRef.current?.click()} data-testid="photo-upload-zone">{formData.photo ? <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted-foreground/50" />}</div><input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); setFormData((p) => ({ ...p, photo: url })); } }} data-testid="input-photo" /><div><Button size="sm" variant="outline" onClick={() => photoInputRef.current?.click()} data-testid="btn-upload-photo">Upload Photo</Button></div></div></CardContent></Card>
                    <Card className="border-border"><CardContent className="p-6 space-y-5"><Label className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> Personal Information</Label><div className="grid grid-cols-2 gap-4"><div><Label className="text-xs text-muted-foreground mb-1.5 block">First Name *</Label><Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Sipho" data-testid="input-first-name" /></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Last Name *</Label><Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Mkhize" data-testid="input-last-name" /></div></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Professional Title *</Label><Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Senior Full-Stack Developer" data-testid="input-title" /></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">One-line Tagline</Label><Input value={formData.tagline} onChange={(e) => updateField("tagline", e.target.value)} placeholder="I build fast, scalable apps" data-testid="input-tagline" /></div><div><div className="flex items-center justify-between mb-1.5"><Label className="text-xs text-muted-foreground">Professional Bio *</Label><button className="text-xs text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1" onClick={() => updateField("bio", `Experienced ${formData.title || "professional"} based in ${formData.location || "South Africa"} with a track record of delivering high-quality work.`)} data-testid="btn-ai-bio"><Sparkles className="w-3 h-3" /> AI Regenerate</button></div><Textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Describe your experience..." className="min-h-[120px] resize-none" data-testid="textarea-bio" /><p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 · {formData.bio.length >= 80 ? "✓ Good length" : `Write ${80 - formData.bio.length} more characters`}</p></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Phone Number</Label><Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+27 82 123 4567" data-testid="input-phone" /></div></CardContent></Card>
                    <Card className="border-border"><CardContent className="p-6 space-y-5"><Label className="text-sm font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500" /> Category & Experience</Label><div className="grid grid-cols-2 gap-4"><div><Label className="text-xs text-muted-foreground mb-1.5 block">Service Category *</Label><Select value={formData.category} onValueChange={(v) => updateField("category", v)}><SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{SERVICE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Experience Level *</Label><Select value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)}><SelectTrigger data-testid="select-experience"><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent><SelectItem value="entry">Entry Level (0–2 years)</SelectItem><SelectItem value="intermediate">Intermediate (2–5 years)</SelectItem><SelectItem value="expert">Expert / Senior (5+ years)</SelectItem></SelectContent></Select></div></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Location</Label><Select value={formData.location} onValueChange={(v) => updateField("location", v)}><SelectTrigger data-testid="select-location"><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent>{SA_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Languages</Label><div className="flex flex-wrap gap-2">{LANGUAGES_LIST.map((l) => <button key={l} onClick={() => toggleLanguage(l)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.languages.includes(l) ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "border-border text-muted-foreground hover:border-emerald-400/50"}`} data-testid={`btn-lang-${l}`}>{formData.languages.includes(l) ? "✓ " : ""}{l}</button>)}</div></div></CardContent></Card>
                    <Button className="w-full gap-2" onClick={() => setActiveTab("skills")} data-testid="btn-next-skills">Next: Skills <ChevronRight className="w-4 h-4" /></Button>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="space-y-6" data-testid="tab-content-skills">
                    <Card className="border-border"><CardContent className="p-6"><Label className="text-sm font-semibold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-emerald-500" /> Your Skills ({formData.skills.length})</Label><div className={`flex flex-wrap gap-2 min-h-[60px] p-4 bg-muted/30 rounded-xl border-2 border-dashed mb-4 ${formData.skills.length === 0 ? "border-border" : "border-emerald-500/20"}`} data-testid="skills-container">{formData.skills.length === 0 && <p className="text-xs text-muted-foreground self-center">Add skills below</p>}{formData.skills.map((s, i) => <Badge key={i} className="pl-3 pr-1 py-1.5 gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" data-testid={`badge-skill-${i}`}>{s}<button onClick={() => removeSkill(s)} className="ml-1 hover:bg-emerald-500/30 rounded-full p-0.5" data-testid={`btn-remove-skill-${i}`}><X className="w-3 h-3" /></button></Badge>)}</div><div className="flex gap-2"><Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addSkill(skillInput.trim()); setSkillInput(""); } }} placeholder="Type a skill and press Enter..." data-testid="input-skill" /><Button size="sm" variant="outline" onClick={() => { addSkill(skillInput.trim()); setSkillInput(""); }} data-testid="btn-add-skill"><Plus className="w-4 h-4" /></Button></div></CardContent></Card>
                    <Card className="border-emerald-500/20 bg-emerald-500/5"><CardContent className="p-5"><p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> AI Skill Suggestions</p><div className="flex flex-wrap gap-2">{skillSuggestions.filter((s) => !formData.skills.includes(s)).map((s) => <button key={s} onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/15 transition-all" data-testid={`btn-suggest-${s.toLowerCase().replace(/[.\s]/g, "-")}`}><Plus className="w-3 h-3 inline mr-0.5" /> {s}</button>)}</div></CardContent></Card>
                    <Card className="border-border"><CardContent className="p-6"><Label className="text-sm font-semibold flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-emerald-500" /> Certifications</Label><Textarea value={formData.certifications} onChange={(e) => updateField("certifications", e.target.value)} placeholder="AWS Solutions Architect (2023), Google Analytics Certified (2022)..." className="min-h-[80px] resize-none" data-testid="textarea-certifications" /></CardContent></Card>
                    <div className="flex gap-3"><Button variant="outline" onClick={() => setActiveTab("basics")} data-testid="btn-back-basics" className="flex-1">← Basics</Button><Button onClick={() => setActiveTab("portfolio")} data-testid="btn-next-portfolio" className="flex-1">Portfolio →</Button></div>
                  </div>
                )}

                {activeTab === "portfolio" && (
                  <div className="space-y-6" data-testid="tab-content-portfolio">
                    <Card className="border-border"><CardContent className="p-6 space-y-5"><Label className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> Online Presence</Label><div><Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Portfolio Website</Label><Input value={formData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.co.za" data-testid="input-portfolio-url" /></div><div><Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn Profile</Label><Input value={formData.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourname" data-testid="input-linkedin" /></div><div><Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub Profile</Label><Input value={formData.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} placeholder="https://github.com/yourname" data-testid="input-github" /></div></CardContent></Card>
                    <Card className="border-dashed border-2 border-border"><CardContent className="p-6 text-center"><div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3"><Plus className="w-6 h-6 text-muted-foreground" /></div><p className="text-sm font-semibold text-foreground mb-1">Portfolio Projects</p><p className="text-xs text-muted-foreground mb-4">Add screenshots, links or descriptions of your best work</p><Button size="sm" variant="outline" onClick={openAddProject} data-testid="btn-add-portfolio">Add Project</Button></CardContent></Card>
                    {portfolioProjects.map((p) => <Card key={p.id}><CardContent className="p-4"><p className="font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.description}</p></CardContent></Card>)}
                    <div className="flex gap-3"><Button variant="outline" onClick={() => setActiveTab("skills")} className="flex-1" data-testid="btn-back-skills">← Skills</Button><Button onClick={() => setActiveTab("rates")} className="flex-1" data-testid="btn-next-rates">Rates →</Button></div>
                  </div>
                )}

                {activeTab === "rates" && (
                  <div className="space-y-6" data-testid="tab-content-rates"><Card className="border-border"><CardContent className="p-6 space-y-5"><Label className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Your Rate</Label>{formData.category && <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"><p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Market Rate Benchmark</p><div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">R{marketRate.low}</span><div className="flex-1 h-2 rounded-full bg-muted relative"><div className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: "60%", left: "20%" }} /></div><span className="text-muted-foreground">R{marketRate.high}</span></div><p className="text-xs text-muted-foreground mt-2">Similar freelancers charge <strong>R{marketRate.avg}/hr</strong> on average</p></div>}<div><Label className="text-xs text-muted-foreground mb-1.5 block">Hourly Rate (ZAR) *</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R</span><Input type="number" value={formData.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} placeholder={marketRate.avg.toString()} className="pl-8" data-testid="input-hourly-rate" /></div></div></CardContent></Card><Card className="border-border"><CardContent className="p-6 space-y-5"><Label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Availability</Label><div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"><div><p className="text-sm font-semibold text-foreground">Available Now</p><p className="text-xs text-muted-foreground">Show a green badge on your profile</p></div><Switch checked={formData.availableNow} onCheckedChange={(v) => updateField("availableNow", v)} data-testid="switch-available-now" /></div><div><Label className="text-xs text-muted-foreground mb-1.5 block">Availability Detail</Label><Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}><SelectTrigger data-testid="select-availability"><SelectValue /></SelectTrigger><SelectContent>{AVAILABILITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div></CardContent></Card><div className="flex gap-3"><Button variant="outline" onClick={() => setActiveTab("portfolio")} className="flex-1" data-testid="btn-back-portfolio">← Portfolio</Button><Button onClick={() => setActiveTab("preview")} className="flex-1" data-testid="btn-next-preview">Preview →</Button></div></div>
                )}

                {activeTab === "preview" && (
                  <div className="space-y-6" data-testid="tab-content-preview"><Card className="border-border"><CardContent className="p-6"><div className="flex items-center justify-between mb-3"><p className="text-sm font-bold text-amber-500 flex items-center gap-1.5"><Eye className="w-4 h-4" /> PREVIEW ONLY — Not published yet</p><Badge variant="outline">{completionScore}% ready</Badge></div><div className="space-y-2 text-sm"><p><strong>{formData.firstName || "Your"} {formData.lastName || "Name"}</strong></p><p>{formData.title || "Your Title"}</p><p>{formData.bio || "Your bio will appear here."}</p><Progress value={completionScore} className="h-2" /></div></CardContent></Card><Card className="border-border"><CardContent className="p-5"><p className="text-sm font-semibold mb-2">What’s missing</p><div className="space-y-2 text-xs text-muted-foreground">{completionTips.slice(0, 5).map((tip) => <div key={tip}>• {tip}</div>)}</div></CardContent></Card><div className="flex gap-3"><Button variant="outline" onClick={() => setActiveTab("rates")} className="flex-1" data-testid="btn-back-rates">← Rates</Button><Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={saveProfile} disabled={profileMutation.isPending || completionScore < 70} title={completionScore < 70 ? `Reach 70% profile strength to go live (currently ${completionScore}%)` : ""} data-testid="btn-go-live">{profileMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : completionScore < 70 ? `Go Live (${completionScore}% — need 70%)` : publishLabel}</Button></div></div>
                )}
              </div>

              <div className="hidden lg:block"><div className="sticky top-[140px] space-y-4"><ProfileStrengthMeter data={formData} /><Card className="border-dashed border-2 border-border"><CardContent className="p-6 text-center"><div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3"><Plus className="w-6 h-6 text-muted-foreground" /></div><p className="text-sm font-semibold text-foreground mb-1">Portfolio Projects</p><p className="text-xs text-muted-foreground mb-4">Add screenshots, links or descriptions of your best work</p><Button size="sm" variant="outline" onClick={openAddProject} data-testid="btn-add-portfolio">Add Project</Button></CardContent></Card>{portfolioProjects.map((p) => <Card key={p.id}><CardContent className="p-4"><p className="font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.description}</p></CardContent></Card>)}</div></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-lg bg-slate-950 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Add Project</h3><button onClick={() => setProjectModalOpen(false)} data-testid="btn-close-project"><X className="w-4 h-4" /></button></div>
              <div className="space-y-3">
                <Input placeholder="Project Title" value={projectDraft.title} onChange={(e) => setProjectDraft((p) => ({ ...p, title: e.target.value }))} data-testid="input-project-title" />
                <Textarea placeholder="Project Description" value={projectDraft.description} onChange={(e) => setProjectDraft((p) => ({ ...p, description: e.target.value }))} data-testid="textarea-project-description" />
                <Input placeholder="Link" value={projectDraft.link} onChange={(e) => setProjectDraft((p) => ({ ...p, link: e.target.value }))} data-testid="input-project-link" />
                <Input placeholder="Technologies, comma separated" value={projectDraft.technologies} onChange={(e) => setProjectDraft((p) => ({ ...p, technologies: e.target.value }))} data-testid="input-project-tech" />
              </div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setProjectModalOpen(false)} data-testid="btn-cancel-project">Cancel</Button><Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={saveProject} disabled={projectSaving} data-testid="btn-save-project">{projectSaving ? "Saving..." : "Save Project"}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

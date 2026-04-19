import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { earnPoints } from "@/lib/earnPoints";
import { calcStrength } from "@/lib/profileStrength";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { apiJson } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@shared/categories";
import {
  Upload, FileText, Sparkles, Check, User, Briefcase,
  MapPin, DollarSign, Award, X, Loader2, ChevronRight,
  Globe, Github, Linkedin, Star, Clock, Camera, Eye,
  RefreshCw, Plus, Zap, Shield, TrendingUp, Brain,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink,
  Languages, Phone, Mail, Calendar, BarChart3, Target,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "web-development": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Vue.js", "Python", "AWS", "Docker"],
  "design": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "After Effects", "Sketch", "InVision", "Framer", "Canva", "Blender"],
  "writing": ["Copywriting", "SEO Writing", "Content Strategy", "Blog Writing", "Technical Writing", "UX Writing", "Proofreading", "Ghostwriting"],
  "marketing": ["Google Ads", "Facebook Ads", "SEO", "Email Marketing", "Social Media", "Analytics", "HubSpot", "Salesforce", "CRM"],
  "video": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Motion Graphics", "Color Grading", "YouTube", "TikTok"],
  default: ["Microsoft Office", "Project Management", "Communication", "Leadership", "Problem Solving", "Excel", "PowerPoint"],
};

const MARKET_RATES: Record<string, { low: number; avg: number; high: number }> = {
  "web-development": { low: 350, avg: 520, high: 950 },
  "design": { low: 280, avg: 420, high: 750 },
  "writing": { low: 150, avg: 280, high: 500 },
  "marketing": { low: 200, avg: 380, high: 700 },
  "video": { low: 250, avg: 400, high: 800 },
  default: { low: 150, avg: 300, high: 600 },
};

const LANGUAGES_LIST = ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Tswana", "Venda", "Tsonga", "French", "Portuguese", "Arabic", "Nigerian Pidgin", "Hausa", "Swahili"];
const SA_LOCATIONS = ["Cape Town, WC", "Johannesburg, GP", "Durban, KZN", "Pretoria, GP", "Port Elizabeth, EC", "Bloemfontein, FS", "East London, EC", "Polokwane, LP", "Remote (South Africa)"];
const AVAILABILITY_OPTIONS = ["Available now", "Available in 1 week", "Available in 2 weeks", "Part-time only", "Weekends only"];

const AI_PARSE_STEPS = [
  { label: "Reading CV structure", icon: FileText },
  { label: "Extracting personal information", icon: User },
  { label: "Identifying skills & expertise", icon: Target },
  { label: "Detecting experience level", icon: TrendingUp },
  { label: "Generating professional bio", icon: Brain },
  { label: "Suggesting market rate", icon: DollarSign },
  { label: "Building profile preview", icon: Eye },
  { label: "Profile ready!", icon: CheckCircle2 },
];

// ─── TYPES ────────────────────────────────────────────────────────────────
interface FormData {
  firstName: string; lastName: string; title: string; bio: string;
  skills: string[]; hourlyRate: string; location: string;
  experienceLevel: string; category: string; certifications: string;
  photo: string; portfolioUrl: string; linkedinUrl: string; githubUrl: string;
  languages: string[]; availability: string; availableNow: boolean;
  phone: string; tagline: string;
}

const defaultForm: FormData = {
  firstName: "", lastName: "", title: "", bio: "", skills: [],
  hourlyRate: "", location: "", experienceLevel: "", category: "",
  certifications: "", photo: "", portfolioUrl: "", linkedinUrl: "",
  githubUrl: "", languages: [], availability: "Available now",
  availableNow: true, phone: "", tagline: "",
};

// ─── PHASE TYPES ──────────────────────────────────────────────────────────
type Phase = "upload" | "parsing" | "review";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function CVUpload() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      const t = setTimeout(() => {
        toast({ title: "Welcome to FreelanceSkills! 🎉", description: "Upload your CV or paste your details below — our AI will build your profile in seconds." });
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  const [phase, setPhase] = useState<Phase>("upload");
  const [cvText, setCvText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileRef, setUploadedFileRef] = useState<File | null>(null);
  const [parseScanStep, setParseScanStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [activeTab, setActiveTab] = useState<"basics" | "skills" | "portfolio" | "rates" | "preview">("basics");
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [portfolioProjects, setPortfolioProjects] = useState<Array<{ id: string; title: string; description: string; link: string; technologies: string[] }>>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: "", description: "", link: "", technologies: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { score: completionScore, tips: completionTips, label: scoreLabel } = calcStrength(formData);
  const scoreColor = completionScore >= 80 ? "text-emerald-500" : completionScore >= 50 ? "text-amber-500" : "text-red-500";
  const marketRate = MARKET_RATES[formData.category] ?? MARKET_RATES.default;
  const skillSuggestions = SKILL_SUGGESTIONS[formData.category] ?? SKILL_SUGGESTIONS.default;

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((p) => ({ ...p, photo: URL.createObjectURL(file) }));
  };

  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const doFetch = () => apiJson<any>("/api/cv/parse", { method: "POST", json: { cvText: text } });
      try {
        return await doFetch();
      } catch (err: any) {
        if (String(err?.message || "").includes("401")) {
          await syncSessionNow();
          return doFetch();
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, ...{
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        title: data.title || prev.title,
        bio: data.bio || prev.bio,
        skills: data.skills || prev.skills,
        hourlyRate: data.hourlyRate?.toString() || prev.hourlyRate,
        location: data.location || prev.location,
        experienceLevel: data.experienceLevel || prev.experienceLevel,
        category: data.category || prev.category,
        certifications: data.certifications || prev.certifications,
      } }));
      toast({ title: "AI extracted your profile!", description: "Review the details below and make any adjustments." });
      setPhase("review");
    },
    onError: (error: Error) => {
      const msg = error.message || "";
      toast({ variant: "destructive", title: msg.includes("Could not read this file") ? "Upload failed" : "AI extraction unavailable", description: msg.includes("Could not read this file") ? "We couldn’t read this file. Try a clean PDF or paste the text below." : "Fill in your details below — it only takes 2 minutes." });
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
      const data = result.data || {};
      setFormData((prev) => ({ ...prev, ...{
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
      } }));
      toast({ title: result.success ? "CV parsed!" : "Partial extraction", description: result.message || `Extracted ${result.extractedLength ?? "?"} characters.` });
      setPhase("review");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Upload failed", description: error.message || "We couldn’t read this file. Try a clean PDF or paste the text below." });
      setPhase("upload");
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!data.firstName || !data.lastName || !data.title || !data.category) throw new Error("Please fill in your Name, Title and Category before going live.");
      const res = await apiJson<any>("/api/profile", { method: "POST", json: { bio: data.bio, title: data.title, skills: data.skills, hourlyRate: data.hourlyRate ? parseInt(data.hourlyRate) * 100 : 0, location: data.location, isPro: false } });
      return res;
    },
    onSuccess: async () => {
      const pubRes = await apiJson<any>("/api/profile/publish", { method: "POST" });
      if (!pubRes?.success) {
        toast({ variant: "destructive", title: "Profile saved but not published", description: pubRes?.message || "Your profile was saved. Click Go Live again or go to Dashboard to publish." });
        return;
      }
      const pts = await earnPoints("profile_complete", user?.id ?? "");
      if (pts?.success) toast({ title: `+${pts.points} points earned! 🎉`, description: "You earned points for completing your profile." });
      toast({ title: "Your profile is now LIVE and visible to employers!", description: "Employers can now see your profile on FreelanceSkills." });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not save profile", description: error.message });
    },
  });

  const startParsing = () => {
    if (!cvText.trim() && !uploadedFile) return;
    setPhase("parsing");
    setParseScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
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
    const sample = `John Doe
Senior Full Stack Developer | Cape Town, South Africa
john.doe@email.com | +27 82 123 4567 | linkedin.com/in/johndoe`;
    setCvText(sample);
    setUploadedFile(null);
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!user) { setLocation("/"); return null; }

  const openAddProject = () => setProjectModalOpen(true);
  const saveProject = () => {
    const item = { id: String(Date.now()), title: projectDraft.title, description: projectDraft.description, link: projectDraft.link, technologies: projectDraft.technologies.split(",").map((s) => s.trim()).filter(Boolean) };
    setPortfolioProjects((prev) => [item, ...prev]);
    setProjectModalOpen(false);
    setProjectDraft({ title: "", description: "", link: "", technologies: "" });
    toast({ title: "Project added!", description: "Your portfolio update is saved." });
  };

  if (phase === "upload") return (<div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1">{/* upload view omitted for brevity */}</main><Footer /></div>);
  if (phase === "parsing") return (<div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center py-20"><div className="container mx-auto px-4"><div className="max-w-lg mx-auto text-center" data-testid="section-parsing"><div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 relative"><Brain className="w-12 h-12 text-emerald-500" />{parseScanStep < AI_PARSE_STEPS.length && <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/40 animate-ping" />}</div><h2 className="text-2xl font-bold text-foreground mb-2">AI is building your profile</h2><p className="text-muted-foreground mb-8 text-sm">{parseScanStep < AI_PARSE_STEPS.length ? AI_PARSE_STEPS[parseScanStep]?.label + "..." : "Finalising your profile..."}</p><div className="space-y-3 text-left mb-8">{AI_PARSE_STEPS.map((step, idx) => { const done = parseScanStep > idx; const active = parseScanStep === idx; return (<div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? "bg-emerald-500/10" : active ? "bg-primary/5" : "opacity-30"}`} data-testid={`parse-step-${idx}`}>{done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : active ? <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />}<span className={`text-sm ${done ? "text-emerald-700 dark:text-emerald-400 font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{step.label}</span>{done && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}</div>);})}</div><Progress value={(parseScanStep / AI_PARSE_STEPS.length) * 100} className="h-2 bg-muted" /><p className="text-xs text-muted-foreground mt-3">{Math.min(Math.round((parseScanStep / AI_PARSE_STEPS.length) * 100), 99)}% complete</p></div></div></main></div>);

  const updateField = (key: keyof FormData, value: any) => setFormData((p) => ({ ...p, [key]: value }));
  const addSkill = (s: string) => { if (s && !formData.skills.includes(s)) updateField("skills", [...formData.skills, s]); };
  const removeSkill = (s: string) => updateField("skills", formData.skills.filter((x) => x !== s));
  const toggleLanguage = (l: string) => updateField("languages", formData.languages.includes(l) ? formData.languages.filter((x) => x !== l) : [...formData.languages, l]);

  const TABS = [ { id: "basics", label: "Basics", icon: User }, { id: "skills", label: "Skills", icon: Target }, { id: "portfolio", label: "Portfolio", icon: Globe }, { id: "rates", label: "Rates", icon: DollarSign }, { id: "preview", label: "Preview", icon: Eye } ] as const;

  return (<div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1"><div className="border-b border-border bg-background/95 backdrop-blur sticky top-[64px] z-20" data-testid="review-header"><div className="container mx-auto px-4 md:px-6 py-3"><div className="flex items-center justify-between gap-4 max-w-5xl mx-auto"><div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><div><p className="text-sm font-bold text-foreground">AI-Extracted Profile</p><p className="text-xs text-muted-foreground">Review and improve before going live</p></div></div><div className="flex items-center gap-3"><div className="hidden sm:block text-right"><p className={`text-sm font-bold ${scoreColor}`}>{completionScore}% — {scoreLabel}</p><p className="text-xs text-muted-foreground">Profile strength</p></div><div className="w-12 h-12 rounded-full border-4 border-border flex items-center justify-center relative" data-testid="completion-ring"><span className={`text-xs font-bold ${scoreColor}`}>{completionScore}</span></div><Button size="sm" variant="ghost" onClick={() => { setPhase("upload"); setFormData(defaultForm); }} data-testid="btn-start-over" className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Start over</Button></div></div><div className="max-w-5xl mx-auto mt-2"><Progress value={completionScore} className="h-1.5" /></div></div></div><div className="container mx-auto px-4 md:px-6 py-8"><div className="max-w-5xl mx-auto"><div className="grid lg:grid-cols-[1fr_340px] gap-8"><div>{/* left tabs and forms omitted */}</div><div className="hidden lg:block"><div className="sticky top-[140px] space-y-4"><ProfileStrengthMeter data={formData} /><Card className="border-dashed border-2 border-border"><CardContent className="p-6 text-center"><div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3"><Plus className="w-6 h-6 text-muted-foreground" /></div><p className="text-sm font-semibold text-foreground mb-1">Portfolio Projects</p><p className="text-xs text-muted-foreground mb-4">Add screenshots, links or descriptions of your best work</p><Button size="sm" variant="outline" onClick={openAddProject} data-testid="btn-add-portfolio">Add Project</Button></CardContent></Card>{portfolioProjects.map((p) => (<Card key={p.id}><CardContent className="p-4"><p className="font-semibold">{p.title}</p></CardContent></Card>))}</div></div></div></div></div></main><Footer />{projectModalOpen && <div />}</div>);
}

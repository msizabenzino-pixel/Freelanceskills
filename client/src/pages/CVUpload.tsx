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
import { useToast } from "@/hooks/use-toast";
import { earnPoints } from "@/lib/earnPoints";
import { apiJson, apiFetch } from "@/lib/api";
import { saveFreelancerProfile } from "@/lib/firebaseAppData";
import { calcStrength } from "@/lib/profileStrength";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { SERVICE_CATEGORIES } from "@shared/categories";
import {
  Upload, FileText, Sparkles, User, Briefcase, MapPin, DollarSign, Award, X, Loader2, ChevronRight,
  Globe, Github, Linkedin, Star, Clock, Camera, Eye, RefreshCw, Plus, Zap, Shield, TrendingUp, Brain,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Languages, Phone, Calendar, BarChart3, Target,
  CheckCheck, Rocket, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const WIZARD_STEPS = [
  { id: "basics", label: "Basics", icon: User },
  { id: "skills", label: "Skills", icon: Target },
  { id: "portfolio", label: "Portfolio", icon: Globe },
  { id: "rates", label: "Rates", icon: DollarSign },
  { id: "preview", label: "Go Live", icon: Rocket },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]["id"];

const defaultForm: ProfileFormData = {
  firstName: "", lastName: "", title: "", bio: "", skills: [],
  hourlyRate: "", location: "", experienceLevel: "", category: "",
  certifications: "", photo: "", portfolioUrl: "", linkedinUrl: "",
  githubUrl: "", languages: [], availability: "Available now",
  availableNow: true, phone: "", tagline: "",
};

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
    w: 8 + Math.random() * 12, h: 5 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
    color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 6)],
    angle: Math.random() * 360, spin: (Math.random() - 0.5) * 8,
  }));
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate); else canvas.remove();
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

// ── Live Profile Preview Card ─────────────────────────────────────────────────
function LivePreviewCard({ formData }: { formData: ProfileFormData }) {
  const initials = [formData.firstName?.[0], formData.lastName?.[0]].filter(Boolean).join("") || "?";
  const displayName = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || "Your Name";
  const { score } = calcStrength(formData);
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
      <div className="h-16 bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 relative">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 30L30 0H15L0 15M30 30V15L15 30'/%3E%3C/g%3E%3C/svg%3E\")" }} />
      </div>
      <div className="px-4 pb-4 -mt-6">
        <div className="flex items-end justify-between mb-3">
          <div className="relative">
            {formData.photo ? (
              <img src={formData.photo} alt="Profile" className="w-14 h-14 rounded-2xl border-4 border-slate-900 object-cover shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {initials}
              </div>
            )}
            {formData.availableNow && (
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-emerald-500 rounded-full px-1.5 py-0.5 border-2 border-slate-900">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[8px] text-slate-950 font-black">Open</span>
              </div>
            )}
          </div>
          {formData.hourlyRate && (
            <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
              R{formData.hourlyRate}/hr
            </span>
          )}
        </div>
        <div className="font-black text-white text-sm mb-0.5">{displayName}</div>
        {formData.title && <div className="text-slate-400 text-xs mb-1 truncate">{formData.title}</div>}
        {formData.location && (
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
            <MapPin className="w-3 h-3" /> {formData.location}
          </div>
        )}
        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {formData.skills.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{s}</span>
            ))}
            {formData.skills.length > 4 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">+{formData.skills.length - 4}</span>}
          </div>
        )}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Profile Strength</span>
            <span className={cn("text-[10px] font-bold", score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400")}>{score}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, onStep }: { currentStep: WizardStep; onStep: (s: WizardStep) => void }) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  return (
    <div className="flex items-center gap-0 overflow-x-auto" data-testid="step-indicator">
      {WIZARD_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onStep(step.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                active && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                done && "text-emerald-500 hover:bg-slate-800",
                !active && !done && "text-slate-500 hover:text-slate-300"
              )}
              data-testid={`step-btn-${step.id}`}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0",
                active && "bg-emerald-500 text-slate-950",
                done && "bg-emerald-500/20 text-emerald-400",
                !active && !done && "bg-slate-800 text-slate-500"
              )}>
                {done ? <CheckCheck className="w-3 h-3" /> : idx + 1}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={cn("w-6 h-px mx-1 flex-shrink-0 transition-colors", done ? "bg-emerald-500/50" : "bg-slate-800")} />
            )}
          </div>
        );
      })}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<WizardStep>("basics");
  const [showPaste, setShowPaste] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: "", description: "", link: "", technologies: "" });
  const [projectSaving, setProjectSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { score: completionScore, tips: completionTips, label: scoreLabel } = calcStrength(formData);
  const marketRate = MARKET_RATES[formData.category] ?? MARKET_RATES.default;
  const skillSuggestions = SKILL_SUGGESTIONS[formData.category] ?? SKILL_SUGGESTIONS.default;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      const t = setTimeout(() => toast({ title: "Welcome to FreelanceSkills! 🎉", description: "Upload your CV or fill in your details — AI builds your profile in seconds." }), 600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    apiFetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(profile => {
        if (!profile) return;
        try {
          const raw = profile.portfolioProjectsJson;
          if (typeof raw === "string" && raw.trim().startsWith("[")) {
            const parsed: PortfolioProject[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) setPortfolioProjects(parsed);
          }
        } catch {}
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
      try { return await apiJson<any>("/api/cv/parse", { method: "POST", json: { cvText: text } }); }
      catch (err: any) {
        if (String(err?.message || "").includes("401")) { await syncSessionNow(); return apiJson<any>("/api/cv/parse", { method: "POST", json: { cvText: text } }); }
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
      toast({ variant: "destructive", title: msg.includes("Could not read this file") ? "Upload failed" : "AI extraction unavailable", description: "Fill in your details manually — it only takes 2 minutes." });
      setShowPaste(true); setPhase("upload");
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (fd: globalThis.FormData) => {
      try { return await apiJson<any>("/api/cv/upload", { method: "POST", body: fd }); }
      catch (err: any) {
        if (String(err?.message || "").includes("401")) { await syncSessionNow(); return apiJson<any>("/api/cv/upload", { method: "POST", body: fd }); }
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
      const errMsg = error.message || "";
      toast({ variant: "destructive", title: "Couldn't read that file", description: "Try a paste box instead — paste your CV text and AI will extract everything." });
      setShowPaste(true); setPhase("upload");
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!data.title) throw new Error("Please add your professional title before going live.");
      await syncSessionNow();
      return apiJson<any>("/api/profile/go-live", {
        method: "POST",
        json: {
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          title: data.title,
          skills: data.skills,
          hourlyRate: data.hourlyRate ? Math.round(parseFloat(data.hourlyRate) * 100) : 0,
          location: data.location,
          isPro: false,
          photoUrl: data.photo,
          certifications: data.certifications,
          languages: data.languages,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          availability: data.availability,
          availableNow: data.availableNow,
          tagline: data.tagline,
          experienceLevel: data.experienceLevel,
          category: data.category,
          portfolioProjects: portfolioProjects.length > 0 ? portfolioProjects : null,
        },
      });
    },
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/check-readiness"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-status"] });
      fireConfetti();
      if (user?.id) {
        try {
          await saveFreelancerProfile({ userId: user.id, fullName: `${formData.firstName} ${formData.lastName}`.trim() || user.displayName || "Freelancer", profilePhotoUrl: formData.photo || "", bio: formData.bio, title: formData.title, skills: formData.skills, expertise: [], categories: formData.category ? [formData.category] : [], hourlyRate: formData.hourlyRate ? Math.round(parseFloat(formData.hourlyRate) * 100) : 0, location: formData.location, portfolioLinks: formData.portfolioUrl ? [formData.portfolioUrl] : [], experienceLevel: formData.experienceLevel, availability: formData.availability, role: "freelancer", onboardingCompleted: true, publishedProfile: true });
        } catch {}
      }
      // CRITICAL: mark onboarding completed so carousel never shows again
      localStorage.setItem("onboarding_completed", "true");
      try {
        const pts = await earnPoints("profile_complete", user?.id ?? "");
        if (pts?.success) toast({ title: `+${pts.points} points earned!`, description: "Keep building your profile to unlock more rewards." });
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
    setPhase("parsing"); setParseScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1; setParseScanStep(step);
      if (step >= AI_PARSE_STEPS.length) {
        clearInterval(interval);
        if (uploadedFileRef) { const fd = new window.FormData(); fd.append("cv", uploadedFileRef); uploadFileMutation.mutate(fd); }
        else parseMutation.mutate(cvText || "Sample CV text for profile building");
      }
    }, 500);
  };

  const loadSampleCV = () => { setCvText(`John Doe\nSenior Full Stack Developer | Cape Town, South Africa\njohn.doe@email.com | +27 82 123 4567`); setUploadedFile(null); };

  const updateField = (key: keyof ProfileFormData, value: any) => setFormData((p) => ({ ...p, [key]: value }));
  const addSkill = (s: string) => { if (s && !formData.skills.includes(s)) updateField("skills", [...formData.skills, s]); };
  const removeSkill = (s: string) => updateField("skills", formData.skills.filter((x) => x !== s));
  const toggleLanguage = (l: string) => updateField("languages", formData.languages.includes(l) ? formData.languages.filter((x) => x !== l) : [...formData.languages, l]);

  const saveProject = async () => {
    if (!projectDraft.title.trim() || projectSaving) return;
    setProjectSaving(true);
    const item: PortfolioProject = {
      id: String(Date.now()),
      title: projectDraft.title.trim(),
      description: projectDraft.description.trim(),
      link: projectDraft.link.trim(),
      technologies: projectDraft.technologies.split(",").map((s) => s.trim()).filter(Boolean),
    };
    setPortfolioProjects((prev) => [item, ...prev]);
    setProjectModalOpen(false);
    setProjectDraft({ title: "", description: "", link: "", technologies: "" });
    toast({ title: "Project added!" });
    setProjectSaving(false);
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!user) { setLocation("/"); return null; }

  // ── UPLOAD PHASE ──────────────────────────────────────────────────────────
  if (phase === "upload") return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute top-10 right-1/4 w-64 h-64 bg-teal-500/4 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Profile Builder — Free Forever
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Turn Your CV into a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Winning Profile</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Upload your CV and AI extracts your skills, writes your bio, benchmarks your rate — profile ready in 60 seconds.
              </p>

              {/* Step breadcrumb */}
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {["Upload CV", "AI Extracts", "Review & Edit", "Go Live"].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 px-3 py-1.5 rounded-full text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      {s}
                    </div>
                    {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Input cards */}
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {/* Upload card */}
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Upload CV</p>
                    <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT</p>
                  </div>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex-1 min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                    dragOver ? "border-emerald-400 bg-emerald-500/5" : uploadedFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-700 hover:border-emerald-500/40 hover:bg-slate-800/50"
                  )}
                  data-testid="upload-dropzone"
                >
                  {uploadedFile ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                      <p className="text-sm font-semibold text-emerald-400">{uploadedFile}</p>
                      <p className="text-xs text-slate-500 mt-1">Ready to extract</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">Drop file here</p>
                      <p className="text-xs text-slate-600 mt-1">or click to browse</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} data-testid="input-cv-file" />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 text-xs border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400" data-testid="btn-upload-cv">
                    <Upload className="w-3.5 h-3.5 mr-1" /> Choose File
                  </Button>
                  <Button variant="ghost" onClick={loadSampleCV} className="flex-1 text-xs text-slate-500 hover:text-slate-300" data-testid="btn-load-sample">
                    Try Sample
                  </Button>
                </div>
              </div>

              {/* Paste card */}
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Paste CV Text</p>
                      <p className="text-xs text-slate-500">Works with any format</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPaste((v) => !v)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors" data-testid="btn-toggle-paste">
                    {showPaste ? "Hide" : "Show"}
                  </button>
                </div>
                {showPaste ? (
                  <Textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    className="flex-1 min-h-[140px] bg-slate-800 border-slate-700 text-white text-sm resize-none focus:border-emerald-500/50 placeholder:text-slate-600"
                    placeholder="Paste your CV text here — name, experience, skills, education..."
                    data-testid="textarea-cv-paste"
                  />
                ) : (
                  <div
                    className="flex-1 min-h-[140px] rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/40 transition-colors"
                    onClick={() => setShowPaste(true)}
                  >
                    <FileText className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">Click to paste CV text</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="mt-3 text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700"
                  onClick={() => { setManualMode(true); setPhase("review"); }}
                  data-testid="btn-manual-mode"
                >
                  Skip — fill in manually
                </Button>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-10 h-14 text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                onClick={startParsing}
                disabled={!cvText.trim() && !uploadedFile}
                data-testid="btn-extract-ai"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {uploadedFile ? `Analyse "${uploadedFile}"` : cvText.trim() ? "Extract Profile with AI" : "Upload or Paste CV First"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <p className="text-xs text-slate-600 mt-3">Free forever · No credit card · 60-second setup</p>
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {[
                { icon: ShieldCheck, label: "ID Verified" },
                { icon: Zap, label: "60-sec Setup" },
                { icon: Star, label: "AI-Written Bio" },
                { icon: TrendingUp, label: "Rate Benchmark" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  // ── PARSING PHASE ─────────────────────────────────────────────────────────
  if (phase === "parsing") return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 max-w-md text-center" data-testid="section-parsing">
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Brain className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 animate-ping" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">AI is building your profile</h2>
          <p className="text-slate-400 mb-8 text-sm">
            {AI_PARSE_STEPS[Math.min(parseScanStep, AI_PARSE_STEPS.length - 1)]?.label || "Parsing..."}
          </p>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((parseScanStep / AI_PARSE_STEPS.length) * 100, 100)}%` }}
            />
          </div>
          <div className="space-y-2.5 text-left">
            {AI_PARSE_STEPS.map((step, idx) => {
              const done = parseScanStep > idx;
              const active = parseScanStep === idx;
              return (
                <div key={step.label} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all", active && "bg-emerald-500/10 border border-emerald-500/20")} data-testid={`parse-step-${idx}`}>
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", done ? "bg-emerald-500" : active ? "bg-emerald-500/30 border border-emerald-500/50" : "bg-slate-800")}>
                    {done ? <CheckCheck className="w-3 h-3 text-slate-950" /> : active ? <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" /> : null}
                  </div>
                  <span className={cn("text-sm", done ? "text-emerald-400 font-medium" : active ? "text-white font-semibold" : "text-slate-600")}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );

  // ── REVIEW PHASE ──────────────────────────────────────────────────────────
  const currentStepIdx = WIZARD_STEPS.findIndex((s) => s.id === activeTab);

  const goNext = () => {
    if (currentStepIdx < WIZARD_STEPS.length - 1) setActiveTab(WIZARD_STEPS[currentStepIdx + 1].id);
  };
  const goPrev = () => {
    if (currentStepIdx > 0) setActiveTab(WIZARD_STEPS[currentStepIdx - 1].id);
  };

  const saveProfile = () => profileMutation.mutate(formData);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Sticky progress header */}
      <div className="sticky top-16 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 shadow-lg" data-testid="review-header">
        <div className="container mx-auto px-4 md:px-6 py-3 max-w-5xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <StepIndicator currentStep={activeTab} onStep={setActiveTab} />
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", completionScore >= 70 ? "bg-emerald-400" : "bg-amber-400")} />
                <span className={cn("text-xs font-bold", completionScore >= 70 ? "text-emerald-400" : "text-amber-400")}>
                  {completionScore}% — {scoreLabel}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setPhase("upload"); setFormData(defaultForm); }} className="text-xs text-slate-500 hover:text-slate-300" data-testid="btn-start-over">
                <RefreshCw className="w-3 h-3 mr-1" /> Restart
              </Button>
            </div>
          </div>
          <div className="mt-2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${completionScore}%` }} />
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">

            {/* ── Left: Form ── */}
            <div>

              {/* BASICS */}
              {activeTab === "basics" && (
                <div className="space-y-5" data-testid="tab-content-basics">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Personal Information</h2>
                    <p className="text-slate-500 text-sm">This is what clients see first on your profile.</p>
                  </div>

                  {/* Photo */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Label className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" /> Profile Photo
                    </Label>
                    <div className="flex items-center gap-5">
                      <div
                        className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                        onClick={() => photoInputRef.current?.click()}
                        data-testid="photo-upload-zone"
                      >
                        {formData.photo ? <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-600" />}
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { setPhotoFile(file); setPhotoUploading(true); try { const fd = new FormData(); fd.append("photo", file); await syncSessionNow(); const res = await apiFetch("/api/profile/upload-photo", { method: "POST", body: fd }); const json = await res.json(); if (json.success && json.photoUrl) { updateField("photo", json.photoUrl); toast({ title: "Photo uploaded!", description: "Your profile photo is ready." }); } else { throw new Error(json.message || "Upload failed"); } } catch (err: any) { toast({ variant: "destructive", title: "Photo upload failed", description: err?.message || "Please try again." }); } finally { setPhotoUploading(false); } } }} data-testid="input-photo" />
                      <div>
                        <Button size="sm" variant="outline" onClick={() => photoInputRef.current?.click()} className="border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400" data-testid="btn-upload-photo">
                          <Camera className="w-3.5 h-3.5 mr-1" /> Upload Photo
                        </Button>
                        <p className="text-xs text-slate-600 mt-1.5">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Name + title */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-400 mb-1.5 block">First Name *</Label>
                        <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Sipho" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-first-name" />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400 mb-1.5 block">Last Name *</Label>
                        <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Mkhize" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-last-name" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 block">Professional Title *</Label>
                      <Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Senior Full-Stack Developer" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-title" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 block">One-line Tagline</Label>
                      <Input value={formData.tagline} onChange={(e) => updateField("tagline", e.target.value)} placeholder="I build fast, scalable apps that clients love" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-tagline" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs text-slate-400">Professional Bio *</Label>
                        <button
                          className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
                          onClick={() => updateField("bio", `Experienced ${formData.title || "professional"} based in ${formData.location || "South Africa"} with a track record of delivering high-quality work on time and within budget.`)}
                          data-testid="btn-ai-bio"
                        >
                          <Sparkles className="w-3 h-3" /> AI Generate
                        </button>
                      </div>
                      <Textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Describe your experience, what you do best, and what makes you stand out..." className="min-h-[120px] resize-none bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="textarea-bio" />
                      <p className="text-xs text-slate-600 mt-1.5">{formData.bio.length}/500 — aim for 150+ characters</p>
                    </div>
                  </div>

                  {/* Category + Experience */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-400 mb-1.5 block">Service Category *</Label>
                        <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>{SERVICE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400 mb-1.5 block">Experience Level *</Label>
                        <Select value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-experience"><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level (0–2 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (2–5 years)</SelectItem>
                            <SelectItem value="expert">Expert / Senior (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 block">Location</Label>
                      <Select value={formData.location} onValueChange={(v) => updateField("location", v)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-location"><SelectValue placeholder="Select your city" /></SelectTrigger>
                        <SelectContent>{SA_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-2 block">Languages Spoken</Label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES_LIST.map((l) => (
                          <button
                            key={l}
                            onClick={() => toggleLanguage(l)}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", formData.languages.includes(l) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300")}
                            data-testid={`btn-lang-${l.toLowerCase()}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button onClick={goNext} className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black" data-testid="btn-next-skills">
                    Next: Skills <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* SKILLS */}
              {activeTab === "skills" && (
                <div className="space-y-5" data-testid="tab-content-skills">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Skills & Expertise</h2>
                    <p className="text-slate-500 text-sm">Add the skills clients will search for when hiring you.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Label className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" /> Your Skills
                      <span className="ml-auto text-xs text-slate-500 font-normal">{formData.skills.length} added</span>
                    </Label>
                    <div className={cn("flex flex-wrap gap-2 min-h-[72px] p-4 bg-slate-800/60 rounded-xl border-2 border-dashed mb-4 transition-colors", formData.skills.length === 0 ? "border-slate-700" : "border-emerald-500/20")} data-testid="skills-container">
                      {formData.skills.length === 0 && <p className="text-xs text-slate-600 self-center">Add skills below or pick from AI suggestions</p>}
                      {formData.skills.map((s, i) => (
                        <Badge key={i} className="pl-3 pr-1 py-1.5 gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" data-testid={`badge-skill-${i}`}>
                          {s}
                          <button onClick={() => removeSkill(s)} className="ml-1 hover:bg-emerald-500/30 rounded-full p-0.5" data-testid={`btn-remove-skill-${i}`}><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { addSkill(skillInput.trim()); setSkillInput(""); } }}
                        placeholder="Type a skill and press Enter..."
                        className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50"
                        data-testid="input-skill"
                      />
                      <Button size="sm" variant="outline" onClick={() => { addSkill(skillInput.trim()); setSkillInput(""); }} className="border-slate-700 hover:border-emerald-500/40 px-3" data-testid="btn-add-skill">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-5">
                    <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> AI Skill Suggestions
                      {formData.category && <span className="text-xs text-slate-500 font-normal">for {formData.category}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skillSuggestions.filter((s) => !formData.skills.includes(s)).map((s) => (
                        <button key={s} onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 transition-all" data-testid={`btn-suggest-${s.toLowerCase().replace(/[.\s]/g, "-")}`}>
                          <Plus className="w-3 h-3 inline mr-0.5" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <Label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" /> Certifications
                    </Label>
                    <Textarea value={formData.certifications} onChange={(e) => updateField("certifications", e.target.value)} placeholder="AWS Solutions Architect (2023), Google Analytics Certified (2022)..." className="min-h-[80px] resize-none bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="textarea-certifications" />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goPrev} className="flex-1 border-slate-700 text-slate-300 hover:border-slate-600" data-testid="btn-back-basics">← Basics</Button>
                    <Button onClick={goNext} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-testid="btn-next-portfolio">Portfolio →</Button>
                  </div>
                </div>
              )}

              {/* PORTFOLIO */}
              {activeTab === "portfolio" && (
                <div className="space-y-5" data-testid="tab-content-portfolio">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Portfolio & Links</h2>
                    <p className="text-slate-500 text-sm">Showcase your work and online presence.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <Label className="text-sm font-semibold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" /> Online Presence
                    </Label>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 block"><Globe className="w-3 h-3 text-slate-500" /> Portfolio Website</Label>
                      <Input value={formData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.co.za" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-portfolio-url" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 block"><Linkedin className="w-3 h-3 text-[#0A66C2]" /> LinkedIn Profile</Label>
                      <Input value={formData.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourname" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-linkedin" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 block"><Github className="w-3 h-3 text-slate-400" /> GitHub Profile</Label>
                      <Input value={formData.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} placeholder="https://github.com/yourname" className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50" data-testid="input-github" />
                    </div>
                  </div>

                  {/* Portfolio projects */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-semibold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" /> Portfolio Projects
                        <span className="text-xs text-slate-500 font-normal">{portfolioProjects.length} added</span>
                      </Label>
                      <Button size="sm" variant="outline" onClick={() => setProjectModalOpen(true)} className="border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400" data-testid="btn-add-portfolio">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                      </Button>
                    </div>
                    {portfolioProjects.length === 0 ? (
                      <div className="text-center py-8 text-slate-600">
                        <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No projects yet — add your best work</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {portfolioProjects.map((p) => (
                          <div key={p.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                            <p className="font-semibold text-white text-sm">{p.title}</p>
                            {p.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>}
                            {p.technologies.length > 0 && (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {p.technologies.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">{t}</span>)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goPrev} className="flex-1 border-slate-700 text-slate-300 hover:border-slate-600" data-testid="btn-back-skills">← Skills</Button>
                    <Button onClick={goNext} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-testid="btn-next-rates">Rates →</Button>
                  </div>
                </div>
              )}

              {/* RATES */}
              {activeTab === "rates" && (
                <div className="space-y-5" data-testid="tab-content-rates">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Your Rates & Availability</h2>
                    <p className="text-slate-500 text-sm">Set a competitive rate based on your experience and the market.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                    {formData.category && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs font-semibold text-blue-400 mb-3 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" /> Market Rate Benchmark for {formData.category}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-500 text-xs">R{marketRate.low}/hr</span>
                          <div className="flex-1 h-2.5 rounded-full bg-slate-800 relative overflow-hidden">
                            <div className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: "60%", left: "20%" }} />
                          </div>
                          <span className="text-slate-500 text-xs">R{marketRate.high}/hr</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Similar freelancers charge <strong className="text-white">R{marketRate.avg}/hr</strong> on average</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 block">Hourly Rate (ZAR) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R</span>
                        <Input type="number" value={formData.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} placeholder={marketRate.avg.toString()} className="pl-8 bg-slate-800 border-slate-700 text-white text-lg font-bold focus:border-emerald-500/50" data-testid="input-hourly-rate" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5">You can always change this later</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <Label className="text-sm font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" /> Availability
                    </Label>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <div>
                        <p className="text-sm font-semibold text-white">Available Now</p>
                        <p className="text-xs text-slate-500">Shows a green "Open to Work" badge on your profile</p>
                      </div>
                      <Switch checked={formData.availableNow} onCheckedChange={(v) => updateField("availableNow", v)} data-testid="switch-available-now" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1.5 block">Availability Status</Label>
                      <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-availability">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{AVAILABILITY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goPrev} className="flex-1 border-slate-700 text-slate-300 hover:border-slate-600" data-testid="btn-back-portfolio">← Portfolio</Button>
                    <Button onClick={goNext} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-testid="btn-next-preview">Preview & Go Live →</Button>
                  </div>
                </div>
              )}

              {/* PREVIEW / GO LIVE */}
              {activeTab === "preview" && (
                <div className="space-y-5" data-testid="tab-content-preview">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Ready to Go Live?</h2>
                    <p className="text-slate-500 text-sm">Review your profile preview and publish when ready.</p>
                  </div>

                  {/* Big preview */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> PREVIEW — not published yet
                      </p>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", completionScore >= 70 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                        {completionScore}% complete
                      </span>
                    </div>
                    <LivePreviewCard formData={formData} />
                  </div>

                  {/* Missing tips */}
                  {completionTips.length > 0 && completionScore < 100 && (
                    <div className={cn("rounded-2xl p-5", completionScore >= 70 ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-amber-950/30 border border-amber-500/20")}>
                      <p className={cn("text-sm font-semibold mb-3 flex items-center gap-2", completionScore >= 70 ? "text-emerald-400" : "text-amber-400")}>
                        {completionScore >= 70 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {completionScore >= 70 ? "Looking good — a few more improvements:" : `Need ${70 - completionScore}% more to unlock Go Live`}
                      </p>
                      <div className="space-y-1.5">
                        {completionTips.slice(0, 5).map((tip) => (
                          <div key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="text-slate-600 mt-0.5">•</span> {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Go Live CTA */}
                  <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">Publish Your Profile</p>
                        <p className="text-xs text-slate-500">50,000+ clients searching for talent right now</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      {["Profile visible to 50K+ verified clients", "AI-matched to relevant job postings", "Earn points toward rewards + Pro status"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {item}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
                      onClick={saveProfile}
                      disabled={profileMutation.isPending || completionScore < 70}
                      title={completionScore < 70 ? `Reach 70% profile strength to go live (currently ${completionScore}%)` : ""}
                      data-testid="btn-go-live"
                    >
                      {profileMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing your profile...</>
                      ) : completionScore < 70 ? (
                        <><AlertCircle className="w-5 h-5 mr-2" /> Complete to {70}% to Go Live ({completionScore}% now)</>
                      ) : (
                        <><Rocket className="w-5 h-5 mr-2" /> Go Live — Publish My Profile</>
                      )}
                    </Button>
                    <p className="text-xs text-center text-slate-600 mt-3">Free forever · You can edit anytime after publishing</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goPrev} className="flex-1 border-slate-700 text-slate-300 hover:border-slate-600" data-testid="btn-back-rates">← Rates</Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Live Preview ── */}
            <div className="hidden lg:block">
              <div className="sticky top-[140px] space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Live Preview</p>
                <LivePreviewCard formData={formData} />
                <ProfileStrengthMeter data={formData} />
                {completionScore >= 70 && (
                  <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">Ready to go live!</p>
                    <p className="text-xs text-slate-500 mt-1">Head to the Preview tab to publish</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Add Project Modal */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Add Portfolio Project</h3>
                <button onClick={() => setProjectModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors" data-testid="btn-close-project">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input placeholder="Project Title *" value={projectDraft.title} onChange={(e) => setProjectDraft((p) => ({ ...p, title: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" data-testid="input-project-title" />
                <Textarea placeholder="Short description of what you built and your role..." value={projectDraft.description} onChange={(e) => setProjectDraft((p) => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-slate-700 text-white resize-none min-h-[80px]" data-testid="textarea-project-description" />
                <Input placeholder="Project URL (optional)" value={projectDraft.link} onChange={(e) => setProjectDraft((p) => ({ ...p, link: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" data-testid="input-project-link" />
                <Input placeholder="Technologies used, comma separated (React, Node.js...)" value={projectDraft.technologies} onChange={(e) => setProjectDraft((p) => ({ ...p, technologies: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" data-testid="input-project-tech" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-slate-700 text-slate-300" onClick={() => setProjectModalOpen(false)} data-testid="btn-cancel-project">Cancel</Button>
                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" onClick={saveProject} disabled={projectSaving} data-testid="btn-save-project">
                  {projectSaving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving...</> : "Save Project"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

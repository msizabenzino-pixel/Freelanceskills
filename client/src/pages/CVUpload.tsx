import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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

// ─── PROFILE COMPLETION SCORER ────────────────────────────────────────────
function calcCompletion(data: FormData): { score: number; tips: string[] } {
  const tips: string[] = [];
  let score = 0;
  if (data.firstName && data.lastName) score += 10; else tips.push("Add your full name");
  if (data.title) score += 10; else tips.push("Add a professional title");
  if (data.bio && data.bio.length > 80) score += 15; else tips.push("Write a bio (80+ characters)");
  if (data.skills.length >= 5) score += 15; else tips.push(`Add ${5 - data.skills.length} more skills`);
  if (data.category) score += 10; else tips.push("Select your service category");
  if (data.hourlyRate) score += 10; else tips.push("Set your hourly rate");
  if (data.location) score += 5; else tips.push("Add your location");
  if (data.photo) score += 10; else tips.push("Upload a profile photo");
  if (data.portfolioUrl) score += 5; else tips.push("Add a portfolio link");
  if (data.languages.length > 0) score += 5; else tips.push("Add languages you speak");
  if (data.availability) score += 5; else tips.push("Set your availability");
  return { score, tips };
}

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { score: completionScore, tips: completionTips } = calcCompletion(formData);
  const marketRate = MARKET_RATES[formData.category] ?? MARKET_RATES.default;
  const skillSuggestions = SKILL_SUGGESTIONS[formData.category] ?? SKILL_SUGGESTIONS.default;

  // ── File handling — store raw file ref, don't try to read binary PDF/DOCX as text
  const handleFile = useCallback((file: File) => {
    setUploadedFile(file.name);
    setUploadedFileRef(file);
    // Only read plaintext files as text; let the server handle PDF/DOCX
    const isPdfOrDoc = /\.(pdf|docx?)/i.test(file.name) ||
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isPdfOrDoc) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCvText(text || "");
      };
      reader.readAsText(file);
    }
    // For PDF/DOCX, we leave cvText empty — server will parse on /api/cv/upload
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((p) => ({ ...p, photo: url }));
    }
  };

  // ── Parse mutation
  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/cv/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cvText: text }),
      });
      if (res.status === 401) {
        throw new Error("401:Please sign in before parsing your CV.");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        throw new Error(body?.message || "CV parsing failed — please try again.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        title: data.title || "",
        bio: data.bio || "",
        skills: data.skills || [],
        hourlyRate: data.hourlyRate?.toString() || "",
        location: data.location || "",
        experienceLevel: data.experienceLevel || "",
        category: data.category || "",
        certifications: data.certifications || "",
      }));
      toast({ title: "AI extracted your profile!", description: "Review the details below and make any adjustments." });
      setPhase("review");
    },
    onError: (error: Error) => {
      const is401 = error.message.startsWith("401:");
      if (is401) {
        toast({
          variant: "destructive",
          title: "Sign in required",
          description: "Please sign in or create an account, then try again.",
        });
      } else {
        // Non-401 failure: fall through to manual form with a helpful message
        toast({
          title: "AI extraction unavailable",
          description: "Fill in your details below — it only takes 2 minutes.",
        });
      }
      setPhase("review");
    },
  });

  // ── File upload mutation (PDF/DOCX → server parsing → profile data)
  const uploadFileMutation = useMutation({
    mutationFn: async (fd: globalThis.FormData) => {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        credentials: "include",
        body: fd, // no Content-Type header — browser sets multipart boundary
      });
      if (res.status === 401) throw new Error("401:Please sign in before uploading your CV.");
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        throw new Error(body?.message || "File upload failed — please try again.");
      }
      return res.json();
    },
    onSuccess: (result) => {
      const data = result.data || {};
      setFormData((prev) => ({
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
      }));
      if (result.success) {
        toast({ title: "CV parsed!", description: `Extracted ${result.extractedLength ?? "?"} characters. Review your profile details below.` });
      } else {
        toast({ title: "Partial extraction", description: result.message || "Fill in any missing fields below." });
      }
      setPhase("review");
    },
    onError: (error: Error) => {
      const is401 = error.message.startsWith("401:");
      toast({
        variant: "destructive",
        title: is401 ? "Sign in required" : "Upload failed",
        description: is401 ? "Please sign in and try again." : error.message,
      });
      setPhase("upload");
    },
  });

  // ── Profile save mutation
  const profileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!data.firstName || !data.lastName || !data.title || !data.category) {
        throw new Error("Please fill in your Name, Title and Category before going live.");
      }
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          userType: "freelancer",
          bio: data.bio,
          title: data.title,
          skills: data.skills,
          hourlyRate: data.hourlyRate ? parseInt(data.hourlyRate) * 100 : 0,
          location: data.location,
          isPro: false,
        }),
      });
      if (res.status === 401) {
        throw new Error("401:Your session expired. Please sign in again to publish your profile.");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        throw new Error(body?.message || "Profile creation failed — please try again.");
      }
      return res.json();
    },
    onSuccess: async () => {
      // 1 — Publish profile (flip publishedProfile flag)
      await fetch("/api/profile/publish", { method: "POST", credentials: "include" }).catch(() => {});
      // 2 — Award 50 points for completing profile
      const pts = await earnPoints("profile_complete", user?.id ?? "");
      if (pts?.success) {
        toast({
          title: `+${pts.points} points earned! 🎉`,
          description: "You earned points for completing your profile.",
        });
      }
      // 3 — Success nav
      toast({
        title: "Profile live!",
        description: "Your profile is now visible to employers on FreelanceSkills.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      const is401 = error.message.startsWith("401:");
      toast({
        variant: "destructive",
        title: is401 ? "Session expired" : "Could not publish profile",
        description: is401
          ? "Please sign in again and then click Go Live."
          : error.message,
      });
    },
  });

  // ── Start AI parse — routes through /api/cv/upload for binary files,
  //    /api/cv/parse for pasted text
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
          // Real file — send via multipart to /api/cv/upload
          const fd = new window.FormData();
          fd.append("cv", uploadedFileRef);
          uploadFileMutation.mutate(fd);
        } else {
          parseMutation.mutate(cvText || "Sample CV text for profile building");
        }
      }
    }, 500);
  };

  // ── Use sample CV
  const loadSampleCV = () => {
    const sample = `John Doe
Senior Full Stack Developer | Cape Town, South Africa
john.doe@email.com | +27 82 123 4567 | linkedin.com/in/johndoe

SUMMARY
Experienced full-stack developer with 6 years building scalable web applications using React, Node.js and PostgreSQL. Worked with fintech and e-commerce clients across South Africa and remotely for UK companies. Delivered 40+ projects on time and within budget.

SKILLS
React, Next.js, TypeScript, Node.js, PostgreSQL, AWS, Docker, Tailwind CSS, Git, REST APIs, GraphQL, Redis

EXPERIENCE
Senior Developer — Shopify agency, Cape Town (2022–Present)
• Built headless e-commerce storefronts for 15+ SA retailers
• Reduced page load times by 60% using Next.js and edge caching

Full Stack Developer — FinTech startup, Remote (2019–2022)
• Developed mobile money integration for 3 African markets
• Led team of 4 developers, delivered 8 major product releases

EDUCATION
BSc Computer Science — University of Cape Town (2018)

CERTIFICATIONS
AWS Solutions Architect Associate (2023)
Google Professional Cloud Developer (2022)`;
    setCvText(sample);
    setUploadedFile(null);
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!user) { setLocation("/"); return null; }

  // ════════════ PHASE: UPLOAD ════════════
  if (phase === "upload") return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="animated-gradient-bg text-white pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-white/10 border-white/20 text-white text-sm" data-testid="badge-hero">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> AI-Powered Profile Builder
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-5 leading-tight" data-testid="text-hero-title">
                Turn Your CV into a<br className="hidden md:block" />
                <span className="text-emerald-400"> Winning Profile</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                Upload or paste your CV — our AI extracts your skills, writes your bio, benchmarks your rate and builds your profile in seconds.
              </p>
              {/* Steps */}
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-white/70">
                {["Upload CV", "AI Extracts", "Review & Improve", "Go Live"].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                      <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {s}
                    </div>
                    {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Drag-drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-10 text-center ${
                  dragOver ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]" :
                  uploadedFile ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-emerald-400/50 hover:bg-muted/50"
                }`}
                data-testid="upload-dropzone"
              >
                <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} data-testid="input-file-upload" />
                {uploadedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{uploadedFile}</p>
                    <p className="text-sm text-emerald-600 font-medium mt-1">✓ File ready for AI analysis</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setCvText(""); }} className="mt-3 text-xs text-muted-foreground hover:text-destructive">Remove</button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground mb-1">Drop your CV here</p>
                    <p className="text-muted-foreground text-sm mb-4">PDF, Word or plain text · or click to browse</p>
                    <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" data-testid="btn-browse-files">
                      Browse Files
                    </Button>
                  </>
                )}
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or paste text</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Paste area */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" /> Paste your CV content
                    </Label>
                    <button onClick={loadSampleCV} className="text-xs text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1" data-testid="btn-load-sample">
                      <Sparkles className="w-3 h-3" /> Try a sample CV
                    </button>
                  </div>
                  <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste the text from your PDF or Word document CV here. Include your name, skills, experience, and contact details for best results..."
                    className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none text-sm"
                    data-testid="textarea-cv-paste"
                  />
                  {cvText && (
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{cvText.length} characters · approximately {Math.round(cvText.split(" ").length / 200)} min read</span>
                      <button onClick={() => setCvText("")} className="hover:text-destructive">Clear</button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                onClick={startParsing}
                disabled={!cvText.trim() && !uploadedFile}
                data-testid="btn-extract-ai"
              >
                <Sparkles className="w-5 h-5" />
                Extract Profile with AI
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
                {[
                  { icon: Shield, label: "POPIA Compliant", sub: "Your data is safe" },
                  { icon: Zap, label: "Instant Results", sub: "Under 10 seconds" },
                  { icon: Star, label: "47K+ Profiles", sub: "Already built" },
                ].map((t) => (
                  <div key={t.label} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <t.icon className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="font-semibold text-foreground">{t.label}</p>
                    <p>{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  // ════════════ PHASE: PARSING ════════════
  if (phase === "parsing") return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center" data-testid="section-parsing">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 relative">
              <Brain className="w-12 h-12 text-emerald-500" />
              {parseScanStep < AI_PARSE_STEPS.length && (
                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/40 animate-ping" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">AI is building your profile</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              {parseScanStep < AI_PARSE_STEPS.length
                ? AI_PARSE_STEPS[parseScanStep]?.label + "..."
                : "Finalising your profile..."}
            </p>

            <div className="space-y-3 text-left mb-8">
              {AI_PARSE_STEPS.map((step, idx) => {
                const done = parseScanStep > idx;
                const active = parseScanStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? "bg-emerald-500/10" : active ? "bg-primary/5" : "opacity-30"}`}
                    data-testid={`parse-step-${idx}`}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      : active ? <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                      : <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />}
                    <span className={`text-sm ${done ? "text-emerald-700 dark:text-emerald-400 font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {done && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}
                  </div>
                );
              })}
            </div>

            <Progress value={(parseScanStep / AI_PARSE_STEPS.length) * 100} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-3">{Math.min(Math.round((parseScanStep / AI_PARSE_STEPS.length) * 100), 99)}% complete</p>
          </div>
        </div>
      </main>
    </div>
  );

  // ════════════ PHASE: REVIEW ════════════
  const updateField = (key: keyof FormData, value: any) => setFormData((p) => ({ ...p, [key]: value }));
  const addSkill = (s: string) => { if (s && !formData.skills.includes(s)) updateField("skills", [...formData.skills, s]); };
  const removeSkill = (s: string) => updateField("skills", formData.skills.filter((x) => x !== s));
  const toggleLanguage = (l: string) => updateField("languages", formData.languages.includes(l) ? formData.languages.filter((x) => x !== l) : [...formData.languages, l]);

  const scoreColor = completionScore >= 80 ? "text-emerald-500" : completionScore >= 50 ? "text-amber-500" : "text-red-500";
  const scoreLabel = completionScore >= 80 ? "Strong" : completionScore >= 50 ? "Good" : "Weak";

  const TABS = [
    { id: "basics", label: "Basics", icon: User },
    { id: "skills", label: "Skills", icon: Target },
    { id: "portfolio", label: "Portfolio", icon: Globe },
    { id: "rates", label: "Rates", icon: DollarSign },
    { id: "preview", label: "Preview", icon: Eye },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Review header */}
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
              {/* Completion score */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className={`text-sm font-bold ${scoreColor}`}>{completionScore}% — {scoreLabel}</p>
                  <p className="text-xs text-muted-foreground">Profile strength</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-border flex items-center justify-center relative" data-testid="completion-ring">
                  <span className={`text-xs font-bold ${scoreColor}`}>{completionScore}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setPhase("upload"); setFormData(defaultForm); }} data-testid="btn-start-over" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" /> Start over
                </Button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="max-w-5xl mx-auto mt-2">
              <Progress value={completionScore} className="h-1.5" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_340px] gap-8">

              {/* ── LEFT: Tabbed form ── */}
              <div>
                {/* Tab bar */}
                <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-6 overflow-x-auto" data-testid="tab-bar">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`tab-${tab.id}`}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* ══ TAB: BASICS ══ */}
                {activeTab === "basics" && (
                  <div className="space-y-6" data-testid="tab-content-basics">
                    {/* Photo */}
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <Label className="text-sm font-semibold mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-500" /> Profile Photo</Label>
                        <div className="flex items-center gap-5">
                          <div
                            className="w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => photoInputRef.current?.click()}
                            data-testid="photo-upload-zone"
                          >
                            {formData.photo ? <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted-foreground/50" />}
                          </div>
                          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} data-testid="input-photo" />
                          <div>
                            <Button size="sm" variant="outline" onClick={() => photoInputRef.current?.click()} data-testid="btn-upload-photo">Upload Photo</Button>
                            <p className="text-xs text-muted-foreground mt-2">Profiles with photos get 3× more views</p>
                            <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Name */}
                    <Card className="border-border">
                      <CardContent className="p-6 space-y-5">
                        <Label className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> Personal Information</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">First Name *</Label>
                            <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Sipho" data-testid="input-first-name" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Last Name *</Label>
                            <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Mkhize" data-testid="input-last-name" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Professional Title *</Label>
                          <Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Senior Full-Stack Developer" data-testid="input-title" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">One-line Tagline</Label>
                          <Input value={formData.tagline} onChange={(e) => updateField("tagline", e.target.value)} placeholder="e.g. I build fast, scalable apps that clients love" data-testid="input-tagline" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs text-muted-foreground">Professional Bio *</Label>
                            <button className="text-xs text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1" onClick={() => updateField("bio", `Experienced ${formData.title || "professional"} based in ${formData.location || "South Africa"} with a track record of delivering high-quality work. ${formData.skills.slice(0, 3).join(", ")} specialist committed to exceeding client expectations.`)} data-testid="btn-ai-bio">
                              <Sparkles className="w-3 h-3" /> AI Regenerate
                            </button>
                          </div>
                          <Textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Describe your experience, specialisation and what makes you stand out..." className="min-h-[120px] resize-none" data-testid="textarea-bio" />
                          <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 · {formData.bio.length >= 80 ? "✓ Good length" : `Write ${80 - formData.bio.length} more characters`}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Phone Number</Label>
                          <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+27 82 123 4567" data-testid="input-phone" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category + experience */}
                    <Card className="border-border">
                      <CardContent className="p-6 space-y-5">
                        <Label className="text-sm font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500" /> Category & Experience</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Service Category *</Label>
                            <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                              <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                              <SelectContent>
                                {SERVICE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Experience Level *</Label>
                            <Select value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)}>
                              <SelectTrigger data-testid="select-experience"><SelectValue placeholder="Select level" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entry">Entry Level (0–2 years)</SelectItem>
                                <SelectItem value="intermediate">Intermediate (2–5 years)</SelectItem>
                                <SelectItem value="expert">Expert / Senior (5+ years)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Location</Label>
                          <Select value={formData.location} onValueChange={(v) => updateField("location", v)}>
                            <SelectTrigger data-testid="select-location"><SelectValue placeholder="Select location" /></SelectTrigger>
                            <SelectContent>
                              {SA_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Languages</Label>
                          <div className="flex flex-wrap gap-2">
                            {LANGUAGES_LIST.map((l) => (
                              <button key={l} onClick={() => toggleLanguage(l)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.languages.includes(l) ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "border-border text-muted-foreground hover:border-emerald-400/50"}`} data-testid={`btn-lang-${l}`}>
                                {formData.languages.includes(l) ? "✓ " : ""}{l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button className="w-full gap-2" onClick={() => setActiveTab("skills")} data-testid="btn-next-skills">
                      Next: Skills <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* ══ TAB: SKILLS ══ */}
                {activeTab === "skills" && (
                  <div className="space-y-6" data-testid="tab-content-skills">
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <Label className="text-sm font-semibold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-emerald-500" /> Your Skills ({formData.skills.length})</Label>
                        <div className={`flex flex-wrap gap-2 min-h-[60px] p-4 bg-muted/30 rounded-xl border-2 border-dashed mb-4 ${formData.skills.length === 0 ? "border-border" : "border-emerald-500/20"}`} data-testid="skills-container">
                          {formData.skills.length === 0 && <p className="text-xs text-muted-foreground self-center">Add skills below</p>}
                          {formData.skills.map((s, i) => (
                            <Badge key={i} className="pl-3 pr-1 py-1.5 gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" data-testid={`badge-skill-${i}`}>
                              {s}
                              <button onClick={() => removeSkill(s)} className="ml-1 hover:bg-emerald-500/30 rounded-full p-0.5" data-testid={`btn-remove-skill-${i}`}><X className="w-3 h-3" /></button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addSkill(skillInput.trim()); setSkillInput(""); } }} placeholder="Type a skill and press Enter..." data-testid="input-skill" />
                          <Button size="sm" variant="outline" onClick={() => { addSkill(skillInput.trim()); setSkillInput(""); }} data-testid="btn-add-skill">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI suggestions */}
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                      <CardContent className="p-5">
                        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" /> AI Skill Suggestions
                          {formData.category && <span className="text-xs text-muted-foreground font-normal">for {SERVICE_CATEGORIES.find(c => c.id === formData.category)?.name}</span>}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skillSuggestions.filter((s) => !formData.skills.includes(s)).map((s) => (
                            <button key={s} onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/15 transition-all" data-testid={`btn-suggest-${s.toLowerCase().replace(/[.\s]/g, "-")}`}>
                              <Plus className="w-3 h-3 inline mr-0.5" /> {s}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <Label className="text-sm font-semibold flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-emerald-500" /> Certifications</Label>
                        <Textarea value={formData.certifications} onChange={(e) => updateField("certifications", e.target.value)} placeholder="AWS Solutions Architect (2023), Google Analytics Certified (2022)..." className="min-h-[80px] resize-none" data-testid="textarea-certifications" />
                      </CardContent>
                    </Card>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setActiveTab("basics")} data-testid="btn-back-basics" className="flex-1">← Basics</Button>
                      <Button onClick={() => setActiveTab("portfolio")} data-testid="btn-next-portfolio" className="flex-1">Portfolio →</Button>
                    </div>
                  </div>
                )}

                {/* ══ TAB: PORTFOLIO ══ */}
                {activeTab === "portfolio" && (
                  <div className="space-y-6" data-testid="tab-content-portfolio">
                    <Card className="border-border">
                      <CardContent className="p-6 space-y-5">
                        <Label className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> Online Presence</Label>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Portfolio Website</Label>
                          <Input value={formData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.co.za" data-testid="input-portfolio-url" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn Profile</Label>
                          <Input value={formData.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourname" data-testid="input-linkedin" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub Profile</Label>
                          <Input value={formData.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} placeholder="https://github.com/yourname" data-testid="input-github" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-border">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">Portfolio Projects</p>
                        <p className="text-xs text-muted-foreground mb-4">Add screenshots, links or descriptions of your best work</p>
                        <Button size="sm" variant="outline" data-testid="btn-add-portfolio">Add Project</Button>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setActiveTab("skills")} className="flex-1" data-testid="btn-back-skills">← Skills</Button>
                      <Button onClick={() => setActiveTab("rates")} className="flex-1" data-testid="btn-next-rates">Rates →</Button>
                    </div>
                  </div>
                )}

                {/* ══ TAB: RATES ══ */}
                {activeTab === "rates" && (
                  <div className="space-y-6" data-testid="tab-content-rates">
                    <Card className="border-border">
                      <CardContent className="p-6 space-y-5">
                        <Label className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Your Rate</Label>

                        {/* Market benchmark */}
                        {formData.category && (
                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Market Rate Benchmark</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">R{marketRate.low}</span>
                              <div className="flex-1 h-2 rounded-full bg-muted relative">
                                <div className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: "60%", left: "20%" }} />
                                {formData.hourlyRate && (
                                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-md"
                                    style={{ left: `${Math.min(Math.max(((parseInt(formData.hourlyRate) - marketRate.low) / (marketRate.high - marketRate.low)) * 100, 0), 100)}%` }} />
                                )}
                              </div>
                              <span className="text-muted-foreground">R{marketRate.high}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Similar freelancers charge <strong>R{marketRate.avg}/hr</strong> on average · Your rate:
                              <strong className="text-blue-600"> {formData.hourlyRate ? `R${formData.hourlyRate}/hr` : "not set"}</strong>
                            </p>
                          </div>
                        )}

                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Hourly Rate (ZAR) *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R</span>
                            <Input type="number" value={formData.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} placeholder={marketRate.avg.toString()} className="pl-8" data-testid="input-hourly-rate" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Clients see this rate. You can negotiate per project.</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-6 space-y-5">
                        <Label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Availability</Label>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Available Now</p>
                            <p className="text-xs text-muted-foreground">Show a green badge on your profile</p>
                          </div>
                          <Switch checked={formData.availableNow} onCheckedChange={(v) => updateField("availableNow", v)} data-testid="switch-available-now" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Availability Detail</Label>
                          <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
                            <SelectTrigger data-testid="select-availability"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {AVAILABILITY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Completion tips */}
                    {completionTips.length > 0 && (
                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-5">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {completionTips.length} ways to improve your profile
                          </p>
                          <ul className="space-y-1.5">
                            {completionTips.slice(0, 4).map((tip, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setActiveTab("portfolio")} className="flex-1" data-testid="btn-back-portfolio">← Portfolio</Button>
                      <Button onClick={() => setActiveTab("preview")} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" data-testid="btn-preview">
                        <Eye className="w-4 h-4 mr-2" /> Preview Profile
                      </Button>
                    </div>
                  </div>
                )}

                {/* ══ TAB: PREVIEW ══ */}
                {activeTab === "preview" && (
                  <div className="space-y-6" data-testid="tab-content-preview">
                    <Card className="border-emerald-500/20 overflow-hidden">
                      <div className="h-24 bg-gradient-to-r from-slate-900 to-emerald-900" />
                      <CardContent className="p-6 -mt-12">
                        <div className="flex items-end gap-4 mb-4">
                          <div className="w-20 h-20 rounded-2xl bg-muted border-4 border-background overflow-hidden">
                            {formData.photo ? <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-muted-foreground m-auto mt-4" />}
                          </div>
                          <div className="pb-1">
                            {formData.availableNow && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs mb-1">● Available Now</Badge>}
                            <h3 className="text-xl font-bold text-foreground">{formData.firstName || "Your"} {formData.lastName || "Name"}</h3>
                            <p className="text-sm text-muted-foreground">{formData.title || "Your Professional Title"}</p>
                          </div>
                        </div>
                        {formData.tagline && <p className="text-sm italic text-muted-foreground mb-3">"{formData.tagline}"</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                          {formData.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{formData.location}</span>}
                          {formData.hourlyRate && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />R{formData.hourlyRate}/hr</span>}
                          {formData.experienceLevel && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{formData.experienceLevel}</span>}
                          {formData.availability && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formData.availability}</span>}
                        </div>
                        {formData.bio && <p className="text-sm text-muted-foreground leading-relaxed mb-5">{formData.bio}</p>}
                        {formData.skills.length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs font-semibold text-foreground mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.skills.map((s, i) => <span key={i} className="px-2 py-1 rounded-full bg-primary/5 text-xs text-primary border border-primary/10">{s}</span>)}
                            </div>
                          </div>
                        )}
                        {formData.languages.length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs font-semibold text-foreground mb-2">Languages</p>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.languages.map((l) => <span key={l} className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">{l}</span>)}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {formData.portfolioUrl && <a href={formData.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"><Globe className="w-3 h-3" />Portfolio</a>}
                          {formData.linkedinUrl && <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>}
                          {formData.githubUrl && <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-foreground hover:underline"><Github className="w-3 h-3" />GitHub</a>}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Draft/Live status indicator */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Draft
                        </span>
                        <span className="text-muted-foreground text-xs">→ click Go Live to publish</span>
                      </div>
                      <span className="text-xs text-muted-foreground">+50 pts on publish</span>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-14 text-base font-bold gap-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl"
                      onClick={() => profileMutation.mutate(formData)}
                      disabled={profileMutation.isPending}
                      data-testid="btn-create-profile"
                    >
                      {profileMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing Profile...</> : <><Zap className="w-5 h-5" /> Go Live — Create My Profile <ArrowRight className="w-5 h-5" /></>}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" /> POPIA compliant · 10% platform fee only when you earn · Cancel anytime
                    </p>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Sticky sidebar ── */}
              <div className="hidden lg:block">
                <div className="sticky top-[140px] space-y-4">
                  {/* Profile strength */}
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-foreground">Profile Strength</p>
                        <span className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</span>
                      </div>
                      <Progress value={completionScore} className="h-3 mb-3" />
                      <p className={`text-2xl font-bold ${scoreColor} mb-4`}>{completionScore}%</p>
                      {completionTips.slice(0, 3).map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> {tip}
                        </div>
                      ))}
                      {completionScore === 100 && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Perfect profile! You're ready.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mini profile preview */}
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Live Preview</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center">
                          {formData.photo ? <img src={formData.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {formData.firstName || "Your"} {formData.lastName || "Name"}
                          </p>
                          <p className="text-xs text-muted-foreground">{formData.title || "Your Title"}</p>
                          {formData.availableNow && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Available</span>}
                        </div>
                      </div>
                      {formData.hourlyRate && <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" />R{formData.hourlyRate}/hr</p>}
                      {formData.location && <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{formData.location}</p>}
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.skills.slice(0, 4).map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-primary/5 text-xs text-primary">{s}</span>)}
                          {formData.skills.length > 4 && <span className="text-xs text-muted-foreground">+{formData.skills.length - 4}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick save */}
                  <Button
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => setActiveTab("preview")}
                    data-testid="btn-sidebar-preview"
                  >
                    <Eye className="w-4 h-4" /> Preview & Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

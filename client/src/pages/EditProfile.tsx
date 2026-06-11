import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/lib/currency";
import { apiPatch, apiJson } from "@/lib/api";
import { saveFreelancerProfile } from "@/lib/firebaseAppData";
import { calcStrength } from "@/lib/profileStrength";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { syncSessionNow } from "@/hooks/use-auth";
import {
  User, Briefcase, Target, DollarSign, Globe, Camera, Save, Loader2,
  ArrowLeft, CheckCircle2, AlertCircle, X, Plus, Star, Link as LinkIcon,
  ChevronRight, ShieldCheck,
} from "lucide-react";

/* ── Constants ───────────────────────────────────────────────────────────── */

const LANGUAGES_LIST = ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Tswana", "Venda", "Tsonga", "French", "Portuguese", "Arabic", "Swahili"];
const SA_LOCATIONS = ["Cape Town, WC", "Johannesburg, GP", "Durban, KZN", "Pretoria, GP", "Port Elizabeth, EC", "Bloemfontein, FS", "East London, EC", "Polokwane, LP", "Remote (South Africa)"];
const AVAILABILITY_OPTIONS = ["Available now", "Available in 1 week", "Available in 2 weeks", "Part-time only", "Weekends only"];
const EXPERIENCE_LEVELS = ["entry", "intermediate", "expert", "master"] as const;

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "web-development": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS", "Docker"],
  "graphic-design": ["Figma", "Photoshop", "Illustrator", "After Effects", "Framer", "Canva"],
  "writing": ["Copywriting", "SEO Writing", "Content Strategy", "Blog Writing", "Technical Writing"],
  "digital-marketing": ["Google Ads", "Facebook Ads", "SEO", "Email Marketing", "Analytics"],
  "video": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics"],
  "default": ["Communication", "Problem Solving", "Leadership", "Project Management", "Excel"],
};

/* ── Zod Schema ──────────────────────────────────────────────────────────── */

const portfolioItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL").or(z.literal("")),
  technologies: z.array(z.string()).default([]),
});

const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  title: z.string().min(2, "Title is required").max(150),
  tagline: z.string().max(300).optional(),
  bio: z.string().min(20, "Bio must be at least 20 characters").max(2000),
  skills: z.array(z.string().min(1)).max(20, "Max 20 skills"),
  category: z.string().min(1, "Category is required"),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  hourlyRate: z.coerce.number().min(1, "Rate must be at least R1/hr").max(50000, "Max R50,000/hr"),
  location: z.string().min(1, "Location is required"),
  languages: z.array(z.string()).default([]),
  availability: z.string().optional(),
  availableNow: z.boolean().default(false),
  linkedinUrl: z.string().url("Invalid URL").or(z.literal("")),
  githubUrl: z.string().url("Invalid URL").or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").or(z.literal("")),
  certifications: z.string().max(1000).optional(),
  photoUrl: z.string().optional(),
  portfolioProjects: z.array(portfolioItemSchema).max(6).default([]),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

/* ── Helper: Postgres → Form mapping ─────────────────────────────────────── */

function mapProfileToForm(profile: any): EditProfileForm {
  // Prefer separate firstName/lastName from the API (joined from users table)
  // Fall back to splitting fullName if only that is available
  let firstName = profile?.firstName || "";
  let lastName = profile?.lastName || "";
  if (!firstName && !lastName && profile?.fullName) {
    const nameParts = (profile.fullName || " ").split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }
  let portfolioProjects: any[] = [];
  if (Array.isArray(profile?.portfolioProjects)) {
    portfolioProjects = profile.portfolioProjects;
  } else if (profile?.portfolioUrl) {
    portfolioProjects = [{ id: "1", title: "Portfolio", link: profile.portfolioUrl, description: "", technologies: [] }];
  }

  return {
    firstName,
    lastName,
    title: profile?.title || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    skills: profile?.skills || [],
    category: profile?.category || "",
    experienceLevel: (profile?.experienceLevel as any) || "intermediate",
    hourlyRate: profile?.hourlyRate ? Math.round(profile.hourlyRate / 100) : 0,
    location: profile?.location || "",
    languages: profile?.languages || [],
    availability: profile?.availability || "",
    availableNow: profile?.availableNow || false,
    linkedinUrl: profile?.linkedinUrl || "",
    githubUrl: profile?.githubUrl || "",
    portfolioUrl: profile?.portfolioUrl || "",
    certifications: profile?.certifications || "",
    photoUrl: profile?.photoUrl || profile?.photo_url || profile?.profileImageUrl || profile?.profile_photo_url || "",
    portfolioProjects: portfolioProjects.length > 0 ? portfolioProjects : [],
  };
}

/* ── Main Page ───────────────────────────────────────────────────────────── */

export default function EditProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [savedTabs, setSavedTabs] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", link: "", technologies: [] as string[] });

  /* Fetch profile from Postgres */
  const profileQuery = useQuery({
    queryKey: ["/api/profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      await syncSessionNow();
      return apiJson<any>("/api/profile");
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const profile = profileQuery.data;
  const defaultValues = useMemo(() => mapProfileToForm(profile), [profile]);

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
    mode: "onBlur",
  });

  /* Reset form when profile loads */
  useEffect(() => {
    if (profileQuery.isSuccess && profile) {
      form.reset(mapProfileToForm(profile));
    }
  }, [profileQuery.isSuccess, profile?.id]);

  const watched = useWatch({ control: form.control });

  /* Profile strength */
  const strengthData = useMemo(() => {
    return {
      firstName: watched.firstName || "",
      lastName: watched.lastName || "",
      title: watched.title || "",
      bio: watched.bio || "",
      skills: watched.skills || [],
      category: watched.category || "",
      hourlyRate: watched.hourlyRate || 0,
      location: watched.location || "",
      photo: watched.photoUrl || "",
      portfolioUrl: watched.portfolioUrl || "",
      languages: watched.languages || [],
      availability: watched.availability || "",
    };
  }, [watched]);

  /* Save mutation (PATCH to Postgres + Firestore sync) */
  const saveMutation = useMutation({
    mutationFn: async (data: EditProfileForm) => {
      if (!user?.id) throw new Error("Not authenticated");
      await syncSessionNow();

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        tagline: data.tagline || null,
        bio: data.bio,
        skills: data.skills,
        category: data.category,
        experienceLevel: data.experienceLevel,
        hourlyRate: Math.round(data.hourlyRate * 100),
        location: data.location,
        languages: data.languages,
        availability: data.availability || null,
        availableNow: data.availableNow,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl: data.githubUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        certifications: data.certifications || null,
        photoUrl: data.photoUrl || null,
        portfolioProjects: data.portfolioProjects.length > 0 ? data.portfolioProjects : null,
      };

      // Save to Postgres
      const updated = await apiPatch<any>("/api/profile", payload);

      // Sync to Firestore (keep real-time in sync) — do NOT publish on save
      await saveFreelancerProfile({
        userId: user.id,
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        profilePhotoUrl: data.photoUrl || "",
        bio: data.bio,
        title: data.title,
        skills: data.skills,
        expertise: data.skills,
        categories: data.category ? [data.category] : [],
        hourlyRate: data.hourlyRate,
        location: data.location,
        portfolioLinks: data.portfolioProjects.map((p) => p.link).filter(Boolean),
        experienceLevel: data.experienceLevel,
        availability: data.availability || "",
        role: "freelancer",
        onboardingCompleted: true,
        // CRITICAL: Don't force publishedProfile=true on save — let user control publish
        updatedAt: new Date(),
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-status", user?.id] });
      toast({ title: "Profile saved", description: "Your changes have been saved." });
      setSavedTabs((prev) => new Set(prev).add(activeTab));
    },
    onError: (err: any) => {
      toast({ title: "Save failed", description: err?.message || "Could not save profile", variant: "destructive" });
    },
  });

  /* Publish mutation */
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      await syncSessionNow();
      const formData = form.getValues();
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        tagline: formData.tagline || null,
        bio: formData.bio,
        skills: formData.skills,
        category: formData.category,
        experienceLevel: formData.experienceLevel,
        hourlyRate: Math.round(formData.hourlyRate * 100),
        location: formData.location,
        languages: formData.languages,
        availability: formData.availability || null,
        availableNow: formData.availableNow,
        linkedinUrl: formData.linkedinUrl || null,
        githubUrl: formData.githubUrl || null,
        portfolioUrl: formData.portfolioUrl || null,
        certifications: formData.certifications || null,
        photoUrl: formData.photoUrl || null,
        portfolioProjects: formData.portfolioProjects.length > 0 ? formData.portfolioProjects : null,
      };
      const updated = await apiPatch<any>("/api/profile", payload);
      await apiJson<any>("/api/profile/publish", { method: "POST" });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile-status", user?.id] });
      toast({ title: "Profile published!", description: "Your profile is now live and visible to employers." });
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast({ title: "Publish failed", description: err?.message || "Could not publish", variant: "destructive" });
    },
  });

  /* Photo upload */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      await syncSessionNow();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await apiFetch("/api/profile/upload-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success && json.photoUrl) {
        form.setValue("photoUrl", json.photoUrl);
        toast({ title: "Photo uploaded", description: "Your profile photo has been updated." });
      } else {
        throw new Error(json.message || "Upload failed");
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setPhotoUploading(false);
      setUploadProgress(0);
    }
  };

  /* Skill helpers */
  const addSkill = useCallback(() => {
    const val = newSkill.trim();
    if (!val) return;
    const current = form.getValues("skills") || [];
    if (current.includes(val)) { setNewSkill(""); return; }
    if (current.length >= 20) { toast({ title: "Max skills reached", description: "You can add up to 20 skills." }); return; }
    form.setValue("skills", [...current, val], { shouldValidate: true });
    setNewSkill("");
  }, [newSkill, form, toast]);

  const removeSkill = useCallback((skill: string) => {
    const current = form.getValues("skills") || [];
    form.setValue("skills", current.filter((s) => s !== skill), { shouldValidate: true });
  }, [form]);

  const addSuggestedSkill = useCallback((skill: string) => {
    const current = form.getValues("skills") || [];
    if (current.includes(skill)) return;
    if (current.length >= 20) return;
    form.setValue("skills", [...current, skill], { shouldValidate: true });
  }, [form]);

  /* Portfolio helpers */
  const addProject = useCallback(() => {
    if (!newProject.title.trim()) return;
    const current = form.getValues("portfolioProjects") || [];
    form.setValue("portfolioProjects", [
      ...current,
      { ...newProject, id: String(Date.now()), technologies: newProject.technologies || [] },
    ], { shouldValidate: true });
    setNewProject({ title: "", description: "", link: "", technologies: [] });
  }, [newProject, form]);

  const removeProject = useCallback((id: string) => {
    const current = form.getValues("portfolioProjects") || [];
    form.setValue("portfolioProjects", current.filter((p) => p.id !== id), { shouldValidate: true });
  }, [form]);

  const addProjectTech = useCallback(() => {
    if (!newTech.trim()) return;
    setNewProject((prev) => ({ ...prev, technologies: [...prev.technologies, newTech.trim()] }));
    setNewTech("");
  }, [newTech]);

  /* Language helpers */
  const toggleLanguage = useCallback((lang: string) => {
    const current = form.getValues("languages") || [];
    if (current.includes(lang)) {
      form.setValue("languages", current.filter((l) => l !== lang), { shouldValidate: true });
    } else {
      form.setValue("languages", [...current, lang], { shouldValidate: true });
    }
  }, [form]);

  /* Suggested skills based on category */
  const suggestedSkills = useMemo(() => {
    const cat = form.watch("category");
    return SKILL_SUGGESTIONS[cat] || SKILL_SUGGESTIONS.default;
  }, [form.watch("category")]);

  /* Form submit handler */
  const onSubmit = form.handleSubmit((data) => {
    saveMutation.mutate(data);
  });

  /* Save current tab */
  const handleSaveTab = () => {
    const data = form.getValues();
    saveMutation.mutate(data);
  };

  const isLoading = profileQuery.isLoading || !user;
  const errors = form.formState.errors;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24" id="main-content">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Your Profile</h1>
              <p className="text-sm text-slate-400 mt-1">Update your details to attract the best clients.</p>
            </div>
            <div className="flex items-center gap-3">
              <ProfileStrengthMeter data={strengthData} compact />
              <Button
                onClick={onSubmit}
                disabled={saveMutation.isPending || publishMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                data-testid="button-save-all"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save All
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Left: Tabs */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-slate-900 border border-slate-800 p-1 mb-6 flex-wrap h-auto gap-1">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-basic">
                    <User className="w-3.5 h-3.5" /> Basic
                    {savedTabs.has("basic") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-skills">
                    <Target className="w-3.5 h-3.5" /> Skills
                    {savedTabs.has("skills") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-experience">
                    <Briefcase className="w-3.5 h-3.5" /> Experience
                    {savedTabs.has("experience") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                  <TabsTrigger value="rates" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-rates">
                    <DollarSign className="w-3.5 h-3.5" /> Rates
                    {savedTabs.has("rates") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-portfolio">
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                    {savedTabs.has("portfolio") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5" data-testid="tab-photo">
                    <Camera className="w-3.5 h-3.5" /> Photo
                    {savedTabs.has("photo") && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </TabsTrigger>
                </TabsList>

                {/* ── Basic Info Tab ── */}
                <TabsContent value="basic" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400" /> Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" {...form.register("firstName")} className="bg-slate-800 border-slate-700" data-testid="input-first-name" />
                          {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" {...form.register("lastName")} className="bg-slate-800 border-slate-700" data-testid="input-last-name" />
                          {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title</Label>
                        <Input id="title" {...form.register("title")} placeholder="e.g. Senior React Developer" className="bg-slate-800 border-slate-700" data-testid="input-title" />
                        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input id="tagline" {...form.register("tagline")} placeholder="Short headline under your name" className="bg-slate-800 border-slate-700" data-testid="input-tagline" />
                        {errors.tagline && <p className="text-xs text-red-400">{errors.tagline.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" {...form.register("bio")} placeholder="Tell clients about your experience, skills, and what makes you great..." className="bg-slate-800 border-slate-700 min-h-[140px]" data-testid="input-bio" />
                        {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
                        <p className="text-xs text-slate-500">{(watched.bio || "").length} / 2000 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select value={watched.location} onValueChange={(v) => form.setValue("location", v)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-location">
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {SA_LOCATIONS.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-basic">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Basic Info
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Skills Tab ── */}
                <TabsContent value="skills" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-400" /> Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={watched.category} onValueChange={(v) => form.setValue("category", v)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-category">
                            <SelectValue placeholder="Select your primary category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill (e.g. React, UI Design)"
                            className="bg-slate-800 border-slate-700"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            data-testid="input-new-skill"
                          />
                          <Button type="button" variant="outline" onClick={addSkill} className="shrink-0 border-slate-700" data-testid="btn-add-skill">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors.skills && <p className="text-xs text-red-400">{errors.skills.message}</p>}

                        {/* Current skills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(watched.skills || []).map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-slate-800 text-slate-200 gap-1 px-2.5 py-1">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="hover:text-red-400" data-testid={`btn-remove-skill-${skill}`}>
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {(watched.skills || []).length === 0 && <p className="text-sm text-slate-500">No skills added yet.</p>}
                        </div>
                      </div>

                      {/* Suggested skills */}
                      <div className="space-y-2">
                        <Label className="text-slate-400">Suggested for your category</Label>
                        <div className="flex flex-wrap gap-2">
                          {suggestedSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSuggestedSkill(skill)}
                              disabled={(watched.skills || []).includes(skill)}
                              className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              data-testid={`suggested-skill-${skill}`}
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-skills">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Skills
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Experience Tab ── */}
                <TabsContent value="experience" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-400" /> Experience & Background
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select value={watched.experienceLevel} onValueChange={(v) => form.setValue("experienceLevel", v as any)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-experience">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                            <SelectItem value="master">Master</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.experienceLevel && <p className="text-xs text-red-400">{errors.experienceLevel.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certifications">Certifications</Label>
                        <Textarea id="certifications" {...form.register("certifications")} placeholder="List your certifications, one per line..." className="bg-slate-800 border-slate-700 min-h-[100px]" data-testid="input-certifications" />
                      </div>
                      <div className="space-y-2">
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES_LIST.map((lang) => {
                            const selected = (watched.languages || []).includes(lang);
                            return (
                              <button
                                key={lang}
                                onClick={() => toggleLanguage(lang)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
                                data-testid={`lang-${lang}`}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-experience">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Experience
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Rates Tab ── */}
                <TabsContent value="rates" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" /> Rates & Availability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (ZAR)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R</span>
                          <Input id="hourlyRate" type="number" {...form.register("hourlyRate")} className="bg-slate-800 border-slate-700 pl-8" data-testid="input-hourly-rate" />
                        </div>
                        {errors.hourlyRate && <p className="text-xs text-red-400">{errors.hourlyRate.message}</p>}
                        <p className="text-xs text-slate-500">Clients see: {formatAmount((watched.hourlyRate || 0) * 100)} / hour</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Availability</Label>
                        <Select value={watched.availability} onValueChange={(v) => form.setValue("availability", v)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-availability">
                            <SelectValue placeholder="When are you available?" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABILITY_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <Switch id="availableNow" checked={watched.availableNow} onCheckedChange={(v) => form.setValue("availableNow", v)} data-testid="switch-available-now" />
                        <Label htmlFor="availableNow" className="cursor-pointer">Available for work right now</Label>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-rates">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Rates
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Portfolio Tab ── */}
                <TabsContent value="portfolio" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-400" /> Portfolio & Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                        <Input id="portfolioUrl" {...form.register("portfolioUrl")} placeholder="https://yourportfolio.com" className="bg-slate-800 border-slate-700" data-testid="input-portfolio-url" />
                        {errors.portfolioUrl && <p className="text-xs text-red-400">{errors.portfolioUrl.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn</Label>
                        <Input id="linkedinUrl" {...form.register("linkedinUrl")} placeholder="https://linkedin.com/in/you" className="bg-slate-800 border-slate-700" data-testid="input-linkedin" />
                        {errors.linkedinUrl && <p className="text-xs text-red-400">{errors.linkedinUrl.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="githubUrl">GitHub</Label>
                        <Input id="githubUrl" {...form.register("githubUrl")} placeholder="https://github.com/you" className="bg-slate-800 border-slate-700" data-testid="input-github" />
                        {errors.githubUrl && <p className="text-xs text-red-400">{errors.githubUrl.message}</p>}
                      </div>

                      {/* Projects list */}
                      <div className="space-y-3 pt-4 border-t border-slate-800">
                        <Label>Projects</Label>
                        {(watched.portfolioProjects || []).length === 0 && (
                          <p className="text-sm text-slate-500">No projects added yet. Add up to 6 projects.</p>
                        )}
                        {(watched.portfolioProjects || []).map((project) => (
                          <div key={project.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="font-semibold text-white text-sm">{project.title}</div>
                              <button onClick={() => removeProject(project.id)} className="text-slate-400 hover:text-red-400">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {project.description && <p className="text-xs text-slate-400">{project.description}</p>}
                            {project.link && (
                              <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> {project.link}
                              </a>
                            )}
                            {project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map((t) => (
                                  <Badge key={t} variant="outline" className="text-[10px] border-slate-600 text-slate-400">{t}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add new project */}
                        <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700 space-y-3">
                          <p className="text-sm font-medium text-white">Add a project</p>
                          <Input placeholder="Project title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="bg-slate-800 border-slate-700" data-testid="input-project-title" />
                          <Textarea placeholder="Description (optional)" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="bg-slate-800 border-slate-700 min-h-[60px]" data-testid="input-project-desc" />
                          <Input placeholder="Project URL" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} className="bg-slate-800 border-slate-700" data-testid="input-project-link" />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Technology (e.g. React)"
                              value={newTech}
                              onChange={(e) => setNewTech(e.target.value)}
                              className="bg-slate-800 border-slate-700"
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProjectTech())}
                              data-testid="input-project-tech"
                            />
                            <Button type="button" variant="outline" onClick={addProjectTech} className="shrink-0 border-slate-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          {newProject.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {newProject.technologies.map((t) => (
                                <Badge key={t} variant="outline" className="text-[10px] border-slate-600 text-slate-400">{t}</Badge>
                              ))}
                            </div>
                          )}
                          <Button type="button" variant="outline" onClick={addProject} className="w-full border-slate-700" data-testid="btn-add-project">
                            <Plus className="w-4 h-4 mr-2" /> Add Project
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-portfolio">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Portfolio
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Photo Tab ── */}
                <TabsContent value="photo" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-400" /> Profile Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-2 border-slate-700">
                          <AvatarImage src={watched.photoUrl || undefined} />
                          <AvatarFallback className="bg-slate-800 text-slate-400 text-xl">
                            {(watched.firstName || "U")[0]}{(watched.lastName || "")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-3">
                          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} data-testid="input-photo-upload" />
                          <Button variant="outline" onClick={() => photoInputRef.current?.click()} className="border-slate-700" data-testid="btn-upload-photo">
                            <Camera className="w-4 h-4 mr-2" />
                            {photoUploading ? "Uploading..." : "Upload Photo"}
                          </Button>
                          {photoUploading && (
                            <div className="space-y-1">
                              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <p className="text-xs text-slate-500">{uploadProgress}%</p>
                            </div>
                          )}
                          <p className="text-xs text-slate-500 max-w-xs">
                            Optional. A professional photo increases your chances by 40%. Max 5MB, JPG/PNG/WebP.
                          </p>
                        </div>
                      </div>
                      {watched.photoUrl && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => form.setValue("photoUrl", "")} data-testid="btn-remove-photo">
                            <X className="w-4 h-4 mr-1" /> Remove photo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTab} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500" data-testid="btn-save-photo">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Photo
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileStrengthMeter data={strengthData} />
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={watched.photoUrl || undefined} />
                      <AvatarFallback className="bg-slate-800 text-xs">
                        {(watched.firstName || "U")[0]}{(watched.lastName || "")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {(watched.firstName || "")} {(watched.lastName || "")}
                      </div>
                      <div className="text-xs text-slate-400">{watched.title || "No title"}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {watched.location || "No location"} · {formatAmount((watched.hourlyRate || 0) * 100)} / hr
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(watched.skills || []).slice(0, 5).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] bg-slate-800">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:text-white" onClick={() => navigate(`/profile/${user?.id}`)} data-testid="btn-view-public">
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 rotate-180" /> View Public Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:text-white" onClick={() => navigate("/dashboard")} data-testid="btn-go-dashboard">
                    <ChevronRight className="w-3.5 h-3.5 mr-2" /> Go to Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Publish CTA */}
              <Card className="bg-emerald-900/20 border-emerald-800/50">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-semibold text-sm">Ready to go live?</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Publishing makes your profile visible to clients and searchable in Find Talent.
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending || saveMutation.isPending}
                    data-testid="btn-publish-profile"
                  >
                    {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                    Publish Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

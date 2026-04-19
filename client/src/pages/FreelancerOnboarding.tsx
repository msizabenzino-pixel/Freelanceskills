import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { useAuth } from "@/hooks/use-auth";
import { saveFreelancerProfile, uploadProfilePhoto } from "@/lib/firebaseAppData";
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Camera,
  User,
  Briefcase,
  FileCheck,
  ClipboardCheck,
  ShieldCheck,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

const STEPS = ["Basic Info", "Skills & Expertise", "Portfolio & Verification", "Review & Submit"];

function FreelancerOnboardingContent() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [displayName, setDisplayName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");

  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [portfolioLinksInput, setPortfolioLinksInput] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { user } = useAuth();
  const [, navigate] = useLocation();

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Please sign in first.");
      return uploadProfilePhoto(user.id, file, setUploadProgress);
    },
    onSuccess: (url) => {
      setProfilePhotoUrl(url);
      setUploadProgress(100);
      setApiError(null);
    },
    onError: (error: Error) => {
      setApiError(error.message);
      setUploadProgress(0);
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in first.");
      const fullName = displayName.trim();
      const portfolioLinks = portfolioLinksInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await saveFreelancerProfile({
        userId: user.id,
        fullName,
        profilePhotoUrl,
        bio: bio.trim(),
        title: professionalTitle.trim(),
        skills,
        expertise,
        categories: [category],
        hourlyRate: Number(hourlyRate || 0),
        location: location.trim(),
        portfolioLinks,
        experienceLevel,
        availability,
        role: "freelancer",
        onboardingCompleted: true,
        publishedProfile: true,
      });

      const res = await fetch("/api/profile/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio: bio.trim(),
          title: professionalTitle.trim(),
          skills,
          hourlyRate: Number(hourlyRate || 0),
          location: location.trim(),
          isPro: false,
        }),
      });
      if (!res.ok && res.status !== 401) {
        const body = await res.json().catch(() => ({})) as any;
        console.warn("[FreelancerOnboarding] go-live sync failed:", body?.message);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      setApiError(null);
    },
    onError: (error: Error) => {
      setApiError(error.message);
    },
  });

  const getInitials = () => {
    if (!displayName) return "?";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canProceed = () => {
    if (step === 0) {
      return Boolean(displayName.trim() && professionalTitle.trim() && bio.trim().length >= 50 && location.trim());
    }
    if (step === 1) {
      const skillsCombined = [
        ...skills,
        ...skillsInput.split(",").map((item) => item.trim()).filter(Boolean),
      ];
      const expertiseCombined = [
        ...expertise,
        ...expertiseInput.split(",").map((item) => item.trim()).filter(Boolean),
      ];
      return Boolean(category && skillsCombined.length > 0 && expertiseCombined.length > 0 && experienceLevel && Number(hourlyRate) > 0 && availability);
    }
    if (step === 2) {
      return agreedToTerms;
    }
    return true;
  };

  const handleNext = () => {
    setApiError(null);
    if (!canProceed()) {
      setApiError("Please complete all required fields before continuing.");
      return;
    }
    if (step === 1) {
      if (skillsInput.trim()) {
        setSkills((prev) =>
          Array.from(new Set([...prev, ...skillsInput.split(",").map((item) => item.trim()).filter(Boolean)]))
        );
        setSkillsInput("");
      }
      if (expertiseInput.trim()) {
        setExpertise((prev) =>
          Array.from(new Set([...prev, ...expertiseInput.split(",").map((item) => item.trim()).filter(Boolean)]))
        );
        setExpertiseInput("");
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    setApiError(null);
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      setApiError("You must agree to the terms to complete registration.");
      return;
    }
    saveProfileMutation.mutate();
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setApiError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview((ev.target?.result as string) || null);
    reader.readAsDataURL(file);

    uploadPhotoMutation.mutate(file);
  };

  const categoryName = SERVICE_CATEGORIES.find((c) => c.id === category)?.name || category;
  const stepIcons = [User, Briefcase, FileCheck, ClipboardCheck];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center py-20">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3" data-testid="text-success-title">Profile Created</h2>
            <p className="text-muted-foreground text-lg mb-8" data-testid="text-success-message">
              Your freelancer profile is live. You can now apply for jobs and receive bookings.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/services")} data-testid="button-browse-services">
                Browse Services
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Set Up Your Profile</h1>
            <p className="text-muted-foreground">Complete your freelancer profile to start getting booked by clients.</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8" data-testid="progress-indicator">
            {STEPS.map((label, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                      i <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn("text-sm font-medium hidden sm:inline", i <= step ? "text-primary" : "text-muted-foreground")}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>

          <Card className="p-8 shadow-lg border-border">
            {apiError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm text-destructive" data-testid="error-message">
                  {apiError}
                </div>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-6" data-testid="step-basic-info">
                <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>

                <div className="flex flex-col items-center gap-3 mb-6">
                  {photoPreview || profilePhotoUrl ? (
                    <img
                      src={photoPreview || profilePhotoUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border" data-testid="avatar-placeholder">
                      {getInitials()}
                    </div>
                  )}
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" data-testid="button-upload-photo" asChild>
                      <span><Camera className="w-4 h-4 mr-2" /> {profilePhotoUrl ? "Change Photo" : "Upload Photo"}</span>
                    </Button>
                  </Label>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  {uploadPhotoMutation.isPending && (
                    <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input id="displayName" placeholder="e.g. John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalTitle">Professional Title *</Label>
                  <Input id="professionalTitle" placeholder="Senior Plumber" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me * (min 50 characters)</Label>
                  <Textarea id="bio" className="min-h-[120px] resize-none" value={bio} onChange={(e) => setBio(e.target.value)} />
                  <p className={cn("text-xs", bio.length >= 50 ? "text-muted-foreground" : "text-destructive")}>{bio.length}/50 characters minimum</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="Cape Town" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input id="phone" placeholder="+27 82 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6" data-testid="step-skills">
                <h2 className="text-xl font-bold text-foreground mb-4">Skills & Expertise</h2>

                <div className="space-y-2">
                  <Label htmlFor="category">Primary Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select your primary category" /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Skills *</Label>
                  <Input
                    placeholder="Type a skill and press Enter"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== ",") return;
                      e.preventDefault();
                      const value = skillsInput.trim();
                      if (!value || skills.includes(value)) return;
                      setSkills((prev) => [...prev, value]);
                      setSkillsInput("");
                    }}
                    onBlur={() => {
                      const candidates = skillsInput.split(",").map((item) => item.trim()).filter(Boolean);
                      if (!candidates.length) return;
                      setSkills((prev) => Array.from(new Set([...prev, ...candidates])));
                      setSkillsInput("");
                    }}
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {skill}
                        <button type="button" className="hover:text-destructive ml-1" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expertise Areas *</Label>
                  <Input
                    placeholder="Type expertise and press Enter"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== ",") return;
                      e.preventDefault();
                      const value = expertiseInput.trim();
                      if (!value || expertise.includes(value)) return;
                      setExpertise((prev) => [...prev, value]);
                      setExpertiseInput("");
                    }}
                    onBlur={() => {
                      const candidates = expertiseInput.split(",").map((item) => item.trim()).filter(Boolean);
                      if (!candidates.length) return;
                      setExpertise((prev) => Array.from(new Set([...prev, ...candidates])));
                      setExpertiseInput("");
                    }}
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {expertise.map((item, i) => (
                      <Badge key={i} variant="outline" className="flex items-center gap-1 px-3 py-1">
                        {item}
                        <button type="button" className="hover:text-destructive ml-1" onClick={() => setExpertise(expertise.filter((_, idx) => idx !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select experience level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (ZAR) *</Label>
                  <Input id="hourlyRate" type="number" placeholder="350" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select your availability" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                      <SelectItem value="evenings">Evenings Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6" data-testid="step-portfolio">
                <h2 className="text-xl font-bold text-foreground mb-4">Portfolio & Verification</h2>

                <div className="space-y-2">
                  <Label htmlFor="portfolioDescription">Portfolio Description</Label>
                  <Textarea id="portfolioDescription" className="min-h-[150px] resize-none" value={portfolioDescription} onChange={(e) => setPortfolioDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioLinks">Portfolio Links (comma separated)</Label>
                  <Input id="portfolioLinks" placeholder="https://site.com, https://github.com/me" value={portfolioLinksInput} onChange={(e) => setPortfolioLinksInput(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input id="yearsOfExperience" type="number" placeholder="5" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma separated)</Label>
                  <Input id="certifications" placeholder="AWS, PMP, SHEQ" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">ID Verification</p>
                    <p>Your identity can be verified after submission.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to FreelanceSkills Terms of Service
                  </Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6" data-testid="step-review">
                <h2 className="text-xl font-bold text-foreground mb-4">Review Your Profile</h2>

                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Display Name:</span> <span className="font-medium text-foreground">{displayName}</span></div>
                      <div><span className="text-muted-foreground">Title:</span> <span className="font-medium text-foreground">{professionalTitle}</span></div>
                      <div><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{location}</span></div>
                      <div className="sm:col-span-2"><span className="text-muted-foreground">Bio:</span> <span className="font-medium text-foreground">{bio}</span></div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Skills & Expertise</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{categoryName}</span></div>
                      <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium text-foreground capitalize">{experienceLevel}</span></div>
                      <div><span className="text-muted-foreground">Hourly Rate:</span> <span className="font-medium text-foreground">R{hourlyRate || "0"}/hr</span></div>
                      <div><span className="text-muted-foreground">Availability:</span> <span className="font-medium text-foreground capitalize">{availability.replace("-", " ")}</span></div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Skills:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">{skills.map((skill, i) => <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border mt-8 flex justify-between">
              {step > 0 ? (
                <Button variant="outline" onClick={handleBack} className="h-12 px-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saveProfileMutation.isPending} className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">
                  {saveProfileMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <>
                      Complete Registration <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FreelancerOnboarding() {
  return (
    <AuthGuard message="Sign in to create your freelancer profile and start earning.">
      <FreelancerOnboardingContent />
    </AuthGuard>
  );
}

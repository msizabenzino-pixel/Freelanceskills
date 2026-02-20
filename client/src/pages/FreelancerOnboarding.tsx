import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { SERVICE_CATEGORIES } from "@shared/categories";
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
} from "lucide-react";

const STEPS = ["Basic Info", "Skills & Expertise", "Portfolio & Verification", "Review & Submit"];

export default function FreelancerOnboarding() {
  const { formatAmount } = useCurrency();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");

  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      return displayName.trim() && professionalTitle.trim() && bio.trim().length >= 50 && location.trim();
    }
    if (step === 1) {
      return category && skills.length > 0 && experienceLevel && hourlyRate;
    }
    if (step === 2) {
      return agreedToTerms;
    }
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
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
            <h2 className="text-3xl font-bold text-foreground mb-3" data-testid="text-success-title">Profile Created!</h2>
            <p className="text-muted-foreground text-lg mb-8" data-testid="text-success-message">
              You're now listed on FreelanceSkills. Clients can find and book you.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = "/dashboard"} data-testid="button-go-dashboard">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/services"} data-testid="button-browse-services">
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
                      i < step
                        ? "bg-primary text-white"
                        : i === step
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:inline",
                      i <= step ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>

          <Card className="p-8 shadow-lg border-border">
            {step === 0 && (
              <div className="space-y-6" data-testid="step-basic-info">
                <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>

                <div className="flex flex-col items-center gap-3 mb-6">
                  <div
                    className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border"
                    data-testid="avatar-placeholder"
                  >
                    {getInitials()}
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-upload-photo">
                    <Camera className="w-4 h-4 mr-2" /> Upload Photo
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    placeholder="e.g. John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    data-testid="input-display-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalTitle">Professional Title *</Label>
                  <Input
                    id="professionalTitle"
                    placeholder='e.g. "Senior Plumber", "React Developer"'
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    data-testid="input-professional-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me * (min 50 characters)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell clients about yourself, your experience, and what makes you stand out..."
                    className="min-h-[120px] resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    data-testid="textarea-bio"
                  />
                  <p className={cn("text-xs", bio.length >= 50 ? "text-muted-foreground" : "text-destructive")}>
                    {bio.length}/50 characters minimum
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Cape Town"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +27 82 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6" data-testid="step-skills">
                <h2 className="text-xl font-bold text-foreground mb-4">Skills & Expertise</h2>

                <div className="space-y-2">
                  <Label htmlFor="category">Primary Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12" data-testid="select-category">
                      <SelectValue placeholder="Select your primary category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Skills *</Label>
                  <Input
                    placeholder="Type a skill and press Enter (e.g. Plumbing)"
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
                      <Badge key={i} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {skill}
                        <button
                          type="button"
                          className="hover:text-destructive ml-1"
                          onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                          data-testid={`button-remove-skill-${i}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-12" data-testid="select-experience-level">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (ZAR) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="e.g. 350"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    data-testid="input-hourly-rate"
                  />
                  {hourlyRate && (
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(Number(hourlyRate))} per hour
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="h-12" data-testid="select-availability">
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
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
                  <Textarea
                    id="portfolioDescription"
                    placeholder="Describe your past work, notable projects, and achievements..."
                    className="min-h-[150px] resize-none"
                    value={portfolioDescription}
                    onChange={(e) => setPortfolioDescription(e.target.value)}
                    data-testid="textarea-portfolio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    placeholder="e.g. 5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    data-testid="input-years-experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma separated)</Label>
                  <Input
                    id="certifications"
                    placeholder="e.g. AWS Certified, PMP, SHEQ"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    data-testid="input-certifications"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">ID Verification</p>
                    <p data-testid="text-id-verification">
                      Your identity will be verified via our secure process after submission
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    data-testid="checkbox-terms"
                  />
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
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Display Name:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-display-name">{displayName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Title:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-title">{professionalTitle}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-location">{location}</span>
                      </div>
                      {phone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          <span className="font-medium text-foreground" data-testid="review-phone">{phone}</span>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Bio:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-bio">{bio}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" /> Skills & Expertise
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-category">{categoryName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Experience:</span>{" "}
                        <span className="font-medium text-foreground capitalize" data-testid="review-experience">{experienceLevel}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hourly Rate:</span>{" "}
                        <span className="font-medium text-foreground" data-testid="review-rate">{formatAmount(Number(hourlyRate))}/hr</span>
                      </div>
                      {availability && (
                        <div>
                          <span className="text-muted-foreground">Availability:</span>{" "}
                          <span className="font-medium text-foreground capitalize" data-testid="review-availability">{availability.replace("-", " ")}</span>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Skills:</span>{" "}
                        <div className="flex flex-wrap gap-1.5 mt-1" data-testid="review-skills">
                          {skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" /> Portfolio & Verification
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {yearsOfExperience && (
                        <div>
                          <span className="text-muted-foreground">Years of Experience:</span>{" "}
                          <span className="font-medium text-foreground" data-testid="review-years">{yearsOfExperience}</span>
                        </div>
                      )}
                      {certifications && (
                        <div>
                          <span className="text-muted-foreground">Certifications:</span>{" "}
                          <span className="font-medium text-foreground" data-testid="review-certifications">{certifications}</span>
                        </div>
                      )}
                      {portfolioDescription && (
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Portfolio:</span>{" "}
                          <span className="font-medium text-foreground" data-testid="review-portfolio">{portfolioDescription}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border mt-8 flex justify-between">
              {step > 0 ? (
                <Button variant="outline" onClick={handleBack} className="h-12 px-6" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg"
                  data-testid="button-next"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg"
                  data-testid="button-complete-registration"
                >
                  Complete Registration <CheckCircle2 className="w-4 h-4 ml-2" />
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

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  User, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award,
  X,
  Loader2,
  ChevronRight,
  ClipboardList
} from "lucide-react";

export default function CVUpload() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cvText, setCvText] = useState("");
  const [isParsed, setIsParsed] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    bio: "",
    skills: [] as string[],
    hourlyRate: "",
    location: "",
    experienceLevel: "",
    category: "",
    certifications: "",
  });

  const [skillInput, setSkillInput] = useState("");

  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/cv/parse", { cvText: text });
      return res.json();
    },
    onSuccess: (data) => {
      setFormData({
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
      });
      setIsParsed(true);
      toast({
        title: "CV Parsed Successfully",
        description: "We've extracted your details. Please review and edit as needed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: error.message || "Failed to parse CV. Please try again or fill manually.",
      });
    }
  });

  const profileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/profile", {
        ...data,
        userType: "freelancer",
        hourlyRate: data.hourlyRate ? parseInt(data.hourlyRate) * 100 : 0, // Convert to cents
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your professional profile has been successfully created.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create profile. Please try again.",
      });
    }
  });

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()]
        }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const steps = [
    { icon: FileText, text: "Paste CV" },
    { icon: Sparkles, text: "AI Extracts" },
    { icon: ClipboardList, text: "Review & Edit" },
    { icon: Check, text: "Create Profile" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-emerald-500/5 -z-10" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 rounded-2xl text-primary animate-in zoom-in duration-500">
              <Upload className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Build Your Profile with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Don't spend hours filling out forms. Paste your CV and let our AI handle the rest for your FreelanceSkills profile.
            </p>

            {/* How it works */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    (idx === 0 && !isParsed) || (idx > 0 && isParsed) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{step.text}</span>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute transform translate-x-24 translate-y-6">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {!isParsed ? (
              <Card className="border-2 border-dashed border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Label htmlFor="cv-text" className="text-lg font-semibold mb-2 block">
                      Paste your CV content here
                    </Label>
                    <Textarea
                      id="cv-text"
                      placeholder="Paste the text from your PDF or Word document CV..."
                      className="min-h-[400px] text-base resize-none focus-visible:ring-primary/30"
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      data-testid="textarea-cv-input"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold gap-2 group shadow-lg hover:shadow-primary/20 transition-all"
                    onClick={() => parseMutation.mutate(cvText)}
                    disabled={!cvText.trim() || parseMutation.isPending}
                    data-testid="button-extract-ai"
                  >
                    {parseMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    )}
                    {parseMutation.isPending ? "AI is processing..." : "Extract Profile with AI"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Check className="w-6 h-6 text-emerald-500" />
                    Review Your AI-Extracted Profile
                  </h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsParsed(false)}
                    data-testid="button-reset-cv"
                  >
                    Start Over
                  </Button>
                </div>

                <Card className="shadow-xl">
                  <CardContent className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" /> Professional Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g. Senior Full Stack Developer"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        data-testid="input-professional-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Bio / Professional Summary
                      </Label>
                      <Textarea
                        id="bio"
                        className="min-h-[120px]"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        data-testid="textarea-bio"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select 
                          value={formData.experienceLevel} 
                          onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                        >
                          <SelectTrigger data-testid="select-experience-level">
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert / Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" /> Hourly Rate (ZAR)
                        </Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          data-testid="input-hourly-rate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" /> Location
                        </Label>
                        <Input
                          id="location"
                          placeholder="e.g. Cape Town, WC"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          data-testid="input-location"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Skills
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-10 p-3 bg-muted/30 rounded-lg border border-border">
                        {formData.skills.map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="pl-2 pr-1 py-1 gap-1 border-primary/20"
                            data-testid={`badge-skill-${i}`}
                          >
                            {skill}
                            <button 
                              onClick={() => removeSkill(skill)}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add more skills (Press Enter)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        data-testid="input-add-skill"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications" className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" /> Certifications
                      </Label>
                      <Textarea
                        id="certifications"
                        placeholder="List your certifications..."
                        value={formData.certifications}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        data-testid="textarea-certifications"
                      />
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold shadow-xl"
                      onClick={() => profileMutation.mutate(formData)}
                      disabled={profileMutation.isPending}
                      data-testid="button-create-profile"
                    >
                      {profileMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                      {profileMutation.isPending ? "Creating Profile..." : "Create My Profile"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Edit3, 
  User,
  Briefcase,
  MapPin,
  Star,
  Loader2,
  ArrowRight,
  Phone,
  HelpCircle,
  Wand2,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractedProfile {
  fullName: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  location: string;
  hourlyRate: string;
  education: string;
}

interface ProfileOptimizationResult {
  optimizedBio: string;
  optimizedTitle: string;
  suggestedSkills: string[];
  seoKeywords: string[];
  profileScore: number;
  improvements: string[];
}

async function optimizeProfile(data: {
  bio: string;
  title: string;
  skills: string[];
}): Promise<ProfileOptimizationResult> {
  const response = await fetch("/api/ai/optimize-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to optimize profile");
  }
  return response.json();
}

export function AIProfileBuilder({ 
  open, 
  onClose,
  onComplete 
}: { 
  open: boolean; 
  onClose: () => void;
  onComplete: (profile: ExtractedProfile) => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<"upload" | "processing" | "review" | "help" | "optimize">("upload");
  const [fileName, setFileName] = useState("");
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<ExtractedProfile | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<ProfileOptimizationResult | null>(null);

  const optimizeMutation = useMutation({
    mutationFn: () => optimizeProfile({
      bio: editedProfile?.bio || "",
      title: editedProfile?.title || "",
      skills: editedProfile?.skills || [],
    }),
    onSuccess: (result) => {
      setOptimizationResult(result);
      setStep("optimize");
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      processCV(file);
    }
  };

  const processCV = async (file: File) => {
    setStep("processing");
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted data (in real implementation, this would call an AI API)
    const mockProfile: ExtractedProfile = {
      fullName: "John Mokoena",
      title: "Certified Plumber & Geyser Specialist",
      bio: "Experienced plumber with over 8 years of hands-on experience in residential and commercial plumbing. Specializing in geyser installations, repairs, and maintenance. PIRB registered with a proven track record of quality workmanship and customer satisfaction. Available for emergency callouts in the greater Johannesburg area.",
      skills: ["Geyser Installation", "Pipe Repairs", "Drain Cleaning", "Water Heater Maintenance", "Emergency Plumbing", "Bathroom Renovations"],
      experience: "8 years",
      location: "Johannesburg, Gauteng",
      hourlyRate: "R450",
      education: "N3 Plumbing Certificate, PIRB Registered"
    };
    
    setExtractedProfile(mockProfile);
    setEditedProfile(mockProfile);
    setStep("review");
  };

  const handleApprove = () => {
    if (editedProfile) {
      onComplete(editedProfile);
      toast({
        title: "Profile Created!",
        description: "Your profile has been created successfully. You can now start receiving jobs.",
      });
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setStep("upload");
    setFileName("");
    setExtractedProfile(null);
    setEditedProfile(null);
    setOptimizationResult(null);
  };

  const updateField = (field: keyof ExtractedProfile, value: string | string[]) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); resetState(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Profile Builder
          </DialogTitle>
          <DialogDescription>
            Upload your CV and our AI will create your profile in seconds
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
                data-testid="input-cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">Upload your CV</p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
                <Button variant="outline" data-testid="button-choose-file">Choose File</Button>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">1. Upload CV</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">2. AI Extracts Info</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">3. Review & Approve</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Need help?</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Don't have a CV? No problem! Our team can help you create a profile over WhatsApp.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-amber-700 border-amber-300"
                    onClick={() => setStep("help")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Get Human Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI is reading your CV...</h3>
            <p className="text-muted-foreground mb-4">
              Extracting your skills, experience, and qualifications
            </p>
            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>File uploaded: {fileName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing content...</span>
              </div>
            </div>
          </div>
        )}

        {step === "review" && editedProfile && (
          <div className="space-y-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Profile extracted successfully!</p>
                <p className="text-sm text-green-700">Review the information below and make any changes needed.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input 
                    value={editedProfile.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </Label>
                  <Input 
                    value={editedProfile.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    data-testid="input-location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Professional Title
                </Label>
                <Input 
                  value={editedProfile.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" /> About You (Bio)
                </Label>
                <Textarea 
                  value={editedProfile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  data-testid="textarea-bio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" /> Experience
                  </Label>
                  <Input 
                    value={editedProfile.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    data-testid="input-experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate (ZAR)</Label>
                  <Input 
                    value={editedProfile.hourlyRate}
                    onChange={(e) => updateField("hourlyRate", e.target.value)}
                    data-testid="input-hourly-rate"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input 
                  value={editedProfile.skills.join(", ")}
                  onChange={(e) => updateField("skills", e.target.value.split(",").map(s => s.trim()))}
                  data-testid="input-skills"
                />
                <div className="flex flex-wrap gap-2 mt-2" data-testid="skills-badges">
                  {editedProfile.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Education & Certifications</Label>
                <Input 
                  value={editedProfile.education}
                  onChange={(e) => updateField("education", e.target.value)}
                  data-testid="input-education"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetState} className="flex-1" data-testid="button-start-over">
                Start Over
              </Button>
              <Button 
                variant="secondary"
                onClick={() => optimizeMutation.mutate()}
                disabled={optimizeMutation.isPending}
                className="flex-1 gap-2"
                data-testid="button-optimize-profile"
              >
                {optimizeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                AI Optimize
              </Button>
              <Button onClick={handleApprove} className="flex-1 gap-2" data-testid="button-approve-profile">
                Approve & Create Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "optimize" && editedProfile && optimizationResult && (
          <div className="space-y-6 py-4">
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-violet-600 mt-0.5" />
              <div>
                <p className="font-medium text-violet-800">AI Optimization Complete!</p>
                <p className="text-sm text-violet-700">
                  Profile Score: <span className="font-bold">{optimizationResult.profileScore}/100</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" /> Optimized Title
                </Label>
                <Input 
                  value={optimizationResult.optimizedTitle}
                  onChange={(e) => setOptimizationResult({ ...optimizationResult, optimizedTitle: e.target.value })}
                  className="border-violet-200"
                  data-testid="input-optimized-title"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-violet-600" /> Optimized Bio
                </Label>
                <Textarea 
                  value={optimizationResult.optimizedBio}
                  onChange={(e) => setOptimizationResult({ ...optimizationResult, optimizedBio: e.target.value })}
                  rows={5}
                  className="border-violet-200"
                  data-testid="input-optimized-bio"
                />
              </div>

              {optimizationResult.suggestedSkills.length > 0 && (
                <div className="space-y-2">
                  <Label>Suggested Additional Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {optimizationResult.suggestedSkills.map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-violet-100"
                        onClick={() => {
                          if (editedProfile && !editedProfile.skills.includes(skill)) {
                            setEditedProfile({
                              ...editedProfile,
                              skills: [...editedProfile.skills, skill]
                            });
                          }
                        }}
                        data-testid={`badge-skill-${i}`}
                      >
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {optimizationResult.seoKeywords.length > 0 && (
                <div className="space-y-2">
                  <Label>SEO Keywords for Discoverability</Label>
                  <div className="flex flex-wrap gap-1">
                    {optimizationResult.seoKeywords.map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {optimizationResult.improvements.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-2">Improvements Made:</p>
                  <ul className="space-y-1">
                    {optimizationResult.improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-green-700 flex gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("review")} className="flex-1">
                Back to Edit
              </Button>
              <Button 
                onClick={() => {
                  if (editedProfile && optimizationResult) {
                    onComplete({
                      ...editedProfile,
                      title: optimizationResult.optimizedTitle,
                      bio: optimizationResult.optimizedBio,
                    });
                    toast({
                      title: "Profile Created!",
                      description: "Your optimized profile is ready.",
                    });
                    onClose();
                    resetState();
                  }
                }} 
                className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700"
                data-testid="button-apply-optimized"
              >
                Apply Optimized Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "help" && (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Our Team is Ready to Help!</h3>
              <p className="text-muted-foreground">
                We'll help you create a professional profile over WhatsApp or phone.
              </p>
            </div>

            <div className="space-y-3">
              <a 
                href="https://wa.me/27601234567?text=Hi!%20I%20need%20help%20creating%20my%20FreelanceSkills%20profile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">WhatsApp Us (Fastest)</p>
                  <p className="text-sm text-green-700">+27 60 123 4567</p>
                </div>
                <ArrowRight className="h-5 w-5 text-green-600" />
              </a>

              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-800">Call Us (Free)</p>
                  <p className="text-sm text-blue-700">0800 123 456</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">
                <strong>Available Hours:</strong><br />
                Mon-Fri: 8am - 8pm | Sat-Sun: 9am - 5pm
              </p>
            </div>

            <Button variant="outline" onClick={() => setStep("upload")} className="w-full">
              ← Back to Upload
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

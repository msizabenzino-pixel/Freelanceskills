import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Wand2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AIJobPostHelper } from "@/components/AIJobPostHelper";
import { SERVICE_CATEGORIES } from "@shared/categories";

interface JobPostSuggestion {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedBudget: { min: number; max: number };
  requiredSkills: string[];
  questions: string[];
}

export default function PostJob() {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (): Promise<{ description: string; suggestedBudget: { min: number; max: number } }> => {
      const response = await fetch("/api/ai/generate-job-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ briefDescription: title }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      return response.json();
    },
    onSuccess: (data) => {
      setDescription(data.description);
      setBudget(data.suggestedBudget?.max?.toString() || "15000");
    },
  });

  const handleAIGenerate = () => {
    if (title.length >= 5) {
      generateMutation.mutate();
    }
  };

  const handleApplyAISuggestion = (suggestion: JobPostSuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setCategory(suggestion.suggestedCategory);
    setBudget(suggestion.suggestedBudget.max.toString());
    setSkills(suggestion.requiredSkills);
    setShowAIHelper(false);
  };

  return (
    <AuthGuard message="Sign in to post a job and find talented freelancers.">
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content" className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 max-w-3xl flex-1 pb-20">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Post a New Job</h1>
            <p className="text-muted-foreground">Reach thousands of verified South African freelancers in minutes.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3 h-3" />
            AI Powered
          </div>
        </div>

        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAIHelper(!showAIHelper)}
            className="w-full justify-between"
            data-testid="button-toggle-ai-helper"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Need help writing your job post? Try our AI Assistant
            </span>
            {showAIHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          {showAIHelper && (
            <div className="mt-4">
              <AIJobPostHelper onApply={handleApplyAISuggestion} />
            </div>
          )}
        </div>

        <Card className="p-8 shadow-lg border-border">
          <form className="space-y-8">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Job Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Certified Safety Officer for 6 Months" 
                  className="h-12 text-lg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-job-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12" data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className="text-base">Description</Label>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs text-accent hover:text-accent hover:bg-accent/10 h-8"
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={generateMutation.isPending || title.length < 5}
                  data-testid="button-ai-write"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  {generateMutation.isPending ? "Generating..." : "AI Auto-Write"}
                </Button>
              </div>
              <div className="relative">
                <Textarea 
                  id="description" 
                  placeholder="Describe the project, requirements, and deliverables..." 
                  className="min-h-[200px] text-base resize-none p-4" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-description"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Location Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    className="border-2 border-primary bg-primary/5 p-4 rounded-xl text-left transition-all"
                    data-testid="button-location-type-onsite"
                  >
                    <div className="font-bold text-primary">On-site</div>
                    <div className="text-xs text-muted-foreground">Work at a specific location</div>
                  </button>
                  <button 
                    type="button" 
                    className="border border-border p-4 rounded-xl text-left hover:border-primary/50 transition-all"
                    data-testid="button-location-type-remote"
                  >
                    <div className="font-bold text-foreground">Remote</div>
                    <div className="text-xs text-muted-foreground">Work from anywhere</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="budget">Budget (ZAR)</Label>
                </div>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="e.g. 25000" 
                  className="h-[60px] text-lg"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  data-testid="input-budget"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <Input 
                placeholder="Type skills and press Enter (e.g. React, Python)" 
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
                  <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {skill} 
                    <button 
                      type="button"
                      className="hover:text-destructive"
                      onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-4">
              <Button variant="ghost" className="h-12 px-8" data-testid="button-save-draft">Save Draft</Button>
              <Button className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg" data-testid="button-post-job">Post Job Now</Button>
            </div>

          </form>
        </Card>
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
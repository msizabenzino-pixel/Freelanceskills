import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Wand2, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function PostJob() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);

  const handleAIGenerate = () => {
    if (!title) return;
    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
      setDescription(
        `We are looking for an experienced ${title} to join our project. \n\nKey Responsibilities:\n- Deliver high-quality work according to specifications\n- Collaborate with our local team in South Africa\n- Adhere to safety and compliance standards\n\nRequirements:\n- Proven experience in the field\n- Relevant certifications/qualifications\n- Reliability and punctuality\n\nThis is a great opportunity for a dedicated professional looking for consistent work.`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleAIEstimate = () => {
    setIsEstimating(true);
    setTimeout(() => {
      setBudget("15000");
      setIsEstimating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 max-w-3xl flex-1 pb-20">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trades">Trades (Plumbing, Electrical, etc.)</SelectItem>
                    <SelectItem value="construction">Construction & Safety</SelectItem>
                    <SelectItem value="dev">Development & IT</SelectItem>
                    <SelectItem value="design">Design & Creative</SelectItem>
                    <SelectItem value="writing">Writing & Translation</SelectItem>
                    <SelectItem value="admin">Admin & Customer Support</SelectItem>
                    <SelectItem value="finance">Finance & Accounting</SelectItem>
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
                  disabled={isGenerating || !title}
                >
                  {isGenerating ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  {isGenerating ? "Generating..." : "AI Auto-Write"}
                </Button>
              </div>
              <div className="relative">
                <Textarea 
                  id="description" 
                  placeholder="Describe the project, requirements, and deliverables..." 
                  className="min-h-[200px] text-base resize-none p-4" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Location Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="border-2 border-primary bg-primary/5 p-4 rounded-xl text-left transition-all">
                    <div className="font-bold text-primary">On-site</div>
                    <div className="text-xs text-muted-foreground">Work at a specific location</div>
                  </button>
                  <button type="button" className="border border-border p-4 rounded-xl text-left hover:border-primary/50 transition-all">
                    <div className="font-bold text-foreground">Remote</div>
                    <div className="text-xs text-muted-foreground">Work from anywhere</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="budget">Budget (ZAR)</Label>
                   <button 
                     type="button" 
                     className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                     onClick={handleAIEstimate}
                   >
                     {isEstimating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
                     AI Suggestion
                   </button>
                </div>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="e.g. 25000" 
                  className="h-[60px] text-lg"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <Input placeholder="Type skills and press Enter (e.g. React, Python)" className="h-12" />
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  React <button className="hover:text-destructive">×</button>
                </span>
                <span className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  TypeScript <button className="hover:text-destructive">×</button>
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-4">
              <Button variant="ghost" className="h-12 px-8">Save Draft</Button>
              <Button className="h-12 px-8 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">Post Job Now</Button>
            </div>

          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, CheckCircle2, FileText, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProposalSuggestion {
  proposal: string;
  coverLetter: string;
  keyPoints: string[];
  estimatedReadTime: string;
}

async function generateProposal(data: {
  jobTitle: string;
  jobDescription: string;
  freelancerSkills: string[];
  freelancerExperience?: string;
  freelancerName?: string;
  tone?: string;
}): Promise<ProposalSuggestion> {
  const response = await fetch("/api/ai/generate-proposal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate proposal");
  }
  return response.json();
}

interface AIProposalHelperProps {
  jobTitle?: string;
  jobDescription?: string;
  onApply?: (proposal: string) => void;
}

export function AIProposalHelper({ jobTitle = "", jobDescription = "", onApply }: AIProposalHelperProps) {
  const [title, setTitle] = useState(jobTitle);
  const [description, setDescription] = useState(jobDescription);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [name, setName] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: () => generateProposal({
      jobTitle: title,
      jobDescription: description,
      freelancerSkills: skills.split(",").map(s => s.trim()).filter(Boolean),
      freelancerExperience: experience || undefined,
      freelancerName: name || undefined,
      tone,
    }),
    onSuccess: () => {
      toast({
        title: "Proposal Generated",
        description: "Review and personalize the proposal before sending",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (title.trim().length >= 5 && description.trim().length >= 20 && skills.trim()) {
      generateMutation.mutate();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleApply = () => {
    if (generateMutation.data && onApply) {
      onApply(generateMutation.data.proposal);
    }
  };

  const result = generateMutation.data;

  return (
    <Card className="border-2 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Proposal Assistant</CardTitle>
            <CardDescription>Generate a compelling proposal tailored to the job</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              data-testid="input-proposal-job-title"
              placeholder="E.g., Senior React Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="your-name">Your Name (optional)</Label>
            <Input
              id="your-name"
              data-testid="input-proposal-name"
              placeholder="E.g., Thabo M."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="job-desc">Job Description</Label>
          <Textarea
            id="job-desc"
            data-testid="input-proposal-job-desc"
            placeholder="Paste the job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="skills">Your Relevant Skills (comma-separated)</Label>
          <Input
            id="skills"
            data-testid="input-proposal-skills"
            placeholder="E.g., React, TypeScript, Node.js, PostgreSQL"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="experience">Years of Experience (optional)</Label>
            <Input
              id="experience"
              data-testid="input-proposal-experience"
              placeholder="E.g., 5 years in web development"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="confident">Confident</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          data-testid="button-generate-proposal"
          onClick={handleGenerate}
          disabled={title.trim().length < 5 || description.trim().length < 20 || !skills.trim() || generateMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating proposal...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Proposal
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Full Proposal</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {result.estimatedReadTime} read
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.proposal)}
                    data-testid="button-copy-proposal"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Textarea
                value={result.proposal}
                readOnly
                className="min-h-[180px] text-sm"
                data-testid="output-proposal"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Short Cover Letter</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.coverLetter)}
                  data-testid="button-copy-cover"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={result.coverLetter}
                readOnly
                className="min-h-[100px] text-sm"
                data-testid="output-cover-letter"
              />
            </div>

            {result.keyPoints.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-2">
                  <Lightbulb className="h-4 w-4" />
                  Key Points to Emphasize
                </div>
                <ul className="space-y-1" data-testid="output-key-points">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex gap-2">
                      <span>•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {onApply && (
              <Button
                onClick={handleApply}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-proposal"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Use This Proposal
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

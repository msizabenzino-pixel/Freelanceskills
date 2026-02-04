import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, CheckCircle2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobPostSuggestion {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedBudget: { min: number; max: number };
  requiredSkills: string[];
  questions: string[];
}

async function generateJobPost(data: {
  briefDescription: string;
  category?: string;
  budget?: number;
  locationType?: string;
  urgency?: string;
}): Promise<JobPostSuggestion> {
  const response = await fetch("/api/ai/generate-job-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate job post");
  }
  return response.json();
}

interface AIJobPostHelperProps {
  onApply?: (jobPost: JobPostSuggestion) => void;
}

export function AIJobPostHelper({ onApply }: AIJobPostHelperProps) {
  const [briefDescription, setBriefDescription] = useState("");
  const [locationType, setLocationType] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: () => generateJobPost({
      briefDescription,
      locationType: locationType || undefined,
      urgency: urgency || undefined,
    }),
    onSuccess: () => {
      toast({
        title: "Job Post Generated",
        description: "Review the suggested job post and make any adjustments",
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
    if (briefDescription.trim().length >= 10) {
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
      onApply(generateMutation.data);
    }
  };

  const result = generateMutation.data;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Job Post Assistant</CardTitle>
            <CardDescription>Describe what you need and let AI create a professional job post</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="brief">Briefly describe what you need done</Label>
          <Textarea
            id="brief"
            data-testid="input-job-brief"
            placeholder="E.g., I need a website for my small bakery business with online ordering..."
            value={briefDescription}
            onChange={(e) => setBriefDescription(e.target.value)}
            className="mt-1.5 min-h-[100px]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="location-type">Location Preference</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger id="location-type" className="mt-1.5">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote Only</SelectItem>
                <SelectItem value="onsite">On-site Only</SelectItem>
                <SelectItem value="either">Either Works</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency" className="mt-1.5">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
                <SelectItem value="standard">Standard Timeline</SelectItem>
                <SelectItem value="flexible">Flexible / No Rush</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          data-testid="button-generate-job-post"
          onClick={handleGenerate}
          disabled={briefDescription.trim().length < 10 || generateMutation.isPending}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating job post...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Job Post
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Suggested Title</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.title)}
                  data-testid="button-copy-title"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                value={result.title}
                readOnly
                className="font-medium"
                data-testid="output-job-title"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.description)}
                  data-testid="button-copy-description"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={result.description}
                readOnly
                className="min-h-[150px] text-sm"
                data-testid="output-job-description"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Suggested Budget</Label>
                <div className="mt-1.5 p-3 rounded-lg bg-muted text-lg font-bold text-primary" data-testid="output-budget">
                  R{result.suggestedBudget.min.toLocaleString()} - R{result.suggestedBudget.max.toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Required Skills</Label>
                <div className="mt-1.5 flex flex-wrap gap-1" data-testid="output-skills">
                  {result.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {result.questions.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Screening Questions</Label>
                <ul className="mt-1.5 space-y-2" data-testid="output-questions">
                  {result.questions.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="font-medium text-primary">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {onApply && (
              <Button
                onClick={handleApply}
                className="w-full"
                data-testid="button-apply-job-post"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Use This Job Post
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

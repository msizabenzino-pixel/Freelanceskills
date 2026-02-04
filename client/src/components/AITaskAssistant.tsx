import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Loader2, TrendingUp, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import { useCountry } from "@/components/CountrySelector";
import { Link } from "wouter";

interface TaskRecommendation {
  suggestedCategories: {
    categoryId: string;
    categoryName: string;
    confidence: number;
    relevantSubcategories: string[];
  }[];
  estimatedBudgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedLocationType: "onsite" | "remote" | "either";
  urgencyLevel: "urgent" | "standard" | "flexible";
  skillsNeeded: string[];
  taskBreakdown: string[];
  tips: string[];
}

async function analyzeTask(taskDescription: string, location?: string): Promise<TaskRecommendation> {
  const response = await fetch("/api/ai/analyze-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskDescription, location }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to analyze task");
  }
  return response.json();
}

export function AITaskAssistant() {
  const [taskDescription, setTaskDescription] = useState("");
  const [location, setLocation] = useState("");
  const { formatPrice } = useCountry();

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTask(taskDescription, location),
  });

  const handleAnalyze = () => {
    if (taskDescription.trim().length >= 10) {
      analyzeMutation.mutate();
    }
  };

  const recommendation = analyzeMutation.data;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>AI Task Assistant</CardTitle>
              <CardDescription>Describe what you need done and get instant recommendations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">What do you need help with?</label>
            <Textarea
              data-testid="input-task-description"
              placeholder="E.g., I need someone to fix a leaking tap in my bathroom, install a new geyser, and check the water pressure..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be as specific as possible for better recommendations
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Your location (optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-task-location"
                placeholder="E.g., Cape Town, Johannesburg, Durban"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            data-testid="button-analyze-task"
            onClick={handleAnalyze}
            disabled={taskDescription.trim().length < 10 || analyzeMutation.isPending}
            className="w-full"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing your task...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Recommendations
              </>
            )}
          </Button>

          {analyzeMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {analyzeMutation.error?.message || "Something went wrong. Please try again."}
            </p>
          )}
        </CardContent>
      </Card>

      {recommendation && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recommended Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.suggestedCategories.map((cat, index) => (
                  <div
                    key={cat.categoryId}
                    data-testid={`category-recommendation-${index}`}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.categoryName}</span>
                        <Badge variant={cat.confidence >= 0.8 ? "default" : "secondary"}>
                          {Math.round(cat.confidence * 100)}% match
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cat.relevantSubcategories.slice(0, 4).map((sub) => (
                          <Badge key={sub} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link href={`/services?category=${cat.categoryId}`}>
                      <Button variant="ghost" size="sm" data-testid={`button-browse-${cat.categoryId}`}>
                        Browse <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Budget Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="text-budget-estimate">
                  {formatPrice(recommendation.estimatedBudgetRange.min * 100)} - {formatPrice(recommendation.estimatedBudgetRange.max * 100)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on South African market rates
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">
                    {recommendation.recommendedLocationType === "onsite"
                      ? "On-site service"
                      : recommendation.recommendedLocationType === "remote"
                      ? "Remote work"
                      : "Flexible location"}
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.urgencyLevel === "urgent"
                      ? "Urgent"
                      : recommendation.urgencyLevel === "standard"
                      ? "Standard timeline"
                      : "Flexible timing"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skills Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="skills-needed">
                  {recommendation.skillsNeeded.map((skill) => (
                    <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Task Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2" data-testid="task-breakdown">
                {recommendation.taskBreakdown.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lightbulb className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2" data-testid="pro-tips">
                {recommendation.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                    <span className="text-amber-600">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/post-job" className="flex-1">
              <Button className="w-full" size="lg" data-testid="button-post-job">
                Post a Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services" className="flex-1">
              <Button variant="outline" className="w-full" size="lg" data-testid="button-browse-services">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Loader2, TrendingUp, Lightbulb, CheckCircle2, ArrowRight, Send, User, Bot } from "lucide-react";
import { useCountry } from "@/components/CountrySelector";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendation?: TaskRecommendation;
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

async function sendChat(message: string, history: Message[]): Promise<string> {
  const response = await fetch("/api/ai/task-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      message, 
      conversationHistory: history.map(({ role, content }) => ({ role, content }))
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get AI response");
  }
  const data = await response.json();
  return data.message;
}

export function AITaskAssistant() {
  const [taskDescription, setTaskDescription] = useState("");
  const [location, setLocation] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [, navigate] = useLocation();
  const { formatPrice } = useCountry();
  const scrollRef = useRef<HTMLDivElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTask(taskDescription, location),
    onSuccess: (data) => {
      setMessages([
        { 
          role: "user", 
          content: `Task: ${taskDescription}${location ? ` (Location: ${location})` : ""}` 
        },
        { 
          role: "assistant", 
          content: "I've analyzed your task. Here are my recommendations to get you started:",
          recommendation: data 
        }
      ]);
    }
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => sendChat(message, messages),
    onSuccess: (aiMessage) => {
      setMessages(prev => [...prev, { role: "assistant", content: aiMessage }]);
    }
  });

  const handleAnalyze = () => {
    if (taskDescription.trim().length >= 10) {
      analyzeMutation.mutate();
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim() && !chatMutation.isPending) {
      const newMessage: Message = { role: "user", content: chatInput };
      setMessages(prev => [...prev, newMessage]);
      chatMutation.mutate(chatInput);
      setChatInput("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length > 0) {
    return (
      <Card className="h-[700px] flex flex-col border-2 border-primary/20">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Task Assistant Chat</CardTitle>
              <CardDescription>Refining your requirements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border"
                    }`}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="space-y-4">
                      <div className={`rounded-2xl px-4 py-2 text-sm ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                      
                      {msg.recommendation && (
                        <div className="space-y-4 w-full">
                          <Card className="bg-background">
                            <CardHeader className="pb-3 px-4 pt-4">
                              <CardTitle className="text-md flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Recommended Categories
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                              <div className="space-y-3">
                                {msg.recommendation.suggestedCategories.map((cat, index) => (
                                  <div
                                    key={cat.categoryId}
                                    data-testid={`category-recommendation-${index}`}
                                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-xs">{cat.categoryName}</span>
                                        <Badge variant={cat.confidence >= 0.8 ? "default" : "secondary"} className="text-[10px] px-1.5 h-4">
                                          {Math.round(cat.confidence * 100)}%
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(`/services?category=${cat.categoryId}`)}>
                                        Browse <ArrowRight className="ml-1 h-3 w-3" />
                                      </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="grid gap-4 md:grid-cols-2">
                            <Card className="bg-background">
                              <CardHeader className="pb-2 px-4 pt-4">
                                <CardTitle className="text-md">Budget Estimate</CardTitle>
                              </CardHeader>
                              <CardContent className="px-4 pb-4">
                                <div className="text-lg font-bold text-primary">
                                  {formatPrice(msg.recommendation.estimatedBudgetRange.min * 100)} - {formatPrice(msg.recommendation.estimatedBudgetRange.max * 100)}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="outline" className="text-[10px] px-1 h-4">
                                    {msg.recommendation.recommendedLocationType}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1 h-4">
                                    {msg.recommendation.urgencyLevel}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-background">
                              <CardHeader className="pb-2 px-4 pt-4">
                                <CardTitle className="text-md">Skills</CardTitle>
                              </CardHeader>
                              <CardContent className="px-4 pb-4">
                                <div className="flex flex-wrap gap-1">
                                  {msg.recommendation.skillsNeeded.slice(0, 5).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-[10px] px-1 h-4">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                            <CardHeader className="pb-2 px-4 pt-4">
                              <CardTitle className="text-md flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <Lightbulb className="h-4 w-4" />
                                Pro Tips
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                              <ul className="space-y-1">
                                {msg.recommendation.tips.slice(0, 2).map((tip, index) => (
                                  <li key={index} className="flex gap-2 text-xs text-amber-800 dark:text-amber-300">
                                    <span>•</span> {tip}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          <Button className="w-full h-10 text-sm" data-testid="button-post-job-chat" onClick={() => navigate("/post-job")}>
                            Ready to Post Job
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Ask follow-up questions about budget, skills, or process..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                disabled={chatMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button 
                size="icon" 
                onClick={handleSendChat} 
                disabled={!chatInput.trim() || chatMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
              <p className="text-sm text-destructive font-medium">
                {analyzeMutation.error?.message || "Something went wrong. Please try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => analyzeMutation.reset()}
                data-testid="button-retry-analysis"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

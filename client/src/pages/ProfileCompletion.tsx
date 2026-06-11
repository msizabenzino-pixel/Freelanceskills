import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionItem {
  id: string;
  label: string;
  points: number;
  done: boolean;
  link: string;
}

interface CompletionData {
  score: number;
  max: number;
  items: CompletionItem[];
  percent: number;
}

export default function ProfileCompletion() {
  const { data: completion, isLoading } = useQuery<CompletionData>({
    queryKey: ["/api/profile/completion"],
    queryFn: async () => {
      const res = await fetch("/api/profile/completion", { credentials: "include" });
      if (!res.ok) return { score: 0, max: 100, items: [], percent: 0 };
      return res.json();
    },
    staleTime: 30_000,
  });

  const items = completion?.items || [];
  const score = completion?.score || 0;
  const color = score < 60 ? "text-red-400" : score < 80 ? "text-amber-400" : "text-emerald-400";
  const bgColor = score < 60 ? "stroke-red-400" : score < 80 ? "stroke-amber-400" : "stroke-emerald-400";
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Profile Completion</h1>

            {/* Score Widget */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-28 h-28 -rotate-90">
                    <circle cx="56" cy="56" r="45" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-800" />
                    <circle
                      cx="56" cy="56" r="45" stroke="currentColor" strokeWidth="8" fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={bgColor}
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-3xl font-bold", color)}>{score}</span>
                  </div>
                </div>
                <div>
                  <p className={cn("text-lg font-bold", color)}>
                    {score < 60 ? "Your profile is incomplete" : score < 80 ? "Almost there" : "Profile complete"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {score < 60
                      ? "Complete 60% to appear in search results."
                      : "Your profile is visible to clients."
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Items List */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg p-4"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    item.done ? "bg-emerald-500/10" : "bg-slate-800"
                  )}>
                    {item.done ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={cn("text-sm font-medium", item.done ? "text-slate-400 line-through" : "text-white")}>
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">+{item.points} pts</span>
                  </div>
                  {!item.done && (
                    <Link href={item.link}>
                      <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 text-xs">
                        Add now
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

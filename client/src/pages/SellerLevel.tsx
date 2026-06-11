import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Check, Circle, Diamond, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SellerLevel() {
  const { user } = useAuth();
  const { data: level } = useQuery({
    queryKey: ["/api/seller-level", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/seller-level/${user.id}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  if (!level) return null;

  const { level: current, nextLevel, progress, stats, requirements } = level;
  const levels = [
    { name: "New Seller", icon: "🌟", min: 0 },
    { name: "Level 1", icon: "💎", min: 1 },
    { name: "Level 2", icon: "💎", min: 2 },
    { name: "Top Rated", icon: "💎", min: 3 },
    { name: "Pro", icon: "🛡️", min: 4 },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Seller Level</h1>

            {/* Current Level Card */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{current.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-white">{current.name}</div>
                  <div className="text-sm text-emerald-400">{progress}% to {nextLevel?.name || "Max Level"}</div>
                </div>
              </div>
              <Progress value={progress} className="h-3 bg-slate-800" />
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="text-sm text-slate-500 mb-1">Completed Jobs</div>
                <div className="text-xl font-bold text-white">{stats.completedJobs}</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="text-sm text-slate-500 mb-1">Rating</div>
                <div className="text-xl font-bold text-white flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  {stats.rating.toFixed(1)}
                </div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="text-sm text-slate-500 mb-1">Total Earned</div>
                <div className="text-xl font-bold text-white">R{stats.earned.toLocaleString()}</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="text-sm text-slate-500 mb-1">On-Time Delivery</div>
                <div className="text-xl font-bold text-white">{stats.onTime}%</div>
              </Card>
            </div>

            {/* Level Progression */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Level Progression</h2>
              <div className="space-y-4">
                {levels.map((l, i) => {
                  const active = i <= current.min;
                  const isNext = i === current.min + 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {active ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${active ? "text-white" : "text-slate-500"}`}>
                          {l.icon} {l.name}
                        </div>
                        {isNext && requirements && (
                          <div className="text-xs text-slate-500 mt-1">
                            Needs: {requirements.minCompleted} jobs, {requirements.rating}★ rating, {requirements.minEarnings ? `R${requirements.minEarnings.toLocaleString()}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

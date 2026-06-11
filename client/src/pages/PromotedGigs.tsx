import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Eye, MousePointer, DollarSign, Zap, BarChart3 } from "lucide-react";

export default function PromotedGigs() {
  const [budget, setBudget] = useState([500]);
  const [selectedGig, setSelectedGig] = useState<string | null>(null);

  const { data: gigs } = useQuery({
    queryKey: ["/api/freelancer-packages"],
    queryFn: async () => {
      const res = await fetch("/api/freelancer-packages", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const myGigs = gigs || [];
  const dailyBudget = budget[0];
  const estimatedImpressions = Math.floor(dailyBudget * 12);
  const estimatedClicks = Math.floor(dailyBudget * 0.8);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-2xl font-bold text-white mb-2">Promote Your Gigs</h1>
            <p className="text-sm text-slate-500 mb-6">Boost your visibility and get more clients</p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="bg-slate-900 border-slate-800 p-4">
                <Eye className="w-4 h-4 text-blue-400 mb-2" />
                <div className="text-xl font-bold text-white">2.4k</div>
                <div className="text-xs text-slate-500">Impressions</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <MousePointer className="w-4 h-4 text-emerald-400 mb-2" />
                <div className="text-xl font-bold text-white">186</div>
                <div className="text-xs text-slate-500">Clicks</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <BarChart3 className="w-4 h-4 text-amber-400 mb-2" />
                <div className="text-xl font-bold text-white">7.8%</div>
                <div className="text-xs text-slate-500">CTR</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4">
                <DollarSign className="w-4 h-4 text-violet-400 mb-2" />
                <div className="text-xl font-bold text-white">R2.7</div>
                <div className="text-xs text-slate-500">Avg CPC</div>
              </Card>
            </div>

            {/* Budget Slider */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">Daily Budget</h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-slate-500">R50</span>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  min={50}
                  max={5000}
                  step={50}
                  className="flex-1"
                />
                <span className="text-sm text-slate-500">R5,000</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-black text-white">R{dailyBudget}</span>
                <span className="text-sm text-slate-500 ml-2">/ day</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-emerald-400 font-bold">~{estimatedImpressions.toLocaleString()}</div>
                  <div className="text-slate-500 text-xs">Est. Impressions</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-emerald-400 font-bold">~{estimatedClicks}</div>
                  <div className="text-slate-500 text-xs">Est. Clicks</div>
                </div>
              </div>
            </Card>

            {/* Gig Selector */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Select Gig to Promote</h2>
              {myGigs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="mb-3">You don't have any gigs yet</p>
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                    <Zap className="w-4 h-4 mr-2" /> Create Your First Gig
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGigs.map((g: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGig(g.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedGig === g.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{g.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">R{g.price}/hr · {g.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{g.bookingCount || 0} orders</div>
                          <div className="text-xs text-slate-500">{g.rating || 0} ★</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold mt-4"
                    disabled={!selectedGig}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" /> Launch Campaign
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

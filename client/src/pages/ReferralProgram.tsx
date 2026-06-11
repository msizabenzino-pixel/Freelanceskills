import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Share2, Gift, Users, DollarSign, Trophy, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const TIERS = [
  { name: "Bronze", min: 0, reward: 150, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Silver", min: 5, reward: 200, color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Gold", min: 15, reward: 350, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { name: "Platinum", min: 30, reward: 500, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
];

export default function ReferralProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id ? `FS${user.id.slice(0, 6).toUpperCase()}` : "SIGNUP";
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://freelanceskills.net"}/signup?ref=${referralCode}`;

  const { data: stats } = useQuery({
    queryKey: ["/api/referral/stats"],
    queryFn: async () => {
      const res = await fetch("/api/referral/stats", { credentials: "include" });
      if (!res.ok) return { invited: 0, signedUp: 0, earned: 0, pending: 0 };
      return res.json();
    },
  });

  const invited = stats?.invited || 0;
  const signedUp = stats?.signedUp || 0;
  const earned = stats?.earned || 0;
  const pending = stats?.pending || 0;

  const currentTier = TIERS.slice().reverse().find(t => invited >= t.min) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > invited);
  const progress = nextTier ? Math.min(((invited - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100) : 100;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join FreelanceSkills", text: "Get R150 credit when you sign up!", url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-2">Refer & Earn</h1>
            <p className="text-sm text-slate-500 mb-6">Invite friends and earn up to R500 per referral</p>

            {/* Hero Card */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Earn R{currentTier.reward} per Friend</h2>
              <p className="text-sm text-slate-400 mb-4">Your friend gets R150 credit. You get R{currentTier.reward} when they complete their first project.</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 truncate">
                  {referralLink}
                </div>
                <Button onClick={copyLink} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" size="sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button onClick={share} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-slate-900 border-slate-800 p-4 text-center">
                <Users className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{invited}</div>
                <div className="text-xs text-slate-500">Invited</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4 text-center">
                <Check className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{signedUp}</div>
                <div className="text-xs text-slate-500">Signed Up</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4 text-center">
                <DollarSign className="w-4 h-4 text-amber-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">R{earned}</div>
                <div className="text-xs text-slate-500">Earned</div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 p-4 text-center">
                <Trophy className="w-4 h-4 text-violet-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">R{pending}</div>
                <div className="text-xs text-slate-500">Pending</div>
              </Card>
            </div>

            {/* Tier Progress */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-2">Current Tier: {currentTier.name}</h2>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{currentTier.min} invites</span>
                <span>{nextTier ? `${nextTier.min} invites` : "Max tier"}</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-800 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {TIERS.map(t => (
                  <div key={t.name} className={`text-center p-2 rounded-lg border ${t.min <= invited ? t.border : "border-slate-800"} ${t.min <= invited ? t.bg : "bg-slate-800/50"}`}>
                    <div className={`text-xs font-bold ${t.min <= invited ? t.color : "text-slate-600"}`}>{t.name}</div>
                    <div className={`text-[10px] ${t.min <= invited ? "text-slate-400" : "text-slate-600"}`}>R{t.reward}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* How it Works */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="text-sm font-semibold text-white">Share your link</div>
                    <div className="text-xs text-slate-500">Copy your unique referral link and share it</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="text-sm font-semibold text-white">Friend signs up</div>
                    <div className="text-xs text-slate-500">They get R150 credit instantly</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="text-sm font-semibold text-white">They complete a project</div>
                    <div className="text-xs text-slate-500">You earn R{currentTier.reward} when they finish their first gig</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { REWARD_TIERS, REWARDS_CATALOGUE, POINT_ACTIONS, getTierForPoints, getNextTier } from "@shared/models/rewards";
import { Trophy, Zap, Star, Gift, Clock, ChevronRight, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Transaction {
  id: number;
  amount: number;
  action: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface Redemption {
  id: number;
  rewardName: string;
  pointsCost: number;
  status: string;
  createdAt: string;
}

export default function RewardsHub() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "earn" | "redeem" | "history">("overview");

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRewards();
  }, [isAuthenticated, user?.id]);

  async function fetchRewards() {
    setLoading(true);
    try {
      const r = await fetch(`/api/rewards?userId=${user?.id || ""}`);
      const d = await r.json();
      setBalance(d.balance ?? 0);
      setTransactions(d.transactions ?? []);
      setRedemptions(d.redemptions ?? []);
    } catch {
      toast({ title: "Failed to load rewards", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem(rewardId: string) {
    if (!user?.id) { navigate("/auth"); return; }
    setRedeeming(rewardId);
    try {
      const r = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, rewardId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to redeem");
      toast({ title: "Reward redeemed!", description: `You've redeemed: ${REWARDS_CATALOGUE.find(x => x.id === rewardId)?.name}. Check your email.` });
      setBalance(d.balance);
      fetchRewards();
    } catch (err: any) {
      toast({ title: "Redemption failed", description: err.message, variant: "destructive" });
    } finally {
      setRedeeming(null);
    }
  }

  const tier = getTierForPoints(balance);
  const nextTier = getNextTier(balance);
  const progress = nextTier ? Math.min(100, ((balance - tier.min) / (nextTier.min - tier.min)) * 100) : 100;

  if (!isAuthenticated) {
    const PREVIEW_TIERS = [
      { name: "Bronze", icon: "🥉", color: "text-amber-700", bg: "bg-amber-900/20 border-amber-800/40", pts: "0" },
      { name: "Silver", icon: "🥈", color: "text-slate-300", bg: "bg-slate-800/40 border-slate-700/40", pts: "500" },
      { name: "Gold", icon: "🥇", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-600/30", pts: "2,000" },
      { name: "Diamond", icon: "💎", color: "text-violet-400", bg: "bg-violet-900/20 border-violet-600/30", pts: "10,000" },
    ];
    const PREVIEW_REWARDS = [
      { name: "Feature Boost (7 Days)", pts: "500", icon: "⚡" },
      { name: "Pro Badge (1 Month)", pts: "1,000", icon: "🏅" },
      { name: "Zero Commission Week", pts: "2,500", icon: "💸" },
      { name: "Priority Support Pass", pts: "750", icon: "🎯" },
      { name: "R250 Cash Voucher", pts: "3,000", icon: "💰" },
      { name: "Verified Pro Status", pts: "5,000", icon: "✅" },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container max-w-5xl mx-auto px-4 pt-24 pb-20 relative z-10">
            {/* Header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Trophy className="w-3.5 h-3.5" /> FreelanceSkills Rewards
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Earn Points.<br />
                <span className="text-emerald-400">Unlock Rewards.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Every job completed, review received, and profile action earns you points. Redeem for real perks — commission-free weeks, cash vouchers, and Pro status.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Link href="/auth">
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]" data-testid="button-login-rewards">
                    <Zap className="w-4 h-4" /> Join Free — Start Earning
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-semibold rounded-xl transition-all">
                    Log In to Your Account
                  </button>
                </Link>
              </div>
              <p className="text-slate-600 text-xs">50,000+ members earning rewards · Free to join</p>
            </div>

            {/* Tier preview */}
            <div className="mb-12">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-5">Membership Tiers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PREVIEW_TIERS.map((tier, i) => (
                  <div key={i} className={`rounded-2xl border p-4 text-center ${tier.bg}`}>
                    <div className="text-3xl mb-2">{tier.icon}</div>
                    <div className={`font-black text-base ${tier.color}`}>{tier.name}</div>
                    <div className="text-slate-600 text-[10px] mt-1">{tier.pts}+ pts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards catalogue preview — blurred/locked */}
            <div className="relative">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-5">Rewards Catalogue</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREVIEW_REWARDS.map((r, i) => (
                  <div key={i} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{r.name}</div>
                      <div className="text-emerald-400 text-xs font-bold mt-0.5">{r.pts} pts</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent rounded-2xl flex flex-col items-center justify-end pb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-sm font-medium">Sign in to unlock all rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero / Balance Section */}
      <section className="relative overflow-hidden pt-24 pb-12" data-testid="section-rewards-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">FreelanceSkills Rewards</span>
          </div>
          <h1 className="text-4xl font-black mb-8">Your Rewards Hub</h1>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {/* Points Balance */}
            <div className="sm:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6" data-testid="card-points-balance">
              <p className="text-slate-400 text-sm mb-1">Total Points</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black text-emerald-400" data-testid="text-balance">{balance.toLocaleString()}</span>
                <span className="text-slate-500 text-lg mb-1">pts</span>
              </div>

              {/* Tier info */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{tier.icon}</span>
                <div>
                  <span className={`font-bold text-lg ${tier.color}`}>{tier.name} Member</span>
                  {nextTier && (
                    <p className="text-slate-500 text-xs">{(nextTier.min - balance).toLocaleString()} pts to {nextTier.name}</p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {nextTier && (
                <div className="w-full bg-slate-800 rounded-full h-2" data-testid="progress-tier">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center" data-testid="stat-transactions">
                <p className="text-2xl font-black text-white">{transactions.length}</p>
                <p className="text-slate-500 text-xs mt-1">Earning Actions</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center" data-testid="stat-redemptions">
                <p className="text-2xl font-black text-white">{redemptions.length}</p>
                <p className="text-slate-500 text-xs mt-1">Rewards Redeemed</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center" data-testid="stat-tier-rank">
                <p className="text-2xl font-black text-white">{tier.icon}</p>
                <p className="text-slate-500 text-xs mt-1">{tier.name} Tier</p>
              </div>
            </div>
          </div>

          {/* Tier Progress Timeline */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 mb-4" data-testid="section-tier-progress">
            <p className="text-sm text-slate-400 font-medium mb-4">Your Journey</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {REWARD_TIERS.map((t, i) => {
                const isActive = t.name === tier.name;
                const isPast = t.min < tier.min;
                return (
                  <div key={t.name} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex flex-col items-center gap-1 ${isActive ? "scale-110" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                        ${isActive ? `${t.bg} ${t.border} shadow-lg shadow-emerald-500/10` : isPast ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 opacity-50"}`}>
                        {t.icon}
                      </div>
                      <span className={`text-[10px] font-semibold ${isActive ? t.color : isPast ? "text-slate-400" : "text-slate-600"}`}>
                        {t.name}
                      </span>
                      <span className="text-[9px] text-slate-600">{t.min >= 1000 ? `${t.min / 1000}K` : t.min}+</span>
                    </div>
                    {i < REWARD_TIERS.length - 1 && (
                      <div className={`h-0.5 w-8 rounded ${isPast ? "bg-emerald-500/50" : "bg-slate-800"} flex-shrink-0`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 sticky top-16 z-30 bg-slate-950/95 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto" data-testid="tabs-rewards">
            {([
              { id: "overview", label: "Overview" },
              { id: "earn", label: "How to Earn" },
              { id: "redeem", label: "Redeem" },
              { id: "history", label: "History" },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-10">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8" data-testid="tab-content-overview">
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
              ) : transactions.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
                  <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium mb-2">No activity yet</p>
                  <p className="text-slate-600 text-sm">Complete actions below to start earning points!</p>
                  <button onClick={() => setActiveTab("earn")} className="mt-4 text-emerald-400 text-sm font-semibold hover:underline">
                    See how to earn →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-3" data-testid={`tx-${tx.id}`}>
                      <div>
                        <p className="font-medium text-white text-sm">{tx.description}</p>
                        <p className="text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleDateString("en-ZA")}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                        </p>
                        <p className="text-slate-600 text-xs">{tx.balanceAfter.toLocaleString()} total</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length > 5 && (
                    <button onClick={() => setActiveTab("history")} className="w-full text-center text-sm text-slate-500 hover:text-emerald-400 py-2 transition-colors">
                      View all {transactions.length} transactions →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Featured Rewards</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REWARDS_CATALOGUE.slice(0, 3).map(reward => (
                  <div key={reward.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col" data-testid={`reward-card-${reward.id}`}>
                    <div className="text-3xl mb-3">{reward.icon}</div>
                    <h3 className="font-bold text-white mb-1">{reward.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 flex-1">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">{reward.cost.toLocaleString()} pts</span>
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={balance < reward.cost || redeeming === reward.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-semibold text-sm transition-all"
                        data-testid={`button-redeem-${reward.id}`}
                      >
                        {redeeming === reward.id ? "..." : balance < reward.cost ? (
                          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Need {(reward.cost - balance).toLocaleString()} more</span>
                        ) : "Redeem"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("redeem")} className="mt-4 text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                View all rewards <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* HOW TO EARN TAB */}
        {activeTab === "earn" && (
          <div data-testid="tab-content-earn">
            <h2 className="text-xl font-bold mb-2">Ways to Earn Points</h2>
            <p className="text-slate-400 mb-6">Complete these actions to build your balance and unlock better rewards.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(POINT_ACTIONS).map(([key, action]) => {
                const earned = transactions.some(t => t.action === key);
                return (
                  <div key={key} className={`flex items-center gap-4 bg-slate-900/60 border rounded-xl p-4 transition-all ${earned ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800"}`} data-testid={`earn-action-${key}`}>
                    <div className="text-2xl flex-shrink-0">{action.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{action.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{action.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${earned ? "text-emerald-400" : "text-slate-300"}`}>+{action.points}</p>
                      {earned && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mt-1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REDEEM TAB */}
        {activeTab === "redeem" && (
          <div data-testid="tab-content-redeem">
            <h2 className="text-xl font-bold mb-2">Rewards Catalogue</h2>
            <p className="text-slate-400 mb-6">You have <span className="text-emerald-400 font-bold">{balance.toLocaleString()} points</span> to spend.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REWARDS_CATALOGUE.map(reward => {
                const canAfford = balance >= reward.cost;
                const alreadyRedeemed = redemptions.some(r => r.rewardName === reward.name && r.status === "pending");
                return (
                  <div key={reward.id} className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col transition-all ${canAfford ? "border-slate-700 hover:border-emerald-500/40" : "border-slate-800/50 opacity-70"}`} data-testid={`reward-${reward.id}`}>
                    <div className="text-4xl mb-3">{reward.icon}</div>
                    <h3 className="font-bold text-white mb-1">{reward.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 flex-1">{reward.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className={`font-bold ${canAfford ? "text-emerald-400" : "text-slate-500"}`}>{reward.cost.toLocaleString()} pts</span>
                        {!canAfford && (
                          <p className="text-xs text-red-400 mt-0.5">Need {(reward.cost - balance).toLocaleString()} more</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canAfford || redeeming === reward.id || alreadyRedeemed}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-sm transition-all flex items-center gap-1.5"
                        data-testid={`redeem-btn-${reward.id}`}
                      >
                        {redeeming === reward.id ? (
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : alreadyRedeemed ? (
                          <><CheckCircle2 className="w-4 h-4" /> Redeemed</>
                        ) : !canAfford ? (
                          <><Lock className="w-3 h-3" /> Locked</>
                        ) : "Redeem"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div data-testid="tab-content-history">
            <h2 className="text-xl font-bold mb-6">Transaction History</h2>
            {transactions.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
                <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800/50 rounded-xl px-5 py-3.5" data-testid={`history-tx-${tx.id}`}>
                    <div>
                      <p className="font-medium text-white">{tx.description}</p>
                      <p className="text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleString("en-ZA")}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                      </p>
                      <p className="text-slate-600 text-xs">Balance: {tx.balanceAfter.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {redemptions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Redemption History</h3>
                <div className="space-y-2">
                  {redemptions.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800/50 rounded-xl px-5 py-3.5" data-testid={`redemption-${r.id}`}>
                      <div>
                        <p className="font-medium text-white">{r.rewardName}</p>
                        <p className="text-slate-500 text-xs">{new Date(r.createdAt).toLocaleString("en-ZA")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">-{r.pointsCost} pts</p>
                        <p className="text-xs capitalize text-slate-500">{r.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  Share2,
  UserPlus,
  Coins,
  Trophy,
  Copy,
  Mail,
  Facebook,
  ChevronDown,
  ChevronUp,
  Crown,
  Star,
  Award,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const REWARD_TIERS = [
  {
    name: "Bronze",
    range: "1–5 referrals",
    reward: "R100",
    perks: ["R100 credit per successful referral"],
    color: "bg-amber-700/10 text-amber-700 border-amber-700/20",
    iconColor: "text-amber-700",
    icon: Star,
  },
  {
    name: "Silver",
    range: "6–15 referrals",
    reward: "R150",
    perks: ["R150 credit per successful referral", "Featured Profile badge"],
    color: "bg-gray-400/10 text-gray-500 border-gray-400/20",
    iconColor: "text-gray-500",
    icon: Award,
  },
  {
    name: "Gold",
    range: "16–50 referrals",
    reward: "R200",
    perks: ["R200 credit per successful referral", "Premium month free"],
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    iconColor: "text-yellow-600",
    icon: Trophy,
  },
  {
    name: "Platinum",
    range: "50+ referrals",
    reward: "R250",
    perks: ["R250 credit per successful referral", "Ambassador status", "Exclusive perks & early access"],
    color: "bg-primary/10 text-primary border-primary/20",
    iconColor: "text-primary",
    icon: Crown,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Thabo M.", referrals: 87, earned: "R21,750", tier: "Platinum" },
  { rank: 2, name: "Naledi K.", referrals: 63, earned: "R15,750", tier: "Platinum" },
  { rank: 3, name: "Johan V.", referrals: 41, earned: "R8,200", tier: "Gold" },
  { rank: 4, name: "Amina D.", referrals: 28, earned: "R5,600", tier: "Gold" },
  { rank: 5, name: "Sipho N.", referrals: 14, earned: "R2,100", tier: "Silver" },
];

const FAQ_ITEMS = [
  {
    q: "How do I get my referral link?",
    a: "Once you sign up or log in, head to your Dashboard. Your unique referral link is generated automatically and can be shared via the buttons on this page or copied to your clipboard.",
  },
  {
    q: "When do I get paid?",
    a: "You earn your referral credit once your friend completes their first job on the platform and the client approves the work. Credits are added to your wallet within 24 hours.",
  },
  {
    q: "Is there a limit on how many people I can refer?",
    a: "No! There is no cap on referrals. The more people you refer, the higher your reward tier and the more you earn per referral.",
  },
  {
    q: "Can I refer someone who already has an account?",
    a: "Referral credits are only awarded for new users who sign up using your unique link. Existing users are not eligible for the referral program.",
  },
  {
    q: "How does the tier system work?",
    a: "Your tier is based on total successful referrals. As you reach each milestone, your per-referral reward increases and you unlock additional perks like Featured Profile badges and Premium months.",
  },
];

export default function Referral() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const { data: referralData } = useQuery<any>({
    queryKey: ["/api/referrals/stats"],
    enabled: !!user,
  });

  const { data: myCodeData } = useQuery<any>({
    queryKey: ["/api/referrals/my-code"],
    enabled: !!user,
  });

  const referralCode = myCodeData?.referralCode || "YOUR_CODE";
  const referralLink = `https://freelanceskills.net/auth?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTier = referralData?.tier || "bronze";
  const stats = [
    { label: "Total Referred", value: referralData?.totalReferred || 0, icon: UserPlus },
    { label: "Total Earned", value: `R${(referralData?.totalEarned || 0) / 100}`, icon: Coins },
    { label: "Pending Rewards", value: `R${(referralData?.pendingRewards || 0) / 100}`, icon: Gift },
    { label: "Current Tier", value: currentTier.charAt(0).toUpperCase() + currentTier.slice(1), icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6">
              <Gift className="w-4 h-4" /> Referral Program
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6" data-testid="text-referral-heading">
              Earn While You Share
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Refer friends to FreelanceSkills, and you both earn rewards. The more you share, the more you earn.
            </p>
            {user ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                    <stat.icon className="h-5 w-5 mx-auto mb-2 text-accent" />
                    <div className="text-xs text-white/60 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <a href="/auth">
                <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold gap-2" data-testid="button-get-referral-link-hero">
                  <Gift className="h-4 w-4" /> Get Your Referral Link
                </Button>
              </a>
            )}
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg">Three simple steps to start earning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: 1, icon: Share2, title: "Share Your Unique Link", desc: "Copy your personal referral link and share it with friends, family, or on social media." },
                { step: 2, icon: UserPlus, title: "Friend Signs Up & Works", desc: "Your friend creates an account using your link and completes their first job on the platform." },
                { step: 3, icon: Coins, title: "You Both Earn R100", desc: "Once the job is approved, you and your friend each receive R100 credit in your wallets." },
              ].map((item) => (
                <div key={item.step} className="text-center" data-testid={`card-step-${item.step}`}>
                  <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-1">Step {item.step}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Rewards Tiers</h2>
              <p className="text-muted-foreground text-lg">The more you refer, the more you earn per referral.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {REWARD_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-6 text-center transition-all ${
                    currentTier.toLowerCase() === tier.name.toLowerCase() 
                    ? "ring-2 ring-primary scale-105 shadow-lg z-10" 
                    : "opacity-75 grayscale-[0.5]"
                  } ${tier.color}`}
                  data-testid={`card-tier-${tier.name.toLowerCase()}`}
                >
                  <tier.icon className={`h-10 w-10 mx-auto mb-3 ${tier.iconColor}`} />
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm opacity-80 mb-4">{tier.range}</p>
                  <div className="text-3xl font-display font-bold mb-4">{tier.reward}<span className="text-base font-normal opacity-70"> / referral</span></div>
                  <ul className="space-y-2 text-left">
                    {tier.perks.map((perk, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  {currentTier.toLowerCase() === tier.name.toLowerCase() && (
                    <div className="mt-4 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full inline-block">
                      CURRENT TIER
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-primary mb-4">Referral Leaderboard</h2>
              <p className="text-muted-foreground">Top referrers this month</p>
            </div>

            <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Rank</span>
                <span>Name</span>
                <span>Referrals</span>
                <span>Earned</span>
              </div>
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 border-t border-border items-center"
                  data-testid={`row-leaderboard-${entry.rank}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank <= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {entry.rank}
                  </span>
                  <div>
                    <span className="font-medium">{entry.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{entry.tier}</span>
                  </div>
                  <span className="font-semibold">{entry.referrals}</span>
                  <span className="font-semibold text-green-600">{entry.earned}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-primary mb-4">Share Your Link</h2>
              <p className="text-muted-foreground">Spread the word using your favourite platform.</p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-2 bg-muted rounded-xl p-2 mb-6">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                  data-testid="input-referral-link"
                />
                <Button size="sm" onClick={handleCopy} className="gap-1.5 shrink-0" data-testid="button-copy-link">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={`https://wa.me/?text=Join%20FreelanceSkills%20and%20earn!%20${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2" data-testid="button-share-whatsapp">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </Button>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2" data-testid="button-share-facebook">
                    <Facebook className="h-4 w-4" /> Facebook
                  </Button>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Join%20FreelanceSkills%20and%20earn!&url=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2" data-testid="button-share-x">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </Button>
                </a>
                <a href={`mailto:?subject=Join%20FreelanceSkills&body=Sign%20up%20using%20my%20link:%20${encodeURIComponent(referralLink)}`}>
                  <Button variant="outline" className="gap-2" data-testid="button-share-email">
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border overflow-hidden" data-testid={`card-faq-${i}`}>
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-muted transition-colors"
                      data-testid={`button-faq-${i}`}
                    >
                      <span className="font-medium">{faq.q}</span>
                      {expandedFaq === i ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-4 text-muted-foreground text-sm">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
              Sign up today and get your unique referral link. Share it with your network and watch the rewards roll in.
            </p>
            {user ? (
              <Button size="lg" onClick={handleCopy} className="bg-accent text-primary hover:bg-accent/90 font-bold gap-2 px-8" data-testid="button-get-referral-link-cta">
                <Gift className="h-4 w-4" /> Copy Your Referral Link
              </Button>
            ) : (
              <a href="/auth">
                <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold gap-2 px-8" data-testid="button-get-referral-link-cta">
                  <Gift className="h-4 w-4" /> Get Your Referral Link
                </Button>
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

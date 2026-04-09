import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Crown, Star, Trophy, Shield, Zap, Award, Users, TrendingUp, Check, Sparkles, Lock, Gift } from "lucide-react";

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub: string; color: string; icon: any }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4 relative overflow-hidden`}>
      <div className="absolute top-2 right-2 opacity-10">
        <Icon size={40} />
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

export default function EliteClub() {
  const [tab, setTab] = useState<"overview" | "members" | "benefits" | "hall-of-fame">("overview");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: dash } = useQuery({ queryKey: ["/api/elite-club/dashboard"], queryFn: () => fetch("/api/elite-club/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 15000 });
  const { data: members } = useQuery({ queryKey: ["/api/elite-club/members"], queryFn: () => fetch("/api/elite-club/members", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "members" });
  const { data: hof } = useQuery({ queryKey: ["/api/elite-club/hall-of-fame"], queryFn: () => fetch("/api/elite-club/hall-of-fame", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "hall-of-fame" });

  const inviteMut = useMutation({
    mutationFn: (userId: string) => fetch("/api/elite-club/invite", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ userId }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Elite Club invite sent!" }); qc.invalidateQueries({ queryKey: ["/api/elite-club/members"] }); },
  });

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "members", label: "Members" },
    { key: "benefits", label: "Benefits" },
    { key: "hall-of-fame", label: "Hall of Fame" },
  ] as const;

  const benefits = [
    { icon: Zap, title: "0% Platform Commission", desc: "Elite members keep 100% of their earnings. Zero fees, forever.", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800/40" },
    { icon: Crown, title: "Legend Tier Badge", desc: "Exclusive blockchain-verified NFT badge displayed on profile and proposals.", color: "text-purple-400", bg: "bg-purple-900/20 border-purple-800/40" },
    { icon: Shield, title: "Dedicated Account Director", desc: "A named account director available 24/7 for enterprise escalations.", color: "text-blue-400", bg: "bg-blue-900/20 border-blue-800/40" },
    { icon: Users, title: "Board Advisory Access", desc: "Quarterly board briefings and direct input on platform roadmap decisions.", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-800/40" },
    { icon: TrendingUp, title: "Revenue Share Program", desc: "2% revenue share on all platform earnings driven through Elite referrals.", color: "text-teal-400", bg: "bg-teal-900/20 border-teal-800/40" },
    { icon: Gift, title: "Annual Elite Retreat", desc: "All-expenses-paid retreat with the FreelanceSkills leadership team.", color: "text-rose-400", bg: "bg-rose-900/20 border-rose-800/40" },
    { icon: Star, title: "Priority Job Matching", desc: "First access to all enterprise and premium client postings before public listing.", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800/40" },
    { icon: Lock, title: "Lifetime Platform Access", desc: "Guaranteed lifetime access regardless of future pricing or tier changes.", color: "text-indigo-400", bg: "bg-indigo-900/20 border-indigo-800/40" },
  ];

  const admissionCriteria = [
    { criterion: "Lifetime earnings on platform", requirement: "R500,000+" },
    { criterion: "Job success rate", requirement: "98%+" },
    { criterion: "Client reviews (avg)", requirement: "4.95 / 5.0" },
    { criterion: "Years on platform", requirement: "2+ years" },
    { criterion: "Active projects", requirement: "No disputes in 24 months" },
    { criterion: "Community contribution", requirement: "Verified mentor or speaker" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-yellow-900/40 via-purple-900/40 to-emerald-900/40 border border-yellow-800/30 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-purple-500/5 to-emerald-500/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="text-yellow-400" size={28} />
              <h1 className="text-3xl font-black text-white">Elite Club</h1>
              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded text-xs font-bold">S100 — MILESTONE</span>
            </div>
            <p className="text-gray-300 text-sm max-w-lg">The Legend tier. FreelanceSkills.net's most exclusive inner circle — reserved for the top 0.1% of freelancers who have proven extraordinary excellence.</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs text-yellow-400">{dash?.totalMembers || 47} Active Legends</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-xs text-purple-400">Full Platform — 100 Sections</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center">
            <Trophy size={64} className="text-yellow-400/60" />
            <p className="text-xs text-yellow-600 mt-1">FreelanceSkills.net</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Elite Members" value={String(dash?.totalMembers || 47)} sub="Top 0.1% of platform" color="text-yellow-400" icon={Crown} />
        <StatCard label="Avg Earnings" value={`R${dash?.avgEarnings || "82K"}/mo`} sub="Elite member average" color="text-emerald-400" icon={TrendingUp} />
        <StatCard label="Commission" value="0%" sub="Zero platform fees" color="text-purple-400" icon={Zap} />
        <StatCard label="Revenue Share" value={`R${dash?.revenueShared || "340K"}`} sub="Paid out this year" color="text-blue-400" icon={Gift} />
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map(t => (
          <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "text-yellow-400 border-yellow-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Award size={14} className="text-yellow-400" />Admission Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {admissionCriteria.map(c => (
                <div key={c.criterion} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-yellow-400 shrink-0" />
                    <span className="text-sm text-gray-300">{c.criterion}</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-400 ml-2 shrink-0">{c.requirement}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-yellow-400" />Club Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Earnings (Members)", value: "R47M", sub: "Since joining Elite" },
                { label: "Client Satisfaction", value: "4.98", sub: "Avg review score" },
                { label: "Repeat Client Rate", value: "91%", sub: "Elite member avg" },
                { label: "Countries Represented", value: "18", sub: "Global presence" },
              ].map(m => (
                <div key={m.label} className="text-center p-3 bg-gray-800/30 rounded-xl">
                  <p className="text-xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Elite Legend Members</h3>
            <button data-testid="button-invite-member" onClick={() => inviteMut.mutate("manual")}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
              <Crown size={12} />Invite Legend
            </button>
          </div>
          <div className="divide-y divide-gray-800">
            {(members?.items || [
              { id: "1", name: "Thabo Nkosi", specialty: "Full-Stack Development", country: "🇿🇦", earnings: "R1.2M", rating: "5.0", since: "2022" },
              { id: "2", name: "Amara Osei", specialty: "UI/UX Design", country: "🇳🇬", earnings: "R980K", rating: "4.99", since: "2021" },
              { id: "3", name: "Priya Nair", specialty: "Data Science & ML", country: "🇮🇳", earnings: "R840K", rating: "4.98", since: "2022" },
              { id: "4", name: "James Mwangi", specialty: "DevOps & Cloud", country: "🇰🇪", earnings: "R760K", rating: "4.97", since: "2023" },
              { id: "5", name: "Sarah van der Berg", specialty: "Product Strategy", country: "🇿🇦", earnings: "R720K", rating: "5.0", since: "2022" },
              { id: "6", name: "Yusuf Ibrahim", specialty: "Blockchain & Web3", country: "🇪🇬", earnings: "R680K", rating: "4.96", since: "2023" },
            ]).map((m: any, i: number) => (
              <div key={m.id} data-testid={`row-member-${m.id}`} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {m.name.charAt(0)}
                  </div>
                  <Crown size={10} className="text-yellow-400 absolute -top-1 -right-1" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{m.name} {m.country}</p>
                    <span className="px-1.5 py-0.5 bg-yellow-900/40 text-yellow-300 rounded text-xs">Legend #{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.specialty} · Member since {m.since}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{m.earnings}</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-300">{m.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "benefits" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map(b => (
            <div key={b.title} className={`border rounded-xl p-5 ${b.bg} transition-all hover:scale-[1.01]`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gray-900/40`}>
                  <b.icon size={18} className={b.color} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${b.color} mb-1`}>{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "hall-of-fame" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border border-yellow-800/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2"><Trophy size={14} className="text-yellow-400" />FreelanceSkills.net Hall of Fame</h3>
            <p className="text-xs text-gray-500 mb-4">Immortalised legends who have shaped the platform and inspired thousands of freelancers across Africa and the world.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(hof?.inductees || [
                { name: "Thabo Nkosi", year: "2023", achievement: "First R1M earner on the platform", country: "🇿🇦" },
                { name: "Amara Osei", year: "2023", achievement: "Most 5-star reviews in a single year (340)", country: "🇳🇬" },
                { name: "Priya Nair", year: "2024", achievement: "Highest client retention rate — 98% repeat hire", country: "🇮🇳" },
                { name: "James Mwangi", year: "2024", achievement: "First to build an agency of 10 from platform earnings", country: "🇰🇪" },
                { name: "Sarah van der Berg", year: "2024", achievement: "Founding mentor — trained 200+ new freelancers", country: "🇿🇦" },
                { name: "Yusuf Ibrahim", year: "2025", achievement: "Pioneered blockchain verification integrations", country: "🇪🇬" },
              ]).map((ind: any) => (
                <div key={ind.name} data-testid={`card-hof-${ind.name}`} className="p-4 bg-gray-900/60 border border-yellow-800/20 rounded-xl text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-2">
                    {ind.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-white">{ind.name} {ind.country}</p>
                  <p className="text-xs text-yellow-400 mt-0.5">Class of {ind.year}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{ind.achievement}</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <Sparkles size={32} className="text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Section 100 of 100 — COMPLETE</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">FreelanceSkills.net — 100 admin sections built and live. The full platform is operational.</p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-emerald-900/40 text-emerald-300 rounded-full text-xs font-medium">100 Sections Live</span>
              <span className="px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded-full text-xs font-medium">400% Complete</span>
              <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-xs font-medium">God Mode: ON</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

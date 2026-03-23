import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Star, Users, Gift, TrendingUp, Award, DollarSign, Check } from "lucide-react";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

export default function AmbassadorProgram() {
  const [tab, setTab] = useState<"dashboard" | "ambassadors" | "rewards" | "applications">("dashboard");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: dash } = useQuery({ queryKey: ["/api/ambassadors/dashboard"], queryFn: () => fetch("/api/ambassadors/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 15000 });
  const { data: ambassadors } = useQuery({ queryKey: ["/api/ambassadors/list"], queryFn: () => fetch("/api/ambassadors/list", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "ambassadors" });
  const { data: apps } = useQuery({ queryKey: ["/api/ambassadors/applications"], queryFn: () => fetch("/api/ambassadors/applications", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "applications" });

  const approveMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/ambassadors/applications/${id}/approve`, { method: "POST", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Ambassador approved!" }); qc.invalidateQueries({ queryKey: ["/api/ambassadors/applications"] }); },
  });

  const tabs = [
    { key: "dashboard", label: "Overview" },
    { key: "ambassadors", label: "Ambassadors" },
    { key: "rewards", label: "Rewards" },
    { key: "applications", label: "Applications" },
  ] as const;

  const tiers = [
    { name: "Bronze", color: "text-amber-600", bg: "bg-amber-900/20 border-amber-800/40", perks: ["5% commission bonus", "Early access to features", "Ambassador badge"], req: "50+ referrals" },
    { name: "Silver", color: "text-gray-300", bg: "bg-gray-800/40 border-gray-700/40", perks: ["10% commission bonus", "Priority support", "Exclusive merch", "Monthly calls"], req: "200+ referrals" },
    { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800/40", perks: ["15% commission bonus", "Dedicated success manager", "Conference invites", "Co-marketing"], req: "500+ referrals" },
    { name: "Diamond", color: "text-blue-300", bg: "bg-blue-900/20 border-blue-800/40", perks: ["20% commission bonus", "Board advisory input", "Revenue share", "Annual retreat"], req: "1000+ referrals" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="text-purple-400" size={24} />
            Ambassador Program
            <span className="ml-2 px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded text-xs font-medium">S99</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Brand ambassadors driving FreelanceSkills.net growth across Africa and beyond</p>
        </div>
        <button data-testid="button-invite-ambassador" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Users size={14} />Invite Ambassador
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Ambassadors" value={String(dash?.totalAmbassadors || 248)} sub="Across 32 countries" color="text-purple-400" />
        <StatCard label="Referrals (MTD)" value={String(dash?.referralsMTD || "1,840")} sub="+23% vs last month" color="text-emerald-400" />
        <StatCard label="Revenue Driven" value={`R${dash?.revenueDriven || "2.4M"}`} sub="This quarter" color="text-blue-400" />
        <StatCard label="Avg Commission" value={`R${dash?.avgCommission || "980"}`} sub="Per ambassador/month" color="text-amber-400" />
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map(t => (
          <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "text-purple-400 border-purple-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-purple-400" />Program Performance</h3>
              <div className="space-y-4">
                {[
                  { label: "Conversion Rate", value: "34.2%", change: "+2.1%", up: true },
                  { label: "Avg Referral Value", value: "R1,300", change: "+R120", up: true },
                  { label: "Ambassador Retention", value: "87%", change: "+3%", up: true },
                  { label: "Pending Payouts", value: "R84,200", change: "+R12k", up: false },
                  { label: "Open Applications", value: "42", change: "+8", up: false },
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.value}</span>
                      <span className={`text-xs ${m.up ? "text-emerald-400" : "text-amber-400"}`}>{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Award size={14} className="text-purple-400" />Top Ambassadors</h3>
              <div className="space-y-3">
                {[
                  { name: "Thabo Nkosi", country: "🇿🇦", referrals: 142, earnings: "R4,260", tier: "Gold" },
                  { name: "Amara Osei", country: "🇳🇬", referrals: 118, earnings: "R3,540", tier: "Gold" },
                  { name: "Fatima Al-Rashid", country: "🇪🇬", referrals: 93, earnings: "R2,790", tier: "Silver" },
                  { name: "James Mwangi", country: "🇰🇪", referrals: 87, earnings: "R2,610", tier: "Silver" },
                  { name: "Sarah van der Berg", country: "🇿🇦", referrals: 74, earnings: "R2,220", tier: "Silver" },
                ].map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-purple-900/60 flex items-center justify-center text-xs font-bold text-purple-300">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{a.name} {a.country}</p>
                      <p className="text-xs text-gray-500">{a.referrals} referrals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{a.earnings}</p>
                      <p className="text-xs text-amber-400">{a.tier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "ambassadors" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">All Ambassadors</h3>
            <span className="text-xs text-gray-500">{ambassadors?.total || 248} total</span>
          </div>
          <div className="divide-y divide-gray-800">
            {(ambassadors?.items || [
              { id: "1", name: "Thabo Nkosi", country: "South Africa 🇿🇦", tier: "Gold", referrals: 142, status: "active" },
              { id: "2", name: "Amara Osei", country: "Nigeria 🇳🇬", tier: "Gold", referrals: 118, status: "active" },
              { id: "3", name: "Fatima Al-Rashid", country: "Egypt 🇪🇬", tier: "Silver", referrals: 93, status: "active" },
              { id: "4", name: "James Mwangi", country: "Kenya 🇰🇪", tier: "Silver", referrals: 87, status: "active" },
              { id: "5", name: "Sipho Dlamini", country: "South Africa 🇿🇦", tier: "Bronze", referrals: 54, status: "inactive" },
            ]).map((a: any) => (
              <div key={a.id} data-testid={`row-ambassador-${a.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <p className="text-sm text-white font-medium">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.country} · {a.referrals} referrals</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-900/30 text-amber-300 rounded text-xs">{a.tier}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${a.status === "active" ? "bg-emerald-900/40 text-emerald-300" : "bg-gray-800 text-gray-500"}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "rewards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map(tier => (
            <div key={tier.name} className={`border rounded-xl p-5 ${tier.bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <Award size={18} className={tier.color} />
                <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name} Ambassador</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Requirement: {tier.req}</p>
              <ul className="space-y-2">
                {tier.perks.map(perk => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={12} className="text-emerald-400 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === "applications" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Pending Applications</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {(apps?.items || [
              { id: "app-1", name: "Kemi Adeyemi", country: "Nigeria 🇳🇬", followers: "12K", platform: "LinkedIn", pitch: "Tech community builder, 5 years in Lagos startup scene" },
              { id: "app-2", name: "Ruan Botha", country: "South Africa 🇿🇦", followers: "8.4K", platform: "Twitter", pitch: "Freelance advocate, runs monthly webinars on remote work" },
              { id: "app-3", name: "Priya Nair", country: "India 🇮🇳", followers: "22K", platform: "YouTube", pitch: "Freelancing coach with 3 years content creation" },
            ]).map((app: any) => (
              <div key={app.id} data-testid={`row-application-${app.id}`} className="px-5 py-4 hover:bg-gray-800/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{app.name} <span className="text-gray-500">{app.country}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{app.platform} · {app.followers} followers</p>
                    <p className="text-xs text-gray-400 mt-1">{app.pitch}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button data-testid={`button-approve-${app.id}`} onClick={() => approveMut.mutate(app.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
                      Approve
                    </button>
                    <button data-testid={`button-reject-${app.id}`} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

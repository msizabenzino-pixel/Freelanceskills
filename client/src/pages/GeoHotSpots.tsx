import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, TrendingUp, Globe, Users, Zap, DollarSign } from "lucide-react";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

export default function GeoHotSpots() {
  const [tab, setTab] = useState<"overview" | "regions" | "trending" | "opportunities">("overview");
  const { data: dash } = useQuery({ queryKey: ["/api/hotspots/dashboard"], queryFn: () => fetch("/api/hotspots/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 15000 });
  const { data: regions } = useQuery({ queryKey: ["/api/hotspots/regions"], queryFn: () => fetch("/api/hotspots/regions", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "regions" });
  const { data: trending } = useQuery({ queryKey: ["/api/hotspots/trending"], queryFn: () => fetch("/api/hotspots/trending", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "trending" });

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "regions", label: "Regions" },
    { key: "trending", label: "Trending" },
    { key: "opportunities", label: "Opportunities" },
  ] as const;

  const topRegions = [
    { country: "South Africa", flag: "🇿🇦", freelancers: 12400, growth: "+18%", avgRate: "R320/hr", heat: 95 },
    { country: "Nigeria", flag: "🇳🇬", freelancers: 8900, growth: "+31%", avgRate: "R180/hr", heat: 88 },
    { country: "Kenya", flag: "🇰🇪", freelancers: 6200, growth: "+24%", avgRate: "R210/hr", heat: 82 },
    { country: "United Kingdom", flag: "🇬🇧", freelancers: 5100, growth: "+9%", avgRate: "R1,200/hr", heat: 76 },
    { country: "United States", flag: "🇺🇸", freelancers: 4800, growth: "+6%", avgRate: "R1,850/hr", heat: 71 },
    { country: "India", flag: "🇮🇳", freelancers: 4200, growth: "+15%", avgRate: "R95/hr", heat: 68 },
    { country: "Germany", flag: "🇩🇪", freelancers: 2900, growth: "+11%", avgRate: "R1,400/hr", heat: 61 },
    { country: "Egypt", flag: "🇪🇬", freelancers: 2100, growth: "+27%", avgRate: "R140/hr", heat: 55 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-teal-400" size={24} />
            Geo HotSpots
            <span className="ml-2 px-2 py-0.5 bg-teal-900/40 text-teal-300 rounded text-xs font-medium">S98</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Geographic market intelligence — where talent and demand are surging</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-900/30 border border-teal-800/40 rounded-lg">
          <Globe size={12} className="text-teal-400" />
          <span className="text-xs text-teal-400">{dash?.activeCountries || 54} Active Markets</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Top Market" value={dash?.topMarket || "South Africa"} sub="18% MoM growth" color="text-teal-400" />
        <StatCard label="Fastest Growing" value={dash?.fastestGrowing || "Nigeria"} sub="+31% freelancers" color="text-emerald-400" />
        <StatCard label="Active Markets" value={String(dash?.activeCountries || 54)} sub="6 continents" color="text-blue-400" />
        <StatCard label="Cross-border Jobs" value={String(dash?.crossBorderJobs || "1,240")} sub="This month" color="text-purple-400" />
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map(t => (
          <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "text-teal-400 border-teal-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-teal-400" />Heat Map — Top Markets</h3>
            <div className="space-y-3">
              {topRegions.map(r => (
                <div key={r.country} data-testid={`row-region-${r.country}`} className="flex items-center gap-4">
                  <span className="text-xl">{r.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">{r.country}</span>
                      <span className="text-gray-500">{r.freelancers.toLocaleString()} freelancers · {r.avgRate}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all" style={{ width: `${r.heat}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 w-12 text-right">{r.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "regions" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Regional Breakdown</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {(regions?.items || [
              { region: "Sub-Saharan Africa", countries: 22, freelancers: 24600, revenue: "R4.2M", growth: "+24%" },
              { region: "Western Europe", countries: 12, freelancers: 11200, revenue: "R18.7M", growth: "+8%" },
              { region: "North America", countries: 3, freelancers: 9800, revenue: "R22.1M", growth: "+6%" },
              { region: "South Asia", countries: 5, freelancers: 7400, revenue: "R3.1M", growth: "+19%" },
              { region: "North Africa", countries: 6, freelancers: 5200, revenue: "R2.4M", growth: "+22%" },
              { region: "Southeast Asia", countries: 8, freelancers: 4100, revenue: "R2.9M", growth: "+14%" },
            ]).map((r: any) => (
              <div key={r.region} className="px-5 py-4 hover:bg-gray-800/30 grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2">
                  <p className="text-sm text-white font-medium">{r.region}</p>
                  <p className="text-xs text-gray-500">{r.countries} countries</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{typeof r.freelancers === "number" ? r.freelancers.toLocaleString() : r.freelancers}</p>
                  <p className="text-xs text-gray-500">Freelancers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{r.revenue}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 rounded text-xs">{r.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "trending" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap size={14} className="text-teal-400" />Trending Skills by Region</h3>
            <div className="space-y-3">
              {(trending?.skills || [
                { skill: "React Development", region: "South Africa", demand: "Very High" },
                { skill: "Python / ML", region: "Nigeria", demand: "High" },
                { skill: "UI/UX Design", region: "Kenya", demand: "High" },
                { skill: "Blockchain Dev", region: "South Africa", demand: "Rising" },
                { skill: "Data Analytics", region: "Egypt", demand: "High" },
                { skill: "DevOps / Cloud", region: "Nigeria", demand: "Very High" },
              ]).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm text-white">{s.skill}</p>
                    <p className="text-xs text-gray-500">{s.region}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${s.demand === "Very High" ? "bg-red-900/40 text-red-300" : s.demand === "High" ? "bg-amber-900/40 text-amber-300" : "bg-blue-900/40 text-blue-300"}`}>{s.demand}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><DollarSign size={14} className="text-teal-400" />Rate Benchmarks</h3>
            <div className="space-y-3">
              {[
                { market: "South Africa", role: "Senior Dev", rate: "R480/hr" },
                { market: "UK", role: "Senior Dev", rate: "R1,800/hr" },
                { market: "Nigeria", role: "Senior Dev", rate: "R220/hr" },
                { market: "Kenya", role: "Senior Dev", rate: "R260/hr" },
                { market: "USA", role: "Senior Dev", rate: "R2,400/hr" },
                { market: "India", role: "Senior Dev", rate: "R120/hr" },
              ].map(r => (
                <div key={r.market} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm text-white">{r.market}</p>
                    <p className="text-xs text-gray-500">{r.role}</p>
                  </div>
                  <span className="text-sm font-bold text-teal-400">{r.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "opportunities" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={14} className="text-teal-400" />Expansion Opportunities</h3>
          {[
            { market: "Ghana 🇬🇭", opportunity: "Fast-growing tech hub, low competition, high English proficiency", potential: "High", action: "Launch marketing campaign" },
            { market: "Rwanda 🇷🇼", opportunity: "Government-backed digital economy, 4G+ coverage", potential: "Medium", action: "Partner with local agencies" },
            { market: "UAE 🇦🇪", opportunity: "High-value enterprise clients, premium rates", potential: "Very High", action: "Open regional office" },
            { market: "Brazil 🇧🇷", opportunity: "Large freelancer pool, growing remote culture", potential: "High", action: "Portuguese localisation" },
          ].map(o => (
            <div key={o.market} className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-white">{o.market}</h4>
                <span className={`px-2 py-0.5 rounded text-xs ${o.potential === "Very High" ? "bg-emerald-900/40 text-emerald-300" : "bg-blue-900/40 text-blue-300"}`}>{o.potential} Potential</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{o.opportunity}</p>
              <p className="text-xs text-teal-400 font-medium">Recommended: {o.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

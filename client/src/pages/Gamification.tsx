/**
 * Section 48 — Gamification & Loyalty Engine v4.0
 * 400% ELON MUSK GOD-MODE
 * Points System · Badge Economy · Challenges · Leaderboard · 5-Tier Loyalty
 * Beats Smile.io + Yotpo + LoyaltyLion + Stamp.me until 2030
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Gamification() {
  const [tab, setTab] = useState<"dashboard" | "leaderboard" | "challenges" | "tiers">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/gamification/dashboard"], queryFn: () => fetch("/api/gamification/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: leaderboard } = useQuery({ queryKey: ["/api/gamification/leaderboard"], queryFn: () => fetch("/api/gamification/leaderboard", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "leaderboard" });
  const { data: challenges } = useQuery({ queryKey: ["/api/gamification/challenges"], queryFn: () => fetch("/api/gamification/challenges", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "challenges" });
  const { data: tiers } = useQuery({ queryKey: ["/api/gamification/tiers"], queryFn: () => fetch("/api/gamification/tiers", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "tiers" });
  const toggleMut = useMutation({ mutationFn: (id: string) => fetch(`/api/gamification/challenges/${id}/toggle`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Challenge updated" }); qc.invalidateQueries({ queryKey: ["/api/gamification/challenges"] }); } });
  const d = (dash as any) || {};
  const tierColor = (t: string) => ({ bronze: "#cd7f32", silver: "#C0C0C0", gold: "#FFD700", platinum: "#E5E4E2", diamond: "#00CFFF" }[t] || "#9ca3af");
  const tierIcon = (t: string) => ({ bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎", diamond: "💠" }[t] || "🏅");
  const rankEmoji = (r: number) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Gamification & Loyalty Engine</h1>
        <p className="text-sm text-gray-500 mb-6">Points · Badges · Challenges · Leaderboard · Bronze→Diamond Tiers</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Points Issued", value: (d.totalPointsIssued || 0).toLocaleString(), color: "#FFD700" }, { label: "Challenges", value: d.activeChallenges || 0, color: "#6366f1" }, { label: "Completions", value: (d.totalCompletions || 0).toLocaleString(), color: "#1DBF73" }, { label: "Diamond Users", value: d.diamondUsers || 0, color: "#00CFFF" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "leaderboard", "challenges", "tiers"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)", color: tab === t ? "#FFD700" : "#6b7280", border: tab === t ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "leaderboard" ? "🏆 Leaderboard" : t === "challenges" ? "⚡ Challenges" : "🏅 Tiers"}</button>)}
        </div>
        {tab === "leaderboard" && (
          <div className="space-y-2">
            {((leaderboard as any)?.users || []).map((u: any) => (
              <div key={u.id} data-testid={`user-${u.id}`} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: u.rank <= 3 ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-black w-8 text-center">{rankEmoji(u.rank)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-bold text-white">{u.name}</span><span className="text-[10px] font-bold" style={{ color: tierColor(u.tier) }}>{tierIcon(u.tier)} {u.tier.toUpperCase()}</span></div>
                    <div className="text-xs text-gray-500">Streak: {u.streak} days · {u.badges.length} badges</div>
                  </div>
                  <div className="text-right"><div className="text-sm font-black text-yellow-400">{u.points.toLocaleString()}</div><div className="text-[10px] text-gray-500">pts</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "challenges" && (
          <div className="space-y-2">
            {((challenges as any)?.challenges || []).map((c: any) => (
              <div key={c.id} data-testid={`challenge-${c.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 font-bold">{c.type}</span>
                    </div>
                    <div className="text-xs text-gray-500">{c.description}</div>
                    <div className="flex gap-3 mt-1"><span className="text-xs text-yellow-400">🏆 {c.reward} pts</span><span className="text-xs text-gray-500">{c.completions.toLocaleString()} completions</span></div>
                  </div>
                  <button data-testid={`toggle-${c.id}`} onClick={() => toggleMut.mutate(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold ml-2" style={{ background: c.active ? "rgba(29,191,115,0.2)" : "rgba(107,114,128,0.2)", color: c.active ? "#1DBF73" : "#6b7280" }}>{c.active ? "ACTIVE" : "OFF"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "tiers" && (
          <div className="grid grid-cols-1 gap-3">
            {((tiers as any)?.tiers || []).map((t: any) => (
              <div key={t.name} className="rounded-xl p-4" style={{ background: `${tierColor(t.name.toLowerCase())}08`, border: `1px solid ${tierColor(t.name.toLowerCase())}25` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><span className="text-xl">{tierIcon(t.name.toLowerCase())}</span><span className="font-black text-white text-lg">{t.name}</span></div>
                    <div className="text-xs text-gray-500">Min: {t.minPoints.toLocaleString()} points</div>
                    <div className="flex gap-2 mt-2 flex-wrap">{t.perks.map((p: string) => <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300">✓ {p}</span>)}</div>
                  </div>
                  <div className="text-2xl">{tierIcon(t.name.toLowerCase())}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4 mt-2"><div className="rounded-2xl p-6" style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)" }}><div className="text-4xl font-black text-yellow-400">{d.totalUsers || 0}</div><div className="text-sm text-gray-400 mt-1">Loyalty Members</div><div className="text-xs text-gray-600 mt-0.5">Avg streak: {d.avgStreak || 0} days</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-lg font-bold text-white">Top: {d.topUser}</div><div className="text-sm text-gray-400 mt-1">Leading the Leaderboard</div></div></div>}
      </div>
    </div>
  );
}

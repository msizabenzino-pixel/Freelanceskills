import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

function TierBadge({ tier }: { tier: number }) {
  const badges = [
    { label: "Basic", icon: "👤", cls: "bg-slate-700 text-slate-300 border-slate-600" },
    { label: "Verified", icon: "✅", cls: "bg-emerald-900/60 text-emerald-300 border-emerald-500/50" },
    { label: "Verified Pro", icon: "🎓", cls: "bg-blue-900/60 text-blue-300 border-blue-500/50" },
    { label: "Elite", icon: "🏆", cls: "bg-yellow-900/60 text-yellow-300 border-yellow-500/50" },
  ];
  const b = badges[Math.min(tier, 3)];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${b.cls}`}>
      {b.icon} {b.label}
    </span>
  );
}

function ProgressStep({
  number, label, complete, active, locked
}: { number: number; label: string; complete: boolean; active: boolean; locked: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${locked ? "opacity-40" : ""}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
        ${complete ? "bg-emerald-500 border-emerald-500 text-slate-950" :
          active ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-pulse" :
          "bg-slate-800 border-slate-600 text-slate-400"}`}>
        {complete ? "✓" : number}
      </div>
      <span className={`text-xs font-medium text-center ${complete ? "text-emerald-400" : active ? "text-white" : "text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

export default function VettingHub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lang, setLang] = useState("en");

  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/vetting/status"],
    retry: false,
  });

  const { data: tiers } = useQuery({
    queryKey: ["/api/vetting/tiers"],
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/start", { language: lang }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
      toast({ title: "Vetting started!", description: "Follow Lebo's guide to get verified." });
    },
    onError: () => toast({ title: "Error", description: "Could not start vetting.", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 text-lg animate-pulse">Loading your vetting status...</div>
      </div>
    );
  }

  const steps = status?.steps || { consent: false, identity: false, skills: false, education: false, background: false };
  const scores = status?.scores || { identity: 0, skills: 0, education: 0, overall: 0 };
  const nextStep = status?.nextStep || "consent";
  const tier = status?.tier || 0;

  const nextStepUrl: Record<string, string> = {
    consent: "/vetting/identity",
    identity: "/vetting/identity",
    skills: "/vetting/skills",
    education: "/vetting/education",
    background: "/vetting/background",
    complete: "/vetting/identity",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16" data-testid="page-vetting-hub">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/20 border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔐</span>
                <h1 className="text-2xl sm:text-3xl font-bold">Nuclear Vetting System</h1>
              </div>
              <p className="text-slate-400 text-sm sm:text-base">
                Africa's most rigorous freelancer verification. Trusted by 1,200+ businesses.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <TierBadge tier={tier} />
              {scores.overall > 0 && (
                <div className="text-sm text-slate-400">
                  Trust Score: <span className="text-emerald-400 font-bold">{scores.overall}/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Lebo AI Guide */}
          {(status?.lebaMessage || !status?.exists) && (
            <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 sm:p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-lg">
                🤖
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-emerald-400 text-sm" data-testid="text-lebo-ai-label">Lebo AI Guide</span>
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                    className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-300"
                    aria-label="Select language"
                    data-testid="select-lebo-language"
                  >
                    <option value="en">English</option>
                    <option value="zu">isiZulu</option>
                    <option value="xh">isiXhosa</option>
                    <option value="af">Afrikaans</option>
                  </select>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed" data-testid="text-lebo-message">
                  {status?.lebaMessage || "Hi! I'm Lebo, your FreelanceSkills vetting guide. Let's get you verified — it takes just 15 minutes and unlocks 3× more job matches!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Progress Steps */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold mb-6">Your Verification Progress</h2>
          <div className="flex items-start justify-between gap-2 mb-6">
            <ProgressStep number={1} label="POPIA Consent" complete={steps.consent} active={nextStep === "consent"} locked={false} />
            <div className="flex-1 h-0.5 bg-slate-700 mt-5 hidden sm:block" />
            <ProgressStep number={2} label="Identity" complete={steps.identity} active={nextStep === "identity"} locked={!steps.consent} />
            <div className="flex-1 h-0.5 bg-slate-700 mt-5 hidden sm:block" />
            <ProgressStep number={3} label="Skills Test" complete={steps.skills} active={nextStep === "skills"} locked={!steps.identity} />
            <div className="flex-1 h-0.5 bg-slate-700 mt-5 hidden sm:block" />
            <ProgressStep number={4} label="Education" complete={steps.education} active={nextStep === "education"} locked={!steps.skills} />
            <div className="flex-1 h-0.5 bg-slate-700 mt-5 hidden sm:block" />
            <ProgressStep number={5} label="Background" complete={steps.background} active={nextStep === "background"} locked={!steps.education} />
          </div>

          {/* Score bars */}
          {status?.exists && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              {[
                { label: "Identity Score", score: scores.identity, icon: "🪪" },
                { label: "Skills Score", score: scores.skills, icon: "💡" },
                { label: "Education Score", score: scores.education, icon: "🎓" },
              ].map(({ label, score, icon }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">{icon} {label}</span>
                    <span className={`font-semibold ${score >= 70 ? "text-emerald-400" : score > 0 ? "text-yellow-400" : "text-slate-500"}`}>
                      {score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${score >= 70 ? "bg-emerald-500" : score > 0 ? "bg-yellow-500" : "bg-slate-700"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center mb-12">
          {!status?.exists ? (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              data-testid="button-start-vetting"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {startMutation.isPending ? "Starting..." : "🚀 Start Vetting Now"}
            </button>
          ) : nextStep === "complete" ? (
            <div className="inline-flex flex-col items-center gap-3" data-testid="section-vetting-complete">
              <div className="text-4xl">🏆</div>
              <p className="text-xl font-bold text-emerald-400" data-testid="text-fully-verified">You're Fully Verified!</p>
              <p className="text-slate-400 text-sm">Elite status active. Enjoy 0% commission on your first 3 projects.</p>
              <Link href="/dashboard" className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all" data-testid="link-go-to-dashboard">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <Link
              href={nextStepUrl[nextStep] || "/vetting/identity"}
              data-testid="link-continue-vetting"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/25"
            >
              Continue: {nextStep === "consent" ? "Give POPIA Consent" : `${nextStep.charAt(0).toUpperCase() + nextStep.slice(1)} Verification`}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Tier Cards */}
        {tiers?.tiers && (
          <div>
            <h2 className="text-xl font-bold mb-6">Vetting Tiers — What You Unlock</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {tiers.tiers.map((t: any) => {
                const isActive = tier === t.tier;
                const isComplete = tier > t.tier;
                return (
                  <div
                    key={t.tier}
                    className={`rounded-xl p-5 border transition-all ${
                      isActive ? "bg-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10" :
                      isComplete ? "bg-slate-900/30 border-emerald-500/20" :
                      "bg-slate-900/20 border-slate-800"
                    }`}
                  >
                    <div className="text-2xl mb-3">{t.icon}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-sm">{t.name}</h3>
                      {isComplete && <span className="text-xs text-emerald-400">✓ Done</span>}
                      {isActive && <span className="text-xs text-emerald-400 animate-pulse">● Active</span>}
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{t.description}</p>
                    <div className="space-y-1">
                      {t.benefits.slice(0, 3).map((b: string, i: number) => (
                        <div key={i} className="text-xs text-emerald-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Why We Verify */}
        <div className="mt-12 bg-slate-900/30 border border-slate-800 rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-4">🌍 Why FreelanceSkills Vetting Beats Everyone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { platform: "Fiverr", gap: "ID only — no skills, no education check", fs: "ID + Skills + Education + References + Background" },
              { platform: "Upwork", gap: "No education verification, slow manual review", fs: "OCR + SAQA cross-check + Blockchain credential" },
              { platform: "Toptal", gap: "Tech-only, excludes trades & creatives", fs: "All industries: tech, trades, design, marketing" },
              { platform: "Andela", gap: "Tech-only, African focus but no tiered trust", fs: "Tiered 0–3 model, ZAR-native, POPIA-compliant" },
            ].map(({ platform, gap, fs }) => (
              <div key={platform} className="text-sm">
                <div className="font-semibold text-slate-300 mb-1">vs {platform}</div>
                <div className="text-slate-500 text-xs mb-1">❌ {gap}</div>
                <div className="text-emerald-400 text-xs">✅ {fs}</div>
              </div>
            ))}
          </div>
        </div>

        {/* POPIA Notice */}
        <div className="mt-6 flex gap-3 bg-slate-900/30 border border-slate-700 rounded-xl p-4 text-xs text-slate-400">
          <span className="text-blue-400 flex-shrink-0 text-base">🛡️</span>
          <div>
            <strong className="text-slate-300">POPIA Data Protection:</strong> All vetting data is processed in compliance with the Protection of Personal Information Act (POPIA). Your documents are encrypted, hashed for privacy, and retained for 5 years per legal requirements.{" "}
            <button
              onClick={async () => {
                if (confirm("Delete all your vetting data? This cannot be undone.")) {
                  try {
                    await apiRequest("DELETE", "/api/vetting/data", {});
                    toast({ title: "Data deleted", description: "Your vetting data has been anonymised per POPIA." });
                  } catch {
                    toast({ title: "Error", variant: "destructive" });
                  }
                }
              }}
              data-testid="button-delete-data"
              className="text-red-400 hover:text-red-300 underline"
            >
              Request data deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

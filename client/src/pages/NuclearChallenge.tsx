import { Link } from "wouter";

const focusAreas = [
  { title: "Mobile-first public pages", value: "320px–4K" },
  { title: "5-step verification", value: "5 steps" },
  { title: "Trust infrastructure", value: "POPIA + AI" },
  { title: "Marketplace growth", value: "1M by 2031" },
];

const risks = [
  "Preserve all existing features",
  "Keep public-facing copy consistent",
  "Avoid destructive schema changes",
  "Keep route and test IDs stable",
];

export default function NuclearChallenge() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-12" data-testid="page-nuclear-challenge">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-4">
          <p className="text-emerald-400 font-semibold uppercase tracking-[0.3em] text-xs" data-testid="text-challenge-kicker">
            FreelanceSkills 2026
          </p>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight" data-testid="text-challenge-title">
            Clear growth, verified trust, and public pages that convert.
          </h1>
          <p className="text-slate-300 max-w-3xl" data-testid="text-challenge-description">
            A public launch surface for FreelanceSkills.net that keeps the platform vision, vetting path, and guardrails easy to understand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/vetting" className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold" data-testid="link-start-vetting">
              Start vetting
            </Link>
            <Link href="/dashboard" className="px-5 py-3 rounded-xl border border-slate-700 text-slate-100 font-semibold" data-testid="link-open-dashboard">
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5" data-testid={`card-focus-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-2 text-xl font-bold text-emerald-400">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-2xl font-bold" data-testid="text-challenge-section-title">Build rules</h2>
            <ul className="space-y-3">
              {risks.map((risk) => (
                <li key={risk} className="flex items-start gap-3 text-slate-300" data-testid={`text-risk-${risk.toLowerCase().replace(/\W+/g, "-")}`}>
                  <span className="text-emerald-400">✓</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-3">
            <h2 className="text-2xl font-bold" data-testid="text-launch-plan-title">Launch plan</h2>
            <p className="text-slate-200" data-testid="text-launch-plan-copy">
              Keep the brand public, the vetting path obvious, and every interaction mobile-first.
            </p>
            <div className="rounded-xl bg-slate-950/70 p-4 text-sm text-slate-300" data-testid="text-launch-plan-note">
              This page is a lightweight public-facing anchor for the 2026 build.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
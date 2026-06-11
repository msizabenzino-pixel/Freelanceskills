import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Star, BadgeCheck, Crown, ShieldCheck, Eye, RotateCcw, ChevronRight, MapPin, Heart,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { toggleSaveGig } from "@/lib/track";

// ── Types matching the server card mappers (discoveryShared.ts) ──────────────
interface GigItem {
  id: string;
  title: string;
  category: string;
  priceFrom: number;
  taskerName: string;
  location: string;
  rating: number;
  isPro: boolean;
  verified: boolean;
  photoUrl: string | null;
  viewed?: boolean;
  hireAgainLink?: string;
}
interface FreelancerItem {
  id: string;
  userId: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  location: string;
  hourlyRateFormatted: string | null;
  rating: number | null;
  isPro: boolean;
  topPerformer: boolean;
  skillsVerified: boolean;
  identityVerified: boolean;
  photoUrl: string | null;
  avatarInitials: string;
}
interface Section<T> { items: T[]; sectionTitle: string; seeAllLink: string; }

async function getJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function useSection<T>(key: string, url: string, enabled = true) {
  return useQuery<Section<T>>({
    queryKey: [key],
    queryFn: () => getJson<Section<T>>(url),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Row shell ────────────────────────────────────────────────────────────────
function Row({ title, seeAllLink, accent, children, testid }: {
  title: string; seeAllLink: string; accent?: boolean; children: React.ReactNode; testid: string;
}) {
  return (
    <section className="py-7" data-testid={testid}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl sm:text-2xl font-extrabold ${accent ? "text-emerald-400" : "text-white"}`}>{title}</h2>
          <Link href={seeAllLink} className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors" data-testid={`${testid}-see-all`}>
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-slate-700">
          {children}
        </div>
      </div>
    </section>
  );
}

function Rating({ value }: { value: number | null }) {
  if (!value || value <= 0) return <span className="text-xs text-slate-500">New</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
      <Star className="w-3.5 h-3.5 fill-amber-400" /> {value.toFixed(1)}
    </span>
  );
}

// ── Gig card ──────────────────────────────────────────────────────────────────
function GigMiniCard({ gig, hireAgain }: { gig: GigItem; hireAgain?: boolean }) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const price = `R${Number(gig.priceFrom || 0).toLocaleString("en-ZA")}`;

  const onSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) return;
    setSaved((s) => !s);
    const next = await toggleSaveGig(gig.id);
    setSaved(next);
  };

  return (
    <Link href={`/gig/${gig.id}`} className="snap-start shrink-0 w-64" data-testid={`card-gig-${gig.id}`}>
      <div className="h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group hover:border-emerald-600/60 transition-colors">
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          {gig.photoUrl ? (
            <img src={gig.photoUrl} alt={gig.title} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-700">{(gig.title || "?").charAt(0)}</div>
          )}
          {gig.viewed && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" data-testid={`tag-viewed-${gig.id}`}>
              <Eye className="w-3 h-3" /> Viewed
            </span>
          )}
          {isAuthenticated && !hireAgain && (
            <button onClick={onSave} aria-label="Save gig" className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 transition-colors" data-testid={`button-save-gig-${gig.id}`}>
              <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            {gig.isPro && <Crown className="w-3.5 h-3.5 text-amber-400" />}
            {gig.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-[11px] text-slate-400 truncate">{gig.taskerName}</span>
          </div>
          <p className="text-sm font-semibold text-white line-clamp-2 mb-2 min-h-[2.5rem]">{gig.title}</p>
          <div className="flex items-center justify-between">
            <Rating value={gig.rating} />
            <span className="text-xs text-slate-500">From <span className="font-bold text-white">{price}</span></span>
          </div>
          {hireAgain && gig.hireAgainLink && (
            <Link href={gig.hireAgainLink} onClick={(e) => e.stopPropagation()} className="mt-3 block w-full text-center px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors" data-testid={`button-hire-again-${gig.id}`}>
              Hire Again
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Freelancer card ───────────────────────────────────────────────────────────
function FreelancerMiniCard({ f }: { f: FreelancerItem }) {
  return (
    <Link href={`/profile/${f.userId}`} className="snap-start shrink-0 w-64" data-testid={`card-freelancer-${f.userId}`}>
      <div className="h-full bg-slate-800 rounded-xl border border-slate-700 p-4 group hover:border-emerald-600/60 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          {f.photoUrl ? (
            <img src={f.photoUrl} alt={f.name} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">{f.avatarInitials}</div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-white truncate">{f.name}</p>
              {f.identityVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>
            <p className="text-[11px] text-slate-400 truncate">{f.title}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[2rem]">{f.bio}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {(f.skills || []).slice(0, 3).map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-700/60 text-[10px] text-slate-300">{s}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="w-3 h-3" /> {f.location}</span>
          {f.hourlyRateFormatted && <span className="text-xs font-bold text-white">{f.hourlyRateFormatted}</span>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {f.topPerformer && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold">Top Performer</span>}
          {f.isPro && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Pro</span>}
          <Rating value={f.rating} />
        </div>
      </div>
    </Link>
  );
}

function CategoryPill({ c }: { c: { category: string; count: number } }) {
  return (
    <Link href={`/categories/${encodeURIComponent(c.category.toLowerCase().replace(/\s+/g, "-"))}`} className="snap-start shrink-0" data-testid={`card-category-${c.category}`}>
      <div className="px-5 py-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-600/60 transition-colors min-w-[160px]">
        <p className="text-sm font-bold text-white">{c.category}</p>
        <p className="text-[11px] text-slate-500 mt-1">{c.count} order{c.count === 1 ? "" : "s"} this month</p>
      </div>
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeDiscovery() {
  const { isAuthenticated } = useAuth();

  const recentlyViewed = useSection<GigItem>("/api/home/recently-viewed", "/api/home/recently-viewed", isAuthenticated);
  const hireAgain = useQuery<{ items: GigItem[] }>({
    queryKey: ["/api/orders/completed", "home"],
    queryFn: () => getJson<{ items: GigItem[] }>("/api/orders/completed?limit=5"),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const recommended = useSection<GigItem>("/api/home/recommended", "/api/home/recommended", isAuthenticated);
  const popularCats = useSection<{ category: string; count: number }>("/api/home/popular-categories", "/api/home/popular-categories");
  const topRated = useSection<GigItem>("/api/home/top-rated-week", "/api/home/top-rated-week");
  const trending = useSection<GigItem>("/api/home/trending-sa", "/api/home/trending-sa");
  const trades = useSection<FreelancerItem>("/api/home/trades-near-me", "/api/home/trades-near-me");
  const newVerified = useSection<FreelancerItem>("/api/home/new-verified", "/api/home/new-verified");

  const rv = recentlyViewed.data?.items ?? [];
  const ha = hireAgain.data?.items ?? [];
  const rec = recommended.data?.items ?? [];
  const pc = popularCats.data?.items ?? [];
  const tr = topRated.data?.items ?? [];
  const ts = trending.data?.items ?? [];
  const td = trades.data?.items ?? [];
  const nv = newVerified.data?.items ?? [];

  return (
    <div data-testid="home-discovery">
      {/* C14 — retention rows FIRST (auth only) */}
      {isAuthenticated && rv.length > 0 && (
        <Row title="Continue Where You Left Off" seeAllLink="/explore" testid="row-recently-viewed">
          {rv.map((g) => <GigMiniCard key={g.id} gig={g} />)}
        </Row>
      )}
      {isAuthenticated && ha.length > 0 && (
        <Row title="Hire Again" seeAllLink="/orders" accent testid="row-hire-again">
          {ha.map((g) => <GigMiniCard key={g.id} gig={g} hireAgain />)}
        </Row>
      )}

      {/* C13 — personalised feed (empty sections hidden — real data only) */}
      {isAuthenticated && rec.length > 0 && (
        <Row title={recommended.data!.sectionTitle} seeAllLink={recommended.data!.seeAllLink} testid="row-recommended">
          {rec.map((g) => <GigMiniCard key={g.id} gig={g} />)}
        </Row>
      )}
      {pc.length > 0 && (
        <Row title={popularCats.data!.sectionTitle} seeAllLink={popularCats.data!.seeAllLink} testid="row-popular-categories">
          {pc.map((c) => <CategoryPill key={c.category} c={c} />)}
        </Row>
      )}
      {tr.length > 0 && (
        <Row title={topRated.data!.sectionTitle} seeAllLink={topRated.data!.seeAllLink} testid="row-top-rated">
          {tr.map((g) => <GigMiniCard key={g.id} gig={g} />)}
        </Row>
      )}
      {ts.length > 0 && (
        <Row title={trending.data!.sectionTitle} seeAllLink={trending.data!.seeAllLink} testid="row-trending-sa">
          {ts.map((g) => <GigMiniCard key={g.id} gig={g} />)}
        </Row>
      )}
      {td.length > 0 && (
        <Row title={trades.data!.sectionTitle} seeAllLink={trades.data!.seeAllLink} testid="row-trades-near-me">
          {td.map((f) => <FreelancerMiniCard key={f.userId} f={f} />)}
        </Row>
      )}
      {nv.length > 0 && (
        <Row title={newVerified.data!.sectionTitle} seeAllLink={newVerified.data!.seeAllLink} testid="row-new-verified">
          {nv.map((f) => <FreelancerMiniCard key={f.userId} f={f} />)}
        </Row>
      )}
    </div>
  );
}

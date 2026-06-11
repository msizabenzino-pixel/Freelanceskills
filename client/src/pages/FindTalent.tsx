import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelBadge, getLevelFromStats } from "@/components/LevelBadge";
import { BadgeStack } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, MapPin, List, Map as MapIcon, Star, ShieldCheck, Loader2,
  Users, Briefcase, MessageSquare, ExternalLink, X,
  Palette, Code2, Megaphone, Database, TrendingUp, Award, Zap,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { useDebounce } from "@/hooks/use-debounce";

interface FreelancerResult {
  id: string;
  userId: string;
  name: string;
  title: string;
  skills: string[];
  location: string;
  hourlyRateCents: number | null;
  hourlyRateFormatted: string | null;
  rating: number | null;
  completedJobs: number;
  isPro: boolean;
  verified: boolean;
  kycStatus: string;
  country: string;
  avatarInitials: string;
  identityVerified?: boolean;
  skillsVerified?: boolean;
  topPerformer?: boolean;
  onTimeDeliveryRate?: number | null;
  coords?: { top: string; left: string };
}

const MAP_COORDS: Array<{ top: string; left: string }> = [
  { top: "40%", left: "50%" }, { top: "30%", left: "60%" },
  { top: "55%", left: "45%" }, { top: "45%", left: "55%" },
  { top: "35%", left: "40%" }, { top: "60%", left: "60%" },
  { top: "50%", left: "35%" }, { top: "25%", left: "50%" },
];

const QUICK_FILTERS = [
  { label: "Verified Only", key: "verified", value: "true", icon: ShieldCheck },
  { label: "Under R500/hr", key: "maxRate", value: "500", icon: Zap },
  { label: "Top Rated (4.5+)", key: "minRating", value: "4.5", icon: Star },
  { label: "10+ Jobs Done", key: "minJobs", value: "10", icon: Award },
];

const CATEGORY_PILLS = [
  { label: "Design & Creative", icon: Palette, q: "design" },
  { label: "Development & Tech", icon: Code2, q: "developer" },
  { label: "Marketing & Growth", icon: Megaphone, q: "marketing" },
  { label: "Data & AI", icon: Database, q: "data" },
  { label: "Business & Finance", icon: TrendingUp, q: "finance" },
];

function FreelancerCard({ f, onSelect, selected }: { f: FreelancerResult; onSelect: (id: string) => void; selected: boolean }) {
  const ratingDisplay = f.rating ? f.rating.toFixed(1) : null;
  return (
    <Card
      className={cn(
        "p-6 hover:shadow-lg transition-all cursor-pointer group",
        selected && "ring-2 ring-primary",
        f.topPerformer && "border border-amber-600"
      )}
      onClick={() => onSelect(f.id)}
      data-testid={`card-freelancer-${f.id}`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className={`p-0.5 rounded-full ${f.isPro ? "bg-gradient-to-br from-violet-500 to-emerald-500" : "bg-gradient-to-br from-emerald-500/40 to-teal-500/30"}`}>
            <div className="p-0.5 rounded-full bg-card">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-emerald-300 font-bold text-xl">
                  {f.avatarInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {(f.verified || f.identityVerified) && (
            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-emerald-500/40 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className="font-bold text-base text-white leading-tight">{f.name}</h3>
          <div className="flex justify-center mt-1 mb-1">
            <BadgeStack
              identityVerified={f.identityVerified}
              skillsVerified={f.skillsVerified}
              topPerformer={f.topPerformer}
              size="xs"
            />
          </div>
          <div className="flex justify-center mt-1 mb-0.5">
            <LevelBadge
              level={f.isPro ? "pro" : getLevelFromStats(f.completedJobs ?? 0, f.rating ?? 0, 0)}
              size="sm"
            />
          </div>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{f.title}</p>
          {f.location && (
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {f.location}
            </p>
          )}
        </div>

        {f.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {f.skills.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs px-2 py-0">
                {s}
              </Badge>
            ))}
            {f.skills.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">+{f.skills.length - 3}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full text-sm">
          {ratingDisplay ? (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{ratingDisplay}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-xs">New</span>
          )}
          <div className="flex items-center gap-1 text-slate-500">
            <Briefcase className="w-3 h-3" />
            <span className="text-xs">{f.completedJobs} jobs</span>
          </div>
          {f.hourlyRateFormatted && (
            <span className="font-black text-emerald-400 text-sm">{f.hourlyRateFormatted}</span>
          )}
        </div>

        <Link href={`/profile/${f.userId}`} className="w-full" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" className="w-full h-9 text-sm border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all" data-testid={`button-view-profile-${f.id}`}>
            View Profile →
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-slate-800 rounded-full" />
        <div className="w-full space-y-2">
          <div className="h-4 bg-slate-800 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-2/3 mx-auto" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-slate-800 rounded-full" />
          <div className="h-5 w-16 bg-slate-800 rounded-full" />
        </div>
        <div className="h-9 bg-slate-800 rounded w-full" />
      </div>
    </Card>
  );
}

export default function FindTalent() {
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { formatRate } = useCurrency();

  const { data: platformStats } = useQuery<any>({
    queryKey: ["/api/stats/public"],
    queryFn: async () => {
      const res = await fetch("/api/stats/public");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const realFreelancerCount: number = platformStats?.stats?.totalFreelancers || 0;

  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedLocation = useDebounce(locationInput, 400);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set("q", debouncedSearch);
  if (debouncedLocation) params.set("location", debouncedLocation);
  if (activeFilters.verified) params.set("verified", activeFilters.verified);
  if (activeFilters.maxRate) params.set("maxRate", activeFilters.maxRate);
  if (activeFilters.minRating) params.set("minRating", activeFilters.minRating);

  const { data, isLoading, isError } = useQuery<{ freelancers: FreelancerResult[]; total: number }>({
    queryKey: ["freelancers", debouncedSearch, debouncedLocation, activeFilters],
    queryFn: async () => {
      const res = await fetch(`/api/talent/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load freelancers");
      return res.json();
    },
    staleTime: 30000,
  });

  const freelancers: FreelancerResult[] = (data?.freelancers || []).map((f, i) => ({
    ...f,
    coords: MAP_COORDS[i % MAP_COORDS.length],
  }));

  const selectedPro = selectedId ? freelancers.find((f) => f.id === selectedId) : null;

  const toggleFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main id="main-content">

        {/* ── Hero ──────────────────────────────────────────────────────────────── */}
        <div className="pt-20 pb-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ID-Verified · Skills-Tested · Pan-African
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              Find Africa's Best<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300">
                Freelancers
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-8 max-w-lg mx-auto">
              Developers, designers, engineers, and creatives — all verified and ready to work across 54 African countries.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {CATEGORY_PILLS.map(({ label, icon: Icon, q }) => (
                <button
                  key={q}
                  onClick={() => setSearchInput(q)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-sm font-medium transition-all"
                  data-testid={`pill-category-${q}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { val: realFreelancerCount > 0 ? `${realFreelancerCount.toLocaleString()}+` : "Verified", label: "Freelancers" },
                { val: "4.9★", label: "Avg Rating" },
                { val: "54", label: "African Countries" },
                { val: data?.total ? `${data.total.toLocaleString()}+` : "Active", label: "Available Now" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-black text-white">{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sticky Search + Filter Bar ────────────────────────────────────────── */}
        <div className="pb-3 pt-3 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 sticky top-16 z-10 shadow-md">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Search verified talent by skill or role..."
                  className="pl-10 h-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="input-search-talent"
                />
                {searchInput && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    onClick={() => setSearchInput("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-60">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Sandton, Cape Town..."
                  className="pl-10 h-10"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  data-testid="input-location-talent"
                />
              </div>
              <div className="flex bg-slate-900 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    view === "list" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-emerald-400"
                  )}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" /> List
                </button>
                <button
                  onClick={() => setView("map")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    view === "map" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-emerald-400"
                  )}
                  data-testid="button-view-map"
                >
                  <MapIcon className="w-4 h-4" /> Map
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 items-center">
              {QUICK_FILTERS.map((f) => {
                const isActive = activeFilters[f.key] === f.value;
                const Icon = f.icon;
                return (
                  <button
                    key={f.label}
                    onClick={() => toggleFilter(f.key, f.value)}
                    data-testid={`badge-filter-${f.key}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border select-none",
                      isActive
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900 border-slate-700/60 text-slate-400 hover:border-emerald-500/30 hover:text-slate-200"
                    )}
                  >
                    {isActive ? <X className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    {f.label}
                  </button>
                );
              })}
              {data && (
                <span className="text-xs text-slate-500 ml-auto whitespace-nowrap font-medium">
                  {data.total} freelancer{data.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {view === "list" ? (
          <div className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : isError ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">Failed to load freelancers. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : freelancers.length === 0 ? (
              <div data-testid="empty-state">
                {/* Show sample cards when there's no real data */}
                {!debouncedSearch && !debouncedLocation && Object.keys(activeFilters).length === 0 ? (
                  <div>
                    <div className="text-center mb-8 py-8 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Create a verified freelancer profile</h3>
                      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                        Build your profile, add your skills, and get ready for client discovery across Africa.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/cv-upload">
                          <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-testid="button-create-profile-empty">
                            Create Profile
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => { setSearchInput(""); setLocationInput(""); setActiveFilters({}); }}>
                          Clear filters
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Sample profiles</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50 pointer-events-none select-none">
                      {[
                        { name: "Amara Osei", title: "Full-Stack Developer", location: "Accra, Ghana", skills: ["React", "Node.js", "PostgreSQL"], rate: "R 520/hr", rating: 4.9, jobs: 43 },
                        { name: "Fatima Diallo", title: "Brand & UI Designer", location: "Lagos, Nigeria", skills: ["Figma", "Branding", "Motion"], rate: "R 420/hr", rating: 5.0, jobs: 61 },
                        { name: "Sipho Dlamini", title: "Digital Marketing Lead", location: "Johannesburg, SA", skills: ["Google Ads", "SEO", "Analytics"], rate: "R 380/hr", rating: 4.8, jobs: 29 },
                        { name: "Zanele Mokoena", title: "Data Scientist", location: "Cape Town, SA", skills: ["Python", "ML", "Power BI"], rate: "R 650/hr", rating: 4.9, jobs: 37 },
                      ].map((demo, i) => (
                        <Card key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl" data-testid={`card-demo-freelancer-${i}`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {demo.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{demo.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{demo.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />{demo.location}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {demo.skills.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{s}</span>)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{demo.rating} · {demo.jobs} jobs</span>
                            <span className="font-bold text-emerald-400">{demo.rate}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-40" />
                    <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-slate-400 mb-6">
                      {`No freelancers match "${debouncedSearch || debouncedLocation}". Try broadening your search.`}
                    </p>
                    <Button variant="outline" onClick={() => { setSearchInput(""); setLocationInput(""); setActiveFilters({}); }}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {freelancers.map((f) => (
                  <FreelancerCard
                    key={f.id}
                    f={f}
                    selected={selectedId === f.id}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-[calc(100vh-180px)] bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_Pretoria%2C_South_Africa.svg/2000px-Map_of_Pretoria%2C_South_Africa.svg.png')] bg-cover bg-center grayscale" />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {freelancers.map((f) => (
              <div
                key={f.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                style={{ top: f.coords?.top, left: f.coords?.left }}
                onClick={() => setSelectedId(f.id === selectedId ? null : f.id)}
                data-testid={`map-pin-${f.id}`}
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center transition-transform duration-300",
                    selectedId === f.id ? "scale-110 z-30" : "hover:scale-110"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 shadow-lg overflow-hidden relative z-10 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm",
                      selectedId === f.id ? "border-accent ring-4 ring-accent/20" : "border-white"
                    )}
                  >
                    {f.avatarInitials}
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-accent -mt-1 relative z-0" />
                  <div className="absolute top-12 bg-slate-900 px-3 py-1 rounded-full shadow-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700">
                    {f.hourlyRateFormatted || f.name}
                  </div>
                </div>
              </div>
            ))}

            {selectedPro && (
              <div className="absolute bottom-8 left-4 right-4 md:left-8 md:w-96 z-40 animate-in slide-in-from-bottom-4">
                <Card className="p-4 shadow-2xl border-accent/20 relative" data-testid="map-freelancer-card">
                  <button
                    className="absolute top-2 right-2 text-slate-500 hover:text-white p-1"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex gap-4">
                    <Avatar className="w-16 h-16 rounded-xl shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-xl rounded-xl">
                        {selectedPro.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start pr-4">
                        <h3 className="font-bold text-lg text-foreground truncate">{selectedPro.name}</h3>
                        {selectedPro.hourlyRateFormatted && (
                          <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-400 shrink-0 ml-2">
                            {selectedPro.hourlyRateFormatted}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-1 line-clamp-1">{selectedPro.title}</p>
                      <div className="flex items-center gap-3 text-sm">
                        {selectedPro.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{selectedPro.rating.toFixed(1)}</span>
                          </span>
                        )}
                        {selectedPro.verified && (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link href={`/profile/${selectedPro.userId}`} className="w-full">
                      <Button variant="outline" className="w-full" size="sm" data-testid="button-view-profile-map">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Profile
                      </Button>
                    </Link>
                    <Link href={`/messages?user=${selectedPro.userId}`} className="w-full">
                      <Button className="w-full" size="sm" data-testid="button-message-map">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}

            {!isLoading && freelancers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Card className="p-8 text-center shadow-xl">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-foreground font-medium">No freelancers on map</p>
                  <p className="text-muted-foreground text-sm mt-1">Try different filters or switch to list view</p>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      {view === "list" && <Footer />}
    </div>
  );
}

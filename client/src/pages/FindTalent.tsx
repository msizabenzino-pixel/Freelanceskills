import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelBadge, getLevelFromStats } from "@/components/LevelBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, MapPin, List, Map as MapIcon, Star, ShieldCheck, Loader2,
  Users, Briefcase, MessageSquare, ExternalLink, X,
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
  coords?: { top: string; left: string };
}

const MAP_COORDS: Array<{ top: string; left: string }> = [
  { top: "40%", left: "50%" }, { top: "30%", left: "60%" },
  { top: "55%", left: "45%" }, { top: "45%", left: "55%" },
  { top: "35%", left: "40%" }, { top: "60%", left: "60%" },
  { top: "50%", left: "35%" }, { top: "25%", left: "50%" },
];

const QUICK_FILTERS = [
  { label: "Verified Only", key: "verified", value: "true" },
  { label: "Under R500/hr", key: "maxRate", value: "500" },
  { label: "Top Rated (4.5+)", key: "minRating", value: "4.5" },
  { label: "10+ Jobs Done", key: "minJobs", value: "10" },
];

function FreelancerCard({ f, onSelect, selected }: { f: FreelancerResult; onSelect: (id: string) => void; selected: boolean }) {
  const ratingDisplay = f.rating ? f.rating.toFixed(1) : null;
  return (
    <Card
      className={cn(
        "p-6 hover:shadow-lg transition-all cursor-pointer group",
        selected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(f.id)}
      data-testid={`card-freelancer-${f.id}`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 ring-2 ring-border group-hover:ring-primary transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-xl">
              {f.avatarInitials}
            </AvatarFallback>
          </Avatar>
          {f.verified && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
          {f.isPro && (
            <div className="absolute -top-1 -right-1 bg-primary rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">PRO</div>
          )}
        </div>

        <div className="w-full">
          <h3 className="font-bold text-base text-foreground leading-tight">{f.name}</h3>
          <div className="flex justify-center mt-1 mb-0.5">
            <LevelBadge
              level={getLevelFromStats(f.completedJobs ?? 0, f.rating ?? 0, 0)}
              size="xs"
            />
          </div>
          <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">{f.title}</p>
          {f.location && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
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
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{ratingDisplay}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">New</span>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            <span className="text-xs">{f.completedJobs} jobs</span>
          </div>
          {f.hourlyRateFormatted && (
            <span className="font-bold text-primary text-sm">{f.hourlyRateFormatted}</span>
          )}
        </div>

        <Link href={`/freelancer-profile/${f.userId}`} className="w-full" onClick={(e) => e.stopPropagation()}>
          <Button className="w-full h-9 text-sm" data-testid={`button-view-profile-${f.id}`}>
            View Profile
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
        <div className="w-20 h-20 bg-muted rounded-full" />
        <div className="w-full space-y-2">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-9 bg-muted rounded w-full" />
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main id="main-content">
        <div className="pt-24 pb-4 bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search electricians, developers, designers..."
                  className="pl-10 h-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="input-search-talent"
                />
                {searchInput && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchInput("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-60">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Sandton, Cape Town..."
                  className="pl-10 h-10"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  data-testid="input-location-talent"
                />
              </div>
              <div className="flex bg-muted p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    view === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
                  )}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" /> List
                </button>
                <button
                  onClick={() => setView("map")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    view === "map" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
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
                return (
                  <Badge
                    key={f.label}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap transition-colors select-none",
                      isActive ? "bg-primary text-white hover:bg-primary/90" : "hover:bg-secondary"
                    )}
                    onClick={() => toggleFilter(f.key, f.value)}
                    data-testid={`badge-filter-${f.key}`}
                  >
                    {isActive && <X className="w-3 h-3 mr-1" />}
                    {f.label}
                  </Badge>
                );
              })}
              {data && (
                <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
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
              <div className="text-center py-24" data-testid="empty-state">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold text-foreground mb-2">No freelancers found</h3>
                <p className="text-muted-foreground mb-6">
                  {debouncedSearch || debouncedLocation
                    ? `No results for "${debouncedSearch || debouncedLocation}". Try a different search.`
                    : "No freelancers match your current filters."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    setLocationInput("");
                    setActiveFilters({});
                  }}
                >
                  Clear all filters
                </Button>
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
          <div className="relative w-full h-[calc(100vh-180px)] bg-muted overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_Pretoria%2C_South_Africa.svg/2000px-Map_of_Pretoria%2C_South_Africa.svg.png')] bg-cover bg-center grayscale" />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
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
                  <div className="absolute top-12 bg-white dark:bg-card px-3 py-1 rounded-full shadow-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-border">
                    {f.hourlyRateFormatted || f.name}
                  </div>
                </div>
              </div>
            ))}

            {selectedPro && (
              <div className="absolute bottom-8 left-4 right-4 md:left-8 md:w-96 z-40 animate-in slide-in-from-bottom-4">
                <Card className="p-4 shadow-2xl border-accent/20 relative" data-testid="map-freelancer-card">
                  <button
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
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
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 shrink-0 ml-2">
                            {selectedPro.hourlyRateFormatted}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-1 line-clamp-1">{selectedPro.title}</p>
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
                    <Link href={`/freelancer-profile/${selectedPro.userId}`} className="w-full">
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

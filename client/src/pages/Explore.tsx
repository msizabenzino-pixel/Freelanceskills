import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SERVICE_CATEGORIES, EXPERIENCE_LEVELS, AVAILABILITY_OPTIONS, BUDGET_RANGES, RATING_OPTIONS } from "@shared/categories";
import { Link } from "wouter";
import { useCurrency } from "@/lib/currency";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Code,
  Wrench,
  Heart,
  Hammer,
  Home,
  Waves,
  Car,
  Shield,
  Palette,
  PenTool,
  Briefcase,
  PartyPopper,
  GraduationCap,
  Zap,
  Users,
  BadgeCheck,
  Bot,
  Wallet
} from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Code, Wrench, Heart, Hammer, Home, Waves, Car, Shield, Palette, PenTool, 
  Briefcase, PartyPopper, GraduationCap, TrendingUp, Sparkles, Bot
};

const TRENDING_SEARCHES = [
  "Plumber near me",
  "Website developer",
  "Safety officer",
  "House cleaning",
  "Electrician Johannesburg",
  "Mobile app developer",
  "Pool service",
  "Car detailing"
];

const FEATURED_FREELANCERS = [
  {
    id: 1,
    name: "Thabo M.",
    title: "Master Electrician",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 450,
    location: "Johannesburg",
    verified: true,
    category: "trades"
  },
  {
    id: 2,
    name: "Sarah L.",
    title: "SHEQ Safety Officer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5.0,
    reviews: 89,
    hourlyRate: 600,
    location: "Cape Town",
    verified: true,
    category: "safety"
  },
  {
    id: 3,
    name: "David K.",
    title: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 4.8,
    reviews: 203,
    hourlyRate: 850,
    location: "Remote",
    verified: true,
    category: "programming"
  },
  {
    id: 4,
    name: "Nomsa P.",
    title: "Registered Nurse",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    rating: 4.9,
    reviews: 56,
    hourlyRate: 350,
    location: "Pretoria",
    verified: true,
    category: "healthcare"
  }
];

const MOCK_JOBS = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  title: [
    "Need a professional plumber",
    "React developer for 3-month project",
    "House cleaning service needed",
    "Graphic designer for logo",
    "Electrician for office setup"
  ][i % 5],
  company: ["BuildIt SA", "TechFlow", "HomeCare", "CreativeMinds", "PowerUp"][i % 5],
  type: ["Freelance", "Urgent", "Contract", "Part-time"][i % 4],
  budget: ["R5,000 - R10,000", "R20,000 - R40,000", "R1,500", "R2,500 - R5,000"][i % 4],
  location: ["Cape Town", "Johannesburg", "Durban", "Remote", "Pretoria"][i % 5],
  postedAt: ["2 hours ago", "1 day ago", "5 hours ago", "Just now"][i % 4],
  tags: ["Plumbing", "Repair", "Maintenance", "Urgent"].slice(0, (i % 3) + 2),
  description: "Looking for a highly skilled professional to help with our ongoing project. Must have at least 3 years of experience and be available to start immediately."
}));

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [availability, setAvailability] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { formatAmount, formatRange, formatRate } = useCurrency();

  // Infinite Scroll State
  const [visibleJobs, setVisibleJobs] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const TRENDING_PROJECTS = [
    { title: "E-commerce Website Development", budget: formatRange(15000, 25000), bids: 23, category: "Programming" },
    { title: "Office Electrical Installation", budget: formatRange(8000, 12000), bids: 15, category: "Trades" },
    { title: "Monthly Pool Maintenance Contract", budget: formatRate(2500, "month"), bids: 8, category: "Pool" },
    { title: "Safety File Compilation", budget: formatRange(5000, 7500), bids: 12, category: "Safety" },
  ];

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedCategory(null);
    setLocation("");
    setBudgetRange("");
    setRating("");
    setAvailability("");
    setExperience("");
    setSearchQuery("");
  };

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleJobs < MOCK_JOBS.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleJobs((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, visibleJobs]);

  const filteredFreelancers = FEATURED_FREELANCERS.filter(freelancer => {
    if (selectedCategory && freelancer.category !== selectedCategory) return false;
    if (searchQuery && !freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) && !freelancer.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (location && !freelancer.location.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  const filteredProjects = TRENDING_PROJECTS.filter(project => {
    if (selectedCategory) {
      const catName = SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name;
      if (catName && project.category.toLowerCase() !== catName.toLowerCase()) return false;
    }
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const jobsToShow = MOCK_JOBS.slice(0, visibleJobs);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main id="main-content">
        {/* Search Hero */}
        <section className="bg-gradient-to-br from-primary via-primary to-primary/80 text-white pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Find the Perfect Freelancer
              </h1>
              <p className="text-white/80">
                Browse thousands of skilled professionals across South Africa
              </p>
            </div>

            {/* Main Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for services, skills, or freelancers..."
                    className="pl-12 h-14 border-0 text-lg text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:w-48">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      className="pl-10 h-14 border-0 text-foreground"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      data-testid="input-location"
                    />
                  </div>
                  <Button size="lg" className="h-14 px-8" type="button" onClick={() => { /* real-time filter already active */ }} data-testid="button-search">
                    <Search className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Search</span>
                  </Button>
                </div>
              </div>

              {/* Trending Searches */}
              <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
                <span className="text-white/60 text-sm">Trending:</span>
                {TRENDING_SEARCHES.slice(0, 5).map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(term)}
                    className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                    data-testid={`button-trending-${i}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filter Chips Bar */}
        <div className="bg-background border-b sticky top-16 z-20 overflow-x-auto no-scrollbar">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium text-muted-foreground mr-2">Quick Filters:</span>
            {[
              { name: "Urgent", value: "urgent", icon: Zap },
              { name: "Remote", value: "remote", icon: MapPin },
              { name: "Under R5k", value: "budget_low", icon: Wallet },
              { name: "Top Rated", value: "top_rated", icon: Star },
            ].map((chip) => {
              const isActive = activeFilters.includes(chip.name);
              return (
                <button
                  key={chip.name}
                  onClick={() => isActive ? removeFilter(chip.name) : addFilter(chip.name)}
                  data-testid={`filter-chip-${chip.name.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    isActive 
                      ? "bg-primary text-white border-primary" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
                  )}
                >
                  <chip.icon className="w-3.5 h-3.5" />
                  {chip.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Grid */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Browse by Category</h2>
                <p className="text-muted-foreground">Find experts in every field</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {SERVICE_CATEGORIES.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || Briefcase;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      addFilter(category.name);
                    }}
                    className={`p-4 bg-card rounded-xl border-2 hover:border-primary hover:shadow-lg transition-all text-left group ${
                      selectedCategory === category.id ? "border-primary shadow-lg" : "border-transparent"
                    }`}
                    data-testid={`button-category-${category.id}`}
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{category.description}</p>
                    <Link href={`/services?category=${category.id}`}>
                      <Button variant="ghost" size="sm" className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-view-services-${category.id}`}>
                        View Services
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Desktop */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="bg-card rounded-xl border p-6 sticky top-40">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Filters</h3>
                    {activeFilters.length > 0 && (
                      <button 
                        onClick={clearAllFilters}
                        className="text-sm text-primary hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Category</Label>
                      <Select value={selectedCategory || ""} onValueChange={(v) => { setSelectedCategory(v); addFilter(SERVICE_CATEGORIES.find(c => c.id === v)?.name || ""); }}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Budget Range</Label>
                      <Select value={budgetRange} onValueChange={(v) => { setBudgetRange(v); addFilter(BUDGET_RANGES.find(b => b.value === v)?.label || ""); }}>
                        <SelectTrigger data-testid="select-budget">
                          <SelectValue placeholder="Any budget" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
                      <Select value={rating} onValueChange={(v) => { setRating(v); if(v !== "any") addFilter(`${v}+ Stars`); }}>
                        <SelectTrigger data-testid="select-rating">
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {RATING_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Experience Level</Label>
                      <Select value={experience} onValueChange={(v) => { setExperience(v); addFilter(EXPERIENCE_LEVELS.find(e => e.value === v)?.label || ""); }}>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Any experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Availability</Label>
                      <Select value={availability} onValueChange={(v) => { setAvailability(v); addFilter(AVAILABILITY_OPTIONS.find(a => a.value === v)?.label || ""); }}>
                        <SelectTrigger data-testid="select-availability">
                          <SelectValue placeholder="Any availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Verified Only */}
                    <div className="flex items-center gap-2">
                      <Checkbox id="verified" data-testid="checkbox-verified" />
                      <Label htmlFor="verified" className="text-sm cursor-pointer" data-testid="label-verified">
                        Verified freelancers only
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2" data-testid="button-mobile-filters">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFilters.length > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full" data-testid="badge-filter-count">
                          {activeFilters.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle data-testid="text-mobile-filters-title">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Same filters as desktop */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block" data-testid="label-mobile-category">Category</Label>
                        <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                          <SelectTrigger data-testid="select-mobile-category">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} data-testid={`select-item-mobile-category-${cat.id}`}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Area */}
              <div className="flex-1">
                {/* Active Filters */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="container-active-filters">
                    <span className="text-sm text-muted-foreground" data-testid="text-active-filters">Active filters:</span>
                    {activeFilters.map((filter, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm" data-testid={`badge-active-filter-${i}`}>
                        {filter}
                        <button onClick={() => removeFilter(filter)} data-testid={`button-remove-filter-${i}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* All Jobs with Infinite Scroll */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg" data-testid="text-jobs-title">Available Jobs</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Showing {jobsToShow.length} of {MOCK_JOBS.length} jobs</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {jobsToShow.map((job) => (
                      <JobCard key={job.id} {...job} />
                    ))}
                  </div>

                  {/* Infinite Scroll Loader */}
                  <div ref={loaderRef} className="py-8" data-testid="explore-load-more">
                    {isLoadingMore && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-4">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                          </div>
                        ))}
                      </div>
                    )}
                    {!isLoadingMore && visibleJobs >= MOCK_JOBS.length && (
                      <div className="text-center py-4 text-muted-foreground">
                        No more jobs to load.
                      </div>
                    )}
                  </div>
                </div>

                {/* Personalized Suggestions */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold text-lg" data-testid="text-recommendations-title">Top Rated Freelancers</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredFreelancers.length > 0 ? (
                      filteredFreelancers.map((freelancer) => (
                        <Link key={freelancer.id} href={`/profile/${freelancer.id}`} data-testid={`link-freelancer-${freelancer.id}`}>
                          <div className="bg-card rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={`card-freelancer-${freelancer.id}`}>
                            <div className="flex gap-4">
                              <img 
                                src={freelancer.avatar} 
                                alt={freelancer.name}
                                className="w-16 h-16 rounded-full object-cover"
                                data-testid={`img-freelancer-avatar-${freelancer.id}`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold" data-testid={`text-freelancer-name-${freelancer.id}`}>{freelancer.name}</h4>
                                  {freelancer.verified && (
                                    <BadgeCheck className="h-4 w-4 text-blue-500" data-testid={`icon-verified-${freelancer.id}`} />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground" data-testid={`text-freelancer-title-${freelancer.id}`}>{freelancer.title}</p>
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                  <span className="flex items-center gap-1 text-amber-500" data-testid={`text-freelancer-rating-${freelancer.id}`}>
                                    <Star className="h-4 w-4 fill-current" />
                                    {freelancer.rating} ({freelancer.reviews})
                                  </span>
                                  <span className="flex items-center gap-1 text-muted-foreground" data-testid={`text-freelancer-location-${freelancer.id}`}>
                                    <MapPin className="h-3 w-3" />
                                    {freelancer.location}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary" data-testid={`text-freelancer-rate-${freelancer.id}`}>{formatAmount(freelancer.hourlyRate)}</p>
                                <p className="text-xs text-muted-foreground">/hour</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-card rounded-xl border border-dashed">
                        <p className="text-muted-foreground">No freelancers found matching your criteria.</p>
                        <Button variant="link" onClick={clearAllFilters} className="mt-2">Clear all filters</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

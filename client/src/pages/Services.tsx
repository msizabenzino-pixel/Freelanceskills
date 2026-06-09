import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { useMemo, useState } from "react";
import { useCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Zap,
  Wrench,
  Sparkles,
  Home,
  Truck,
  Shield,
  Laptop,
  Paintbrush,
  Camera,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle,
  Verified,
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";

const categories = [
  { id: "trades", name: "Trades & Repairs", icon: Wrench, color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  { id: "cleaning", name: "Cleaning", icon: Sparkles, color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  { id: "home", name: "Home Services", icon: Home, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  { id: "moving", name: "Moving & Delivery", icon: Truck, color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  { id: "safety", name: "Safety & Compliance", icon: Shield, color: "bg-red-500/15 text-red-400 border-red-500/20" },
  { id: "tech", name: "Tech & IT", icon: Laptop, color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  { id: "creative", name: "Creative & Design", icon: Paintbrush, color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { id: "events", name: "Events & Photography", icon: Camera, color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export interface ServiceResult {
  id: string;
  title: string;
  description: string;
  category: string;
  priceFrom: number;
  duration: string;
  bookingCount: number;
  taskerId: string;
  taskerName: string;
  location: string;
  rating: number;
  completedJobs: number;
  isPro: boolean;
  verified: boolean;
  photoUrl: string | null;
  skills: string[];
  hourlyRate: number;
  availability: string;
  availableNow: boolean;
  bio?: string;
}

export default function Services() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialQuery = urlParams.get("q") || "";
  const initialCategory = urlParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();

  const servicesQuery = useQuery<{ services: ServiceResult[]; total: number }>({
    queryKey: ["services", selectedCategory, searchQuery, locationQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery) params.set("q", searchQuery);
      if (locationQuery) params.set("location", locationQuery);
      const res = await apiJson<any>(`/api/services/search?${params.toString()}`, { method: "GET" });
      return res;
    },
    staleTime: 30000,
  });

  const allServices = servicesQuery.data?.services ?? [];

  const filteredServices = useMemo(() => {
    const q = normalize(searchQuery);
    const loc = normalize(locationQuery);

    if (!q && !loc) return allServices;

    return allServices.filter((service: ServiceResult) => {
      const title = normalize(service.title || "");
      const description = normalize(service.description || "");
      const category = normalize(service.category || "");
      const location = normalize(service.location || "");
      const taskerName = normalize(service.taskerName || "");
      const skills = (service.skills || []).join(" ").toLowerCase();

      if (q && !`${title} ${description} ${taskerName} ${category} ${skills}`.includes(q)) {
        return false;
      }
      if (loc && !location.includes(loc)) {
        return false;
      }
      return true;
    });
  }, [allServices, locationQuery, searchQuery]);

  const isLoading = servicesQuery.isLoading;
  const hasError = servicesQuery.isError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Tasker Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Book a Tasker in Minutes</h1>
              <p className="text-xl text-white/90 mb-8">Find verified professionals by category, location, and service request.</p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="What do you need help with?"
                    className="pl-12 h-14 text-lg bg-white text-foreground border-0 shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-services"
                  />
                </div>
                <div className="relative sm:w-48">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    className="pl-12 h-14 bg-white text-foreground border-0 shadow-lg"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    data-testid="input-location-services"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-14 px-8 bg-accent hover:bg-accent/90 text-white shadow-lg"
                  type="button"
                  data-testid="button-search-services"
                  onClick={() => {
                    servicesQuery.refetch();
                    setStatusText(`Showing ${filteredServices.length} matching services.`);
                  }}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12">
          {statusText && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {statusText}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-6">Search by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  const next = selectedCategory === category.id ? null : category.id;
                  setSelectedCategory(next);
                  servicesQuery.refetch();
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  selectedCategory === category.id
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
                data-testid={`button-category-${category.id}`}
              >
                <div className={`w-12 h-12 rounded-xl border ${category.color} flex items-center justify-center mb-3`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-200">{category.name}</h3>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Results for "${searchQuery}"` : "Available Services"}
              <span className="text-sm font-normal text-slate-400 ml-2">({filteredServices.length})</span>
            </h2>
            <button
              onClick={() => navigate("/jobs")}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              data-testid="button-view-all-services"
            >
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12" data-testid="loading-services">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          )}

          {hasError && !isLoading && (
            <div className="text-center py-16" data-testid="services-error">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Could not load services</h3>
              <p className="text-slate-400">Please refresh and try again.</p>
            </div>
          )}

          {!isLoading && !hasError && filteredServices.length === 0 && (
            <div className="text-center py-16" data-testid="empty-services">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No services found</h3>
              <p className="text-slate-400 mb-4">Try different search terms, location, or category.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setLocationQuery("");
                  setSelectedCategory(null);
                }}
                data-testid="button-clear-search-services"
              >
                Clear Search
              </Button>
            </div>
          )}

          {!isLoading && !hasError && filteredServices.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer border-slate-800 bg-slate-900/60"
                  data-testid={`service-${service.id}`}
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        {service.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{service.rating ? service.rating.toFixed(1) : "0.0"}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{service.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 my-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {service.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {service.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {(service.skills || []).slice(0, 3).map((skill) => (
                        <span key={skill} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-2xl font-bold text-emerald-400">{formatAmount(service.priceFrom)}</span>
                        <p className="text-xs text-slate-500">from</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.verified && (
                          <Verified className="w-4 h-4 text-emerald-400" />
                        )}
                        {service.isPro && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium">
                            Pro
                          </span>
                        )}
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" data-testid={`button-book-${service.id}`}>
                          <Zap className="w-4 h-4 mr-1" /> Book
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>{service.taskerName}</span>
                      <span>· {service.completedJobs} jobs done
                      </span>
                      {service.availableNow && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Available now
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to offer your services?</h2>
              <p className="text-lg text-slate-400 mb-8">
                Join thousands of professionals earning on FreelanceSkills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold" data-testid="button-become-tasker" onClick={() => navigate("/cv-upload")}>
                  <Users className="w-5 h-5 mr-2" /> Become a Tasker
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" data-testid="button-view-pricing" onClick={() => navigate("/pricing")}>
                  <FileText className="w-5 h-5 mr-2" /> View Pro Benefits
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

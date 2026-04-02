import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation, useSearch } from "wouter";
import { useMemo, useState } from "react";
import { useCurrency } from "@/lib/currency";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  createBooking,
  createServiceRequest,
  fetchServicesFromFirestore,
  fetchTaskersFromFirestore,
  type ServiceItem,
  type Tasker,
} from "@/lib/firebaseAppData";
import {
  Search,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
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
} from "lucide-react";

const categories = [
  { id: "trades", name: "Trades & Repairs", icon: Wrench, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30" },
  { id: "cleaning", name: "Cleaning", icon: Sparkles, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
  { id: "home", name: "Home Services", icon: Home, color: "bg-green-100 text-green-600 dark:bg-green-900/30" },
  { id: "moving", name: "Moving & Delivery", icon: Truck, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
  { id: "safety", name: "Safety & Compliance", icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900/30" },
  { id: "tech", name: "Tech & IT", icon: Laptop, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" },
  { id: "creative", name: "Creative & Design", icon: Paintbrush, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30" },
  { id: "events", name: "Events & Photography", icon: Camera, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30" },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function Services() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialQuery = urlParams.get("q") || "";
  const initialCategory = urlParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const servicesQuery = useQuery({
    queryKey: ["firebase", "services"],
    queryFn: fetchServicesFromFirestore,
  });

  const taskersQuery = useQuery({
    queryKey: ["firebase", "taskers"],
    queryFn: fetchTaskersFromFirestore,
  });

  const taskersById = useMemo(() => {
    const map = new Map<string, Tasker>();
    for (const tasker of taskersQuery.data || []) {
      map.set(tasker.id, tasker);
    }
    return map;
  }, [taskersQuery.data]);

  const filteredServices = useMemo(() => {
    const q = normalize(searchQuery);
    const loc = normalize(locationQuery);

    return (servicesQuery.data || []).filter((service) => {
      const title = normalize(service.title || "");
      const description = normalize(service.description || "");
      const category = normalize(service.category || "");
      const location = normalize(service.location || "");
      const taskerName = normalize(service.taskerName || "");

      if (selectedCategory && category !== normalize(selectedCategory)) {
        return false;
      }
      if (q && !`${title} ${description} ${taskerName} ${category}`.includes(q)) {
        return false;
      }
      if (loc && !location.includes(loc)) {
        return false;
      }
      return true;
    });
  }, [locationQuery, searchQuery, selectedCategory, servicesQuery.data]);

  const createBookingMutation = useMutation({
    mutationFn: async (service: ServiceItem) => {
      if (!user?.id) throw new Error("Please sign in to book a tasker.");
      await createBooking({
        serviceId: service.id,
        userId: user.id,
        taskerId: service.taskerId,
        note: `Booking request for ${service.title}`,
      });
      await createServiceRequest({
        userId: user.id,
        serviceId: service.id,
        category: service.category,
        request: service.title,
        location: locationQuery.trim() || service.location,
      });
    },
    onSuccess: () => {
      setStatusText("Tasker booked successfully. Your request has been saved.");
      setActiveService(null);
    },
    onError: (error: Error) => {
      setStatusText(error.message);
    },
  });

  const isLoading = servicesQuery.isLoading || taskersQuery.isLoading;
  const hasError = servicesQuery.isError || taskersQuery.isError;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                  onClick={() => setStatusText(`Showing ${filteredServices.length} matching services.`)}
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
            <div className="mb-6 rounded-lg border border-border bg-card p-3 text-sm text-foreground">{statusText}</div>
          )}

          <h2 className="text-2xl font-bold text-primary mb-6">Search by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                  selectedCategory === category.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                data-testid={`button-category-${category.id}`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {searchQuery ? `Results for "${searchQuery}"` : "Available Services"}
              <span className="text-sm font-normal text-muted-foreground ml-2">({filteredServices.length})</span>
            </h2>
            <button
              onClick={() => navigate("/explore")}
              className="text-primary hover:text-accent flex items-center gap-1 font-medium transition-colors"
              data-testid="button-view-all-services"
            >
              View Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12" data-testid="loading-services">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {hasError && !isLoading && (
            <div className="text-center py-16" data-testid="services-error">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Could not load services</h3>
              <p className="text-muted-foreground">Please refresh and try again.</p>
            </div>
          )}

          {!isLoading && !hasError && filteredServices.length === 0 && (
            <div className="text-center py-16" data-testid="empty-services">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">Try different search terms, location, or category.</p>
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
              {filteredServices.map((service) => {
                const tasker = taskersById.get(service.taskerId);
                return (
                  <Card
                    key={service.id}
                    className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                    data-testid={`service-${service.id}`}
                    onClick={() => setActiveService(service)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-accent text-white">{service.category}</Badge>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold">{service.rating || tasker?.rating || 0}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground my-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {service.availability}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {service.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <span className="text-2xl font-bold text-primary">{formatAmount(service.priceFrom || 0)}</span>
                          <p className="text-xs text-muted-foreground">from</p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90" data-testid={`button-book-${service.id}`}>
                          <Zap className="w-4 h-4 mr-1" /> Book Tasker
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Tasker: {service.taskerName}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Ready to offer your services?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of professionals earning on FreelanceSkills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90" data-testid="button-become-tasker" onClick={() => navigate("/onboarding")}>
                  <Users className="w-5 h-5 mr-2" /> Become a Tasker
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5" data-testid="button-view-pricing" onClick={() => navigate("/pricing")}>
                  <FileText className="w-5 h-5 mr-2" /> View Pro Benefits
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={Boolean(activeService)} onOpenChange={(open) => !open && setActiveService(null)}>
        <DialogContent className="max-w-xl">
          {activeService && (
            <>
              <DialogHeader>
                <DialogTitle>{activeService.title}</DialogTitle>
                <DialogDescription>{activeService.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{activeService.category}</Badge>
                  <Badge>{activeService.availability}</Badge>
                </div>
                <p className="text-muted-foreground">Tasker: {activeService.taskerName}</p>
                <p className="text-muted-foreground">Location: {activeService.location}</p>
                <p className="text-muted-foreground">Rating: {activeService.rating || 0}</p>
                <p className="text-xl font-bold text-primary">{formatAmount(activeService.priceFrom || 0)}+</p>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      if (!user?.id) {
                        navigate(`/login?redirect=${encodeURIComponent("/services")}`);
                        return;
                      }
                      createBookingMutation.mutate(activeService);
                    }}
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" />Book Tasker</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!user?.id) {
                        navigate(`/login?redirect=${encodeURIComponent("/services")}`);
                        return;
                      }
                      createBookingMutation.mutate(activeService);
                    }}
                    disabled={createBookingMutation.isPending}
                  >
                    Request Service
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

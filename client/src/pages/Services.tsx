import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { useCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, MapPin, Clock, Star, CheckCircle2, Zap, 
  Wrench, Sparkles, Home, Truck, Shield, Laptop,
  Paintbrush, Camera, Users, FileText, ArrowRight, Loader2
} from "lucide-react";

const categories = [
  { id: "trades", name: "Trades & Repairs", icon: Wrench, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30", count: 2847 },
  { id: "cleaning", name: "Cleaning", icon: Sparkles, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30", count: 1523 },
  { id: "home", name: "Home Services", icon: Home, color: "bg-green-100 text-green-600 dark:bg-green-900/30", count: 985 },
  { id: "moving", name: "Moving & Delivery", icon: Truck, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30", count: 742 },
  { id: "safety", name: "Safety & Compliance", icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900/30", count: 456 },
  { id: "tech", name: "Tech & IT", icon: Laptop, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30", count: 1234 },
  { id: "creative", name: "Creative & Design", icon: Paintbrush, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30", count: 892 },
  { id: "events", name: "Events & Photography", icon: Camera, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30", count: 567 },
];

const featuredPackages = [
  {
    id: "1",
    title: "Emergency Plumbing Repair",
    description: "Professional emergency plumbing repair services available 24/7",
    category: "trades",
    freelancer: "Thabo M.",
    rating: 4.9,
    reviews: 234,
    price: 850,
    duration: "2-4 hours",
    location: "Johannesburg",
    badge: "Same Day",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: "2", 
    title: "Electrical Certificate (COC)",
    description: "Professional electrical certification and compliance verification",
    category: "trades",
    freelancer: "David K.",
    rating: 5.0,
    reviews: 189,
    price: 1200,
    duration: "1 day",
    location: "Cape Town",
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: "3",
    title: "Deep House Cleaning",
    description: "Comprehensive deep cleaning service for residential properties",
    category: "cleaning",
    freelancer: "Nomvula S.",
    rating: 4.8,
    reviews: 412,
    price: 650,
    duration: "4-6 hours",
    location: "Pretoria",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: "4",
    title: "SHEQ Safety Audit",
    description: "Safety, Health, Environment and Quality audit services",
    category: "safety",
    freelancer: "Sipho N.",
    rating: 4.9,
    reviews: 87,
    price: 3500,
    duration: "1-2 days",
    location: "Durban",
    badge: "Pro",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: "5",
    title: "Full-Stack Developer",
    description: "Expert full-stack web development and consultation services",
    category: "tech",
    freelancer: "Lerato M.",
    rating: 5.0,
    reviews: 156,
    price: 750,
    duration: "per hour",
    location: "Remote",
    badge: "Expert",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: "6",
    title: "Moving & Packing Service",
    description: "Professional moving and packing services for residential and commercial",
    category: "moving",
    freelancer: "Bongani T.",
    rating: 4.7,
    reviews: 298,
    price: 1500,
    duration: "Half day",
    location: "Johannesburg",
    badge: "Same Day",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=300&h=200&fit=crop",
    verified: true,
  },
];

export default function Services() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialQuery = urlParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();

  useEffect(() => {
    const q = urlParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const { data: apiPackages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const displayPackages = [
    ...apiPackages.map((pkg: any) => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description || "",
      category: pkg.category || "",
      freelancer: "Freelancer",
      rating: 0,
      reviews: 0,
      price: pkg.price,
      duration: pkg.duration || "Contact for details",
      location: "Remote",
      badge: "New",
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=200&fit=crop",
      verified: false,
    })),
    ...featuredPackages,
  ];

  const filteredPackages = displayPackages.filter((pkg) => {
    const matchesSearch = !searchQuery.trim() || 
                         pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.freelancer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content" className="flex-1">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                TaskRabbit-style Instant Booking
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Book a Tasker in Minutes
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Same-day service from verified South African professionals. No waiting, no hassle.
              </p>
              
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
                    data-testid="input-location"
                  />
                </div>
                <Button size="lg" className="h-14 px-8 bg-accent hover:bg-accent/90 text-white shadow-lg" data-testid="button-search">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                  selectedCategory === category.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                data-testid={`category-${category.id}`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count.toLocaleString()} taskers</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {searchQuery ? `Results for "${searchQuery}"` : "Featured Services"}
              <span className="text-sm font-normal text-muted-foreground ml-2">({filteredPackages.length})</span>
            </h2>
            <button
              onClick={() => navigate("/explore")}
              className="text-primary hover:text-accent flex items-center gap-1 font-medium transition-colors"
              data-testid="link-view-all-services"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredPackages.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">Try different search terms or browse categories above</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }} data-testid="button-clear-search">
                Clear Search
              </Button>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                data-testid={`package-${pkg.id}`}
                onClick={() => navigate(`/checkout?title=${encodeURIComponent(pkg.title)}&price=${pkg.price}&freelancer=${encodeURIComponent(pkg.freelancer)}&duration=${encodeURIComponent(pkg.duration)}&location=${encodeURIComponent(pkg.location)}&rating=${pkg.rating}&reviews=${pkg.reviews}&image=${encodeURIComponent(pkg.image)}`)}
              >
                <div className="relative">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-white">
                    {pkg.badge}
                  </Badge>
                  {pkg.verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {pkg.freelancer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pkg.freelancer}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{pkg.rating}</span>
                        <span className="text-xs text-muted-foreground">({pkg.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {pkg.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-primary">{formatAmount(pkg.price)}</span>
                      {pkg.duration === "per hour" && <span className="text-sm text-muted-foreground">/hr</span>}
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" data-testid={`button-book-${pkg.id}`}>
                      <Zap className="w-4 h-4 mr-1" /> Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Ready to offer your services?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of South African professionals earning on FreelanceSkills. 
                Create service packages and get booked instantly.
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

      <Footer />
    </div>
  );
}

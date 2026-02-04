import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { 
  Search, MapPin, Clock, Star, CheckCircle2, Zap, 
  Wrench, Sparkles, Home, Truck, Shield, Laptop,
  Paintbrush, Camera, Users, FileText, ArrowRight
} from "lucide-react";

const categories = [
  { id: "trades", name: "Trades & Repairs", icon: Wrench, color: "bg-orange-100 text-orange-600", count: 2847 },
  { id: "cleaning", name: "Cleaning", icon: Sparkles, color: "bg-blue-100 text-blue-600", count: 1523 },
  { id: "home", name: "Home Services", icon: Home, color: "bg-green-100 text-green-600", count: 985 },
  { id: "moving", name: "Moving & Delivery", icon: Truck, color: "bg-purple-100 text-purple-600", count: 742 },
  { id: "safety", name: "Safety & Compliance", icon: Shield, color: "bg-red-100 text-red-600", count: 456 },
  { id: "tech", name: "Tech & IT", icon: Laptop, color: "bg-indigo-100 text-indigo-600", count: 1234 },
  { id: "creative", name: "Creative & Design", icon: Paintbrush, color: "bg-pink-100 text-pink-600", count: 892 },
  { id: "events", name: "Events & Photography", icon: Camera, color: "bg-yellow-100 text-yellow-600", count: 567 },
];

const featuredPackages = [
  {
    id: "1",
    title: "Emergency Plumbing Repair",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white py-16">
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="What do you need help with?" 
                    className="pl-12 h-14 text-lg bg-white text-slate-900 border-0 shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-services"
                  />
                </div>
                <div className="relative sm:w-48">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Location" 
                    className="pl-12 h-14 bg-white text-slate-900 border-0 shadow-lg"
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
                    : 'border-slate-200 hover:border-primary/50'
                }`}
                data-testid={`category-${category.id}`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900">{category.name}</h3>
                <p className="text-sm text-slate-500">{category.count.toLocaleString()} taskers</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Featured Services</h2>
            <Link href="/find-talent">
              <a className="text-primary hover:text-accent flex items-center gap-1 font-medium transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer" data-testid={`package-${pkg.id}`}>
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
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {pkg.freelancer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{pkg.freelancer}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{pkg.rating}</span>
                        <span className="text-xs text-slate-400">({pkg.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {pkg.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-2xl font-bold text-primary">R{pkg.price.toLocaleString()}</span>
                      {pkg.duration === "per hour" && <span className="text-sm text-slate-500">/hr</span>}
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
              <p className="text-lg text-slate-600 mb-6">
                Join thousands of South African professionals earning on FreelanceSkill. 
                Create service packages and get booked instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/post-job">
                  <Button size="lg" className="bg-primary hover:bg-primary/90" data-testid="button-become-tasker">
                    <Users className="w-5 h-5 mr-2" /> Become a Tasker
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5" data-testid="button-view-pricing">
                    <FileText className="w-5 h-5 mr-2" /> View Pro Benefits
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Sparkles, GraduationCap, TrendingUp, Users, Gift, Building2, Brain, Link2, Wallet, BarChart3, Leaf, Globe, ChevronRight, ShieldCheck, Lock, FileText, Headphones, Star, Quote, Send, Zap, X } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useCurrency } from "@/lib/currency";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { Code, Wrench, Heart, Hammer, Home as HomeIcon, Waves, Car, Shield as ShieldIcon, Palette, PenTool, Briefcase, PartyPopper, Sparkles as SparklesIcon, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, any> = {
  Code, Wrench, Heart, Hammer, Home: HomeIcon, Waves, Car, Shield: ShieldIcon, Palette, PenTool, 
  Briefcase, PartyPopper, GraduationCap, TrendingUp, Sparkles: SparklesIcon, Bot
};

function UrgentJobBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const urgentCount = 3; // Mocking as per requirements

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-1.5 shadow-lg"
      data-testid="banner-urgent-jobs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-white flex-shrink-0" />
          <span className="font-semibold">{urgentCount} urgent jobs need attention</span>
        </div>
        <Link href="/jobs?urgent=true">
          <a className="font-bold whitespace-nowrap hover:text-white/80 transition-colors text-xs">
            View →
          </a>
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0 ml-2"
          aria-label="Dismiss"
          data-testid="button-dismiss-urgent-banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = duration;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;

    let timer = setInterval(() => {
      start += Math.ceil(end / (duration / incrementTime));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function Home() {
  const { formatAmount, formatRange, formatRate, formatRateRange } = useCurrency();
  const [, navigate] = useLocation();

  const featuredJobs = [
    {
      title: "Certified Safety Officer (6 Months)",
      company: "Construction Co. (Tender Project)",
      type: "On-site",
      budget: formatRate(25000, "month"),
      location: "Pretoria East (5km away)",
      postedAt: "1h ago",
      tags: ["Safety Officer", "Construction", "OHS"],
      description: "Looking for a certified Safety Officer for a government tender project in Pretoria East. Must have SACPCMP registration."
    },
    {
      title: "Emergency Plumber Needed",
      company: "Private Household",
      type: "Urgent",
      budget: formatRange(850, 1200),
      location: "Sandton (2km away)",
      postedAt: "15m ago",
      tags: ["Plumbing", "Maintenance", "Urgent"],
      description: "Geyser burst in the garage. Need someone immediately to assist with shutoff and repair."
    },
    {
      title: "Senior React Developer for Fintech App",
      company: "Capitec Bank (via FreelanceSkills Enterprise)",
      type: "Remote",
      budget: formatRateRange(650, 850, "hr"),
      location: "Cape Town / Remote",
      postedAt: "2h ago",
      tags: ["React", "TypeScript", "Node.js"],
      description: "We are looking for an experienced Senior React Developer to join our digital transformation team. You will be building secure, high-performance banking interfaces."
    },
    {
      title: "Tender Documentation Consultant",
      company: "SME Logistics",
      type: "Contract",
      budget: formatRate(15000, "project"),
      location: "Durban / Remote",
      postedAt: "4h ago",
      tags: ["Tender Compliance", "Writing", "Government"],
      description: "Need expert assistance in compiling a compliant bid for a municipal transport tender."
    }
  ];

  const topFreelancers = [
    {
      name: "Thabo M.",
      title: "Senior Software Engineer",
      rate: formatAmount(750),
      rating: 5.0,
      reviews: 42,
      skills: ["Python", "Django", "AWS", "React"],
      imageUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "Sarah L.",
      title: "Brand Strategist & Designer",
      rate: formatAmount(600),
      rating: 4.9,
      reviews: 85,
      skills: ["Branding", "Logo Design", "Adobe CC"],
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "David K.",
      title: "Mobile App Developer",
      rate: formatAmount(800),
      rating: 4.8,
      reviews: 29,
      skills: ["Flutter", "iOS", "Android", "Firebase"],
      imageUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "Nandi Z.",
      title: "Digital Marketing Specialist",
      rate: formatAmount(450),
      rating: 5.0,
      reviews: 63,
      skills: ["SEO", "Google Ads", "Social Media"],
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden pt-[42px]">
      <UrgentJobBanner />
      <Navbar />
      <Hero />
      <main id="main-content" role="main">
        {/* Featured Jobs */}
        <section className="py-20 md:py-24 bg-muted/30" aria-labelledby="latest-opportunities">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 id="latest-opportunities" className="text-3xl md:text-4xl font-bold text-primary mb-3">Latest Opportunities</h2>
                <p className="text-muted-foreground text-lg">Find high-paying projects from verified local businesses.</p>
              </div>
              <Button variant="outline" className="gap-2 group" onClick={() => navigate("/jobs")} data-testid="button-view-all-jobs" aria-label="View all jobs">
                  View All Jobs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredJobs.map((job, i) => (
              <JobCard key={i} {...job} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium">
                <Shield className="w-4 h-4" /> Secure & Reliable
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Why businesses choose <span className="text-accent">FreelanceSkills</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                We've built a platform specifically for the South African market, addressing the unique challenges of trust, payment security, and quality verification.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: ShieldCheck, title: "Verified Identity", desc: "Every freelancer is ID-verified and skills-vetted." },
                  { icon: Lock, title: "Escrow Payments", desc: "Funds held securely until the project is complete." },
                  { icon: FileText, title: "Tax Invoicing", desc: "Automated SARS-compliant invoicing for every job." },
                  { icon: Headphones, title: "24/7 Local Support", desc: "Human support from our teams in SA." }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors" data-testid={`trust-badge-${i}`}>
                    <item.icon className="w-8 h-8 text-accent mb-3" />
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-white/70">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="flex px-3 py-1.5 rounded-full bg-white/10 border border-white/20 items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider">POPIA Compliant</span>
                </div>
              </div>

              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold mt-4" onClick={() => navigate("/services")} data-testid="button-hire-talent">
                Hire Talent Now
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center font-bold text-primary text-2xl shadow-inner">
                    <span className="flex items-center">4.9<Star className="w-4 h-4 fill-primary ml-0.5" /></span>
                  </div>
                  <div>
                    <div className="font-bold text-xl mb-1">Excellent Rating</div>
                    <div className="text-white/70 text-sm">
                      <div className="flex items-center gap-1 text-accent mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent" />
                        ))}
                      </div>
                      Based on <span className="font-bold text-white"><AnimatedCounter value={10000} />+</span> completed projects
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[98%]" />
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Client Satisfaction</span>
                    <span className="text-accent">98%</span>
                  </div>
                </div>
              </div>
              {/* Floating Element */}
              <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-6 rounded-xl shadow-xl font-bold max-w-[220px] transform rotate-3 hover:rotate-0 transition-transform cursor-default">
                "The most reliable platform for verified SA talent."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escrow Payment Explainer */}
      <section className="py-20 bg-background border-b border-border" data-testid="section-escrow-explainer">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How Secure Escrow Works</h2>
            <p className="text-muted-foreground text-lg">Your money is safe with us. We ensure freelancers get paid and clients get the work they expect.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/4 left-[15%] right-[15%] h-0.5 bg-border -z-10" />
            
            {[
              { 
                icon: Wallet, 
                title: "1. Deposit Funds", 
                desc: "Client posts a job and deposits project funds into our secure escrow account.",
                testid: "escrow-step-1"
              },
              { 
                icon: Lock, 
                title: "2. Held Securely", 
                desc: "Funds are held safely in escrow. The freelancer starts working with peace of mind.",
                testid: "escrow-step-2"
              },
              { 
                icon: CheckCircle2, 
                title: "3. Work Completed", 
                desc: "The freelancer submits the completed work for the client's review and approval.",
                testid: "escrow-step-3"
              },
              { 
                icon: Send, 
                title: "4. Payment Released", 
                desc: "Once the client is satisfied, funds are released instantly to the freelancer.",
                testid: "escrow-step-4"
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group" data-testid={step.testid}>
                <div className="w-16 h-16 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center mb-6 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-2xl bg-muted/30 border border-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <span>Instant ZAR payouts to freelancers</span>
              </div>
              <p className="text-muted-foreground">We support all major SA banks for fast, reliable local transfers.</p>
            </div>
            <div className="flex items-center gap-6 grayscale opacity-70">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Powered by</span>
                <div className="flex items-center gap-1 font-bold text-xl text-[#00457C]">
                  <svg viewBox="0 0 40 40" className="w-8 h-8 fill-current">
                    <rect width="40" height="40" rx="8" fill="currentColor"/>
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">PF</text>
                  </svg>
                  PayFast
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Pricing Transparency */}
      <section className="py-20 bg-background border-y border-border" data-testid="section-how-it-works-pricing">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How FreelanceSkills Works</h2>
            <p className="text-muted-foreground text-lg">A simple, secure process designed for the South African market.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                step: "1",
                title: "Post a Job or Browse Talent",
                desc: "Tell us what you need or explore our directory of verified experts across 100+ categories.",
                icon: FileText
              },
              {
                step: "2",
                title: "AI Matches & Secure Escrow",
                desc: "Our AI finds the best fit. Once you hire, funds are held securely in our protected escrow system.",
                icon: Sparkles
              },
              {
                step: "3",
                title: "Get Results, Release Payment",
                desc: "Review the work. Once you're 100% satisfied, release the payment to the freelancer instantly.",
                icon: CheckCircle2
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-card border border-border hover:shadow-md transition-all text-center group" data-testid={`step-how-it-works-${i}`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">Transparent Pricing</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  No hidden fees. We believe in fair pricing that empowers both businesses and freelancers in South Africa.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">Clients: 10% platform fee</span>
                      <p className="text-sm text-muted-foreground">Significantly lower than the global 20% average.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">Freelancers: Free to join</span>
                      <p className="text-sm text-muted-foreground">Create your profile and start bidding at zero cost.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">Premium: R79/mo</span>
                      <p className="text-sm text-muted-foreground">Optional priority placement and enhanced visibility.</p>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/pricing")} data-testid="button-see-full-pricing">
                  See Full Pricing
                </Button>
              </div>
              <div className="relative">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-border">
                  <div className="text-center mb-6">
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estimated Savings</div>
                    <div className="text-4xl font-bold text-primary">Save up to 50%</div>
                    <div className="text-sm text-muted-foreground">on platform fees vs. international sites</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">FreelanceSkills</span>
                      <span className="font-bold text-emerald-600">10%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-dashed border-border opacity-60">
                      <span className="text-sm font-medium">Typical Platform</span>
                      <span className="font-bold">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Meet Top Talent</h2>
            <p className="text-muted-foreground text-lg">Expert freelancers ready to start your project today.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFreelancers.map((freelancer, i) => (
              <FreelancerCard key={i} {...freelancer} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8" onClick={() => navigate("/explore")} data-testid="button-view-all-talent">
                View All Talent
              </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Explore by Category</h2>
            <p className="text-muted-foreground text-lg">Find the right expert for your specific needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {SERVICE_CATEGORIES.slice(0, 8).map((category) => {
              const IconComponent = ICON_MAP[category.icon] || Briefcase;
              return (
                <Link key={category.id} href={`/explore?category=${category.id}`}>
                  <button
                    className="w-full p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all text-center group"
                    data-testid={`button-home-category-${category.id}`}
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform mx-auto`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-xs mb-1 line-clamp-1">{category.name}</h3>
                  </button>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate("/explore")} data-testid="button-home-view-all-categories">
              View All Categories <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Metrics Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white" data-testid="section-impact-banner">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Impact on Africa</h2>
            <p className="text-white/80 text-lg">Empowering 1 Million Africans by 2031</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "12,847", label: "Jobs Created", icon: TrendingUp },
              { value: formatAmount(47200000), label: "Income Generated", icon: TrendingUp },
              { value: "8,432", label: "Freelancers Empowered", icon: Users },
              { value: "156", label: "Communities Reached", icon: Users },
            ].map((stat, i) => (
              <div key={i} className="text-center" data-testid={`stat-impact-${i}`}>
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-white/70" />
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-700 gap-2" data-testid="button-view-impact" onClick={() => navigate("/impact")}>
                View Full Impact Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
          </div>
        </div>
      </section>

      {/* Founder Trust Signal */}
      <section className="py-16 bg-muted/20 border-y border-border" data-testid="section-founder-trust">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white/20">
                  <div className="text-white text-center p-4">
                    <div className="text-5xl font-black">BM</div>
                    <div className="text-xs font-semibold tracking-widest text-white/70 mt-1 uppercase">Founder</div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  11 Years Eskom ✓
                </div>
              </div>
            </div>
            <div className="md:col-span-3 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold tracking-wider uppercase">
                Built by someone who lived the grind
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                "I spent 11 years at Eskom, led teams on R100M+ projects, and still struggled to hire reliable talent for my own business."
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ben Msiza, GCC-certified engineer, B-Tech Mechanical, and founder of FreelanceSkills, built this platform because he experienced the hiring problem firsthand — and decided to solve it for every South African.
              </p>
              <div className="flex flex-wrap gap-6 pt-2">
                {[
                  { label: "GCC Certified", sub: "Govt. Certificate of Competency" },
                  { label: "B-Tech Mechanical", sub: "UNISA Graduate" },
                  { label: "CIPC Registered", sub: "2026/070509/09" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-foreground">{badge.label}</div>
                      <div className="text-xs text-muted-foreground">{badge.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="gap-2 group mt-2" onClick={() => navigate("/about")} data-testid="button-founder-story">
                Read the Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-background" data-testid="section-success-stories">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Success Stories</h2>
            <p className="text-muted-foreground text-lg">Real impact from the FreelanceSkills community across South Africa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sipho M.",
                location: "Soweto, Gauteng",
                title: "From township plumber to R50k/mo",
                before: "Struggling to find consistent local work through word-of-mouth.",
                after: "Running a registered maintenance business with 3 employees.",
                growth: "500% revenue increase",
                quote: "FreelanceSkills gave me the professional platform I needed to reach high-value clients in Sandton and beyond.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
              },
              {
                name: "Elena R.",
                location: "Cape Town, WC",
                title: "Global clients from Cape Town",
                before: "Local junior developer with limited exposure to international projects.",
                after: "Senior full-stack contractor for European fintech firms.",
                growth: "R850/hr average rate",
                quote: "The identity verification and secure escrow gave international clients the confidence to hire me remotely.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200"
              },
              {
                name: "Zanele K.",
                location: "Durban, KZN",
                title: "First-time entrepreneur",
                before: "Unemployed graduate looking for a way to start a cleaning service.",
                after: "Top-rated service provider with 45+ verified 5-star reviews.",
                growth: "100+ projects completed",
                quote: "I started with one vacuum cleaner and the FreelanceSkills app. Today, I'm my own boss and financially independent.",
                image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200"
              }
            ].map((story, i) => (
              <Card key={i} className="border-border/50 overflow-hidden hover:shadow-xl transition-shadow flex flex-col" data-testid={`card-success-story-${i}`}>
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-8 flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={story.image} alt={story.name} />
                        <AvatarFallback>{story.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{story.name}</h3>
                        <p className="text-sm text-muted-foreground">{story.location}</p>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-primary text-xl mb-4 italic leading-tight">"{story.title}"</h4>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex gap-3">
                        <div className="mt-1"><div className="w-2 h-2 rounded-full bg-red-400" /></div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Before</p>
                          <p className="text-sm leading-relaxed">{story.before}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="mt-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /></div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">After</p>
                          <p className="text-sm leading-relaxed">{story.after}</p>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-6">
                      <TrendingUp className="w-4 h-4" /> {story.growth}
                    </div>

                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10 -z-10" />
                      <p className="text-muted-foreground italic relative z-10">"{story.quote}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academy & Strategic CTAs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">More Than a Marketplace</h2>
            <p className="text-muted-foreground text-lg">We're building Africa's economic revolution — upskilling, connecting, and empowering.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-8 border border-border card-glow transition-all" data-testid="card-academy-cta">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI Upskilling Academy</h3>
              <p className="text-muted-foreground mb-6">Free AI-powered courses for African freelancers. From plumbing to programming — master AI tools that 10x your earnings.</p>
              <Button variant="outline" className="gap-2 group hover:bg-primary hover:text-white hover:border-primary transition-all" data-testid="button-academy-cta" onClick={() => navigate("/academy")}>
                Start Learning Free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border card-glow transition-all" data-testid="card-enterprise-cta">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit mb-4">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise Solutions</h3>
              <p className="text-muted-foreground mb-6">Bulk hiring, tender integration, and youth employment programs for corporates and government partners.</p>
              <Button variant="outline" className="gap-2 group hover:bg-primary hover:text-white hover:border-primary transition-all" data-testid="button-enterprise-cta" onClick={() => navigate("/enterprise")}>
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border card-glow transition-all" data-testid="card-referral-cta">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mb-4">
                <Gift className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Refer & Earn</h3>
              <p className="text-muted-foreground mb-6">Share FreelanceSkills with friends and earn up to R250 per referral. Build a community, get rewarded.</p>
              <Button variant="outline" className="gap-2 group hover:bg-primary hover:text-white hover:border-primary transition-all" data-testid="button-referral-cta" onClick={() => navigate("/referral")}>
                Get Your Link <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Lab - 2031 Vision */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-muted/40">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-5 shadow-sm">
              <Brain className="w-4 h-4" /> 2031 Vision
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Innovation Lab</h2>
            <p className="text-muted-foreground text-lg">Cutting-edge technology powering Africa's future of work.</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {[
              { icon: Brain, title: "AI Smart Matching", desc: "Autonomous AI agents find your perfect hire", href: "/ai-match", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", glow: "hover:shadow-blue-500/10" },
              { icon: Link2, title: "Blockchain Credentials", desc: "Verified skills on-chain, tamper-proof", href: "/credentials", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", glow: "hover:shadow-purple-500/10" },
              { icon: Wallet, title: "Crypto Payments", desc: "Multi-currency & mobile money", href: "/payments-hub", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", glow: "hover:shadow-amber-500/10" },
              { icon: BarChart3, title: "Analytics", desc: "AI-powered earning insights", href: "/analytics", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", glow: "hover:shadow-emerald-500/10" },
              { icon: Leaf, title: "Green Impact", desc: "Carbon tracking for remote work", href: "/sustainability", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", glow: "hover:shadow-green-500/10" },
              { icon: Globe, title: "14 Languages", desc: "Accessibility for all Africans", href: "/accessibility", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400", glow: "hover:shadow-rose-500/10" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.href)}
                className={`bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-xl ${item.glow} transition-all duration-300 hover:-translate-y-1.5 text-left group card-glow`}
                data-testid={`card-innovation-${i}`}
              >
                <div className={`p-2.5 rounded-xl ${item.color} w-fit mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog & Knowledge Hub Teaser */}
      <section className="py-20 bg-background border-y border-border" data-testid="section-blog-teaser">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> #1 SA Freelance Knowledge Hub
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Learn. Earn. Grow.</h2>
              <p className="text-muted-foreground text-lg max-w-xl">South Africa's most practical freelancing guides — from winning your first tender to filing for SARS as a solo professional.</p>
            </div>
            <Button variant="outline" className="gap-2 group whitespace-nowrap" onClick={() => navigate("/blog")} data-testid="button-view-blog">
              Visit the Blog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                category: "AI Tools",
                title: "10 AI Tools That Will 10x Your Freelance Income in 2026",
                excerpt: "ChatGPT, Midjourney, and Copilot are the basics. We break down 10 advanced AI tools that SA freelancers are using right now to double their output and triple their rates.",
                readTime: "8 min read",
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                href: "/blog/10-ai-tools-freelance-income-2026"
              },
              {
                category: "SA Tax & Legal",
                title: "The Complete SARS Tax Guide for South African Freelancers",
                excerpt: "Provisional tax, VAT registration, allowable deductions — everything you need to stay legal and keep more of your hard-earned money.",
                readTime: "12 min read",
                color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                href: "/blog/sars-tax-guide-south-african-freelancers"
              },
              {
                category: "Tenders & Government",
                title: "How to Win Your First Government Tender as a Freelancer",
                excerpt: "A step-by-step walkthrough of registering on the Central Supplier Database (CSD), finding open tenders, and crafting a compliant bid that stands out.",
                readTime: "15 min read",
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                href: "/blog/win-first-government-tender-south-africa"
              }
            ].map((article, i) => (
              <button
                key={i}
                className="text-left bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
                onClick={() => navigate(article.href)}
                data-testid={`card-blog-teaser-${i}`}
              >
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${article.color}`}>
                  {article.category}
                </span>
                <h3 className="font-bold text-foreground text-lg mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{article.readTime}</span>
                  <span>·</span>
                  <span className="text-primary font-semibold group-hover:underline">Read article →</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6" data-testid="section-academy-funnel">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Blog → Academy → Jobs Funnel</div>
              <h3 className="text-xl font-bold text-foreground">Read an article. Take a course. Land a job.</h3>
              <p className="text-muted-foreground text-sm">Every blog post links to a free Academy course. Every course links to live job listings. Your growth path, automated.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button variant="outline" onClick={() => navigate("/blog")} data-testid="button-funnel-blog">
                Browse Articles
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/academy")} data-testid="button-funnel-academy">
                <GraduationCap className="w-4 h-4 mr-2" /> Start Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Trusted by Thousands across SA</h2>
            <p className="text-muted-foreground text-lg">Hear from the freelancers and businesses growing with us.</p>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
            data-testid="carousel-testimonials"
          >
            <CarouselContent>
              {[
                {
                  name: "Sipho Khumalo",
                  role: "General Contractor",
                  location: "Soweto, GP",
                  rating: 5,
                  quote: "FreelanceSkills changed my business. I used to struggle with payments, now everything is secure through escrow.",
                },
                {
                  name: "Lerato Mokoena",
                  role: "Graphic Designer",
                  location: "Sandton, GP",
                  rating: 5,
                  quote: "The AI profile builder helped me showcase my skills perfectly. I landed my first big corporate client within a week.",
                },
                {
                  name: "Johan van der Merwe",
                  role: "SME Owner",
                  location: "Stellenbosch, WC",
                  rating: 4,
                  quote: "Finding reliable developers in South Africa was a challenge until I found this platform. Highly recommended for businesses.",
                },
                {
                  name: "Fatima Patel",
                  role: "Digital Marketer",
                  location: "Durban, KZN",
                  rating: 5,
                  quote: "I love the local support team. They actually understand the SA market and help whenever I have questions about tax invoicing.",
                },
                {
                  name: "Thandiwe Dlamini",
                  role: "Content Writer",
                  location: "Mbombela, MP",
                  rating: 5,
                  quote: "As a remote freelancer, having a platform that handles South African bank transfers easily is a lifesaver.",
                },
                {
                  name: "Kevin Naidoo",
                  role: "IT Consultant",
                  location: "Umhlanga, KZN",
                  rating: 5,
                  quote: "The verification process adds so much trust. Clients know they're hiring a professional, not just anyone.",
                },
                {
                  name: "Zanele Mbeki",
                  role: "Event Planner",
                  location: "Port Elizabeth, EC",
                  rating: 4,
                  quote: "The variety of talent here is amazing. From photographers to security, I find everything I need for my events.",
                },
                {
                  name: "Pieter Botha",
                  role: "Software Architect",
                  location: "Pretoria, GP",
                  rating: 5,
                  quote: "Technical projects require specialized talent. This platform consistently delivers high-quality candidates.",
                }
              ].map((testimonial, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <Card className="h-full border-border/50 shadow-sm" data-testid={`card-testimonial-${i}`}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${index < testimonial.rating ? "fill-accent text-accent" : "text-muted"}`}
                          />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 text-primary/10 mb-4 shrink-0" />
                      <p className="text-muted-foreground italic mb-6 flex-grow">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4 mt-auto">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&color=fff`} />
                          <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground text-sm" data-testid={`text-testimonial-name-${i}`}>{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.location}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12" />
              <CarouselNext className="-right-12" />
            </div>
          </Carousel>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
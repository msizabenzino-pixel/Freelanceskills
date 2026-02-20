import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Sparkles, GraduationCap, TrendingUp, Users, Gift, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useCurrency } from "@/lib/currency";

export default function Home() {
  const { formatAmount, formatRange, formatRate, formatRateRange } = useCurrency();

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
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <Hero />
      <main id="main-content" role="main">

      {/* AI Task Assistant CTA */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Not sure where to start?</h3>
                <p className="text-muted-foreground">Let our AI help you find the right service category and budget estimate</p>
              </div>
            </div>
            <Link href="/task-assistant">
              <Button size="lg" className="gap-2 whitespace-nowrap" data-testid="button-homepage-ai-assistant">
                <Sparkles className="h-4 w-4" />
                Try AI Task Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Connecting Households, SMEs & Enterprise</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos represented by text for mockup, in reality would be SVGs */}
            <span className="text-xl font-bold font-display">Dept. of Public Works</span>
            <span className="text-xl font-bold font-display">Standard Bank</span>
            <span className="text-xl font-bold font-display">Builders Warehouse</span>
            <span className="text-xl font-bold font-display">MTN</span>
            <span className="text-xl font-bold font-display">Private Households</span>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Latest Opportunities</h2>
              <p className="text-muted-foreground text-lg">Find high-paying projects from verified local businesses.</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="gap-2 group">
                View All Jobs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
              
              <ul className="space-y-4 pt-4">
                {[
                  "Verified Identity & Skills Vetting",
                  "Secure Escrow Payments (No more non-payment)",
                  "Compliant Tax Invoicing Generation",
                  "Dedicated Local Support Team"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/90">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold mt-4">
                Hire Talent Now
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-bold text-primary text-xl">4.9</div>
                  <div>
                    <div className="font-bold text-lg">Average Client Rating</div>
                    <div className="text-white/60 text-sm">Based on 10,000+ completed projects</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[95%]" />
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Project Satisfaction</span>
                    <span className="text-accent">98%</span>
                  </div>
                </div>
              </div>
              {/* Floating Element */}
              <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-6 rounded-xl shadow-xl font-bold max-w-[200px]">
                "The best platform for finding reliable local devs."
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
            <Link href="/freelancers">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8">
                View All Talent
              </Button>
            </Link>
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
            <Link href="/impact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-700 gap-2" data-testid="button-view-impact">
                View Full Impact Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow" data-testid="card-academy-cta">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI Upskilling Academy</h3>
              <p className="text-muted-foreground mb-4">Free AI-powered courses for African freelancers. From plumbing to programming — master AI tools that 10x your earnings.</p>
              <Link href="/academy">
                <Button variant="outline" className="gap-2" data-testid="button-academy-cta">
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow" data-testid="card-enterprise-cta">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise Solutions</h3>
              <p className="text-muted-foreground mb-4">Bulk hiring, tender integration, and youth employment programs for corporates and government partners.</p>
              <Link href="/enterprise">
                <Button variant="outline" className="gap-2" data-testid="button-enterprise-cta">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow" data-testid="card-referral-cta">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mb-4">
                <Gift className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Refer & Earn</h3>
              <p className="text-muted-foreground mb-4">Share FreelanceSkills with friends and earn up to R250 per referral. Build a community, get rewarded.</p>
              <Link href="/referral">
                <Button variant="outline" className="gap-2" data-testid="button-referral-cta">
                  Get Your Link <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
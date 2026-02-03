import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const featuredJobs = [
    {
      title: "Senior React Developer for Fintech App",
      company: "Capitec Bank (via FreelanceSkill Enterprise)",
      type: "Remote",
      budget: "R650 - R850 / hr",
      location: "Cape Town / Remote",
      postedAt: "2h ago",
      tags: ["React", "TypeScript", "Node.js"],
      description: "We are looking for an experienced Senior React Developer to join our digital transformation team. You will be building secure, high-performance banking interfaces used by millions of South Africans."
    },
    {
      title: "UX/UI Designer for E-commerce Platform",
      company: "Takealot Group",
      type: "Contract",
      budget: "R45,000 / project",
      location: "Remote",
      postedAt: "5h ago",
      tags: ["Figma", "UI Design", "E-commerce"],
      description: "Redesigning our checkout flow to improve conversion rates. Requires deep understanding of local payment gateways and mobile-first design principles."
    },
    {
      title: "Content Writer - Financial Services",
      company: "Discovery",
      type: "Part-time",
      budget: "R25,000 / month",
      location: "Sandton / Hybrid",
      postedAt: "1d ago",
      tags: ["Copywriting", "SEO", "Finance"],
      description: "Looking for a seasoned writer to produce weekly blog content and whitepapers on medical aid and investment trends in South Africa."
    },
    {
      title: "Full Stack Developer (Laravel + Vue)",
      company: "Local Startup",
      type: "Full-time",
      budget: "R500 - R600 / hr",
      location: "Durban / Remote",
      postedAt: "1d ago",
      tags: ["PHP", "Laravel", "Vue.js"],
      description: "Join a fast-growing logistics startup. We need a full-stack developer to help maintain and expand our driver management portal."
    }
  ];

  const topFreelancers = [
    {
      name: "Thabo M.",
      title: "Senior Software Engineer",
      rate: "R750",
      rating: 5.0,
      reviews: 42,
      skills: ["Python", "Django", "AWS", "React"],
      imageUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "Sarah L.",
      title: "Brand Strategist & Designer",
      rate: "R600",
      rating: 4.9,
      reviews: 85,
      skills: ["Branding", "Logo Design", "Adobe CC"],
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "David K.",
      title: "Mobile App Developer",
      rate: "R800",
      rating: 4.8,
      reviews: 29,
      skills: ["Flutter", "iOS", "Android", "Firebase"],
      imageUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200",
      verified: true
    },
    {
      name: "Nandi Z.",
      title: "Digital Marketing Specialist",
      rate: "R450",
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

      {/* Trusted By Section */}
      <section className="py-10 border-b border-border bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Trusted by South Africa's leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos represented by text for mockup, in reality would be SVGs */}
            <span className="text-xl font-bold font-display">MultiChoice</span>
            <span className="text-xl font-bold font-display">Standard Bank</span>
            <span className="text-xl font-bold font-display">Naspers</span>
            <span className="text-xl font-bold font-display">MTN</span>
            <span className="text-xl font-bold font-display">Woolworths</span>
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
                Why businesses choose <span className="text-accent">FreelanceSkill</span>
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

      <Footer />
    </div>
  );
}
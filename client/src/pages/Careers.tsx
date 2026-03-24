import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, MapPin, Clock, Zap, Users, Brain, Globe, Shield, Heart,
  CheckCircle2, TrendingUp, Code, PenTool, Headphones, BarChart3,
  GraduationCap, Building2, Sparkles, Star, Mail
} from "lucide-react";
import { motion } from "framer-motion";

const OPEN_ROLES = [
  {
    id: 1,
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    type: "Full-time · Remote (SA-based)",
    location: "Cape Town / Remote",
    icon: Code,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    description: "Build the core marketplace platform — API design, React frontend, real-time notifications, and AI integrations. You'll own high-impact features used by 10,000+ users.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Drizzle ORM", "Redis"],
    urgency: "Urgent"
  },
  {
    id: 2,
    title: "AI / Machine Learning Engineer",
    department: "AI & Innovation",
    type: "Full-time · Hybrid",
    location: "Cape Town (Camps Bay office)",
    icon: Brain,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    description: "Power the Vuma AI super-agent — smart job matching, AI proposal generation, fraud detection, and the world's first Africa-first freelance intelligence engine.",
    skills: ["Python", "OpenAI API", "LangChain", "Vector DBs", "Fine-tuning", "FastAPI"],
    urgency: "High Priority"
  },
  {
    id: 3,
    title: "Growth Hacker / Performance Marketer",
    department: "Marketing",
    type: "Full-time · Remote",
    location: "South Africa",
    icon: TrendingUp,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    description: "Own our entire growth funnel — from SEO and content to paid acquisition and referral loops. Target: 1 million registered users by 2028.",
    skills: ["SEO", "Google Ads", "Meta Ads", "Analytics", "Copywriting", "CRO"],
    urgency: null
  },
  {
    id: 4,
    title: "Community Manager & Content Lead",
    department: "Content & Community",
    type: "Full-time · Remote",
    location: "South Africa",
    icon: Users,
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    description: "Build and manage South Africa's largest freelance community. Produce the 480+ blog article roadmap. Host webinars, WhatsApp groups, and live Q&As.",
    skills: ["Content Writing", "Community Building", "SA Market Knowledge", "Social Media", "Canva"],
    urgency: null
  },
  {
    id: 5,
    title: "Customer Success Manager",
    department: "Operations",
    type: "Full-time · Hybrid",
    location: "Johannesburg / Cape Town",
    icon: Headphones,
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
    description: "Be the first voice our clients and freelancers hear. Resolve disputes, onboard power users, and build the SA freelance community's trust in the platform.",
    skills: ["Customer Service", "Conflict Resolution", "CRM Tools", "Empathy", "SA Languages a plus"],
    urgency: null
  },
  {
    id: 6,
    title: "Curriculum Designer — AI Upskilling Academy",
    department: "Academy",
    type: "Contract · Remote",
    location: "South Africa",
    icon: GraduationCap,
    color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
    description: "Design the 50+ AI upskilling courses that will transform township plumbers and unemployed graduates into digital economy earners. Africa's most impactful learning content.",
    skills: ["Instructional Design", "AI Knowledge", "Video Production", "LMS Tools", "SA Context"],
    urgency: null
  },
];

const PERKS = [
  { icon: Globe, title: "Work from Anywhere", desc: "Most roles are remote-first across South Africa." },
  { icon: TrendingUp, title: "Mission-Driven Equity", desc: "Meaningful founder-level equity for early hires." },
  { icon: GraduationCap, title: "Free Academy Access", desc: "Full access to all 50+ AI upskilling courses." },
  { icon: Heart, title: "Medical Aid Contribution", desc: "Company contribution to Discovery or Momentum." },
  { icon: Zap, title: "Fast Growth", desc: "Flat structure. No politics. Ideas heard at day one." },
  { icon: Brain, title: "AI-First Tooling", desc: "Best-in-class AI tools expensed for all staff." },
  { icon: Star, title: "Performance Bonuses", desc: "Quarterly bonuses tied to platform milestones." },
  { icon: Building2, title: "Camps Bay Office", desc: "Cape Town HQ in one of SA's most iconic locations." },
];

const VALUES = [
  { title: "Build Real Things", desc: "We ship, we learn, we iterate. No committee-driven slowness." },
  { title: "Africa First", desc: "Every decision is filtered through the lens of African context and need." },
  { title: "Radical Transparency", desc: "Open salaries, open metrics, open roadmaps." },
  { title: "Earn Your Place", desc: "No titles by default. Results and impact drive everything here." },
];

export default function Careers() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              We're hiring — join the movement
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6">
              Help us build Africa's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-300 to-yellow-200">
                economic revolution.
              </span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl mb-10">
              We're a small team doing something massive — connecting millions of South Africans to economic opportunity through the world's most advanced freelance platform. If you want your work to matter, you're in the right place.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Team size", value: "Growing fast" },
                { label: "Founded", value: "2026" },
                { label: "HQ", value: "Camps Bay, Cape Town" },
                { label: "Target users by 2031", value: "1 Million+" },
              ].map((stat, i) => (
                <div key={i} data-testid={`stat-careers-${i}`}>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">{stat.label}</div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main id="main-content">

        {/* Why Join Us */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why FreelanceSkills?</h2>
              <p className="text-muted-foreground text-lg">This isn't a job. It's a defining chapter of your career.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PERKS.map((perk, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all text-center group"
                  data-testid={`card-perk-${i}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Open Positions</h2>
              <p className="text-muted-foreground text-lg">{OPEN_ROLES.length} roles currently open. Remote-friendly. Africa-first.</p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {OPEN_ROLES.map((role) => (
                <div
                  key={role.id}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 hover:shadow-md transition-all group"
                  data-testid={`card-role-${role.id}`}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${role.color}`}>
                      <role.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{role.title}</h3>
                        {role.urgency && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            {role.urgency}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" /> {role.department}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {role.type}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {role.location}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">{role.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.skills.map((skill, i) => (
                          <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={`mailto:careers@freelanceskills.co.za?subject=Application: ${role.title}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                        data-testid={`button-apply-${role.id}`}
                      >
                        Apply Now <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-muted-foreground mb-4">Don't see your role? We're always looking for exceptional people.</p>
              <a
                href="mailto:careers@freelanceskills.co.za?subject=Open Application — FreelanceSkills"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
                data-testid="button-open-application"
              >
                <Mail className="w-4 h-4" /> Send an Open Application
              </a>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Work</h2>
              <p className="text-white/70 text-lg">No corporate nonsense. Just results, trust, and impact.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {VALUES.map((value, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  data-testid={`card-value-${i}`}
                >
                  <div className="text-2xl font-black text-accent mb-3">0{i + 1}</div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Message */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                  BM
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">Ben Msiza</div>
                  <div className="text-muted-foreground text-sm">Founder & CEO, FreelanceSkills</div>
                  <div className="text-xs text-muted-foreground">GCC · B-Tech Mechanical · CIPC 2026/070509/09</div>
                </div>
              </div>
              <blockquote className="text-foreground text-lg leading-relaxed italic mb-6">
                "I spent over a decade at Eskom solving complex engineering problems with teams across South Africa. Then I left and tried to run my own businesses — and the biggest problem wasn't capital or customers. It was finding reliable, verified, skilled people to help me build.
                <br /><br />
                FreelanceSkills exists to solve that problem permanently. If you want to help build Africa's future of work — not just talk about it — come join us."
              </blockquote>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/about")} variant="outline" data-testid="button-careers-about">
                  Read Ben's Full Story
                </Button>
                <a href="mailto:careers@freelanceskills.co.za" data-testid="button-careers-email">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Mail className="w-4 h-4 mr-2" /> Email Us Directly
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to change Africa's economy?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Send your CV and a short note about why you'd be a great fit. No cover letter templates. Just tell us who you are and what you'd build.</p>
            <a
              href="mailto:careers@freelanceskills.co.za"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-700 font-bold text-lg hover:bg-white/90 transition-colors shadow-xl"
              data-testid="button-final-apply"
            >
              <Mail className="w-5 h-5" /> careers@freelanceskills.co.za
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

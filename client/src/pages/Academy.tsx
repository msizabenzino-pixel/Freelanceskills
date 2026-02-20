import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Wrench,
  Monitor,
  Brain,
  MessageSquare,
  BarChart3,
  Briefcase,
  Trophy,
  Star,
  ArrowRight,
  CheckCircle2,
  Coins,
  Shield,
  Globe,
  Bot,
  Send,
  Award,
  Users,
  Zap,
  Target,
  Rocket,
} from "lucide-react";

const tiers = [
  {
    level: 1,
    title: "AI Basics",
    tag: "Free",
    tagColor: "bg-green-500/10 text-green-600",
    description: "1-hour intro to AI tools. Voice-guided, offline-downloadable. Every user starts here.",
    icon: Sparkles,
    features: [
      "What is AI and how it applies to your trade",
      "Voice-guided lessons in local languages",
      "Download for offline learning",
      "Interactive quizzes & progress tracking",
    ],
  },
  {
    level: 2,
    title: "Personalized Micro-Courses",
    tag: "Free for Africans",
    tagColor: "bg-blue-500/10 text-blue-600",
    description: "AI analyzes your profile and recommends 5–20 hour learning paths tailored to your skills.",
    icon: BookOpen,
    features: [
      "\"AI for Graphic Design\"",
      "\"AI for Plumbing Quotes\"",
      "\"Prompt Engineering Fundamentals\"",
      "Adaptive learning pace",
    ],
  },
  {
    level: 3,
    title: "Intensive Bootcamps",
    tag: "Scholarships Available",
    tagColor: "bg-purple-500/10 text-purple-600",
    description: "Cohort-based, hands-on projects with a portfolio builder. Partners: Google AI, Microsoft, TVET colleges.",
    icon: GraduationCap,
    features: [
      "Live mentor sessions",
      "Real-world project portfolio",
      "Industry-recognized certification",
      "Job placement assistance",
    ],
  },
];

const categories = [
  {
    title: "AI for Trades",
    description: "Plumbing, electrical, construction — use AI to quote faster, find clients, and manage jobs.",
    icon: Wrench,
    courses: 12,
  },
  {
    title: "AI for Digital",
    description: "Web development, content creation, and digital marketing powered by AI tools.",
    icon: Monitor,
    courses: 18,
  },
  {
    title: "AI Creation",
    description: "Build AI models, create no-code apps, and automate workflows from scratch.",
    icon: Brain,
    courses: 8,
  },
  {
    title: "Soft Skills + AI",
    description: "Communication, negotiation, and client management enhanced with AI assistance.",
    icon: MessageSquare,
    courses: 10,
  },
  {
    title: "Data & Analytics",
    description: "Turn raw data into actionable insights using AI-powered analytics tools.",
    icon: BarChart3,
    courses: 14,
  },
  {
    title: "AI for Business",
    description: "Quotes, invoicing, CRM, and operations — automate your business with AI.",
    icon: Briefcase,
    courses: 16,
  },
];

const partners = [
  { name: "NVIDIA", icon: Zap },
  { name: "Google AI", icon: Brain },
  { name: "Microsoft", icon: Monitor },
  { name: "TVET Colleges", icon: GraduationCap },
  { name: "MTN", icon: Globe },
];

export default function Academy() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20" data-testid="badge-academy-hero">
              <Rocket className="w-3 h-3 mr-1" /> Powered by First-Principles Thinking
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-academy-title">
              AI Upskilling Academy
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed" data-testid="text-academy-subtitle">
              Free AI-powered training for every African. From plumbers to developers — master AI tools that 10x your earning potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold text-lg px-8 shadow-lg" data-testid="button-hero-start-learning">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Learning Free
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold" data-testid="button-hero-explore-courses">
                Explore Courses
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/70 text-sm">
              <div className="flex items-center gap-2" data-testid="stat-learners">
                <Users className="w-4 h-4" /> 50,000+ Learners
              </div>
              <div className="flex items-center gap-2" data-testid="stat-courses">
                <BookOpen className="w-4 h-4" /> 78 Courses
              </div>
              <div className="flex items-center gap-2" data-testid="stat-languages">
                <Globe className="w-4 h-4" /> 11 Languages
              </div>
              <div className="flex items-center gap-2" data-testid="stat-free">
                <CheckCircle2 className="w-4 h-4" /> 100% Free to Start
              </div>
            </div>
          </div>
        </section>

        {/* 3-Tier Structure */}
        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-tiers">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Your Learning Journey</h2>
              <p className="text-muted-foreground text-lg">
                A structured path from AI beginner to industry-ready professional. Start free, grow fast.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {tiers.map((tier) => (
                <Card key={tier.level} className="border-border hover:shadow-xl transition-shadow duration-300 overflow-hidden" data-testid={`card-tier-${tier.level}`}>
                  <div className="p-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <tier.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className={tier.tagColor} data-testid={`badge-tier-${tier.level}`}>{tier.tag}</Badge>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">Level {tier.level}</div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{tier.title}</h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{tier.description}</p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6 gap-2" variant={tier.level === 1 ? "default" : "outline"} data-testid={`button-tier-${tier.level}-start`}>
                      {tier.level === 1 ? "Start Here" : "Learn More"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Course Categories Grid */}
        <section className="py-20 md:py-24" data-testid="section-categories">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Course Categories</h2>
              <p className="text-muted-foreground text-lg">
                AI skills for every profession. Whether you work with your hands or a keyboard.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {categories.map((category, i) => (
                <Card key={i} className="border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group" data-testid={`card-category-${i}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{category.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{category.courses} courses</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Earn While You Learn */}
        <section className="py-20 bg-primary text-white overflow-hidden relative" data-testid="section-earn-while-learn">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium">
                  <Coins className="w-4 h-4" /> Earn While You Learn
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight" data-testid="text-earn-title">
                  Get paid <span className="text-accent">R50–R500</span> while you study
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Complete real micro-tasks during your courses — data labelling, content tagging, translation tasks — and earn money while building your skills.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Earn R50–R500 per micro-task during courses",
                    "Auto-earn badges upon course completion",
                    "Badged profiles get featured on the platform",
                    "Priority job matching for certified learners",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/90">
                      <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-8 h-8 text-accent" />
                    <div>
                      <div className="font-bold text-lg">Micro-Task Earnings</div>
                      <div className="text-white/60 text-sm">Real income while you learn</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { task: "Data labelling", reward: "R50" },
                      { task: "Content translation", reward: "R150" },
                      { task: "AI model testing", reward: "R300" },
                      { task: "Full project review", reward: "R500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <span className="text-white/80 text-sm">{item.task}</span>
                        <span className="font-bold text-accent">{item.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent text-primary p-4 rounded-xl font-semibold text-center">
                  <Star className="w-5 h-5 inline mr-2" />
                  Average learner earns R2,400/month in micro-tasks
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certification & Badges */}
        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-certification">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Certification & Badges</h2>
              <p className="text-muted-foreground text-lg">
                Blockchain-verified, stackable credentials that prove your skills to employers worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-border text-center" data-testid="card-cert-verified">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Blockchain Verified</h3>
                  <p className="text-muted-foreground text-sm">Every certificate is tamper-proof and permanently verifiable on-chain.</p>
                </CardContent>
              </Card>
              <Card className="border-border text-center" data-testid="card-cert-stackable">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Stackable Credentials</h3>
                  <p className="text-muted-foreground text-sm">Combine badges to unlock advanced roles and higher-paying opportunities.</p>
                </CardContent>
              </Card>
              <Card className="border-border text-center" data-testid="card-cert-visibility">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">3x More Profile Views</h3>
                  <p className="text-muted-foreground text-sm">Badged profiles get 3x more views from clients seeking verified talent.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Personal Tutor */}
        <section className="py-20 md:py-24" data-testid="section-ai-tutor">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Bot className="w-4 h-4" /> AI-Powered Learning
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight" data-testid="text-tutor-title">
                  Your AI tutor speaks <span className="text-accent">Zulu</span>, <span className="text-accent">Afrikaans</span>, and <span className="text-accent">Xhosa</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Get personalized guidance in your home language. Our AI tutor adapts to your pace, answers your questions 24/7, and helps you practice with real-world scenarios.
                </p>
                <ul className="space-y-3">
                  {[
                    "Available 24/7, never gets impatient",
                    "Explains concepts in your mother tongue",
                    "Adapts difficulty to your skill level",
                    "Practice with industry-specific scenarios",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chat UI Mockup */}
              <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden" data-testid="mockup-ai-tutor-chat">
                <div className="bg-primary text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">AI Tutor</div>
                    <div className="text-xs text-white/60">Online • Speaks your language</div>
                  </div>
                </div>
                <div className="p-4 space-y-4 bg-muted/30 min-h-[280px]">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">Sawubona! 👋 I'm your AI tutor. Ready to learn how AI can help you create better plumbing quotes?</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                      <p className="text-sm">Yes! I spend too much time on quotes. Can AI help?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">Absolutely! AI can generate professional quotes in seconds. Let me show you how with a quick 5-minute lesson... 🚀</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    readOnly
                    data-testid="input-tutor-chat"
                  />
                  <Button size="sm" className="shrink-0" data-testid="button-tutor-send">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16 bg-muted/30 border-y border-border" data-testid="section-partners">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Our Partners</h2>
              <p className="text-muted-foreground">World-class partners powering Africa's AI future</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {partners.map((partner, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`partner-${i}`}>
                  <partner.icon className="w-6 h-6" />
                  <span className="text-xl font-bold font-display">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24" data-testid="section-cta">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6" data-testid="text-cta-title">
                Start Learning Free Today
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Join thousands of Africans who are already using AI to transform their careers. No credit card required. No hidden fees. Just opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold text-lg px-10 shadow-lg gap-2" data-testid="button-cta-start-learning">
                  <Rocket className="w-5 h-5" />
                  Start Learning Free Today
                </Button>
                <Button size="lg" variant="outline" className="font-semibold gap-2" data-testid="button-cta-explore" onClick={() => navigate("/explore")}>
                    Explore FreelanceSkills
                    <ArrowRight className="w-4 h-4" />
                  </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
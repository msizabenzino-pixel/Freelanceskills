import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  GraduationCap,
  Briefcase,
  MapPin,
  Globe,
  Zap,
  Target,
  Shield,
  ArrowRight,
  Quote,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  Building2,
  Linkedin,
  Twitter,
  Mail,
  Wrench,
  Brain,
  BarChart3,
  HeartHandshake,
  Rocket,
  Crown,
  ChevronRight,
  Phone,
  Cpu,
  BookOpen,
  DollarSign,
  MessageSquare,
} from "lucide-react";

const credentials = [
  {
    icon: GraduationCap,
    title: "Government Certificate of Competency",
    org: "South African Government",
    year: "2018",
    color: "from-emerald-500 to-teal-600",
    badge: "Engineering Excellence",
  },
  {
    icon: GraduationCap,
    title: "B-Tech Mechanical Engineering",
    org: "University of Technology",
    year: "2015–2018",
    color: "from-blue-500 to-indigo-600",
    badge: "Honours Graduate",
  },
  {
    icon: GraduationCap,
    title: "NDip Mechanical Engineering",
    org: "University of Technology",
    year: "2009–2012",
    color: "from-purple-500 to-violet-600",
    badge: "Foundation",
  },
  {
    icon: BookOpen,
    title: "Bachelor of Commerce (Business Management)",
    org: "Currently Completing",
    year: "2024–Present",
    color: "from-orange-500 to-amber-600",
    badge: "In Progress",
  },
];

const career = [
  {
    role: "Founder & CEO",
    company: "FreelanceSkills.net",
    period: "2024–Present",
    highlight: "Building Africa's #1 freelance platform — CIPC registered (2026/070509/09)",
    icon: Rocket,
    color: "bg-emerald-500",
  },
  {
    role: "Serial Entrepreneur",
    company: "Multiple Ventures",
    period: "2023–Present",
    highlight: "Built and successfully exited multiple businesses across industries",
    icon: TrendingUp,
    color: "bg-blue-500",
  },
  {
    role: "Senior Technician / Supervisor",
    company: "Eskom — South Africa",
    period: "2012–2023",
    highlight: "Led engineering teams, managed multi-million rand projects, WCM-TPM/RCM excellence",
    icon: Wrench,
    color: "bg-amber-500",
  },
];

const skills = [
  { label: "Large Project Management", icon: Target, level: 98 },
  { label: "Planning & Budgeting", icon: BarChart3, level: 95 },
  { label: "Strategic & Analytical Vision", icon: Brain, level: 97 },
  { label: "Maintenance Processes (WCM-TPM/RCM)", icon: Wrench, level: 99 },
  { label: "SAP Planned Maintenance", icon: Cpu, level: 90 },
  { label: "Contract Supervision", icon: Briefcase, level: 96 },
  { label: "Leadership & Coaching", icon: HeartHandshake, level: 98 },
  { label: "Business Development", icon: DollarSign, level: 94 },
];

const languages = [
  { lang: "English", level: "Native / Professional", flag: "🇿🇦" },
  { lang: "isiZulu", level: "Professional", flag: "🇿🇦" },
  { lang: "Sesotho", level: "Professional", flag: "🇿🇦" },
  { lang: "Afrikaans", level: "Receptive Bilingualism", flag: "🇿🇦" },
];

const openRoles = [
  { title: "Senior AI Engineer", type: "Remote", urgency: "🔥 Hot" },
  { title: "Growth Hacker / CMO", type: "Cape Town / Remote", urgency: "🚀 Now" },
  { title: "Full-Stack Engineer", type: "Remote", urgency: "🔥 Hot" },
  { title: "Head of Customer Success", type: "Cape Town", urgency: "⚡ New" },
  { title: "Community Manager (SA)", type: "Remote", urgency: "⚡ New" },
  { title: "Academy Curriculum Designer", type: "Remote", urgency: "🚀 Now" },
];

const trustSignals = [
  { label: "CIPC Registered", value: "2026/070509/09", icon: Shield },
  { label: "POPIA Compliant", value: "Full Compliance", icon: CheckCircle },
  { label: "100% SA-Owned", value: "South African", icon: Star },
  { label: "PayFast Verified", value: "Local Payments", icon: Award },
];

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[180px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium tracking-wide">
                  Founder & CEO — FreelanceSkills.net
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6">
                Built by an
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  engineer who
                </span>
                <br />
                lived the grind.
              </h1>

              <p className="text-slate-300 text-xl leading-relaxed mb-8 max-w-lg">
                11 years at Eskom. Multi-million rand projects. Midnight breakdowns. Then he walked away — and built the platform South Africa's freelancers were waiting for.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
                  onClick={() => setLocation("/register")}
                  data-testid="hero-join-btn"
                >
                  Join the Movement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 font-semibold px-8 py-4 text-lg rounded-xl transition-all"
                  onClick={() => document.getElementById("founder-story")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="hero-story-btn"
                >
                  Read the Story
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-800">
                {[
                  { v: "11", l: "Years Engineering" },
                  { v: "R100M+", l: "Projects Managed" },
                  { v: "#1", l: "SA Freelance Platform" },
                ].map((s) => (
                  <div key={s.l} className="text-center" data-testid={`hero-stat-${s.l.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="text-2xl sm:text-3xl font-black text-white">{s.v}</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Founder photo */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/30 via-transparent to-blue-500/20 blur-xl" />
                {/* Photo frame */}
                <div className="relative w-72 h-96 sm:w-80 sm:h-[440px] lg:w-96 lg:h-[520px] rounded-3xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-900/50">
                  {/* Professional gradient placeholder that clearly shows where Ben's photo goes */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center mb-4 shadow-xl">
                      <span className="text-5xl font-black text-white">B</span>
                    </div>
                    <div className="text-center px-6">
                      <p className="text-white font-bold text-lg">Msiza Bernet (Ben)</p>
                      <p className="text-emerald-400 text-sm font-medium mt-1">Founder & CEO</p>
                      <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                        📸 Photo: "Ben Office.png"<br />
                        (Upload to /client/public/images/ben-office.jpg)
                      </p>
                    </div>
                  </div>
                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <p className="text-white font-bold text-sm">Msiza Bernet (Ben)</p>
                    <p className="text-emerald-400 text-xs font-medium">Founder & CEO · Camps Bay, Cape Town</p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-6 bg-emerald-500 text-white rounded-2xl px-4 py-3 shadow-xl shadow-emerald-500/30">
                  <div className="text-xs font-medium opacity-80">CIPC Registered</div>
                  <div className="text-sm font-bold">2026/070509/09</div>
                </div>

                {/* Location badge */}
                <div className="absolute -top-4 -right-4 bg-slate-800 border border-slate-700 text-white rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-400">HQ</div>
                      <div className="text-xs font-bold">Camps Bay, CT</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER STORY ─────────────────────────────────────────────────── */}
      <section id="founder-story" className="py-24 lg:py-32 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 mb-4">
              The Founder Story
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              From Eskom Substation<br />
              <span className="text-emerald-600 dark:text-emerald-400">to Africa's Freelance Frontier</span>
            </h2>
          </div>

          {/* Pull quote */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl p-8 mb-12 border border-emerald-100 dark:border-emerald-800">
            <Quote className="absolute top-6 left-6 h-8 w-8 text-emerald-300 dark:text-emerald-700" />
            <blockquote className="text-xl sm:text-2xl font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed text-center px-8 italic">
              "I didn't build FreelanceSkills.net because it sounded good. I built it because South Africa needed it — and no one else was doing it right."
            </blockquote>
            <p className="text-center text-emerald-600 dark:text-emerald-400 font-semibold mt-4">— Msiza Bernet (Ben), Founder & CEO</p>
          </div>

          {/* Long-form story */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed" data-testid="founder-story-body">
            <p className="text-xl font-medium text-foreground">
              I spent 11 years at Eskom — not pushing paper, but getting my hands dirty.
            </p>

            <p>
              I started as a technician in 2012, walking power substations at 2am when the lights go out across a province. I understood what failure costs — in rand, in lives, in trust. I learned to lead under pressure. I managed large engineering teams. I ran multi-million rand maintenance projects with zero room for error. I implemented WCM-TPM and RCM programs that turned failing assets into profit centres. I coached junior engineers who are now leading their own teams.
            </p>

            <p>
              By the time I reached Senior Technician / Supervisor level, I had a Government Certificate of Competency (2018), a B-Tech in Mechanical Engineering (2015–2018), and over a decade of real-world systems thinking burned into my DNA.
            </p>

            <p>
              But I kept seeing the same thing — incredible South African talent going to waste. Plumbers earning R8,000 a month when they could earn R35,000. Developers building apps for free because they didn't know how to market themselves. Designers losing work to cheaper offshore alternatives because our platforms didn't support local payments. The gap was real. The frustration was real.
            </p>

            <p className="font-semibold text-foreground text-lg">
              In 2023, I made the call that changed everything.
            </p>

            <p>
              I resigned from Eskom. Not in frustration — in purpose. I knew exactly what I was going to build. First, I tested myself as an entrepreneur. I built multiple businesses from scratch, scaled them, and successfully exited. Each one taught me something the boardroom never could: that execution beats ideas, that speed beats perfection, and that South Africans are hungry for platforms that actually understand them.
            </p>

            <p>
              FreelanceSkills.net was born from that hunger. I designed it the same way I designed maintenance systems at Eskom — with ruthless practicality. Local payments via PayFast (no more losing work because you can't receive international transfers). AI-powered upskilling through our Academy (because skills are the new currency). Escrow protection that works in South Africa. A platform that speaks isiZulu, English, Afrikaans, and Sotho — because our talent speaks all of those.
            </p>

            <p>
              We're registered with CIPC. We're POPIA compliant. We operate from our offices in Camps Bay, Cape Town — overlooking the Atlantic, where the vision is as clear as the ocean view.
            </p>

            <p className="text-xl font-semibold text-foreground">
              We're not chasing Upwork. We're building what Upwork can't — a platform built by Africans, for Africans, that understands the real hustle.
            </p>

            <p>
              I'm completing my Bachelor of Commerce in Business Management because I believe leaders never stop learning. I'm still the guy who reads maintenance manuals for fun. The guy who runs root-cause analysis on business failures at midnight. The guy who won't stop until every South African freelancer has a fair shot at financial freedom.
            </p>

            <p className="text-lg font-medium text-foreground">
              That's the mission. That's why I'm here. And I'm not stopping until we're the #1 freelance platform on the continent.
            </p>
          </div>
        </div>
      </section>

      {/* ── CAREER TIMELINE ────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">Career Journey</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Every role was training for this.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-amber-500 hidden sm:block" />

            <div className="space-y-8 lg:space-y-12">
              {career.map((item, idx) => {
                const Icon = item.icon;
                const isLeft = idx % 2 === 0;
                return (
                  <div
                    key={item.role}
                    className={`relative flex items-start gap-8 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"} flex-col sm:flex-row`}
                    data-testid={`career-item-${idx}`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 top-6 hidden sm:flex">
                      <div className={`w-4 h-4 rounded-full ${item.color} border-4 border-background shadow-lg`} />
                    </div>

                    {/* Card */}
                    <div className={`${isLeft ? "lg:w-1/2 lg:pr-12" : "lg:w-1/2 lg:pl-12"} w-full sm:ml-16 lg:ml-0`}>
                      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`${item.color} p-3 rounded-xl shrink-0`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-black text-lg text-foreground">{item.role}</span>
                              <Badge variant="outline" className="text-xs">{item.period}</Badge>
                            </div>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2">{item.company}</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.highlight}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className={`hidden lg:block lg:w-1/2`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 mb-4">
              Academic Credentials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Built on a foundation of excellence
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred) => {
              const Icon = cred.icon;
              return (
                <div
                  key={cred.title}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  data-testid={`credential-${cred.year.replace(/[–\s]/g, "-")}`}
                >
                  <div className={`bg-gradient-to-br ${cred.color} p-3 rounded-xl w-fit mb-4 shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="mb-3 text-xs font-semibold bg-muted text-muted-foreground border-0">
                    {cred.badge}
                  </Badge>
                  <h3 className="font-bold text-foreground text-sm leading-snug mb-2">{cred.title}</h3>
                  <p className="text-muted-foreground text-xs">{cred.org}</p>
                  <div className="mt-3 text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{cred.year}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SKILLS & LANGUAGES ────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Skills */}
            <div>
              <div className="mb-10">
                <Badge className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 mb-4">
                  Core Skills
                </Badge>
                <h2 className="text-3xl font-black text-foreground">
                  Forged in the field.
                </h2>
                <p className="text-muted-foreground mt-3">
                  These aren't resume buzzwords. Every skill was earned under pressure.
                </p>
              </div>

              <div className="space-y-5">
                {skills.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <div key={skill.label} data-testid={`skill-${skill.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-foreground">{skill.label}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="mb-10">
                <Badge className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 mb-4">
                  Languages
                </Badge>
                <h2 className="text-3xl font-black text-foreground">
                  We speak South Africa.
                </h2>
                <p className="text-muted-foreground mt-3">
                  A platform built for all of us — in languages we actually speak.
                </p>
              </div>

              <div className="space-y-4 mb-12">
                {languages.map((lang) => (
                  <div
                    key={lang.lang}
                    className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                    data-testid={`language-${lang.lang.toLowerCase()}`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{lang.lang}</p>
                      <p className="text-muted-foreground text-sm">{lang.level}</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Achievement callout */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <Award className="h-8 w-8 mb-3 opacity-80" />
                <h3 className="font-black text-xl mb-2">Africa-First Design</h3>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Built from Cape Town for Johannesburg, Durban, Nairobi, Lagos, and every city where African talent is ready to rise. Local payments. Local language. Local pride.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE VISION ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 mb-6 text-sm">
            The Mission
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-8">
            Africa has the talent.<br />
            <span className="text-emerald-400">We give it the stage.</span>
          </h2>
          <p className="text-slate-300 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
            Every great economy is built on skilled people who can sell their skills freely. South Africa has 60 million people — millions of them are world-class. They just need a platform that fights for them.
          </p>
          <p className="text-slate-300 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
            FreelanceSkills.net is that platform. We built local payment rails so your earnings arrive the same day. We built an Academy so a mechanic in Soweto can become a six-figure digital consultant. We built AI matching so the best talent finds the best work — fast.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-14">
            {[
              {
                icon: Zap,
                title: "2031 Dominance",
                desc: "The #1 freelance platform in Africa by 2027. By 2031, one of the top three in the world.",
              },
              {
                icon: Users,
                title: "1 Million Freelancers",
                desc: "One million South Africans earning independently, on their own terms, by 2028.",
              },
              {
                icon: TrendingUp,
                title: "R10 Billion GMV",
                desc: "R10 billion in freelancer earnings processed through our platform within 5 years.",
              },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-left"
                  data-testid={`vision-card-${v.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="h-7 w-7 text-emerald-400 mb-3" />
                  <h3 className="font-black text-lg text-white mb-2">{v.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 mb-4">
              The Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
              Small team. Massive ambition.
            </h2>
            <p className="text-muted-foreground mt-4 text-xl max-w-2xl mx-auto">
              We're growing fast. Every person we hire believes Africa's freelance future starts here.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Ben — founder card */}
            <div
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 relative"
              data-testid="team-card-founder"
            >
              <div className="absolute top-4 right-4">
                <Crown className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-black text-white">B</span>
              </div>
              <h3 className="font-black text-xl text-foreground">Msiza Bernet (Ben)</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">Founder & CEO</p>
              <p className="text-muted-foreground text-xs mb-3">Camps Bay, Cape Town · South Africa</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                11 years Eskom engineering · Serial entrepreneur · Built FreelanceSkills.net from the ground up.
              </p>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" data-testid="ben-linkedin" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="mailto:ben@freelanceskills.net" data-testid="ben-email" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Placeholder slots */}
            {[
              { title: "Head of AI & Engineering", emoji: "🤖" },
              { title: "Head of Growth & Marketing", emoji: "🚀" },
              { title: "Head of Customer Success", emoji: "💎" },
              { title: "Academy Curriculum Lead", emoji: "🎓" },
            ].map((slot) => (
              <div
                key={slot.title}
                className="bg-card rounded-2xl p-6 border-2 border-dashed border-border hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group cursor-pointer"
                onClick={() => setLocation("/careers")}
                data-testid={`team-slot-${slot.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors">
                  <span className="text-3xl">{slot.emoji}</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">{slot.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">We're actively hiring world-class talent for this role.</p>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Apply Now <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Hiring CTA */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-12 text-center">
            <Rocket className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Join the Movement
            </h3>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              We're building the future of African work. We need builders, dreamers, and executors who are done watching others win. If you're world-class — we want you.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {openRoles.map((r) => (
                <span
                  key={r.title}
                  className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium rounded-full px-4 py-2 border border-white/20"
                  data-testid={`open-role-${r.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-xs">{r.urgency}</span>
                  {r.title}
                  <span className="text-emerald-400 text-xs opacity-70">{r.type}</span>
                </span>
              ))}
            </div>
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              onClick={() => setLocation("/register")}
              data-testid="careers-apply-btn"
            >
              See All Open Roles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── OFFICE LOCATION ───────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 mb-6">
                Our Home
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6">
                Where Africa's best<br />
                <span className="text-emerald-600 dark:text-emerald-400">ideas come to life.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Our headquarters sit in Camps Bay, Cape Town — modern, high-end offices with Atlantic Ocean views. The kind of environment that makes you think bigger. This is where FreelanceSkills.net gets built, every day.
              </p>

              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Address", value: "Camps Bay, Cape Town, Western Cape, South Africa" },
                  { icon: Phone, label: "Contact", value: "hello@freelanceskills.net" },
                  { icon: Globe, label: "Platform", value: "freelanceskills.net" },
                  { icon: Building2, label: "CIPC Registration", value: "2026/070509/09" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3" data-testid={`office-${item.label.toLowerCase()}`}>
                      <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-lg shrink-0">
                        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold text-foreground">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Office visual */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 shadow-2xl border border-slate-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-4">🌊</div>
                  <p className="text-2xl font-black mb-2">Camps Bay</p>
                  <p className="text-slate-300 text-sm">Atlantic Ocean Views</p>
                  <p className="text-slate-400 text-xs mt-2">Cape Town, South Africa</p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="absolute -top-4 -right-4 bg-emerald-500 rounded-2xl px-5 py-3 text-white shadow-xl shadow-emerald-500/30">
                <div className="text-xs font-medium opacity-80">Ocean Views</div>
                <div className="text-sm font-bold">Camps Bay HQ</div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-5 py-3 shadow-xl">
                <div className="text-xs text-muted-foreground">100%</div>
                <div className="text-sm font-bold text-foreground">SA-Owned &amp; Operated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Built on trust. Designed for South Africa.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              Every decision we make is guided by one question: does this make South African freelancers and clients safer, faster, and richer?
            </p>
          </div>

          {/* Trust badges row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {trustSignals.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="bg-card rounded-2xl p-6 border border-border text-center hover:border-emerald-500/40 transition-colors"
                  data-testid={`trust-${t.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="bg-emerald-100 dark:bg-emerald-950 p-3 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-black text-foreground mb-1">{t.label}</p>
                  <p className="text-muted-foreground text-sm">{t.value}</p>
                </div>
              );
            })}
          </div>

          {/* Testimonial */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: "Finally a platform that accepts PayFast. I got paid for my first job within 24 hours. Game changer.",
                name: "Thabo M.",
                role: "Web Developer, Johannesburg",
                emoji: "🧑🏾‍💻",
              },
              {
                quote: "The Academy helped me go from R12,000/month to R47,000/month in 6 months. This platform is different.",
                name: "Lerato K.",
                role: "Digital Marketer, Pretoria",
                emoji: "👩🏾‍💼",
              },
              {
                quote: "Ben built this for us. You can feel it in every feature. Finally someone who understands the SA hustle.",
                name: "Craig V.",
                role: "Graphic Designer, Cape Town",
                emoji: "🎨",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-6 border border-border"
                data-testid={`testimonial-${i}`}
              >
                <Quote className="h-6 w-6 text-emerald-500 mb-3 opacity-60" />
                <p className="text-foreground text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="font-bold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HeartHandshake className="h-14 w-14 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
            The real deal starts here.
          </h2>
          <p className="text-emerald-100 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Join 8,000+ South Africans who chose a platform built by someone who lived their story. Your income. Your terms. Your time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-black px-10 py-5 text-lg rounded-xl shadow-xl transition-all hover:scale-105"
              onClick={() => setLocation("/register")}
              data-testid="final-cta-freelancer"
            >
              Start Freelancing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 font-bold px-10 py-5 text-lg rounded-xl"
              onClick={() => setLocation("/post-job")}
              data-testid="final-cta-client"
            >
              Post a Job — Free
            </Button>
          </div>
          <p className="text-emerald-200 text-sm mt-6">
            No credit card. No commitment. 100% South African. 🇿🇦
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

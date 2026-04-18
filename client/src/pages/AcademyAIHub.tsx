import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AI_COURSES, AI_ACADEMY_LAUNCH_PRIORITY, ACADEMY_EVOLUTION_ROADMAP } from "@/lib/aiAcademyCurriculum";
import type { Course } from "@/lib/academyCurriculum";
import {
  Brain, Zap, Target, TrendingUp, Award, Globe, ChevronRight,
  Filter, Search, Star, Clock, Users, DollarSign, Rocket, Shield,
  ArrowRight, BarChart3, Sparkles, Play, Lock, CheckCircle2,
  BookOpen, Code2, Eye, Mic, Server, AlertTriangle, Heart,
  Building2, Cpu, Leaf, ShoppingCart, FlaskConical, Music,
  Gamepad2, GraduationCap, Activity, Truck, Factory
} from "lucide-react";

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All 35 Courses", icon: Brain },
  { id: "AI & Machine Learning", label: "AI & ML Core", icon: Brain },
  { id: "agent", label: "Agents & Automation", icon: Zap },
  { id: "vision", label: "Vision & Video", icon: Eye },
  { id: "voice", label: "Voice & Audio", icon: Mic },
  { id: "infra", label: "Infrastructure", icon: Server },
  { id: "safety", label: "Safety & Ethics", icon: Shield },
  { id: "vertical", label: "Industry AI", icon: Building2 },
  { id: "africa", label: "Africa AI", icon: Globe },
];

const SORT_OPTIONS = [
  { id: "revenue", label: "Revenue Potential" },
  { id: "popularity", label: "Most Popular" },
  { id: "difficulty-asc", label: "Beginner First" },
  { id: "difficulty-desc", label: "Advanced First" },
  { id: "free", label: "Free First" },
];

const DIFFICULTY_COLORS = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const DIFFICULTY_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 };

// ── SA vs Global stats ─────────────────────────────────────────────────────────
const SA_STATS = [
  { label: "SA Bootcamp Grads Unemployed", value: "68%", detail: "after 6 months" },
  { label: "AI Freelancers with SA Skills", value: "< 2%", detail: "of global market" },
  { label: "Avg AI Freelance Rate", value: "$200/hr", detail: "R3,800/hr USD remote" },
  { label: "AI Job Demand Growth", value: "+312%", detail: "Global market 2026 data" },
];

const AI_DEMAND_TRENDS = [
  { skill: "AI Agent Development", growth: 312, rate: "$150–$400/hr" },
  { skill: "AI Video Production", growth: 329, rate: "$80–$250/hr" },
  { skill: "AI Integration", growth: 178, rate: "$120–$350/hr" },
  { skill: "AI Data Annotation", growth: 154, rate: "$40–$120/hr" },
  { skill: "MLOps", growth: 198, rate: "$150–$400/hr" },
  { skill: "LLM Fine-Tuning", growth: 245, rate: "$200–$500/hr" },
];

// ── CourseCard ─────────────────────────────────────────────────────────────────
function AIcourseCard({ course, rank }: { course: Course; rank?: number }) {
  const launchInfo = AI_ACADEMY_LAUNCH_PRIORITY.find(p => p.courseId === course.id);

  return (
    <Link href={`/academy/${course.id}`}>
      <div
        data-testid={`ai-course-card-${course.id}`}
        className="group relative bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1"
      >
        {/* Launch priority badge */}
        {launchInfo && (
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
            🚀 Launch Priority #{launchInfo.rank}
          </div>
        )}

        {/* Free badge */}
        {course.isFree && (
          <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Emoji / icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {course.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight group-hover:text-emerald-400 transition-colors mb-1">
              {course.title}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">{course.tagline}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs border px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[course.difficulty]}`}>
                {course.difficulty}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {course.duration}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> {course.enrolled.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-amber-400 font-medium">{course.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                {course.earningsLift} earnings
              </div>
            </div>
          </div>
        </div>

        {/* Skills strip */}
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-800">
          {course.skills.slice(0, 4).map(skill => (
            <span key={skill} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
          {course.skills.length > 4 && (
            <span className="text-[10px] text-slate-500">+{course.skills.length - 4} more</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AcademyAIHub() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("revenue");
  const [difficulty, setDifficulty] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    let courses = [...AI_COURSES];

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      if (category === "agent") courses = courses.filter(c => c.skills.some(s => s.toLowerCase().includes("agent") || s.toLowerCase().includes("automation") || s.toLowerCase().includes("n8n")));
      else if (category === "vision") courses = courses.filter(c => c.skills.some(s => s.toLowerCase().includes("vision") || s.toLowerCase().includes("video") || s.toLowerCase().includes("yolo")));
      else if (category === "voice") courses = courses.filter(c => c.skills.some(s => s.toLowerCase().includes("voice") || s.toLowerCase().includes("audio") || s.toLowerCase().includes("whisper")));
      else if (category === "infra") courses = courses.filter(c => c.skills.some(s => s.toLowerCase().includes("mlops") || s.toLowerCase().includes("docker") || s.toLowerCase().includes("devops")));
      else if (category === "safety") courses = courses.filter(c => c.skills.some(s => s.toLowerCase().includes("safety") || s.toLowerCase().includes("ethics") || s.toLowerCase().includes("compliance")));
      else if (category === "vertical") courses = courses.filter(c => ["legal", "health", "finance", "hr", "supply", "game"].some(v => c.slug.includes(v)));
      else if (category === "africa") courses = courses.filter(c => c.slug.includes("africa") || c.skills.some(s => s.toLowerCase().includes("africa") || s.toLowerCase().includes("whatsapp")));
      else courses = courses.filter(c => c.category === category);
    }

    if (difficulty !== "all") {
      courses = courses.filter(c => c.difficulty === difficulty);
    }

    if (freeOnly) {
      courses = courses.filter(c => c.isFree);
    }

    switch (sort) {
      case "revenue":
        courses = courses.sort((a, b) => {
          const aRank = AI_ACADEMY_LAUNCH_PRIORITY.find(p => p.courseId === a.id)?.rank ?? 99;
          const bRank = AI_ACADEMY_LAUNCH_PRIORITY.find(p => p.courseId === b.id)?.rank ?? 99;
          return aRank - bRank;
        });
        break;
      case "popularity":
        courses = courses.sort((a, b) => b.enrolled - a.enrolled);
        break;
      case "difficulty-asc":
        courses = courses.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
        break;
      case "difficulty-desc":
        courses = courses.sort((a, b) => DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty]);
        break;
      case "free":
        courses = courses.sort((a, b) => Number(b.isFree) - Number(a.isFree));
        break;
    }

    return courses;
  }, [search, category, sort, difficulty, freeOnly]);

  const freeCourses = AI_COURSES.filter(c => c.isFree);
  const totalEnrolled = AI_COURSES.reduce((sum, c) => sum + c.enrolled, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">2026–2036 AI Skills | 35 New Courses</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              AI Skills Academy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Knowledge Hub
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              35 emerging AI skills ranked by 2026 freelance revenue potential. From zero to{" "}
              <span className="text-emerald-400 font-bold">R10k–R100k+/month</span> in USD remote gigs.
              Every course includes verifiable certificate + auto-badge + priority job matching.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/academy/57">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start Free AI Course
                </button>
              </Link>
              <a href="#courses">
                <button className="border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Browse All 35 Courses
                </button>
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New AI Courses", value: "35", icon: Brain, color: "emerald" },
              { label: "Total Enrolled", value: totalEnrolled.toLocaleString() + "+", icon: Users, color: "blue" },
              { label: "Free Courses", value: freeCourses.length.toString(), icon: Sparkles, color: "amber" },
              { label: "Avg Earnings Lift", value: "+163%", icon: TrendingUp, color: "violet" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2026 AI Demand Trends ── */}
      <div className="bg-slate-900 border-y border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            📊 2026 Global AI Demand Data — Why These Skills Pay
          </h2>
          <p className="text-slate-400 text-center mb-8">Real market data driving course selection and ranking</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AI_DEMAND_TRENDS.map(trend => (
              <div key={trend.skill} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{trend.skill}</h3>
                  <span className="text-emerald-400 font-black text-sm">+{trend.growth}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, trend.growth / 3.3)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{trend.rate} remote rate</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SA vs Global Gap ── */}
      <div className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">The SA Skills Gap — Why This Academy Exists</h2>
                <p className="text-slate-400 text-sm">SA produces 150,000+ tech graduates/year. Most compete for the same local jobs.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SA_STATS.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-300 font-medium">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Launch Priority Top 8 ── */}
      <div className="py-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-2">🚀 Top 8 Launch-Priority Courses</h2>
          <p className="text-slate-400 mb-8">Ranked by 30-day revenue potential for new graduates</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-800">
                  <th className="text-xs text-slate-500 pb-3 pr-4">#</th>
                  <th className="text-xs text-slate-500 pb-3 pr-4">Course</th>
                  <th className="text-xs text-slate-500 pb-3 pr-4">30-Day Revenue</th>
                  <th className="text-xs text-slate-500 pb-3">Why Now</th>
                </tr>
              </thead>
              <tbody>
                {AI_ACADEMY_LAUNCH_PRIORITY.map(item => {
                  const course = AI_COURSES.find(c => c.id === item.courseId);
                  return (
                    <tr key={item.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Link href={`/academy/${item.courseId}`}>
                          <div className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                            <span className="text-xl">{course?.emoji}</span>
                            <span className="text-sm font-medium text-white">{item.title}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-emerald-400 font-bold text-sm">{item.projectedMonthly}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-400 text-xs">{item.reason}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Course Catalogue ── */}
      <div id="courses" className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">All 35 AI Courses</h2>
              <p className="text-slate-400 text-sm">2026–2036 emerging AI skills. Each earns R10k–R100k+/month.</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                data-testid="input-course-search"
                type="text"
                placeholder="Search courses, skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64 bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  data-testid={`filter-category-${cat.id}`}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    category === cat.id
                      ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-700 hidden md:block mx-1" />

            {/* Difficulty */}
            {["all", "Beginner", "Intermediate", "Advanced"].map(d => (
              <button
                key={d}
                data-testid={`filter-difficulty-${d}`}
                onClick={() => setDifficulty(d)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  difficulty === d
                    ? "bg-slate-700 border-slate-500 text-white"
                    : "border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                {d === "all" ? "All Levels" : d}
              </button>
            ))}

            {/* Free toggle */}
            <button
              data-testid="filter-free-only"
              onClick={() => setFreeOnly(!freeOnly)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                freeOnly
                  ? "bg-amber-500/20 border-amber-500 text-amber-400"
                  : "border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Free Only
            </button>

            {/* Sort */}
            <select
              data-testid="select-sort-courses"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 text-slate-400 rounded-full px-3 py-1.5 focus:outline-none focus:border-emerald-500 ml-auto"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-slate-500 text-sm mb-6">
            Showing {filtered.length} of {AI_COURSES.length} courses
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course, i) => (
              <AIcourseCard key={course.id} course={course} rank={i + 1} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No courses match your filters.</p>
              <button onClick={() => { setSearch(""); setCategory("all"); setDifficulty("all"); setFreeOnly(false); }}
                className="text-emerald-400 text-sm mt-2 hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate System ── */}
      <div className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">🏆 Verifiable AI Certificates</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every certificate is cryptographically signed with SHA-256, permanently linked to your profile,
              and verifiable by any employer worldwide via a unique URL.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Blockchain-Verified",
                desc: "SHA-256 hash anchored on certificate issuance. Tamper-proof and permanently verifiable.",
                color: "emerald",
              },
              {
                icon: Award,
                title: "Auto-Badge on Profile",
                desc: "Pass the skills test → certificate issued → badge appears on your FreelanceSkills profile instantly.",
                color: "amber",
              },
              {
                icon: Target,
                title: "Priority Job Matching",
                desc: "Certified skills unlock priority matching to AI jobs in the remote job feed — your profile rises to top.",
                color: "blue",
              },
            ].map(item => (
              <div key={item.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/cert/verify/demo">
              <button className="border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto">
                <CheckCircle2 className="w-4 h-4" />
                See Certificate Verification Demo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 10-Year Evolution Roadmap ── */}
      <div className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-3">📅 10-Year AI Academy Evolution Roadmap</h2>
          <p className="text-slate-400 mb-8 max-w-2xl">
            The academy self-updates. As our Remote AI Jobs feed detects new demand signals, new courses are
            automatically prioritised. You'll always be ahead of the market.
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />

            <div className="space-y-6">
              {ACADEMY_EVOLUTION_ROADMAP.map((item, i) => (
                <div key={item.year} className="relative flex gap-6 pl-16">
                  {/* Year node */}
                  <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                    item.year <= 2027 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : item.year <= 2030 ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    {item.year}
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex-1">
                    <p className="text-xs text-slate-500 mb-1">Trigger: {item.trigger}</p>
                    <p className="text-sm text-slate-300 font-medium">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-16 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-y border-emerald-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Start Your AI Career Today
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            2 free courses. 35 premium courses. Every one earns you a verifiable certificate.
            Your first client could pay for the entire academy in one day.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/academy/1">
              <button data-testid="button-start-ai-academy" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-xl text-lg transition-colors flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Start Free — AI Prompt Course
              </button>
            </Link>
            <Link href="/academy/31">
              <button className="border border-slate-600 hover:border-emerald-500/50 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Agent Development
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

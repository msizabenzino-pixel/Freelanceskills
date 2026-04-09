import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { COURSES, getTotalLessons } from "@/lib/academyCurriculum";
import {
  BookOpen, Clock, TrendingUp, Star, Users, Search,
  ChevronRight, Award, CheckCircle2, Zap, Play, Trophy,
  Sparkles, Target
} from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "AI & Machine Learning",
  "Web Development",
  "Graphic Design",
  "Digital Marketing",
  "Copywriting",
  "Data Analytics",
  "Video & Animation",
  "Business Development",
];

const DIFFICULTIES = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const CATEGORY_ICONS: Record<string, string> = {
  "AI & Machine Learning": "🤖",
  "Web Development": "💻",
  "Graphic Design": "🎨",
  "Digital Marketing": "📢",
  "Copywriting": "✍️",
  "Data Analytics": "📊",
  "Video & Animation": "🎬",
  "Business Development": "💼",
};

function DifficultyBadge({ level }: { level: string }) {
  const colors = {
    Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  }[level] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors}`}>
      {level}
    </span>
  );
}

function CourseCard({ course, onClick }: { course: (typeof COURSES)[0]; onClick: () => void }) {
  const totalLessons = getTotalLessons(course);

  return (
    <button
      onClick={onClick}
      data-testid={`course-card-${course.id}`}
      className="group text-left bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col"
    >
      {/* Course Header Gradient */}
      <div className={`h-36 bg-gradient-to-br ${course.color} relative flex items-center justify-center overflow-hidden`}>
        <span className="text-6xl z-10">{course.emoji}</span>
        <div className="absolute inset-0 bg-black/20" />
        {/* Free badge */}
        {course.isFree && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </div>
        )}
        {/* Category label */}
        <div className="absolute bottom-3 left-3 text-xs text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded-full">
          {CATEGORY_ICONS[course.category]} {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <DifficultyBadge level={course.difficulty} />
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {course.tagline}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            {course.earningsLift} earnings
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {course.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
          {course.skills.length > 3 && (
            <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
              +{course.skills.length - 3} more
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              {course.enrolled.toLocaleString()} enrolled
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
              Start Learning
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-slate-900/60 border border-slate-700/40 rounded-2xl">
      <div className="text-emerald-400 mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function Academy() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [difficulty, setDifficulty] = useState("All Levels");
  const [freeOnly, setFreeOnly] = useState(false);

  const { data: apiStats } = useQuery<{
    totalCourses: number;
    freeCourses: number;
    totalEnrolments: number;
    totalLessons: number;
    avgRating: string;
    avgCompletionRate: string;
  }>({
    queryKey: ["/api/academy/stats"],
    staleTime: 1000 * 60 * 5,
  });

  const featuredCourses = COURSES.filter((c) => [1, 3, 8].includes(c.id));

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        category === "All Categories" || c.category === category;
      const matchesDifficulty =
        difficulty === "All Levels" || c.difficulty === difficulty;
      const matchesFree = !freeOnly || c.isFree;
      return matchesSearch && matchesCategory && matchesDifficulty && matchesFree;
    });
  }, [search, category, difficulty, freeOnly]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            30 Expert-Crafted Courses · 15 Languages · Updated 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.05]">
            Level Up Your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Freelance Career
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            World-class courses built for African freelancers. Track your milestones,
            earn verified certificates, and command premium rates.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, skills, or topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-course-search"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-base"
            />
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["AI & Machine Learning", "Web Development", "Business Development", "Graphic Design", "Data Analytics"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? "All Categories" : cat)}
                data-testid={`pill-${cat}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 mb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="w-7 h-7" />} value={apiStats ? `${apiStats.totalCourses}` : "30"} label="Expert Courses" />
        <StatCard icon={<Users className="w-7 h-7" />} value={apiStats ? `${Math.round(apiStats.totalEnrolments / 1000)}K+` : "112K+"} label="Enrolled Learners" />
        <StatCard icon={<Award className="w-7 h-7" />} value={apiStats ? `${apiStats.avgCompletionRate}%` : "94.8%"} label="Completion Rate" />
        <StatCard icon={<TrendingUp className="w-7 h-7" />} value="15 🌍" label="Languages" />
      </section>

      {/* ── FEATURED COURSES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <h2 className="text-2xl font-bold text-white">Featured Courses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((c) => (
            <CourseCard key={c.id} course={c} onClick={() => navigate(`/academy/${c.id}`)} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16 px-4 mb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            How the Academy Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Play className="w-8 h-8" />, step: "01", title: "Enrol Free", desc: "Choose a course and enrol instantly. No credit card needed for free courses." },
              { icon: <Target className="w-8 h-8" />, step: "02", title: "Track Milestones", desc: "Complete lessons to unlock milestone badges at the end of each module." },
              { icon: <CheckCircle2 className="w-8 h-8" />, step: "03", title: "Pass Quizzes", desc: "Prove your knowledge with interactive quizzes embedded in each module." },
              { icon: <Award className="w-8 h-8" />, step: "04", title: "Earn Certificate", desc: "100% completion unlocks a blockchain-verified, downloadable certificate." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-4">
                  {item.icon}
                </div>
                <div className="text-xs text-emerald-500 font-bold mb-1">{item.step}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL COURSES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">All Courses</h2>
            <p className="text-slate-400 text-sm mt-1">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Free only toggle */}
            <button
              onClick={() => setFreeOnly(!freeOnly)}
              data-testid="toggle-free-only"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                freeOnly
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                  : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              Free Only
            </button>

            {/* Difficulty */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              data-testid="select-difficulty"
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="select-category"
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-400 mb-2">No courses found</p>
            <p className="text-slate-500">Try different search terms or filters</p>
            <button
              onClick={() => { setSearch(""); setCategory("All Categories"); setDifficulty("All Levels"); setFreeOnly(false); }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} onClick={() => navigate(`/academy/${c.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-7xl lg:mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <Trophy className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">
            Every Course Includes a Blockchain Certificate
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Your certificate is verified, shareable on LinkedIn, and stored on the blockchain.
            Clients trust credentials they can verify independently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/academy/1")}
              data-testid="button-start-free"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-lg"
            >
              Start Free Course →
            </button>
            <button
              onClick={() => navigate("/browse")}
              className="px-8 py-4 bg-emerald-800/50 border border-white/20 text-white font-bold rounded-xl hover:bg-emerald-800/80 transition-colors text-lg"
            >
              Find Freelance Work
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

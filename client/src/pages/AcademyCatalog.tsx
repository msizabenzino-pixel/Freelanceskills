import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ALL_COURSES, getTotalLessons } from "@/lib/academyCurriculum";
import {
  BookOpen, Star, Users, Clock, TrendingUp, Search,
  Filter, Sparkles, Award, Brain
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

const DIFF_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function AcademyCatalog() {
  const [category, setCategory] = useState("All Categories");
  const [difficulty, setDifficulty] = useState("All Levels");
  const [searchTerm, setSearchTerm] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    return ALL_COURSES.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = category === "All Categories" || c.category === category;
      const matchesDiff = difficulty === "All Levels" || c.difficulty === difficulty;
      const matchesFree = !freeOnly || c.isFree;
      return matchesSearch && matchesCat && matchesDiff && matchesFree;
    });
  }, [searchTerm, category, difficulty, freeOnly]);

  const freeCourses = ALL_COURSES.filter((c) => c.isFree).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            65 Expert-Crafted Courses · 15 Languages
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Academy Course Catalogue</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            65 production-ready courses across AI, Web Dev, Design, Copywriting, Data Science, and more.
            Learn from real freelance projects. Get certified. Earn more.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: BookOpen, value: "65", label: "Total Courses" },
              { icon: Sparkles, value: `${freeCourses}`, label: "Free Courses" },
              { icon: Award, value: "100%", label: "Cert Included" },
              { icon: Brain, value: "15 🌍", label: "Languages" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <s.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search courses, skills, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-course-search"
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="select-category"
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              data-testid="select-difficulty"
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-emerald-500"
            >
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>

            <button
              onClick={() => setFreeOnly(!freeOnly)}
              data-testid="filter-free-only"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                freeOnly
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Free Only
            </button>

            <span className="text-slate-500 text-sm ml-auto">
              {filtered.length} of {ALL_COURSES.length} courses
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-semibold mb-2">No courses match your filters</p>
            <button
              onClick={() => { setSearchTerm(""); setCategory("All Categories"); setDifficulty("All Levels"); setFreeOnly(false); }}
              className="text-emerald-400 text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course) => {
              const totalLessons = getTotalLessons(course);
              return (
                <Link key={course.id} href={`/academy/${course.id}`}>
                  <div
                    data-testid={`course-card-${course.id}`}
                    className="group block bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer h-full"
                  >
                    {/* Gradient header */}
                    <div className={`h-28 bg-gradient-to-br ${course.color} relative flex items-center justify-center overflow-hidden`}>
                      <span className="text-5xl z-10 select-none">{course.emoji}</span>
                      <div className="absolute inset-0 bg-black/20" />
                      {course.isFree && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                          FREE
                        </div>
                      )}
                      <div className="absolute bottom-2 left-3 text-[10px] text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded-full">
                        {course.category}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 flex-1">
                          {course.title}
                        </h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFF_COLORS[course.difficulty] ?? ""}`}>
                          {course.difficulty}
                        </span>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{course.tagline}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.enrolled.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {course.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                          <TrendingUp className="w-3 h-3" /> {course.earningsLift} earnings
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold group-hover:text-emerald-300">
                          Start Learning →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

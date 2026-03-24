import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Star, Users, Clock, TrendingUp, Filter, Search } from "lucide-react";
import { Link } from "wouter";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  totalLessons: number;
  averageRating: number;
  enrolmentCount: number;
  earningsLiftPct: number;
  isFree: boolean;
  isFeatured: boolean;
}

export default function AcademyCatalog() {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: courses = [] } = useQuery({
    queryKey: ["courses", category, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (difficulty) params.append("difficulty", difficulty);
      const res = await fetch(`/api/academy/courses?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const filtered = courses.filter((c: Course) => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">AI Upskilling Academy</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            22+ production-ready courses. Master AI, Web Dev, Design, Copywriting, Data Science, Blockchain.
            Learn from real freelance projects. Get certified. Earn 3x more.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              data-testid="input-course-search"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              data-testid="select-category"
            >
              <option value="">All Categories</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Copywriting">Copywriting</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Video & Animation">Video & Animation</option>
              <option value="Business Development">Business Development</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              data-testid="select-difficulty"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: Course) => (
            <Link key={course.id} href={`/academy/${course.id}`}>
              <a className="group block bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500 transition-all data-testid={`course-card-${course.id}`}">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{course.category}</p>
                  </div>
                  {course.isFeatured && <span className="text-yellow-400 text-xs font-bold">★ Featured</span>}
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{course.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> {course.totalLessons} lessons
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-3.5 h-3.5" /> {course.enrolmentCount} enrolled
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.averageRating.toFixed(1)}
                  </div>
                </div>

                {/* Difficulty & Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.difficulty === "beginner" ? "bg-blue-600/20 text-blue-400" :
                    course.difficulty === "intermediate" ? "bg-amber-600/20 text-amber-400" :
                    "bg-red-600/20 text-red-400"
                  }`}>
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </span>
                  {course.isFree ? (
                    <span className="text-xs font-bold text-emerald-400">FREE</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">R49/mo</span>
                  )}
                </div>

                {/* Earnings Lift */}
                <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +{course.earningsLiftPct}% earnings after cert
                </div>
              </a>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No courses found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

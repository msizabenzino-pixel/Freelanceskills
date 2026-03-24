import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { BookOpen, Play, CheckCircle, Lock, ArrowRight, Award, Star, Users, TrendingUp, Download } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content: string;
  type: "video" | "text" | "quiz";
  videoUrl?: string;
}

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
  lessons?: Lesson[];
}

export default function AcademyCourseDetail() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/academy/courses/${courseId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json() as Promise<Course>;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      if (!enrolled) return null;
      const res = await fetch(`/api/academy/progress/${courseId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: enrolled,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/academy/enrol/${courseId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to enrol");
      return res.json();
    },
    onSuccess: () => {
      setEnrolled(true);
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      const res = await fetch(`/api/academy/complete-lesson/${lessonId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to complete lesson");
      return res.json();
    },
  });

  const getCertificateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/academy/certificate/${courseId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get certificate");
      return res.json();
    },
  });

  if (!course) return <div className="text-center py-12">Loading...</div>;

  const currentLesson = course.lessons?.find(l => l.id === currentLessonId) || course.lessons?.[0];
  const completedCount = progress?.lessonProgress?.filter((p: any) => p.completed).length || 0;
  const progressPct = Math.round((completedCount / course.totalLessons) * 100);
  const isComplete = progressPct === 100;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                    <p className="text-gray-400 mt-2">{course.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-4 h-4" /> {course.totalLessons} lessons
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" /> {course.averageRating.toFixed(1)} ({course.enrolmentCount} enrolled)
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" /> +{course.earningsLiftPct}% earnings after
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              {enrolled && currentLesson ? (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">{currentLesson.title}</h2>

                  {currentLesson.type === "video" && (
                    <div className="bg-gray-800 rounded-lg p-8 mb-6 flex items-center justify-center h-96">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <p className="text-gray-400">Video: {currentLesson.videoUrl || "(Video content would be embedded here)"}</p>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-gray-300 whitespace-pre-wrap">{currentLesson.content}</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => completeLessonMutation.mutate(currentLesson.id)}
                      disabled={completeLessonMutation.isPending}
                      data-testid="button-complete-lesson"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {completeLessonMutation.isPending ? "Completing..." : "Mark Complete"}
                    </button>
                  </div>
                </div>
              ) : !enrolled ? (
                <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-emerald-600/30 rounded-2xl p-12 text-center mb-8">
                  <p className="text-lg text-white mb-4">Ready to start learning?</p>
                  <button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    data-testid="button-enrol-course"
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg font-bold transition-colors text-lg">
                    {enrollMutation.isPending ? "Enrolling..." : "Enrol Free"}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Progress */}
              {enrolled && (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6 sticky top-4">
                  <h3 className="font-bold text-white mb-4">Your Progress</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{completedCount}/{course.totalLessons}</span>
                      <span className="font-bold text-emerald-400">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {isComplete && (
                    <button
                      onClick={() => getCertificateMutation.mutate()}
                      disabled={getCertificateMutation.isPending}
                      data-testid="button-get-certificate"
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:bg-gray-700 text-white rounded-lg font-bold text-sm transition-all mb-4 flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" /> Get Certificate
                    </button>
                  )}
                </div>
              )}

              {/* Lessons List */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">{course.totalLessons} Lessons</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {course.lessons?.map((lesson, idx) => {
                    const isCompleted = progress?.lessonProgress?.find((p: any) => p.lesson_id === lesson.id)?.completed;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => enrolled && setCurrentLessonId(lesson.id)}
                        disabled={!enrolled}
                        data-testid={`lesson-${idx + 1}`}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          currentLessonId === lesson.id
                            ? "bg-emerald-600/20 border-emerald-500"
                            : enrolled
                            ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                        }`}>
                        <div className="flex items-start gap-3">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          ) : !enrolled ? (
                            <Lock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-1">{lesson.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{lesson.type}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}

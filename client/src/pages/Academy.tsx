import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Award,
  ArrowRight,
  PlayCircle,
  FileText,
  Lock,
  ChevronRight,
  Trophy
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content: string;
  orderIndex: number;
  type: "video" | "text" | "quiz";
  completed: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  totalLessons: number;
  progress: number;
}

export default function Academy() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: selectedCourse, isLoading: loadingCourse } = useQuery<{
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
  }>({
    queryKey: [`/api/courses/${selectedCourseId}`],
    enabled: !!selectedCourseId,
  });

  const { data: certificates } = useQuery<any[]>({
    queryKey: ["/api/certificates/my"],
  });

  const completeLessonMutation = useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: number; lessonId: number }) => {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete lesson");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Lesson completed!", description: "Keep up the great work!" });
    },
  });

  const claimCertificateMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await fetch(`/api/courses/${courseId}/certificate`);
      if (!res.ok) throw new Error("Failed to claim certificate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates/my"] });
      toast({ title: "Certificate earned!", description: "Congratulations! Your certificate is now available." });
    },
  });

  const currentLesson = selectedCourse?.lessons.find(l => l.id === selectedLessonId);
  const isCourseCompleted = selectedCourse?.lessons.every(l => l.completed);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {!selectedCourseId ? (
            <>
              <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-primary mb-4" data-testid="text-academy-title">Academy</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Master the skills you need to succeed in the modern freelance economy.
                </p>
              </div>

              {certificates && certificates.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="text-accent" /> Your Certificates
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="border-accent/20 bg-accent/5">
                        <CardContent className="p-6 text-center">
                          <Award className="w-12 h-12 text-accent mx-auto mb-4" />
                          <h3 className="font-bold text-lg mb-1">{cert.courseTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-4">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                          <Badge variant="outline" className="font-mono text-[10px]">{cert.certificateCode}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses?.map((course) => (
                    <Card key={course.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" /> {course.totalLessons} lessons
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-accent" /> {course.duration}
                          </div>
                        </div>
                        {course.progress > 0 && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-1.5" />
                          </div>
                        )}
                      </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => setSelectedCourseId(course.id)}
                          data-testid={`button-start-course-${course.id}`}
                        >
                          {course.progress === 100 ? "Review Course" : course.progress > 0 ? "Continue Learning" : "Start Course"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar: Lesson List */}
              <div className="lg:col-span-1 space-y-6">
                <Button variant="ghost" className="mb-2" onClick={() => { setSelectedCourseId(null); setSelectedLessonId(null); }}>
                  ← Back to Courses
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedCourse?.title}</CardTitle>
                    {selectedCourse && (
                      <div className="space-y-2 mt-4">
                         <Progress value={Math.round((selectedCourse.lessons.filter(l => l.completed).length / selectedCourse.lessons.length) * 100)} className="h-2" />
                         <p className="text-xs text-muted-foreground text-center">
                           {selectedCourse.lessons.filter(l => l.completed).length} of {selectedCourse.lessons.length} lessons completed
                         </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y border-t">
                      {selectedCourse?.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`w-full p-4 text-left flex items-start gap-3 hover:bg-muted/50 transition-colors ${selectedLessonId === lesson.id ? 'bg-muted border-l-4 border-primary' : ''}`}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          data-testid={`button-lesson-${lesson.id}`}
                        >
                          <div className="mt-0.5">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-tight">{lesson.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              {lesson.type === 'video' ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {isCourseCompleted && (
                  <Card className="border-accent bg-accent/5">
                    <CardContent className="p-6">
                      <Award className="w-12 h-12 text-accent mx-auto mb-4" />
                      <h3 className="font-bold text-center mb-2">Congratulations!</h3>
                      <p className="text-sm text-center text-muted-foreground mb-6">
                        You've completed all lessons in this course.
                      </p>
                      <Button 
                        className="w-full bg-accent text-primary hover:bg-accent/90" 
                        onClick={() => claimCertificateMutation.mutate(selectedCourseId)}
                        disabled={claimCertificateMutation.isPending || !!certificates?.find(c => c.courseId === selectedCourseId)}
                        data-testid="button-claim-certificate"
                      >
                        {certificates?.find(c => c.courseId === selectedCourseId) ? "Certificate Earned" : "Claim Certificate"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content: Lesson Viewer */}
              <div className="lg:col-span-2">
                {selectedLessonId ? (
                  <Card className="min-h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle>{currentLesson?.title}</CardTitle>
                        {currentLesson?.completed && (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-500/20">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 prose prose-slate max-w-none">
                      {currentLesson?.content && (
                        <div className="whitespace-pre-wrap">{currentLesson.content}</div>
                      )}
                    </CardContent>
                    <div className="p-6 border-t flex justify-between items-center bg-muted/20">
                      <Button 
                        variant="outline" 
                        disabled={!selectedCourse?.lessons.find(l => l.orderIndex === (currentLesson?.orderIndex || 0) - 1)}
                        onClick={() => setSelectedLessonId(selectedCourse?.lessons.find(l => l.orderIndex === (currentLesson?.orderIndex || 0) - 1)?.id || null)}
                      >
                        Previous Lesson
                      </Button>
                      
                      {!currentLesson?.completed ? (
                        <Button 
                          onClick={() => completeLessonMutation.mutate({ courseId: selectedCourseId, lessonId: selectedLessonId })}
                          disabled={completeLessonMutation.isPending}
                          data-testid="button-complete-lesson"
                        >
                          Mark as Complete
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => {
                            const next = selectedCourse?.lessons.find(l => l.orderIndex === (currentLesson?.orderIndex || 0) + 1);
                            if (next) setSelectedLessonId(next.id);
                          }}
                          disabled={!selectedCourse?.lessons.find(l => l.orderIndex === (currentLesson?.orderIndex || 0) + 1)}
                          className="gap-2"
                        >
                          Next Lesson <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                    <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Ready to start?</h3>
                    <p className="text-muted-foreground max-w-md mb-8">
                      Select a lesson from the sidebar to begin learning. Each lesson you complete brings you closer to your certificate.
                    </p>
                    <Button onClick={() => setSelectedLessonId(selectedCourse?.lessons[0].id || null)}>
                      Start First Lesson
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

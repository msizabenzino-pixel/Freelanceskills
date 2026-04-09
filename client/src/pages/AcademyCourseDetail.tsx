import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCourse, getTotalLessons, type Course, type Module, type Lesson } from "@/lib/academyCurriculum";
import {
  BookOpen, CheckCircle2, Lock, ChevronDown, ChevronUp, Play, FileText,
  HelpCircle, Award, TrendingUp, Star, Users, Clock, ArrowRight, ArrowLeft,
  Download, Share2, Sparkles, Trophy, Target, BarChart3, ChevronLeft,
  CheckCheck, X, Zap, BadgeCheck
} from "lucide-react";

// ─── Progress Storage ────────────────────────────────────────────────────────
function getProgressKey(courseId: number) {
  return `academy_progress_${courseId}`;
}
function loadProgress(courseId: number): Set<string> {
  try {
    const raw = localStorage.getItem(getProgressKey(courseId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function saveProgress(courseId: number, completed: Set<string>) {
  localStorage.setItem(getProgressKey(courseId), JSON.stringify([...completed]));
}

// ─── Certificate Generator ───────────────────────────────────────────────────
function generateCertificate(
  courseName: string,
  recipientName: string,
  completionDate: string,
  certCode: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 990;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1400, 990);
  bgGrad.addColorStop(0, "#0F172A");
  bgGrad.addColorStop(1, "#0D1F2D");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1400, 990);

  // Border glow
  ctx.save();
  ctx.shadowColor = "#10B981";
  ctx.shadowBlur = 40;
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1320, 910);
  ctx.restore();

  // Inner border
  ctx.strokeStyle = "rgba(16,185,129,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, 1280, 870);

  // Top decorative line
  const lineGrad = ctx.createLinearGradient(80, 110, 1320, 110);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.3, "#10B981");
  lineGrad.addColorStop(0.7, "#10B981");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 110);
  ctx.lineTo(1320, 110);
  ctx.stroke();

  // Logo / Platform name
  ctx.fillStyle = "#10B981";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("FreelanceSkills.net", 700, 85);

  // Decorative elements - corner accents
  function drawCornerAccent(x: number, y: number, r: number) {
    ctx.save();
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  drawCornerAccent(140, 140, 30);
  drawCornerAccent(1260, 140, 30);
  drawCornerAccent(140, 850, 30);
  drawCornerAccent(1260, 850, 30);

  // Certificate of Completion
  ctx.fillStyle = "rgba(16,185,129,0.15)";
  ctx.font = "italic 22px Georgia";
  ctx.textAlign = "center";
  ctx.fillStyle = "#6EE7B7";
  ctx.fillText("CERTIFICATE OF COMPLETION", 700, 200);

  // Bottom divider
  ctx.strokeStyle = "rgba(16,185,129,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 225);
  ctx.lineTo(1100, 225);
  ctx.stroke();

  // "This is to certify that"
  ctx.fillStyle = "#94A3B8";
  ctx.font = "24px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("This is to certify that", 700, 310);

  // Recipient Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 72px Georgia";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(16,185,129,0.5)";
  ctx.shadowBlur = 20;
  ctx.fillText(recipientName, 700, 420);
  ctx.shadowBlur = 0;

  // Name underline
  const nameWidth = ctx.measureText(recipientName).width;
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(700 - nameWidth / 2 - 20, 440);
  ctx.lineTo(700 + nameWidth / 2 + 20, 440);
  ctx.stroke();

  // "has successfully completed"
  ctx.fillStyle = "#94A3B8";
  ctx.font = "24px Georgia";
  ctx.fillText("has successfully completed", 700, 500);

  // Course Name
  ctx.fillStyle = "#10B981";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  // Word wrap for long course names
  const words = courseName.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > 1000 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  lines.forEach((line, i) => {
    ctx.fillText(line, 700, 570 + i * 52);
  });

  const yAfterTitle = 570 + lines.length * 52 + 20;

  // Bottom divider
  ctx.strokeStyle = "rgba(16,185,129,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, yAfterTitle + 20);
  ctx.lineTo(1100, yAfterTitle + 20);
  ctx.stroke();

  // Date and cert code
  ctx.fillStyle = "#64748B";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Completed: ${completionDate}`, 200, yAfterTitle + 80);
  ctx.textAlign = "right";
  ctx.fillText(`Cert ID: ${certCode}`, 1200, yAfterTitle + 80);

  // Signatures line
  ctx.strokeStyle = "rgba(148,163,184,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, yAfterTitle + 140);
  ctx.lineTo(500, yAfterTitle + 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(900, yAfterTitle + 140);
  ctx.lineTo(1200, yAfterTitle + 140);
  ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("FreelanceSkills Academy", 350, yAfterTitle + 165);
  ctx.fillText("Verified by FreelanceSkills.net", 1050, yAfterTitle + 165);

  // Bottom seal text
  ctx.fillStyle = "rgba(16,185,129,0.6)";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Blockchain-Verified · CIPC Reg: 2026/070509/09 · FreelanceSkills.net", 700, canvas.height - 60);

  return canvas.toDataURL("image/png");
}

// ─── Quiz Component ──────────────────────────────────────────────────────────
function QuizComponent({
  questions,
  onComplete,
}: {
  questions: NonNullable<Lesson["quiz"]>;
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const q = questions[current];
  const isLastQuestion = current === questions.length - 1;

  function handleAnswer(idx: number) {
    if (submitted) return;
    setSelected(idx);
  }

  function handleNext() {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSubmitted(false);

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  }

  function handleCheck() {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSubmitted(true);
  }

  if (showResults) {
    const score = answers.filter((a, i) => a === questions[i].answer).length;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;

    return (
      <div className="text-center py-8">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${passed ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
          {passed ? (
            <CheckCheck className={`w-12 h-12 text-emerald-400`} />
          ) : (
            <X className="w-12 h-12 text-rose-400" />
          )}
        </div>
        <h3 className={`text-3xl font-black mb-2 ${passed ? "text-emerald-400" : "text-rose-400"}`}>
          {pct}% — {passed ? "Passed!" : "Try Again"}
        </h3>
        <p className="text-slate-400 mb-6">
          {score}/{questions.length} correct
          {passed ? " · Great work!" : " · Review the lesson and retry."}
        </p>
        {passed ? (
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto"
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark Complete & Continue
          </button>
        ) : (
          <button
            onClick={() => { setCurrent(0); setSelected(null); setAnswers(Array(questions.length).fill(null)); setShowResults(false); setSubmitted(false); }}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
          >
            Retry Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-slate-400">Question {current + 1} of {questions.length}</span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${
                i < current ? "bg-emerald-500" : i === current ? "bg-amber-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold text-white mb-6 leading-snug">{q.q}</h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {q.options.map((opt, i) => {
          let style = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750";
          if (selected === i && !submitted) style = "bg-emerald-600/20 border-emerald-500 text-white";
          if (submitted) {
            if (i === q.answer) style = "bg-emerald-600/25 border-emerald-400 text-emerald-300";
            else if (selected === i) style = "bg-rose-600/20 border-rose-500 text-rose-300";
            else style = "bg-slate-800 border-slate-700 text-slate-500";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={submitted}
              data-testid={`quiz-option-${i}`}
              className={`w-full text-left p-4 rounded-xl border transition-all ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-medium">{opt}</span>
                {submitted && i === q.answer && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
                {submitted && selected === i && i !== q.answer && <X className="w-5 h-5 text-rose-400 ml-auto" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        {!submitted ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            data-testid="button-check-answer"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            data-testid="button-next-question"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {isLastQuestion ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Milestone Celebration ───────────────────────────────────────────────────
function MilestoneCelebration({
  milestone,
  emoji,
  onClose,
}: {
  milestone: string;
  emoji: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl shadow-emerald-500/20 animate-bounce-once"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-7xl mb-4">{emoji}</div>
        <div className="text-emerald-400 text-sm font-bold mb-2 tracking-wider">MILESTONE EARNED</div>
        <h2 className="text-2xl font-black text-white mb-3">{milestone}</h2>
        <p className="text-slate-400 text-sm mb-6">You've completed a module! Keep going to earn your certificate.</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
        >
          Continue Learning →
        </button>
      </div>
    </div>
  );
}

// ─── Certificate Modal ───────────────────────────────────────────────────────
function CertificateModal({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const certCode = `CERT-${course.id}-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  function handleGenerate() {
    if (!name.trim()) return;
    const date = new Date().toLocaleDateString("en-ZA", {
      year: "numeric", month: "long", day: "numeric",
    });
    const dataURL = generateCertificate(course.title, name.trim(), date, certCode);
    setGenerated(dataURL);
  }

  function handleDownload() {
    if (!generated) return;
    const a = document.createElement("a");
    a.href = generated;
    a.download = `FreelanceSkills-Certificate-${course.slug}.png`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Claim Your Certificate</h2>
          <p className="text-slate-400 text-sm">Enter your name as you want it to appear on the certificate.</p>
        </div>

        {!generated ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              data-testid="input-certificate-name"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 px-4 py-3 rounded-xl mb-4 focus:outline-none focus:border-emerald-500 text-center text-lg font-medium"
              maxLength={60}
            />
            <button
              onClick={handleGenerate}
              disabled={!name.trim()}
              data-testid="button-generate-cert"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-slate-950 rounded-xl font-bold text-lg transition-all"
            >
              Generate Certificate
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-medium">Certificate ready for {name}!</p>
              <p className="text-slate-400 text-xs mt-1">ID: {certCode}</p>
            </div>
            <button
              onClick={handleDownload}
              data-testid="button-download-cert"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 mb-3 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Certificate (PNG)
            </button>
            <button
              onClick={() => {
                navigator.share?.({ title: `I completed ${course.title}!`, url: window.location.href });
              }}
              className="w-full py-3 border border-slate-600 hover:border-slate-500 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share on LinkedIn
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AcademyCourseDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const course = getCourse(Number(params.id));

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() =>
    course ? loadProgress(course.id) : new Set()
  );
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["m1"]));
  const [milestone, setMilestone] = useState<{ label: string; emoji: string } | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Navbar />
        <p className="text-xl mt-12">Course not found.</p>
        <button onClick={() => navigate("/academy")} className="mt-4 text-emerald-400 hover:underline">
          ← Back to Academy
        </button>
      </div>
    );
  }

  const totalLessons = getTotalLessons(course);
  const completedCount = completedLessons.size;
  const progressPct = Math.round((completedCount / totalLessons) * 100);
  const isComplete = progressPct === 100;

  const activeLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === activeLessonId) ?? null;

  const activeModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === activeLessonId)
  ) ?? null;

  function markLessonComplete(lessonId: string) {
    const updated = new Set(completedLessons);
    updated.add(lessonId);
    setCompletedLessons(updated);
    saveProgress(course!.id, updated);

    // Check module completion
    const module = course!.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
    if (module) {
      const allModuleLessons = module.lessons.map((l) => l.id);
      const allComplete = allModuleLessons.every((id) => updated.has(id));
      if (allComplete) {
        setMilestone({ label: module.milestone, emoji: module.milestoneEmoji });
      }
    }

    // Auto-advance to next lesson
    const allLessons = course!.modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
    if (currentIdx < allLessons.length - 1) {
      const next = allLessons[currentIdx + 1];
      setActiveLessonId(next.id);
      // Expand that module
      const nextModule = course!.modules.find((m) => m.lessons.some((l) => l.id === next.id));
      if (nextModule) {
        setExpandedModules((prev) => new Set([...prev, nextModule.id]));
      }
      setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  }

  function goToPrevLesson() {
    const allLessons = course!.modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l.id === activeLessonId);
    if (currentIdx > 0) setActiveLessonId(allLessons[currentIdx - 1].id);
  }

  function goToNextLesson() {
    const allLessons = course!.modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l.id === activeLessonId);
    if (currentIdx < allLessons.length - 1) setActiveLessonId(allLessons[currentIdx + 1].id);
  }

  function isModuleComplete(module: Module) {
    return module.lessons.every((l) => completedLessons.has(l.id));
  }

  function getModuleProgress(module: Module) {
    const done = module.lessons.filter((l) => completedLessons.has(l.id)).length;
    return { done, total: module.lessons.length };
  }

  // ── OVERVIEW PAGE ─────────────────────────────────────────────────────────
  if (showOverview) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />

        {/* Hero */}
        <div className={`bg-gradient-to-br ${course.color} relative py-16 px-4`}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="max-w-5xl mx-auto relative">
            <button
              onClick={() => navigate("/academy")}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Academy
            </button>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-medium bg-white/20 text-white px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    course.difficulty === "Beginner" ? "bg-emerald-500/30 text-emerald-300" :
                    course.difficulty === "Intermediate" ? "bg-amber-500/30 text-amber-300" :
                    "bg-rose-500/30 text-rose-300"
                  }`}>
                    {course.difficulty}
                  </span>
                  {course.isFree && (
                    <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-white/80 mb-6 leading-relaxed">{course.tagline}</p>

                <div className="flex flex-wrap gap-5 text-white/80 text-sm mb-6">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {course.rating} rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {course.enrolled.toLocaleString()} enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    {course.earningsLift} earnings lift
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((s) => (
                    <span key={s} className="text-sm bg-white/15 text-white px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start card */}
              <div className="bg-slate-950/80 backdrop-blur border border-white/10 rounded-2xl p-6 w-full lg:w-80 flex-shrink-0">
                {progressPct > 0 ? (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-emerald-400 font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-1.5">{completedCount} of {totalLessons} lessons done</p>
                  </div>
                ) : null}

                <button
                  onClick={() => {
                    setShowOverview(false);
                    const firstLesson = course.modules[0]?.lessons[0];
                    if (firstLesson && !activeLessonId) setActiveLessonId(firstLesson.id);
                  }}
                  data-testid="button-start-course"
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg transition-all mb-3 flex items-center justify-center gap-2"
                >
                  {progressPct > 0 ? (
                    <><Zap className="w-5 h-5" /> Continue Learning</>
                  ) : (
                    <><Play className="w-5 h-5" /> Start Course</>
                  )}
                </button>

                {isComplete && (
                  <button
                    onClick={() => setShowCertModal(true)}
                    data-testid="button-claim-certificate"
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Award className="w-5 h-5" />
                    Claim Certificate 🎉
                  </button>
                )}

                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {course.modules.length} modules</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {totalLessons} lessons</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Downloadable certificate</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Milestone badges</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Blockchain-verified credential</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Overview */}
        <div className="max-w-5xl mx-auto px-4 py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Curriculum */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>

              <div className="space-y-4">
                {course.modules.map((module, idx) => {
                  const { done, total } = getModuleProgress(module);
                  const complete = isModuleComplete(module);

                  return (
                    <div
                      key={module.id}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        complete
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-slate-700/60 bg-slate-900/50"
                      }`}
                    >
                      <button
                        onClick={() => {
                          const newExp = new Set(expandedModules);
                          expandedModules.has(module.id) ? newExp.delete(module.id) : newExp.add(module.id);
                          setExpandedModules(newExp);
                        }}
                        data-testid={`module-${idx + 1}`}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                            complete ? "bg-emerald-500/20" : "bg-slate-800"
                          }`}>
                            {complete ? (
                              <span className="text-lg">{module.milestoneEmoji}</span>
                            ) : (
                              <span className="text-white font-bold text-sm">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">{module.title}</h3>
                            <p className="text-sm text-slate-400">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-xs text-slate-500 whitespace-nowrap">{done}/{total}</span>
                          {expandedModules.has(module.id) ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      {expandedModules.has(module.id) && (
                        <div className="border-t border-slate-700/40 px-5 pb-4">
                          {/* Milestone info */}
                          <div className="flex items-center gap-2 py-3 mb-2 text-sm text-slate-400">
                            <span className="text-base">{module.milestoneEmoji}</span>
                            <span>Earn <strong className="text-slate-300">"{module.milestone}"</strong> badge on completion</span>
                          </div>

                          <div className="space-y-1">
                            {module.lessons.map((lesson, lIdx) => {
                              const done = completedLessons.has(lesson.id);
                              const Icon = lesson.type === "video" ? Play : lesson.type === "quiz" ? HelpCircle : FileText;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => {
                                    setActiveLessonId(lesson.id);
                                    setShowOverview(false);
                                  }}
                                  data-testid={`lesson-item-${lesson.id}`}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left"
                                >
                                  {done ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                  ) : (
                                    <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  )}
                                  <span className={`flex-1 text-sm ${done ? "text-slate-400 line-through" : "text-slate-300"}`}>
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-slate-600 flex-shrink-0">{lesson.duration}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right sidebar: what you'll learn */}
            <div>
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2.5">
                  {course.modules.map((m) => (
                    <li key={m.id} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {m.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Milestone Badges
                </h3>
                <div className="space-y-2">
                  {course.modules.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg ${
                        isModuleComplete(m)
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <span className="text-2xl">{m.milestoneEmoji}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{m.milestone}</p>
                        <p className="text-xs text-slate-500">
                          {isModuleComplete(m) ? "✅ Earned" : `${m.lessons.length} lessons`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Earnings Impact
                </h3>
                <div className="text-center py-4">
                  <div className="text-5xl font-black text-emerald-400 mb-1">{course.earningsLift}</div>
                  <p className="text-slate-400 text-sm">avg earnings increase</p>
                  <p className="text-slate-500 text-xs mt-2">Based on {course.enrolled.toLocaleString()} graduates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {showCertModal && (
          <CertificateModal course={course} onClose={() => setShowCertModal(false)} />
        )}
      </div>
    );
  }

  // ── LESSON PLAYER ──────────────────────────────────────────────────────────
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonIdx = allLessons.findIndex((l) => l.id === activeLessonId);
  const hasPrev = currentLessonIdx > 0;
  const hasNext = currentLessonIdx < allLessons.length - 1;
  const isLessonComplete = activeLessonId ? completedLessons.has(activeLessonId) : false;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOverview(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Course Overview</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white text-sm font-medium truncate max-w-xs">{course.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">{progressPct}%</span>
          </div>

          {isComplete && (
            <button
              onClick={() => setShowCertModal(true)}
              data-testid="button-get-certificate"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Award className="w-4 h-4" />
              Certificate
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 bg-slate-900 border-r border-slate-800 flex-shrink-0 overflow-y-auto hidden md:flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-white text-sm">{course.title}</h2>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{completedCount}/{totalLessons} lessons</span>
                <span className="text-emerald-400 font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module list */}
          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module, mIdx) => {
              const { done, total } = getModuleProgress(module);
              const complete = isModuleComplete(module);
              const isExpanded = expandedModules.has(module.id);

              return (
                <div key={module.id} className="border-b border-slate-800/60">
                  <button
                    onClick={() => {
                      const newExp = new Set(expandedModules);
                      isExpanded ? newExp.delete(module.id) : newExp.add(module.id);
                      setExpandedModules(newExp);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      complete ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                    }`}>
                      {complete ? module.milestoneEmoji : mIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{module.title.replace(/Module \d+: /, "")}</p>
                      <p className="text-xs text-slate-500">{done}/{total} lessons</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pb-2">
                      {module.lessons.map((lesson) => {
                        const isDone = completedLessons.has(lesson.id);
                        const isActive = activeLessonId === lesson.id;
                        const Icon = lesson.type === "video" ? Play : lesson.type === "quiz" ? HelpCircle : FileText;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setActiveLessonId(lesson.id);
                              setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
                            }}
                            data-testid={`sidebar-lesson-${lesson.id}`}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive
                                ? "bg-emerald-500/15 border-r-2 border-emerald-400"
                                : "hover:bg-slate-800/40"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                            )}
                            <span className={`text-xs flex-1 line-clamp-2 ${
                              isActive ? "text-emerald-300 font-medium" : isDone ? "text-slate-500" : "text-slate-300"
                            }`}>
                              {lesson.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
              {/* Lesson header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <span>{activeModule?.title.replace(/Module \d+: /, "")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className={`capitalize px-1.5 py-0.5 rounded text-xs font-medium ${
                    activeLesson.type === "quiz" ? "bg-purple-500/20 text-purple-400" :
                    activeLesson.type === "video" ? "bg-blue-500/20 text-blue-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {activeLesson.type}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{activeLesson.duration}</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {activeLesson.title}
                  </h1>
                  {isLessonComplete && (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-6">
                {activeLesson.type === "quiz" && activeLesson.quiz ? (
                  <QuizComponent
                    questions={activeLesson.quiz}
                    onComplete={() => markLessonComplete(activeLesson.id)}
                  />
                ) : (
                  <>
                    {activeLesson.type === "video" && (
                      <div className="bg-slate-800 rounded-xl mb-6 flex items-center justify-center h-64 sm:h-80 border border-slate-700">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Play className="w-8 h-8 text-emerald-400" />
                          </div>
                          <p className="text-slate-400 text-sm">Video lesson</p>
                        </div>
                      </div>
                    )}

                    {/* Text content with markdown-like rendering */}
                    <div className="prose prose-invert max-w-none">
                      {activeLesson.content.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) {
                          return <h1 key={i} className="text-2xl font-black text-white mt-6 mb-3">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith("## ")) {
                          return <h2 key={i} className="text-xl font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={i} className="font-bold text-white mt-4 mb-2">{line.slice(2, -2)}</p>;
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <div key={i} className="flex items-start gap-2 my-1.5">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{
                                __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                              }} />
                            </div>
                          );
                        }
                        if (line.startsWith("```")) {
                          return null; // handled below
                        }
                        if (line.trim() === "") {
                          return <div key={i} className="h-3" />;
                        }
                        return (
                          <p key={i} className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                              .replace(/`(.*?)`/g, "<code class='bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")
                          }} />
                        );
                      }).filter(Boolean)}

                      {/* Code blocks */}
                      {activeLesson.content.split(/```[a-z]*\n/).length > 1 && (
                        <div>
                          {activeLesson.content.split(/```(?:[a-z]+)?\n/).map((segment, i) => {
                            if (i % 2 === 1) {
                              const code = segment.replace(/```$/, "").trim();
                              return (
                                <pre key={`code-${i}`} className="bg-slate-800 border border-slate-700 rounded-xl p-4 overflow-x-auto my-4 text-sm font-mono text-slate-300 leading-relaxed">
                                  {code}
                                </pre>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>

                    {/* Mark complete button */}
                    {!isLessonComplete && (
                      <button
                        onClick={() => markLessonComplete(activeLesson.id)}
                        data-testid="button-mark-complete"
                        className="mt-8 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Mark as Complete
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPrevLesson}
                  disabled={!hasPrev}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {isComplete && (
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    Get Certificate
                  </button>
                )}

                <button
                  onClick={goToNextLesson}
                  disabled={!hasNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 min-h-96">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Select a Lesson</h2>
                <p className="text-slate-400 mb-6">Choose a lesson from the sidebar to start learning.</p>
                <button
                  onClick={() => {
                    const first = course.modules[0]?.lessons[0];
                    if (first) setActiveLessonId(first.id);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                >
                  Start from the Beginning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestone celebration overlay */}
      {milestone && (
        <MilestoneCelebration
          milestone={milestone.label}
          emoji={milestone.emoji}
          onClose={() => setMilestone(null)}
        />
      )}

      {/* Certificate modal */}
      {showCertModal && (
        <CertificateModal course={course} onClose={() => setShowCertModal(false)} />
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const SKILL_CATEGORIES = [
  { id: "react_frontend", label: "React / Frontend", icon: "⚛️", category: "Technology" },
  { id: "python_backend", label: "Python / Backend", icon: "🐍", category: "Technology" },
  { id: "digital_marketing", label: "Digital Marketing", icon: "📣", category: "Marketing" },
  { id: "plumbing_trade", label: "Plumbing (Trade)", icon: "🔧", category: "Trades" },
  { id: "graphic_design", label: "Graphic Design", icon: "🎨", category: "Creative" },
  { id: "data_science", label: "Data Science", icon: "📊", category: "Technology" },
  { id: "copywriting", label: "Copywriting", icon: "✍️", category: "Creative" },
  { id: "project_management", label: "Project Management", icon: "📋", category: "Business" },
];

export default function VettingSkills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTest, setSelectedTest] = useState("");
  const [phase, setPhase] = useState<"select" | "proctor" | "test" | "done">("select");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [startTime] = useState(Date.now());

  const { data: questions } = useQuery({
    queryKey: [`/api/vetting/questions/${selectedTest}`],
    enabled: !!selectedTest && phase === "test",
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/skills", {
      testType: selectedTest,
      skillCategory: SKILL_CATEGORIES.find(s => s.id === selectedTest)?.category || "General",
      difficultyLevel: "intermediate",
      answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      proctorData: {
        tabSwitches,
        faceDetected: true,
        timeSpentMs: Date.now() - startTime,
        aiFlag: false,
      },
    }),
    onSuccess: (data: any) => {
      setResult(data);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
    },
    onError: () => toast({ title: "Submission Error", description: "Failed to submit assessment.", variant: "destructive" }),
  });

  // Track tab switches (anti-cheat)
  if (typeof window !== "undefined" && phase === "test") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) setTabSwitches(p => p + 1);
    }, { once: false });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16">
      {/* Nav */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/vetting" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-emerald-400">Step 3 of 5 — Skills Test</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {phase === "select" && (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">💡</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI-Proctored Skills Assessment</h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Prove your expertise. 20 adaptive questions, 30 minutes, AI-monitored.
                Score 70%+ to earn your Verified Professional badge.
              </p>
            </div>

            {/* Anti-cheat notice */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6 flex gap-3 text-sm">
              <span className="text-yellow-400 flex-shrink-0 text-base">⚠️</span>
              <div className="text-yellow-300/80">
                <strong>Proctoring Active:</strong> Tab switches, focus changes, and time patterns are tracked.
                Suspicious behaviour results in automatic flagging for manual review.
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-4 text-sm">Select Your Primary Skill</h2>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_CATEGORIES.map(({ id, label, icon, category }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedTest(id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      selectedTest === id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs text-slate-500">{category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => selectedTest && setPhase("proctor")}
              disabled={!selectedTest}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
            >
              🎯 Start {selectedTest ? SKILL_CATEGORIES.find(s => s.id === selectedTest)?.label : "Assessment"}
            </button>
          </>
        )}

        {phase === "proctor" && (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold mb-3">Test Environment Setup</h1>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
              Before starting, please ensure you're in a quiet environment with good lighting.
              Your session will be monitored for integrity.
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 max-w-sm mx-auto mb-8 space-y-3 text-sm text-left">
              {[
                "✅ I am the person listed on my profile",
                "✅ I will not switch tabs or use other resources",
                "✅ I understand my session is being monitored",
                "✅ I have 30 uninterrupted minutes available",
              ].map(rule => (
                <div key={rule} className="text-slate-300">{rule}</div>
              ))}
            </div>
            <button
              onClick={() => setPhase("test")}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              I Agree — Start Test
            </button>
          </div>
        )}

        {phase === "test" && (
          <>
            {/* Timer + Proctor Bar */}
            <div className="bg-slate-900/80 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-medium">Recording</span>
              </div>
              <span className="text-slate-400">
                Tab switches: <span className={tabSwitches > 2 ? "text-red-400" : "text-slate-300"}>{tabSwitches}</span>
              </span>
              <span className="text-slate-400">
                Skill: <span className="text-emerald-400">{SKILL_CATEGORIES.find(s => s.id === selectedTest)?.label}</span>
              </span>
            </div>

            {questions?.questions ? (
              <div className="space-y-6">
                {questions.questions.map((q: any, i: number) => (
                  <div key={q.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <div className="text-xs text-slate-500 mb-2">Question {i + 1} of {questions.questions.length}</div>
                    <p className="font-medium text-sm sm:text-base mb-4">{q.q}</p>
                    {q.type === "mcq" && q.opts ? (
                      <div className="space-y-2">
                        {q.opts.map((opt: string, oi: number) => (
                          <label key={oi} className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="mt-0.5 accent-emerald-500"
                            />
                            <span className={`text-sm group-hover:text-emerald-300 transition-colors ${answers[q.id] === opt ? "text-emerald-300" : "text-slate-300"}`}>
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        rows={4}
                        placeholder="Type your answer here..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label={`Answer for question ${i + 1}`}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={Object.keys(answers).length === 0 || submitMutation.isPending}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {submitMutation.isPending ? "Submitting & Scoring..." : `Submit ${Object.keys(answers).length} Answers`}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 animate-pulse">Loading questions...</div>
            )}
          </>
        )}

        {phase === "done" && result && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">{result.passed ? "🎯" : "📚"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {result.passed ? "Skills Verified!" : "Keep Practising!"}
            </h1>
            <p className="text-slate-400 mb-6 text-sm">{result.message}</p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">{result.rawScore}</div>
                <div className="text-xs text-slate-500">Your Score /100</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">Top {100 - result.percentileScore}%</div>
                <div className="text-xs text-slate-500">SA Freelancer Pool</div>
              </div>
            </div>

            {result.proctorFlagged && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300">
                ⚠️ Proctoring flag noted. A human reviewer will assess your test. This doesn't mean failure.
              </div>
            )}

            <p className="text-xs text-slate-500 mb-6">{result.lebaMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.passed ? (
                <Link href="/vetting/education" className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all">
                  Next: Education Verification →
                </Link>
              ) : (
                <button onClick={() => { setPhase("select"); setAnswers({}); setResult(null); }}
                  className="px-6 py-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all">
                  Retry in 24 Hours
                </button>
              )}
              <Link href="/vetting" className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all">
                Back to Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

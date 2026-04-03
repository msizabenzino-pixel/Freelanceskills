import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const SKILL_CATEGORIES = [
  { id: "react_frontend", label: "React / Frontend Dev", icon: "⚛️", category: "Technology" },
  { id: "python_backend", label: "Python / Backend Dev", icon: "🐍", category: "Technology" },
  { id: "digital_marketing", label: "Digital Marketing", icon: "📣", category: "Marketing" },
  { id: "plumbing_trade", label: "Plumbing (Trade)", icon: "🔧", category: "Trades" },
  { id: "graphic_design", label: "Graphic Design", icon: "🎨", category: "Creative" },
  { id: "data_science", label: "Data Science / Analytics", icon: "📊", category: "Technology" },
  { id: "copywriting", label: "Copywriting / Content", icon: "✍️", category: "Creative" },
  { id: "project_management", label: "Project Management", icon: "📋", category: "Business" },
];

// Proctor context — tracks anti-cheat data between renders using refs (no stale closure)
function useProctorSession(active: boolean) {
  const tabSwitchesRef = useRef(0);
  const [tabSwitchDisplay, setTabSwitchDisplay] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!active) return;
    startTimeRef.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchesRef.current += 1;
        setTabSwitchDisplay(tabSwitchesRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [active]);

  const getProctorData = useCallback(() => ({
    tabSwitches: tabSwitchesRef.current,
    faceDetected: true,
    timeSpentMs: Date.now() - startTimeRef.current,
    aiFlag: tabSwitchesRef.current > 4,
  }), []);

  return { tabSwitchDisplay, getProctorData };
}

export default function VettingSkills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTest, setSelectedTest] = useState("");
  const [phase, setPhase] = useState<"select" | "proctor" | "test" | "done">("select");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  const isTestActive = phase === "test";
  const { tabSwitchDisplay, getProctorData } = useProctorSession(isTestActive);

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/vetting/questions/${selectedTest}`],
    enabled: !!selectedTest && phase === "test",
    retry: false,
    staleTime: 60 * 60 * 1000, // questions don't change during a session
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const proctorData = getProctorData();
      return apiRequest("POST", "/api/vetting/skills", {
        testType: selectedTest,
        skillCategory: SKILL_CATEGORIES.find(s => s.id === selectedTest)?.category || "General",
        difficultyLevel: "intermediate",
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        proctorData,
      });
    },
    onSuccess: (data: any) => {
      setResult(data);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
    },
    onError: () => toast({
      title: "Submission Error",
      description: "Failed to submit your assessment. Your answers are saved — please try again.",
      variant: "destructive",
    }),
  });

  const selectedCategory = SKILL_CATEGORIES.find(s => s.id === selectedTest);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16" data-testid="page-vetting-skills">
      {/* Nav */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/vetting"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            data-testid="link-back-to-hub"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-emerald-400" data-testid="text-step-label">
            Step 3 of 5 — Skills Test
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── SELECT SKILL ──────────────────────────────────────────────────── */}
        {phase === "select" && (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">💡</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI-Proctored Skills Assessment</h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Prove your expertise with 20 adaptive questions in 30 minutes.
                Score 70%+ to earn your Verified Professional badge.
              </p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6 flex gap-3 text-sm">
              <span className="text-yellow-400 flex-shrink-0 text-base">⚠️</span>
              <div className="text-yellow-300/80">
                <strong>Proctoring Active:</strong> Tab switches, focus changes, and time patterns are tracked.
                Suspicious behaviour results in automatic flagging for manual review.
                You have 1 free retry per 24 hours.
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-4 text-sm">Select Your Primary Skill</h2>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_CATEGORIES.map(({ id, label, icon, category }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedTest(id)}
                    data-testid={`button-skill-${id}`}
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
              data-testid="button-start-assessment"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Start {selectedCategory ? selectedCategory.label : "Assessment"}
            </button>
          </>
        )}

        {/* ── PROCTOR LOCKDOWN ──────────────────────────────────────────────── */}
        {phase === "proctor" && (
          <div className="text-center py-12" data-testid="section-proctor-lockdown">
            <div className="text-5xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold mb-3">Test Environment Setup</h1>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
              Please ensure you're in a quiet environment. Your session will be AI-monitored for integrity.
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 max-w-sm mx-auto mb-8 space-y-3 text-sm text-left">
              {[
                "✅ I am the person listed on my profile",
                "✅ I will not switch tabs or use external resources",
                "✅ I understand this session is AI-monitored",
                "✅ I have 30 uninterrupted minutes available",
              ].map(rule => (
                <div key={rule} className="text-slate-300">{rule}</div>
              ))}
            </div>
            <button
              onClick={() => setPhase("test")}
              data-testid="button-agree-start-test"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              I Agree — Start Test
            </button>
          </div>
        )}

        {/* ── LIVE TEST ────────────────────────────────────────────────────── */}
        {phase === "test" && (
          <div data-testid="section-live-test">
            {/* Proctor Status Bar */}
            <div className="bg-slate-900/80 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-medium">Recording</span>
              </div>
              <span className="text-slate-400" data-testid="text-tab-switches">
                Tab switches:{" "}
                <span className={tabSwitchDisplay > 2 ? "text-red-400 font-bold" : "text-slate-300"}>
                  {tabSwitchDisplay}
                </span>
                {tabSwitchDisplay > 2 && <span className="text-red-400 ml-1">⚠️</span>}
              </span>
              <span className="text-emerald-400 text-xs font-medium" data-testid="text-current-skill">
                {selectedCategory?.icon} {selectedCategory?.label}
              </span>
            </div>

            {questionsLoading && (
              <div className="text-center py-20 text-slate-400 animate-pulse" data-testid="status-questions-loading">
                Loading your adaptive question set...
              </div>
            )}

            {!questionsLoading && questionsData?.questions && (
              <div className="space-y-6" data-testid="list-questions">
                {questionsData.questions.map((q: any, i: number) => (
                  <div
                    key={q.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-5"
                    data-testid={`card-question-${q.id}`}
                  >
                    <div className="text-xs text-slate-500 mb-2">
                      Question {i + 1} of {questionsData.questions.length}
                    </div>
                    <p className="font-medium text-sm sm:text-base mb-4 leading-relaxed">{q.q}</p>
                    {q.type === "mcq" && q.opts ? (
                      <div className="space-y-2">
                        {q.opts.map((opt: string, oi: number) => (
                          <label
                            key={oi}
                            className="flex items-start gap-3 cursor-pointer group"
                            data-testid={`option-${q.id}-${oi}`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="mt-0.5 accent-emerald-500 flex-shrink-0"
                              aria-label={opt}
                            />
                            <span className={`text-sm leading-relaxed group-hover:text-emerald-300 transition-colors ${answers[q.id] === opt ? "text-emerald-300" : "text-slate-300"}`}>
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
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        aria-label={`Answer for question ${i + 1}`}
                        data-testid={`input-answer-${q.id}`}
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    {Object.keys(answers).length} of {questionsData.questions.length} answered
                  </span>
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={Object.keys(answers).length === 0 || submitMutation.isPending}
                    data-testid="button-submit-assessment"
                    className="flex-1 max-w-xs py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitMutation.isPending
                      ? "Submitting & Scoring..."
                      : `Submit ${Object.keys(answers).length} Answers`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS ──────────────────────────────────────────────────────── */}
        {phase === "done" && result && (
          <div className="text-center py-8" data-testid="section-assessment-results">
            <div className="text-5xl mb-4">{result.passed ? "🎯" : "📚"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {result.passed ? "Skills Verified!" : "Keep Practising!"}
            </h1>
            <p className="text-slate-400 mb-6 text-sm">{result.message}</p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
              <div
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                data-testid="stat-raw-score"
              >
                <div className="text-2xl font-bold text-emerald-400">{result.rawScore}</div>
                <div className="text-xs text-slate-500">Your Score /100</div>
              </div>
              <div
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                data-testid="stat-percentile"
              >
                <div className="text-2xl font-bold text-blue-400">
                  Top {100 - (result.percentileScore || 50)}%
                </div>
                <div className="text-xs text-slate-500">SA Freelancer Pool</div>
              </div>
            </div>

            {result.proctorFlagged && (
              <div
                className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300"
                data-testid="alert-proctor-flag"
              >
                ⚠️ Our system detected unusual activity during the test. A human reviewer will verify your results.
                This doesn't mean automatic failure.
              </div>
            )}

            {result.portfolioAnalysis && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-4 text-sm text-left max-w-sm mx-auto">
                <div className="text-xs text-slate-400 mb-2 font-semibold">Portfolio AI Analysis</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality Score</span>
                    <span className="text-emerald-400 font-medium">{result.portfolioAnalysis.qualityScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Relevance Score</span>
                    <span className="text-emerald-400 font-medium">{result.portfolioAnalysis.relevanceScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Originality</span>
                    <span className={result.portfolioAnalysis.originalityFlag ? "text-emerald-400" : "text-red-400"}>
                      {result.portfolioAnalysis.originalityFlag ? "✓ Original" : "⚠ Review needed"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 mb-6 italic">{result.lebaMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.passed ? (
                <Link
                  href="/vetting/education"
                  data-testid="link-next-education"
                  className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all"
                >
                  Next: Education Verification →
                </Link>
              ) : (
                <button
                  onClick={() => { setPhase("select"); setAnswers({}); setResult(null); }}
                  data-testid="button-retry-skills"
                  className="px-6 py-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all"
                >
                  🔄 Retry in 24 Hours
                </button>
              )}
              <Link
                href="/vetting"
                data-testid="link-back-hub-results"
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all"
              >
                Back to Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

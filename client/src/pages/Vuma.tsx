import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Send, Sparkles, RefreshCw, Zap, Users, BookOpen, TrendingUp, MessageSquare, Globe,
  Star, ArrowRight, Brain, Share2, BarChart2, Cpu, Target, DollarSign,
  CheckCircle, XCircle, Copy, ExternalLink, Plus, Trash2, Award, Mic,
  FileText, Clock, Activity, ChevronRight, Loader2, Heart, Gift, Shield,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  suggestions?: string[];
  language?: string;
  ts: number;
}

interface ActionResult {
  success: boolean;
  title: string;
  desc: string;
  stat: string;
  timestamp: string;
}

interface MemoryState {
  goals: string[];
  incomeTarget: string;
  courseProgress: string[];
  wins: string[];
}

interface AnalyticsDashboard {
  overview: { totalProjects: number; avgRating: number; satisfaction: number; activeFreelancers: number; totalEarnings: number; youthEmployed: number };
  revenueHistory: { month: string; revenue: number; projects: number }[];
  topSkills: { skill: string; demand: number; supply: number }[];
  conversionFunnel: { stage: string; count: number }[];
  geoDist: { region: string; pct: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3} (.+)$/gm, "<strong class='text-emerald-400'>$1</strong>")
    .replace(/^• (.+)$/gm, "<span class='block pl-3 before:content-[\"•\"] before:pr-2 before:text-emerald-400'>$1</span>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function formatRand(n: number): string {
  return `R${(n / 1000000).toFixed(1)}M`;
}

function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultValue; } catch { return defaultValue; }
  });
  const setter = useCallback((v: T) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, setter];
}

// ── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "actions", label: "Actions", icon: Zap },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "viral", label: "Viral", icon: Share2 },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "future", label: "Future", icon: Cpu },
];

const ACTION_CARDS = [
  { id: "post-job", label: "Post a Job", icon: Zap, color: "emerald", desc: "Match to 2,400+ freelancers in minutes" },
  { id: "auto-bid", label: "Auto-Bid", icon: Target, color: "blue", desc: "AI submits winning proposals for you" },
  { id: "start-course", label: "Start Free Course", icon: BookOpen, color: "purple", desc: "AI Academy — earn while you learn" },
  { id: "generate-contract", label: "Generate Contract", icon: FileText, color: "amber", desc: "POPIA-compliant, R10k dispute insurance" },
  { id: "release-milestone", label: "Release Milestone", icon: CheckCircle, color: "teal", desc: "Instant escrow release via PayFast" },
  { id: "request-payout", label: "Request Payout", icon: DollarSign, color: "rose", desc: "EFT, Ozow, MTN MoMo, M-Pesa" },
];

const COURSE_STEPS = [
  "AI Tools for Freelancers — Lesson 1",
  "Build a Winning Profile (South Africa)",
  "Pricing Strategy: From R150 to R1,500/hr",
  "Write Proposals That Win Every Time",
  "Deliver & Delight: 5-Star Frameworks",
];

const LANGUAGES = ["English", "Zulu", "Xhosa", "Afrikaans", "Swahili", "French", "Portuguese", "Shona"];

const GEO_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

// ── POPIA Consent Modal ───────────────────────────────────────────────────────
function POPIAModal() {
  const [show, setShow] = useState(() => localStorage.getItem("vuma-popia-consent") !== "1");

  if (!show) return null;

  const accept = () => {
    localStorage.setItem("vuma-popia-consent", "1");
    setShow(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Privacy Notice (POPIA)</h2>
            <p className="text-xs text-gray-400">FreelanceSkills.net · CIPC 2026/070509/09</p>
          </div>
        </div>
        <div className="text-sm text-gray-300 space-y-2 mb-5">
          <p>By using Vuma-NUCLEAR, you agree to our use of chat data to improve your experience on FreelanceSkills.net.</p>
          <ul className="text-xs text-gray-400 space-y-1 list-none">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Conversations are not permanently stored on our servers</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> No personal data is shared with third parties</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Your memory data is stored locally in your browser</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> You may request data deletion at support@freelanceskills.net</li>
          </ul>
          <p className="text-xs text-gray-500">In compliance with the Protection of Personal Information Act (POPIA), South Africa.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={accept} data-testid="popia-accept-button"
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
            Accept &amp; Continue
          </button>
          <a href="/privacy" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm transition-colors">
            Full Policy
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, prefix = "", suffix = "", duration = 1500 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: "**Sawubona! I'm VUMA-NUCLEAR 🔥**\n\nFreelanceSkills.net's official AI — built to end youth unemployment in Africa. I'm not a support bot. I'm a truth-seeking, income-creating weapon.\n\n**10,247 projects · R18.4M earned · 3,240 youth hired · 4.9★**\n\nAsk me anything — and I'll be brutally honest with you. Let's go!",
      suggestions: ["How do I start earning as a freelancer?", "How do your fees work?", "What is the Free AI Academy?"],
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [proactiveSent, setProactiveSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (userMsgCount >= 3 && !proactiveSent) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: "proactive-" + Date.now(),
          role: "assistant",
          content: "**Sawubona** — I've noticed we've been chatting but haven't locked in any action yet. 🎯\n\nWhat's *really* holding you back?\n\n• 💰 **Money** — our plans start free, R0 to sign up\n• 🧠 **Skills** — Free AI Academy, no experience needed\n• 😰 **Confidence** — 10,247 projects prove this works\n• ⏳ **Time** — 60 seconds to post your first job\n\n**Tell me the real blocker** and I'll fix it in 2 minutes. Or pick one action below and let's go *right now*.",
          actions: ["Post a Job|/post-job", "Start Free Course|/academy", "Build My Profile|/onboarding"],
          suggestions: ["I'm worried about getting my first client", "How much can I realistically earn?", "I don't know which skill to offer"],
          ts: Date.now(),
        }]);
        setProactiveSent(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [userMsgCount, proactiveSent]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = useMutation({
    mutationFn: async (msg: string) => {
      const res = await apiRequest("POST", "/api/vuma/chat", { message: msg, history: messages.slice(-10) });
      return res.json();
    },
    onMutate: (msg) => {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", content: msg, ts: Date.now() }]);
      setTyping(true);
      setInput("");
      setUserMsgCount(c => c + 1);
    },
    onSuccess: (data) => {
      setTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.answer, actions: data.actions, suggestions: data.suggestions, language: data.language, ts: Date.now() }]);
    },
    onError: () => {
      setTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Something went wrong. Please try again — Vuma never gives up! 💪", ts: Date.now() }]);
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2 overflow-x-auto">
        {[
          { label: "Projects", target: 10247, suffix: "+" },
          { label: "Youth Hired", target: 3240, suffix: "" },
          { label: "Satisfaction", target: 98, suffix: "%" },
          { label: "Avg Rating", target: 4, suffix: ".9★" },
          { label: "Freelancers", target: 4821, suffix: "" },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center min-w-fit">
            <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
              <AnimatedCounter target={s.target} suffix={s.suffix} duration={1800} />
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 whitespace-nowrap">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm" : "bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm"} px-4 py-3`}>
              {msg.role === "assistant" ? (
                <div className="text-gray-200 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.actions.map((a) => {
                    const [label, path] = a.split("|");
                    return (
                      <a key={a} href={path} data-testid={`vuma-action-${label}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-full transition-colors">
                        {label} <ArrowRight className="w-3 h-3" />
                      </a>
                    );
                  })}
                </div>
              )}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {msg.suggestions.map((s) => (
                    <button key={s} onClick={() => sendMessage.mutate(s)} data-testid={`vuma-suggestion-${s.slice(0, 20)}`}
                      className="block w-full text-left text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                      <ChevronRight className="inline w-3 h-3" /> {s}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">{new Date(msg.ts).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {["Post a job", "How do our fees work?", "How does escrow work?", "Start free course"].map(q => (
            <button key={q} onClick={() => sendMessage.mutate(q)} data-testid={`quick-q-${q.slice(0, 10)}`}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs rounded-full transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Vuma anything... (Shift+Enter for new line)"
            rows={2}
            maxLength={2000}
            data-testid="vuma-chat-input"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button onClick={handleSend} disabled={!input.trim() || sendMessage.isPending} data-testid="vuma-send-button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition-colors flex items-center gap-2">
            {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-right">{input.length}/2000</p>
      </div>
    </div>
  );
}

// ── Actions Tab ───────────────────────────────────────────────────────────────
function ActionsTab() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const colorMap: Record<string, string> = {
    emerald: "from-emerald-600/20 to-emerald-600/5 border-emerald-600/40 hover:border-emerald-500",
    blue: "from-blue-600/20 to-blue-600/5 border-blue-600/40 hover:border-blue-500",
    purple: "from-purple-600/20 to-purple-600/5 border-purple-600/40 hover:border-purple-500",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-600/40 hover:border-amber-500",
    teal: "from-teal-600/20 to-teal-600/5 border-teal-600/40 hover:border-teal-500",
    rose: "from-rose-600/20 to-rose-600/5 border-rose-600/40 hover:border-rose-500",
  };
  const iconColorMap: Record<string, string> = {
    emerald: "text-emerald-400", blue: "text-blue-400", purple: "text-purple-400",
    amber: "text-amber-400", teal: "text-teal-400", rose: "text-rose-400",
  };

  const triggerAction = async (actionId: string) => {
    setLoading(true);
    setActiveAction(actionId);
    setResult(null);
    try {
      const res = await apiRequest("POST", `/api/vuma/action/${actionId}`, {});
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, title: "Error", desc: "Something went wrong. Please try again.", stat: "", timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => { setResult(null); setActiveAction(null); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Vuma-Action</h2>
        <p className="text-sm text-gray-400">One-click access to all platform capabilities. Every action is backed by real AI and 10,000+ project data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTION_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => triggerAction(card.id)}
              disabled={loading}
              data-testid={`action-card-${card.id}`}
              className={`relative bg-gradient-to-br ${colorMap[card.color]} border rounded-2xl p-5 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && activeAction === card.id && (
                <div className="absolute inset-0 bg-gray-900/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <Icon className={`w-6 h-6 mb-3 ${iconColorMap[card.color]}`} />
              <h3 className="font-semibold text-white text-sm mb-1">{card.label}</h3>
              <p className="text-xs text-gray-400">{card.desc}</p>
              <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${iconColorMap[card.color]}`}>
                Activate <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
                )}
                <h3 className="text-xl font-bold text-white">{result.title}</h3>
              </div>
              <button onClick={dismiss} className="text-gray-500 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{result.desc}</p>
            {result.stat && (
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl px-4 py-2 mb-4">
                <p className="text-xs text-emerald-400">📊 {result.stat}</p>
              </div>
            )}
            <p className="text-xs text-gray-600 mb-4">{new Date(result.timestamp).toLocaleString()}</p>
            <button onClick={dismiss} data-testid="action-modal-close"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
              Vuma! 🔥 Continue
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Live Platform Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Projects Done", value: "10,247", icon: "✅" },
            { label: "Avg Rating", value: "4.9★", icon: "⭐" },
            { label: "Satisfaction", value: "98%", icon: "❤️" },
            { label: "Youth Hired", value: "3,240", icon: "🚀" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Memory Tab ────────────────────────────────────────────────────────────────
function MemoryTab() {
  const [memory, setMemory] = useLocalStorage<MemoryState>("vuma-memory", { goals: [], incomeTarget: "", courseProgress: [], wins: [] });
  const [newGoal, setNewGoal] = useState("");
  const [newWin, setNewWin] = useState("");
  const [saved, setSaved] = useState(false);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setMemory({ ...memory, goals: [...memory.goals, newGoal.trim()] });
    setNewGoal("");
  };

  const removeGoal = (i: number) => setMemory({ ...memory, goals: memory.goals.filter((_, idx) => idx !== i) });

  const addWin = () => {
    if (!newWin.trim()) return;
    setMemory({ ...memory, wins: [...memory.wins, `${newWin.trim()} — ${new Date().toLocaleDateString()}`] });
    setNewWin("");
  };

  const toggleCourse = (step: string) => {
    const has = memory.courseProgress.includes(step);
    setMemory({ ...memory, courseProgress: has ? memory.courseProgress.filter(s => s !== step) : [...memory.courseProgress, step] });
  };

  const saveToServer = async () => {
    try {
      await apiRequest("POST", "/api/vuma/memory/save", memory);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const clearAll = () => { setMemory({ goals: [], incomeTarget: "", courseProgress: [], wins: [] }); };

  const pct = Math.round((memory.courseProgress.length / COURSE_STEPS.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Vuma-Memory</h2>
        <p className="text-sm text-gray-400">Your goals, progress and wins are remembered between sessions to personalise every conversation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> Income Target</h3>
            <div className="flex gap-2">
              <input
                value={memory.incomeTarget}
                onChange={e => setMemory({ ...memory, incomeTarget: e.target.value })}
                placeholder="e.g. R25,000/month by June 2026"
                data-testid="income-target-input"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> My Goals</h3>
            <div className="flex gap-2 mb-3">
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()}
                placeholder="Add a goal..." data-testid="new-goal-input"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
              <button onClick={addGoal} data-testid="add-goal-button" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {memory.goals.length === 0 && <p className="text-sm text-gray-600">No goals yet. Add one above.</p>}
              {memory.goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-300">{g}</span>
                  <button onClick={() => removeGoal(i)} data-testid={`remove-goal-${i}`} className="text-gray-600 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-400" /> Course Progress</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-700 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
              <span className="text-xs text-purple-400 font-medium">{pct}%</span>
            </div>
            <div className="space-y-2">
              {COURSE_STEPS.map((step, i) => {
                const done = memory.courseProgress.includes(step);
                return (
                  <button key={step} onClick={() => toggleCourse(step)} data-testid={`course-step-${i}`}
                    className={`flex items-center gap-3 w-full text-left p-2 rounded-xl transition-colors ${done ? "bg-purple-600/10 border border-purple-600/30" : "hover:bg-gray-700"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? "border-purple-400 bg-purple-400" : "border-gray-600"}`}>
                      {done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${done ? "text-purple-300 line-through" : "text-gray-400"}`}>{step}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> My Wins</h3>
            <div className="flex gap-2 mb-3">
              <input value={newWin} onChange={e => setNewWin(e.target.value)} onKeyDown={e => e.key === "Enter" && addWin()}
                placeholder="e.g. Earned R3,500 on first project!" data-testid="new-win-input"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500" />
              <button onClick={addWin} data-testid="add-win-button" className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {memory.wins.length === 0 && <p className="text-sm text-gray-600">No wins yet — you're just getting started! 🔥</p>}
              {memory.wins.map((w, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-600/10 border border-amber-600/20 rounded-xl px-3 py-2">
                  <span className="text-lg flex-shrink-0">🏆</span>
                  <span className="text-xs text-amber-200">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={saveToServer} data-testid="save-memory-button"
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${saved ? "bg-emerald-700 text-emerald-200" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
          {saved ? "✅ Saved!" : "Save Memory to Cloud"}
        </button>
        <button onClick={clearAll} data-testid="clear-memory-button"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl text-sm transition-colors">
          Clear All
        </button>
      </div>
    </div>
  );
}

// ── Viral Tab ─────────────────────────────────────────────────────────────────
function ViralTab() {
  const [skill, setSkill] = useState("");
  const [amount, setAmount] = useState("");
  const [winName, setWinName] = useState("");
  const [caption, setCaption] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<{ referralCode: string; referralUrl: string; signups: number; clicks: number; creditsEarned: number; reward: string } | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);

  const generateWin = async () => {
    setGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/vuma/viral/share-win", { skill: skill || "Freelancing", amount: amount || "R5,000", name: winName || "Freelancer" });
      const data = await res.json();
      setCaption(data.caption);
      setWhatsappUrl(data.whatsappUrl);
    } catch {} finally { setGenerating(false); }
  };

  const generateReferral = async () => {
    setLoadingRef(true);
    try {
      const res = await apiRequest("POST", "/api/vuma/viral/referral", {});
      setReferralData(await res.json());
    } catch {} finally { setLoadingRef(false); }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Vuma-Viral</h2>
        <p className="text-sm text-gray-400">Turn every win into growth. Share your earnings, attract referrals, and build a movement.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Share2 className="w-4 h-4 text-emerald-400" /> Share My Win</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Your Skill</label>
            <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. Web Developer"
              data-testid="share-win-skill" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount Earned</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. R12,500"
              data-testid="share-win-amount" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Your Name (optional)</label>
            <input value={winName} onChange={e => setWinName(e.target.value)} placeholder="e.g. Thabo M."
              data-testid="share-win-name" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <button onClick={generateWin} disabled={generating} data-testid="generate-win-button"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate My Win Post
        </button>

        {caption && (
          <div className="mt-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-line mb-3">{caption}</div>
            <div className="flex gap-2">
              <button onClick={copyCaption} data-testid="copy-caption-button"
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${copied ? "bg-emerald-700 text-emerald-200" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy"}
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-share-link"
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Share on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Gift className="w-4 h-4 text-purple-400" /> Referral Program</h3>
        <p className="text-sm text-gray-400 mb-4">Earn <span className="text-purple-400 font-medium">R100 + 1 month Pro</span> for every person you sign up. No cap.</p>

        {!referralData ? (
          <button onClick={generateReferral} disabled={loadingRef} data-testid="generate-referral-button"
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loadingRef ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            Generate My Referral Link
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-purple-600/30 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Your referral link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-purple-300 break-all">{referralData.referralUrl}</code>
                <button onClick={() => { navigator.clipboard.writeText(referralData.referralUrl); }} data-testid="copy-referral-link"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Clicks", value: referralData.clicks },
                { label: "Sign-ups", value: referralData.signups },
                { label: "Credits", value: `R${referralData.creditsEarned}` },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 rounded-xl py-3">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 text-center">Reward: {referralData.reward}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { platform: "WhatsApp Status", icon: "📱", tip: "Post your win as a WhatsApp status — gets seen by 200+ contacts" },
          { platform: "LinkedIn Post", icon: "💼", tip: "Add '#FreelanceSkills #AfricaWorks' for algorithm boost" },
          { platform: "TikTok / Reels", icon: "🎥", tip: "Film a 30-second 'How I earned R10k on FreelanceSkills' video" },
        ].map(p => (
          <div key={p.platform} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
            <p className="text-2xl mb-2">{p.icon}</p>
            <p className="text-sm font-medium text-white mb-1">{p.platform}</p>
            <p className="text-xs text-gray-500">{p.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data, isLoading } = useQuery<AnalyticsDashboard>({
    queryKey: ["vuma-analytics"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/vuma/analytics/dashboard"); return r.json(); },
    staleTime: 60000,
  });

  if (isLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>;
  if (!data) return <p className="text-gray-500">Failed to load analytics.</p>;

  const { overview, revenueHistory, topSkills, conversionFunnel, geoDist } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Vuma-Analytics</h2>
        <p className="text-sm text-gray-400">Live platform intelligence. Real numbers, real impact.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Projects", value: overview.totalProjects.toLocaleString(), icon: "✅", color: "emerald" },
          { label: "Rating", value: `${overview.avgRating}★`, icon: "⭐", color: "amber" },
          { label: "Satisfaction", value: `${overview.satisfaction}%`, icon: "❤️", color: "rose" },
          { label: "Freelancers", value: overview.activeFreelancers.toLocaleString(), icon: "👤", color: "blue" },
          { label: "Total Earned", value: formatRand(overview.totalEarnings), icon: "💰", color: "emerald" },
          { label: "Youth Hired", value: overview.youthEmployed.toLocaleString(), icon: "🚀", color: "purple" },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-base font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Growth (R)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: any) => [`R${(v / 1000000).toFixed(2)}M`, "Revenue"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={conversionFunnel} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="stage" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [v.toLocaleString(), "Users"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {conversionFunnel.map((_, i) => <Cell key={i} fill={`hsl(${160 + i * 20}, 70%, ${55 - i * 5}%)`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" /> Top Skills — Demand vs Supply</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 10, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="skill" stroke="#6b7280" tick={{ fontSize: 10 }} width={75} />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="demand" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Demand" />
              <Bar dataKey="supply" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Supply" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-amber-400" /> Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={geoDist} dataKey="pct" nameKey="region" cx="50%" cy="50%" outerRadius={75} label={({ region, pct }) => `${region} ${pct}%`} labelLine={{ stroke: "#6b7280" }}>
                {geoDist.map((_, i) => <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-2xl p-5">
        <h3 className="font-semibold text-emerald-400 mb-2">📊 Founder's Weekly Insight</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Platform growth is accelerating. The biggest skill gap is in <strong>Electrical Trades</strong> — 73% demand vs 48% supply. This is exactly where FreelanceSkills' township-first strategy wins. 
          Youth employment numbers are tracking ahead of PYEI targets. Vuma AI is handling 87% of support queries autonomously.
        </p>
      </div>
    </div>
  );
}

// ── Future Tab ────────────────────────────────────────────────────────────────
function FutureTab() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState("");
  const [agentResult, setAgentResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  const SUB_AGENTS = [
    { id: "profile-optimizer", label: "ProfileOptimizer", icon: Users, color: "blue", desc: "Paste your profile bio & skills → get a rewritten bio, missing keywords, and pricing recommendation.", placeholder: "Paste your current profile bio and list of skills here..." },
    { id: "bid-strategist", label: "BidStrategist", icon: Target, color: "amber", desc: "Paste a job description → get a full winning proposal draft with pricing range.", placeholder: "Paste the job description you want to bid on here..." },
    { id: "course-coach", label: "CourseCoach", icon: BookOpen, color: "purple", desc: "Name a skill you want to learn → get a 5-step personalised learning path.", placeholder: "e.g. I want to learn Python data analysis for South African businesses" },
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-600/40 bg-blue-600/10 text-blue-400",
    amber: "border-amber-600/40 bg-amber-600/10 text-amber-400",
    purple: "border-purple-600/40 bg-purple-600/10 text-purple-400",
  };

  const runAgent = async () => {
    if (!selectedAgent || !agentInput.trim()) return;
    setLoading(true);
    setAgentResult("");
    try {
      const res = await apiRequest("POST", `/api/vuma/future/${selectedAgent}`, { input: agentInput });
      const data = await res.json();
      setAgentResult(data.result || data.error || "No result.");
    } catch { setAgentResult("Sub-agent error. Please try again."); } finally { setLoading(false); }
  };

  const active = SUB_AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Vuma-Future</h2>
        <p className="text-sm text-gray-400">AI sub-agents, language intelligence, and tomorrow's features being built today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUB_AGENTS.map(agent => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;
          return (
            <button key={agent.id} onClick={() => { setSelectedAgent(agent.id); setAgentInput(""); setAgentResult(""); }}
              data-testid={`agent-card-${agent.id}`}
              className={`border rounded-2xl p-4 text-left transition-all hover:scale-[1.02] ${isSelected ? colorMap[agent.color] + " ring-2 ring-offset-0 ring-offset-gray-900 ring-" + agent.color + "-500" : "border-gray-700 bg-gray-800/50 hover:border-gray-600"}`}>
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? "" : "text-gray-400"}`} />
              <p className={`font-semibold text-sm mb-1 ${isSelected ? "text-white" : "text-gray-300"}`}>{agent.label}</p>
              <p className={`text-xs ${isSelected ? "text-gray-300" : "text-gray-500"}`}>{agent.desc}</p>
            </button>
          );
        })}
      </div>

      {selectedAgent && active && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <active.icon className="w-4 h-4 text-gray-400" /> {active.label}
          </h3>
          <textarea
            value={agentInput}
            onChange={e => setAgentInput(e.target.value)}
            placeholder={active.placeholder}
            rows={5}
            data-testid="agent-input"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500 mb-3"
          />
          <button onClick={runAgent} disabled={loading || !agentInput.trim()} data-testid="run-agent-button"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running {active.label}...</> : <><Cpu className="w-4 h-4" /> Run {active.label}</>}
          </button>
          {agentResult && (
            <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-emerald-400 font-medium mb-2">{active.label} Result:</p>
              <div className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(agentResult) }} />
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> Language Switcher</h3>
        <p className="text-sm text-gray-400 mb-4">Vuma speaks 8 African and global languages. Select your preference — full multilingual support launching Q3 2026.</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)} data-testid={`lang-${lang}`}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${language === lang ? "bg-emerald-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`}>
              {lang}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">Current: <span className="text-emerald-400">{language}</span> — Vuma will adapt its replies to your selected language.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Voice Input", icon: Mic, desc: "Browser SpeechRecognition integration — speak your query", status: "Coming Q2 2026", color: "blue" },
          { label: "Offline PWA", icon: Globe, desc: "Use Vuma without internet via service worker caching", status: "Coming Q3 2026", color: "purple" },
          { label: "Gov Tender AI", icon: FileText, desc: "Scan government procurement portals for relevant tenders", status: "Coming Q3 2026", color: "amber" },
          { label: "WhatsApp Bot", icon: MessageSquare, desc: "Full Vuma capabilities via WhatsApp Business API", status: "Coming Q4 2026", color: "emerald" },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{f.label}</p>
                <p className="text-xs text-gray-500 mb-1">{f.desc}</p>
                <span className="text-xs text-amber-400 bg-amber-600/10 border border-amber-600/20 px-2 py-0.5 rounded-full">{f.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VumaUltimate() {
  const [activeTab, setActiveTab] = useState("chat");

  const tabColorMap: Record<string, string> = {
    chat: "bg-emerald-600",
    actions: "bg-blue-600",
    memory: "bg-purple-600",
    viral: "bg-rose-600",
    analytics: "bg-amber-600",
    future: "bg-teal-600",
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <POPIAModal />
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vuma-ULTIMATE</h1>
              <p className="text-sm text-gray-400">FreelanceSkills.net · 5-in-1 Super-Agent · Africa's #1 Freelance AI</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <a href="/vuma-live" data-testid="link-war-room"
                className="hidden sm:flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 rounded-full px-3 py-1.5 transition-colors">
                <Activity className="w-3 h-3" /> War Room
              </a>
              <span className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live · 10,247 projects · 4.9★
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${isActive ? `${tabColorMap[tab.id]} text-white shadow-lg` : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 min-h-[500px]">
          {activeTab === "chat" && <ChatTab />}
          {activeTab === "actions" && <ActionsTab />}
          {activeTab === "memory" && <MemoryTab />}
          {activeTab === "viral" && <ViralTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "future" && <FutureTab />}
        </div>

        <div className="mt-4 text-center text-xs text-gray-700">
          CIPC 2026/070509/09 · Bernet Msiza · Daveyton → Africa → World · "Vuma!" means It works! in Zulu
        </div>
      </div>

      <Footer />
    </div>
  );
}

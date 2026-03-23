import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Send, Sparkles, RefreshCw, ChevronRight, Zap, Users, BookOpen, TrendingUp, MessageSquare, Globe, Shield, Star, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  suggestions?: string[];
  language?: string;
  ts: number;
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
    .replace(/^• (.+)$/gm, "<span class='block pl-3 before:content-[\"•\"] before:pr-2 before:text-emerald-400'>$1</span>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

const QUICK_ACTIONS = [
  { label: "Post a Job", path: "/post-job", icon: Zap, color: "emerald" },
  { label: "Build My Profile", path: "/onboarding", icon: Users, color: "blue" },
  { label: "Start AI Course", path: "/academy", icon: BookOpen, color: "purple" },
  { label: "See Impact", path: "/impact", icon: TrendingUp, color: "amber" },
  { label: "Browse Talent", path: "/freelancers", icon: Star, color: "rose" },
  { label: "Pricing", path: "/pricing", icon: Shield, color: "teal" },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  amber: "bg-amber-500 hover:bg-amber-600 text-white",
  rose: "bg-rose-600 hover:bg-rose-700 text-white",
  teal: "bg-teal-600 hover:bg-teal-700 text-white",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, onSuggestion }: { msg: Message; onSuggestion: (s: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/30">
          <span className="text-white font-bold text-sm">V</span>
        </div>
      )}
      <div className={`max-w-[78%] space-y-2`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-600 text-white rounded-tr-sm"
            : "bg-gray-800 border border-gray-700/60 text-gray-200 rounded-tl-sm"
        }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
          )}
        </div>
        {!isUser && msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.actions.map((a: string) => {
              const [label, path] = a.split("|");
              return (
                <a key={a} href={path || "#"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/80 hover:bg-gray-700 border border-gray-600/60 text-xs text-emerald-300 rounded-full transition-colors">
                  {label}<ArrowRight size={10} />
                </a>
              );
            })}
          </div>
        )}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {msg.suggestions.map((s: string) => (
              <button key={s} onClick={() => onSuggestion(s)}
                className="text-left text-xs text-gray-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors group">
                <ChevronRight size={10} className="text-emerald-600 group-hover:text-emerald-400" />
                {s}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-600 px-1">{new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      {isUser && (
        <div className="w-9 h-9 rounded-2xl bg-gray-700 flex items-center justify-center shrink-0">
          <span className="text-gray-300 font-bold text-sm">You</span>
        </div>
      )}
    </div>
  );
}

export default function Vuma() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "**Sawubona! 🌍 I'm Vuma** — the official AI Agent of FreelanceSkills.net.\n\nMy name means *\"It works!\"* in Zulu — because that's exactly what we're here to make happen for you.\n\nI'm not a generic chatbot. I'm a first-principles thinking machine with one mission: **connect every skilled African with dignified work in under 60 seconds.**\n\nAsk me anything — from posting a job to understanding our fees, comparing us to Upwork, or getting your profile ready to earn. **Vuma!** 💪",
      actions: ["Post a Job|/post-job", "Build My Profile|/onboarding", "Start AI Course|/academy"],
      suggestions: [
        "How are you different from Upwork and Fiverr?",
        "How does the payment protection work?",
        "How do I get my first client?",
      ],
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const { data: faqData } = useQuery({
    queryKey: ["/api/vuma/faqs"],
    queryFn: () => fetch("/api/vuma/faqs").then(r => r.json()),
    staleTime: Infinity,
  });

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg, ts: Date.now() };
    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const r = await fetch("/api/vuma/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await r.json();
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I couldn't process that. Please try again.",
        actions: data.actions || [],
        suggestions: data.suggestions || [],
        language: data.language || "en",
        ts: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Connection error — but we never quit! Check your internet and try again. **Vuma!** 🔥",
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: "Fresh start! **Sawubona again** 👋 — what can Vuma help you with today?",
      suggestions: ["How do I post a job?", "What are your fees?", "How does escrow work?"],
      ts: Date.now(),
    }]);
  }

  const faqs: { q: string; category: string }[] = faqData?.faqs || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-r from-gray-950 via-emerald-950/30 to-gray-950 border-b border-gray-800 px-4 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-900/40">
                  <span className="text-2xl font-black text-white">V</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-gray-950 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  Vuma AI Agent
                  <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 text-xs font-medium rounded-full border border-emerald-800/50">LIVE</span>
                </h1>
                <p className="text-sm text-gray-400">FreelanceSkills.net Official AI — <span className="text-emerald-400 font-medium">Ending Youth Unemployment in Africa</span></p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Globe size={10} className="text-emerald-500" />Zulu · Xhosa · Afrikaans · English</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Shield size={10} className="text-blue-500" />CIPC 2026/070509/09</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-center">
              {[
                { label: "Completed Projects", value: "10,000+" },
                { label: "Avg Rating", value: "4.9/5" },
                { label: "Satisfaction", value: "98%" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-emerald-400">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1 shrink-0">Quick actions:</span>
            {QUICK_ACTIONS.map(a => (
              <a key={a.label} href={a.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${COLOR_MAP[a.color]}`}
                data-testid={`button-vuma-${a.label.replace(/\s+/g, "-").toLowerCase()}`}>
                <a.icon size={11} />{a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex max-w-6xl w-full mx-auto gap-0 md:gap-6 px-0 md:px-4 py-0 md:py-6 min-h-0">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-4">
            {/* About */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles size={11} className="text-emerald-400" />About Vuma
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Built by <strong className="text-white">Bernet Msiza</strong>, Daveyton engineer turned platform founder.
                "I didn't leave engineering — I upgraded the biggest machine: <em>Africa's workforce.</em>"
              </p>
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-1.5">
                {[
                  { label: "Fees vs Upwork", val: "0–5% vs 10–20%" },
                  { label: "Languages", val: "4 African + English" },
                  { label: "Payment methods", val: "M-Pesa, MoMo, Ozow" },
                  { label: "Upskilling", val: "Free AI Academy" },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="text-emerald-400 font-medium">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare size={11} className="text-blue-400" />Suggested Questions
              </h3>
              <div className="space-y-1 overflow-y-auto flex-1">
                {faqs.map((f, i) => (
                  <button key={i} data-testid={`button-faq-${i}`}
                    onClick={() => sendMessage(f.q)}
                    className="w-full text-left text-xs text-gray-400 hover:text-emerald-300 py-2 px-2 rounded-lg hover:bg-gray-800/60 transition-colors flex items-start gap-2 group">
                    <ChevronRight size={10} className="text-gray-600 group-hover:text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f.q}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-gray-900 md:rounded-2xl md:border md:border-gray-800 overflow-hidden min-h-0 shadow-2xl">
            {/* Chat topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-300">Vuma is online</span>
                <span className="text-xs text-gray-600">— thinking at 400% capacity</span>
              </div>
              <button onClick={clearChat} data-testid="button-clear-chat"
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-gray-800">
                <RefreshCw size={11} />New chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" data-testid="div-chat-messages">
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} onSuggestion={sendMessage} />
              ))}
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <div className="bg-gray-800 border border-gray-700/60 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Mobile quick FAQs */}
            <div className="lg:hidden px-4 py-2 border-t border-gray-800 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {["How do I post a job?", "What are your fees?", "How does escrow work?", "Is there a free plan?"].map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="shrink-0 text-xs text-gray-400 hover:text-emerald-300 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-gray-800 shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-emerald-600 transition-colors">
                  <textarea
                    ref={inputRef}
                    data-testid="input-vuma-message"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Vuma anything — jobs, fees, escrow, courses, Africa focus…"
                    rows={1}
                    className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none resize-none max-h-32"
                    style={{ lineHeight: "1.5" }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Shift+Enter for new line · Enter to send</span>
                    <span className="text-xs text-gray-600">{input.length}/2000</span>
                  </div>
                </div>
                <button
                  data-testid="button-send-message"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-emerald-900/30 shrink-0">
                  <Send size={18} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Vuma may make mistakes. For urgent matters contact{" "}
                <a href="mailto:support@freelanceskills.net" className="text-emerald-500 hover:text-emerald-400">support@freelanceskills.net</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

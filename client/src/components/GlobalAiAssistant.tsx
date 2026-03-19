/**
 * GlobalAiAssistant — Floating AI chat widget
 * Understands ALL 33 admin departments. Powered by GPT-4o-mini.
 * Accessible from any admin page via the floating button (bottom-right).
 */

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, RefreshCw, Sparkles, ChevronRight, Zap } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; category?: string; actions?: string[]; related?: string[]; urgency?: string; }

const QUICK_PROMPTS = [
  "Summarise today's platform health",
  "What DSRs need attention?",
  "Show Africa readiness score",
  "Generate investor highlights",
  "Any active breach incidents?",
];

export default function GlobalAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "I'm your Mission Control AI — I have full context on all 33 departments. Ask me anything about users, compliance, performance, Africa metrics, or request a report.", category: "welcome" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/mission-control/ai-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, history: history.slice(0, -1) }) });
      const data = await r.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer || "I couldn't process that. Try again.", category: data.category, actions: data.actionableSteps, related: data.relatedDepts, urgency: data.urgency }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]); }
    setLoading(false);
  }

  const urgencyColor: Record<string, string> = { high: "border-red-800/40 bg-red-950/20", medium: "border-yellow-800/40 bg-yellow-950/20", low: "border-gray-800 bg-gray-900/60" };

  return (
    <>
      {/* Floating button */}
      <button
        data-testid="button-ai-assistant-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        {!open && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-gray-950" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 md:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/60 to-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-800">
            <div className="w-7 h-7 bg-emerald-600/30 border border-emerald-600/40 rounded-full flex items-center justify-center">
              <Bot size={13} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">Mission Control AI</p>
              <p className="text-xs text-gray-500">33 departments · GPT-4o-mini</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          </div>

          {/* Quick prompts (when no user messages yet) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-b border-gray-800">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="space-y-1">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)} className="w-full text-left flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800/60 hover:bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-gray-300 transition-colors">
                    <Zap size={9} className="text-emerald-500 shrink-0" />{p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <div className="w-5 h-5 bg-emerald-900/40 border border-emerald-700/30 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Bot size={10} className="text-emerald-400" /></div>}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.role === "user" ? "bg-emerald-900/40 text-gray-200 rounded-br-none" : "bg-gray-800 text-gray-300 rounded-bl-none"}`}>
                  <p className="leading-relaxed">{m.content}</p>
                  {m.urgency && m.urgency !== "low" && <p className={`mt-1 text-xs ${m.urgency === "high" ? "text-red-400" : "text-yellow-400"}`}>Priority: {m.urgency}</p>}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {m.actions.map((a, j) => <div key={j} className="flex items-start gap-1"><ChevronRight size={9} className="text-emerald-500 mt-0.5 shrink-0" /><span className="text-emerald-400">{a}</span></div>)}
                    </div>
                  )}
                  {m.related && m.related.length > 0 && <p className="mt-1.5 text-gray-600">Related: {m.related.join(", ")}</p>}
                </div>
              </div>
            ))}
            {loading && <div className="flex gap-2"><div className="w-5 h-5 bg-emerald-900/40 border border-emerald-700/30 rounded-full flex items-center justify-center shrink-0"><RefreshCw size={9} className="text-emerald-400 animate-spin" /></div><div className="bg-gray-800 rounded-xl px-3 py-2"><div className="flex gap-1">{[1,2,3].map(d => <div key={d} className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</div></div></div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 px-3 py-2 flex items-center gap-2">
            <input
              data-testid="input-ai-message"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about any department..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-emerald-700/60"
            />
            <button data-testid="button-ai-send" onClick={() => send()} disabled={!input.trim() || loading} className="w-8 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center disabled:opacity-40 transition-colors">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

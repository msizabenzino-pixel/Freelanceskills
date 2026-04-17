import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Send, ChevronRight, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface GeneratedBrief {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  skills: string[];
  timeline: string;
  jobType: string;
}

const PLACEHOLDERS = [
  "I need a React developer to build an e-commerce dashboard with payment integration...",
  "I need a graphic designer to create a brand identity for my Cape Town restaurant...",
  "I need a content writer to produce 10 SEO blog posts about fintech in Africa...",
  "I need a Python developer to build a data scraper for market research...",
  "I need a video editor to produce 5 promotional reels for my clothing brand...",
];

export function AIBriefGenerator({ compact = false }: { compact?: boolean }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<GeneratedBrief | null>(null);
  const [open, setOpen] = useState(false);
  const [phIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));

  async function handleGenerate() {
    const trimmed = input.trim();
    if (trimmed.length < 15) {
      toast({ title: "Describe your project", description: "Please give a bit more detail (15+ characters).", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-brief", { description: trimmed });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate brief");
      setBrief(data);
      setOpen(true);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handlePostJob() {
    if (!brief) return;
    const params = new URLSearchParams({
      title: brief.title,
      description: brief.description,
      budgetMin: String(brief.budgetMin),
      budgetMax: String(brief.budgetMax),
      skills: brief.skills.join(","),
      timeline: brief.timeline,
      jobType: brief.jobType,
    });
    navigate(`/post-job?${params.toString()}`);
    setOpen(false);
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={PLACEHOLDERS[phIndex]}
          className="flex-1 min-h-0 h-10 resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm py-2"
          data-testid="brief-input-compact"
          rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
        />
        <Button onClick={handleGenerate} disabled={loading} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold whitespace-nowrap gap-1.5" data-testid="brief-generate-compact">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate
        </Button>
        <BriefModal brief={brief} open={open} onClose={() => setOpen(false)} onPost={handlePostJob} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative bg-slate-900/80 border border-slate-700/60 rounded-2xl p-1 flex items-end gap-2 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={PLACEHOLDERS[phIndex]}
          className="flex-1 min-h-[56px] max-h-32 resize-none bg-transparent border-0 text-white placeholder:text-slate-500 text-sm sm:text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-4"
          data-testid="brief-input"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
        />
        <div className="pb-1 pr-1 flex-shrink-0">
          <Button
            onClick={handleGenerate}
            disabled={loading || input.trim().length < 5}
            className="h-12 px-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl gap-2 text-sm shadow-lg transition-all"
            data-testid="brief-generate-btn"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><Sparkles className="w-4 h-4" /> Generate Brief</>
            }
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 px-1">
        {["Web Developer", "Graphic Designer", "Content Writer", "Data Analyst", "Video Editor"].map(s => (
          <button
            key={s}
            onClick={() => setInput(`I need a ${s} to `)}
            className="text-xs text-slate-400 hover:text-emerald-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-full px-3 py-1 transition-colors"
            data-testid={`brief-suggestion-${s.toLowerCase().replace(/ /g, '-')}`}
          >
            + {s}
          </button>
        ))}
      </div>

      <BriefModal brief={brief} open={open} onClose={() => setOpen(false)} onPost={handlePostJob} />
    </div>
  );
}

function BriefModal({ brief, open, onClose, onPost }: { brief: GeneratedBrief | null; open: boolean; onClose: () => void; onPost: () => void }) {
  const { toast } = useToast();

  if (!brief) return null;

  function copyBrief() {
    const text = `${brief!.title}\n\n${brief!.description}\n\nBudget: R${brief!.budgetMin.toLocaleString()}–R${brief!.budgetMax.toLocaleString()}\nTimeline: ${brief!.timeline}\nSkills: ${brief!.skills.join(", ")}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Brief copied to clipboard." });
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white" data-testid="brief-modal">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <DialogTitle className="text-white text-lg">Your AI-Generated Brief</DialogTitle>
          </div>
          <p className="text-slate-400 text-sm">Review and customise before posting</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Job Title</p>
            <h3 className="text-lg font-bold text-white" data-testid="brief-title">{brief.title}</h3>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line" data-testid="brief-description">{brief.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Budget Range</p>
              <p className="text-emerald-400 font-bold text-lg" data-testid="brief-budget">
                R{brief.budgetMin.toLocaleString()} – R{brief.budgetMax.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Timeline</p>
              <p className="text-white font-semibold" data-testid="brief-timeline">{brief.timeline}</p>
              <p className="text-slate-500 text-xs mt-0.5">{brief.jobType}</p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2" data-testid="brief-skills">
              {brief.skills.map(s => (
                <Badge key={s} className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={copyBrief} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" data-testid="brief-copy-btn">
            <Copy className="w-4 h-4" /> Copy
          </Button>
          <Button onClick={onPost} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2" data-testid="brief-post-btn">
            <Send className="w-4 h-4" /> Post This Job
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-slate-600 text-center mt-2">
          You'll be able to edit all details before publishing · <Zap className="w-3 h-3 inline text-emerald-500" /> 10 points for using AI brief
        </p>
      </DialogContent>
    </Dialog>
  );
}

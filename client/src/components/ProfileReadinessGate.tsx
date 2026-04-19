import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, AlertCircle, ArrowRight,
  Zap, Lock, Globe, User, Briefcase, DollarSign,
  Target, Sparkles,
} from "lucide-react";

interface ReadinessItem {
  field: string;
  label: string;
  critical: boolean;
  href: string;
}

interface ReadinessData {
  ready: boolean;
  profileStatus: "none" | "empty" | "draft" | "published";
  score: number;
  nextAction: "create_profile" | "complete_profile" | "publish_profile" | "ready";
  message: string;
  missingItems: ReadinessItem[];
  completedItems: ReadinessItem[];
}

interface ProfileReadinessGateProps {
  open: boolean;
  jobTitle?: string;
  onClose: () => void;
  onReady: () => void;
}

const FIELD_ICONS: Record<string, React.ElementType> = {
  profile: User,
  title: Briefcase,
  bio: User,
  skills: Target,
  hourlyRate: DollarSign,
  location: Globe,
  category: Briefcase,
  publishedProfile: Globe,
};

function StatusBadge({ status }: { status: ReadinessData["profileStatus"] }) {
  const map = {
    none: { label: "No Profile", color: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    empty: { label: "No Profile", color: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    draft: { label: "Draft", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400 animate-pulse" },
    published: { label: "Live", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  };
  const cfg = map[status] ?? map.none;
  return (<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}</span>);
}

export function ProfileReadinessGate({ open, jobTitle, onClose, onReady }: ProfileReadinessGateProps) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useQuery<ReadinessData>({
    queryKey: ["/api/profile/check-readiness"],
    queryFn: async () => {
      const res = await fetch("/api/profile/check-readiness", { credentials: "include" });
      if (!res.ok) throw new Error("Could not check profile status");
      return res.json();
    },
    enabled: open,
    staleTime: 30_000,
    retry: 1,
  });
  if (data?.ready && open) { onReady(); return null; }
  const score = data?.score ?? 0;
  const missing = data?.missingItems ?? [];
  const completed = data?.completedItems ?? [];
  const criticalMissing = missing.filter((m) => m.critical);
  const status = data?.profileStatus ?? "none";
  const nextAction = data?.nextAction ?? "create_profile";
  const goToProfile = () => { onClose(); navigate("/cv-upload"); };
  const publishProfile = async () => {
    try {
      const res = await fetch("/api/profile/publish", { method: "POST", credentials: "include" });
      if (res.ok) { onClose(); setTimeout(onReady, 300); }
      else goToProfile();
    } catch { goToProfile(); }
  };
  return (<Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}><DialogContent className="max-w-lg bg-slate-950 border border-slate-800 text-foreground p-0 overflow-hidden"><div className="px-6 pt-6 pb-4 border-b border-slate-800 bg-slate-900/50"><DialogHeader><DialogTitle className="text-lg font-bold text-white flex items-center gap-2"><Lock className="w-5 h-5 text-amber-400" />{jobTitle ? `Apply to "${jobTitle}"` : "Unlock Job Applications"}</DialogTitle></DialogHeader><div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2"><StatusBadge status={status} /><span className="text-xs text-muted-foreground">profile status</span></div><span className="text-xs font-semibold text-slate-400">{score}% complete</span></div><Progress value={isLoading ? undefined : score} className="h-2 mt-2 bg-slate-800" /></div><div className="px-6 py-5 space-y-5">{isLoading ? <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground"><Sparkles className="w-5 h-5 animate-pulse text-emerald-500" /><span className="text-sm">Checking your profile…</span></div> : <><div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"><AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" /><p className="text-sm text-amber-200 leading-relaxed">{data?.message}</p></div>{criticalMissing.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required to apply ({criticalMissing.length} remaining)</p><div className="space-y-1.5">{criticalMissing.map((item) => { const Icon = FIELD_ICONS[item.field] ?? AlertCircle; return (<div key={item.field} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15"><XCircle className="w-4 h-4 text-red-400 shrink-0" /><Icon className="w-4 h-4 text-red-300/60 shrink-0" /><span className="text-sm text-red-200">{item.label}</span><Badge variant="outline" className="ml-auto text-[10px] border-red-500/20 text-red-400">Required</Badge></div>); })}</div></div>}{missing.filter((m) => !m.critical).length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boosts your application</p><div className="space-y-1.5">{missing.filter((m) => !m.critical).map((item) => { const Icon = FIELD_ICONS[item.field] ?? AlertCircle; return (<div key={item.field} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50"><AlertCircle className="w-4 h-4 text-slate-500 shrink-0" /><Icon className="w-4 h-4 text-slate-500/60 shrink-0" /><span className="text-sm text-slate-400">{item.label}</span><Badge variant="outline" className="ml-auto text-[10px] border-slate-600 text-slate-500">Optional</Badge></div>); })}</div></div>}{completed.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-emerald-500/70 uppercase tracking-wider">Already done ✓</p><div className="flex flex-wrap gap-2">{completed.map((item) => (<div key={item.field} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400"><CheckCircle2 className="w-3 h-3" />{item.label}</div>))}</div></div>}</>}</div><div className="px-6 pb-6 space-y-2">{nextAction === "publish_profile" ? <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2" onClick={publishProfile} data-testid="btn-publish-now"><Globe className="w-4 h-4" />Publish Profile Now — Unlock Applications<ArrowRight className="w-4 h-4" /></Button> : <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2" onClick={goToProfile} data-testid="btn-complete-profile"><Zap className="w-4 h-4" />Complete Profile with AI — 60 seconds<ArrowRight className="w-4 h-4" /></Button>}<Button variant="ghost" className="w-full h-9 text-sm text-muted-foreground hover:text-foreground" onClick={onClose} data-testid="btn-cancel-gate">Cancel</Button></div></DialogContent></Dialog>);
}

export function useReadiness(enabled: boolean) {
  return useQuery<ReadinessData>({
    queryKey: ["/api/profile/check-readiness"],
    queryFn: async () => {
      const res = await fetch("/api/profile/check-readiness", { credentials: "include" });
      if (!res.ok) throw new Error("Could not check profile status");
      return res.json();
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}

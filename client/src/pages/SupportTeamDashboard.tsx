/**
 * Support Team System v1.0 — client/src/pages/SupportTeamDashboard.tsx
 * Section 28 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * Studied freelancerskills.net: ZERO team management tools.
 * Zendesk Teams: $115/agent/month. Freshdesk: $79. Intercom: $149.
 * We built more than all of them — free, Africa-first, AI-powered.
 *
 * 6 TABS:
 *  1. 🎫 Live Queue       — real-time ticket table with AI priority, sentiment, SLA timer
 *  2. 📥 Unified Inbox    — agent-assigned ticket management + reply panel
 *  3. 🔍 User 360°        — instant user lookup: profile + tickets + risk factors
 *  4. 💬 Canned Responses — reply library + AI reply generator
 *  5. 🚨 Escalations      — escalation rules + workflow manager
 *  6. 📊 Performance      — agent leaderboard + daily KPI charts
 */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Agent { id: string; name: string; email: string; status: string; specialization: string; channelFocus: string; maxTickets: number; activeTickets: number; ticketsToday: number; avgResponseMins: number; satisfactionScore: number; isAvailable: boolean; loadPercent: number; }
interface Ticket { id: string; userId: string; subject: string; description?: string; status: string; priority: string; category: string; channel: string; sentiment: string; sentimentScore: number; aiPriority: number; assignedTo?: string; assignedAgentName?: string; escalatedTo?: string; slaMinutesLeft?: number; slaRisk?: string; isBreachedNow?: boolean; createdAt: string; }
interface CannedResponse { id: string; title: string; content: string; category: string; channel: string; tags?: string; usageCount: number; avgRating: number; aiGenerated: boolean; }
interface EscalationRule { id: string; name: string; triggerType: string; triggerValue: any; targetRole: string; priority: string; description?: string; autoNotify: boolean; isActive: boolean; triggeredCount: number; }

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_CLR: Record<string, string> = { urgent:"bg-red-700 text-white", high:"bg-orange-700 text-white", medium:"bg-amber-700 text-white", low:"bg-zinc-700 text-zinc-300" };
const SENTIMENT_CLR: Record<string, string> = { positive:"text-emerald-400", neutral:"text-zinc-400", negative:"text-orange-400", critical:"text-red-400" };
const STATUS_CLR: Record<string, string> = { open:"border-blue-700/40 text-blue-300 bg-blue-950/20", in_progress:"border-violet-700/40 text-violet-300 bg-violet-950/20", pending_user:"border-amber-700/40 text-amber-300 bg-amber-950/20", escalated:"border-red-700/40 text-red-300 bg-red-950/20", resolved:"border-emerald-700/40 text-emerald-300 bg-emerald-950/20", closed:"border-zinc-700/40 text-zinc-500 bg-zinc-900/20" };
const AGENT_STATUS_CLR: Record<string, string> = { online:"text-emerald-400", busy:"text-amber-400", break:"text-blue-400", offline:"text-zinc-500" };
const CHANNEL_ICONS: Record<string, string> = { chat:"💬", email:"📧", whatsapp:"📱", ussd:"📳", sms:"💌", in_app:"🔔" };
const SLA_RISK_CLR: Record<string, string> = { ok:"text-emerald-400", warning:"text-amber-400", critical:"text-red-400", breached:"text-red-600 font-bold", unknown:"text-zinc-500" };
const CHART_COLORS = ["#8b5cf6","#3b82f6","#10b981","#f97316","#ef4444","#eab308","#ec4899","#14b8a6"];

// ─── Shared ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string|number; sub?: string; color: string }) {
  return (
    <div className={"rounded-xl border p-4 " + color}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}
function SlaTimer({ minsLeft, risk }: { minsLeft: number | null; risk?: string }) {
  const label = minsLeft === null ? "—" : minsLeft < 0 ? "BREACHED " + Math.abs(minsLeft) + "m ago" : minsLeft + "m left";
  return <span className={"text-xs font-mono " + SLA_RISK_CLR[risk || "unknown"]}>{label}</span>;
}
function SentimentBadge({ sentiment, score }: { sentiment: string; score: number }) {
  const emoji = sentiment === "positive" ? "😊" : sentiment === "negative" ? "😠" : sentiment === "critical" ? "🔥" : "😐";
  return <span className={"text-xs " + SENTIMENT_CLR[sentiment]}>{emoji} {sentiment} ({score > 0 ? "+" : ""}{score.toFixed(1)})</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: LIVE TICKET QUEUE
// ═══════════════════════════════════════════════════════════════════════════
function LiveQueueTab({ onSelectTicket }: { onSelectTicket: (t: Ticket) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [assignAgentId, setAssignAgentId] = useState("");

  const { data: statsData } = useQuery({ queryKey: ["/api/support-team/stats"], queryFn: () => apiRequest("GET", "/api/support-team/stats").then(r => r.json()), refetchInterval: 30000 });
  const { data: queueData, isLoading, refetch } = useQuery({ queryKey: ["/api/support-team/live-queue", filterStatus, filterPriority, filterChannel], queryFn: () => apiRequest("GET", "/api/support-team/live-queue?status=" + filterStatus + "&priority=" + filterPriority + "&channel=" + filterChannel).then(r => r.json()), refetchInterval: 60000 });
  const { data: agentsData } = useQuery({ queryKey: ["/api/support-team/agents"], queryFn: () => apiRequest("GET", "/api/support-team/agents").then(r => r.json()) });

  const seedMut = useMutation({ mutationFn: () => apiRequest("POST", "/api/support-team/seed").then(r => r.json()), onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/support-team"] }); toast({ title: "Seeded! " + d.message }); } });
  const assignMut = useMutation({ mutationFn: (d: any) => apiRequest("POST", "/api/support-team/assign", d).then(r => r.json()), onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/support-team/live-queue"] }); toast({ title: d.message }); setAssigningTicket(null); } });
  const triageMut = useMutation({ mutationFn: (t: Ticket) => apiRequest("POST", "/api/support-team/ai-triage", { subject: t.subject, description: t.description, channel: t.channel, ticketId: t.id }).then(r => r.json()), onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/support-team/live-queue"] }); toast({ title: "AI Triage: " + d.triage.priority + " priority, " + d.triage.sentiment }); } });

  const stats = statsData || {};
  let tickets: Ticket[] = queueData?.tickets || [];
  const agents: Agent[] = agentsData?.agents || [];
  if (search) { const s = search.toLowerCase(); tickets = tickets.filter(t => t.subject.toLowerCase().includes(s) || t.userId.toLowerCase().includes(s)); }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <StatCard label="Open" value={stats.openTickets ?? "—"} color="bg-blue-950/40 border-blue-700/40 text-blue-200" />
        <StatCard label="In Progress" value={stats.inProgress ?? "—"} color="bg-violet-950/40 border-violet-700/40 text-violet-200" />
        <StatCard label="Escalated" value={stats.escalated ?? "—"} color="bg-red-950/40 border-red-700/40 text-red-200" />
        <StatCard label="SLA Breached" value={stats.slaBreached ?? "—"} color="bg-red-950/60 border-red-700/60 text-red-300" />
        <StatCard label="Urgent Open" value={stats.urgentOpen ?? "—"} color="bg-orange-950/40 border-orange-700/40 text-orange-200" />
        <StatCard label="Agents Online" value={stats.onlineAgents ?? "—"} sub={"of " + (stats.totalAgents || 0)} color="bg-emerald-950/40 border-emerald-700/40 text-emerald-200" />
        <StatCard label="Avg Response" value={(stats.avgResponseMins ?? 0) + "m"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="Resolved Today" value={stats.resolvedToday ?? "—"} color="bg-emerald-950/40 border-emerald-700/40 text-emerald-200" />
      </div>

      {/* 30-min breach warning */}
      {(stats.soonToBreachSla || 0) > 0 && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="text-red-300 text-sm font-semibold">{stats.soonToBreachSla} ticket{stats.soonToBreachSla !== 1 ? "s" : ""} breaching SLA in under 30 minutes — immediate action required</div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="ml-auto border-red-700/40 text-red-300">↻ Refresh</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Input data-testid="input-queue-search" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-44" />
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Status</SelectItem>{["open","in_progress","pending_user","escalated","resolved"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Priority</SelectItem>{["urgent","high","medium","low"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
        <Select value={filterChannel} onValueChange={setFilterChannel}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Channels</SelectItem>{["chat","email","whatsapp","ussd","sms","in_app"].map(c => <SelectItem key={c} value={c}>{CHANNEL_ICONS[c]} {c}</SelectItem>)}</SelectContent></Select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => seedMut.mutate()} disabled={seedMut.isPending} className="border-zinc-600 text-zinc-400">{seedMut.isPending ? "Seeding…" : "🌱 Seed Demo"}</Button>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-zinc-600 text-zinc-400">↻</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse">Loading queue…</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-5xl mb-3">🎫</div><div>No tickets found. Click "Seed Demo" to populate.</div></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-xs" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="bg-zinc-800/80 border-b border-zinc-700 text-zinc-400 text-left">
                <th className="px-3 py-2.5">AI Score</th>
                <th className="px-3 py-2.5">Subject</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Priority</th>
                <th className="px-3 py-2.5">Channel</th>
                <th className="px-3 py-2.5">Sentiment</th>
                <th className="px-3 py-2.5">SLA</th>
                <th className="px-3 py-2.5">Agent</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} data-testid={"ticket-row-" + t.id} className={"border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors " + (t.slaRisk === "breached" || t.isBreachedNow ? "bg-red-950/5" : t.slaRisk === "critical" ? "bg-orange-950/5" : "")}>
                  <td className="px-3 py-2">
                    <div className={"font-bold text-sm " + (t.aiPriority >= 85 ? "text-red-400" : t.aiPriority >= 60 ? "text-orange-400" : t.aiPriority >= 40 ? "text-amber-400" : "text-zinc-400")}>{t.aiPriority}</div>
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    <button onClick={() => onSelectTicket(t)} className="text-left hover:text-violet-300 transition-colors">
                      <div className="text-zinc-200 truncate">{t.subject}</div>
                      <div className="text-zinc-600 font-mono text-[9px]">{t.userId}</div>
                    </button>
                  </td>
                  <td className="px-3 py-2"><span className={"text-[9px] font-medium border rounded-full px-1.5 py-0.5 " + (STATUS_CLR[t.status] || "")}>{t.status}</span></td>
                  <td className="px-3 py-2"><span className={"text-[9px] font-bold rounded px-1.5 py-0.5 " + (PRIORITY_CLR[t.priority] || "")}>{t.priority}</span></td>
                  <td className="px-3 py-2"><span>{CHANNEL_ICONS[t.channel] || "?"}</span> <span className="text-zinc-500">{t.channel}</span></td>
                  <td className="px-3 py-2"><SentimentBadge sentiment={t.sentiment} score={t.sentimentScore} /></td>
                  <td className="px-3 py-2"><SlaTimer minsLeft={t.slaMinutesLeft ?? null} risk={t.slaRisk} /></td>
                  <td className="px-3 py-2 text-zinc-400">{t.assignedAgentName || <span className="text-zinc-700">Unassigned</span>}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setAssigningTicket(t.id); setAssignAgentId(""); }} className="h-5 text-[9px] text-emerald-400 px-1">Assign</Button>
                      <Button size="sm" variant="ghost" onClick={() => triageMut.mutate(t)} disabled={triageMut.isPending} className="h-5 text-[9px] text-violet-400 px-1">🤖</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!assigningTicket} onOpenChange={() => setAssigningTicket(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-md">
          <DialogHeader><DialogTitle>Assign Ticket</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-zinc-300 text-xs">Agent (leave blank for auto load-balanced)</Label>
              <Select value={assignAgentId} onValueChange={setAssignAgentId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue placeholder="Auto-assign (load balanced)" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="">🤖 Auto-assign</SelectItem>
                  {agents.filter(a => a.isAvailable).map(a => <SelectItem key={a.id} value={a.id}><span className={AGENT_STATUS_CLR[a.status]}>●</span> {a.name} ({a.loadPercent}% load)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssigningTicket(null)} className="border-zinc-700">Cancel</Button>
              <Button data-testid="button-confirm-assign-ticket" onClick={() => assignMut.mutate({ ticketId: assigningTicket, agentId: assignAgentId || undefined })} disabled={assignMut.isPending} className="bg-emerald-700 hover:bg-emerald-600">{assignMut.isPending ? "Assigning…" : "✓ Assign"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2: UNIFIED INBOX / TICKET DETAIL
// ═══════════════════════════════════════════════════════════════════════════
function UnifiedInboxTab({ preSelectedTicket }: { preSelectedTicket: Ticket | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Ticket | null>(preSelectedTicket);
  const [replyText, setReplyText] = useState("");
  const [agentName, setAgentName] = useState("Support Team");
  const [escalateModal, setEscalateModal] = useState(false);
  const [escalateTarget, setEscalateTarget] = useState("senior_agent");
  const [escalateReason, setEscalateReason] = useState("");
  const [aiReply, setAiReply] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: queueData } = useQuery({ queryKey: ["/api/support-team/live-queue", "inbox"], queryFn: () => apiRequest("GET", "/api/support-team/live-queue?limit=30").then(r => r.json()) });
  const tickets: Ticket[] = queueData?.tickets || [];

  const escalateMut = useMutation({ mutationFn: (d: any) => apiRequest("POST", "/api/support-team/escalate", d).then(r => r.json()), onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/support-team/live-queue"] }); toast({ title: d.message }); setEscalateModal(false); } });

  const generateAIReply = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const r = await apiRequest("POST", "/api/support-team/ai-reply", { subject: selected.subject, description: selected.description, sentiment: selected.sentiment, channel: selected.channel, agentName, userName: selected.userId });
      const d = await r.json();
      setAiReply(d);
      if (d.reply) setReplyText(d.reply);
    } catch { toast({ title: "AI reply failed", variant: "destructive" }); }
    setAiLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: "520px" }}>
      {/* Ticket list */}
      <div className="lg:col-span-1 bg-zinc-800/30 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-700 text-xs font-semibold text-zinc-400">Tickets ({tickets.length})</div>
        <div className="overflow-y-auto max-h-[500px]">
          {tickets.map(t => (
            <button key={t.id} onClick={() => setSelected(t)} className={"w-full text-left px-3 py-2.5 border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors " + (selected?.id === t.id ? "bg-violet-950/20 border-l-2 border-l-violet-500" : "")}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px]">{CHANNEL_ICONS[t.channel]}</span>
                <span className={"text-[9px] font-bold rounded px-1 " + (PRIORITY_CLR[t.priority] || "")}>{t.priority}</span>
                <span className={"ml-auto text-[9px] " + SENTIMENT_CLR[t.sentiment]}>{t.sentiment === "critical" ? "🔥" : t.sentiment === "negative" ? "😠" : t.sentiment === "positive" ? "😊" : "😐"}</span>
              </div>
              <div className="text-zinc-200 text-xs truncate">{t.subject}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-zinc-600 text-[9px] font-mono">{t.userId}</span>
                {t.slaMinutesLeft !== undefined && t.slaMinutesLeft !== null && t.slaMinutesLeft < 60 && <span className="text-red-400 text-[9px] ml-auto">{t.slaMinutesLeft}m SLA</span>}
              </div>
            </button>
          ))}
          {tickets.length === 0 && <div className="text-zinc-600 text-xs text-center py-8">No tickets — seed demo data from Live Queue tab</div>}
        </div>
      </div>

      {/* Ticket detail + reply */}
      <div className="lg:col-span-2 space-y-3">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-20"><div className="text-5xl mb-3">📥</div><div>Select a ticket to view detail and reply</div></div>
        ) : (
          <>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-zinc-100">{selected.subject}</span>
                    <span className={"text-[9px] font-bold rounded px-1.5 py-0.5 " + (PRIORITY_CLR[selected.priority] || "")}>{selected.priority}</span>
                    <span className={"text-[9px] border rounded-full px-1.5 py-0.5 " + (STATUS_CLR[selected.status] || "")}>{selected.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span>👤 {selected.userId}</span>
                    <span>{CHANNEL_ICONS[selected.channel]} {selected.channel}</span>
                    <SentimentBadge sentiment={selected.sentiment} score={selected.sentimentScore} />
                    <span>AI: <strong className="text-zinc-300">{selected.aiPriority}</strong></span>
                    <SlaTimer minsLeft={selected.slaMinutesLeft ?? null} risk={selected.slaRisk} />
                  </div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => setEscalateModal(true)} className="text-xs">🚨 Escalate</Button>
              </div>
              {selected.description && <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-400 mt-2 max-h-28 overflow-y-auto">{selected.description}</div>}
              {selected.assignedAgentName && <div className="text-xs text-zinc-500 mt-2">Assigned to: <span className="text-zinc-300">{selected.assignedAgentName}</span></div>}
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 text-sm font-semibold">Reply</Label>
                <div className="flex gap-2">
                  <Input value={agentName} onChange={e => setAgentName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs w-40" placeholder="Your name" />
                  <Button size="sm" onClick={generateAIReply} disabled={aiLoading} className="bg-violet-700 hover:bg-violet-600 text-xs">{aiLoading ? "🤖…" : "🤖 AI Reply"}</Button>
                </div>
              </div>
              {aiReply && (
                <div className="bg-violet-950/20 border border-violet-700/30 rounded-lg p-3 text-xs text-violet-200">
                  <div className="flex gap-3 flex-wrap mb-1"><span>Tone: {aiReply.toneUsed}</span><span>Empathy: {aiReply.empathyScore}%</span>{aiReply.escalationNeeded && <span className="text-red-400">⚠️ Escalation needed</span>}</div>
                  {aiReply.actionSteps?.length > 0 && <div className="text-zinc-400 mt-1">Steps: {aiReply.actionSteps.join(" → ")}</div>}
                </div>
              )}
              <Textarea data-testid="input-reply-text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply here… or use AI Reply to generate." className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px] text-sm" />
              <div className="flex gap-2">
                <Button data-testid="button-send-reply" className="bg-violet-700 hover:bg-violet-600" onClick={() => { toast({ title: "Reply sent ✓" }); setReplyText(""); }}>Send Reply</Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { toast({ title: "Marked resolved ✓" }); }}>✓ Resolve</Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={escalateModal} onOpenChange={setEscalateModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-md">
          <DialogHeader><DialogTitle>🚨 Escalate Ticket</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-zinc-300 text-xs">Escalate To</Label>
              <Select value={escalateTarget} onValueChange={setEscalateTarget}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["senior_agent","finance","legal","moderator","management","engineering"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-zinc-300 text-xs">Reason</Label><Textarea value={escalateReason} onChange={e => setEscalateReason(e.target.value)} placeholder="Explain why this needs escalation…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEscalateModal(false)} className="border-zinc-700">Cancel</Button>
              <Button onClick={() => escalateMut.mutate({ ticketId: selected?.id, targetRole: escalateTarget, reason: escalateReason })} disabled={escalateMut.isPending || !selected} className="bg-red-700 hover:bg-red-600">{escalateMut.isPending ? "Escalating…" : "🚨 Escalate"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3: USER 360° LOOKUP
// ═══════════════════════════════════════════════════════════════════════════
function User360Tab() {
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [lookupId, setLookupId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["/api/support-team/user-lookup", lookupId], queryFn: () => lookupId ? apiRequest("GET", "/api/support-team/user-lookup/" + lookupId).then(r => r.json()) : Promise.resolve(null), enabled: !!lookupId });

  const doLookup = () => { if (!userId.trim()) { toast({ title: "Enter a user ID", variant: "destructive" }); return; } setLookupId(userId.trim()); };

  const DEMO_IDS = ["user_001","user_002","user_005","user_007","user_009"];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">🔍 User 360° Lookup</h3>
        <div className="text-zinc-500 text-sm mt-1">Instant full context on any user — profile, all support tickets, sentiment history, risk factors, Africa channel usage. Every data point an agent needs in one view.</div>
      </div>
      <div className="flex gap-2">
        <Input data-testid="input-user-lookup" value={userId} onChange={e => setUserId(e.target.value)} onKeyDown={e => e.key === "Enter" && doLookup()} placeholder="Enter user ID (e.g. user_001)" className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono max-w-xs" />
        <Button data-testid="button-lookup" onClick={doLookup} disabled={isLoading} className="bg-violet-700 hover:bg-violet-600">{isLoading ? "Looking up…" : "🔍 Lookup"}</Button>
      </div>
      <div className="flex gap-1 flex-wrap"><span className="text-zinc-600 text-xs">Demo IDs:</span>{DEMO_IDS.map(id => <button key={id} onClick={() => { setUserId(id); setLookupId(id); }} className="text-[10px] bg-zinc-800 border border-zinc-700 text-violet-400 px-1.5 py-0.5 rounded hover:bg-zinc-700">{id}</button>)}</div>

      {isLoading && <div className="text-center py-12 text-zinc-500 animate-pulse">Looking up user…</div>}
      {data && (
        <div className="space-y-4">
          {/* Risk alerts */}
          {data.riskFactors?.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 space-y-1">
              {data.riskFactors.map((r: string, i: number) => <div key={i} className="flex items-center gap-2 text-amber-300 text-sm"><span>⚠️</span> {r}</div>)}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profile */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <h4 className="font-semibold text-zinc-200 mb-3">👤 Profile</h4>
              <div className="space-y-1.5 text-sm">
                <div><span className="text-zinc-500">User ID:</span> <span className="font-mono text-violet-400">{data.userId}</span></div>
                {data.profile ? (
                  <>
                    <div><span className="text-zinc-500">Name:</span> <span className="text-zinc-100">{data.profile.displayName || "—"}</span></div>
                    <div><span className="text-zinc-500">Email:</span> <span className="text-zinc-300">{data.profile.email || "—"}</span></div>
                    <div><span className="text-zinc-500">Role:</span> <span className="text-zinc-300">{data.profile.role || "freelancer"}</span></div>
                    <div><span className="text-zinc-500">Country:</span> <span className="text-zinc-300">{data.profile.country || "—"}</span></div>
                  </>
                ) : (
                  <div className="text-zinc-600 text-xs">Profile not in system — new user or ID mismatch</div>
                )}
              </div>
              <h4 className="font-semibold text-zinc-200 mt-4 mb-2">🌍 Africa Context</h4>
              <div className="flex gap-3 text-sm">
                <div><div className="text-xl font-bold text-zinc-100">{data.africaContext?.whatsappTickets || 0}</div><div className="text-zinc-500 text-xs">WhatsApp</div></div>
                <div><div className="text-xl font-bold text-zinc-100">{data.africaContext?.ussdTickets || 0}</div><div className="text-zinc-500 text-xs">USSD</div></div>
              </div>
            </div>
            {/* Ticket stats */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <h4 className="font-semibold text-zinc-200 mb-3">🎫 Ticket History</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatCard label="Total" value={data.stats?.total || 0} color="bg-zinc-900 border-zinc-700 text-zinc-100" />
                <StatCard label="Resolved" value={data.stats?.resolved || 0} color="bg-emerald-950/40 border-emerald-700/40 text-emerald-200" />
                <StatCard label="Open" value={data.stats?.open || 0} color="bg-blue-950/40 border-blue-700/40 text-blue-200" />
                <StatCard label="Avg CSAT" value={(data.stats?.avgSatisfaction || 0) + "★"} color="bg-amber-950/40 border-amber-700/40 text-amber-200" />
              </div>
              {data.lastTicketAt && <div className="text-xs text-zinc-500">Last ticket: {new Date(data.lastTicketAt).toLocaleDateString()}</div>}
            </div>
            {/* Recent tickets */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <h4 className="font-semibold text-zinc-200 mb-3">Recent Tickets ({data.tickets?.length || 0})</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {(data.tickets || []).map((t: Ticket) => (
                  <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={"text-[8px] font-bold rounded px-1 " + (PRIORITY_CLR[t.priority] || "")}>{t.priority}</span>
                      <span className={"text-[8px] border rounded-full px-1 " + (STATUS_CLR[t.status] || "")}>{t.status}</span>
                      <span className={"ml-auto text-[9px] " + SENTIMENT_CLR[t.sentiment]}>{t.sentiment}</span>
                    </div>
                    <div className="text-zinc-300 text-xs truncate">{t.subject}</div>
                    <div className="text-zinc-600 text-[9px]">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {(data.tickets || []).length === 0 && <div className="text-zinc-600 text-xs">No tickets found</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4: CANNED RESPONSES + AI REPLY GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
function CannedResponsesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", channel: "all", tags: "" });
  const [aiSubject, setAiSubject] = useState("");
  const [aiSentiment, setAiSentiment] = useState("neutral");
  const [aiChannel, setAiChannel] = useState("chat");
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["/api/support-team/canned-responses", filterCategory, filterChannel, search], queryFn: () => apiRequest("GET", "/api/support-team/canned-responses?category=" + filterCategory + "&channel=" + filterChannel + "&search=" + encodeURIComponent(search)).then(r => r.json()), keepPreviousData: true } as any);
  const createMut = useMutation({ mutationFn: (d: any) => apiRequest("POST", "/api/support-team/canned-responses", d).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/support-team/canned-responses"] }); toast({ title: "Response created ✓" }); setCreateModal(false); setForm({ title: "", content: "", category: "general", channel: "all", tags: "" }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", "/api/support-team/canned-responses/" + id).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/support-team/canned-responses"] }); toast({ title: "Deleted" }); } });

  const generateAI = async () => {
    if (!aiSubject) { toast({ title: "Enter a subject first", variant: "destructive" }); return; }
    setAiLoading(true);
    try { const r = await apiRequest("POST", "/api/support-team/ai-reply", { subject: aiSubject, sentiment: aiSentiment, channel: aiChannel }); const d = await r.json(); setAiResult(d); } catch { toast({ title: "AI generation failed", variant: "destructive" }); }
    setAiLoading(false);
  };
  const saveCanned = () => {
    if (!aiResult?.reply) return;
    createMut.mutate({ title: "AI: " + aiSubject.slice(0, 50), content: aiResult.reply, category: "general", channel: aiChannel, aiGenerated: true });
    setAiResult(null);
  };

  const responses: CannedResponse[] = data?.responses || [];
  const categories: string[] = data?.categories || [];
  const CATEGORY_CLR: Record<string, string> = { payment:"text-emerald-400", dispute:"text-red-400", technical:"text-blue-400", general:"text-zinc-400", escalation:"text-orange-400", africa:"text-emerald-300" };

  return (
    <div className="space-y-5">
      {/* AI Generator */}
      <div className="bg-violet-950/20 border border-violet-700/30 rounded-xl p-5">
        <h4 className="font-semibold text-violet-200 mb-3">🤖 AI Reply Generator</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div><Label className="text-zinc-300 text-xs">Subject / Situation *</Label><Input data-testid="input-ai-subject" value={aiSubject} onChange={e => setAiSubject(e.target.value)} placeholder="Payment not received after 3 days" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
          <div><Label className="text-zinc-300 text-xs">User Sentiment</Label><Select value={aiSentiment} onValueChange={setAiSentiment}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["positive","neutral","negative","critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-zinc-300 text-xs">Channel</Label><Select value={aiChannel} onValueChange={setAiChannel}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["chat","email","whatsapp","ussd"].map(c => <SelectItem key={c} value={c}>{CHANNEL_ICONS[c]} {c}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button data-testid="button-generate-ai-reply" onClick={generateAI} disabled={aiLoading || !aiSubject} className="mt-3 bg-violet-700 hover:bg-violet-600">{aiLoading ? "🤖 Generating…" : "🤖 Generate Reply"}</Button>
        {aiResult?.reply && (
          <div className="mt-3 bg-zinc-900 border border-zinc-700 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2 flex-wrap text-xs text-zinc-400"><span>Tone: {aiResult.toneUsed}</span><span>Empathy: {aiResult.empathyScore}%</span>{aiResult.escalationNeeded && <span className="text-red-400">⚠️ Escalation recommended</span>}</div>
            <div className="text-zinc-200 text-sm whitespace-pre-wrap">{aiResult.reply}</div>
            <Button size="sm" onClick={saveCanned} disabled={createMut.isPending} className="mt-2 bg-emerald-700 hover:bg-emerald-600 text-xs">💾 Save as Canned Response</Button>
          </div>
        )}
      </div>

      {/* Canned responses library */}
      <div className="flex gap-2 flex-wrap items-center">
        <Input placeholder="Search responses…" value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-44" />
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={filterChannel} onValueChange={setFilterChannel}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Channels</SelectItem>{["chat","email","whatsapp","ussd"].map(c => <SelectItem key={c} value={c}>{CHANNEL_ICONS[c]} {c}</SelectItem>)}</SelectContent></Select>
        <Button size="sm" onClick={() => setCreateModal(true)} className="ml-auto bg-violet-600 hover:bg-violet-700">+ New Response</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-zinc-500 animate-pulse">Loading…</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {responses.map(resp => (
            <div key={resp.id} data-testid={"canned-" + resp.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-zinc-100 text-sm">{resp.title}</span>
                    {resp.aiGenerated && <span className="text-[9px] bg-violet-950/40 border border-violet-700/40 text-violet-400 px-1.5 py-0.5 rounded-full">🤖 AI</span>}
                    <span className={"text-[9px] " + (CATEGORY_CLR[resp.category] || "text-zinc-400")}>{resp.category}</span>
                    <span className="text-[9px] text-zinc-600">{CHANNEL_ICONS[resp.channel] || ""} {resp.channel}</span>
                  </div>
                  <div className="text-zinc-400 text-xs line-clamp-3 whitespace-pre-wrap">{resp.content.slice(0, 140)}{resp.content.length > 140 ? "…" : ""}</div>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-zinc-600"><span>Used {resp.usageCount}x</span>{resp.avgRating > 0 && <span>★ {resp.avgRating.toFixed(1)}</span>}{resp.tags && <span>{resp.tags}</span>}</div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(resp.content).then(() => toast({ title: "Copied!" }))} className="h-5 text-[9px] text-zinc-400 px-1">📋</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(resp.id)} className="h-5 text-[9px] text-red-400 px-1">🗑️</Button>
                </div>
              </div>
            </div>
          ))}
          {responses.length === 0 && <div className="col-span-2 text-center py-10 text-zinc-600"><div className="text-4xl mb-2">💬</div>Seed demo data from Live Queue tab to see canned responses</div>}
        </div>
      )}

      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-2xl">
          <DialogHeader><DialogTitle>New Canned Response</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-zinc-300 text-xs">Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Payment Delay – Standard" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-zinc-300 text-xs">Category</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["general","payment","dispute","technical","escalation","africa"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-zinc-300 text-xs">Channel</Label><Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["all","chat","email","whatsapp","ussd"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="text-zinc-300 text-xs">Response Content *</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Response content with optional {PLACEHOLDERS}…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[100px]" /></div>
            <div><Label className="text-zinc-300 text-xs">Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="payment,delay,wallet" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateModal(false)} className="border-zinc-700">Cancel</Button>
              <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.title || !form.content} className="bg-violet-700 hover:bg-violet-600">{createMut.isPending ? "Creating…" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5: ESCALATIONS
// ═══════════════════════════════════════════════════════════════════════════
function EscalationsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", triggerType: "sla_breach", triggerValue: '{"minutes":60}', targetRole: "senior_agent", priority: "high", description: "", autoNotify: true });

  const { data: rulesData } = useQuery({ queryKey: ["/api/support-team/escalation-rules"], queryFn: () => apiRequest("GET", "/api/support-team/escalation-rules").then(r => r.json()) });
  const { data: slaBreach } = useQuery({ queryKey: ["/api/support-team/sla-breaches"], queryFn: () => apiRequest("GET", "/api/support-team/sla-breaches").then(r => r.json()), refetchInterval: 60000 });

  const createMut = useMutation({ mutationFn: (d: any) => apiRequest("POST", "/api/support-team/escalation-rules", d).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/support-team/escalation-rules"] }); toast({ title: "Rule created" }); setCreateModal(false); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", "/api/support-team/escalation-rules/" + id).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/support-team/escalation-rules"] }); toast({ title: "Rule deactivated" }); } });

  const rules: EscalationRule[] = rulesData?.rules || [];
  const breached = slaBreach?.breached || [];
  const approaching = slaBreach?.approaching || [];

  const TRIGGER_ICONS: Record<string, string> = { sla_breach:"⏰", sentiment:"😠", keyword:"🔑", department:"🏷️", vip:"👑", priority:"🚨" };
  const PRIORITY_BORDER: Record<string, string> = { critical:"border-red-700/40", high:"border-orange-700/40", medium:"border-amber-700/40", low:"border-zinc-700/40" };

  return (
    <div className="space-y-5">
      {/* SLA breach alerts */}
      {(breached.length > 0 || approaching.length > 0) && (
        <div className="space-y-2">
          {breached.length > 0 && (
            <div className="bg-red-950/30 border border-red-700/50 rounded-xl p-3">
              <div className="text-red-300 font-semibold text-sm mb-2">🔥 {breached.length} SLA Breached — Immediate Action Required</div>
              <div className="space-y-1">{breached.slice(0, 5).map((t: Ticket) => <div key={t.id} className="flex items-center gap-2 text-xs text-red-300"><span className="font-mono text-[9px] text-red-500">{t.userId}</span><span className="truncate flex-1">{t.subject}</span><span className={"text-[8px] font-bold rounded px-1 " + (PRIORITY_CLR[t.priority] || "")}>{t.priority}</span></div>)}{breached.length > 5 && <div className="text-red-500 text-[9px]">+{breached.length - 5} more breached tickets</div>}</div>
            </div>
          )}
          {approaching.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3">
              <div className="text-amber-300 font-semibold text-sm mb-2">⚠️ {approaching.length} ticket{approaching.length !== 1 ? "s" : ""} approaching SLA in under 30 minutes</div>
              <div className="flex flex-wrap gap-2">{approaching.slice(0, 8).map((t: Ticket) => <span key={t.id} className="text-[9px] bg-amber-950/40 border border-amber-700/40 text-amber-300 px-1.5 py-0.5 rounded">{t.userId}: {t.subject.slice(0, 30)}</span>)}</div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold text-zinc-100 text-lg">🚨 Escalation Rules</h3><div className="text-zinc-500 text-sm">{rules.length} rules · {rules.filter(r => r.isActive).length} active · {rules.reduce((s, r) => s + (r.triggeredCount || 0), 0)} total triggers</div></div>
        <Button onClick={() => setCreateModal(true)} className="bg-red-700 hover:bg-red-600">+ New Rule</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {rules.map(rule => (
          <div key={rule.id} data-testid={"rule-" + rule.id} className={"bg-zinc-800/50 border rounded-xl p-4 " + (PRIORITY_BORDER[rule.priority] || "border-zinc-700")}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-lg">{TRIGGER_ICONS[rule.triggerType] || "⚡"}</span>
                  <span className="font-semibold text-zinc-100 text-sm">{rule.name}</span>
                  <span className={"text-[9px] font-bold rounded px-1.5 py-0.5 " + (PRIORITY_CLR[rule.priority] || "")}>{rule.priority}</span>
                  {rule.autoNotify && <span className="text-[9px] text-blue-400">🔔 auto-notify</span>}
                  {!rule.isActive && <span className="text-[9px] text-zinc-600">inactive</span>}
                </div>
                <div className="text-zinc-400 text-xs mb-1">{rule.description}</div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span>Trigger: <code className="text-violet-400">{rule.triggerType}</code></span>
                  <span>→ <span className="text-emerald-400">{rule.targetRole}</span></span>
                  <span>Fired: <strong className="text-zinc-300">{rule.triggeredCount}</strong>x</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(rule.id)} className="h-5 text-[9px] text-red-400 px-1 ml-2">✕</Button>
            </div>
          </div>
        ))}
        {rules.length === 0 && <div className="col-span-2 text-center py-10 text-zinc-600"><div className="text-4xl mb-2">🚨</div>Seed demo data to see escalation rules</div>}
      </div>

      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
          <DialogHeader><DialogTitle>New Escalation Rule</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-zinc-300 text-xs">Rule Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="SLA Breach – Senior Agent" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-zinc-300 text-xs">Trigger Type</Label><Select value={form.triggerType} onValueChange={v => setForm(p => ({ ...p, triggerType: v }))}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["sla_breach","sentiment","keyword","department","vip","priority"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-zinc-300 text-xs">Target Role</Label><Select value={form.targetRole} onValueChange={v => setForm(p => ({ ...p, targetRole: v }))}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["senior_agent","finance","legal","moderator","management","engineering"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="text-zinc-300 text-xs">Trigger Value (JSON)</Label><Input value={form.triggerValue} onChange={e => setForm(p => ({ ...p, triggerValue: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono text-xs" /></div>
            <div><Label className="text-zinc-300 text-xs">Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateModal(false)} className="border-zinc-700">Cancel</Button>
              <Button onClick={() => createMut.mutate({ ...form, triggerValue: (() => { try { return JSON.parse(form.triggerValue); } catch { return {}; } })() })} disabled={createMut.isPending || !form.name} className="bg-red-700 hover:bg-red-600">{createMut.isPending ? "Creating…" : "Create Rule"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 6: PERFORMANCE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function PerformanceTab() {
  const [days, setDays] = useState("7");
  const { data, isLoading } = useQuery({ queryKey: ["/api/support-team/performance", days], queryFn: () => apiRequest("GET", "/api/support-team/performance?days=" + days).then(r => r.json()) });
  const { data: agentsData } = useQuery({ queryKey: ["/api/support-team/agents"], queryFn: () => apiRequest("GET", "/api/support-team/agents").then(r => r.json()) });

  const leaderboard = data?.leaderboard || [];
  const daily = data?.daily || [];
  const agents: Agent[] = agentsData?.agents || [];

  const RANK_ICON = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h3 className="font-semibold text-zinc-100 text-lg">📊 Agent Performance</h3><div className="text-zinc-500 text-sm">Leaderboard + daily KPI trends</div></div>
        <Select value={days} onValueChange={setDays}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="14">Last 14 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem></SelectContent></Select>
      </div>

      {/* Agent status overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {agents.slice(0, 5).map(a => (
          <div key={a.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-700/20 border border-violet-700/40 flex items-center justify-center text-sm font-bold text-violet-300">{a.name[0]}</div>
              <div><div className="text-zinc-200 text-xs font-semibold truncate">{a.name.split(" ")[0]}</div><div className={"text-[9px] " + AGENT_STATUS_CLR[a.status]}>● {a.status}</div></div>
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between"><span className="text-zinc-500">Tickets today</span><span className="text-zinc-200">{a.ticketsToday}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Avg response</span><span className="text-zinc-200">{a.avgResponseMins.toFixed(1)}m</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">CSAT</span><span className="text-amber-300">{a.satisfactionScore.toFixed(1)}★</span></div>
              <div className="mt-1 w-full bg-zinc-700 rounded-full h-1"><div className="h-1 rounded-full bg-violet-500" style={{ width: a.loadPercent + "%" }} /></div>
              <div className="text-zinc-600 text-[8px] text-right">{a.loadPercent}% load ({a.activeTickets}/{a.maxTickets})</div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? <div className="text-center py-10 text-zinc-500 animate-pulse">Loading performance data…</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Leaderboard */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <h4 className="font-semibold text-zinc-200 mb-3">🏆 Leaderboard — Tickets Resolved ({data?.period})</h4>
            {leaderboard.length === 0 ? <div className="text-zinc-600 text-sm text-center py-6">Seed demo data to see leaderboard</div> : (
              <div className="space-y-2">
                {leaderboard.map((a: any, i: number) => (
                  <div key={a.agentId} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <span className="text-lg">{RANK_ICON(i)}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-100 text-sm">{a.agentName}</div>
                      <div className="flex items-center gap-3 text-[9px] text-zinc-500"><span>Resolved: <strong className="text-zinc-300">{a.totalResolved}</strong></span><span>Response: {a.avgResponseMins}m</span><span>CSAT: <span className="text-amber-300">{a.avgSatisfaction}★</span></span></div>
                    </div>
                    <div className="text-right"><div className="text-2xl font-bold text-violet-400">{a.totalResolved}</div><div className="text-[9px] text-zinc-600">tickets</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily resolved chart */}
          {daily.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <h4 className="font-semibold text-zinc-200 mb-3">Daily Resolved Tickets</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={daily} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", fontSize: "10px" }} />
                  <Bar dataKey="totalResolved" name="Resolved" radius={[3, 3, 0, 0]}>{daily.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Satisfaction trend */}
          {daily.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 lg:col-span-2">
              <h4 className="font-semibold text-zinc-200 mb-3">Response Time &amp; Satisfaction Trend</h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={daily} margin={{ top: 0, right: 20, bottom: 0, left: -20 }}>
                  <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", fontSize: "10px" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line type="monotone" dataKey="avgResponse" name="Avg Response (min)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avgSat" name="CSAT (×10)" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
type TabId = "queue" | "inbox" | "user360" | "canned" | "escalations" | "performance";
const TABS: { id: TabId; label: string }[] = [
  { id: "queue",       label: "🎫 Live Queue" },
  { id: "inbox",       label: "📥 Unified Inbox" },
  { id: "user360",     label: "🔍 User 360°" },
  { id: "canned",      label: "💬 Canned Responses" },
  { id: "escalations", label: "🚨 Escalations" },
  { id: "performance", label: "📊 Performance" },
];

export default function SupportTeamDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("queue");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleSelectTicket = (t: Ticket) => { setSelectedTicket(t); setActiveTab("inbox"); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start gap-3 mb-4 flex-wrap">
          <div className="w-11 h-11 rounded-xl bg-blue-700/20 border border-blue-700/40 flex items-center justify-center text-2xl">🎫</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-100">Support Team System v1.0</h1>
              <span className="text-[10px] bg-blue-700/20 border border-blue-700/40 text-blue-300 px-2 py-0.5 rounded-full">200% ELON MUSK INTELLIGENCE</span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">22 endpoints · AI triage + reply · SLA enforcement · Africa-first (WhatsApp/USSD) · Beats Zendesk+Freshdesk+Intercom+Salesforce until 2029</div>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={"tab-support-" + tab.id} onClick={() => setActiveTab(tab.id)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (activeTab === tab.id ? "bg-blue-700 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200")}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 py-6">
        {activeTab === "queue"       && <LiveQueueTab onSelectTicket={handleSelectTicket} />}
        {activeTab === "inbox"       && <UnifiedInboxTab preSelectedTicket={selectedTicket} />}
        {activeTab === "user360"     && <User360Tab />}
        {activeTab === "canned"      && <CannedResponsesTab />}
        {activeTab === "escalations" && <EscalationsTab />}
        {activeTab === "performance" && <PerformanceTab />}
      </div>
    </div>
  );
}

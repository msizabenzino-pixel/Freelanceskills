/**
 * Section 37 — Talent Acquisition & Certification v4.0 — FreelanceSkills.net
 * 400% ELON MUSK GOD-MODE — THE SHOWSTOPPER
 * Recruitment Pipeline (7 Stages) · AI Employer Matching · Skill Certification ·
 * Badge System · Competency Matrix · Training Pathways · Interview Scheduler ·
 * SAQA-Aligned · Africa-First · Batch Cert Runs · Analytics Funnel
 * Beats LinkedIn Recruiter + Greenhouse + Lever + Workday + SAP SuccessFactors until 2031
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

interface Candidate { id: string; name: string; email: string; phone: string; skills: string[]; stage: string; jobTitle: string; score: number; aiMatchScore: number; region: string; experience: number; notes: string[]; appliedAt: string; tags: string[] }
interface Certification { id: string; name: string; category: string; level: string; skills: string[]; validity: number; badgeColor: string; badgeIcon: string; issuedCount: number; active: boolean }
interface CertIssuance { id: string; certName: string; userName: string; issueDate: string; expiryDate: string; status: string; score: number; badgeIcon?: string; badgeColor?: string }
interface TrainingPath { id: string; name: string; description: string; certs: string[]; modules: { title: string; duration: number; type: string }[]; totalHours: number; enrolled: number; completed: number; rating: number; africa: boolean }
interface Job { id: string; title: string; department: string; region: string; type: string; skills: string[]; experience: number; salaryMin: number; salaryMax: number; applications: number; status: string; postedAt: string }
interface AIMatch { id: string; candidateId: string; candidateName: string; jobTitle: string; matchScore: number; skillGap: string[]; strengths: string[]; recommendation: string; ts: string }
interface Interview { id: string; candidateName: string; jobTitle: string; stage: string; type: string; scheduledAt: string; duration: number; interviewers: string[]; status: string }

const PIPELINE_STAGES = ["applied", "screening", "assessment", "interview", "offer", "hired", "rejected"];
const STAGE_COLORS: Record<string, string> = { applied: "#6366f1", screening: "#8b5cf6", assessment: "#f97316", interview: "#eab308", offer: "#3b82f6", hired: "#1DBF73", rejected: "#ef4444" };
const TABS = ["dashboard", "pipeline", "jobs", "matches", "certifications", "training", "interviews", "analytics"] as const;
type Tab = typeof TABS[number];

function Pill({ label, color }: { label: string; color: string }) {
  return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${color}20`, color }}>{label}</span>;
}

function ScoreMeter({ score, label, max = 100 }: { score: number; label: string; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 80 ? "#1DBF73" : score >= 65 ? "#eab308" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className="relative px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
      style={{ background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", color: active ? "#818cf8" : "#6b7280", border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
      {label}
      {badge ? <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">{badge}</span> : null}
    </button>
  );
}

function Badge({ cert }: { cert: { name: string; badgeColor: string; badgeIcon: string; level: string; category: string; issuedCount: number; skills: string[]; validity: number } }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ background: `${cert.badgeColor}12`, border: `1px solid ${cert.badgeColor}30` }}>
      <div className="text-4xl mb-2">{cert.badgeIcon}</div>
      <div className="text-sm font-bold text-white mb-1">{cert.name}</div>
      <div className="flex gap-1 flex-wrap justify-center mb-2">
        <Pill label={cert.level} color={cert.badgeColor} />
        <Pill label={cert.category} color="#6b7280" />
      </div>
      <div className="text-xs text-gray-500 mb-2">{cert.issuedCount} issued · {cert.validity}d validity</div>
      <div className="text-xs text-gray-600">{cert.skills.slice(0, 3).join(" · ")}</div>
    </div>
  );
}

export default function TalentAcquisition() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", region: "Gauteng", type: "contract", skills: "", salaryMin: 50000, salaryMax: 100000, experience: 2 });
  const [runMatchCandidate, setRunMatchCandidate] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({ queryKey: ["/api/talent/dashboard"], queryFn: () => fetch("/api/talent/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000, refetchInterval: 30000 });
  const { data: candidateData, refetch: refetchCandidates } = useQuery({ queryKey: ["/api/talent/candidates", selectedStage], queryFn: () => fetch(`/api/talent/candidates${selectedStage ? `?stage=${selectedStage}` : ""}`, { credentials: "include" }).then(r => r.json()), staleTime: 15000 });
  const { data: jobData } = useQuery({ queryKey: ["/api/talent/jobs"], queryFn: () => fetch("/api/talent/jobs", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "jobs" });
  const { data: matchData } = useQuery({ queryKey: ["/api/talent/matches"], queryFn: () => fetch("/api/talent/matches", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "matches" });
  const { data: certData } = useQuery({ queryKey: ["/api/talent/certifications"], queryFn: () => fetch("/api/talent/certifications", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "certifications" });
  const { data: badgeData } = useQuery({ queryKey: ["/api/talent/badge-awards"], queryFn: () => fetch("/api/talent/badge-awards", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "certifications" });
  const { data: trainingData } = useQuery({ queryKey: ["/api/talent/training-paths"], queryFn: () => fetch("/api/talent/training-paths", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "training" });
  const { data: interviewData } = useQuery({ queryKey: ["/api/talent/interviews"], queryFn: () => fetch("/api/talent/interviews", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "interviews" });
  const { data: analyticsData } = useQuery({ queryKey: ["/api/talent/analytics"], queryFn: () => fetch("/api/talent/analytics", { credentials: "include" }).then(r => r.json()), staleTime: 30000, enabled: tab === "analytics" });

  const advanceMut = useMutation({ mutationFn: (id: string) => fetch(`/api/talent/candidates/${id}/advance`, { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Candidate advanced ✓" }); qc.invalidateQueries({ queryKey: ["/api/talent/candidates"] }); qc.invalidateQueries({ queryKey: ["/api/talent/dashboard"] }); } });
  const rejectMut = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => fetch(`/api/talent/candidates/${id}/reject`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }).then(r => r.json()), onSuccess: () => { toast({ title: "Candidate rejected" }); qc.invalidateQueries({ queryKey: ["/api/talent/candidates"] }); } });
  const createJobMut = useMutation({ mutationFn: (data: any) => fetch("/api/talent/jobs", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, skills: data.skills.split(",").map((s: string) => s.trim()) }) }).then(r => r.json()), onSuccess: () => { toast({ title: "Job posted ✓" }); setShowNewJob(false); qc.invalidateQueries({ queryKey: ["/api/talent/jobs"] }); } });
  const runMatchMut = useMutation({ mutationFn: (candidateId: string) => fetch("/api/talent/matches/run", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId }) }).then(r => r.json()), onSuccess: (d: any) => { toast({ title: `AI Matched! Best: ${d.bestMatch?.matchScore}% for ${d.bestMatch?.jobTitle}` }); qc.invalidateQueries({ queryKey: ["/api/talent/matches"] }); } });

  const d = (dashboard as any) || {};
  const pipeline = d.pipeline || {};
  const totals = d.totals || {};

  const matchColor = (score: number) => score >= 85 ? "#1DBF73" : score >= 65 ? "#eab308" : "#ef4444";
  const matchLabel = (score: number) => score >= 85 ? "Excellent" : score >= 65 ? "Good Fit" : "Developing";

  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Talent Acquisition <span className="text-indigo-400">v4.0</span></h1>
              <p className="text-sm text-gray-500">Recruitment Pipeline · AI Matching · Certifications · Training · Africa-First</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">AI Match Avg</div>
              <div className="text-3xl font-black text-indigo-400">{d.avgAiMatch || "—"}%</div>
            </div>
          </div>
        </div>

        {/* Pipeline Funnel Visual */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Recruitment Pipeline</h3>
          <div className="flex items-end gap-1 overflow-x-auto pb-2">
            {PIPELINE_STAGES.filter(s => s !== "rejected").map(stage => {
              const count = pipeline[stage] || 0;
              const maxVal = Math.max(...Object.values(pipeline as Record<string, number>).filter(v => !isNaN(v)));
              const pct = maxVal > 0 ? (count / maxVal) * 100 : 0;
              return (
                <button key={stage} data-testid={`stage-${stage}`} onClick={() => { setSelectedStage(stage === selectedStage ? "" : stage); setTab("pipeline"); }}
                  className="flex-1 flex flex-col items-center min-w-[80px] transition-all"
                  style={{ opacity: selectedStage && selectedStage !== stage ? 0.5 : 1 }}>
                  <div className="text-xl font-black mb-2" style={{ color: STAGE_COLORS[stage] }}>{count}</div>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(8, pct * 0.8)}px`, background: STAGE_COLORS[stage], minHeight: "8px" }} />
                  <div className="mt-1.5 text-[10px] text-gray-500 capitalize font-bold">{stage}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-6">
          {[
            { label: "Candidates", value: totals.candidates || 0, icon: "👥" },
            { label: "Open Jobs", value: totals.openJobs || 0, icon: "💼" },
            { label: "Certs Active", value: totals.certs || 0, icon: "🏆" },
            { label: "Badges Issued", value: totals.certsIssued || 0, icon: "🎖" },
            { label: "Trained", value: totals.trainedThisMonth || 0, icon: "📚" },
            { label: "AI Matches", value: totals.aiMatchesRun || 0, icon: "🤖" },
            { label: "Interviews", value: totals.scheduledInterviews || 0, icon: "📅" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-xl">{s.icon}</div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-2">
          {TABS.map(t => <TabBtn key={t} label={t === "dashboard" ? "📊 Overview" : t === "pipeline" ? "🔄 Pipeline" : t === "jobs" ? "💼 Jobs" : t === "matches" ? "🤖 AI Matches" : t === "certifications" ? "🏆 Certifications" : t === "training" ? "📚 Training" : t === "interviews" ? "📅 Interviews" : "📈 Analytics"} active={tab === t} onClick={() => setTab(t)} />)}
        </div>

        {/* Pipeline Tab */}
        {(tab === "dashboard" || tab === "pipeline") && (
          <div className="space-y-4">
            {tab === "pipeline" && (
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setSelectedStage("")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${!selectedStage ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400"}`}>All</button>
                {PIPELINE_STAGES.map(s => (
                  <button key={s} onClick={() => setSelectedStage(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${selectedStage === s ? "text-white" : "text-gray-400 bg-gray-800"}`} style={{ background: selectedStage === s ? STAGE_COLORS[s] : undefined }}>{s}</button>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {((candidateData as any)?.candidates || []).slice(0, tab === "dashboard" ? 5 : 50).map((c: Candidate) => (
                <div key={c.id} data-testid={`candidate-${c.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.08)` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: STAGE_COLORS[c.stage] || "#6366f1" }}>
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-white">{c.name}</span>
                        <Pill label={c.stage} color={STAGE_COLORS[c.stage] || "#6366f1"} />
                        {c.tags?.map(tag => <Pill key={tag} label={tag} color="#6b7280" />)}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{c.jobTitle} · {c.region} · {c.experience}y exp</div>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {c.skills?.slice(0, 5).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300">{s}</span>)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-w-[300px]">
                        <ScoreMeter score={c.score} label="Candidate Score" />
                        <ScoreMeter score={c.aiMatchScore} label="AI Match" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!["hired", "rejected"].includes(c.stage) && (
                        <button data-testid={`advance-${c.id}`} onClick={() => advanceMut.mutate(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#1DBF73" }}>Advance ▶</button>
                      )}
                      {!["hired", "rejected"].includes(c.stage) && (
                        <button data-testid={`reject-${c.id}`} onClick={() => rejectMut.mutate({ id: c.id, reason: "Does not meet requirements" })} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-800/60">Reject</button>
                      )}
                      <button data-testid={`match-${c.id}`} onClick={() => { setRunMatchCandidate(c.id); runMatchMut.mutate(c.id); }} disabled={runMatchMut.isPending && runMatchCandidate === c.id} className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-300 bg-indigo-900/30">
                        {runMatchMut.isPending && runMatchCandidate === c.id ? "Matching..." : "🤖 AI Match"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {tab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">{(jobData as any)?.open || 0} open positions</div>
              <button data-testid="btn-new-job" onClick={() => setShowNewJob(!showNewJob)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#6366f1" }}>+ Post Job</button>
            </div>
            {showNewJob && (
              <div className="rounded-2xl p-6 mb-4" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <h4 className="text-sm font-bold text-white mb-4">New Position</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Job Title", key: "title", type: "text", placeholder: "Senior React Developer" },
                    { label: "Department", key: "department", type: "text", placeholder: "Engineering" },
                    { label: "Skills (comma-separated)", key: "skills", type: "text", placeholder: "React, TypeScript, Node.js" },
                    { label: "Min Salary (ZAR)", key: "salaryMin", type: "number", placeholder: "50000" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                      <input data-testid={`input-job-${field.key}`} type={field.type} value={(newJob as any)[field.key]} placeholder={field.placeholder}
                        onChange={e => setNewJob({ ...newJob, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-900 border border-gray-700" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button data-testid="btn-create-job" onClick={() => createJobMut.mutate(newJob)} disabled={!newJob.title} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#6366f1" }}>Post Job</button>
                  <button onClick={() => setShowNewJob(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-gray-800">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((jobData as any)?.jobs || []).map((j: Job) => (
                <div key={j.id} data-testid={`job-${j.id}`} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-base font-bold text-white">{j.title}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Pill label={j.department} color="#6366f1" />
                        <Pill label={j.type.replace("_", " ")} color="#6b7280" />
                        <Pill label={j.status} color={j.status === "open" ? "#1DBF73" : "#6b7280"} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{j.applications}</div>
                      <div className="text-xs text-gray-500">applicants</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mb-3">
                    {(j.skills || []).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-300">{s}</span>)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-800">
                    <div><div className="text-xs text-gray-400">Region</div><div className="text-xs font-bold text-white">{j.region}</div></div>
                    <div><div className="text-xs text-gray-400">Experience</div><div className="text-xs font-bold text-white">{j.experience}+ yrs</div></div>
                    <div><div className="text-xs text-gray-400">Salary</div><div className="text-xs font-bold text-white">R{(j.salaryMin / 100).toLocaleString()}–R{(j.salaryMax / 100).toLocaleString()}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Matches Tab */}
        {tab === "matches" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Total Matches", value: (matchData as any)?.summary?.total || 0, color: "#6366f1" },
                { label: "Excellent (85%+)", value: (matchData as any)?.summary?.excellent || 0, color: "#1DBF73" },
                { label: "Avg Score", value: `${(matchData as any)?.summary?.avgScore || 0}%`, color: "#eab308" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {((matchData as any)?.matches || []).map((m: AIMatch) => {
                const mc = matchColor(m.matchScore);
                return (
                  <div key={m.id} data-testid={`match-${m.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${mc}30` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-white">{m.candidateName} → {m.jobTitle}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-2xl font-black" style={{ color: mc }}>{m.matchScore}%</div>
                          <Pill label={matchLabel(m.matchScore)} color={mc} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(m.ts), { addSuffix: true })}</div>
                    </div>
                    <div className="bg-gray-900/40 rounded-lg p-3 mb-3">
                      <div className="text-xs font-bold text-indigo-400 mb-1">🤖 AI Recommendation</div>
                      <div className="text-sm text-white">{m.recommendation}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {m.strengths?.length > 0 && (
                        <div>
                          <div className="text-xs text-emerald-500 font-bold mb-1">✓ Strengths</div>
                          <div className="flex flex-wrap gap-1">{m.strengths.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-300">{s}</span>)}</div>
                        </div>
                      )}
                      {m.skillGap?.length > 0 && (
                        <div>
                          <div className="text-xs text-red-400 font-bold mb-1">⚡ Skill Gap</div>
                          <div className="flex flex-wrap gap-1">{m.skillGap.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-300">{s}</span>)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {tab === "certifications" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Active Badges", value: (badgeData as any)?.stats?.active || 0, color: "#1DBF73" },
                { label: "Expired", value: (badgeData as any)?.stats?.expired || 0, color: "#6b7280" },
                { label: "Revoked", value: (badgeData as any)?.stats?.revoked || 0, color: "#ef4444" },
                { label: "Total Certs", value: (certData as any)?.total || 0, color: "#6366f1" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Badge Catalogue</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {((certData as any)?.certifications || []).map((cert: Certification) => (
                <Badge key={cert.id} cert={cert} />
              ))}
            </div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-6">Recent Badge Awards</h4>
            <div className="space-y-2">
              {((badgeData as any)?.issuances || []).slice(0, 10).map((is: CertIssuance) => (
                <div key={is.id} data-testid={`issuance-${is.id}`} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <div className="text-sm font-bold text-white">{is.userName}</div>
                    <div className="text-xs text-gray-500">{is.certName}</div>
                    <div className="text-xs text-gray-600 mt-0.5">Expires {format(new Date(is.expiryDate), "MMM d, yyyy")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-indigo-400">{is.score}%</div>
                    <Pill label={is.status} color={is.status === "active" ? "#1DBF73" : is.status === "revoked" ? "#ef4444" : "#6b7280"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Tab */}
        {tab === "training" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-xl font-bold text-indigo-400">{(trainingData as any)?.totalEnrolled || 0}</div>
                <div className="text-xs text-gray-500">Total Enrolled</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(29,191,115,0.1)", border: "1px solid rgba(29,191,115,0.2)" }}>
                <div className="text-xl font-bold text-emerald-400">{(trainingData as any)?.totalCompleted || 0}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-xl font-bold text-indigo-400">{(trainingData as any)?.total || 0}</div>
                <div className="text-xs text-gray-500">Active Paths</div>
              </div>
            </div>
            <div className="space-y-4">
              {((trainingData as any)?.paths || []).map((p: TrainingPath) => {
                const compRate = p.enrolled > 0 ? ((p.completed / p.enrolled) * 100).toFixed(0) : "0";
                return (
                  <div key={p.id} data-testid={`training-${p.id}`} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-base font-bold text-white">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                        {p.africa && <Pill label="🌍 Africa-First" color="#1DBF73" />}
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <div className="text-2xl font-black text-yellow-400">{"★".repeat(Math.floor(p.rating))}</div>
                        <div className="text-xs text-gray-500">{p.rating}/5.0</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                      <div><div className="text-lg font-bold text-indigo-400">{p.enrolled}</div><div className="text-xs text-gray-500">Enrolled</div></div>
                      <div><div className="text-lg font-bold text-emerald-400">{p.completed}</div><div className="text-xs text-gray-500">Completed</div></div>
                      <div><div className="text-lg font-bold text-white">{p.totalHours}h</div><div className="text-xs text-gray-500">Total Hours</div></div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">Completion Rate</span>
                        <span className="text-xs font-bold text-emerald-400">{compRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${compRate}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(p.modules || []).map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-indigo-700 shrink-0">{i + 1}</span>
                          <span className="text-gray-400">{m.title}</span>
                          <span className="text-gray-600 ml-auto">{m.duration}h · {m.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interviews Tab */}
        {tab === "interviews" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-white">{(interviewData as any)?.upcoming || 0} upcoming</div>
            </div>
            {((interviewData as any)?.interviews || []).map((i: Interview) => {
              const statusColor = i.status === "scheduled" ? "#1DBF73" : i.status === "completed" ? "#6b7280" : "#ef4444";
              const typeIcon = i.type === "video" ? "📹" : i.type === "technical" ? "💻" : i.type === "phone" ? "📱" : "🤝";
              return (
                <div key={i.id} data-testid={`interview-${i.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{typeIcon}</div>
                      <div>
                        <div className="text-sm font-bold text-white">{i.candidateName}</div>
                        <div className="text-xs text-gray-500">{i.jobTitle} · {i.stage}</div>
                        <div className="flex gap-2 mt-1">
                          <Pill label={i.type} color="#6366f1" />
                          <Pill label={i.status} color={statusColor} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{format(new Date(i.scheduledAt), "MMM d, HH:mm")}</div>
                      <div className="text-xs text-gray-500">{i.duration} min</div>
                      <div className="text-xs text-gray-600 mt-0.5">{i.interviewers?.join(", ")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Recruitment Funnel</h4>
              <div className="space-y-3">
                {(analyticsData as any)?.funnel && Object.entries((analyticsData as any).funnel).map(([stage, count]: [string, any]) => {
                  const max = (analyticsData as any).funnel.applied || 1;
                  const pct = ((count / max) * 100).toFixed(0);
                  return (
                    <div key={stage}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs capitalize text-gray-400 font-bold">{stage}</span>
                        <span className="text-xs text-white font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-800">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STAGE_COLORS[stage] || "#6366f1" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{(analyticsData as any)?.avgTimeToHire || "—"}</div>
                  <div className="text-xs text-gray-500">Avg Time to Hire</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{(analyticsData as any)?.offerAcceptRate || "—"}</div>
                  <div className="text-xs text-gray-500">Offer Accept Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{"★".repeat(Math.floor(parseFloat((analyticsData as any)?.satisfactionScore || "0")))}</div>
                  <div className="text-xs text-gray-500">Candidate Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">By Region</h4>
                {(analyticsData as any)?.byRegion && Object.entries((analyticsData as any).byRegion).map(([region, count]: [string, any]) => (
                  <div key={region} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-white">{region}</span>
                    <span className="text-sm font-bold text-indigo-400">{count}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Top Skill Demand</h4>
                {((analyticsData as any)?.skillDemand || []).map((s: { skill: string; count: number; demand: number }) => (
                  <div key={s.skill} className="py-2 border-b border-gray-800 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white">{s.skill}</span>
                      <span className="text-xs text-gray-500">{s.count} candidates</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, s.demand * 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

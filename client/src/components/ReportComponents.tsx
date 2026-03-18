/**
 * REPORT & ABUSE MANAGEMENT — REUSABLE COMPONENT LIBRARY
 * 
 * 200% Intelligence Components
 * Extracted from ReportAbuseManagement for reusability across the platform
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 1: SEVERITY GAUGE
// Real-time 0-100 AI severity score + 7-day risk forecast
// ═══════════════════════════════════════════════════════════════════════════
export function SeverityGauge({ score, forecast, showDetails = true }: { score: number; forecast?: number; showDetails?: boolean }) {
  const color = score >= 80 ? "#dc2626" : score >= 60 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#10b981";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-center mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-700">AI Severity Score</p>
        <div className="text-6xl font-black mt-2" style={{ color }}>{score}</div>
        <p className="text-[10px] text-gray-500 mt-1">/100 Real-time</p>
      </div>
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-600 font-semibold">Severity Bar</span>
              <span className="font-bold" style={{ color }}>{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div style={{ width: `${score}%`, background: color }} className="h-full rounded-full" />
            </div>
          </div>
          {forecast && (
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-600 font-semibold">7-Day Forecast</span>
                <span className="font-bold text-amber-600">{forecast}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div style={{ width: `${forecast}%`, background: "#f59e0b" }} className="h-full rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 2: REHAB PATH PANEL
// Personalised Academy rehabilitation path + earnings lift forecast
// Philosophy: "Instead of banning, we help them become better freelancers"
// ═══════════════════════════════════════════════════════════════════════════
export function RehabPathPanel({ plan, earningsLift, message }: { plan: any; earningsLift?: number; message?: string }) {
  if (!plan) return null;
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
      <h3 className="font-bold text-green-900 mb-1">🌱 Personalised Rehabilitation Path</h3>
      <p className="text-[10px] text-green-700 mb-4">{message || "Tailored to this user's violation type and severity score."}</p>
      
      {earningsLift && (
        <div className="bg-white rounded-lg p-3 text-center border border-green-200 mb-4">
          <p className="text-[9px] text-green-700 font-bold uppercase">TOTAL EARNINGS LIFT</p>
          <p className="text-4xl font-black text-green-600 mt-1">+{earningsLift}%</p>
          <p className="text-[10px] text-gray-500 mt-1">Complete all courses within {plan.completionDeadlineDays || 30} days</p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {plan.courses?.map((c: any, i: number) => (
          <div key={i} className="bg-white rounded-lg border border-green-100 p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900">{c.title}</p>
                <p className="text-[9px] text-gray-500">{c.duration} · Module {c.module}</p>
                {c.why && <p className="text-[9px] text-green-700 mt-0.5 italic">{c.why}</p>}
              </div>
              <span className="text-[10px] font-black text-green-600">+{c.earnLift}%</span>
            </div>
          </div>
        ))}
      </div>

      {plan.healingSteps?.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <p className="text-xs font-bold text-gray-900 mb-2">🪴 Healing Steps</p>
          {plan.healingSteps.map((step: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1.5">
              <span className="text-green-500 font-bold leading-tight">✓</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 3: EVIDENCE VAULT
// AI analysis of files: authenticity, deepfake detection, sentiment, plagiarism
// ═══════════════════════════════════════════════════════════════════════════
export function EvidenceVault({ files, analysis }: { files: any[]; analysis?: any[] }) {
  if (!files?.length) return null;

  const strengthColor: Record<string, string> = { strong: "#10b981", moderate: "#f59e0b", weak: "#ef4444", suspect: "#dc2626" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">🔎 Evidence Intelligence Vault</h3>
        <span className="text-[10px] text-gray-500">First SA platform with deepfake detection</span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {files.map((ev: any, i: number) => {
          const ana = analysis?.[i];
          return (
            <div key={ev.id} className={`bg-white rounded-xl border p-4 space-y-2 ${ana?.manipulationFlag ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ev.fileType === "image" ? "🖼️" : ev.fileType === "audio" ? "🎙️" : "📄"}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900 truncate">{ev.fileName}</p>
                  <p className="text-[9px] text-gray-500">{ev.uploadedBy}</p>
                </div>
              </div>
              {ana && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-600">Evidence strength</span>
                    <span className="text-[9px] font-bold" style={{ color: strengthColor[ana.evidenceStrength] }}>
                      {ana.evidenceStrength?.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${ana.aiAuthenticity}%`, background: strengthColor[ana.evidenceStrength] }} className="h-full" />
                  </div>
                  <p className="text-[9px] text-gray-600">Auth: {ana.aiAuthenticity}%</p>
                  {(ana.deepfakeRisk || 0) > 5 && (
                    <div className="bg-red-100 rounded px-2 py-1">
                      <p className="text-[9px] font-bold text-red-700">🎭 Deepfake risk: {ana.deepfakeRisk}%</p>
                    </div>
                  )}
                  {(ana.aiPlagiarismScore || 0) > 0 && (
                    <div className="bg-amber-100 rounded px-2 py-1">
                      <p className="text-[9px] font-bold text-amber-700">©️ Plagiarism: {ana.aiPlagiarismScore}%</p>
                    </div>
                  )}
                  {ana.transcription && (
                    <div className="bg-blue-50 rounded px-2 py-1 border border-blue-200">
                      <p className="text-[9px] font-bold text-blue-700 mb-0.5">🎙️ Transcription</p>
                      <p className="text-[9px] text-blue-800 italic line-clamp-2">{ana.transcription}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 4: HEALING PATH
// Reporter healing plan + reporter growth recommendations + community protection
// ═══════════════════════════════════════════════════════════════════════════
export function HealingPath({ reporterSupport, reporterCourses, protectionMeasures }: { reporterSupport?: string; reporterCourses?: any[]; protectionMeasures?: string[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-3">💚 Reporter Healing Plan</h3>
        {reporterSupport && (
          <div className="bg-green-50 rounded-lg p-4 text-sm text-green-900 whitespace-pre-line mb-4">{reporterSupport}</div>
        )}
        {reporterCourses?.length ? (
          <>
            <p className="text-[10px] font-bold text-gray-700 mb-2">📚 Growth courses for reporter:</p>
            {reporterCourses.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-green-50 rounded px-3 py-2 border border-green-100 mb-1">
                <span className="text-xs text-gray-800">{c.title}</span>
                <span className="text-[10px] font-bold text-green-600">+{c.earnLift}%</span>
              </div>
            ))}
          </>
        ) : null}
      </div>

      <div className="space-y-3">
        {protectionMeasures?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-3">🌍 Community Protection Plan</h3>
            {protectionMeasures.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1.5">
                <span className="text-green-500 font-bold mt-0.5">✓</span><span>{item}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 5: LIVE COLLABORATION
// Multi-agent collaboration with @mentions + live AI suggestions
// ═══════════════════════════════════════════════════════════════════════════
export function LiveCollaboration({ agents, aiSuggestion, onAction, messageText, setMessageText, isInternal, setIsInternal }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-gray-900">👥 Real-time Agent Collaboration</h3>
        <p className="text-xs text-gray-500">Multiple agents can work on this report simultaneously. AI suggestions update live as you work.</p>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "@Mention Colleague", icon: "💭", action: "mention_colleague", color: "#3b82f6" },
            { label: "Share AI Draft", icon: "🤖", action: "share_draft", color: "#10b981" },
            { label: "Escalate to Senior", icon: "⬆️", action: "escalate_agent", color: "#7c3aed" },
            { label: "Request Second Opinion", icon: "🔍", action: "second_opinion", color: "#f59e0b" },
            { label: "Flag for Legal", icon: "⚖️", action: "flag_legal", color: "#ef4444" },
            { label: "Live Video Call", icon: "📹", action: "video_call", color: "#0891b2" },
          ].map(a => (
            <button key={a.action}
              onClick={() => onAction?.(a.action)}
              className="p-3 rounded-xl border-2 hover:shadow text-center transition-all"
              style={{ borderColor: a.color + "40", background: a.color + "10" }}>
              <p className="text-xl">{a.icon}</p>
              <p className="text-[9px] font-bold mt-1" style={{ color: a.color }}>{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3">💬 Message Thread</h3>
          <textarea value={messageText} onChange={e => setMessageText?.(e.target.value)} rows={4}
            placeholder="Send message to reporter or add internal note..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal?.(e.target.checked)} />
              Internal (agents only)
            </label>
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 disabled:opacity-40" disabled={!messageText?.trim()}>
              📤 Send
            </button>
          </div>
        </div>

        {aiSuggestion && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">LIVE AI SUGGESTION</p>
            <div>
              <p className="text-xs font-bold text-indigo-700">{aiSuggestion.headline}</p>
              <p className="text-[10px] text-gray-600 mt-1">Confidence: {aiSuggestion.confidenceScore}%</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {aiSuggestion.alternativeActions?.map((a: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-700">{a.replace("_", " ")}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT 6: RESOLUTION SURVEY
// 6-question post-resolution growth survey sent to both parties
// Drives continuous improvement + Academy link
// ═══════════════════════════════════════════════════════════════════════════
export function ResolutionSurvey({ survey, answers, setAnswers, onSubmit, earningsLift }: any) {
  if (!survey?.length) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
        <h3 className="font-bold text-green-900 mb-4">📋 Post-Resolution Growth Survey</h3>
        <p className="text-xs text-green-700 mb-4">Sent to both reporter and reported user after resolution. Drives continuous improvement.</p>
        
        <div className="space-y-3">
          {survey.map((q: any) => (
            <div key={q.id} className="bg-white rounded-lg p-3 border border-green-100">
              <p className="text-xs font-bold text-gray-900 mb-2">{q.id}. {q.question}</p>
              {q.type === "yes_no" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswers?.(p => ({ ...p, [q.id]: "yes" }))}
                    className={`px-3 py-1 rounded text-xs font-bold ${answers?.[q.id] === "yes" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                    Yes
                  </button>
                  <button
                    onClick={() => setAnswers?.(p => ({ ...p, [q.id]: "no" }))}
                    className={`px-3 py-1 rounded text-xs font-bold ${answers?.[q.id] === "no" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                    No
                  </button>
                </div>
              ) : q.type === "text" ? (
                <input className="w-full rounded border border-gray-200 px-2 py-1 text-xs" placeholder="Your feedback..."
                  onChange={e => setAnswers?.(p => ({ ...p, [q.id]: e.target.value }))} />
              ) : (
                <div className="flex gap-1">
                  {Array.from({ length: q.type === "scale_0_10" ? 11 : 5 }, (_, n) => (
                    <button key={n}
                      onClick={() => setAnswers?.(p => ({ ...p, [q.id]: n }))}
                      className={`w-7 h-7 rounded text-xs font-bold ${answers?.[q.id] === n ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onSubmit} className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700">
          📤 Submit Survey
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3">📈 Growth Impact Forecast</h3>
          {[
            { label: "Reporter satisfaction score", pct: 88 },
            { label: "Rehab completion rate (platform avg)", pct: 76 },
            { label: "Recidivism reduction (post-rehab)", pct: 82 },
            { label: "Academy course adoption rate", pct: earningsLift || 35 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-semibold">{item.label}</span>
                <span className="font-bold text-indigo-600">{item.pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                <div style={{ width: `${item.pct}%`, background: "#6366f1" }} className="h-full rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <p className="font-bold text-emerald-900 mb-2">Academy Integration</p>
          <p className="text-xs text-emerald-800">
            After resolution, both parties receive Academy course recommendations. Users who complete post-report courses have an{" "}
            <strong>82% lower re-offense rate</strong> and earn <strong>+{earningsLift || 35}% more</strong> within 6 months.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Early Warning Pulse
// ═══════════════════════════════════════════════════════════════════════════
export function EarlyWarningPulse({ reason }: { reason: string }) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 animate-pulse">
      <span className="text-orange-600 font-bold text-sm">⚠️</span>
      <p className="text-[10px] font-bold text-amber-800">{reason}</p>
    </div>
  );
}

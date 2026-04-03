import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Reference {
  refName: string;
  refTitle: string;
  refCompany: string;
  refEmail: string;
  refPhone: string;
  refRelationship: string;
}

const EMPTY_REF: Reference = { refName: "", refTitle: "", refCompany: "", refEmail: "", refPhone: "", refRelationship: "manager" };

export default function VettingBackground() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [refs, setRefs] = useState<Reference[]>([{ ...EMPTY_REF }]);
  const [criminalConsent, setCriminalConsent] = useState(false);
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [result, setResult] = useState<any>(null);

  const addRef = () => refs.length < 5 && setRefs(r => [...r, { ...EMPTY_REF }]);
  const updateRef = (i: number, field: keyof Reference, value: string) => {
    setRefs(r => r.map((ref, idx) => idx === i ? { ...ref, [field]: value } : ref));
  };
  const removeRef = (i: number) => refs.length > 1 && setRefs(r => r.filter((_, idx) => idx !== i));

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/background", {
      references: refs.filter(r => r.refName.trim()),
      criminalCheckConsent: criminalConsent,
    }),
    onSuccess: (data: any) => {
      setResult(data);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
    },
    onError: () => toast({ title: "Submission Error", description: "Failed to submit background check.", variant: "destructive" }),
  });

  const validRefs = refs.filter(r => r.refName.trim());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16">
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/vetting" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-yellow-400">Step 5 of 5 — Elite Background Check</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {phase === "form" ? (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🏆</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Elite Background Verification</h1>
              <p className="text-slate-400 text-sm sm:text-base">
                The final step to Elite status. Unlock government projects, enterprise contracts, and 0% commission on your first 3 projects.
              </p>
            </div>

            {/* Benefits reminder */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5 mb-8">
              <h3 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                <span>🏆</span> Elite Tier Unlocks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "0% commission on first 3 projects",
                  "Government project access (R50K+)",
                  "Enterprise contract portal",
                  "Gold Elite badge on profile",
                  "Dedicated account manager",
                  "Priority in ALL search results",
                ].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm text-yellow-200">
                    <span className="text-yellow-400">✓</span> {b}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Professional References */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-semibold">Professional References</label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Minimum 2 references (max 5). They'll receive a short automated verification email.
                    </p>
                  </div>
                  {refs.length < 5 && (
                    <button onClick={addRef} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-all">
                      + Add Reference
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {refs.map((ref, i) => (
                    <div key={i} className="border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-300">Reference {i + 1}</span>
                        {refs.length > 1 && (
                          <button onClick={() => removeRef(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
                          <input
                            type="text"
                            value={ref.refName}
                            onChange={e => updateRef(i, "refName", e.target.value)}
                            placeholder="e.g. Sipho Dlamini"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} full name`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Job Title</label>
                          <input
                            type="text"
                            value={ref.refTitle}
                            onChange={e => updateRef(i, "refTitle", e.target.value)}
                            placeholder="e.g. CTO, Project Manager"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} job title`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Company</label>
                          <input
                            type="text"
                            value={ref.refCompany}
                            onChange={e => updateRef(i, "refCompany", e.target.value)}
                            placeholder="e.g. TechVentures SA"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} company`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Email *</label>
                          <input
                            type="email"
                            value={ref.refEmail}
                            onChange={e => updateRef(i, "refEmail", e.target.value)}
                            placeholder="sipho@techventures.co.za"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} email`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Phone (optional)</label>
                          <input
                            type="tel"
                            value={ref.refPhone}
                            onChange={e => updateRef(i, "refPhone", e.target.value)}
                            placeholder="+27 82 123 4567"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} phone`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Relationship</label>
                          <select
                            value={ref.refRelationship}
                            onChange={e => updateRef(i, "refRelationship", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Reference ${i + 1} relationship`}
                          >
                            <option value="manager">Direct Manager</option>
                            <option value="client">Client</option>
                            <option value="colleague">Senior Colleague</option>
                            <option value="professor">Professor/Lecturer</option>
                            <option value="mentor">Mentor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criminal Check Consent */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Criminal Background Clearance</h3>
                <p className="text-xs text-slate-400 mb-4">
                  A South African Police Service (SAPS) clearance check will be initiated. Results typically take 3-5 business days.
                  Required for government and enterprise (R50K+) projects.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criminalConsent}
                    onChange={e => setCriminalConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-500 flex-shrink-0"
                    aria-label="Consent to criminal background check"
                  />
                  <span className="text-sm text-slate-300">
                    I consent to a criminal background check by FreelanceSkills in partnership with accredited SAPS-authorised verification providers.
                    I confirm all information I've provided is truthful. <span className="text-red-400">*</span>
                  </span>
                </label>
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={validRefs.length < 1 || !criminalConsent || submitMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {submitMutation.isPending ? "Activating Elite Status..." : `🏆 Activate Elite — ${validRefs.length} Reference(s) Submitted`}
              </button>
            </div>
          </>
        ) : result ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-yellow-300">Elite Status Activated!</h1>
            <p className="text-slate-400 mb-6 text-sm">{result.message}</p>

            {result.blockchainHash && (
              <div className="bg-slate-900/50 border border-yellow-500/30 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <div className="text-xs text-slate-400 mb-1">⛓️ Elite Credential Hash</div>
                <div className="text-xs font-mono text-yellow-400 break-all">{result.blockchainHash}</div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
              <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-3">
                <div className="text-xl font-bold text-yellow-400">{result.tier}</div>
                <div className="text-xs text-slate-500">Elite Tier</div>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-xl font-bold text-emerald-400">{result.finalScore}</div>
                <div className="text-xs text-slate-500">Trust Score /100</div>
              </div>
              <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-3 col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-blue-400">{result.referencesSubmitted}</div>
                <div className="text-xs text-slate-500">References Sent</div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5 mb-6 max-w-md mx-auto text-left">
              <h3 className="font-semibold text-yellow-300 mb-3 text-sm">Your Elite Benefits Are Active:</h3>
              <div className="space-y-1.5">
                {result.benefits?.map((b: string) => (
                  <div key={b} className="flex items-center gap-2 text-xs text-yellow-200">
                    <span className="text-yellow-400">✓</span> {b}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 font-semibold rounded-xl hover:from-yellow-400 transition-all">
                🚀 Go to Dashboard
              </Link>
              <Link href="/vetting" className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all">
                View Vetting Hub
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

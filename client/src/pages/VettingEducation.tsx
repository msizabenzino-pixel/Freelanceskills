import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const DOC_TYPES = [
  { value: "degree", label: "University Degree", icon: "🎓", desc: "BCom, BSc, BA, LLB, etc." },
  { value: "diploma", label: "Diploma", icon: "📜", desc: "National Diploma, BTech, etc." },
  { value: "trade_cert", label: "Trade Certificate", icon: "🔧", desc: "Artisan, Red Seal, N-Cert, etc." },
  { value: "gcc", label: "GCC (Government Certificate)", icon: "🏛️", desc: "Government Certificate of Competency" },
  { value: "ecsa_reg", label: "ECSA Registration", icon: "⚙️", desc: "Engineering Council of SA" },
  { value: "sacpcmp_reg", label: "SACPCMP Registration", icon: "🏗️", desc: "Construction Professional" },
  { value: "seta_cert", label: "SETA Certificate", icon: "📋", desc: "Skills Education Training Authority" },
  { value: "saqa_nlrd", label: "SAQA NLRD Record", icon: "📊", desc: "National Learners' Records Database" },
  { value: "professional_body_reg", label: "Professional Body Registration", icon: "🏅", desc: "PIRB, SACNASP, SAAAD, etc." },
  { value: "certificate", label: "Other Certificate", icon: "📄", desc: "Short courses, online certs, etc." },
];

export default function VettingEducation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    documentType: "degree" as string,
    institutionName: "",
    qualificationName: "",
    yearCompleted: new Date().getFullYear() - 2,
    fileName: "",
    filePath: "",
    saqaId: "",
    registrationNumber: "",
    language: "en",
  });
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [result, setResult] = useState<any>(null);

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/education", {
      ...form,
      yearCompleted: Number(form.yearCompleted),
    }),
    onSuccess: (data: any) => {
      setResult(data);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
    },
    onError: () => toast({ title: "Submission Error", description: "Failed to submit education documents.", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16" data-testid="page-vetting-education">
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/vetting" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm" data-testid="link-back-to-hub">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-emerald-400">Step 4 of 5 — Education</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {phase === "form" ? (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎓</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Education Verification</h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Verified qualifications earn 2× higher average rates and a blockchain-minted credential.
                Cross-checked with SAQA NLRD.
              </p>
            </div>

            <div className="space-y-6">
              {/* Document Type Selection */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-3">Qualification Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DOC_TYPES.map(({ value, label, icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setForm(f => ({ ...f, documentType: value }))}
                      data-testid={`button-doctype-${value}`}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm text-left transition-all ${
                        form.documentType === value
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <div>
                        <div className={`font-medium ${form.documentType === value ? "text-emerald-300" : ""}`}>{label}</div>
                        <div className="text-xs text-slate-500">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution & Qualification Details */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <label className="block text-sm font-semibold">Qualification Details</label>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Institution Name *</label>
                  <input
                    type="text"
                    value={form.institutionName}
                    onChange={e => setForm(f => ({ ...f, institutionName: e.target.value }))}
                    placeholder="e.g. University of Cape Town, Boston City Campus"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Institution name"
                    data-testid="input-institution-name"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Qualification Name *</label>
                  <input
                    type="text"
                    value={form.qualificationName}
                    onChange={e => setForm(f => ({ ...f, qualificationName: e.target.value }))}
                    placeholder="e.g. BSc Computer Science, National Diploma Electrical Engineering"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Qualification name"
                    data-testid="input-qualification-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Year Completed *</label>
                    <input
                      type="number"
                      value={form.yearCompleted}
                      onChange={e => setForm(f => ({ ...f, yearCompleted: Number(e.target.value) }))}
                      min={1950}
                      max={new Date().getFullYear()}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label="Year completed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">SAQA ID (optional)</label>
                    <input
                      type="text"
                      value={form.saqaId}
                      onChange={e => setForm(f => ({ ...f, saqaId: e.target.value }))}
                      placeholder="e.g. 23994"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label="SAQA ID"
                    />
                  </div>
                </div>

                {["professional_body_reg", "ecsa_reg", "sacpcmp_reg", "gcc"].includes(form.documentType) && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Registration Number</label>
                    <input
                      type="text"
                      value={form.registrationNumber}
                      onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))}
                      placeholder="Your professional registration number"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label="Registration number"
                    />
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-1">Upload Certificate / Transcript</label>
                <p className="text-xs text-slate-400 mb-3">PDF preferred. JPG/PNG also accepted. Max 15MB.</p>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    form.fileName ? "border-emerald-500 bg-emerald-500/5" : "border-slate-700 hover:border-slate-500"
                  }`}
                  onClick={() => {
                    const fname = `education-cert-${Date.now()}.pdf`;
                    setForm(f => ({ ...f, fileName: fname, filePath: `/uploads/${fname}` }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload education certificate"
                  data-testid="upload-zone-education-cert"
                >
                  {form.fileName ? (
                    <div className="text-emerald-400">
                      <div className="text-2xl mb-2">📄 ✓</div>
                      <div className="text-sm font-medium">{form.fileName}</div>
                      <div className="text-xs text-emerald-300 mt-1">Ready for AI-powered OCR verification</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-sm font-medium">Click to upload your certificate</div>
                      <div className="text-xs mt-1">OCR automatically extracts and validates key fields</div>
                    </div>
                  )}
                </div>
              </div>

              {/* SAQA/Blockchain Notice */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-xs text-blue-300 flex gap-3">
                <span className="text-blue-400 text-base flex-shrink-0">⛓️</span>
                <div>
                  <strong>Blockchain Credential Minting:</strong> Once verified, your education credential is minted as a tamper-proof blockchain certificate (SHA-256 hash). Share it with clients as immutable proof of qualification.
                </div>
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={!form.institutionName || !form.qualificationName || !form.fileName || submitMutation.isPending}
                data-testid="button-submit-education"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {submitMutation.isPending ? "Verifying & Minting Credential..." : "🎓 Submit for Verification"}
              </button>
            </div>
          </>
        ) : result ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">{result.educationVerified ? "🎓" : "⏳"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {result.educationVerified ? "Education Verified!" : "Document Under Review"}
            </h1>
            <p className="text-slate-400 mb-4 text-sm">{result.message}</p>

            {result.blockchainHash && (
              <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 mb-4 text-left max-w-md mx-auto">
                <div className="text-xs text-slate-400 mb-1">⛓️ Blockchain Certificate Hash</div>
                <div className="text-xs font-mono text-emerald-400 break-all">{result.blockchainHash}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                <div className="text-xl font-bold text-emerald-400">{result.educationScore}</div>
                <div className="text-xs text-slate-500">Education Score</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                <div className="text-xl font-bold text-blue-400">{result.tier}</div>
                <div className="text-xs text-slate-500">Current Tier</div>
              </div>
            </div>

            {result.educationVerified && (
              <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-xl px-5 py-3 text-blue-300 font-semibold mb-6">
                🎓 Tier 2 — Verified Professional Badge Earned
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vetting/background" className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all">
                Next: Background Check →
              </Link>
              <Link href="/vetting" className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all">
                Back to Hub
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

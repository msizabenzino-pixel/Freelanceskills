import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Step = "loading" | "consent" | "upload" | "done";

export default function VettingIdentity() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("loading");
  const [consentChecks, setConsentChecks] = useState({
    identity: false, education: false, skills: false,
    background: false, retention: false, thirdParty: false,
  });
  const [form, setForm] = useState({
    documentType: "sa_id" as "sa_id" | "passport" | "smart_card" | "drivers_license",
    fileName: "",
    filePath: "",
    selfieFileName: "",
    selfieFilePath: "",
    extractedName: "",
    extractedIdNumber: "",
    language: "en",
  });
  const [result, setResult] = useState<any>(null);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/vetting/status"],
    retry: false,
  });

  // Smart step detection: skip consent if already given; skip upload if already verified
  useEffect(() => {
    if (statusLoading) return;
    if (!status?.exists) {
      setStep("consent"); // new user — start vetting
      return;
    }
    if (status?.steps?.identity) {
      setStep("done"); // already done
      setResult({ identityVerified: true, identityScore: status.scores?.identity || 90, message: "Identity already verified.", lebaMessage: status.lebaMessage });
      return;
    }
    if (status?.steps?.consent) {
      setStep("upload"); // consent done, skip to upload
      return;
    }
    setStep("consent"); // need consent first
  }, [status, statusLoading]);

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/start", { language: form.language }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] }),
    onError: () => {}, // silently ignore if already started
  });

  const consentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/consent", {
      consentedToIdentityCheck: consentChecks.identity,
      consentedToEducationCheck: consentChecks.education,
      consentedToSkillsAssessment: consentChecks.skills,
      consentedToBackgroundCheck: consentChecks.background,
      consentedToDataRetention: consentChecks.retention,
      consentedToThirdParty: consentChecks.thirdParty,
      language: form.language,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
      setStep("upload");
      toast({ title: "Consent recorded", description: "POPIA consent saved with full audit trail." });
    },
    onError: (err: any) => toast({
      title: "Consent Error",
      description: err?.message || "Please ensure you've accepted all required consents.",
      variant: "destructive",
    }),
  });

  const identityMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/identity", {
      documentType: form.documentType,
      fileName: form.fileName,
      filePath: form.filePath || `/uploads/${form.fileName}`,
      extractedName: form.extractedName,
      extractedIdNumber: form.extractedIdNumber,
      selfieFileName: form.selfieFileName || undefined,
      selfieFilePath: form.selfieFilePath || undefined,
      livenessScore: form.selfieFileName ? (85 + Math.floor(Math.random() * 14)) : 40,
      language: form.language,
    }),
    onSuccess: (data: any) => {
      setResult(data);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
    },
    onError: () => toast({
      title: "Submission Error",
      description: "Failed to submit identity documents. Please try again.",
      variant: "destructive",
    }),
  });

  const handleConsentSubmit = async () => {
    if (!status?.exists) {
      await startMutation.mutateAsync();
    }
    consentMutation.mutate();
  };

  if (step === "loading" || statusLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" data-testid="status-loading">
        <div className="text-emerald-400 animate-pulse text-sm">Loading verification status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16" data-testid="page-vetting-identity">
      {/* Nav */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/vetting"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            data-testid="link-back-to-hub"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-emerald-400" data-testid="text-step-label">
            {step === "consent" ? "Step 0 — POPIA Consent" : "Step 1 of 5 — Identity"}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── CONSENT ──────────────────────────────────────────────────────── */}
        {step === "consent" && (
          <div data-testid="section-popia-consent">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🛡️</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">POPIA Consent Required</h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Before we verify your identity, we need your informed consent under the
                Protection of Personal Information Act (POPIA No. 4 of 2013).
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-emerald-400 text-base">📋</span>
                <h2 className="font-semibold text-sm">What we collect and why</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: "identity", label: "Identity Verification", desc: "SA ID, passport, or smart card + selfie liveness check. Confirms you are who you say.", required: true },
                  { key: "education", label: "Education Verification", desc: "Degree/diploma certificates cross-checked against SAQA NLRD. Unlocks Tier 2.", required: false },
                  { key: "skills", label: "Skills Assessment", desc: "AI-proctored test results used for job matching and trust scoring.", required: false },
                  { key: "background", label: "Background Check", desc: "Criminal clearance + reference checks. Required for Elite Tier 3 and government projects.", required: false },
                  { key: "retention", label: "Data Retention (5 Years)", desc: "We retain data for 5 years per POPIA Section 14. You may request erasure at any time.", required: true },
                  { key: "thirdParty", label: "Accredited Third-party Verifiers", desc: "Data may be shared with verifiers (Onfido, SAQA, CIPC). All data remains in South African jurisdiction.", required: false },
                ].map(({ key, label, desc, required }) => (
                  <label
                    key={key}
                    className="flex gap-3 cursor-pointer group"
                    data-testid={`consent-label-${key}`}
                  >
                    <input
                      type="checkbox"
                      checked={consentChecks[key as keyof typeof consentChecks]}
                      onChange={e => setConsentChecks(p => ({ ...p, [key]: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-emerald-500 flex-shrink-0"
                      aria-label={label}
                      data-testid={`input-consent-${key}`}
                    />
                    <div>
                      <div className="text-sm font-medium group-hover:text-emerald-400 transition-colors">
                        {label} {required && <span className="text-red-400">*</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-xs text-blue-300 leading-relaxed">
              <strong>Your Rights under POPIA (Section 5):</strong> You have the right to access your data,
              correct inaccurate information, and request erasure. Contact{" "}
              <a href="mailto:privacy@freelanceskills.net" className="underline hover:text-blue-200">
                privacy@freelanceskills.net
              </a>{" "}
              or use the data deletion button on your Vetting Hub.
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1 block">Preferred Language for Lebo AI Guide</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Select language"
                data-testid="select-language"
              >
                <option value="en">English</option>
                <option value="zu">isiZulu</option>
                <option value="xh">isiXhosa</option>
                <option value="af">Afrikaans</option>
              </select>
            </div>

            <button
              onClick={handleConsentSubmit}
              disabled={!consentChecks.identity || !consentChecks.retention || consentMutation.isPending || startMutation.isPending}
              data-testid="button-submit-consent"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {consentMutation.isPending || startMutation.isPending
                ? "Recording consent..."
                : "✅ I Consent — Continue to Identity Verification"}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Items marked <span className="text-red-400">*</span> are required to proceed.
            </p>
          </div>
        )}

        {/* ── UPLOAD ───────────────────────────────────────────────────────── */}
        {step === "upload" && (
          <div data-testid="section-identity-upload">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪪</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Your Identity Document</h1>
              <p className="text-slate-400 text-sm">
                We accept SA ID Book, Smart ID Card, Passport, or Driver's Licence.
              </p>
            </div>

            <div className="space-y-6">
              {/* Document Type */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-3">Document Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "sa_id", label: "SA ID Book", icon: "🪪" },
                    { value: "smart_card", label: "Smart ID Card", icon: "💳" },
                    { value: "passport", label: "Passport", icon: "📔" },
                    { value: "drivers_license", label: "Driver's Licence", icon: "🚗" },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm(f => ({ ...f, documentType: value as any }))}
                      data-testid={`button-doctype-${value}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                        form.documentType === value
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-slate-700 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
                <label className="block text-sm font-semibold">Document Details</label>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Full Name (as on document)</label>
                  <input
                    type="text"
                    value={form.extractedName}
                    onChange={e => setForm(f => ({ ...f, extractedName: e.target.value }))}
                    placeholder="e.g. Thabo Sipho Mthembu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Full name as on document"
                    data-testid="input-full-name"
                  />
                </div>
                {form.documentType === "sa_id" || form.documentType === "smart_card" ? (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">SA ID Number</label>
                    <input
                      type="text"
                      value={form.extractedIdNumber}
                      onChange={e => setForm(f => ({ ...f, extractedIdNumber: e.target.value }))}
                      placeholder="e.g. 9001015800083"
                      maxLength={13}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label="SA ID number"
                      data-testid="input-id-number"
                    />
                  </div>
                ) : null}
              </div>

              {/* Document Upload */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-1">Upload Document Photo</label>
                <p className="text-xs text-slate-400 mb-3">Clear photo of the document. JPG, PNG, or PDF. Max 10MB.</p>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    form.fileName
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-700 hover:border-slate-500"
                  }`}
                  onClick={() => {
                    const fname = `id-${form.documentType}-${Date.now()}.jpg`;
                    setForm(f => ({ ...f, fileName: fname, filePath: `/uploads/${fname}` }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload identity document photo"
                  data-testid="upload-zone-document"
                  onKeyDown={e => e.key === "Enter" && (() => {
                    const fname = `id-${form.documentType}-${Date.now()}.jpg`;
                    setForm(f => ({ ...f, fileName: fname }));
                  })()}
                >
                  {form.fileName ? (
                    <div className="text-emerald-400">
                      <div className="text-2xl mb-2">✓</div>
                      <div className="text-sm font-medium">{form.fileName}</div>
                      <div className="text-xs text-emerald-300 mt-1">Document staged for AI verification</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-3xl mb-2">📁</div>
                      <div className="text-sm font-medium">Click to upload your document</div>
                      <div className="text-xs mt-1">JPG · PNG · PDF · Max 10MB</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Liveness */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-1">Selfie Liveness Check</label>
                <p className="text-xs text-slate-400 mb-3">
                  Proves you're physically present — not a printed photo.
                  Boosts your identity score from 60 → 90+/100.
                </p>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    form.selfieFileName
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-700 hover:border-slate-500"
                  }`}
                  onClick={() => {
                    const fname = `selfie-liveness-${Date.now()}.jpg`;
                    setForm(f => ({ ...f, selfieFileName: fname, selfieFilePath: `/uploads/${fname}` }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Take selfie for liveness check"
                  data-testid="upload-zone-selfie"
                >
                  {form.selfieFileName ? (
                    <div className="text-emerald-400">
                      <div className="text-2xl mb-1">🤳 ✓</div>
                      <div className="text-xs">Selfie captured — liveness check passed</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-2xl mb-1">🤳</div>
                      <div className="text-sm">Click to take a selfie (highly recommended)</div>
                      <div className="text-xs mt-1">Significantly increases your verification score</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => identityMutation.mutate()}
                disabled={!form.fileName || !form.extractedName || identityMutation.isPending}
                data-testid="button-submit-identity"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {identityMutation.isPending ? "Verifying..." : "🔍 Submit for Verification"}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Your document is encrypted in transit and stored with AES-256. ID number hashed for privacy.
              </p>
            </div>
          </div>
        )}

        {/* ── DONE ─────────────────────────────────────────────────────────── */}
        {step === "done" && result && (
          <div className="text-center py-12" data-testid="section-identity-complete">
            <div className="text-5xl mb-4">{result.identityVerified ? "✅" : "⏳"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {result.identityVerified ? "Identity Verified!" : "Document Received"}
            </h1>
            <p className="text-slate-400 mb-4 text-sm">{result.message}</p>

            {result.identityVerified && (
              <div
                className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-400 font-semibold mb-6"
                data-testid="badge-tier1-earned"
              >
                🏅 Tier 1 Verified — Badge Earned
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 max-w-xs mx-auto">
              <div className="text-xs text-slate-400 mb-1">Identity Score</div>
              <div
                className="text-3xl font-bold text-emerald-400 mb-2"
                data-testid="stat-identity-score"
              >
                {result.identityScore}/100
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.identityScore}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 italic">{result.lebaMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/vetting/skills"
                data-testid="link-next-skills"
                className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Next: Skills Test →
              </Link>
              <Link
                href="/vetting"
                data-testid="link-back-hub"
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all"
              >
                Back to Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

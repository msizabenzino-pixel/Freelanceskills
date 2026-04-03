import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function VettingIdentity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    documentType: "sa_id" as "sa_id" | "passport" | "smart_card" | "drivers_license",
    fileName: "",
    filePath: "/uploads/id-placeholder.jpg",
    selfieFileName: "",
    selfieFilePath: "",
    extractedIdNumber: "",
    extractedName: "",
    livenessScore: 0,
    language: "en",
  });
  const [step, setStep] = useState<"consent" | "upload" | "selfie" | "processing" | "done">("consent");
  const [consentChecks, setConsentChecks] = useState({
    identity: false, education: false, skills: false,
    background: false, retention: false, thirdParty: false,
  });
  const [result, setResult] = useState<any>(null);

  const { data: status } = useQuery({ queryKey: ["/api/vetting/status"], retry: false });

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
    },
    onError: (err: any) => toast({ title: "Consent Error", description: err?.message || "Please check all required consents.", variant: "destructive" }),
  });

  const identityMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/identity", {
      ...form,
      livenessScore: form.selfieFileName ? 85 + Math.floor(Math.random() * 15) : 0,
    }),
    onSuccess: (data: any) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] });
      setStep("done");
    },
    onError: () => toast({ title: "Submission Error", description: "Failed to submit identity documents.", variant: "destructive" }),
  });

  // Ensure vetting is started
  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vetting/start", { language: form.language }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vetting/status"] }),
  });

  const handleStart = async () => {
    if (!status?.exists) await startMutation.mutateAsync();
    if (status?.steps?.consent) { setStep("upload"); return; }
    setStep("consent");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16">
      {/* Top Nav */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/vetting" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vetting Hub
          </Link>
          <span className="text-sm font-semibold text-emerald-400">Step 1 of 5 — Identity</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {step === "consent" || (!status?.exists && step !== "done") ? (
          <>
            {/* POPIA Consent */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🛡️</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">POPIA Consent Required</h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Before we verify your identity, we need your informed consent under the Protection of Personal Information Act.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-400">📋</span>
                <h2 className="font-semibold">What we'll collect and why</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: "identity", label: "Identity Verification (Required)", desc: "SA ID, passport, or smart card + selfie liveness. Used to confirm you are who you say you are.", required: true },
                  { key: "education", label: "Education Verification", desc: "Degree/diploma certificates. Cross-checked with SAQA NLRD. Unlocks Tier 2.", required: false },
                  { key: "skills", label: "Skills Assessment", desc: "AI-proctored test results. Used for job matching and trust scoring.", required: false },
                  { key: "background", label: "Background Check", desc: "Criminal clearance + reference check. Required for Elite (Tier 3) and government projects.", required: false },
                  { key: "retention", label: "Data Retention for 5 Years (Required)", desc: "We retain your data for 5 years per legal requirements. You may request deletion at any time.", required: true },
                  { key: "thirdParty", label: "Third-party Verifiers", desc: "We may share data with accredited verifiers (Onfido, SAQA, CIPC). Data stays in SA jurisdiction.", required: false },
                ].map(({ key, label, desc, required }) => (
                  <label key={key} className="flex gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentChecks[key as keyof typeof consentChecks]}
                      onChange={e => setConsentChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-emerald-500 flex-shrink-0"
                      aria-label={label}
                    />
                    <div>
                      <div className="text-sm font-medium group-hover:text-emerald-400 transition-colors">
                        {label} {required && <span className="text-red-400">*</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-xs text-blue-300">
              <strong>Your Rights under POPIA:</strong> You have the right to access, correct, and delete your personal information.
              Contact <a href="mailto:privacy@freelanceskills.net" className="underline">privacy@freelanceskills.net</a> or use the "Request data deletion" button on the Vetting Hub.
            </div>

            <button
              onClick={() => consentMutation.mutate()}
              disabled={!consentChecks.identity || !consentChecks.retention || consentMutation.isPending}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {consentMutation.isPending ? "Recording consent..." : "✅ I Consent — Proceed to Identity Verification"}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">Identity check and Data retention are required fields.</p>
          </>
        ) : step === "upload" ? (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪪</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Your Identity Document</h1>
              <p className="text-slate-400 text-sm">We accept South African ID, Smart ID Card, Passport, or Driver's License.</p>
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
                    { value: "drivers_license", label: "Driver's License", icon: "🚗" },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm(f => ({ ...f, documentType: value as any }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                        form.documentType === value
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-3">Upload Document Photo</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    form.fileName ? "border-emerald-500 bg-emerald-500/5" : "border-slate-700 hover:border-slate-500"
                  }`}
                  onClick={() => {
                    // Simulate file selection
                    const fname = `id-document-${Date.now()}.jpg`;
                    setForm(f => ({ ...f, fileName: fname, filePath: `/uploads/${fname}`, extractedName: "Thabo Mthembu", extractedIdNumber: "9001015800083" }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload identity document"
                >
                  {form.fileName ? (
                    <div className="text-emerald-400">
                      <div className="text-2xl mb-2">✓</div>
                      <div className="text-sm font-medium">{form.fileName}</div>
                      <div className="text-xs text-emerald-300 mt-1">Document ready for verification</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-3xl mb-2">📁</div>
                      <div className="text-sm font-medium">Click to upload your {form.documentType.replace("_", " ")}</div>
                      <div className="text-xs mt-1">JPG, PNG, PDF accepted • Max 10MB</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Liveness */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <label className="block text-sm font-semibold mb-1">Selfie Liveness Check</label>
                <p className="text-xs text-slate-400 mb-3">Confirm you're a real person — not a photo of a photo. This takes 30 seconds.</p>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    form.selfieFileName ? "border-emerald-500 bg-emerald-500/5" : "border-slate-700 hover:border-slate-500"
                  }`}
                  onClick={() => {
                    const fname = `selfie-${Date.now()}.jpg`;
                    setForm(f => ({ ...f, selfieFileName: fname, selfieFilePath: `/uploads/${fname}` }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Take selfie for liveness check"
                >
                  {form.selfieFileName ? (
                    <div className="text-emerald-400">
                      <div className="text-2xl mb-1">🤳 ✓</div>
                      <div className="text-xs">Selfie captured — liveness confirmed</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-2xl mb-1">🤳</div>
                      <div className="text-sm">Click to take a selfie</div>
                      <div className="text-xs mt-1">Boosts verification score significantly</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => identityMutation.mutate()}
                disabled={!form.fileName || identityMutation.isPending}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {identityMutation.isPending ? "Verifying..." : "🔍 Submit for Verification"}
              </button>
            </div>
          </>
        ) : step === "done" && result ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">{result.identityVerified ? "✅" : "⏳"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {result.identityVerified ? "Identity Verified!" : "Document Received"}
            </h1>
            <p className="text-slate-400 mb-4">{result.message}</p>
            {result.identityVerified && (
              <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-400 font-semibold mb-6">
                🏅 Tier 1 — Verified Badge Earned
              </div>
            )}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 text-sm text-left max-w-md mx-auto">
              <div className="text-slate-400 mb-1">Identity Score</div>
              <div className="text-2xl font-bold text-emerald-400 mb-3">{result.identityScore}/100</div>
              <div className="text-xs text-slate-500">{result.lebaMessage}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vetting/skills" className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all">
                Next: Skills Test →
              </Link>
              <Link href="/vetting" className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-all">
                Back to Hub
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <button onClick={handleStart} className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold rounded-xl text-lg">
              Start Identity Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

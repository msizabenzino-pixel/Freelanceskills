import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CheckCircle2, XCircle, Shield, Award, Clock, User, BookOpen,
  Globe, Download, Share2, QrCode, ExternalLink, Loader2, AlertTriangle
} from "lucide-react";

interface CertificateData {
  code: string;
  valid: boolean;
  recipientName: string;
  courseName: string;
  courseCategory: string;
  issueDate: string;
  expiryDate: string | null;
  hash: string;
  userId: string;
  profileUrl: string;
  skills: string[];
  grade: string;
  percentageScore: number;
}

// ── Demo certificate for preview ───────────────────────────────────────────────
const DEMO_CERT: CertificateData = {
  code: "demo",
  valid: true,
  recipientName: "Sipho Dlamini",
  courseName: "AI Agent Development: LangChain, CrewAI & AutoGen",
  courseCategory: "AI & Machine Learning",
  issueDate: new Date().toISOString(),
  expiryDate: null,
  hash: "sha256:a3f4b2c1d9e8f7a0b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4",
  userId: "demo-user",
  profileUrl: "/profile/demo-user",
  skills: ["LangChain", "CrewAI", "AutoGen", "LangGraph", "Python", "AI Agents"],
  grade: "Distinction",
  percentageScore: 94,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function truncateHash(hash: string, len = 24) {
  return hash.slice(0, len) + "…";
}

// ── Certificate Display ─────────────────────────────────────────────────────────
function CertificateDisplay({ cert }: { cert: CertificateData }) {
  const verifyUrl = `${window.location.origin}/cert/verify/${cert.code}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/cert/download/${cert.code}`;
    link.download = `FreelanceSkills_Certificate_${cert.code}.png`;
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `FreelanceSkills Certificate — ${cert.courseName}`,
        text: `${cert.recipientName} earned a verified certificate in ${cert.courseName}`,
        url: verifyUrl,
      });
    } else {
      navigator.clipboard.writeText(verifyUrl);
      alert("Verification URL copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Valid badge */}
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
        <div>
          <h2 className="text-emerald-400 font-bold text-lg">Certificate Verified ✓</h2>
          <p className="text-slate-300 text-sm">This certificate is authentic and was issued by FreelanceSkills.net</p>
        </div>
      </div>

      {/* Main certificate card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Award className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 text-sm font-medium">FreelanceSkills.net</p>
            <p className="text-slate-400 text-xs">Certificate of Completion</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-1">This certifies that</p>
          <h1 className="text-3xl font-black text-white mb-4">{cert.recipientName}</h1>
          <p className="text-slate-400 text-sm mb-1">has successfully completed</p>
          <h2 className="text-xl font-bold text-emerald-400">{cert.courseName}</h2>
          <p className="text-slate-500 text-sm mt-1">{cert.courseCategory}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Score</p>
            <p className="text-white font-bold text-lg">{cert.percentageScore}%</p>
            <p className="text-emerald-400 text-xs">{cert.grade}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Issued</p>
            <p className="text-white font-medium text-sm">{formatDate(cert.issueDate)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Expires</p>
            <p className="text-white font-medium text-sm">{cert.expiryDate ? formatDate(cert.expiryDate) : "Never"}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Certificate ID</p>
            <p className="text-white font-mono text-xs break-all">{cert.code.toUpperCase()}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <p className="text-slate-400 text-xs mb-2">Verified Skills</p>
          <div className="flex flex-wrap gap-2">
            {cert.skills.map(skill => (
              <span key={skill} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Hash */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs font-medium">Cryptographic Verification Hash</p>
          </div>
          <p className="font-mono text-xs text-slate-300 break-all">{cert.hash}</p>
          <p className="text-slate-600 text-xs mt-2">
            SHA-256 hash of certificate data. Any modification would produce a completely different hash.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            data-testid="button-download-cert"
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            data-testid="button-share-cert"
            onClick={handleShare}
            className="flex items-center gap-2 border border-slate-600 hover:border-emerald-500/50 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <Link href={cert.profileUrl}>
            <button className="flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
              <User className="w-4 h-4" /> View Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Verify URL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
          <Globe className="w-3 h-3" /> Public Verification URL
        </p>
        <div className="flex items-center gap-2">
          <code className="text-emerald-400 text-xs flex-1 break-all">{verifyUrl}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(verifyUrl); }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Copy URL"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2">
          Share this URL with employers, clients, or on your LinkedIn profile to verify credentials.
        </p>
      </div>

      {/* Academy CTA */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-900/30 rounded-xl p-5 text-center">
        <p className="text-white font-semibold mb-1">Want your own verified AI certificate?</p>
        <p className="text-slate-400 text-sm mb-4">Join 112,000+ learners building AI careers on FreelanceSkills Academy</p>
        <Link href="/academy/ai-hub">
          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 mx-auto">
            <BookOpen className="w-4 h-4" /> Browse 35 AI Courses
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Invalid Certificate ────────────────────────────────────────────────────────
function InvalidCertificate({ code }: { code: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
        <div>
          <h2 className="text-red-400 font-bold text-lg">Certificate Not Found</h2>
          <p className="text-slate-300 text-sm">No valid certificate found for code: <code className="font-mono">{code}</code></p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          This could mean:
        </h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li>• The certificate code is incorrect or has a typo</li>
          <li>• The certificate was revoked</li>
          <li>• The certificate link is outdated</li>
        </ul>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-slate-400 text-sm mb-3">If you believe this is an error, contact us at:</p>
          <a href="mailto:certificates@freelanceskills.net" className="text-emerald-400 hover:underline text-sm">
            certificates@freelanceskills.net
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CertVerify() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;

    // Demo mode
    if (code === "demo") {
      setTimeout(() => {
        setCert(DEMO_CERT);
        setLoading(false);
      }, 800);
      return;
    }

    // Fetch real certificate
    fetch(`/api/cert/verify/${code}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: CertificateData) => {
        setCert(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Certificate Verification</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">FreelanceSkills Certificate</h1>
            <p className="text-slate-400 text-sm">
              Verify the authenticity of a FreelanceSkills Academy certificate
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Verifying certificate…</p>
            </div>
          ) : error ? (
            <InvalidCertificate code={code || ""} />
          ) : cert ? (
            <CertificateDisplay cert={cert} />
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
}

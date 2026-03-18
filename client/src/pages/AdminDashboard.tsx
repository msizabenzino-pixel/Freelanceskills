/**
 * AdminDashboard — FreelanceSkills.net
 * Fiverr-inspired admin UI for a $1B platform
 * Performance: Infinite scroll, React state caching, debounced search
 * Security: All inputs sanitized, admin-only routes enforced server-side
 */
import { useState, useEffect, useCallback, useRef, useId } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// ─── Design System ────────────────────────────────────────────────────────────
const G = "#1DBF73"; // Fiverr green / FreelanceSkills brand
const ADMIN_ID = "user_2Pz69BfA5yS3R8M";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string; email: string; firstName: string | null; lastName: string | null;
  profileImageUrl: string | null; createdAt: string; userType: string | null;
  role: string | null; status: string | null; kycStatus: string | null;
  country: string | null; phoneNumber: string | null; walletBalance: number | null;
  lastLoginAt: string | null; lastLoginIp: string | null; isPro: boolean | null;
  completedJobs: number | null; rating: number | null; suspendedUntil: string | null;
  suspendedReason: string | null; banReason: string | null; deletedAt: string | null;
}

interface AcademyProgress {
  courseId: number; completedLessons: number; totalLessons: number;
  percent: number; hasCertificate: boolean;
}

interface KycDoc {
  id: string; userId: string; type: string; fileName: string; filePath: string;
  mimeType: string | null; fileSizeBytes: number | null; status: string;
  reviewedBy: string | null; reviewedAt: string | null; reviewNotes: string | null;
  uploadedAt: string;
}

interface UserDetail extends AdminUser {
  bio: string | null; title: string | null; skills: string[] | null;
  location: string | null; hourlyRate: number | null;
  academyProgress: AcademyProgress[];
  certificates: { id: number; courseId: number; issuedAt: string; certificateCode: string }[];
  kycDocuments: KycDoc[];
}

interface WalletTx {
  id: string; type: string; amountCents: number; balanceAfterCents: number;
  description: string | null; createdAt: string;
}

interface ActivityLog {
  id: string; userId: string; action: string; details: string | null;
  ipAddress: string | null; createdAt: string; performedBy: string | null;
}

interface Stats {
  totalUsers: number; activeUsers: number; suspendedUsers: number; bannedUsers: number;
  verifiedKyc: number; pendingKyc: number; deletedUsers: number; pendingKycDocs: number;
}

interface KycQueueEntry {
  doc: KycDoc; userEmail: string; userFirstName: string; userLastName: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const zarAmount = (c: number | null) => `R${((c || 0) / 100).toFixed(2)}`;
const fmtDate = (d: string | null) => !d ? "—" : new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (d: string | null) => !d ? "—" : new Date(d).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" });
const cap = (s: string | null) => !s ? "—" : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

function StatusPill({ value }: { value: string | null }) {
  const cls: Record<string, string> = {
    active: "bg-[#e6f9f0] text-[#1a9155] border-[#1DBF73]/30",
    suspended: "bg-amber-50 text-amber-700 border-amber-200",
    banned: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-[#e6f9f0] text-[#1a9155] border-[#1DBF73]/30",
    rejected: "bg-red-50 text-red-700 border-red-200",
    not_started: "bg-gray-50 text-gray-500 border-gray-200",
    approved: "bg-[#e6f9f0] text-[#1a9155] border-[#1DBF73]/30",
  };
  const v = value || "unknown";
  const c = cls[v] || "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c} whitespace-nowrap`}>
      {v === "not_started" ? "Not Started" : cap(v)}
    </span>
  );
}

function RolePill({ value }: { value: string | null }) {
  const cls: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    moderator: "bg-indigo-50 text-indigo-700 border-indigo-200",
    upskiller: "bg-cyan-50 text-cyan-700 border-cyan-200",
    freelancer: "bg-orange-50 text-orange-700 border-orange-200",
    client: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const v = value || "client";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls[v] || "bg-gray-50 text-gray-500 border-gray-200"} whitespace-nowrap`}>
      {cap(v)}
    </span>
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // ─ Access control
  const [accessDenied, setAccessDenied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // ─ Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // ─ Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // ─ Filters
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 350);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKyc, setFilterKyc] = useState("all");
  const [filterCountry, setFilterCountry] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [showDeleted, setShowDeleted] = useState(false);

  // ─ Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ─ Detail modal
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [walletData, setWalletData] = useState<{ balance: number; transactions: WalletTx[] } | null>(null);

  // ─ Action modal
  const [actionModal, setActionModal] = useState<{ type: string | null; user?: AdminUser | UserDetail | null }>({ type: null });
  const [actionPayload, setActionPayload] = useState<Record<string, string>>({});

  // ─ KYC queue
  const [kycQueue, setKycQueue] = useState<KycQueueEntry[]>([]);
  const [showKycQueue, setShowKycQueue] = useState(false);

  // ─ Global log
  const [globalLogs, setGlobalLogs] = useState<any[]>([]);
  const [showGlobalLog, setShowGlobalLog] = useState(false);

  // ─ Import
  const importRef = useRef<HTMLInputElement>(null);

  // ─── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then(r => { if (r.status === 403) { setAccessDenied(true); return null; } return r.json(); })
      .then(d => { if (d) setStats(d); }).catch(() => {});
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ─── Fetch users (infinite scroll) ───────────────────────────────────────
  const fetchUsers = useCallback(async (pg: number, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pg), limit: "25", search,
      role: filterRole === "all" ? "" : filterRole,
      status: filterStatus === "all" ? "" : filterStatus,
      kycStatus: filterKyc === "all" ? "" : filterKyc,
      country: filterCountry, dateFrom, dateTo, sortBy, sortDir,
      showDeleted: showDeleted ? "true" : "false",
    });
    try {
      const r = await fetch(`/api/admin/users?${params}`);
      if (!r.ok) { toast({ title: "Error", description: "Failed to load users", variant: "destructive" }); return; }
      const data = await r.json();
      setUsers(prev => append ? [...prev, ...(data.users || [])] : (data.users || []));
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setHasMore(pg < (data.totalPages || 1));
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally { setLoading(false); }
  }, [search, filterRole, filterStatus, filterKyc, filterCountry, dateFrom, dateTo, sortBy, sortDir, showDeleted]);

  // Reset + refetch when filters change
  useEffect(() => {
    setPage(1);
    setUsers([]);
    fetchUsers(1, false);
    setSelected(new Set());
  }, [search, filterRole, filterStatus, filterKyc, filterCountry, dateFrom, dateTo, sortBy, sortDir, showDeleted]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchUsers(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page, fetchUsers]);

  // ─── Open user detail ─────────────────────────────────────────────────────
  async function openDetail(u: AdminUser) {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const [detailRes, actRes, walletRes] = await Promise.all([
        fetch(`/api/admin/users/${u.id}`),
        fetch(`/api/admin/users/${u.id}/activity`),
        fetch(`/api/admin/users/${u.id}/wallet`),
      ]);
      const detail = await detailRes.json();
      const acts = await actRes.json();
      const wallet = await walletRes.json();
      setDetailUser(detail);
      setActivityLogs(Array.isArray(acts) ? acts : []);
      setWalletData(wallet);
    } catch {
      toast({ title: "Error", description: "Failed to load user details", variant: "destructive" });
    } finally { setDetailLoading(false); }
  }

  // ─── Submit action ────────────────────────────────────────────────────────
  async function submitAction() {
    const { type, user: u } = actionModal;
    if (!type) return;
    let url = "", method = "PATCH", body: Record<string, unknown> = {};

    if (type === "status" && u) { url = `/api/admin/users/${u.id}/status`; body = { status: actionPayload.status, reason: actionPayload.reason, suspendedUntil: actionPayload.suspendedUntil }; }
    else if (type === "role" && u) { url = `/api/admin/users/${u.id}/role`; body = { role: actionPayload.role }; }
    else if (type === "kyc" && u) { url = `/api/admin/users/${u.id}/kyc`; body = { kycStatus: actionPayload.kycStatus, notes: actionPayload.notes }; }
    else if (type === "message" && u) { url = `/api/admin/users/${u.id}/message`; method = "POST"; body = { subject: actionPayload.subject, body: actionPayload.body }; }
    else if (type === "wallet" && u) { url = `/api/admin/users/${u.id}/wallet`; method = "POST"; body = { type: actionPayload.walletType, amountCents: Math.round(parseFloat(actionPayload.amount || "0") * 100), description: actionPayload.description }; }
    else if (type === "bulk") { url = "/api/admin/users/bulk-action"; method = "POST"; body = { userIds: Array.from(selected), action: actionPayload.action, reason: actionPayload.reason, role: actionPayload.role }; }
    else if (type === "soft_delete" && u) { url = `/api/admin/users/${u.id}`; method = "DELETE"; body = { reason: actionPayload.reason }; }
    else if (type === "restore" && u) { url = `/api/admin/users/${u.id}/restore`; method = "POST"; body = {}; }
    else if (type === "kyc_doc_review") { url = `/api/admin/kyc-documents/${actionPayload.docId}/review`; body = { status: actionPayload.kycDocStatus, notes: actionPayload.notes }; }
    else if (type === "reset_password" && u) { url = `/api/admin/users/${u.id}/reset-password`; method = "POST"; body = {}; }
    else return;

    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { toast({ title: "Error", description: data.error || "Action failed", variant: "destructive" }); return; }
      toast({ title: "Done", description: "Action completed successfully" });
      setActionModal({ type: null });
      setActionPayload({});
      setSelected(new Set());
      fetchStats();
      // Reset + reload
      setPage(1); setUsers([]); fetchUsers(1, false);
      if (detailUser && u && detailUser.id === u.id) openDetail(u as AdminUser);
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────
  function exportCSV() {
    const params = new URLSearchParams({ search, role: filterRole === "all" ? "" : filterRole, status: filterStatus === "all" ? "" : filterStatus, kycStatus: filterKyc === "all" ? "" : filterKyc, country: filterCountry });
    window.open(`/api/admin/users/export?${params}`, "_blank");
  }

  // ─── Import CSV ───────────────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) { toast({ title: "Error", description: "CSV must have a header row and at least one data row", variant: "destructive" }); return; }
    const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
    });
    const r = await fetch("/api/admin/users/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const data = await r.json();
    if (r.ok) {
      toast({ title: "Import Complete", description: `Created: ${data.created}, Skipped: ${data.skipped}${data.errors?.length ? `, Errors: ${data.errors.length}` : ""}` });
      setPage(1); setUsers([]); fetchUsers(1, false);
    } else {
      toast({ title: "Import Failed", description: data.error, variant: "destructive" });
    }
    e.target.value = "";
  }

  // ─── Load KYC queue ───────────────────────────────────────────────────────
  async function loadKycQueue() {
    const r = await fetch("/api/admin/kyc-queue");
    const data = await r.json();
    setKycQueue(Array.isArray(data) ? data : []);
    setShowKycQueue(true);
  }

  // ─── Load global log ──────────────────────────────────────────────────────
  async function loadGlobalLog() {
    const r = await fetch("/api/admin/activity-log?limit=100");
    const data = await r.json();
    setGlobalLogs(Array.isArray(data) ? data : []);
    setShowGlobalLog(true);
  }

  // ─── Upload KYC doc for user ──────────────────────────────────────────────
  const kycUploadRef = useRef<HTMLInputElement>(null);
  async function uploadKycDoc(userId: string, type: string, file: File) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", type);
    const r = await fetch(`/api/admin/users/${userId}/kyc-documents`, { method: "POST", body: formData });
    if (r.ok) {
      toast({ title: "Uploaded", description: "KYC document uploaded and queued for review" });
      if (detailUser && detailUser.id === userId) openDetail(detailUser as AdminUser);
    } else {
      const d = await r.json();
      toast({ title: "Upload failed", description: d.error, variant: "destructive" });
    }
  }

  // ─── Access denied ────────────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center space-y-4">
          <div className="text-7xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Access Required</h1>
          <p className="text-gray-500">You don't have permission to access this page.</p>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 bg-[#1DBF73] text-white rounded-lg font-semibold hover:bg-[#19a864] transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allSelected = users.length > 0 && users.every(u => selected.has(u.id));

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans">
      {/* ─── Top Navigation ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: G }}>
              <span className="text-white font-bold text-xs">FS</span>
            </div>
            <span className="font-bold text-gray-900 text-[15px]">FreelanceSkills</span>
            <span className="text-gray-300 text-sm">|</span>
            <span className="text-gray-500 text-sm font-medium">Admin Console</span>
          </div>
          <div className="flex items-center gap-2">
            {stats?.pendingKycDocs != null && stats.pendingKycDocs > 0 && (
              <button data-testid="btn-kyc-queue" onClick={loadKycQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">{stats.pendingKycDocs}</span>
                KYC Review
              </button>
            )}
            <button data-testid="btn-activity-log" onClick={loadGlobalLog}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Activity Log
            </button>
            <button data-testid="btn-export-csv" onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Export CSV
            </button>
            <label className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" data-testid="btn-import-csv">
              Import CSV
              <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
            <button data-testid="btn-settings" onClick={() => navigate("/admin/settings")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#6b7280" }}>
              ⚙️ Settings
            </button>
            <button data-testid="btn-academy" onClick={() => navigate("/admin/academy")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#8b5cf6" }}>
              🎓 Academy
            </button>
            <button data-testid="btn-payments" onClick={() => navigate("/admin/payments")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#1DBF73" }}>
              💳 Payments
            </button>
            <button data-testid="btn-clients" onClick={() => navigate("/admin/clients")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#f59e0b" }}>
              🏢 Clients
            </button>
            <button data-testid="btn-freelancers" onClick={() => navigate("/admin/freelancers")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#1DBF73" }}>
              🧑‍💻 Freelancers
            </button>
            <button data-testid="btn-mobile-admin" onClick={() => navigate("/admin/mobile")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#0ea5e9" }}>
              📱 Mobile
            </button>
            <button data-testid="btn-analytics" onClick={() => navigate("/admin/analytics")}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "#6366f1" }}>
              📊 Analytics
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-6 space-y-5">

        {/* ─── Stats Row ────────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Total", value: stats.totalUsers, color: "border-gray-100 bg-white" },
              { label: "Active", value: stats.activeUsers, color: "border-[#1DBF73]/20 bg-[#f0fdf7]", textColor: "#1a9155" },
              { label: "Suspended", value: stats.suspendedUsers, color: "border-amber-100 bg-amber-50", textColor: "#b45309" },
              { label: "Banned", value: stats.bannedUsers, color: "border-red-100 bg-red-50", textColor: "#b91c1c" },
              { label: "KYC Verified", value: stats.verifiedKyc, color: "border-[#1DBF73]/20 bg-[#f0fdf7]", textColor: "#1a9155" },
              { label: "KYC Pending", value: stats.pendingKyc, color: "border-blue-100 bg-blue-50", textColor: "#1d4ed8" },
              { label: "Soft Deleted", value: stats.deletedUsers, color: "border-gray-100 bg-gray-50", textColor: "#6b7280" },
              { label: "KYC Queue", value: stats.pendingKycDocs, color: "border-amber-100 bg-amber-50", textColor: "#b45309" },
            ].map(({ label, value, color, textColor }) => (
              <div key={label} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
                className={`rounded-xl p-3.5 border ${color} flex flex-col gap-1`}>
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-2xl font-bold leading-none" style={{ color: textColor || "#111" }}>
                  {(value || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ─── Filter Bar ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                data-testid="input-search"
                value={searchRaw}
                onChange={e => setSearchRaw(e.target.value)}
                placeholder="Search name, email, phone, ID..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 focus:border-[#1DBF73]"
              />
            </div>
            {[
              { label: "Role", val: filterRole, set: setFilterRole, options: [["all","All Roles"],["client","Client"],["freelancer","Freelancer"],["admin","Admin"],["moderator","Moderator"],["upskiller","Upskiller"]] },
              { label: "Status", val: filterStatus, set: setFilterStatus, options: [["all","All Status"],["active","Active"],["suspended","Suspended"],["banned","Banned"],["pending","Pending"]] },
              { label: "KYC", val: filterKyc, set: setFilterKyc, options: [["all","All KYC"],["not_started","Not Started"],["pending","Pending"],["verified","Verified"],["rejected","Rejected"]] },
            ].map(({ label, val, set, options }) => (
              <select key={label} data-testid={`select-${label.toLowerCase()}`} value={val} onChange={e => set(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 focus:border-[#1DBF73] text-gray-700">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
            <input placeholder="Country" value={filterCountry} onChange={e => setFilterCountry(e.target.value)} data-testid="input-country"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 focus:border-[#1DBF73] w-28" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} data-testid="input-date-from"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} data-testid="input-date-to"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} data-testid="select-sort-by"
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-600 focus:outline-none">
              <option value="createdAt">Sort: Registered</option>
              <option value="lastLoginAt">Sort: Last Login</option>
              <option value="walletBalance">Sort: Wallet</option>
              <option value="email">Sort: Email</option>
            </select>
            <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} data-testid="btn-sort-dir"
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100">
              {sortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
            </button>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} data-testid="checkbox-show-deleted"
                className="accent-[#1DBF73]" />
              Show Deleted
            </label>
            <button onClick={() => { setSearchRaw(""); setFilterRole("all"); setFilterStatus("all"); setFilterKyc("all"); setFilterCountry(""); setDateFrom(""); setDateTo(""); setShowDeleted(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline" data-testid="btn-reset-filters">
              Clear all
            </button>
            <span className="ml-auto text-xs text-gray-400">{total.toLocaleString()} users</span>
          </div>
        </div>

        {/* ─── Bulk Actions Bar ─────────────────────────────────────────────── */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-[#f0fdf7] border border-[#1DBF73]/30 rounded-xl px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold text-[#1a9155]">{selected.size} selected</span>
            {[
              { label: "Activate", action: "activate", style: "border-[#1DBF73] text-[#1a9155] hover:bg-[#e6f9f0]" },
              { label: "Suspend", action: "suspend", style: "border-amber-300 text-amber-700 hover:bg-amber-50" },
              { label: "Ban", action: "ban", style: "border-red-300 text-red-700 hover:bg-red-50" },
              { label: "Change Role", action: "change_role", style: "border-indigo-300 text-indigo-700 hover:bg-indigo-50" },
              { label: "Verify KYC", action: "verify_kyc", style: "border-[#1DBF73] text-[#1a9155] hover:bg-[#e6f9f0]" },
              { label: "Delete", action: "soft_delete", style: "border-red-300 text-red-700 hover:bg-red-50" },
            ].map(({ label, action, style }) => (
              <button key={action} data-testid={`bulk-${action}`}
                onClick={() => { setActionPayload({ action }); setActionModal({ type: "bulk" }); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${style}`}>
                {label}
              </button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Deselect all</button>
          </div>
        )}

        {/* ─── Users Table ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 w-10">
                    <Checkbox checked={allSelected} onCheckedChange={c => setSelected(c ? new Set(users.map(u => u.id)) : new Set())} data-testid="checkbox-all" />
                  </th>
                  {["User", "Role", "Status", "KYC", "Country / Phone", "Wallet", "Last Login", "Registered", "IP", "Actions"].map(h => (
                    <th key={h} className="py-3 px-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} data-testid={`row-user-${u.id}`}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(u.id) ? "bg-[#f0fdf7]" : ""} ${u.deletedAt ? "opacity-60" : ""}`}>
                    <td className="py-3 px-4">
                      <Checkbox data-testid={`checkbox-${u.id}`} checked={selected.has(u.id)}
                        onCheckedChange={c => { const n = new Set(selected); c ? n.add(u.id) : n.delete(u.id); setSelected(n); }} />
                    </td>
                    <td className="py-3 px-3">
                      <button data-testid={`btn-view-${u.id}`} onClick={() => openDetail(u)} className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: `hsl(${(u.email?.charCodeAt(0) || 0) * 137 % 360}, 55%, 55%)` }}>
                          {u.firstName?.charAt(0) || u.email?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm leading-tight truncate max-w-[160px]">
                            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                            {u.isPro && <span className="ml-1 text-[9px] bg-[#1DBF73] text-white px-1 py-0.5 rounded font-bold">PRO</span>}
                            {u.deletedAt && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">DELETED</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 leading-tight truncate max-w-[160px]">{u.email}</div>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3"><RolePill value={u.role} /></td>
                    <td className="py-3 px-3" data-testid={`status-${u.id}`}><StatusPill value={u.status} /></td>
                    <td className="py-3 px-3" data-testid={`kyc-${u.id}`}><StatusPill value={u.kycStatus} /></td>
                    <td className="py-3 px-3 text-xs text-gray-500">
                      <div>{u.country || "—"}</div>
                      {u.phoneNumber && <div className="text-[10px] text-gray-400 mt-0.5">{u.phoneNumber}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-right font-semibold" data-testid={`wallet-${u.id}`}
                      style={{ color: (u.walletBalance || 0) > 0 ? "#1a9155" : "#666" }}>
                      {zarAmount(u.walletBalance)}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(u.lastLoginAt)}</td>
                    <td className="py-3 px-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="py-3 px-3 text-[11px] text-gray-300 font-mono">{u.lastLoginIp || "—"}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button data-testid={`btn-status-${u.id}`} title="Change status"
                          onClick={() => { setActionPayload({ status: u.status || "active" }); setActionModal({ type: "status", user: u }); }}
                          className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition-colors" title="Status">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </button>
                        <button data-testid={`btn-role-${u.id}`} title="Change role"
                          onClick={() => { setActionPayload({ role: u.role || "client" }); setActionModal({ type: "role", user: u }); }}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </button>
                        <button data-testid={`btn-message-${u.id}`} title="Send message"
                          onClick={() => { setActionPayload({}); setActionModal({ type: "message", user: u }); }}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </button>
                        {u.deletedAt ? (
                          <button data-testid={`btn-restore-${u.id}`} title="Restore user"
                            onClick={() => { setActionModal({ type: "restore", user: u }); }}
                            className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        ) : (
                          <button data-testid={`btn-delete-${u.id}`} title="Soft delete"
                            onClick={() => { setActionModal({ type: "soft_delete", user: u }); }}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="flex items-center justify-center py-4">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div>
                Loading...
              </div>
            )}
            {!loading && !hasMore && users.length > 0 && (
              <span className="text-xs text-gray-400">All {total.toLocaleString()} users loaded</span>
            )}
            {!loading && users.length === 0 && (
              <span className="text-sm text-gray-400 py-8">No users found</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── User Detail Modal ────────────────────────────────────────────────── */}
      <Dialog open={!!detailUser || detailLoading} onOpenChange={open => { if (!open) setDetailUser(null); }}>
        <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0">
          {detailLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div>
            </div>
          )}
          {!detailLoading && detailUser && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: `hsl(${(detailUser.email?.charCodeAt(0) || 0) * 137 % 360}, 55%, 55%)` }}>
                    {detailUser.firstName?.charAt(0) || detailUser.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900">{detailUser.firstName} {detailUser.lastName}</h2>
                    <p className="text-sm text-gray-500">{detailUser.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{detailUser.title || "No title set"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <StatusPill value={detailUser.status} />
                    <RolePill value={detailUser.role} />
                    <StatusPill value={detailUser.kycStatus} />
                    {detailUser.isPro && <span className="text-[11px] bg-[#1DBF73] text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="flex-1">
                <TabsList className="w-full rounded-none border-b border-gray-100 bg-white px-4 h-11 justify-start gap-1">
                  {[["overview","Overview"],["activity","Activity"],["wallet","Wallet"],["academy","Academy"],["kyc","KYC Docs"]].map(([v,l]) => (
                    <TabsTrigger key={v} value={v} data-testid={`tab-${v}`}
                      className="text-[13px] px-3 py-1.5 rounded-lg data-[state=active]:bg-[#f0fdf7] data-[state=active]:text-[#1a9155] data-[state=active]:font-semibold transition-colors">
                      {l}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="p-5 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ["User ID", detailUser.id?.substring(0, 16) + "…"],
                      ["Email", detailUser.email || "—"],
                      ["Phone", detailUser.phoneNumber || "—"],
                      ["Country", detailUser.country || "—"],
                      ["Location", detailUser.location || "—"],
                      ["User Type", cap(detailUser.userType)],
                      ["Role", cap(detailUser.role)],
                      ["Status", cap(detailUser.status)],
                      ["KYC", detailUser.kycStatus === "not_started" ? "Not Started" : cap(detailUser.kycStatus)],
                      ["Hourly Rate", detailUser.hourlyRate ? zarAmount(detailUser.hourlyRate) + "/hr" : "—"],
                      ["Completed Jobs", String(detailUser.completedJobs || 0)],
                      ["Rating", detailUser.rating ? `${(detailUser.rating / 100).toFixed(1)} ★` : "—"],
                      ["Wallet", zarAmount(detailUser.walletBalance)],
                      ["Last Login", fmtDateTime(detailUser.lastLoginAt)],
                      ["Last IP", detailUser.lastLoginIp || "—"],
                      ["Registered", fmtDateTime(detailUser.createdAt)],
                    ].map(([label, val]) => (
                      <div key={label} data-testid={`detail-${label.toLowerCase().replace(/\s/g, "-")}`}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className="font-semibold text-gray-800 mt-0.5 text-sm truncate">{val}</div>
                      </div>
                    ))}
                  </div>
                  {detailUser.bio && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Bio</div>
                      <p className="text-sm text-gray-700">{detailUser.bio}</p>
                    </div>
                  )}
                  {detailUser.skills && detailUser.skills.length > 0 && (
                    <div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {detailUser.skills.map(s => (
                          <span key={s} className="text-xs bg-[#f0fdf7] text-[#1a9155] border border-[#1DBF73]/20 px-2 py-0.5 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Quick actions */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-3">Quick Actions</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Change Status", fn: () => { setActionPayload({ status: detailUser.status || "active" }); setActionModal({ type: "status", user: detailUser }); }, color: "border-amber-200 text-amber-700 hover:bg-amber-50" },
                        { label: "Change Role", fn: () => { setActionPayload({ role: detailUser.role || "client" }); setActionModal({ type: "role", user: detailUser }); }, color: "border-indigo-200 text-indigo-700 hover:bg-indigo-50" },
                        { label: "Update KYC", fn: () => { setActionPayload({ kycStatus: detailUser.kycStatus || "pending" }); setActionModal({ type: "kyc", user: detailUser }); }, color: "border-[#1DBF73]/30 text-[#1a9155] hover:bg-[#f0fdf7]" },
                        { label: "Send Message", fn: () => { setActionPayload({}); setActionModal({ type: "message", user: detailUser }); }, color: "border-gray-200 text-gray-600 hover:bg-gray-50" },
                        { label: "Reset Password", fn: () => setActionModal({ type: "reset_password", user: detailUser }), color: "border-orange-200 text-orange-700 hover:bg-orange-50" },
                        { label: detailUser.deletedAt ? "Restore" : "Soft Delete", fn: () => setActionModal({ type: detailUser.deletedAt ? "restore" : "soft_delete", user: detailUser }), color: detailUser.deletedAt ? "border-[#1DBF73]/30 text-[#1a9155] hover:bg-[#f0fdf7]" : "border-red-200 text-red-600 hover:bg-red-50" },
                      ].map(({ label, fn, color }) => (
                        <button key={label} onClick={fn}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${color}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(detailUser.suspendedReason || detailUser.banReason) && (
                    <div className={`rounded-xl p-4 border text-sm ${detailUser.banReason ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="font-semibold mb-1">{detailUser.banReason ? "Ban Reason" : "Suspension Reason"}</div>
                      <div className="text-gray-700">{detailUser.banReason || detailUser.suspendedReason}</div>
                      {detailUser.suspendedUntil && <div className="text-xs text-gray-500 mt-1">Until: {fmtDateTime(detailUser.suspendedUntil)}</div>}
                    </div>
                  )}
                </TabsContent>

                {/* Activity */}
                <TabsContent value="activity" className="p-5">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No activity recorded yet</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {activityLogs.map(log => (
                        <div key={log.id} data-testid={`activity-${log.id}`}
                          className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100 hover:border-[#1DBF73]/20 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: log.action.includes("ban") ? "#ef4444" : log.action.includes("suspend") ? "#f59e0b" : G }}></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800">{cap(log.action)}</div>
                            {log.details && <div className="text-xs text-gray-500 mt-0.5">{log.details}</div>}
                            <div className="flex gap-3 text-[11px] text-gray-400 mt-1">
                              <span>{fmtDateTime(log.createdAt)}</span>
                              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Wallet */}
                <TabsContent value="wallet" className="p-5 space-y-4">
                  <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${G}, #17a360)` }}>
                    <div className="text-sm opacity-80 mb-1">Wallet Balance</div>
                    <div className="text-4xl font-bold" data-testid="detail-wallet-balance">{zarAmount(walletData?.balance ?? 0)}</div>
                    <div className="text-xs opacity-60 mt-1">FreelanceSkills Wallet</div>
                  </div>
                  <div className="flex gap-2">
                    <button data-testid="btn-wallet-credit" onClick={() => { setActionPayload({ walletType: "credit" }); setActionModal({ type: "wallet", user: detailUser }); }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors text-[#1a9155] hover:bg-[#f0fdf7]" style={{ borderColor: G }}>
                      + Credit
                    </button>
                    <button data-testid="btn-wallet-debit" onClick={() => { setActionPayload({ walletType: "debit" }); setActionModal({ type: "wallet", user: detailUser }); }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                      − Debit
                    </button>
                  </div>
                  {!walletData?.transactions?.length ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
                  ) : (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {walletData.transactions.map(tx => (
                        <div key={tx.id} data-testid={`tx-${tx.id}`}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{cap(tx.type)}</div>
                            <div className="text-xs text-gray-400">{tx.description} · {fmtDateTime(tx.createdAt)}</div>
                          </div>
                          <div className={`font-mono text-sm font-bold ${tx.amountCents >= 0 ? "text-[#1a9155]" : "text-red-600"}`}>
                            {tx.amountCents >= 0 ? "+" : ""}{zarAmount(tx.amountCents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Academy */}
                <TabsContent value="academy" className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Courses Active", value: detailUser.academyProgress?.length || 0, color: "text-[#1a9155]" },
                      { label: "Completed", value: detailUser.academyProgress?.filter(p => p.percent >= 100).length || 0, color: "text-[#1a9155]" },
                      { label: "Certificates", value: detailUser.certificates?.length || 0, color: "text-amber-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                        <div className={`text-3xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-gray-400 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>

                  {detailUser.academyProgress?.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">Course Progress</div>
                      {detailUser.academyProgress.map(prog => (
                        <div key={prog.courseId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">Course #{prog.courseId}</span>
                            <div className="flex items-center gap-2">
                              {prog.hasCertificate && (
                                <a href={`/api/admin/certificate/${detailUser.id}/${prog.courseId}`} target="_blank" rel="noreferrer"
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-[#1a9155] border border-[#1DBF73]/30 hover:bg-[#f0fdf7] transition-colors">
                                  📜 Download Cert
                                </a>
                              )}
                              <span className="text-xs font-bold text-gray-600">{prog.percent}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${prog.percent}%`, background: prog.percent >= 100 ? G : "#60a5fa" }}></div>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">{prog.completedLessons} / {prog.totalLessons} lessons</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailUser.certificates?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">Certificates Earned</div>
                      {detailUser.certificates.map(cert => (
                        <div key={cert.id} data-testid={`cert-${cert.id}`}
                          className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <span className="text-2xl">🏆</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold">Course #{cert.courseId} Certificate</div>
                            <div className="text-xs text-gray-500">Code: {cert.certificateCode} · Issued {fmtDate(cert.issuedAt)}</div>
                          </div>
                          <a href={`/api/admin/certificate/${detailUser.id}/${cert.courseId}`} target="_blank" rel="noreferrer"
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors" style={{ background: G }}>
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {!detailUser.academyProgress?.length && !detailUser.certificates?.length && (
                    <div className="text-center py-12 text-gray-400 text-sm">No academy activity yet</div>
                  )}
                </TabsContent>

                {/* KYC Documents */}
                <TabsContent value="kyc" className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide">KYC Documents</div>
                    <div className="flex gap-2">
                      {["id_document", "selfie", "proof_of_address"].map(docType => (
                        <label key={docType}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                          + {docType === "id_document" ? "ID Doc" : docType === "selfie" ? "Selfie" : "Address Proof"}
                          <input type="file" accept="image/*,application/pdf" className="hidden"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) await uploadKycDoc(detailUser.id, docType, file);
                              e.target.value = "";
                            }} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {!detailUser.kycDocuments?.length ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-sm">No KYC documents uploaded yet</p>
                      <p className="text-xs text-gray-300 mt-1">Upload ID document, selfie, and proof of address</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailUser.kycDocuments.map(doc => (
                        <div key={doc.id} data-testid={`kyc-doc-${doc.id}`}
                          className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="text-2xl">
                            {doc.type === "id_document" ? "🪪" : doc.type === "selfie" ? "🤳" : "🏠"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800">
                              {doc.type === "id_document" ? "ID Document" : doc.type === "selfie" ? "Selfie" : "Proof of Address"}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{doc.fileName}</div>
                            <div className="text-[11px] text-gray-400">Uploaded {fmtDateTime(doc.uploadedAt)}</div>
                            {doc.reviewNotes && <div className="text-xs text-gray-500 mt-0.5 italic">Note: {doc.reviewNotes}</div>}
                          </div>
                          <StatusPill value={doc.status} />
                          <a href={`/api/admin/kyc-file/${doc.filePath}`} target="_blank" rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                            View
                          </a>
                          {doc.status === "pending" && (
                            <div className="flex gap-1">
                              <button data-testid={`btn-approve-doc-${doc.id}`}
                                onClick={() => { setActionPayload({ docId: doc.id, kycDocStatus: "approved" }); setActionModal({ type: "kyc_doc_review" }); }}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white transition-colors" style={{ background: G }}>
                                Approve
                              </button>
                              <button data-testid={`btn-reject-doc-${doc.id}`}
                                onClick={() => { setActionPayload({ docId: doc.id, kycDocStatus: "rejected" }); setActionModal({ type: "kyc_doc_review" }); }}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── KYC Queue Modal ──────────────────────────────────────────────────── */}
      <Dialog open={showKycQueue} onOpenChange={setShowKycQueue}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              KYC Review Queue ({kycQueue.length})
            </DialogTitle>
          </DialogHeader>
          {kycQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No documents pending review</div>
          ) : (
            <div className="space-y-2">
              {kycQueue.map((entry, i) => {
                const doc = entry.doc || (entry as any);
                return (
                  <div key={doc.id || i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl">{doc.type === "id_document" ? "🪪" : doc.type === "selfie" ? "🤳" : "🏠"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{entry.userFirstName} {entry.userLastName}</div>
                      <div className="text-xs text-gray-400">{entry.userEmail}</div>
                      <div className="text-xs text-gray-400">{cap(doc.type)} · {fmtDateTime(doc.uploadedAt)}</div>
                    </div>
                    <a href={`/api/admin/kyc-file/${doc.filePath}`} target="_blank" rel="noreferrer"
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">View</a>
                    <button onClick={() => { setActionPayload({ docId: doc.id, kycDocStatus: "approved" }); setActionModal({ type: "kyc_doc_review" }); setShowKycQueue(false); }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white" style={{ background: G }}>Approve</button>
                    <button onClick={() => { setActionPayload({ docId: doc.id, kycDocStatus: "rejected" }); setActionModal({ type: "kyc_doc_review" }); setShowKycQueue(false); }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Reject</button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Global Activity Log ──────────────────────────────────────────────── */}
      <Dialog open={showGlobalLog} onOpenChange={setShowGlobalLog}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Global Activity Log</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            {globalLogs.map((entry, i) => {
              const log = entry.log || entry;
              return (
                <div key={log.id || i} data-testid={`global-log-${log.id || i}`}
                  className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: log.action?.includes("ban") ? "#ef4444" : log.action?.includes("suspend") ? "#f59e0b" : G }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{cap(log.action)}</span>
                      <span className="text-xs text-gray-400">{entry.userFirstName} {entry.userLastName} ({entry.userEmail})</span>
                    </div>
                    {log.details && <div className="text-xs text-gray-500 mt-0.5">{log.details}</div>}
                    <div className="text-[11px] text-gray-400 mt-1">{fmtDateTime(log.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            {globalLogs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No activity logged yet</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Action Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={actionModal.type !== null} onOpenChange={open => { if (!open) { setActionModal({ type: null }); setActionPayload({}); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === "status" && "Change Account Status"}
              {actionModal.type === "role" && "Change User Role"}
              {actionModal.type === "kyc" && "Update KYC Status"}
              {actionModal.type === "message" && "Send Message"}
              {actionModal.type === "wallet" && "Wallet Adjustment"}
              {actionModal.type === "bulk" && `Bulk: ${cap(actionPayload.action)}`}
              {actionModal.type === "soft_delete" && "Soft Delete User"}
              {actionModal.type === "restore" && "Restore User"}
              {actionModal.type === "kyc_doc_review" && `KYC Document: ${cap(actionPayload.kycDocStatus)}`}
              {actionModal.type === "reset_password" && "Reset Password"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {actionModal.type === "status" && (
              <>
                <select value={actionPayload.status || "active"} onChange={e => setActionPayload(p => ({ ...p, status: e.target.value }))}
                  data-testid="modal-select-status"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 bg-gray-50">
                  {[["active","Active"],["suspended","Suspended"],["banned","Banned"],["pending","Pending"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {(actionPayload.status === "suspended" || actionPayload.status === "banned") && (
                  <>
                    <Textarea data-testid="modal-input-reason" placeholder="Reason (required)..." value={actionPayload.reason || ""}
                      onChange={e => setActionPayload(p => ({ ...p, reason: e.target.value }))} rows={3} className="border-gray-200 rounded-xl text-sm" />
                    {actionPayload.status === "suspended" && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Suspended Until</label>
                        <input type="datetime-local" data-testid="modal-input-suspended-until" value={actionPayload.suspendedUntil || ""}
                          onChange={e => setActionPayload(p => ({ ...p, suspendedUntil: e.target.value }))}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30" />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {actionModal.type === "role" && (
              <select value={actionPayload.role || "client"} onChange={e => setActionPayload(p => ({ ...p, role: e.target.value }))}
                data-testid="modal-select-role"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 bg-gray-50">
                {[["client","Client"],["freelancer","Freelancer"],["moderator","Moderator"],["upskiller","Upskiller"],["admin","Admin"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            )}

            {actionModal.type === "kyc" && (
              <>
                <select value={actionPayload.kycStatus || "pending"} onChange={e => setActionPayload(p => ({ ...p, kycStatus: e.target.value }))}
                  data-testid="modal-select-kyc"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30 bg-gray-50">
                  {[["not_started","Not Started"],["pending","Pending"],["verified","Verified"],["rejected","Rejected"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Textarea data-testid="modal-input-kyc-notes" placeholder="Notes (optional)..." value={actionPayload.notes || ""}
                  onChange={e => setActionPayload(p => ({ ...p, notes: e.target.value }))} rows={2} className="border-gray-200 rounded-xl text-sm" />
              </>
            )}

            {actionModal.type === "message" && (
              <>
                <Input data-testid="modal-input-subject" placeholder="Subject" value={actionPayload.subject || ""}
                  onChange={e => setActionPayload(p => ({ ...p, subject: e.target.value }))} className="border-gray-200 rounded-xl" />
                <Textarea data-testid="modal-input-body" placeholder="Message body..." value={actionPayload.body || ""}
                  onChange={e => setActionPayload(p => ({ ...p, body: e.target.value }))} rows={5} className="border-gray-200 rounded-xl text-sm" />
              </>
            )}

            {actionModal.type === "wallet" && (
              <>
                <div className="flex gap-2">
                  {[["credit","+ Credit","text-[#1a9155] border-[#1DBF73]"],["debit","− Debit","text-red-600 border-red-300"]].map(([t, l, cls]) => (
                    <button key={t} data-testid={`modal-wallet-${t}`} onClick={() => setActionPayload(p => ({ ...p, walletType: t }))}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${actionPayload.walletType === t ? (t === "credit" ? "bg-[#f0fdf7]" : "bg-red-50") : "bg-white"} ${cls}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount (ZAR)</label>
                  <Input data-testid="modal-input-amount" type="number" min="0.01" step="0.01" placeholder="0.00"
                    value={actionPayload.amount || ""} onChange={e => setActionPayload(p => ({ ...p, amount: e.target.value }))} className="border-gray-200 rounded-xl" />
                </div>
                <Textarea data-testid="modal-input-wallet-description" placeholder="Description..." value={actionPayload.description || ""}
                  onChange={e => setActionPayload(p => ({ ...p, description: e.target.value }))} rows={2} className="border-gray-200 rounded-xl text-sm" />
              </>
            )}

            {actionModal.type === "bulk" && (
              <>
                <div className="bg-gray-50 rounded-xl p-3 text-sm border border-gray-100">
                  Action: <strong>{cap(actionPayload.action)}</strong> · Affecting: <strong>{selected.size} users</strong>
                </div>
                {(actionPayload.action === "suspend" || actionPayload.action === "ban" || actionPayload.action === "soft_delete") && (
                  <Textarea data-testid="modal-input-bulk-reason" placeholder="Reason..." value={actionPayload.reason || ""}
                    onChange={e => setActionPayload(p => ({ ...p, reason: e.target.value }))} rows={3} className="border-gray-200 rounded-xl text-sm" />
                )}
                {actionPayload.action === "change_role" && (
                  <select value={actionPayload.role || "client"} onChange={e => setActionPayload(p => ({ ...p, role: e.target.value }))}
                    data-testid="modal-select-bulk-role"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30">
                    {[["client","Client"],["freelancer","Freelancer"],["moderator","Moderator"],["upskiller","Upskiller"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                )}
              </>
            )}

            {(actionModal.type === "soft_delete") && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  The user will be soft-deleted and can be restored within 30 days.
                </div>
                <Textarea data-testid="modal-input-delete-reason" placeholder="Reason for deletion..." value={actionPayload.reason || ""}
                  onChange={e => setActionPayload(p => ({ ...p, reason: e.target.value }))} rows={3} className="border-gray-200 rounded-xl text-sm" />
              </>
            )}

            {actionModal.type === "restore" && (
              <div className="bg-[#f0fdf7] border border-[#1DBF73]/30 rounded-xl p-3 text-sm text-[#1a9155]">
                This user's account will be restored and set to Active status.
              </div>
            )}

            {actionModal.type === "kyc_doc_review" && (
              <>
                <div className={`rounded-xl p-3 text-sm border ${actionPayload.kycDocStatus === "approved" ? "bg-[#f0fdf7] border-[#1DBF73]/30 text-[#1a9155]" : "bg-red-50 border-red-200 text-red-700"}`}>
                  Document will be marked as <strong>{actionPayload.kycDocStatus}</strong>.
                </div>
                <Textarea data-testid="modal-input-doc-notes" placeholder="Review notes (optional)..." value={actionPayload.notes || ""}
                  onChange={e => setActionPayload(p => ({ ...p, notes: e.target.value }))} rows={2} className="border-gray-200 rounded-xl text-sm" />
              </>
            )}

            {actionModal.type === "reset_password" && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                A password reset link will be generated for this user. They will receive a notification.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setActionModal({ type: null }); setActionPayload({}); }} data-testid="modal-btn-cancel"
              className="rounded-xl border-gray-200">
              Cancel
            </Button>
            <Button data-testid="modal-btn-confirm" onClick={submitAction}
              className="rounded-xl text-white font-semibold"
              style={{
                background: actionModal.type === "soft_delete" || (actionModal.type === "status" && actionPayload.status === "banned") ? "#ef4444"
                  : (actionModal.type === "status" && actionPayload.status === "suspended") ? "#f59e0b"
                  : G
              }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

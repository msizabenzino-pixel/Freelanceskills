import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  userType: string | null;
  role: string | null;
  status: string | null;
  kycStatus: string | null;
  country: string | null;
  phoneNumber: string | null;
  walletBalance: number | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  isPro: boolean | null;
  completedJobs: number | null;
  rating: number | null;
  suspendedUntil: string | null;
  suspendedReason: string | null;
  banReason: string | null;
}

interface UserDetail extends AdminUser {
  bio: string | null;
  title: string | null;
  skills: string[] | null;
  location: string | null;
  academyProgress: { courseId: number; completed: boolean; completedAt: string | null }[];
  certificates: { id: number; courseId: number; issuedAt: string; certificateCode: string }[];
}

interface ActivityLog {
  id: string;
  userId: string;
  performedBy: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

interface WalletTx {
  id: string;
  type: string;
  amountCents: number;
  balanceAfterCents: number;
  description: string | null;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  verifiedKyc: number;
  pendingKyc: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(s: string | null) {
  switch (s) {
    case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "suspended": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "banned": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "pending": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function kycColor(k: string | null) {
  switch (k) {
    case "verified": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

function roleColor(r: string | null) {
  switch (r) {
    case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    case "moderator": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300";
    case "upskiller": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300";
    case "freelancer": return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function zarAmount(cents: number | null) {
  if (cents == null) return "R0.00";
  return `R${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" });
}

function capFirst(s: string | null) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  // ─ Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // ─ Filters
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKyc, setFilterKyc] = useState("all");
  const [filterCountry, setFilterCountry] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // ─ Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ─ Modals
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [walletData, setWalletData] = useState<{ balance: number; transactions: WalletTx[] } | null>(null);
  const [globalLogs, setGlobalLogs] = useState<{ log: ActivityLog; userEmail: string; userFirstName: string; userLastName: string }[]>([]);
  const [showGlobalLog, setShowGlobalLog] = useState(false);

  // ─ Action modals
  const [actionModal, setActionModal] = useState<{
    type: "status" | "role" | "kyc" | "message" | "wallet" | "bulk" | null;
    user?: AdminUser | null;
  }>({ type: null, user: null });
  const [actionPayload, setActionPayload] = useState<Record<string, string>>({});

  // ─── Toggle dark mode ──────────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const [accessDenied, setAccessDenied] = useState(false);

  // ─── Fetch stats ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => { if (r.status === 403) { setAccessDenied(true); return null; } return r.json(); })
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  // ─── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: "20", search,
      role: filterRole === "all" ? "" : filterRole,
      status: filterStatus === "all" ? "" : filterStatus,
      kycStatus: filterKyc === "all" ? "" : filterKyc,
      country: filterCountry, dateFrom, dateTo, sortBy, sortDir,
    });
    try {
      const r = await fetch(`/api/admin/users?${params}`);
      if (!r.ok) { toast({ title: "Error", description: "Failed to load users", variant: "destructive" }); return; }
      const data = await r.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterStatus, filterKyc, filterCountry, dateFrom, dateTo, sortBy, sortDir]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
    } finally {
      setDetailLoading(false);
    }
  }

  // ─── Load global activity log ─────────────────────────────────────────────
  async function loadGlobalLog() {
    const r = await fetch("/api/admin/activity-log?limit=100");
    const data = await r.json();
    setGlobalLogs(Array.isArray(data) ? data : []);
    setShowGlobalLog(true);
  }

  // ─── Perform action ───────────────────────────────────────────────────────
  async function submitAction() {
    const { type, user: u } = actionModal;
    if (!type) return;

    let url = "";
    let method = "PATCH";
    let body: Record<string, unknown> = {};

    if (type === "status" && u) {
      url = `/api/admin/users/${u.id}/status`;
      body = { status: actionPayload.status, reason: actionPayload.reason, suspendedUntil: actionPayload.suspendedUntil };
    } else if (type === "role" && u) {
      url = `/api/admin/users/${u.id}/role`;
      body = { role: actionPayload.role };
    } else if (type === "kyc" && u) {
      url = `/api/admin/users/${u.id}/kyc`;
      body = { kycStatus: actionPayload.kycStatus, notes: actionPayload.notes };
    } else if (type === "message" && u) {
      url = `/api/admin/users/${u.id}/message`;
      method = "POST";
      body = { subject: actionPayload.subject, body: actionPayload.body };
    } else if (type === "wallet" && u) {
      url = `/api/admin/users/${u.id}/wallet`;
      method = "POST";
      body = { type: actionPayload.walletType, amountCents: Math.round(parseFloat(actionPayload.amount || "0") * 100), description: actionPayload.description };
    } else if (type === "bulk") {
      url = "/api/admin/users/bulk-action";
      method = "POST";
      body = { userIds: Array.from(selected), action: actionPayload.action, reason: actionPayload.reason, role: actionPayload.role };
    }

    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { toast({ title: "Error", description: data.error || "Action failed", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Action completed successfully" });
      setActionModal({ type: null });
      setActionPayload({});
      setSelected(new Set());
      fetchUsers();
      if (detailUser && u && detailUser.id === u.id) openDetail(u);
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────
  function exportCSV() {
    const params = new URLSearchParams({
      search,
      role: filterRole === "all" ? "" : filterRole,
      status: filterStatus === "all" ? "" : filterStatus,
      kycStatus: filterKyc === "all" ? "" : filterKyc,
      country: filterCountry,
    });
    window.open(`/api/admin/users/export?${params}`, "_blank");
  }

  // ─── Reset password ───────────────────────────────────────────────────────
  async function resetPassword(userId: string) {
    const r = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
    const data = await r.json();
    if (r.ok) toast({ title: "Password reset initiated", description: "Reset link generated" });
    else toast({ title: "Error", description: data.error, variant: "destructive" });
  }

  // ─── Select all ───────────────────────────────────────────────────────────
  const allSelected = users.length > 0 && users.every(u => selected.has(u.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  }

  // ─── Stat Card ────────────────────────────────────────────────────────────
  function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
      <div className={`rounded-xl p-4 flex flex-col gap-1 border ${color}`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
        <span className="text-2xl font-bold">{value?.toLocaleString()}</span>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h1>
          <p className="text-gray-500 mt-2">You need admin privileges to access this page.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">FS</div>
            <div>
              <h1 className="font-bold text-lg leading-none">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">FreelanceSkills.net — User Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" data-testid="btn-global-log" onClick={loadGlobalLog}>
              Activity Log
            </Button>
            <Button size="sm" variant="outline" data-testid="btn-export" onClick={exportCSV}>
              Export CSV
            </Button>
            <button
              data-testid="btn-dark-mode"
              onClick={() => setDarkMode(d => !d)}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              data-testid="btn-back-home"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ← Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Users" value={stats.totalUsers} color="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" />
            <StatCard label="Active" value={stats.activeUsers} color="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950" />
            <StatCard label="Suspended" value={stats.suspendedUsers} color="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950" />
            <StatCard label="Banned" value={stats.bannedUsers} color="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950" />
            <StatCard label="KYC Verified" value={stats.verifiedKyc} color="border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950" />
            <StatCard label="KYC Pending" value={stats.pendingKyc} color="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <Input
              data-testid="input-search"
              placeholder="Search name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2 bg-gray-50 dark:bg-gray-800"
            />
            <Select value={filterRole} onValueChange={v => { setFilterRole(v); setPage(1); }}>
              <SelectTrigger data-testid="select-role" className="bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="upskiller">Upskiller</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger data-testid="select-status" className="bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterKyc} onValueChange={v => { setFilterKyc(v); setPage(1); }}>
              <SelectTrigger data-testid="select-kyc" className="bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Input
              data-testid="input-country"
              placeholder="Country filter..."
              value={filterCountry}
              onChange={e => { setFilterCountry(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">From:</span>
              <input type="date" data-testid="input-date-from" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="text-sm border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">To:</span>
              <input type="date" data-testid="input-date-to" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="text-sm border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort-by" className="w-40 text-xs bg-gray-50 dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Registered Date</SelectItem>
                <SelectItem value="lastLoginAt">Last Login</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="walletBalance">Wallet Balance</SelectItem>
              </SelectContent>
            </Select>
            <button
              data-testid="btn-sort-dir"
              onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
              className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
            </button>
            <button
              data-testid="btn-reset-filters"
              onClick={() => { setSearch(""); setFilterRole("all"); setFilterStatus("all"); setFilterKyc("all"); setFilterCountry(""); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Clear filters
            </button>
            <span className="ml-auto text-xs text-gray-500">{total.toLocaleString()} users</span>
          </div>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3">
            <span className="font-semibold text-sm text-violet-700 dark:text-violet-300">{selected.size} selected</span>
            <Button size="sm" variant="outline" data-testid="bulk-activate"
              onClick={() => { setActionPayload({ action: "activate" }); setActionModal({ type: "bulk" }); }}>
              Activate
            </Button>
            <Button size="sm" variant="outline" data-testid="bulk-suspend"
              onClick={() => { setActionPayload({ action: "suspend" }); setActionModal({ type: "bulk" }); }}>
              Suspend
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950" data-testid="bulk-ban"
              onClick={() => { setActionPayload({ action: "ban" }); setActionModal({ type: "bulk" }); }}>
              Ban
            </Button>
            <Button size="sm" variant="outline" data-testid="bulk-role"
              onClick={() => { setActionPayload({ action: "change_role" }); setActionModal({ type: "bulk" }); }}>
              Change Role
            </Button>
            <Button size="sm" variant="outline" data-testid="bulk-verify-kyc"
              onClick={() => { setActionPayload({ action: "verify_kyc" }); setActionModal({ type: "bulk" }); }}>
              Verify KYC
            </Button>
            <button className="ml-auto text-xs text-gray-500 hover:text-gray-700" onClick={() => setSelected(new Set())}>Deselect all</button>
          </div>
        )}

        {/* User Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  <th className="py-3 px-3 text-left">
                    <Checkbox data-testid="checkbox-all" checked={allSelected} onCheckedChange={toggleAll} />
                  </th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">User</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Role</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">KYC</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Country</th>
                  <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Wallet</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Last Login</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Registered</th>
                  <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">IP</th>
                  <th className="py-3 px-3 text-center font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-gray-400">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full"></div>
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-gray-400">No users found</td>
                  </tr>
                )}
                {!loading && users.map(u => (
                  <tr
                    key={u.id}
                    data-testid={`row-user-${u.id}`}
                    className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selected.has(u.id) ? "bg-violet-50 dark:bg-violet-950/30" : ""}`}
                  >
                    <td className="py-2.5 px-3">
                      <Checkbox
                        data-testid={`checkbox-user-${u.id}`}
                        checked={selected.has(u.id)}
                        onCheckedChange={c => {
                          const next = new Set(selected);
                          c ? next.add(u.id) : next.delete(u.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        data-testid={`btn-view-user-${u.id}`}
                        onClick={() => openDetail(u)}
                        className="flex items-center gap-2 hover:underline text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.firstName?.charAt(0) || u.email?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
                            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                            {u.isPro && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1 rounded font-bold">PRO</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">{u.email}</div>
                          <div className="text-[10px] text-gray-300 dark:text-gray-600">{u.id.substring(0, 8)}…</div>
                        </div>
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>
                        {capFirst(u.role)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(u.status)}`} data-testid={`status-${u.id}`}>
                        {capFirst(u.status)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kycColor(u.kycStatus)}`} data-testid={`kyc-${u.id}`}>
                        {u.kycStatus === "not_started" ? "Not Started" : capFirst(u.kycStatus)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.country || "—"}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs whitespace-nowrap" data-testid={`wallet-${u.id}`}>{zarAmount(u.walletBalance)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(u.lastLoginAt)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-400 dark:text-gray-600 font-mono">{u.lastLoginIp || "—"}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          data-testid={`btn-status-${u.id}`}
                          onClick={() => { setActionPayload({ status: u.status || "active" }); setActionModal({ type: "status", user: u }); }}
                          className="text-[11px] px-2 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                          title="Change status"
                        >Status</button>
                        <button
                          data-testid={`btn-role-${u.id}`}
                          onClick={() => { setActionPayload({ role: u.role || "client" }); setActionModal({ type: "role", user: u }); }}
                          className="text-[11px] px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                          title="Change role"
                        >Role</button>
                        <button
                          data-testid={`btn-message-${u.id}`}
                          onClick={() => { setActionPayload({}); setActionModal({ type: "message", user: u }); }}
                          className="text-[11px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Send message"
                        >Msg</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} · {total.toLocaleString()} total users
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" data-testid="btn-prev-page" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return pg <= totalPages ? (
                  <button
                    key={pg}
                    data-testid={`btn-page-${pg}`}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-xs rounded border transition-colors ${pg === page ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >{pg}</button>
                ) : null;
              })}
              <Button size="sm" variant="outline" data-testid="btn-next-page" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── User Detail Modal ─────────────────────────────────────────────────── */}
      <Dialog open={!!detailUser || detailLoading} onOpenChange={open => { if (!open) setDetailUser(null); }}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900">
          {detailLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {!detailLoading && detailUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {detailUser.firstName?.charAt(0) || detailUser.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-bold">{detailUser.firstName} {detailUser.lastName}</div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{detailUser.email}</div>
                  </div>
                  <div className="ml-auto flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(detailUser.status)}`}>{capFirst(detailUser.status)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(detailUser.role)}`}>{capFirst(detailUser.role)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${kycColor(detailUser.kycStatus)}`}>KYC: {capFirst(detailUser.kycStatus)}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="mt-2">
                <TabsList className="w-full dark:bg-gray-800">
                  <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
                  <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                  <TabsTrigger value="wallet" data-testid="tab-wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="academy" data-testid="tab-academy">Academy</TabsTrigger>
                  <TabsTrigger value="actions" data-testid="tab-actions">Actions</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["User ID", detailUser.id],
                      ["Email", detailUser.email],
                      ["Phone", detailUser.phoneNumber || "—"],
                      ["Country", detailUser.country || "—"],
                      ["Location", detailUser.location || "—"],
                      ["User Type", capFirst(detailUser.userType)],
                      ["Role", capFirst(detailUser.role)],
                      ["Status", capFirst(detailUser.status)],
                      ["KYC Status", capFirst(detailUser.kycStatus)],
                      ["Pro Account", detailUser.isPro ? "Yes" : "No"],
                      ["Completed Jobs", String(detailUser.completedJobs || 0)],
                      ["Rating", detailUser.rating ? `${(detailUser.rating / 100).toFixed(1)} / 5` : "—"],
                      ["Hourly Rate", detailUser.hourlyRate ? zarAmount(detailUser.hourlyRate) + "/hr" : "—"],
                      ["Wallet Balance", zarAmount(detailUser.walletBalance)],
                      ["Last Login", fmtDateTime(detailUser.lastLoginAt)],
                      ["Last IP", detailUser.lastLoginIp || "—"],
                      ["Registered", fmtDateTime(detailUser.createdAt)],
                    ].map(([label, val]) => (
                      <div key={label} data-testid={`detail-${label.toLowerCase().replace(/\s/g, "-")}`}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                        <div className="font-medium mt-0.5 break-all">{val}</div>
                      </div>
                    ))}
                  </div>
                  {detailUser.bio && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Bio</div>
                      <p className="text-sm">{detailUser.bio}</p>
                    </div>
                  )}
                  {detailUser.skills && detailUser.skills.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {detailUser.skills.map(s => (
                          <span key={s} className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailUser.suspendedReason && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                      <div className="font-semibold text-amber-800 dark:text-amber-300">Suspension Reason</div>
                      <div className="text-amber-700 dark:text-amber-400 mt-1">{detailUser.suspendedReason}</div>
                      {detailUser.suspendedUntil && <div className="text-xs text-amber-600 mt-1">Until: {fmtDateTime(detailUser.suspendedUntil)}</div>}
                    </div>
                  )}
                  {detailUser.banReason && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                      <div className="font-semibold text-red-800 dark:text-red-300">Ban Reason</div>
                      <div className="text-red-700 dark:text-red-400 mt-1">{detailUser.banReason}</div>
                    </div>
                  )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4">
                  {activityLogs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No activity recorded yet</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {activityLogs.map(log => (
                        <div key={log.id} data-testid={`activity-${log.id}`}
                          className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                          <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0 mt-1.5"></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{capFirst(log.action)}</div>
                            {log.details && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</div>}
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

                {/* Wallet Tab */}
                <TabsContent value="wallet" className="mt-4">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 text-white mb-4">
                    <div className="text-sm opacity-80">Current Balance</div>
                    <div className="text-3xl font-bold mt-1" data-testid="detail-wallet-balance">
                      {zarAmount(walletData?.balance ?? 0)}
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Button size="sm" variant="outline" data-testid="btn-wallet-credit"
                      onClick={() => { setActionPayload({ walletType: "credit" }); setActionModal({ type: "wallet", user: detailUser }); }}>
                      + Credit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" data-testid="btn-wallet-debit"
                      onClick={() => { setActionPayload({ walletType: "debit" }); setActionModal({ type: "wallet", user: detailUser }); }}>
                      − Debit
                    </Button>
                  </div>
                  {!walletData?.transactions || walletData.transactions.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No transactions yet</p>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {walletData.transactions.map(tx => (
                        <div key={tx.id} data-testid={`tx-${tx.id}`}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div>
                            <div className="text-sm font-medium">{capFirst(tx.type)}</div>
                            <div className="text-xs text-gray-400">{tx.description}</div>
                            <div className="text-[11px] text-gray-400">{fmtDateTime(tx.createdAt)}</div>
                          </div>
                          <div className={`font-mono text-sm font-bold ${tx.amountCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {tx.amountCents >= 0 ? "+" : ""}{zarAmount(tx.amountCents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Academy Tab */}
                <TabsContent value="academy" className="mt-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-violet-600">{detailUser.academyProgress?.length || 0}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Lessons Tracked</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {detailUser.academyProgress?.filter(p => p.completed).length || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Completed</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{detailUser.certificates?.length || 0}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Certificates</div>
                    </div>
                  </div>
                  {detailUser.certificates && detailUser.certificates.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Certificates Earned</div>
                      <div className="space-y-2">
                        {detailUser.certificates.map(cert => (
                          <div key={cert.id} data-testid={`cert-${cert.id}`}
                            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                            <span className="text-xl">🏆</span>
                            <div>
                              <div className="text-sm font-medium">Course #{cert.courseId}</div>
                              <div className="text-xs text-gray-500">Code: {cert.certificateCode} · {fmtDate(cert.issuedAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Change Status", desc: "Activate, suspend, or ban this user", onClick: () => { setActionPayload({ status: detailUser.status || "active" }); setActionModal({ type: "status", user: detailUser }); }, color: "border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950", testId: "detail-btn-status" },
                      { label: "Change Role", desc: "Assign a new platform role", onClick: () => { setActionPayload({ role: detailUser.role || "client" }); setActionModal({ type: "role", user: detailUser }); }, color: "border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950", testId: "detail-btn-role" },
                      { label: "Update KYC", desc: "Verify, reject or reset KYC status", onClick: () => { setActionPayload({ kycStatus: detailUser.kycStatus || "not_started" }); setActionModal({ type: "kyc", user: detailUser }); }, color: "border-violet-200 hover:bg-violet-50 dark:hover:bg-violet-950", testId: "detail-btn-kyc" },
                      { label: "Send Message", desc: "Send internal platform message", onClick: () => { setActionPayload({}); setActionModal({ type: "message", user: detailUser }); }, color: "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800", testId: "detail-btn-message" },
                      { label: "Reset Password", desc: "Force a password reset for this user", onClick: () => resetPassword(detailUser.id), color: "border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950", testId: "detail-btn-reset-password" },
                      { label: "Wallet Credit/Debit", desc: "Manually adjust wallet balance", onClick: () => { setActionPayload({ walletType: "credit" }); setActionModal({ type: "wallet", user: detailUser }); }, color: "border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950", testId: "detail-btn-wallet" },
                    ].map(({ label, desc, onClick, color, testId }) => (
                      <button
                        key={label}
                        data-testid={testId}
                        onClick={onClick}
                        className={`rounded-xl border p-3 text-left transition-colors ${color} dark:border-gray-700`}
                      >
                        <div className="font-semibold text-sm">{label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Global Activity Log Modal ──────────────────────────────────────────── */}
      <Dialog open={showGlobalLog} onOpenChange={setShowGlobalLog}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Global Activity Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {globalLogs.map((entry, i) => {
              const log = entry.log || entry as any;
              return (
                <div key={log.id || i} data-testid={`global-log-${log.id || i}`}
                  className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${log.action?.includes("ban") ? "bg-red-400" : log.action?.includes("suspend") ? "bg-amber-400" : "bg-violet-400"}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{capFirst(log.action)}</span>
                      <span className="text-xs text-gray-400">{entry.userEmail || entry.userFirstName ? `${entry.userFirstName || ""} ${entry.userLastName || ""} (${entry.userEmail || ""})` : log.userId?.substring(0, 8)}</span>
                    </div>
                    {log.details && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</div>}
                    <div className="text-[11px] text-gray-400 mt-1">{fmtDateTime(log.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            {globalLogs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Action Modals ────────────────────────────────────────────────────────── */}
      <Dialog
        open={actionModal.type !== null}
        onOpenChange={open => { if (!open) { setActionModal({ type: null }); setActionPayload({}); } }}
      >
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === "status" && "Change User Status"}
              {actionModal.type === "role" && "Change User Role"}
              {actionModal.type === "kyc" && "Update KYC Status"}
              {actionModal.type === "message" && "Send Message"}
              {actionModal.type === "wallet" && "Wallet Adjustment"}
              {actionModal.type === "bulk" && `Bulk Action: ${capFirst(actionPayload.action)}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {actionModal.type === "status" && (
              <>
                <Select value={actionPayload.status || "active"} onValueChange={v => setActionPayload(p => ({ ...p, status: v }))}>
                  <SelectTrigger data-testid="modal-select-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {(actionPayload.status === "suspended" || actionPayload.status === "banned") && (
                  <>
                    <Textarea
                      data-testid="modal-input-reason"
                      placeholder="Reason for action (required)..."
                      value={actionPayload.reason || ""}
                      onChange={e => setActionPayload(p => ({ ...p, reason: e.target.value }))}
                      rows={3}
                      className="dark:bg-gray-800"
                    />
                    {actionPayload.status === "suspended" && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Suspended Until (optional)</label>
                        <input type="datetime-local" data-testid="modal-input-suspended-until"
                          value={actionPayload.suspendedUntil || ""}
                          onChange={e => setActionPayload(p => ({ ...p, suspendedUntil: e.target.value }))}
                          className="w-full text-sm border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {actionModal.type === "role" && (
              <Select value={actionPayload.role || "client"} onValueChange={v => setActionPayload(p => ({ ...p, role: v }))}>
                <SelectTrigger data-testid="modal-select-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="upskiller">Upskiller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}

            {actionModal.type === "kyc" && (
              <>
                <Select value={actionPayload.kycStatus || "not_started"} onValueChange={v => setActionPayload(p => ({ ...p, kycStatus: v }))}>
                  <SelectTrigger data-testid="modal-select-kyc"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  data-testid="modal-input-kyc-notes"
                  placeholder="Notes (optional)..."
                  value={actionPayload.notes || ""}
                  onChange={e => setActionPayload(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="dark:bg-gray-800"
                />
              </>
            )}

            {actionModal.type === "message" && (
              <>
                <Input
                  data-testid="modal-input-subject"
                  placeholder="Subject"
                  value={actionPayload.subject || ""}
                  onChange={e => setActionPayload(p => ({ ...p, subject: e.target.value }))}
                  className="dark:bg-gray-800"
                />
                <Textarea
                  data-testid="modal-input-body"
                  placeholder="Message body..."
                  value={actionPayload.body || ""}
                  onChange={e => setActionPayload(p => ({ ...p, body: e.target.value }))}
                  rows={4}
                  className="dark:bg-gray-800"
                />
              </>
            )}

            {actionModal.type === "wallet" && (
              <>
                <div className="flex gap-2">
                  <button
                    data-testid="modal-wallet-credit"
                    onClick={() => setActionPayload(p => ({ ...p, walletType: "credit" }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${actionPayload.walletType === "credit" ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >+ Credit</button>
                  <button
                    data-testid="modal-wallet-debit"
                    onClick={() => setActionPayload(p => ({ ...p, walletType: "debit" }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${actionPayload.walletType === "debit" ? "bg-red-600 text-white border-red-600" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >− Debit</button>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount (ZAR)</label>
                  <Input
                    data-testid="modal-input-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={actionPayload.amount || ""}
                    onChange={e => setActionPayload(p => ({ ...p, amount: e.target.value }))}
                    className="dark:bg-gray-800"
                  />
                </div>
                <Textarea
                  data-testid="modal-input-wallet-description"
                  placeholder="Description (optional)..."
                  value={actionPayload.description || ""}
                  onChange={e => setActionPayload(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="dark:bg-gray-800"
                />
              </>
            )}

            {actionModal.type === "bulk" && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  Action: <strong>{capFirst(actionPayload.action)}</strong> · Affected: <strong>{selected.size} users</strong>
                </div>
                {(actionPayload.action === "suspend" || actionPayload.action === "ban") && (
                  <Textarea
                    data-testid="modal-input-bulk-reason"
                    placeholder="Reason for action..."
                    value={actionPayload.reason || ""}
                    onChange={e => setActionPayload(p => ({ ...p, reason: e.target.value }))}
                    rows={3}
                    className="dark:bg-gray-800"
                  />
                )}
                {actionPayload.action === "change_role" && (
                  <Select value={actionPayload.role || "client"} onValueChange={v => setActionPayload(p => ({ ...p, role: v }))}>
                    <SelectTrigger data-testid="modal-select-bulk-role"><SelectValue placeholder="Select new role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="upskiller">Upskiller</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionModal({ type: null }); setActionPayload({}); }} data-testid="modal-btn-cancel">
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              data-testid="modal-btn-confirm"
              className={actionModal.type === "status" && actionPayload.status === "banned" ? "bg-red-600 hover:bg-red-700" :
                actionModal.type === "status" && actionPayload.status === "suspended" ? "bg-amber-600 hover:bg-amber-700" :
                "bg-violet-600 hover:bg-violet-700"}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

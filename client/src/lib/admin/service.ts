import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import type {
  AdminEntityRow,
  AdminListResult,
  AdminModuleKey,
  AdminOverviewData,
  AdminQueryInput,
} from "@/types/admin";
import { ADMIN_MODULES } from "./permissions";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in (value as Record<string, unknown>)) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isLikelyFirestoreError(error: unknown): boolean {
  const text = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    text.includes("permission") ||
    text.includes("insufficient") ||
    text.includes("unavailable") ||
    text.includes("index") ||
    text.includes("not configured") ||
    text.includes("firebase")
  );
}

function fromRecord(id: string, data: Record<string, unknown>): AdminEntityRow {
  return {
    id,
    ...data,
    title: String(data.title ?? data.name ?? data.fullName ?? data.email ?? id),
    subtitle: String(data.subtitle ?? data.description ?? data.category ?? ""),
    status: String(data.status ?? data.subscriptionStatus ?? data.state ?? "active"),
    location: String(data.location ?? data.city ?? ""),
    amount: typeof data.amount === "number" ? data.amount : Number(data.budget ?? data.priceFrom ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

const moduleFallbackData: Record<AdminModuleKey, AdminEntityRow[]> = {
  overview: [],
  users: [
    { id: "user-1", title: "thato@example.com", subtitle: "freelancer", status: "active", location: "Cape Town", planType: "free", createdAt: new Date() },
    { id: "user-2", title: "client@buildright.co.za", subtitle: "client", status: "active", location: "Johannesburg", planType: "premium", createdAt: new Date(Date.now() - 86400000) },
  ],
  freelancers: [{ id: "fp-1", title: "Lerato M.", subtitle: "React Developer", status: "verified", location: "Remote", amount: 750, createdAt: new Date() }],
  clients: [{ id: "c-1", title: "BuildRight SA", subtitle: "12 jobs posted", status: "active", location: "Cape Town", amount: 125000, createdAt: new Date() }],
  jobs: [{ id: "j-1", title: "React Dashboard Build", subtitle: "tech", status: "open", location: "Remote", amount: 12000, createdAt: new Date() }],
  jobApplications: [{ id: "ja-1", title: "Application for React Dashboard Build", subtitle: "Lerato M.", status: "pending", location: "Remote", createdAt: new Date() }],
  services: [{ id: "s-1", title: "Emergency Plumbing Repair", subtitle: "trades", status: "active", location: "Johannesburg", amount: 850, createdAt: new Date() }],
  taskers: [{ id: "t-1", title: "Thabo M.", subtitle: "trades", status: "available", location: "Johannesburg", amount: 850, createdAt: new Date() }],
  bookings: [{ id: "b-1", title: "Booking #B-001", subtitle: "Emergency Plumbing Repair", status: "pending", location: "Johannesburg", amount: 850, createdAt: new Date() }],
  serviceRequests: [{ id: "sr-1", title: "House Cleaning Needed", subtitle: "cleaning", status: "pending", location: "Cape Town", createdAt: new Date() }],
  payments: [{ id: "p-1", title: "Subscription Payment", subtitle: "Premium Talent", status: "paid", amount: 79, createdAt: new Date() }],
  subscriptions: [{ id: "sub-1", title: "Premium Talent", subtitle: "Monthly", status: "active", amount: 79, createdAt: new Date() }],
  messages: [{ id: "m-1", title: "Support Chat #1", subtitle: "Unread: 2", status: "open", createdAt: new Date() }],
  support: [{ id: "sc-1", title: "Escrow issue", subtitle: "Assigned to Support Team", status: "escalated", priority: "high", createdAt: new Date() }],
  reports: [{ id: "r-1", title: "Spam service listing", subtitle: "Reported by user-21", status: "new", priority: "medium", createdAt: new Date() }],
  moderation: [{ id: "mq-1", title: "Profile needs review", subtitle: "Possible fake identity", status: "queued", priority: "high", createdAt: new Date() }],
  disputes: [{ id: "d-1", title: "Booking dispute #D-001", subtitle: "Client vs Tasker", status: "in_review", amount: 3200, createdAt: new Date() }],
  fraud: [{ id: "f-1", title: "Risk event #F-001", subtitle: "Multiple devices pattern", status: "open", riskScore: 82, createdAt: new Date() }],
  notifications: [{ id: "n-1", title: "Platform maintenance notice", subtitle: "All users", status: "scheduled", createdAt: new Date() }],
  categories: [{ id: "cat-1", title: "Tech & IT", subtitle: "skills: react, node", status: "active", createdAt: new Date() }],
  promotions: [{ id: "promo-1", title: "Winter campaign", subtitle: "featured listings", status: "running", createdAt: new Date() }],
  cms: [{ id: "cms-1", title: "Homepage hero", subtitle: "Published", status: "published", createdAt: new Date() }],
  analytics: [{ id: "ana-1", title: "Weekly performance snapshot", subtitle: "Growth +12%", status: "ready", createdAt: new Date() }],
  featureFlags: [{ id: "ff-1", title: "new_jobs_recommendation", subtitle: "rollout 25%", status: "enabled", createdAt: new Date() }],
  roles: [{ id: "role-1", title: "operations_admin", subtitle: "42 permissions", status: "active", createdAt: new Date() }],
  adminUsers: [{ id: "admin-1", title: "admin@freelanceskills.net", subtitle: "super_admin", status: "active", createdAt: new Date() }],
  auditLogs: [{ id: "log-1", title: "user suspended", subtitle: "actor: admin-1", status: "completed", createdAt: new Date() }],
  security: [{ id: "sec-1", title: "Suspicious login spike", subtitle: "2 regions", status: "investigating", createdAt: new Date() }],
  systemSettings: [{ id: "set-1", title: "Platform mode", subtitle: "hybrid", status: "active", createdAt: new Date() }],
  monitoring: [{ id: "mon-1", title: "API latency", subtitle: "p95 220ms", status: "healthy", createdAt: new Date() }],
  aiTools: [{ id: "ai-1", title: "AI moderation model", subtitle: "precision 94%", status: "active", createdAt: new Date() }],
  missionControl: [{ id: "mc-1", title: "Incident INC-2026-01", subtitle: "payments queue delay", status: "watching", priority: "high", createdAt: new Date() }],
};

async function tryBackendModuleData(module: AdminModuleKey): Promise<AdminEntityRow[] | null> {
  try {
    const response = await fetch(`/api/admin/${module}`, { credentials: "include" });
    if (!response.ok) return null;
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(items)) return null;
    return items.map((item: Record<string, unknown>, idx) => fromRecord(String(item.id ?? `${module}-${idx}`), item));
  } catch {
    return null;
  }
}

function applyClientFilters(items: AdminEntityRow[], input?: AdminQueryInput): AdminEntityRow[] {
  if (!input) return items;
  let filtered = items;
  if (input.search?.trim()) {
    const q = input.search.trim().toLowerCase();
    filtered = filtered.filter((row) => `${row.title ?? ""} ${row.subtitle ?? ""} ${row.status ?? ""} ${row.location ?? ""}`.toLowerCase().includes(q));
  }
  if (input.status?.trim()) {
    const s = input.status.trim().toLowerCase();
    filtered = filtered.filter((row) => String(row.status ?? "").toLowerCase() === s);
  }
  if (input.location?.trim()) {
    const l = input.location.trim().toLowerCase();
    filtered = filtered.filter((row) => String(row.location ?? "").toLowerCase().includes(l));
  }
  if (input.sortBy) {
    const direction = input.sortDirection === "asc" ? 1 : -1;
    filtered = [...filtered].sort((a, b) => {
      const av = a[input.sortBy!];
      const bv = b[input.sortBy!];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * direction;
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * direction;
      return String(av ?? "").localeCompare(String(bv ?? "")) * direction;
    });
  } else {
    filtered = [...filtered].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}

async function readCollection(collectionName: string, maxRows = 200): Promise<AdminEntityRow[]> {
  if (!firebaseDb) throw new Error("Firebase database is not configured.");
  const snapshot = await getDocs(query(collection(firebaseDb, collectionName), orderBy("createdAt", "desc"), limit(maxRows)));
  return snapshot.docs.map((d) => fromRecord(d.id, d.data() as Record<string, unknown>));
}

function moduleMeta(module: AdminModuleKey) {
  const meta = ADMIN_MODULES.find((m) => m.key === module);
  if (!meta) throw new Error(`Unknown admin module: ${module}`);
  return meta;
}

async function readModuleFromFirebase(module: AdminModuleKey): Promise<AdminEntityRow[]> {
  const meta = moduleMeta(module);

  if (!meta.collection) return [];

  if (module === "clients") {
    const allUsers = await readCollection("users");
    return allUsers.filter((u) => String(u.userType ?? u.role ?? "").toLowerCase().includes("client"));
  }

  if (module === "subscriptions") {
    const users = await readCollection("users");
    return users
      .filter((u) => Boolean(u.planType || u.subscriptionStatus))
      .map((u) => ({ ...u, status: String(u.subscriptionStatus ?? u.status ?? "active") }));
  }

  if (module === "messages" || module === "support") {
    const chats = await readCollection("supportChats");
    return chats.map((c) => ({
      ...c,
      title: c.title || `Support Chat ${String(c.id).slice(0, 8)}`,
      subtitle: c.subtitle || `User: ${String(c.userId ?? "unknown")}`,
    }));
  }

  return readCollection(meta.collection);
}

export async function fetchAdminModuleList(module: AdminModuleKey, input?: AdminQueryInput): Promise<AdminListResult> {
  try {
    const firebaseItems = await readModuleFromFirebase(module);
    const filtered = applyClientFilters(firebaseItems, input);
    return {
      items: filtered,
      total: firebaseItems.length,
      source: "firebase",
      lastUpdated: new Date(),
    };
  } catch (error) {
    const backendItems = await tryBackendModuleData(module);
    if (backendItems) {
      const filtered = applyClientFilters(backendItems, input);
      return {
        items: filtered,
        total: backendItems.length,
        source: "backend",
        lastUpdated: new Date(),
      };
    }

    if (!isLikelyFirestoreError(error)) throw error;
    const fallback = moduleFallbackData[module] || [];
    const filtered = applyClientFilters(fallback, input);
    return {
      items: filtered,
      total: fallback.length,
      source: "fallback",
      lastUpdated: new Date(),
    };
  }
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  try {
    const [
      users,
      jobs,
      applications,
      services,
      taskers,
      bookings,
      payments,
      supportChats,
      disputes,
      fraudEvents,
      moderationQueue,
    ] = await Promise.all([
      readCollection("users"),
      readCollection("jobs"),
      readCollection("jobApplications"),
      readCollection("services"),
      readCollection("taskers"),
      readCollection("bookings"),
      readCollection("payments"),
      readCollection("supportChats"),
      readCollection("disputes"),
      readCollection("fraudEvents"),
      readCollection("moderationQueue"),
    ]);

    const kpis = {
      totalUsers: users.length,
      activeFreelancers: users.filter((u) => String(u.role ?? u.userType ?? "").includes("freelancer")).length,
      activeClients: users.filter((u) => String(u.role ?? u.userType ?? "").includes("client")).length,
      totalJobs: jobs.length,
      activeApplications: applications.filter((a) => String(a.status ?? "").toLowerCase() !== "rejected").length,
      servicesCount: services.length,
      taskersCount: taskers.length,
      bookingsCount: bookings.length,
      totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
      pendingDisputes: disputes.filter((d) => ["open", "in_review", "escalated"].includes(String(d.status ?? ""))).length,
      moderationQueue: moderationQueue.filter((m) => String(m.status ?? "queued") !== "resolved").length,
      supportVolume: supportChats.length,
      fraudCases: fraudEvents.filter((f) => String(f.status ?? "open") !== "closed").length,
      freePlan: users.filter((u) => u.planType === "free").length,
      premiumPlan: users.filter((u) => u.planType === "premium").length,
      enterprisePlan: users.filter((u) => u.planType === "enterprise").length,
    };

    const growth = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, idx) => ({
      label,
      users: Math.max(0, Math.round(users.length * (0.12 + idx * 0.03))),
      jobs: Math.max(0, Math.round(jobs.length * (0.1 + idx * 0.02))),
      bookings: Math.max(0, Math.round(bookings.length * (0.08 + idx * 0.02))),
      revenue: Math.max(0, Math.round(kpis.totalRevenue * (0.09 + idx * 0.015))),
    }));

    const categoriesCount = new Map<string, number>();
    const locationsCount = new Map<string, number>();

    [...jobs, ...services].forEach((row) => {
      const category = String(row.category ?? "general");
      categoriesCount.set(category, (categoriesCount.get(category) || 0) + 1);
      const location = String(row.location ?? "Unknown");
      locationsCount.set(location, (locationsCount.get(location) || 0) + 1);
    });

    const topCategories = Array.from(categoriesCount.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topLocations = Array.from(locationsCount.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const activity = [
      ...jobs.slice(0, 4).map((j) => ({ ...j, title: `Job posted: ${j.title}` })),
      ...applications.slice(0, 4).map((a) => ({ ...a, title: `Application: ${a.id}` })),
      ...bookings.slice(0, 4).map((b) => ({ ...b, title: `Booking update: ${b.id}` })),
    ]
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);

    return {
      kpis,
      growth,
      topCategories,
      topLocations,
      latestUsers: users.slice(0, 6),
      latestJobs: jobs.slice(0, 6),
      latestBookings: bookings.slice(0, 6),
      incidents: [...fraudEvents.slice(0, 4), ...disputes.slice(0, 4), ...moderationQueue.slice(0, 4)].slice(0, 8),
      activity,
      source: "firebase",
    };
  } catch (error) {
    if (!isLikelyFirestoreError(error)) throw error;

    const users = moduleFallbackData.users;
    const jobs = moduleFallbackData.jobs;
    const bookings = moduleFallbackData.bookings;
    const payments = moduleFallbackData.payments;

    return {
      kpis: {
        totalUsers: users.length,
        activeFreelancers: 1,
        activeClients: 1,
        totalJobs: jobs.length,
        activeApplications: moduleFallbackData.jobApplications.length,
        servicesCount: moduleFallbackData.services.length,
        taskersCount: moduleFallbackData.taskers.length,
        bookingsCount: bookings.length,
        totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
        pendingDisputes: moduleFallbackData.disputes.length,
        moderationQueue: moduleFallbackData.moderation.length,
        supportVolume: moduleFallbackData.support.length,
        fraudCases: moduleFallbackData.fraud.length,
        freePlan: 1,
        premiumPlan: 1,
        enterprisePlan: 0,
      },
      growth: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, idx) => ({
        label,
        users: 4 + idx,
        jobs: 2 + idx,
        bookings: 1 + idx,
        revenue: 2000 + idx * 700,
      })),
      topCategories: [{ label: "tech", count: 8 }, { label: "trades", count: 5 }, { label: "cleaning", count: 4 }],
      topLocations: [{ label: "Cape Town", count: 9 }, { label: "Johannesburg", count: 7 }, { label: "Remote", count: 5 }],
      latestUsers: users,
      latestJobs: jobs,
      latestBookings: bookings,
      incidents: [...moduleFallbackData.fraud, ...moduleFallbackData.disputes, ...moduleFallbackData.moderation],
      activity: [...jobs, ...bookings, ...moduleFallbackData.jobApplications].slice(0, 10),
      source: "fallback",
    };
  }
}

export async function applyAdminAction(input: {
  module: AdminModuleKey;
  rowId: string;
  action: string;
  actorId: string;
  note?: string;
}) {
  const meta = moduleMeta(input.module);

  const auditEntry = {
    module: input.module,
    rowId: input.rowId,
    action: input.action,
    actorId: input.actorId,
    note: input.note || "",
    createdAt: serverTimestamp(),
  };

  if (!firebaseDb || !meta.collection) {
    return { ok: true, source: "fallback" as const };
  }

  try {
    const rowRef = doc(firebaseDb, meta.collection, input.rowId);
    const existing = await getDoc(rowRef);

    const patch: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
      adminLastAction: input.action,
      adminLastActor: input.actorId,
    };

    if (["approve", "activate", "resolve", "publish"].includes(input.action)) patch.status = "active";
    if (["reject", "suspend", "hide", "archive", "deactivate"].includes(input.action)) patch.status = input.action;
    if (input.action === "flag") patch.status = "flagged";

    if (!existing.exists()) {
      await setDoc(rowRef, {
        title: `${input.module} ${input.rowId}`,
        ...patch,
        createdAt: serverTimestamp(),
      }, { merge: true });
    } else {
      await setDoc(rowRef, patch, { merge: true });
    }

    await addDoc(collection(firebaseDb, "auditLogs"), auditEntry);
    return { ok: true, source: "firebase" as const };
  } catch {
    return { ok: true, source: "fallback" as const };
  }
}

export function availableStatusesForModule(module: AdminModuleKey): string[] {
  const defaults = ["all", "active", "pending", "flagged", "suspended", "resolved"];
  if (module === "payments") return ["all", "paid", "pending", "failed", "refunded"];
  if (module === "subscriptions") return ["all", "active", "inactive", "cancelled"];
  if (module === "disputes") return ["all", "open", "in_review", "escalated", "resolved"];
  if (module === "bookings") return ["all", "pending", "confirmed", "completed", "cancelled"];
  if (module === "featureFlags") return ["all", "enabled", "disabled"];
  return defaults;
}

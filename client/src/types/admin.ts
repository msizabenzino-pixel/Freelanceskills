export type AdminRole =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "support_admin"
  | "moderation_admin"
  | "marketing_admin"
  | "academy_admin"
  | "analyst";

export type AdminPermission =
  | "overview.read"
  | "users.read"
  | "users.manage"
  | "freelancers.read"
  | "freelancers.manage"
  | "clients.read"
  | "clients.manage"
  | "jobs.read"
  | "jobs.manage"
  | "applications.read"
  | "applications.manage"
  | "services.read"
  | "services.manage"
  | "taskers.read"
  | "taskers.manage"
  | "bookings.read"
  | "bookings.manage"
  | "serviceRequests.read"
  | "serviceRequests.manage"
  | "payments.read"
  | "payments.manage"
  | "subscriptions.read"
  | "subscriptions.manage"
  | "messages.read"
  | "messages.manage"
  | "support.read"
  | "support.manage"
  | "reports.read"
  | "reports.manage"
  | "moderation.read"
  | "moderation.manage"
  | "disputes.read"
  | "disputes.manage"
  | "fraud.read"
  | "fraud.manage"
  | "notifications.read"
  | "notifications.manage"
  | "categories.read"
  | "categories.manage"
  | "promotions.read"
  | "promotions.manage"
  | "cms.read"
  | "cms.manage"
  | "analytics.read"
  | "featureFlags.read"
  | "featureFlags.manage"
  | "roles.read"
  | "roles.manage"
  | "adminUsers.read"
  | "adminUsers.manage"
  | "auditLogs.read"
  | "security.read"
  | "security.manage"
  | "systemSettings.read"
  | "systemSettings.manage"
  | "monitoring.read"
  | "aiTools.read"
  | "aiTools.manage"
  | "missionControl.read"
  | "missionControl.manage";

export type AdminModuleKey =
  | "overview"
  | "users"
  | "freelancers"
  | "clients"
  | "jobs"
  | "jobApplications"
  | "services"
  | "taskers"
  | "bookings"
  | "serviceRequests"
  | "payments"
  | "subscriptions"
  | "messages"
  | "support"
  | "reports"
  | "moderation"
  | "disputes"
  | "fraud"
  | "notifications"
  | "categories"
  | "promotions"
  | "cms"
  | "analytics"
  | "featureFlags"
  | "roles"
  | "adminUsers"
  | "auditLogs"
  | "security"
  | "systemSettings"
  | "monitoring"
  | "aiTools"
  | "missionControl";

export interface AdminIdentity {
  uid: string;
  email: string | null;
  role: AdminRole;
  isAdmin: boolean;
  permissions: AdminPermission[];
  displayName?: string;
}

export interface AdminEntityRow {
  id: string;
  title?: string;
  subtitle?: string;
  status?: string;
  location?: string;
  amount?: number;
  planType?: string;
  priority?: string;
  riskScore?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  [key: string]: unknown;
}

export interface AdminListResult {
  items: AdminEntityRow[];
  total: number;
  source: "firebase" | "backend" | "fallback";
  lastUpdated: Date;
}

export interface AdminKpis {
  totalUsers: number;
  activeFreelancers: number;
  activeClients: number;
  totalJobs: number;
  activeApplications: number;
  servicesCount: number;
  taskersCount: number;
  bookingsCount: number;
  totalRevenue: number;
  pendingDisputes: number;
  moderationQueue: number;
  supportVolume: number;
  fraudCases: number;
  freePlan: number;
  premiumPlan: number;
  enterprisePlan: number;
}

export interface AdminOverviewData {
  kpis: AdminKpis;
  growth: Array<{ label: string; users: number; jobs: number; bookings: number; revenue: number }>;
  topCategories: Array<{ label: string; count: number }>;
  topLocations: Array<{ label: string; count: number }>;
  latestUsers: AdminEntityRow[];
  latestJobs: AdminEntityRow[];
  latestBookings: AdminEntityRow[];
  incidents: AdminEntityRow[];
  activity: AdminEntityRow[];
  source: "firebase" | "backend" | "fallback";
}

export interface AdminQueryInput {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  location?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface AdminModuleMeta {
  key: AdminModuleKey;
  title: string;
  description: string;
  path: string;
  readPermission: AdminPermission;
  managePermission?: AdminPermission;
  collection?: string;
}

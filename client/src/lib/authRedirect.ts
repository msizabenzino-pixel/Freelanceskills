export const AUTH_REDIRECT_KEY = "freelanceskills_auth_redirect";
export const PLAN_SELECTION_KEY = "freelanceskills_selected_plan";

export interface PendingPlanSelection {
  planType: "free" | "premium";
  billingPeriod?: "monthly" | "yearly";
  selectedAt: string;
}

export function savePendingAuthRedirect(path: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_REDIRECT_KEY, path);
}

export function consumePendingAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_REDIRECT_KEY);
  if (!stored) return null;
  localStorage.removeItem(AUTH_REDIRECT_KEY);
  return stored;
}

export function savePendingPlanSelection(selection: PendingPlanSelection) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_SELECTION_KEY, JSON.stringify(selection));
}

export function readPendingPlanSelection(): PendingPlanSelection | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PLAN_SELECTION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPlanSelection;
  } catch {
    return null;
  }
}

export function clearPendingPlanSelection() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAN_SELECTION_KEY);
}

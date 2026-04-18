import type { PointAction } from "@shared/models/rewards";
import { POINT_ACTIONS } from "@shared/models/rewards";

interface EarnResult {
  success: boolean;
  points: number;
  balance: number;
  label: string;
}

/**
 * Awards points for a user action and returns the result.
 * Never throws — failures are logged silently so they never block the main flow.
 */
export async function earnPoints(action: PointAction, userId: string): Promise<EarnResult | null> {
  const cfg = POINT_ACTIONS[action];
  if (!cfg) return null;

  try {
    const res = await fetch("/api/rewards/earn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, action }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      success: true,
      points: cfg.points,
      balance: data.balance ?? 0,
      label: cfg.label,
    };
  } catch {
    return null;
  }
}

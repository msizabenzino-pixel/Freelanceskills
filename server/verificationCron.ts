import { storage } from "./storage";
import { log, logError } from "./logger";

/**
 * Verification tier (identity / skills / pro) — separate from the Top Performer
 * boolean. 0 = none, 1 = identity, 2 = identity + skills, 3 = pro.
 */
export function computeVerificationTier(p: {
  identityVerified?: boolean | null;
  skillsVerified?: boolean | null;
  isProVerified?: boolean | null;
}): number {
  if (p.isProVerified) return 3;
  if (p.identityVerified && p.skillsVerified) return 2;
  if (p.identityVerified) return 1;
  return 0;
}

// Top Performer thresholds (rating stored 0-5 * 100, so 4.7 = 470)
const TOP_PERFORMER = {
  minCompletedJobs: 10,
  minRating: 470,
  minOnTimeDeliveryRate: 85, // percent
};

export async function evaluateTopPerformers(): Promise<{ scanned: number; promoted: number; demoted: number }> {
  const freelancers = await storage.listFreelancerProfiles();
  let promoted = 0;
  let demoted = 0;

  for (const f of freelancers) {
    try {
      const openDisputes = await storage.countOpenDisputesForFreelancer(f.userId);
      const qualifies =
        (f.completedJobs ?? 0) >= TOP_PERFORMER.minCompletedJobs &&
        (f.rating ?? 0) >= TOP_PERFORMER.minRating &&
        (f.onTimeDeliveryRate ?? 0) >= TOP_PERFORMER.minOnTimeDeliveryRate &&
        openDisputes === 0;

      if (qualifies && !f.topPerformer) {
        await storage.updateProfileById(f.id, { topPerformer: true, topPerformerAt: new Date() } as any);
        promoted++;
      } else if (!qualifies && f.topPerformer) {
        await storage.updateProfileById(f.id, { topPerformer: false, topPerformerAt: null } as any);
        demoted++;
      }
    } catch (e: any) {
      logError(`[verification-cron] failed to evaluate profile ${f.id}: ${e?.message || e}`);
    }
  }

  return { scanned: freelancers.length, promoted, demoted };
}

// SAST is UTC+2 (no DST), so 02:00 SAST === 00:00 UTC (next UTC midnight).
function msUntilNext2amSAST(): number {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  ));
  return next.getTime() - now.getTime();
}

export function startVerificationCron(): void {
  const schedule = () => {
    const delay = msUntilNext2amSAST();
    setTimeout(async () => {
      try {
        const res = await evaluateTopPerformers();
        log(`[verification-cron] Top Performer eval — scanned=${res.scanned} promoted=${res.promoted} demoted=${res.demoted}`);
      } catch (e: any) {
        logError(`[verification-cron] eval failed: ${e?.message || e}`);
      }
      schedule();
    }, delay);
  };
  schedule();
  log("[verification-cron] scheduled — nightly 02:00 SAST Top Performer evaluation");
}

/**
 * Wallet & Escrow — User-Facing APIs
 *
 * GET  /api/wallet              — authenticated user's balance + last 50 transactions
 * POST /api/wallet/withdraw     — freelancer requests payout (sets payout_request)
 * GET  /api/escrow              — authenticated user's escrow records (client or freelancer)
 * POST /api/escrow/:id/dispute  — raise a dispute on an escrow (client or freelancer)
 *
 * Also exports: startEscrowAutoReleaseCron()
 */

import type { Express, Response } from "express";
import { db } from "./db";
import { eq, or, desc, and, isNull, lte, not, inArray, sql } from "drizzle-orm";
import {
  profiles, walletTransactions, paymentEscrows, userActivityLogs,
} from "@shared/schema";
import { getIO } from "./socket";
import { log } from "./logger";

const PLATFORM_COMMISSION_BPS = 1000; // 10%

function isAuthenticated(req: any, res: Response, next: any) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required. Please sign in." });
  }
  next();
}

async function getProfileRole(userId: string): Promise<string | null> {
  try {
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.userId, userId));
    return p?.role || null;
  } catch {
    return null;
  }
}

async function auditLog(performedBy: string, userId: string, action: string, details: string) {
  try {
    await db.insert(userActivityLogs).values({
      userId, performedBy, action, details, metadata: { source: "wallet_api" },
    });
  } catch {}
}

// ── Auto-Release Cron ─────────────────────────────────────────────────────────
export function startEscrowAutoReleaseCron() {
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  async function runAutoRelease() {
    try {
      const now = new Date();
      const due = await db.select().from(paymentEscrows).where(
        and(
          eq(paymentEscrows.status, "held"),
          eq(paymentEscrows.isOnHold, false),
          not(isNull(paymentEscrows.autoReleaseAt)),
          lte(paymentEscrows.autoReleaseAt, now),
        )
      ).limit(100);

      if (due.length === 0) return;

      log("info", `[AutoRelease] Processing ${due.length} due escrow(s)`);

      for (const tx of due) {
        try {
          await db.update(paymentEscrows).set({
            status: "auto_released",
            releasedAt: now,
            releasedBy: "auto",
            payoutStatus: "processing",
            updatedAt: now,
          }).where(eq(paymentEscrows.id, tx.id));

          // Credit freelancer wallet
          if (tx.freelancerId) {
            const [fp] = await db.select({ walletBalance: profiles.walletBalance })
              .from(profiles).where(eq(profiles.userId, tx.freelancerId));
            const newBalance = (fp?.walletBalance || 0) + tx.freelancerPayoutCents;
            await db.update(profiles)
              .set({ walletBalance: newBalance, updatedAt: now })
              .where(eq(profiles.userId, tx.freelancerId));
            await db.insert(walletTransactions).values({
              userId: tx.freelancerId,
              type: "credit",
              amountCents: tx.freelancerPayoutCents,
              balanceAfterCents: newBalance,
              description: `Auto-release: ${tx.jobTitle || tx.jobId || tx.id.slice(0, 8)}`,
              referenceId: tx.id,
              referenceType: "escrow",
              performedBy: "system",
            });
          }

          await auditLog("system", tx.clientId, "escrow_auto_released",
            `Escrow ${tx.id.slice(0, 8)} auto-released: R${(tx.freelancerPayoutCents / 100).toFixed(2)}`);

          try {
            getIO().to("admin_room").emit("escrow_update", { action: "auto_released", transactionId: tx.id });
          } catch {}

          log("info", `[AutoRelease] Escrow ${tx.id.slice(0, 8)} released: R${(tx.freelancerPayoutCents / 100).toFixed(2)} → freelancer ${tx.freelancerId?.slice(0, 8) || "n/a"}`);
        } catch (innerErr) {
          console.error(`[AutoRelease] Failed for escrow ${tx.id}:`, innerErr);
        }
      }
    } catch (err) {
      console.error("[AutoRelease] Cron error:", err);
    }
  }

  // Run once immediately on start
  runAutoRelease();
  const timer = setInterval(runAutoRelease, INTERVAL_MS);
  log("info", "[AutoRelease] Escrow auto-release cron started (every 15 min)");
  return timer;
}

export function registerWalletRoutes(app: Express) {

  // ── GET /api/wallet ──────────────────────────────────────────────────────
  app.get("/api/wallet", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      const [profile] = await db.select({ walletBalance: profiles.walletBalance })
        .from(profiles).where(eq(profiles.userId, userId));

      const balanceCents = profile?.walletBalance || 0;

      const txns = await db.select().from(walletTransactions)
        .where(eq(walletTransactions.userId, userId))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(50);

      res.json({
        success: true,
        balanceCents,
        balanceFormatted: `R${(balanceCents / 100).toFixed(2)}`,
        transactions: txns.map(t => ({
          ...t,
          amountFormatted: `R${(Math.abs(t.amountCents) / 100).toFixed(2)}`,
          balanceAfterFormatted: `R${(t.balanceAfterCents / 100).toFixed(2)}`,
          direction: t.amountCents >= 0 ? "credit" : "debit",
        })),
      });
    } catch (err) {
      console.error("Wallet fetch error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch wallet" });
    }
  });

  // ── POST /api/wallet/withdraw ────────────────────────────────────────────
  app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const role = await getProfileRole(userId);

      if (role !== "freelancer" && role !== "admin") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Only freelancers can request withdrawals." });
      }

      const [profile] = await db.select({ walletBalance: profiles.walletBalance })
        .from(profiles).where(eq(profiles.userId, userId));

      const balance = profile?.walletBalance || 0;
      if (balance <= 0) {
        return res.status(400).json({ success: false, code: "INSUFFICIENT_BALANCE", message: "No balance available for withdrawal." });
      }

      // Check no pending payout request already exists
      const pending = await db.select({ id: walletTransactions.id })
        .from(walletTransactions)
        .where(and(
          eq(walletTransactions.userId, userId),
          eq(walletTransactions.type, "payout_request"),
          sql`${walletTransactions.createdAt} > NOW() - INTERVAL '24 hours'`,
        ))
        .limit(1);
      if (pending.length > 0) {
        return res.status(400).json({ success: false, code: "DUPLICATE_REQUEST", message: "You already have a pending withdrawal request. Please allow 24 hours for processing." });
      }

      // Debit wallet
      const newBalance = 0;
      await db.update(profiles).set({ walletBalance: newBalance, updatedAt: new Date() }).where(eq(profiles.userId, userId));
      await db.insert(walletTransactions).values({
        userId,
        type: "payout_request",
        amountCents: -balance,
        balanceAfterCents: newBalance,
        description: "Withdrawal request — pending admin approval",
        referenceType: "payout",
        performedBy: userId,
      });

      await auditLog(userId, userId, "withdrawal_requested", `Withdrawal request: R${(balance / 100).toFixed(2)}`);

      res.json({
        success: true,
        message: "Withdrawal request submitted. Funds will be paid out within 1–2 business days.",
        amountCents: balance,
        amountFormatted: `R${(balance / 100).toFixed(2)}`,
      });
    } catch (err) {
      console.error("Withdrawal request error:", err);
      res.status(500).json({ success: false, message: "Failed to process withdrawal" });
    }
  });

  // ── GET /api/escrow ──────────────────────────────────────────────────────
  app.get("/api/escrow", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      const rows = await db.select().from(paymentEscrows)
        .where(or(
          eq(paymentEscrows.clientId, userId),
          eq(paymentEscrows.freelancerId, userId),
        ))
        .orderBy(desc(paymentEscrows.createdAt))
        .limit(100);

      const enriched = rows.map(r => ({
        ...r,
        amountFormatted: `R${(r.amountCents / 100).toFixed(2)}`,
        platformFeeFormatted: `R${(r.platformFeeCents / 100).toFixed(2)}`,
        payoutFormatted: `R${(r.freelancerPayoutCents / 100).toFixed(2)}`,
        isClient: r.clientId === userId,
        isFreelancer: r.freelancerId === userId,
        statusLabel: {
          held: "Funds Held",
          released: "Released",
          auto_released: "Auto-Released",
          refunded: "Refunded",
          disputed: "In Dispute",
        }[r.status] || r.status,
      }));

      res.json({ success: true, escrows: enriched, total: enriched.length });
    } catch (err) {
      console.error("Escrow fetch error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch escrow records" });
    }
  });

  // ── POST /api/escrow/:id/dispute ─────────────────────────────────────────
  app.post("/api/escrow/:id/dispute", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { id } = req.params;
      const { reason } = req.body;

      const [tx] = await db.select().from(paymentEscrows).where(eq(paymentEscrows.id, id));
      if (!tx) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Escrow not found." });
      }

      if (tx.clientId !== userId && tx.freelancerId !== userId) {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You are not a party to this escrow." });
      }

      if (!["held", "auto_released"].includes(tx.status)) {
        return res.status(400).json({ success: false, code: "INVALID_STATE", message: `Cannot dispute an escrow with status '${tx.status}'.` });
      }

      const disputeReason = (reason as string)?.trim() || "User-initiated dispute";
      await db.update(paymentEscrows).set({
        status: "disputed",
        disputedAt: new Date(),
        isOnHold: true,
        holdReason: disputeReason,
        updatedAt: new Date(),
      }).where(eq(paymentEscrows.id, id));

      await auditLog(userId, tx.clientId, "escrow_disputed",
        `Dispute raised on escrow ${id.slice(0, 8)} by ${userId.slice(0, 8)}: ${disputeReason}`);

      try {
        getIO().to("admin_room").emit("admin_notification", {
          type: "fraud",
          message: `⚠️ Dispute raised on escrow ${id.slice(0, 8)}: ${disputeReason}`,
        });
      } catch {}

      res.json({
        success: true,
        message: "Dispute raised. Our team will review within 48 hours.",
        escrowId: id,
      });
    } catch (err) {
      console.error("Dispute error:", err);
      res.status(500).json({ success: false, message: "Failed to raise dispute" });
    }
  });

  log("info", "[routes] Wallet & Escrow user-facing APIs: /api/wallet /api/escrow");
}

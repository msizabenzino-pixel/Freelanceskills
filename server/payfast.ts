import type { Request, Response } from "express";
import crypto from "crypto";

function getConfig() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID || "";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "";
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  const KNOWN_SANDBOX_MERCHANTS = ["10000100", "10046702"];
  const isSandboxMerchant = KNOWN_SANDBOX_MERCHANTS.includes(merchantId);
  const envSandbox = process.env.PAYFAST_SANDBOX;
  let sandbox: boolean;
  if (isSandboxMerchant) {
    sandbox = true;
  } else if (envSandbox === "true") {
    sandbox = true;
  } else if (envSandbox === "false") {
    sandbox = false;
  } else {
    sandbox = true;
  }

  const processUrl = sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  const validateUrl = sandbox
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

  return { merchantId, merchantKey, passphrase, sandbox, processUrl, validateUrl };
}

export function isPayFastConfigured(): boolean {
  const { merchantId, merchantKey } = getConfig();
  return !!(merchantId && merchantKey);
}

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const paramString = Object.entries(data)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
    .join("&");

  const signatureString = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : paramString;

  return crypto.createHash("md5").update(signatureString).digest("hex");
}

function validateSignature(data: Record<string, string>, receivedSignature: string): boolean {
  const { passphrase } = getConfig();
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k !== "signature") filtered[k] = v;
  }
  const expected = generateSignature(filtered, passphrase || undefined);
  return expected === receivedSignature;
}

const VALID_PAYFAST_IPS = [
  "197.97.145.144", "197.97.145.145", "197.97.145.146", "197.97.145.147",
  "197.97.145.148", "197.97.145.149", "197.97.145.150", "197.97.145.151",
  "197.97.145.152", "197.97.145.153", "197.97.145.154", "197.97.145.155",
  "197.97.145.156", "197.97.145.157", "197.97.145.158", "197.97.145.159",
  "41.74.179.192", "41.74.179.193", "41.74.179.194", "41.74.179.195",
  "41.74.179.196", "41.74.179.197", "41.74.179.198", "41.74.179.199",
  "41.74.179.200", "41.74.179.201", "41.74.179.202", "41.74.179.203",
  "41.74.179.204", "41.74.179.205", "41.74.179.206", "41.74.179.207",
];

async function callPayFastValidate(rawBody: string, validateUrl: string): Promise<boolean> {
  try {
    const resp = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
      signal: AbortSignal.timeout(10000),
    });
    const text = await resp.text();
    return text.trim().toUpperCase() === "VALID";
  } catch (err) {
    console.error("PayFast validate call failed:", err);
    return false;
  }
}

const PLATFORM_COMMISSION_BPS = 1000; // 10%

async function computeITNReleaseScore(freelancerId: string, clientId: string, amountCents: number): Promise<{ score: number; autoReleaseHours: number }> {
  try {
    const { db } = await import("./db");
    const { profiles, certificates, walletTransactions, freelancerProfiles } = await import("@shared/schema");
    const { eq, count, sum, and, sql } = await import("drizzle-orm");

    let score = 28; // base

    const certs = await db.select({ c: count() }).from(certificates).where(eq(sql`${certificates.userId}`, freelancerId));
    if (Number(certs[0]?.c || 0) > 0) score += 30;

    const [fp] = await db.select({ completed: profiles.completedJobs, kyc: profiles.kycStatus }).from(profiles).where(eq(profiles.userId, freelancerId));
    if (fp) {
      const completed = fp.completed || 0;
      score += Math.min(Math.round((completed / Math.max(completed + 5, 1)) * 25), 25);
      if (fp.kyc === "verified") score += 10;
    }

    const [fpRow] = await db.select({ rt: freelancerProfiles.responseTimeHours }).from(freelancerProfiles).where(eq(freelancerProfiles.userId, freelancerId));
    const rt = fpRow?.rt || 24;
    score += rt <= 8 ? 15 : rt <= 24 ? 8 : rt <= 48 ? 4 : 0;

    score = Math.min(score, 100);
    const autoReleaseHours = score >= 80 ? 48 : 72;
    return { score, autoReleaseHours };
  } catch {
    return { score: 28, autoReleaseHours: 72 };
  }
}

function computeITNFraudRisk(amountCents: number, daysSinceAccountCreated: number): number {
  let risk = 0;
  if (amountCents > 5000000) risk += 20;
  if (amountCents > 10000000) risk += 15;
  if (daysSinceAccountCreated < 1) risk += 25;
  else if (daysSinceAccountCreated < 7) risk += 15;
  return Math.min(risk, 100);
}

export async function createPayment(req: Request, res: Response) {
  const config = getConfig();

  if (!config.merchantId || !config.merchantKey) {
    return res.status(503).json({ error: "Payment system not configured. Please set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY." });
  }

  const { amount, itemName, itemDescription, email, firstName, lastName, bookingId, userId } = req.body;

  if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const amountInRands = (parseInt(amount) / 100).toFixed(2);
  const paymentId = `PF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  let baseUrl = process.env.PUBLIC_URL || process.env.SITE_URL || "";
  if (!baseUrl) {
    if (process.env.REPLIT_DOMAINS) {
      baseUrl = `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`;
    } else {
      baseUrl = "https://freelanceskills.net";
    }
  }

  const paymentData: Record<string, string> = {
    merchant_id: config.merchantId,
    return_url: `${baseUrl}/checkout?pf_return=success&pf_payment_id=${paymentId}`,
    cancel_url: `${baseUrl}/checkout?pf_return=cancelled`,
    notify_url: `${baseUrl}/api/payfast/itn`,
    m_payment_id: paymentId,
    amount: amountInRands,
    item_name: (itemName || "FreelanceSkills Service").substring(0, 100),
    item_description: (itemDescription || "Service booking payment").substring(0, 255),
  };

  if (firstName) paymentData.name_first = firstName;
  if (lastName) paymentData.name_last = lastName;
  if (email) paymentData.email_address = email;
  if (bookingId) paymentData.custom_str1 = bookingId;
  if (userId) paymentData.custom_str2 = userId;
  paymentData.custom_str3 = "freelanceskills";

  const signature = generateSignature(paymentData, config.passphrase || undefined);
  paymentData.signature = signature;

  console.log(JSON.stringify({
    event: "payfast_payment_created",
    paymentId,
    amount: amountInRands,
    sandbox: config.sandbox,
    processUrl: config.processUrl,
    merchantId: config.merchantId.substring(0, 4) + "****",
    timestamp: new Date().toISOString(),
  }));

  res.json({
    paymentId,
    paymentUrl: config.processUrl,
    paymentData,
    sandbox: config.sandbox,
  });
}

export async function handleITN(req: Request, res: Response) {
  const config = getConfig();

  try {
    // ── Step 1: Parse raw body ──────────────────────────────────────────────
    const rawBody = req.body as Buffer;
    const bodyString = rawBody ? rawBody.toString("utf-8") : "";
    const data: Record<string, string> = {};
    if (bodyString) {
      const params = new URLSearchParams(bodyString);
      params.forEach((v, k) => { data[k] = v; });
    }
    if (!bodyString && req.body && typeof req.body === "object") {
      for (const [k, v] of Object.entries(req.body)) {
        if (typeof v === "string") data[k] = v;
      }
    }

    console.log(JSON.stringify({
      event: "payfast_itn_received",
      paymentId: data.m_payment_id,
      status: data.payment_status,
      timestamp: new Date().toISOString(),
    }));

    // ── Step 2: IP whitelist (production only) ─────────────────────────────
    if (!config.sandbox) {
      const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      if (!VALID_PAYFAST_IPS.includes(clientIp)) {
        console.error(`PayFast ITN REJECTED: Non-whitelisted IP in production: ${clientIp}`);
        return res.status(403).send("Forbidden");
      }
    }

    // ── Step 3: Signature validation ───────────────────────────────────────
    if (config.passphrase) {
      if (!data.signature) {
        console.error("PayFast ITN REJECTED: Missing signature");
        return res.status(400).send("Missing signature");
      }
      if (!validateSignature(data, data.signature)) {
        console.error("PayFast ITN REJECTED: Invalid signature");
        return res.status(400).send("Invalid signature");
      }
    }

    // ── Step 4: Server-side validate call to PayFast (sandbox + production) ──
    const rawBodyForValidate = bodyString || new URLSearchParams(data).toString();
    const isValid = await callPayFastValidate(rawBodyForValidate, config.validateUrl);
    if (!isValid) {
      console.error(`PayFast ITN REJECTED: PayFast validate returned INVALID (sandbox=${config.sandbox})`);
      return res.status(400).send("Validation failed");
    }

    const paymentStatus = data.payment_status;
    const paymentId = data.m_payment_id;
    const amountGross = data.amount_gross;
    const bookingId = data.custom_str1;
    const userId = data.custom_str2;
    const pfPaymentId = data.pf_payment_id;

    console.log(JSON.stringify({
      event: "payfast_itn",
      paymentId, paymentStatus, amountGross, bookingId, userId, pfPaymentId,
      timestamp: new Date().toISOString(),
    }));

    const { db } = await import("./db");
    const { webhookEvents, paymentEscrows, profiles, walletTransactions, userActivityLogs } = await import("@shared/schema");
    const { eq, and } = await import("drizzle-orm");

    // ── Step 5: Atomic idempotency claim (INSERT first, process after) ───────
    // Insert with status='processing'. Unique constraint on (source, idempotency_key)
    // guarantees only one concurrent request proceeds, even under replay/race conditions.
    const idempotencyKey = paymentId || `pf-${pfPaymentId || Date.now()}`;
    const eventPayload = JSON.stringify({ paymentId, paymentStatus, amountGross, bookingId });
    let webhookEventId: string;
    try {
      const [ev] = await db.insert(webhookEvents).values({
        source: "payfast",
        eventType: paymentStatus || "unknown",
        idempotencyKey,
        payload: eventPayload,
        status: "processing",
      }).returning({ id: webhookEvents.id });
      webhookEventId = ev.id;
    } catch (err: any) {
      // Unique constraint violation = duplicate replay; return 200 immediately
      if (err?.message?.includes("unique") || err?.code === "23505") {
        console.log(`PayFast ITN duplicate ignored (unique violation): ${idempotencyKey}`);
        return res.status(200).send("OK");
      }
      throw err; // unexpected DB error — surface as 500
    }

    // ── Step 6: Process the event (escrow creation must succeed on COMPLETE) ─
    try {
      if (paymentStatus === "COMPLETE") {
        const { storage } = await import("./storage");
        const amountCents = Math.round(parseFloat(amountGross || "0") * 100);

        // Flag high-value transactions (non-fatal)
        if (amountCents > 10000000) {
          try {
            await storage.createFraudFlag({
              userId: userId || "unknown",
              bookingId: bookingId || null,
              riskScore: 85,
              flags: ["High value transaction (> R100,000)"],
              recommendation: "review",
            });
          } catch {}
        }

        // Confirm booking in old system (backward compat, non-fatal)
        if (bookingId) {
          try { await storage.updateBookingStatus(bookingId, "confirmed"); } catch {}
        }

        // Resolve freelancer from booking
        let freelancerId: string | undefined;
        if (bookingId) {
          try {
            const booking = await storage.getBooking(bookingId);
            if (booking?.freelancerId) freelancerId = booking.freelancerId;
          } catch {}
        }

        const platformFeeCents = Math.round(amountCents * (PLATFORM_COMMISSION_BPS / 10000));
        const freelancerPayoutCents = amountCents - platformFeeCents;
        const fraudRisk = computeITNFraudRisk(amountCents, 30);
        const { score: releaseScore, autoReleaseHours } = await computeITNReleaseScore(
          freelancerId || "", userId || "", amountCents
        );
        const autoReleaseAt = new Date(Date.now() + autoReleaseHours * 3600 * 1000);

        // CRITICAL: escrow creation is required for COMPLETE; let failure propagate
        await db.insert(paymentEscrows).values({
          jobId: null,
          jobTitle: data.item_name || null,
          clientId: userId || "unknown",
          freelancerId: freelancerId || null,
          amountCents,
          platformFeeCents,
          freelancerPayoutCents,
          status: "held",
          releaseScore,
          fraudRiskScore: fraudRisk,
          autoReleaseAt: releaseScore >= 60 ? autoReleaseAt : null,
          isOnHold: fraudRisk >= 60,
          holdReason: fraudRisk >= 60 ? "AI fraud risk auto-hold" : null,
          payoutRef: pfPaymentId || paymentId,
        });
        console.log(`[PayFast] Escrow created: R${(amountCents / 100).toFixed(2)} for booking ${bookingId}`);

      } else if (paymentStatus === "CANCELLED") {
        const { storage } = await import("./storage");
        if (bookingId) {
          try { await storage.updateBookingStatus(bookingId, "cancelled"); } catch {}
        }
      }

      // ── Step 7: Mark event as processed ─────────────────────────────────
      await db.update(webhookEvents)
        .set({ status: "processed", processedAt: new Date() })
        .where(eq(webhookEvents.id, webhookEventId));

      res.status(200).send("OK");

    } catch (processingErr: any) {
      // Mark event as failed so admin can see it + PayFast can retry
      console.error("[PayFast] ITN processing failed (will retry):", processingErr.message);
      try {
        await db.update(webhookEvents)
          .set({ status: "failed", errorMessage: String(processingErr.message).substring(0, 500) })
          .where(eq(webhookEvents.id, webhookEventId));
      } catch {}
      return res.status(500).send("Processing failed — will retry");
    }
  } catch (error: any) {
    console.error("PayFast ITN error:", error.message);
    res.status(500).send("ITN processing failed");
  }
}

export async function getPaymentConfig(_req: Request, res: Response) {
  const config = getConfig();
  res.json({
    configured: isPayFastConfigured(),
    sandbox: config.sandbox,
    gateway: "PayFast",
    supportedMethods: ["Credit Card", "Debit Card", "EFT", "Masterpass", "SnapScan", "Mobicred", "SCode", "Samsung Pay", "Apple Pay"],
    currencies: ["ZAR"],
    merchantId: config.merchantId ? `${config.merchantId.substring(0, 4)}****` : null,
  });
}

export async function getPaymentStatus(req: Request, res: Response) {
  const { paymentId } = req.params;
  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID required" });
  }
  try {
    const { db } = await import("./db");
    const { webhookEvents } = await import("@shared/schema");
    const { and, eq } = await import("drizzle-orm");

    const [event] = await db.select({
      status: webhookEvents.eventType,
      processedAt: webhookEvents.processedAt,
    }).from(webhookEvents).where(
      and(eq(webhookEvents.source, "payfast"), eq(webhookEvents.idempotencyKey, paymentId))
    ).limit(1);

    if (event) {
      return res.json({
        paymentId,
        status: event.status === "COMPLETE" ? "complete" : event.status?.toLowerCase() || "processed",
        processedAt: event.processedAt,
        gateway: "PayFast",
      });
    }
  } catch {}

  res.json({
    paymentId,
    status: "pending",
    gateway: "PayFast",
    message: "Payment status is updated via ITN callback.",
  });
}

const pendingPayments = new Map<string, { paymentUrl: string; paymentData: Record<string, string>; createdAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pendingPayments) {
    if (now - v.createdAt > 5 * 60 * 1000) pendingPayments.delete(k);
  }
}, 60000);

export function storePaymentForRedirect(req: Request, res: Response) {
  const { paymentUrl, paymentData } = req.body;
  if (!paymentUrl || !paymentData) {
    return res.status(400).json({ error: "Missing payment data" });
  }
  const token = crypto.randomUUID();
  pendingPayments.set(token, { paymentUrl, paymentData, createdAt: Date.now() });
  res.json({ token });
}

export function servePaymentRedirectPage(req: Request, res: Response) {
  const { token } = req.params;
  const data = pendingPayments.get(token);
  if (!data) {
    return res.status(410).send("<html><body><h1>Payment session expired</h1><p>Please go back and try again.</p></body></html>");
  }
  pendingPayments.delete(token);

  const inputs = Object.entries(data.paymentData)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`)
    .join("\n");

  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Resource-Policy");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache");
  res.send(`<!DOCTYPE html>
<html><head><title>Redirecting to PayFast...</title></head>
<body>
<p>Redirecting to PayFast, please wait...</p>
<form id="pf" method="POST" action="${data.paymentUrl}">
${inputs}
</form>
<script>document.getElementById("pf").submit();</script>
</body></html>`);
}

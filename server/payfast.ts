import type { Request, Response } from "express";
import crypto from "crypto";

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "";
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "";
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "";
const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX !== "false";

const PAYFAST_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

const PAYFAST_VALIDATE_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/query/validate"
  : "https://www.payfast.co.za/eng/query/validate";

export function isPayFastConfigured(): boolean {
  return !!(PAYFAST_MERCHANT_ID && PAYFAST_MERCHANT_KEY);
}

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const params = Object.entries(data)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
    .join("&");

  const signatureString = passphrase ? `${params}&passphrase=${encodeURIComponent(passphrase.trim())}` : params;
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

function validateSignature(data: Record<string, string>, receivedSignature: string): boolean {
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k !== "signature") filtered[k] = v;
  }
  const expected = generateSignature(filtered, PAYFAST_PASSPHRASE || undefined);
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

export async function createPayment(req: Request, res: Response) {
  if (!isPayFastConfigured()) {
    return res.status(503).json({ error: "Payment system not configured. Please set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY." });
  }

  const { amount, itemName, itemDescription, email, firstName, lastName, bookingId, userId } = req.body;

  if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const amountInRands = (parseInt(amount) / 100).toFixed(2);
  const paymentId = `PF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://freelanceskills.net";

  const paymentData: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `${baseUrl}/checkout?pf_return=success&pf_payment_id=${paymentId}`,
    cancel_url: `${baseUrl}/checkout?pf_return=cancelled`,
    notify_url: `${baseUrl}/api/payfast/itn`,
    name_first: firstName || "Customer",
    name_last: lastName || "",
    email_address: email || "",
    m_payment_id: paymentId,
    amount: amountInRands,
    item_name: (itemName || "FreelanceSkills Service").substring(0, 100),
    item_description: (itemDescription || "Service booking payment").substring(0, 255),
    custom_str1: bookingId || "",
    custom_str2: userId || "",
    custom_str3: "freelanceskills",
  };

  const signature = generateSignature(paymentData, PAYFAST_PASSPHRASE || undefined);
  paymentData.signature = signature;

  res.json({
    paymentId,
    paymentUrl: PAYFAST_URL,
    paymentData,
    sandbox: PAYFAST_SANDBOX,
  });
}

export async function handleITN(req: Request, res: Response) {
  try {
    const data = req.body as Record<string, string>;

    if (!PAYFAST_SANDBOX) {
      const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      if (!VALID_PAYFAST_IPS.includes(clientIp)) {
        console.error(`PayFast ITN: Invalid source IP: ${clientIp}`);
        return res.status(403).send("Invalid source IP");
      }
    }

    if (data.signature && PAYFAST_PASSPHRASE) {
      const isValid = validateSignature(data, data.signature);
      if (!isValid) {
        console.error("PayFast ITN: Invalid signature");
        return res.status(400).send("Invalid signature");
      }
    }

    const paymentStatus = data.payment_status;
    const paymentId = data.m_payment_id;
    const amountGross = data.amount_gross;
    const bookingId = data.custom_str1;
    const userId = data.custom_str2;

    console.log(JSON.stringify({
      event: "payfast_itn",
      paymentId,
      paymentStatus,
      amountGross,
      bookingId,
      userId,
      pfPaymentId: data.pf_payment_id,
      timestamp: new Date().toISOString(),
    }));

    if (paymentStatus === "COMPLETE") {
      const { storage } = await import("./storage");

      const amountCents = Math.round(parseFloat(amountGross || "0") * 100);

      if (amountCents > 10000000) {
        await storage.createFraudFlag({
          userId: userId || "unknown",
          bookingId: bookingId || null,
          riskScore: 85,
          flags: ["High value transaction (> R100,000)"],
          recommendation: "review",
        });
        console.log(`High value transaction flagged: ${paymentId}`);
      }

      if (bookingId) {
        await storage.updateBookingStatus(bookingId, "confirmed");
        console.log(`Booking ${bookingId} confirmed via PayFast ITN`);

        const booking = await storage.getBooking(bookingId);
        if (booking && booking.freelancerId) {
          await storage.createEscrowTransaction({
            bookingId,
            clientId: userId || "unknown",
            freelancerId: booking.freelancerId,
            amount: amountCents,
            payfastPaymentId: data.pf_payment_id || paymentId,
            status: "held",
          });
          console.log(`Escrow created for booking ${bookingId}: R${amountGross}`);
        }
      }
    } else if (paymentStatus === "CANCELLED") {
      const { storage } = await import("./storage");
      if (bookingId) {
        await storage.updateBookingStatus(bookingId, "cancelled");
        console.log(`Booking ${bookingId} cancelled via PayFast ITN`);
      }
    }

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("PayFast ITN error:", error.message);
    res.status(500).send("ITN processing failed");
  }
}

export async function getPaymentConfig(_req: Request, res: Response) {
  res.json({
    configured: isPayFastConfigured(),
    sandbox: PAYFAST_SANDBOX,
    gateway: "PayFast",
    supportedMethods: ["Credit Card", "Debit Card", "EFT", "Masterpass", "SnapScan", "Mobicred", "SCode", "Samsung Pay", "Apple Pay"],
    currencies: ["ZAR"],
    merchantId: PAYFAST_MERCHANT_ID ? `${PAYFAST_MERCHANT_ID.substring(0, 4)}****` : null,
  });
}

export async function getPaymentStatus(req: Request, res: Response) {
  const { paymentId } = req.params;
  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID required" });
  }

  res.json({
    paymentId,
    status: "pending",
    gateway: "PayFast",
    message: "Payment status is updated via ITN callback. Check your dashboard for the latest status.",
  });
}

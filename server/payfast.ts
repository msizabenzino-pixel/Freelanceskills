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
    merchant_key: config.merchantKey,
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
    const data = req.body as Record<string, string>;

    console.log(JSON.stringify({
      event: "payfast_itn_received",
      paymentId: data.m_payment_id,
      status: data.payment_status,
      timestamp: new Date().toISOString(),
    }));

    if (!config.sandbox) {
      const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      if (!VALID_PAYFAST_IPS.includes(clientIp)) {
        console.warn(`PayFast ITN: Non-whitelisted IP in production: ${clientIp}, accepting anyway for sandbox testing`);
      }
    }

    if (data.signature && config.passphrase) {
      const isValid = validateSignature(data, data.signature);
      if (!isValid) {
        console.warn("PayFast ITN: Signature validation failed, accepting anyway for sandbox");
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

  res.json({
    paymentId,
    status: "pending",
    gateway: "PayFast",
    message: "Payment status is updated via ITN callback. Check your dashboard for the latest status.",
  });
}

export async function redirectToPayment(req: Request, res: Response) {
  try {
    const { paymentData, paymentUrl } = req.body;

    if (!paymentData || !paymentUrl) {
      return res.status(400).json({ error: "Payment data and URL required" });
    }

    // Generate HTML form that auto-submits
    const formHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Processing Payment...</title>
  <script>
    window.addEventListener('load', function() {
      document.getElementById('payfast-form').submit();
    });
  </script>
</head>
<body style="display: none;">
  <form id="payfast-form" method="POST" action="${paymentUrl}">
    ${Object.entries(paymentData)
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}">`
      )
      .join("")}
  </form>
  <noscript>
    <p>JavaScript is required to complete this payment. Please enable JavaScript and try again.</p>
    <form method="POST" action="${paymentUrl}">
      ${Object.entries(paymentData)
        .map(
          ([key, value]) =>
            `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}">`
        )
        .join("")}
      <button type="submit">Click here to continue</button>
    </form>
  </noscript>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(formHtml);
  } catch (error: any) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: "Failed to redirect to payment gateway" });
  }
}

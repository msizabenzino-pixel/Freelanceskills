/**
 * PayPal Checkout — FreelanceSkills.net
 * Orders API v2: create → capture
 * Requires: PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET in env
 */
import type { Request, Response } from "express";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let _cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.exp) return _cachedToken.token;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  _cachedToken = { token: data.access_token, exp: Date.now() + (data.expires_in - 60) * 1000 };
  return _cachedToken.token;
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export async function createPayPalOrder(req: Request, res: Response) {
  try {
    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." });
    }
    const { amountCents, currency = "ZAR", description } = req.body;
    if (!amountCents || amountCents <= 0) return res.status(400).json({ error: "Invalid amount" });
    const token = await getAccessToken();
    const amount = (amountCents / 100).toFixed(2);
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `fsk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: amount }, description }],
        application_context: {
          brand_name: "FreelanceSkills",
          user_action: "PAY_NOW",
          return_url: `${process.env.APP_URL || "https://freelanceskills.net"}/checkout?paypal_return=success`,
          cancel_url: `${process.env.APP_URL || "https://freelanceskills.net"}/checkout?paypal_return=cancel`,
        },
      }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.json();
      return res.status(orderRes.status).json({ error: err.message || "PayPal order creation failed" });
    }
    const order = await orderRes.json();
    const approveLink = order.links?.find((l: any) => l.rel === "approve")?.href;
    return res.json({ orderId: order.id, approveUrl: approveLink });
  } catch (err: any) {
    console.error("[PayPal] createOrder error:", err);
    return res.status(500).json({ error: err.message || "PayPal order failed" });
  }
}

export async function capturePayPalOrder(req: Request, res: Response) {
  try {
    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured." });
    }
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });
    const token = await getAccessToken();
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!captureRes.ok) {
      const err = await captureRes.json();
      return res.status(captureRes.status).json({ error: err.message || "PayPal capture failed" });
    }
    const capture = await captureRes.json();
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    return res.json({ success: true, captureId, orderId, status: capture.status });
  } catch (err: any) {
    console.error("[PayPal] captureOrder error:", err);
    return res.status(500).json({ error: err.message || "PayPal capture failed" });
  }
}

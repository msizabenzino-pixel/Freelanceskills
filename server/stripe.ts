import Stripe from "stripe";
import { Request, Response } from "express";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY not configured - Stripe payments disabled");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export function isStripeConfigured(): boolean {
  return !!stripe;
}

export async function createPaymentIntent(req: Request, res: Response) {
  if (!stripe) {
    return res.status(503).json({ error: "Payment system not configured" });
  }

  try {
    const { amount, currency, description, metadata } = req.body;

    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: (currency || "zar").toLowerCase(),
      description: description || "FreelanceSkills Payment",
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe createPaymentIntent error:", error.message);
    res.status(500).json({ error: "Failed to create payment. Please try again." });
  }
}

export async function getPaymentStatus(req: Request, res: Response) {
  if (!stripe) {
    return res.status(503).json({ error: "Payment system not configured" });
  }

  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: any) {
    console.error("Stripe getPaymentStatus error:", error.message);
    res.status(500).json({ error: "Failed to retrieve payment status" });
  }
}

export async function getStripePublishableKey(_req: Request, res: Response) {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return res.status(503).json({ error: "Stripe not configured" });
  }
  res.json({ publishableKey });
}

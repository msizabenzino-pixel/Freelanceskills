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
    const paymentIntentId = req.params.paymentIntentId as string;
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

export async function handleWebhook(req: Request, res: Response) {
  if (!stripe) {
    return res.status(503).json({ error: "Stripe not configured" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  const rawBody = (req as any).rawBody;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody || req.body, sig, webhookSecret);
    } else {
      console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (unsafe for production)");
      event = typeof req.body === "string" ? JSON.parse(req.body) : req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id} — ${paymentIntent.amount} ${paymentIntent.currency}`);
        const { storage } = await import("./storage");
        const bookingId = paymentIntent.metadata?.bookingId;
        const userId = paymentIntent.metadata?.userId || "unknown";

        // Structured logging
        console.log(JSON.stringify({
          event: "payment_intent.succeeded",
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          bookingId,
          userId,
          timestamp: new Date().toISOString()
        }));

        if (paymentIntent.amount > 10000000) { // R100,000 in cents
          await storage.createFraudFlag({
            userId,
            bookingId: bookingId || null,
            riskScore: 85,
            flags: ["High value transaction (> R100,000)"],
            recommendation: "review",
          });
          console.log(`High value transaction flagged for booking ${bookingId}`);
        }

        if (bookingId) {
          await storage.updateBookingStatus(bookingId, "confirmed");
          console.log(`Booking ${bookingId} confirmed via webhook`);

          const booking = await storage.getBooking(bookingId);
          if (booking && booking.freelancerId) {
            await storage.createEscrowTransaction({
              bookingId,
              clientId: userId,
              freelancerId: booking.freelancerId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency.toUpperCase(),
              stripePaymentIntentId: paymentIntent.id,
              status: "held",
            });
            console.log(`Escrow created for booking ${bookingId}: ${paymentIntent.amount} ${paymentIntent.currency}`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedIntent.id} — ${failedIntent.last_payment_error?.message || "unknown error"}`);
        const { storage: failedStorage } = await import("./storage");
        const failedBookingId = failedIntent.metadata?.bookingId;
        if (failedBookingId) {
          await failedStorage.updateBookingStatus(failedBookingId, "cancelled");
          console.log(`Booking ${failedBookingId} cancelled due to payment failure`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Refund processed: ${charge.id} — ${charge.amount_refunded} ${charge.currency}`);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created: ${dispute.id} — amount: ${dispute.amount} ${dispute.currency}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook event:", error.message);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

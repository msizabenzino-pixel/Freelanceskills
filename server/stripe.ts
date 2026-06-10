import type { Request, Response } from "express";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any }) : null;

export function isStripeConfigured(): boolean {
  return !!stripe && !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

export async function createStripeSession(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY." });
    }
    const { amountCents, currency = "zar", description, bookingId, successUrl, cancelUrl } = req.body;
    if (!amountCents || amountCents <= 0) return res.status(400).json({ error: "Invalid amount" });

    const amount = Math.round(amountCents);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: description || "FreelanceSkills Service" },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: successUrl || `${process.env.APP_URL || "https://freelanceskills.net"}/checkout?stripe_return=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || "https://freelanceskills.net"}/checkout?stripe_return=cancel`,
      metadata: { bookingId: bookingId || "", source: "freelanceskills" },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error("[Stripe] createSession error:", err);
    res.status(500).json({ error: err.message || "Stripe session creation failed" });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !endpointSecret) return res.status(503).send("Stripe not configured");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("[Stripe] webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const amount = session.amount_total || 0;
    const { storage } = await import("./storage");

    if (bookingId) {
      await storage.updateBookingStatus(bookingId, "confirmed");
      const booking = await storage.getBooking(bookingId);
      if (booking && booking.freelancerId) {
        await storage.createEscrowTransaction({
          bookingId,
          clientId: booking.clientId,
          freelancerId: booking.freelancerId,
          amount,
          payfastPaymentId: session.id,
          status: "held",
        });
      }
    }
    console.log(`[Stripe] checkout.session.completed: bookingId=${bookingId}, amount=${amount}`);
  }

  res.status(200).json({ received: true });
}

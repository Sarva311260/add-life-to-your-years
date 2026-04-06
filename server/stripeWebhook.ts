/**
 * Stripe Webhook Handler
 * Registered as /api/stripe/webhook with raw body parsing for signature verification.
 */
import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import {
  getReviewRequestBySessionId,
  updateReviewRequest,
  getConsultationById,
  getConsultReport,
} from "./db";
import { notifyOwner } from "./_core/notification";

export function registerStripeWebhook(app: Express) {
  // MUST use express.raw() BEFORE express.json() for this route
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      if (!ENV.stripeSecretKey) {
        console.warn("[Stripe Webhook] Stripe not configured");
        return res.status(400).json({ error: "Stripe not configured" });
      }

      const stripe = new Stripe(ENV.stripeSecretKey);
      const sig = req.headers["stripe-signature"] as string;

      let event: Stripe.Event;

      try {
        if (ENV.stripeWebhookSecret) {
          event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
        } else {
          // Fallback for development without webhook secret
          event = JSON.parse(req.body.toString()) as Stripe.Event;
        }
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status === "paid") {
              const reviewReq = await getReviewRequestBySessionId(session.id);
              if (reviewReq && reviewReq.status === "pending_payment") {
                await updateReviewRequest(reviewReq.id, {
                  status: "paid",
                  stripePaymentIntentId:
                    typeof session.payment_intent === "string"
                      ? session.payment_intent
                      : null,
                });

                // Notify owner
                const consultation = await getConsultationById(reviewReq.consultationId);
                await notifyOwner({
                  title: "New Paid Personal Review Request",
                  content: [
                    `A client has paid US$27 for a personal review.`,
                    ``,
                    `Email: ${session.metadata?.customer_email || session.customer_email || "Unknown"}`,
                    `Name: ${session.metadata?.customer_name || "Unknown"}`,
                    `Consultation ID: ${reviewReq.consultationId}`,
                    `Report ID: ${reviewReq.reportId}`,
                    `Type: ${consultation?.consultType === "full_review" ? "Full Wellness Review" : "Specific Conditions"}`,
                    ``,
                    `Please review their report and add your personal notes.`,
                  ].join("\n"),
                });

                console.log(`[Stripe Webhook] Review request ${reviewReq.id} marked as paid`);
              }
            }
            break;
          }

          case "payment_intent.succeeded": {
            console.log(`[Stripe Webhook] Payment intent succeeded: ${(event.data.object as any).id}`);
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (error) {
        console.error("[Stripe Webhook] Error processing event:", error);
      }

      res.json({ received: true });
    }
  );
}

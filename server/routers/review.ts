/**
 * Review Router — handles personal review requests with Stripe payment.
 * US$27 for a personal review by Sarva Keller.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import {
  createReviewRequest,
  getReviewRequestByReportId,
  getReviewRequestBySessionId,
  updateReviewRequest,
  getUserReviewRequests,
  getConsultReport,
  getConsultationById,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";
import Stripe from "stripe";

const REVIEW_PRICE_USD = 2700; // $27.00 in cents
const REVIEW_PRODUCT_NAME = "Personal Wellness Review by Sarva Keller";
const REVIEW_PRODUCT_DESCRIPTION =
  "A personal review of your consultation report with additional notes and recommendations from Sarva Keller, wellness coach and author of 'Add Life to Your Years'.";

function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey);
}

export const reviewRouter = router({
  /** Check if a review has already been requested for a report */
  getReviewStatus: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ input }) => {
      const existing = await getReviewRequestByReportId(input.reportId);
      if (!existing) return { requested: false, status: null, reviewNotes: null };
      return {
        requested: true,
        status: existing.status,
        reviewNotes: existing.reviewNotes,
        reviewedAt: existing.reviewedAt,
      };
    }),

  /** Create a Stripe checkout session for the personal review */
  createCheckout: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        consultationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment processing is not configured yet. Please try again later.",
        });
      }

      // Check if review already requested
      const existing = await getReviewRequestByReportId(input.reportId);
      if (existing && existing.status !== "pending_payment") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A review has already been requested for this report.",
        });
      }

      // Verify the report exists and belongs to this user
      const report = await getConsultReport(input.consultationId);
      if (!report || report.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found.",
        });
      }

      const origin = ctx.req.headers.origin || "https://addlifetoyouryears.org";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: REVIEW_PRODUCT_NAME,
                description: REVIEW_PRODUCT_DESCRIPTION,
              },
              unit_amount: REVIEW_PRICE_USD,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/consult/review-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/consult/report/${input.consultationId}`,
        client_reference_id: ctx.user.id.toString(),
        customer_email: ctx.user.email || undefined,
        allow_promotion_codes: true,
        metadata: {
          user_id: ctx.user.id.toString(),
          report_id: input.reportId.toString(),
          consultation_id: input.consultationId.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
      });

      // Create or update the review request record
      if (existing) {
        await updateReviewRequest(existing.id, {
          stripeSessionId: session.id,
          status: "pending_payment",
        });
      } else {
        await createReviewRequest({
          userId: ctx.user.id,
          consultationId: input.consultationId,
          reportId: input.reportId,
          stripeSessionId: session.id,
          status: "pending_payment",
        });
      }

      return { checkoutUrl: session.url };
    }),

  /** Create a Stripe checkout session for a voluntary contribution */
  createDonationCheckout: protectedProcedure
    .input(
      z.object({
        consultationId: z.number(),
        amountCents: z.number().min(100).max(100000), // $1 to $1000
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment processing is not configured yet. Please try again later.",
        });
      }

      const origin = ctx.req.headers.origin || "https://addlifetoyouryears.org";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Voluntary Contribution — Add Life to Your Years",
                description: "Thank you for supporting this free wellness service. Your contribution helps keep it available for everyone.",
              },
              unit_amount: input.amountCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/consult/report/${input.consultationId}?donated=true`,
        cancel_url: `${origin}/consult/report/${input.consultationId}`,
        client_reference_id: ctx.user.id.toString(),
        customer_email: ctx.user.email || undefined,
        metadata: {
          type: "donation",
          user_id: ctx.user.id.toString(),
          consultation_id: input.consultationId.toString(),
        },
      });

      notifyOwner({
        title: "New Voluntary Contribution",
        content: `${ctx.user.name || ctx.user.email || "A user"} has made a voluntary contribution of $${(input.amountCents / 100).toFixed(2)} USD.`,
      }).catch(() => {});

      return { checkoutUrl: session.url };
    }),

  /** Verify payment was successful (called from success page) */
  verifyPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) {
        return { success: false, message: "Payment processing not configured." };
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        if (session.payment_status === "paid") {
          // Update the review request
          const reviewReq = await getReviewRequestBySessionId(input.sessionId);
          if (reviewReq && reviewReq.status === "pending_payment") {
            await updateReviewRequest(reviewReq.id, {
              status: "paid",
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id || null,
            });

            // Notify Sarva about the new review request
            const consultation = await getConsultationById(reviewReq.consultationId);
            const report = await getConsultReport(reviewReq.consultationId);
            await notifyOwner({
              title: "💰 New Paid Personal Review Request",
              content: [
                `A client has paid US$27 for a personal review of their consultation report.`,
                ``,
                `Client: ${ctx.user.name || "Unknown"} (${ctx.user.email || "No email"})`,
                `Consultation ID: ${reviewReq.consultationId}`,
                `Report ID: ${reviewReq.reportId}`,
                `Type: ${consultation?.consultType === "full_review" ? "Full Wellness Review" : "Specific Conditions"}`,
                ``,
                `Please review their report and add your personal notes and recommendations.`,
                `You can do this from the admin panel or by updating the review directly.`,
              ].join("\n"),
            });
          }
          return { success: true, message: "Payment confirmed! Sarva will review your report and add personal notes." };
        }
        return { success: false, message: "Payment not yet confirmed. Please wait a moment and refresh." };
      } catch (error) {
        console.error("[Review] Error verifying payment:", error);
        return { success: false, message: "Could not verify payment. Please contact support." };
      }
    }),

  /** Get all review requests for the current user */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    return getUserReviewRequests(ctx.user.id);
  }),
});

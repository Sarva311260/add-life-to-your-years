import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { newsletterSubscribers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

async function sendWelcomeEmail(email: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[Newsletter] RESEND_API_KEY not configured, skipping welcome email.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a1a0c;font-family:Georgia,serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f2410;border-radius:16px;overflow:hidden;border:1px solid #1f3520;">
        <div style="background:linear-gradient(135deg,#0f2410,#1a3a1c);padding:40px 40px 32px;text-align:center;">
          <p style="color:#4ade80;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Add Life to Your Years</p>
          <h1 style="color:#ffffff;font-size:28px;margin:0 0 12px;line-height:1.3;">Welcome to the Guides Newsletter</h1>
          <p style="color:#9ca3af;font-size:16px;margin:0;">Evidence-based wellness, delivered to your inbox.</p>
        </div>
        <div style="padding:36px 40px;">
          <p style="color:#d1fae5;font-size:16px;line-height:1.7;margin:0 0 20px;">
            Thank you for subscribing! You'll be the first to know whenever a new Supplementary Guide is published — deep-dive, evidence-based articles on nutrition, mental wellness, movement, and more.
          </p>
          <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">
            In the meantime, explore all the guides already available on the site:
          </p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://www.addlifetoyouryears.org/blog" style="display:inline-block;background:#4ade80;color:#0a1a0c;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Browse All Guides →
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            You can unsubscribe at any time by replying to this email with "unsubscribe" in the subject line.
          </p>
        </div>
        <div style="background:#071208;padding:20px 40px;text-align:center;border-top:1px solid #1f3520;">
          <p style="color:#4b5563;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Add Life to Your Years · <a href="https://www.addlifetoyouryears.org" style="color:#4ade80;text-decoration:none;">addlifetoyouryears.org</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "Add Life to Your Years <noreply@addlifetoyouryears.org>",
      to: [email],
      subject: "Welcome — you're subscribed to the Guides Newsletter",
      html,
    }),
  });
}

export const newsletterRouter = router({
  /** Subscribe a new email address */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address."),
        sourceSlug: z.string().optional().default(""),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check for duplicate
      const existing = await db
        .select({ id: newsletterSubscribers.id })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        // Already subscribed — return success silently so we don't leak info
        return { success: true, alreadySubscribed: true };
      }

      await db.insert(newsletterSubscribers).values({
        email: input.email.toLowerCase(),
        sourceSlug: input.sourceSlug,
        confirmed: 1,
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(input.email.toLowerCase()).catch((err) =>
        console.error("[Newsletter] Welcome email failed:", err)
      );

      // Notify owner
      notifyOwner({
        title: "New Newsletter Subscriber",
        content: `${input.email} just subscribed to the newsletter${input.sourceSlug ? ` from blog post: ${input.sourceSlug}` : ""}.`,
      }).catch(() => {});

      return { success: true, alreadySubscribed: false };
    }),

  /** Admin: list all subscribers */
  listSubscribers: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(newsletterSubscribers)
      .orderBy(newsletterSubscribers.createdAt);
  }),
});

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import {
  createPemfAffiliate,
  getPemfAffiliateBySlug,
  getPemfAffiliateById,
  checkSlugExists,
  createPemfEnquiry,
} from "../db";

/**
 * Generate a URL-friendly slug from a name.
 * e.g. "John Smith" → "john-smith"
 * If slug already exists, append a number suffix.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const pemfAffiliateRouter = router({
  /**
   * Register a new PEMF affiliate (brand partner).
   * Public — no auth required.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        phone: z.string().min(5).max(50),
      })
    )
    .mutation(async ({ input }) => {
      // Generate slug from name
      let slug = generateSlug(input.name);
      if (!slug) {
        slug = "partner-" + Date.now();
      }

      // Ensure slug is unique by appending a number if needed
      let finalSlug = slug;
      let counter = 1;
      while (await checkSlugExists(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const affiliateId = await createPemfAffiliate({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        slug: finalSlug,
      });

      // Notify the owner about the new affiliate
      notifyOwner({
        title: `New PEMF Brand Partner: ${input.name}`,
        content:
          `A new brand partner has registered for PEMF.\n\n` +
          `Name: ${input.name}\n` +
          `Email: ${input.email}\n` +
          `Phone: ${input.phone}\n` +
          `Personal Link: /pemf/${finalSlug}\n`,
      }).catch((err) => {
        console.warn("[Notification] Failed to send affiliate registration notification:", err);
      });

      return {
        success: true,
        slug: finalSlug,
        affiliateId,
      };
    }),

  /**
   * Look up an affiliate by their URL slug.
   * Public — used to render personalised PEMF pages.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const affiliate = await getPemfAffiliateBySlug(input.slug);
      if (!affiliate || !affiliate.isActive) {
        return null;
      }
      return {
        id: affiliate.id,
        name: affiliate.name,
        phone: affiliate.phone,
        slug: affiliate.slug,
      };
    }),

  /**
   * Submit a contact enquiry from an affiliate's personalised PEMF page.
   * Public — no auth required.
   */
  submitEnquiry: publicProcedure
    .input(
      z.object({
        affiliateSlug: z.string().min(1),
        visitorName: z.string().min(2).max(255),
        visitorEmail: z.string().email().max(320),
        visitorPhone: z.string().max(50).optional(),
        message: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Look up the affiliate
      const affiliate = await getPemfAffiliateBySlug(input.affiliateSlug);
      if (!affiliate || !affiliate.isActive) {
        throw new Error("Affiliate not found");
      }

      // Save the enquiry
      const enquiryId = await createPemfEnquiry({
        affiliateId: affiliate.id,
        visitorName: input.visitorName.trim(),
        visitorEmail: input.visitorEmail.trim().toLowerCase(),
        visitorPhone: input.visitorPhone?.trim() || null,
        message: input.message?.trim() || null,
      });

      // Notify the owner (Sarva)
      notifyOwner({
        title: `New PEMF Enquiry via ${affiliate.name}`,
        content:
          `A visitor has submitted an enquiry through ${affiliate.name}'s PEMF page.\n\n` +
          `Visitor Name: ${input.visitorName}\n` +
          `Visitor Email: ${input.visitorEmail}\n` +
          `Visitor Phone: ${input.visitorPhone || "Not provided"}\n` +
          `Message: ${input.message || "No message"}\n\n` +
          `Brand Partner: ${affiliate.name}\n` +
          `Partner Email: ${affiliate.email}\n` +
          `Partner Phone: ${affiliate.phone}\n`,
      }).catch((err) => {
        console.warn("[Notification] Failed to send enquiry notification to owner:", err);
      });

      // Send notification to the affiliate via email
      // For now, we notify the owner who can forward to the affiliate.
      // The affiliate's email is included in the owner notification above.
      // TODO: Direct email to affiliate when email service is available

      return {
        success: true,
        enquiryId,
      };
    }),
});

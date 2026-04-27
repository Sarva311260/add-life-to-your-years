import type { Express, Request, Response } from "express";
import {
  getPemfAffiliateBySlug,
  getRecommendedProductById,
  getAffiliateProductLinks,
} from "./db";

/**
 * URL cloaking for affiliate product links.
 *
 * Route: GET /go/:affiliateSlug/:productId
 *
 * The visitor's browser stays on addlifetoyouryears.org/go/... — the real
 * destination URL is never exposed. The server resolves the correct affiliate
 * link (or falls back to the default) and issues a 302 redirect.
 *
 * Also handles the hardcoded OlyLife device links used on the PEMF affiliate
 * pages via: GET /go/:affiliateSlug/olylife/:deviceKey
 */

// Hardcoded OlyLife device links (same as in PEMFAffiliate.tsx PRODUCTS array)
const OLYLIFE_LINKS: Record<string, string> = {
  "tera-p90": "https://www.olylife.com/products/tera-p90",
  "terahertz-wand": "https://www.olylife.com/products/terahertz-wand",
  "tera-grand": "https://www.olylife.com/products/tera-grand",
};

export function registerCloakRoutes(app: Express) {
  // ── Dynamic (DB) product cloaking ─────────────────────────────────────────
  // URL: /go/:affiliateSlug/:productId  (productId is a number)
  app.get("/go/:affiliateSlug/:productId", async (req: Request, res: Response) => {
    const { affiliateSlug, productId } = req.params;
    const id = parseInt(productId);

    // If not a number, fall through to OlyLife handler or 404
    if (isNaN(id)) {
      return res.redirect(302, "/");
    }

    try {
      // Look up the product
      const product = await getRecommendedProductById(id);
      if (!product || !product.isPublished) {
        return res.redirect(302, "/");
      }

      let destinationUrl: string | null = null;

      // If the product has affiliate links, try to resolve the affiliate's own link
      if (product.isAffiliate && affiliateSlug) {
        const affiliate = await getPemfAffiliateBySlug(affiliateSlug);
        if (affiliate) {
          const links = await getAffiliateProductLinks(affiliate.id);
          const myLink = links.find(l => l.productId === id);
          if (myLink?.affiliateUrl) {
            destinationUrl = myLink.affiliateUrl;
          }
        }
      }

      // Fall back to default affiliate URL or product URL
      if (!destinationUrl) {
        destinationUrl = product.defaultAffiliateUrl || null;
      }

      if (!destinationUrl) {
        // No URL configured — redirect to the affiliate's page
        return res.redirect(302, `/pemf/${affiliateSlug}`);
      }

      // Security: only allow http/https destinations
      if (!destinationUrl.startsWith("http://") && !destinationUrl.startsWith("https://")) {
        return res.redirect(302, "/");
      }

      // Set affiliate cookie so the destination knows who referred this visitor
      if (affiliateSlug) {
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 100);
        res.cookie("affiliate_slug", affiliateSlug, {
          expires: farFuture,
          path: "/",
          sameSite: "lax",
          httpOnly: false,
        });
      }

      return res.redirect(302, destinationUrl);
    } catch (err) {
      console.warn("[Cloak] Error resolving product link:", err);
      return res.redirect(302, "/");
    }
  });

  // ── OlyLife device cloaking ────────────────────────────────────────────────
  // URL: /go/:affiliateSlug/olylife/:deviceKey
  app.get("/go/:affiliateSlug/olylife/:deviceKey", (req: Request, res: Response) => {
    const { affiliateSlug, deviceKey } = req.params;
    const destinationUrl = OLYLIFE_LINKS[deviceKey];

    if (!destinationUrl) {
      return res.redirect(302, `/pemf/${affiliateSlug}`);
    }

    // Set affiliate cookie
    if (affiliateSlug) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      res.cookie("affiliate_slug", affiliateSlug, {
        expires: farFuture,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return res.redirect(302, destinationUrl);
  });
}

/**
 * GoRedirect — client-side handler for /go/:affiliateSlug/:productId
 * and /go/:affiliateSlug/olylife/:deviceKey
 *
 * The Manus deployment proxy serves the React SPA for ALL paths, so the
 * server-side Express cloak route never fires in production. This component
 * replicates the same logic client-side: it calls the tRPC resolveLink
 * procedure, sets the affiliate_slug cookie, and then redirects the browser
 * to the resolved destination URL.
 */
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

/** Parse the URL to extract affiliateSlug, productId, and deviceKey */
function parseGoPath() {
  // Possible patterns:
  //   /go/:affiliateSlug/:productId          → numeric productId
  //   /go/:affiliateSlug/olylife/:deviceKey  → OlyLife device
  const path = window.location.pathname; // e.g. /go/peter-keller/1
  const parts = path.split("/").filter(Boolean); // ["go", "peter-keller", "1"]
  if (parts.length < 3 || parts[0] !== "go") return null;

  const affiliateSlug = parts[1];

  if (parts[2] === "olylife" && parts[3]) {
    return { affiliateSlug, deviceKey: parts[3], productId: undefined };
  }

  const productId = parseInt(parts[2], 10);
  if (!isNaN(productId)) {
    return { affiliateSlug, productId, deviceKey: undefined };
  }

  return null;
}

function setAffiliateCookie(slug: string) {
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 100);
  document.cookie = `affiliate_slug=${encodeURIComponent(slug)}; expires=${farFuture.toUTCString()}; path=/; SameSite=Lax`;
}

export default function GoRedirect() {
  const parsed = parseGoPath();
  const [error, setError] = useState(false);

  const { data, isError } = trpc.recommendedProducts.resolveLink.useQuery(
    parsed
      ? {
          affiliateSlug: parsed.affiliateSlug,
          productId: parsed.productId,
          deviceKey: parsed.deviceKey,
        }
      : { affiliateSlug: "" },
    { enabled: !!parsed, retry: 1 }
  );

  useEffect(() => {
    if (!parsed) {
      setError(true);
      return;
    }
    if (isError) {
      setError(true);
      return;
    }
    if (data) {
      // Set affiliate cookie so the destination site knows who referred this visitor
      if (data.affiliateSlug) {
        setAffiliateCookie(data.affiliateSlug);
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        // No URL configured — fall back to affiliate's PEMF page
        window.location.href = `/pemf/${parsed.affiliateSlug}`;
      }
    }
  }, [data, isError, parsed]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Link not found.</p>
          <a href="/" className="text-green-700 underline">Return to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500">Redirecting…</p>
      </div>
    </div>
  );
}

import { Helmet } from "react-helmet-async";

const SITE_NAME = "Add Life to Your Years";
const DEFAULT_DESCRIPTION =
  "Proven, evidence-based strategies for health, wellness and vitality. Assess your wellbeing across 8 key factors and receive personalised recommendations.";
const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/og-image_default.jpg";
const SITE_URL = "https://www.addlifetoyouryears.org";

interface SEOProps {
  /** Page-specific title. Will be formatted as "[title] | Add Life to Your Years" */
  title?: string;
  /** Page-specific description (max ~160 chars for Google) */
  description?: string;
  /** Absolute URL of the Open Graph image */
  ogImage?: string;
  /** Canonical URL path, e.g. "/blog/lavender-oil-anxiety" */
  canonicalPath?: string;
  /** Article published date (ISO string) — used for blog posts */
  publishedAt?: string;
  /** Article tags — used for blog posts */
  keywords?: string;
  /** JSON-LD structured data object */
  jsonLd?: object;
  /** If true, use the title as-is without appending site name */
  titleOverride?: boolean;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  canonicalPath,
  publishedAt,
  keywords,
  jsonLd,
  titleOverride = false,
}: SEOProps) {
  const pageTitle = title
    ? titleOverride
      ? title
      : `${title} | ${SITE_NAME}`
    : SITE_NAME;

  const canonicalUrl = canonicalPath
    ? `${SITE_URL}${canonicalPath}`
    : undefined;

  return (
    <Helmet>
      {/* Basic */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={publishedAt ? "article" : "website"} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article-specific */}
      {publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

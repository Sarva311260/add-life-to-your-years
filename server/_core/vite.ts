import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

const PEMF_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/pemf-og-preview-QkKSUDdWroshPSHHXSrr3f.png";

function getPemfMetaTags(slug?: string): string {
  const title = slug
    ? `PEMF Healing — ${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | Add Life to Your Years`
    : "PEMF Healing | Pulsed Electromagnetic Field Therapy";
  const description = "Discover how PEMF therapy recharges your cells, restores energy, and supports healing. Clinically proven technology now available for home use.";
  return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${PEMF_OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${PEMF_OG_IMAGE}" />`;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    // Let server-side Express routes handle /go/ (affiliate link cloaking) and /track/ (email tracking)
    if (url.startsWith("/go/") || url.startsWith("/track/")) {
      return next();
    }
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      // Inject PEMF-specific Open Graph meta tags for /pemf routes
      if (url.startsWith("/pemf")) {
        const slugMatch = url.match(/^\/pemf\/([^/?#]+)/);
        const slug = slugMatch && slugMatch[1] !== 'join' ? slugMatch[1] : undefined;
        const ogTags = getPemfMetaTags(slug);
        page = page.replace('</head>', `${ogTags}\n  </head>`);
      }
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res, next) => {
    const url = req.originalUrl;
    // Let server-side Express routes handle /go/ (affiliate link cloaking) and /track/ (email tracking)
    if (url.startsWith("/go/") || url.startsWith("/track/")) {
      return next();
    }
    if (url.startsWith("/pemf")) {
      const indexPath = path.resolve(distPath, "index.html");
      fs.readFile(indexPath, "utf-8", (err, html) => {
        if (err) {
          res.sendFile(indexPath);
          return;
        }
        const slugMatch = url.match(/^\/pemf\/([^/?#]+)/);
        const slug = slugMatch && slugMatch[1] !== 'join' ? slugMatch[1] : undefined;
        const ogTags = getPemfMetaTags(slug);
        const injected = html.replace('</head>', `${ogTags}\n  </head>`);
        res.status(200).set({ "Content-Type": "text/html" }).end(injected);
      });
    } else {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}

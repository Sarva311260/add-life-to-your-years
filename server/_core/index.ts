import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStripeWebhook } from "../stripeWebhook";
import { registerTrackingRoutes } from "../trackingRoutes";
import { registerCloakRoutes } from "../cloakRoutes";
import { registerYouTubeRoutes } from "../youtubeRoutes";
import { processVideoQueueHandler } from "../videoQueueHandler";
import { registerStorageProxy } from "./storageProxy";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  // Trust reverse proxy (Cloudflare, Manus proxy) so req.protocol, req.hostname,
  // req.secure, and req.ip reflect the real client values, not the proxy's.
  // This is critical for cookies with Secure flag behind HTTPS-terminating proxies.
  app.set('trust proxy', true);
  const server = createServer(app);
  // Storage proxy for /manus-storage/* paths (must be before body parsers)
  registerStorageProxy(app);
  // Stripe webhook must be registered BEFORE express.json() for raw body parsing
  registerStripeWebhook(app);

  // Token-to-cookie exchange endpoint for browsers that block cookies during redirects
  // (e.g., Edge InPrivate mode). The frontend calls this via XHR after OAuth redirect.
  app.post('/api/auth/set-session', express.json(), (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'token is required' });
    }
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    console.log('[Auth] Set session cookie via token exchange (Edge InPrivate fallback)');
    res.json({ ok: true });
  });

  // Diagnostic endpoint to debug cookie/proxy issues (temporary)
  app.get('/api/debug/session', (req, res) => {
    // Set a test cookie to verify Set-Cookie headers work
    res.cookie('debug_test', 'works', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 60000,
    });
    res.json({
      protocol: req.protocol,
      secure: req.secure,
      hostname: req.hostname,
      ip: req.ip,
      xForwardedProto: req.headers['x-forwarded-proto'],
      xForwardedHost: req.headers['x-forwarded-host'],
      host: req.headers['host'],
      hasCookie: !!req.headers.cookie,
      cookieNames: req.headers.cookie ? req.headers.cookie.split(';').map(c => c.trim().split('=')[0]) : [],
      rawCookieHeader: req.headers.cookie || '(none)',
    });
  });
  // Health check endpoint — used by UptimeRobot to verify the full server stack
  // (Express + database) is working, not just that the static HTML file loads.
  app.get('/api/health', async (_req, res) => {
    const start = Date.now();
    try {
      const { getDb } = await import('../db');
      const db = await getDb();
      // Run a lightweight DB ping — select 1 is the standard health check query
      if (db) {
        await db.execute('SELECT 1');
      }
      res.json({
        status: 'ok',
        db: db ? 'ok' : 'unavailable',
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[health] check failed:', err);
      res.status(503).json({
        status: 'error',
        db: 'error',
        message: err instanceof Error ? err.message : 'unknown error',
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Email tracking routes (open pixel + click redirect)
  registerTrackingRoutes(app);
  // URL cloaking for affiliate product links (/go/:affiliateSlug/:productId)
  registerCloakRoutes(app);
  // YouTube OAuth callback (/api/youtube/callback)
  registerYouTubeRoutes(app);

  // Dynamic sitemap.xml
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const { blogPosts } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = await getDb();
      const posts = db
        ? await db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.published, 1)).orderBy(desc(blogPosts.updatedAt))
        : [];
      const base = "https://www.addlifetoyouryears.org";
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/book", priority: "0.9", changefreq: "monthly" },
        { url: "/blog", priority: "0.9", changefreq: "weekly" },
        { url: "/media", priority: "0.8", changefreq: "weekly" },
        { url: "/questionnaire", priority: "0.8", changefreq: "monthly" },
        { url: "/shop", priority: "0.7", changefreq: "weekly" },
        { url: "/consult", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.6", changefreq: "yearly" },
      ];
      const today = new Date().toISOString().split("T")[0];
      const urls = [
        ...staticPages.map(p => `  <url><loc>${base}${p.url}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
        ...posts.map(p => `  <url><loc>${base}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[sitemap] error:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Heartbeat: video generation queue processor (runs every 60s via Manus cron)
  app.post("/api/scheduled/process-video-queue", processVideoQueueHandler);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

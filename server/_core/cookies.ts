import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalRequest(req: Request): boolean {
  const hostname = req.hostname;
  return LOCAL_HOSTS.has(hostname);
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isLocal = isLocalRequest(req);

  // For production (proxied environments like Manus):
  // - Use sameSite: "lax" because frontend and backend are same-origin (/api/*)
  //   and OAuth uses top-level redirects (not iframes), so "lax" works correctly.
  // - Always set secure: true in production because all traffic goes through HTTPS.
  //   Previously, secure depended on x-forwarded-proto detection which could fail
  //   on the OAuth callback, causing browsers to silently reject the SameSite=None
  //   cookie (browsers require Secure=true for SameSite=None), creating a login loop.
  //
  // For local development:
  // - Use sameSite: "lax" and secure: false (localhost doesn't use HTTPS).
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: !isLocal,
  };
}

import { config } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";

export const activeConfig: SecurityConfig = {
  strictDynamic: true,
  enforceTls: true,
  devOnly: true,
  turnstile: true,
  crossOriginResourcePolicy: "same-origin",
  crossOriginOpenerPolicy: "same-origin",
  crossOriginEmbedderPolicy: "credentialless",
  stripHeaders: ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"],
  manifest: {},
  ...config,
  ratelimit:
    config?.ratelimit === false
      ? false
      : {
          bindingName: "RATE_LIMIT",
          retryAfter: 60,
          ...config?.ratelimit,
        },
  construction:
    config?.construction === false
      ? false
      : {
          constructionPath: "/construction",
          cookieName: "rimelight-construction-guest",
          cookieMaxAge: 604800,
          renderFallback: true,
          ...config?.construction,
        },
};

export function buildCspHeader(options: SecurityConfig = {}, nonce?: string): string {
  const domain = options.domain
    ?.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/)[0];
  const allowed = options.allowedDomains || [];
  const turnstile = options.turnstile !== false;

  const imgSources = Array.from(
    new Set([
      "'self'",
      "data:",
      ...(domain ? [`https://cdn.${domain}`] : []),
      "https://i3.ytimg.com",
      ...allowed,
      ...(options.imgSrc || []),
    ]),
  );
  const connectSources = Array.from(
    new Set([
      "'self'",
      ...(turnstile ? ["https://challenges.cloudflare.com"] : []),
      ...allowed,
      ...(options.connectSrc || []),
    ]),
  );
  const frameSources = Array.from(
    new Set([
      "'self'",
      ...(turnstile ? ["https://challenges.cloudflare.com"] : []),
      "https://www.youtube.com",
      ...allowed,
      ...(options.frameSrc || []),
    ]),
  );
  const useStrictDynamic = nonce && options.strictDynamic !== false;
  const scriptSources = Array.from(
    new Set([
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(useStrictDynamic ? ["'strict-dynamic'", "https:"] : []),
      "'inline-speculation-rules'",
      ...(turnstile ? ["https://challenges.cloudflare.com"] : []),
      ...(options.scriptResources || []),
    ]),
  );
  const styleSources = Array.from(
    new Set(["'self'", ...(nonce ? [`'nonce-${nonce}'`] : []), ...(options.styleResources || [])]),
  );

  const directives: Record<string, string[]> = {
    "default-src": ["'none'"],
    "img-src": imgSources,
    "font-src": ["'self'"],
    "connect-src": connectSources,
    "frame-ancestors": ["'none'"],
    "frame-src": frameSources,
    "script-src": scriptSources,
    "script-src-attr": ["'none'"],
    "style-src": styleSources,
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  if (options.trustedTypes) {
    directives["require-trusted-types-for"] = ["'script'"];
  }

  if (options.directives) {
    for (const [key, val] of Object.entries(options.directives)) {
      if (val === false) delete directives[key];
      else if (val === true) directives[key] = [];
      else if (Array.isArray(val)) directives[key] = val;
      else if (typeof val === "string") directives[key] = val.split(" ").filter(Boolean);
    }
  }

  return Object.entries(directives)
    .map(([dir, vals]) => (!vals || vals.length === 0 ? dir : `${dir} ${vals.join(" ")}`))
    .join("; ");
}

export async function verifyTurnstile(
  token?: string,
  secretKey?: string,
  remoteIp?: string,
  options: { failOpen?: boolean; endpoint?: string } = {},
): Promise<boolean> {
  const failOpen = options.failOpen ?? true;
  if (!secretKey) return failOpen;
  if (!token) return false;

  try {
    const res = await fetch(
      options.endpoint || "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: remoteIp,
        }),
      },
    );

    if (!res.ok) return failOpen;
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return failOpen;
  }
}

import { config } from "virtual:rimelight-security";
import type { Context } from "hono";
import type { SecurityConfig } from "./types";

export const activeConfig = {
  ...config,
};

export function buildCspHeader(options: SecurityConfig = {}, nonce?: string): string {
  const domain = options.domain
    ?.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/)[0];
  const allowed = options.allowedDomains || [];
  const turnstile = Boolean(options.turnstile);

  const imgSources = Array.from(
    new Set([
      "'self'",
      "data:",
      ...(domain ? [`https://cdn.${domain}`] : []),
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
      ...(options.scriptResources || []),
    ]),
  );
  const styleSources = Array.from(new Set(["'self'", ...(options.styleResources || [])]));

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

export function isTurnstileEnabled(env?: any): boolean {
  const siteKey =
    env?.TURNSTILE_SITE_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SITE_KEY"] : undefined);
  const secretKey =
    env?.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SECRET_KEY"] : undefined);
  return Boolean(siteKey && secretKey);
}

export function getTurnstileSecretKey(optionsOrEnv?: any): string | undefined {
  if (typeof optionsOrEnv === "object" && optionsOrEnv !== null) {
    if (optionsOrEnv.secretKey) return optionsOrEnv.secretKey;
    if (optionsOrEnv.env?.TURNSTILE_SECRET_KEY) return optionsOrEnv.env.TURNSTILE_SECRET_KEY;
    if (optionsOrEnv.TURNSTILE_SECRET_KEY) return optionsOrEnv.TURNSTILE_SECRET_KEY;
  }
  return typeof process !== "undefined" ? process.env?.["TURNSTILE_SECRET_KEY"] : undefined;
}

export function getTurnstileSiteKey(env?: any): string | undefined {
  return (
    env?.TURNSTILE_SITE_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SITE_KEY"] : undefined)
  );
}

export async function verifyTurnstile(
  tokenOrOptions: any,
  legacyEnv?: any,
  legacyRemoteIp?: string,
): Promise<{ success: boolean; error?: string; errorCodes?: string[] }> {
  const opts =
    typeof tokenOrOptions === "object" && tokenOrOptions !== null
      ? tokenOrOptions
      : { token: tokenOrOptions, env: legacyEnv, remoteIp: legacyRemoteIp };

  const failOpen = opts.failOpen ?? true;
  const secretKey = getTurnstileSecretKey(opts);

  if (!secretKey) {
    if (failOpen) {
      console.log("[Turnstile] Keys missing or not configured. Failing open.");
      return { success: true };
    }
    return { success: false, error: "Turnstile secret key is not configured." };
  }

  if (!opts.token) {
    return { success: false, error: "Security check token is missing." };
  }

  try {
    const res = await fetch(
      opts.endpoint || "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, response: opts.token, remoteip: opts.remoteIp }),
      },
    );

    if (!res.ok) {
      if (failOpen) {
        console.error(`[Turnstile] API returned status ${res.status}. Failing open.`);
        return { success: true };
      }
      return { success: false, error: `Cloudflare Turnstile API returned status ${res.status}` };
    }

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (data.success) return { success: true };

    const codes = data["error-codes"] || [];
    const error = codes.includes("timeout-or-duplicate")
      ? "Verification token expired or already used. Please refresh the security check."
      : codes.includes("invalid-input-response")
        ? "Invalid verification response. Please try again."
        : "Bot check verification failed.";

    return { success: false, error, errorCodes: codes };
  } catch (err: any) {
    console.error(`[Turnstile Exception] ${err?.message || "Unknown error"}`);
    return failOpen
      ? { success: true }
      : {
          success: false,
          error: err?.message || "Turnstile verification encountered an exception.",
        };
  }
}

export { getConstructionFallbackHtml } from "./fallback";

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest";

const getConstructionPassphrase = (c: Context): string | undefined => {
  const raw = activeConfig.construction;
  const opts = typeof raw === "object" && raw !== null ? raw : undefined;
  const key = opts?.passphraseEnvKey ?? "CONSTRUCTION_PASSPHRASE";
  return (
    opts?.passphrase ??
    c.env?.[key] ??
    (typeof process !== "undefined" ? process.env?.[key] : undefined) ??
    (import.meta as any)?.env?.[key]
  );
};

const getGuestCookie = (c: Context): string | undefined => {
  const raw = activeConfig.construction;
  const name = (typeof raw === "object" && raw?.cookieName) || CONSTRUCTION_GUEST_COOKIE;
  const match = (c.req.header("cookie") || "").match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : undefined;
};

const hashToken = async (payload: string, secret: string): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const isConstructionGuest = async (c: Context): Promise<boolean> => {
  const token = getGuestCookie(c);
  const secret = getConstructionPassphrase(c);
  if (!token || !secret) return false;

  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return false;

  try {
    const payloadStr = atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"));
    const expectedSig = await hashToken(payloadStr, secret);
    return sig === expectedSig && JSON.parse(payloadStr).expiresAt > Date.now();
  } catch {
    return false;
  }
};

export const signInConstructionGuest = async (
  c: Context,
  passphrase: string,
  rememberMe = true,
): Promise<boolean> => {
  const expected = getConstructionPassphrase(c);
  if (!expected || !passphrase || passphrase !== expected) return false;

  const raw = activeConfig.construction;
  const opts = typeof raw === "object" && raw !== null ? raw : undefined;
  const cookieName = opts?.cookieName ?? CONSTRUCTION_GUEST_COOKIE;
  const maxAge = opts?.cookieMaxAge ?? 60 * 60 * 24 * 7;
  const payload = JSON.stringify({ expiresAt: Date.now() + maxAge * 1000 });
  const sig = await hashToken(payload, expected);
  const b64Payload = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const parts = [
    `${cookieName}=${b64Payload}.${sig}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  if (rememberMe) parts.push(`Max-Age=${maxAge}`);
  c.header("Set-Cookie", parts.join("; "), { append: true });
  return true;
};

export async function submitConstructionPassphrase(options: {
  passphrase: string;
  rememberMe?: boolean;
  endpoint?: string;
  redirect?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(options.endpoint ?? "/api/construction-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passphrase: options.passphrase,
        rememberMe: options.rememberMe ?? true,
        redirect: options.redirect ?? "/",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (!res.ok || !data.success)
      return { success: false, error: data.error || "Invalid passphrase" };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." };
  }
}

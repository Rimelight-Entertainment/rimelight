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

export async function verifyTurnstile(
  token?: string,
  secretKey = typeof process !== "undefined" ? process.env?.["TURNSTILE_SECRET_KEY"] : undefined,
  remoteIp?: string,
): Promise<boolean> {
  // Fail open in dev/preview if keys are not configured
  if (!secretKey) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    if (!res.ok) return true;
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return true; // Fail open on network errors
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

export const isConstructionGuest = async (c: Context): Promise<boolean> => {
  const token = getGuestCookie(c);
  const secret = getConstructionPassphrase(c);
  return Boolean(token && secret && token === secret);
};

export const signInConstructionGuest = (
  c: Context,
  passphrase: string,
  rememberMe = true,
): boolean => {
  const expected = getConstructionPassphrase(c);
  if (!expected || passphrase !== expected) return false;

  const raw = activeConfig.construction;
  const cookieName = (typeof raw === "object" && raw?.cookieName) || CONSTRUCTION_GUEST_COOKIE;
  const parts = [`${cookieName}=${expected}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (rememberMe) parts.push("Max-Age=604800");
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
    return res.ok && data.success
      ? { success: true }
      : { success: false, error: data.error || "Invalid passphrase" };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." };
  }
}

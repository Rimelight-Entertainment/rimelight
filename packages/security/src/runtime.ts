import { config } from "virtual:rimelight-security";
import type { Context } from "hono";
import type { SecurityConfig } from "./types";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

let activeConfig: SecurityConfig = isRecord(config) ? { ...config } : {};

export const getSecurityConfig = (): SecurityConfig => activeConfig;
export const setSecurityConfig = (next?: SecurityConfig): void => {
  activeConfig = next ? { ...next } : isRecord(config) ? { ...config } : {};
};
import { normalizeDomain, resolveSecurityDomain } from "./domain";
export { normalizeDomain, resolveSecurityDomain };

export function buildCspHeader(options: SecurityConfig = {}, nonce?: string): string {
  const domain = normalizeDomain(options.domain || "");
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

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest";

const encodeB64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const decodeB64Url = (str: string): Uint8Array => {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(str.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

const timingSafeEqual = async (a: string, b: string): Promise<boolean> => {
  const enc = new TextEncoder();
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const [aBuf, bBuf] = [new Uint8Array(aHash), new Uint8Array(bHash)];
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) diff |= aBuf[i]! ^ bBuf[i]!;
  return diff === 0;
};

const signHmac = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return { key, signature };
};

export const isConstructionGuest = async (c: Context): Promise<boolean> => {
  const rawConstruction = getSecurityConfig().construction;
  const opts =
    typeof rawConstruction === "object" && rawConstruction !== null ? rawConstruction : undefined;
  const cookieName = opts?.cookieName ?? CONSTRUCTION_GUEST_COOKIE;

  const cookieHeader = c.req.header("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]!) : undefined;

  const envKey = opts?.passphraseEnvKey ?? "CONSTRUCTION_PASSPHRASE";
  const passphrase =
    opts?.passphrase ??
    c.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey];

  if (!token || !passphrase) return false;

  try {
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature) return false;
    const payload = new TextDecoder().decode(decodeB64Url(encodedPayload));
    const { key } = await signHmac(payload, passphrase);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeB64Url(encodedSignature) as unknown as BufferSource,
      new TextEncoder().encode(payload),
    );
    return valid && JSON.parse(payload).expiresAt > Date.now();
  } catch {
    return false;
  }
};

export const signInConstructionGuest = async (
  c: Context,
  passphrase: string,
  rememberMe = true,
): Promise<boolean> => {
  const rawConstruction = getSecurityConfig().construction;
  const opts =
    typeof rawConstruction === "object" && rawConstruction !== null ? rawConstruction : undefined;
  const envKey = opts?.passphraseEnvKey ?? "CONSTRUCTION_PASSPHRASE";
  const expected =
    opts?.passphrase ??
    c.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey];

  if (!expected || !passphrase || !(await timingSafeEqual(passphrase, expected))) return false;

  const cookieName = opts?.cookieName ?? CONSTRUCTION_GUEST_COOKIE;
  const maxAge = opts?.cookieMaxAge ?? 60 * 60 * 24 * 7;
  const payload = JSON.stringify({ expiresAt: Date.now() + maxAge * 1000 });
  const { signature } = await signHmac(payload, expected);
  const cookieValue = `${encodeB64Url(new TextEncoder().encode(payload))}.${encodeB64Url(new Uint8Array(signature))}`;

  const parts = [`${cookieName}=${cookieValue}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (rememberMe) parts.push(`Max-Age=${maxAge}`);
  const headerStr = parts.join("; ");

  c.header("Set-Cookie", headerStr, { append: true });

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

export function getConstructionFallbackHtml(
  options: {
    siteName?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    passphraseLabel?: string | undefined;
    passphrasePlaceholder?: string | undefined;
    rememberMeLabel?: string | undefined;
    signInButtonLabel?: string | undefined;
    error?: string | undefined;
    redirect?: string | undefined;
    endpoint?: string | undefined;
  } = {},
): string {
  const {
    siteName = "Rimelight",
    title = "Under Construction",
    description = "This site is currently undergoing scheduled maintenance. Please enter the access passphrase to preview.",
    passphraseLabel = "Passphrase",
    passphrasePlaceholder = "Enter passphrase...",
    rememberMeLabel = "Remember me",
    signInButtonLabel = "Unlock Site",
    error,
    redirect = "/",
    endpoint = "/api/construction-guest",
  } = options;

  const escapedRedirect = redirect.replace(/"/g, "&quot;");
  const escapedEndpoint = endpoint.replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - ${siteName}</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a0a;
      color: #ededed;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background-color: #141414;
      border: 1px solid #262626;
      border-radius: 0.75rem;
      padding: 2rem;
      max-width: 26rem;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5);
    }
    .header { text-align: center; margin-bottom: 1.5rem; }
    .title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .description { font-size: 0.875rem; color: #a3a3a3; line-height: 1.5; }
    .alert {
      background-color: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #fca5a5;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; text-align: left; }
    .label { font-size: 0.8125rem; font-weight: 500; color: #d4d4d4; }
    .input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background-color: #0a0a0a;
      border: 1px solid #333333;
      border-radius: 0.5rem;
      color: #ffffff;
      font-size: 0.875rem;
      outline: none;
    }
    .input:focus { border-color: #3b82f6; }
    .checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #a3a3a3; cursor: pointer; }
    .checkbox { width: 1rem; height: 1rem; accent-color: #3b82f6; cursor: pointer; }
    .button {
      margin-top: 0.5rem;
      width: 100%;
      padding: 0.625rem 1rem;
      background-color: #ffffff;
      color: #0a0a0a;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }
    .button:hover { background-color: #e5e5e5; }
    .footer { margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #525252; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">${title}</h1>
      <p class="description">${description}</p>
    </div>
    ${error ? `<div class="alert" role="alert">Invalid credentials. Please try again.</div>` : ""}
    <form class="form" method="POST" action="${escapedEndpoint}">
      <input type="hidden" name="redirect" value="${escapedRedirect}" />
      <div class="field">
        <label class="label" for="passphrase">${passphraseLabel}</label>
        <input id="passphrase" class="input" type="password" name="passphrase" placeholder="${passphrasePlaceholder}" required autofocus autocomplete="current-password" />
      </div>
      <label class="checkbox-row">
        <input class="checkbox" type="checkbox" name="rememberMe" value="true" checked />
        <span>${rememberMeLabel}</span>
      </label>
      <button class="button" type="submit">${signInButtonLabel}</button>
    </form>
    <div class="footer">
      <span>&copy; ${new Date().getFullYear()} ${siteName}</span>
    </div>
  </div>
</body>
</html>`;
}

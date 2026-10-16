/**
 * Web Crypto JWT & JWKS engine for @rimelight/auth powered by hono/jwt.
 */
import { decode, sign, verify, verifyWithJwks } from "hono/jwt";

// --- Base64URL Utilities ---

export function base64UrlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      binary += String.fromCharCode(b);
    }
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function base64UrlDecodeToString(str: string): string {
  return new TextDecoder().decode(base64UrlDecode(str));
}

// --- Duration Parser ---

export function parseDuration(duration: string | number): number {
  if (typeof duration === "number") return Math.floor(duration);
  if (duration === "" || duration === undefined || duration === null) {
    return 7 * 24 * 3600; // default 7 days
  }

  const str = String(duration).trim();
  if (str === "0") return 0;

  const match = str.match(/^(\d+)\s*(s|m|h|d|w|y)?$/i);
  if (!match) {
    const num = Number(str);
    return isNaN(num) ? 7 * 24 * 3600 : Math.floor(num);
  }

  const value = parseInt(match[1] || "0", 10);
  const unit = (match[2] || "s").toLowerCase();

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    case "w":
      return value * 604800;
    case "y":
      return value * 31536000;
    default:
      return value;
  }
}

// --- JWT Header and Payload Inspection ---

export function decodeJwtHeader(token: string): Record<string, any> {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT: token must be a non-empty string");
  }
  try {
    return decode(token).header as Record<string, any>;
  } catch {
    throw new Error("Invalid JWT structure");
  }
}

export function decodeJwt<T = Record<string, any>>(token: string): T {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT: token must be a non-empty string");
  }
  try {
    return decode(token).payload as T;
  } catch {
    throw new Error("Invalid JWT structure");
  }
}

// --- HS256 Session Tokens ---

export async function createSessionToken(
  session: Record<string, any>,
  secret: string,
  expiresIn: string | number = "7d",
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expSeconds = parseDuration(expiresIn);
  const payload = {
    ...session,
    iat: now,
    exp: now + expSeconds,
  };
  return await sign(payload, secret, "HS256");
}

export async function verifySessionToken<T = Record<string, any>>(
  token: string,
  secret: string,
  options: { clockTolerance?: number } = {},
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const payload = (await verify(token, secret, { alg: "HS256", exp: false, nbf: false })) as any;
    const now = Math.floor(Date.now() / 1000);
    const clockTolerance = options.clockTolerance ?? 5;

    if (payload["exp"] !== undefined && typeof payload["exp"] === "number") {
      if (now > payload["exp"] + clockTolerance) {
        return null; // Expired
      }
    }

    if (payload["nbf"] !== undefined && typeof payload["nbf"] === "number") {
      if (now < payload["nbf"] - clockTolerance) {
        return null; // Not yet valid
      }
    }

    return payload as T;
  } catch {
    return null;
  }
}

// --- RS256 / JWKS Remote Key Verification ---

const jwksCache = new Map<string, { keys: any[]; fetchedAt: number }>();
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function clearJwksCache(): void {
  jwksCache.clear();
}

export interface VerifyJwtRs256Options {
  issuer?: string | undefined;
  audience?: string | string[] | undefined;
  clockTolerance?: number | undefined;
}

export async function verifyJwtRs256<T = Record<string, any>>(
  token: string,
  jwksUrl: string,
  options: VerifyJwtRs256Options = {},
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;

    let cached = jwksCache.get(jwksUrl);
    const now = Date.now();
    let keys = cached && now - cached.fetchedAt < JWKS_CACHE_TTL_MS ? cached.keys : undefined;

    if (!keys) {
      const res = await fetch(jwksUrl);
      if (!res.ok) return null;
      const data = (await res.json()) as { keys?: any[] };
      keys = data.keys || [];
      jwksCache.set(jwksUrl, { keys, fetchedAt: now });
    }

    const verificationOpts: any = {
      exp: false,
      nbf: false,
    };

    if (options.issuer) {
      const cleanIss = options.issuer.replace(/\/$/, "");
      verificationOpts.iss = new RegExp(`^${cleanIss}/?$`);
    }

    if (options.audience && typeof options.audience === "string") {
      verificationOpts.aud = options.audience;
    }

    let payload: any;
    try {
      payload = await verifyWithJwks(token, {
        keys,
        allowedAlgorithms: ["RS256"],
        verification: verificationOpts,
      });
    } catch {
      // Retry once by refreshing JWKS cache in case key was rotated
      const res = await fetch(jwksUrl);
      if (!res.ok) return null;
      const data = (await res.json()) as { keys?: any[] };
      keys = data.keys || [];
      jwksCache.set(jwksUrl, { keys, fetchedAt: Date.now() });

      payload = await verifyWithJwks(token, {
        keys,
        allowedAlgorithms: ["RS256"],
        verification: verificationOpts,
      });
    }

    // Apply remote IdP clock tolerance check (default 60s)
    const nowSec = Math.floor(Date.now() / 1000);
    const clockTolerance = options.clockTolerance ?? 60;

    if (payload["exp"] !== undefined && typeof payload["exp"] === "number") {
      if (nowSec > payload["exp"] + clockTolerance) {
        return null;
      }
    }

    if (payload["nbf"] !== undefined && typeof payload["nbf"] === "number") {
      if (nowSec < payload["nbf"] - clockTolerance) {
        return null;
      }
    }

    // Additional check if audience was an array of acceptable audiences
    if (Array.isArray(options.audience)) {
      const payloadAud = payload["aud"];
      const payloadAuds = Array.isArray(payloadAud)
        ? payloadAud
        : typeof payloadAud === "string"
          ? [payloadAud]
          : [];
      const hasAudience = options.audience.some((aud) => payloadAuds.includes(aud));
      if (!hasAudience) return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Zero-dependency Web Crypto JWT & JWKS engine for @rimelight/auth. Implements RFC 7519 (JWT), RFC
 * 7515 (JWS), RFC 7517 (JWK), and RFC 7518 (JWA). Works isomorphically across Cloudflare Workers,
 * Node.js (>=22), Bun, and Deno.
 */

// --- Base64URL Utilities (Standard Web API) ---

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
  const parts = token.split(".");
  const headerPart = parts[0];
  if (parts.length < 2 || !headerPart) {
    throw new Error("Invalid JWT structure");
  }
  return JSON.parse(base64UrlDecodeToString(headerPart));
}

export function decodeJwt<T = Record<string, any>>(token: string): T {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT: token must be a non-empty string");
  }
  const parts = token.split(".");
  const payloadPart = parts[1];
  if (parts.length < 2 || !payloadPart) {
    throw new Error("Invalid JWT structure");
  }
  return JSON.parse(base64UrlDecodeToString(payloadPart)) as T;
}

// --- HMAC-SHA256 (HS256) Session Tokens ---

export async function createSessionToken(
  session: Record<string, any>,
  secret: string,
  expiresIn: string | number = "7d"
): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const expSeconds = parseDuration(expiresIn);

  const payload = {
    ...session,
    iat: now,
    exp: now + expSeconds
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));

  return `${data}.${signatureB64}`;
}

export async function verifySessionToken<T = Record<string, any>>(
  token: string,
  secret: string,
  options: { clockTolerance?: number } = {}
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signatureB64 = parts[2];
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const header = JSON.parse(base64UrlDecodeToString(headerB64));
    if (header["alg"] !== "HS256") return null;

    const enc = new TextEncoder();
    const data = `${headerB64}.${payloadB64}`;
    const signatureBytes = base64UrlDecode(signatureB64);

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(data)
    );
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecodeToString(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    // First-party session tokens use tighter 5s tolerance against replay/expiration window
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

// --- RS256 / JWKS Remote Key Verification (Auth0 & Cloudflare Access) ---

interface JwkKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: any;
}

interface JwksCacheEntry {
  keys: JwkKey[];
  fetchedAt: number;
}

const jwksCache = new Map<string, JwksCacheEntry>();
const cryptoKeyCache = new Map<string, CryptoKey>();
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function clearJwksCache(): void {
  jwksCache.clear();
  cryptoKeyCache.clear();
}

async function fetchJwks(url: string): Promise<JwkKey[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS from ${url} (status ${res.status})`);
  }
  const data = (await res.json()) as { keys?: JwkKey[] };
  return data.keys || [];
}

async function getJwksKeys(url: string, forceRefresh = false): Promise<JwkKey[]> {
  const now = Date.now();
  const cached = jwksCache.get(url);

  if (!forceRefresh && cached && now - cached.fetchedAt < JWKS_CACHE_TTL_MS) {
    return cached.keys;
  }

  const keys = await fetchJwks(url);
  jwksCache.set(url, { keys, fetchedAt: now });
  return keys;
}

export interface VerifyJwtRs256Options {
  issuer?: string | undefined;
  audience?: string | string[] | undefined;
  clockTolerance?: number | undefined;
}

export async function verifyJwtRs256<T = Record<string, any>>(
  token: string,
  jwksUrl: string,
  options: VerifyJwtRs256Options = {}
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signatureB64 = parts[2];
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const header = JSON.parse(base64UrlDecodeToString(headerB64));
    if (header["alg"] !== "RS256") return null;

    const kid = header["kid"] as string | undefined;

    // 1. Get JWKS keys (with cache & auto-refresh on unknown kid)
    let keys = await getJwksKeys(jwksUrl, false);
    let matchingJwk = keys.find((k) => (kid ? k.kid === kid : true) && k.kty === "RSA");

    if (!matchingJwk && kid) {
      // Retry once with a fresh fetch in case key was rotated
      keys = await getJwksKeys(jwksUrl, true);
      matchingJwk = keys.find((k) => k.kid === kid && k.kty === "RSA");
    }

    if (!matchingJwk) return null;

    // 2. Import or retrieve CryptoKey
    const cacheKey = `${jwksUrl}#${matchingJwk.kid || "default"}`;
    let cryptoKey = cryptoKeyCache.get(cacheKey);

    if (!cryptoKey) {
      cryptoKey = await crypto.subtle.importKey(
        "jwk",
        matchingJwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      cryptoKeyCache.set(cacheKey, cryptoKey);
    }

    // 3. Cryptographic Signature Verification
    const enc = new TextEncoder();
    const data = `${headerB64}.${payloadB64}`;
    const signatureBytes = base64UrlDecode(signatureB64);

    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureBytes as unknown as BufferSource,
      enc.encode(data)
    );
    if (!isValid) return null;

    // 4. Claims Validation (exp, nbf, iss, aud)
    const payload = JSON.parse(base64UrlDecodeToString(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    // Remote IdP tokens (Auth0, Cloudflare Access) use 60s tolerance for cross-provider network/clock drift
    const clockTolerance = options.clockTolerance ?? 60;

    if (payload["exp"] !== undefined && typeof payload["exp"] === "number") {
      if (now > payload["exp"] + clockTolerance) {
        return null; // Token expired
      }
    }

    if (payload["nbf"] !== undefined && typeof payload["nbf"] === "number") {
      if (now < payload["nbf"] - clockTolerance) {
        return null; // Token not active yet
      }
    }

    if (options.issuer) {
      const payloadIss = payload["iss"];
      const expectedIss = options.issuer.replace(/\/$/, "");
      const actualIss = typeof payloadIss === "string" ? payloadIss.replace(/\/$/, "") : "";
      if (actualIss !== expectedIss) {
        return null; // Issuer mismatch
      }
    }

    if (options.audience) {
      const expectedAuds = Array.isArray(options.audience) ? options.audience : [options.audience];
      const payloadAud = payload["aud"];
      const payloadAuds = Array.isArray(payloadAud)
        ? payloadAud
        : typeof payloadAud === "string"
          ? [payloadAud]
          : [];
      const hasAudience = expectedAuds.some((aud) => payloadAuds.includes(aud));
      if (!hasAudience) {
        return null; // Audience mismatch
      }
    }

    return payload as T;
  } catch {
    return null;
  }
}

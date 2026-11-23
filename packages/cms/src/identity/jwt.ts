/**
 * JWT verification for CMS identity: RS256 against a remote JWKS (Auth0, Cloudflare Access) and
 * HS256 for the website's signed session cookie. Built on hono/jwt.
 */
import { decode, verify, verifyWithJwks } from "hono/jwt";

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

/** Verifies an HS256 session token and its expiry. Returns `null` when invalid or expired. */
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
    if (typeof payload["exp"] === "number" && now > payload["exp"] + clockTolerance) return null;
    if (typeof payload["nbf"] === "number" && now < payload["nbf"] - clockTolerance) return null;
    return payload as T;
  } catch {
    return null;
  }
}

const jwksCache = new Map<string, { keys: any[]; fetchedAt: number }>();
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;

export function clearJwksCache(): void {
  jwksCache.clear();
}

export interface VerifyJwtRs256Options {
  issuer?: string | undefined;
  audience?: string | string[] | undefined;
  clockTolerance?: number | undefined;
}

/** Verifies an RS256 JWT against a JWKS endpoint. Returns `null` when the token is not valid. */
export async function verifyJwtRs256<T = Record<string, any>>(
  token: string,
  jwksUrl: string,
  options: VerifyJwtRs256Options = {},
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const cached = jwksCache.get(jwksUrl);
    let keys =
      cached && Date.now() - cached.fetchedAt < JWKS_CACHE_TTL_MS ? cached.keys : undefined;

    if (!keys) {
      const res = await fetch(jwksUrl);
      if (!res.ok) return null;
      const data = (await res.json()) as { keys?: any[] };
      keys = data.keys || [];
      jwksCache.set(jwksUrl, { keys, fetchedAt: Date.now() });
    }

    const verificationOpts: any = { exp: false, nbf: false };
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
      // Retry once with a fresh JWKS in case the signing key was rotated.
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

    const nowSec = Math.floor(Date.now() / 1000);
    const clockTolerance = options.clockTolerance ?? 60;
    if (typeof payload["exp"] === "number" && nowSec > payload["exp"] + clockTolerance) return null;
    if (typeof payload["nbf"] === "number" && nowSec < payload["nbf"] - clockTolerance) return null;

    if (Array.isArray(options.audience)) {
      const payloadAud = payload["aud"];
      const payloadAuds = Array.isArray(payloadAud)
        ? payloadAud
        : typeof payloadAud === "string"
          ? [payloadAud]
          : [];
      if (!options.audience.some((aud) => payloadAuds.includes(aud))) return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Verifies an Auth0 RS256 access or ID token against the tenant's JWKS. Returns the claims, or
 * `null` when the token is invalid.
 */
export async function verifyAuth0Jwt(
  token: string,
  options: { domain: string; audience?: string | undefined; issuer?: string | undefined },
): Promise<Record<string, any> | null> {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return verifyJwtRs256(token, `https://${cleanDomain}/.well-known/jwks.json`, {
    issuer: options.issuer || `https://${cleanDomain}/`,
    audience: options.audience,
  });
}

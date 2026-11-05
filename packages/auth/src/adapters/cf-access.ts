import type { AccessIdentity, AuthAdapter } from "../types";
import { verifyJwtRs256 } from "../jwt";
import { getEnv } from "../env";

/** Header Cloudflare Access sets on requests it has authenticated. */
export const CF_ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
/** Cookie Cloudflare Access sets with the same token. Browsers send it; API clients usually don't. */
export const CF_ACCESS_COOKIE = "CF_Authorization";
const CLOCK_TOLERANCE_SECONDS = 60;

export interface CfAccessAdapterOptions {
  /** Access team domain, e.g. `acme.cloudflareaccess.com`. A scheme or trailing slash is tolerated. */
  teamDomain: string;
  /** Application Audience (AUD) tag of the Access application. Tokens minted for other apps are rejected. */
  audience: string;
}

interface CfAccessJwtPayload {
  sub?: string;
  email?: string;
  name?: string;
}

function normaliseTeamDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim() || null;
  }
  return null;
}

/** The Access token from the assertion header, else the `CF_Authorization` cookie. */
export function extractCfAccessToken(request: Request): string | null {
  return (
    request.headers.get(CF_ACCESS_JWT_HEADER) ||
    readCookie(request.headers.get("cookie"), CF_ACCESS_COOKIE)
  );
}

/** Group names Access attaches to the session. Throws when Access cannot be reached. */
async function fetchGroupNames(issuer: string, token: string): Promise<string[]> {
  const res = await fetch(`${issuer}/cdn-cgi/access/get-identity`, {
    headers: { Cookie: `${CF_ACCESS_COOKIE}=${token}` },
  });
  if (!res.ok) throw new Error(`cf-access get-identity responded ${res.status}`);
  const body = (await res.json()) as { groups?: Array<{ name?: unknown }> };
  return (body.groups ?? []).flatMap((g) => (typeof g.name === "string" ? [g.name] : []));
}

/**
 * Verifies the Cloudflare Access JWT (RS256, team JWKS, issuer and audience) and returns the
 * identity it asserts. Only the signed token is trusted: no email header, no unsigned claims.
 * Returns `null` for a missing or invalid token; throws when the group lookup fails.
 */
export function cfAccessIdentifier(
  options: CfAccessAdapterOptions,
): (request: Request) => Promise<AccessIdentity | null> {
  const teamDomain = normaliseTeamDomain(options.teamDomain);
  if (!teamDomain) throw new Error("cf-access: teamDomain is required");
  if (!options.audience) throw new Error("cf-access: audience is required");
  const issuer = `https://${teamDomain}`;
  const certsUrl = `${issuer}/cdn-cgi/access/certs`;

  return async (request) => {
    const token = extractCfAccessToken(request);
    if (!token) return null;
    const payload = await verifyJwtRs256<CfAccessJwtPayload>(token, certsUrl, {
      issuer,
      audience: options.audience,
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
    });
    if (!payload?.sub || !payload.email) return null;
    const groups = await fetchGroupNames(issuer, token);
    return {
      subject: payload.sub,
      email: payload.email,
      // Access only admits identities its IdP has authenticated, so the email is verified.
      emailVerified: true,
      name: payload.name,
      groups,
    };
  };
}

export function cfAccessAuth(options: CfAccessAdapterOptions): AuthAdapter {
  const identify = cfAccessIdentifier(options);
  return {
    name: "cf-access",
    identify,
    async getSession(request) {
      try {
        const identity = await identify(request);
        if (!identity) return null;
        return {
          userId: identity.subject,
          email: identity.email,
          name: identity.name ?? identity.email.split("@")[0]!,
          roles: [],
          permissions: [],
          metadata: { groups: identity.groups },
        };
      } catch (err) {
        console.error("[auth] cf-access session check failed:", err);
        return null;
      }
    },
    handleUnauthorized() {
      return new Response("Unauthorized", { status: 401 });
    },
  };
}

export function createCfAccessFromEnv(
  overrides: Partial<CfAccessAdapterOptions> = {},
): AuthAdapter {
  return cfAccessAuth({
    teamDomain: overrides.teamDomain || getEnv("CF_ACCESS_TEAM_DOMAIN"),
    audience: overrides.audience || getEnv("CF_ACCESS_AUD"),
  });
}

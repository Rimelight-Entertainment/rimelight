/**
 * The website's signed session cookie (HS256, `AUTH0_SECRET`), and resolving the current user from
 * a request. A Bearer Auth0 token takes precedence over the cookie.
 */
import { sign } from "hono/jwt";
import { verifyAuth0Jwt, verifySessionToken } from "@rimelight/cms/identity";
import { mapClaimsToSession, type Auth0Config, type UserSession } from "./auth0";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function createSessionToken(session: UserSession, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign({ ...session, iat: now, exp: now + SESSION_TTL_SECONDS }, secret, "HS256");
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx !== -1 && part.slice(0, idx).trim() === name) {
      return part.slice(idx + 1).trim() || null;
    }
  }
  return null;
}

/** The signed-in user for this request, or `null`. */
export async function getSession(
  request: Request,
  config: Auth0Config,
): Promise<UserSession | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAuth0Jwt(authHeader.slice(7).trim(), {
      domain: config.domain,
      audience: config.audience || undefined,
    });
    return payload ? mapClaimsToSession(payload, config) : null;
  }

  const token = readCookie(request.headers.get("cookie"), config.sessionCookieName);
  if (!token) return null;
  if (config.sessionSecret) {
    return verifySessionToken<UserSession>(token, config.sessionSecret);
  }
  const payload = await verifyAuth0Jwt(token, {
    domain: config.domain,
    audience: config.audience || undefined,
  });
  return payload ? mapClaimsToSession(payload, config) : null;
}

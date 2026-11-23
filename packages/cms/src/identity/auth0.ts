import { parse } from "hono/utils/cookie";
import { verifyAuth0Jwt, verifySessionToken } from "./jwt";
import { resolveLazy, type AccessIdentity, type IdentifyFn, type Lazy } from "./types";

export interface Auth0IdentityConfig {
  domain: string;
  /** API audience the access token must be issued for. Tokens for other audiences are rejected. */
  audience?: string | undefined;
  /** Claim holding the caller's roles. Default `https://rimelight.com/roles`. */
  rolesClaim?: string | undefined;
  /** Website session cookie name. Default `rimelight_session`. */
  sessionCookieName?: string | undefined;
  /**
   * HS256 secret that signs the website session cookie. When set, the cookie is verified against
   * it; when unset, the cookie is treated as a raw Auth0 token and verified against JWKS.
   */
  sessionSecret?: string | undefined;
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  try {
    return parse(cookieHeader, name)[name] ?? null;
  } catch {
    return null;
  }
}

function identityFromPayload(
  payload: Record<string, any>,
  rolesClaim: string,
): AccessIdentity | null {
  if (!payload["sub"] || !payload["email"]) return null;
  const roles = payload[rolesClaim] ?? payload["roles"];
  return {
    subject: String(payload["sub"]),
    email: String(payload["email"]),
    emailVerified: payload["email_verified"] === true,
    name: typeof payload["name"] === "string" ? payload["name"] : undefined,
    groups: Array.isArray(roles) ? roles.filter((r): r is string => typeof r === "string") : [],
  };
}

function identityFromSession(session: Record<string, any>): AccessIdentity | null {
  if (!session["email"]) return null;
  return {
    subject: String(session["userId"]),
    email: String(session["email"]),
    emailVerified: session["metadata"]?.["email_verified"] === true,
    name: typeof session["name"] === "string" ? session["name"] : undefined,
    groups: Array.isArray(session["roles"]) ? session["roles"] : [],
  };
}

/**
 * Auth0 identity from the request. A Bearer token takes precedence over the session cookie. An
 * invalid Bearer token yields `null` and does not fall through to the cookie.
 */
export function auth0Identifier(config: Lazy<Auth0IdentityConfig>): IdentifyFn {
  return async (request) => {
    const {
      domain,
      audience,
      rolesClaim = "https://rimelight.com/roles",
      sessionCookieName = "rimelight_session",
      sessionSecret,
    } = resolveLazy(config);

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const payload = await verifyAuth0Jwt(authHeader.slice(7).trim(), { domain, audience });
      return payload ? identityFromPayload(payload, rolesClaim) : null;
    }

    const token = parseCookie(request.headers.get("cookie"), sessionCookieName);
    if (!token) return null;
    if (sessionSecret) {
      const session = await verifySessionToken(token, sessionSecret);
      return session ? identityFromSession(session) : null;
    }
    const payload = await verifyAuth0Jwt(token, { domain, audience });
    return payload ? identityFromPayload(payload, rolesClaim) : null;
  };
}

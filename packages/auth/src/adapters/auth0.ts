import type { AuthAdapter, UserSessionContext, UserType } from "../types";
import { parse } from "hono/utils/cookie";
import {
  decodeJwt,
  createSessionToken as createSessionTokenJwt,
  verifySessionToken as verifySessionTokenJwt,
  verifyJwtRs256,
} from "../jwt";

export { decodeJwt };

export async function createSessionToken(
  session: UserSessionContext,
  secret: string,
  expiresIn: string | number = "7d",
): Promise<string> {
  return createSessionTokenJwt(session, secret, expiresIn);
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<UserSessionContext | null> {
  return verifySessionTokenJwt<UserSessionContext>(token, secret);
}

/**
 * Verifies an Auth0 RS256 JWT Access Token or ID Token against Auth0 JWKS endpoint
 */
export async function verifyAuth0Jwt(
  token: string,
  options: {
    domain: string;
    audience?: string | undefined;
    issuer?: string | undefined;
  },
): Promise<Record<string, any> | null> {
  try {
    const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const jwksUrl = `https://${cleanDomain}/.well-known/jwks.json`;
    const expectedIssuer = options.issuer || `https://${cleanDomain}/`;

    return await verifyJwtRs256(token, jwksUrl, {
      issuer: expectedIssuer,
      audience: options.audience,
    });
  } catch {
    return null;
  }
}

export interface Auth0AdapterOptions {
  domain: string;
  audience?: string | undefined;
  clientId?: string | undefined;
  clientSecret?: string | undefined;
  rolesClaim?: string | undefined;
  userTypeClaim?: string | undefined;
  permissionsClaim?: string | undefined;
  sessionCookieName?: string | undefined;
  sessionSecret?: string | undefined;
  loginUrl?: string | undefined;
  defaultRole?: string | undefined;
}

export interface Auth0AuthorizeUrlOptions {
  domain: string;
  clientId: string;
  redirectUri: string;
  audience?: string | undefined;
  scope?: string | undefined;
  state?: string | undefined;
  codeChallenge?: string | undefined;
  codeChallengeMethod?: "S256" | "plain" | undefined;
  prompt?: string | undefined;
  screenHint?: string | undefined;
}

export interface Auth0TokenResponse {
  access_token: string;
  id_token?: string | undefined;
  token_type: string;
  expires_in: number;
  refresh_token?: string | undefined;
  scope?: string | undefined;
}

export interface Auth0CodeExchangeOptions {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  code: string;
  redirectUri: string;
  codeVerifier?: string | undefined;
}

export interface Auth0PasswordLoginOptions {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  username: string;
  password: string;
  audience?: string | undefined;
  scope?: string | undefined;
  realm?: string | undefined;
}

export interface Auth0RefreshTokenOptions {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  refreshToken: string;
  scope?: string | undefined;
}

/**
 * Generates an Auth0 OAuth2 / OIDC authorization URL
 */
export function createAuth0AuthorizeUrl(options: Auth0AuthorizeUrlOptions): string {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = new URL(`https://${cleanDomain}/authorize`);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("scope", options.scope || "openid profile email");

  if (options.audience) {
    url.searchParams.set("audience", options.audience);
  }
  if (options.state) {
    url.searchParams.set("state", options.state);
  }
  if (options.codeChallenge) {
    url.searchParams.set("code_challenge", options.codeChallenge);
    url.searchParams.set("code_challenge_method", options.codeChallengeMethod || "S256");
  }
  if (options.prompt) {
    url.searchParams.set("prompt", options.prompt);
  }
  if (options.screenHint) {
    url.searchParams.set("screen_hint", options.screenHint);
  }

  return url.toString();
}

/**
 * Exchanges an authorization code for Auth0 tokens
 */
export async function exchangeAuth0Code(
  options: Auth0CodeExchangeOptions,
): Promise<Auth0TokenResponse> {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const tokenUrl = `https://${cleanDomain}/oauth/token`;

  const body: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: options.clientId,
    code: options.code,
    redirect_uri: options.redirectUri,
  };

  if (options.clientSecret) {
    body["client_secret"] = options.clientSecret;
  }
  if (options.codeVerifier) {
    body["code_verifier"] = options.codeVerifier;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Auth0 token exchange failed (${response.status}): ${errText}`);
  }

  return (await response.json()) as Auth0TokenResponse;
}

/**
 * Authenticates directly with Auth0 using Resource Owner Password Credentials (ROPC). Used by
 * headless clients (e.g., Unreal Engine 5) to authenticate without browser redirects.
 */
export async function loginWithAuth0Password(
  options: Auth0PasswordLoginOptions,
): Promise<Auth0TokenResponse> {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const tokenUrl = `https://${cleanDomain}/oauth/token`;

  const body: Record<string, string> = {
    grant_type: options.realm ? "http://auth0.com/oauth/grant-type/password-realm" : "password",
    client_id: options.clientId,
    username: options.username,
    password: options.password,
    scope: options.scope || "openid profile email offline_access",
  };

  if (options.realm) {
    body["realm"] = options.realm;
  }
  if (options.clientSecret) {
    body["client_secret"] = options.clientSecret;
  }
  if (options.audience) {
    body["audience"] = options.audience;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Auth0 password login failed (${response.status}): ${errText}`);
  }

  return (await response.json()) as Auth0TokenResponse;
}

/**
 * Exchanges a refresh token for a new Auth0 access token. Ensures uninterrupted play sessions in
 * native game clients.
 */
export async function refreshAuth0Token(
  options: Auth0RefreshTokenOptions,
): Promise<Auth0TokenResponse> {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const tokenUrl = `https://${cleanDomain}/oauth/token`;

  const body: Record<string, string> = {
    grant_type: "refresh_token",
    client_id: options.clientId,
    refresh_token: options.refreshToken,
  };

  if (options.clientSecret) {
    body["client_secret"] = options.clientSecret;
  }
  if (options.scope) {
    body["scope"] = options.scope;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Auth0 token refresh failed (${response.status}): ${errText}`);
  }

  return (await response.json()) as Auth0TokenResponse;
}

/**
 * Generates an Auth0 logout URL
 */
export function createAuth0LogoutUrl(options: {
  domain: string;
  clientId: string;
  returnTo: string;
}): string {
  const cleanDomain = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = new URL(`https://${cleanDomain}/v2/logout`);
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("returnTo", options.returnTo);
  return url.toString();
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  try {
    const parsed = parse(cookieHeader, name);
    return parsed[name] ?? null;
  } catch {
    return null;
  }
}

/**
 * Auth0 / OIDC Auth Adapter
 */
export function auth0Auth(options: Auth0AdapterOptions): AuthAdapter {
  const {
    domain,
    audience,
    rolesClaim = "https://rimelight.com/roles",
    userTypeClaim = "https://rimelight.com/user_type",
    permissionsClaim = "permissions",
    sessionCookieName = "rimelight_session",
    sessionSecret,
    loginUrl = "/api/auth/login",
    defaultRole = "user",
  } = options;

  return {
    name: "auth0",
    options,
    async getSession(req: Request): Promise<UserSessionContext | null> {
      if (!req) return null;

      const getHeader = (name: string): string | null => {
        try {
          if (req.headers && typeof req.headers.get === "function") {
            return req.headers.get(name);
          }
          const h = (req as any)?.headers;
          if (h && typeof h === "object") {
            return h[name] || h[name.toLowerCase()] || null;
          }
        } catch {
          // ignore header parse error
        }
        return null;
      };

      // 1. Check Bearer Token in Authorization header
      const authHeader = getHeader("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        const payload = await verifyAuth0Jwt(token, { domain, audience });
        if (payload) {
          return mapAuth0PayloadToSession(payload, {
            rolesClaim,
            userTypeClaim,
            permissionsClaim,
            defaultRole,
          });
        }
      }

      // 2. Check Session Cookie (encrypted/signed cookie or raw token)
      const cookieHeader = getHeader("cookie");
      const sessionCookie = parseCookie(cookieHeader, sessionCookieName);
      if (sessionCookie) {
        if (sessionSecret) {
          const verified = await verifySessionToken(sessionCookie, sessionSecret);
          if (verified) return verified;
        } else {
          // Only verify against Auth0 JWKS if no symmetric session secret is configured
          const payload = await verifyAuth0Jwt(sessionCookie, { domain, audience });
          if (payload) {
            return mapAuth0PayloadToSession(payload, {
              rolesClaim,
              userTypeClaim,
              permissionsClaim,
              defaultRole,
            });
          }
        }
      }

      return null;
    },
    handleUnauthorized(req?: Request) {
      if (loginUrl) {
        try {
          if (req && req.url) {
            const origin = new URL(req.url).origin;
            const fullUrl = new URL(loginUrl, origin).toString();
            return Response.redirect(fullUrl, 302);
          }
        } catch {}
        try {
          return Response.redirect(loginUrl, 302);
        } catch {
          return new Response(null, {
            status: 302,
            headers: { Location: loginUrl },
          });
        }
      }
      return new Response("Unauthorized Auth0 Identity", { status: 401 });
    },
  };
}

export function mapAuth0PayloadToSession(
  payload: Record<string, any>,
  options: {
    rolesClaim: string;
    userTypeClaim: string;
    permissionsClaim: string;
    defaultRole: string;
  },
): UserSessionContext {
  const roles: string[] = Array.isArray(payload[options.rolesClaim])
    ? payload[options.rolesClaim]
    : Array.isArray(payload["roles"])
      ? payload["roles"]
      : [options.defaultRole];

  const permissions: string[] = Array.isArray(payload[options.permissionsClaim])
    ? payload[options.permissionsClaim]
    : Array.isArray(payload["permissions"])
      ? payload["permissions"]
      : [];

  const isStaff = roles.some((r) =>
    ["owner", "admin", "editor", "employee", "superadmin"].includes(r.toLowerCase()),
  );

  const explicitUserType = payload[options.userTypeClaim] || payload["user_type"];
  const userType: UserType = explicitUserType || (isStaff ? "employee" : "user");

  return {
    userId: payload["sub"] || "anonymous",
    email: payload["email"],
    name: payload["name"] || payload["nickname"] || payload["email"]?.split("@")[0] || "User",
    avatar: payload["picture"],
    roles,
    permissions,
    userType,
    metadata: payload,
  };
}

function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key]!;
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return fallback;
}

export function getAuth0ConfigFromEnv(
  overrides: Partial<Auth0AdapterOptions> = {},
): Auth0AdapterOptions {
  return {
    domain: overrides.domain || getEnv("AUTH0_DOMAIN", "rimelight.eu.auth0.com"),
    audience: overrides.audience || getEnv("AUTH0_AUDIENCE") || undefined,
    clientId: overrides.clientId || getEnv("AUTH0_CLIENT_ID", ""),
    clientSecret: overrides.clientSecret || getEnv("AUTH0_CLIENT_SECRET", ""),
    rolesClaim: overrides.rolesClaim || getEnv("AUTH0_ROLES_CLAIM", "https://rimelight.com/roles"),
    userTypeClaim:
      overrides.userTypeClaim || getEnv("AUTH0_USER_TYPE_CLAIM", "https://rimelight.com/user_type"),
    permissionsClaim: overrides.permissionsClaim || "permissions",
    sessionCookieName: overrides.sessionCookieName || "rimelight_session",
    sessionSecret:
      overrides.sessionSecret ||
      getEnv("AUTH0_SECRET", "rimelight_default_development_secret_key_32bytes_minimum_length"),
    loginUrl: overrides.loginUrl || "/api/auth/login",
    defaultRole: overrides.defaultRole || "user",
    ...overrides,
  };
}

/**
 * Creates an Auth0 auth adapter automatically configured from environment variables.
 */
export function createAuth0FromEnv(
  overrides: Partial<Auth0AdapterOptions> & { devFallback?: boolean } = {},
): AuthAdapter {
  const config = getAuth0ConfigFromEnv(overrides);

  const baseAdapter = auth0Auth(config);
  if (!overrides.devFallback) {
    return baseAdapter;
  }

  return {
    name: "auth0",
    options: config,
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const session = await baseAdapter.getSession(req);
      if (session) return session;

      const isDev =
        (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development") ||
        (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV);

      if (
        isDev &&
        (!config.clientId || config.clientId === "" || config.clientId === "default_client_id")
      ) {
        return {
          userId: "dev-admin-user",
          email: "admin@rimelight.com",
          name: "Admin (Dev)",
          avatar: "https://cdn.rimelight.com/Images/default_avatar.png",
          roles: ["admin", "owner", "editor"],
          permissions: ["*"],
          userType: "employee",
          metadata: { isDev: true },
        };
      }
      return null;
    },
    handleUnauthorized(req: Request) {
      return baseAdapter.handleUnauthorized?.(req) ?? new Response("Unauthorized", { status: 401 });
    },
  };
}

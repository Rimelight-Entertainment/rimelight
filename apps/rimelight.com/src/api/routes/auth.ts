import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { auth } from "@rimelight/auth";
import {
  getAuth0ConfigFromEnv,
  createAuth0AuthorizeUrl,
  createAuth0LogoutUrl,
  createSessionToken,
  exchangeAuth0Code,
  loginWithAuth0Password,
  refreshAuth0Token,
  mapAuth0PayloadToSession,
  decodeJwt,
} from "@rimelight/auth/auth0";
import { syncAuth0UserToDb } from "#auth/sync-user";
import { t } from "@rimelight/i18n";

const auth0Config = getAuth0ConfigFromEnv();
const api = new Hono();

function getBaseUrl(c: any): string {
  const envBase =
    (typeof import.meta.env !== "undefined"
      ? import.meta.env["AUTH0_BASE_URL"] || import.meta.env["APP_BASE_URL"]
      : undefined) ||
    (typeof process !== "undefined"
      ? process.env["AUTH0_BASE_URL"] || process.env["APP_BASE_URL"]
      : undefined);
  if (envBase) return envBase.replace(/\/$/, "");

  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * GET /api/auth/login Redirects user to Auth0 Universal Login / Signup (Browser Web Flow)
 */
api.get("/login", (c) => {
  const url = new URL(c.req.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  const screenHint = url.searchParams.get("screen_hint") || undefined;
  const baseUrl = getBaseUrl(c);
  const redirectUri = `${baseUrl}/api/auth/callback`;

  const state = btoa(JSON.stringify({ returnTo }));

  const authorizeUrl = createAuth0AuthorizeUrl({
    domain: auth0Config.domain,
    clientId: auth0Config.clientId || "default_client_id",
    redirectUri,
    audience: auth0Config.audience,
    scope: "openid profile email",
    state,
    screenHint,
  });

  return c.redirect(authorizeUrl);
});

/**
 * POST /api/auth/login or /api/auth/token Headless authentication endpoint for native clients (e.g.
 * Unreal Engine 5). Validates credentials via Auth0 Resource Owner Password Credentials (ROPC) and
 * returns the JWT Bearer token and user context directly in JSON.
 */
const handleHeadlessLogin = async (c: any) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as {
      username?: string;
      email?: string;
      password?: string;
    };
    const username = (body.username || body.email || "").trim();
    const password = body.password;

    if (!username || !password) {
      return c.json({ error: "Bad Request", message: t("api.message.credentials-required") }, 400);
    }

    const tokens = await loginWithAuth0Password({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId || "",
      clientSecret: auth0Config.clientSecret,
      username,
      password,
      audience: auth0Config.audience,
      scope: "openid profile email offline_access",
    });

    const rawJwt = tokens.id_token || tokens.access_token;
    const payload = decodeJwt(rawJwt);

    const session = mapAuth0PayloadToSession(payload, {
      rolesClaim: auth0Config.rolesClaim || "https://rimelight.com/roles",
      userTypeClaim: auth0Config.userTypeClaim || "https://rimelight.com/user_type",
      permissionsClaim: auth0Config.permissionsClaim || "permissions",
      defaultRole: auth0Config.defaultRole || "user",
    });

    // Sync user to database
    await syncAuth0UserToDb(session);

    return c.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      user: session,
    });
  } catch (err: any) {
    console.error("Headless login failed:", err);
    return c.json({ error: "Unauthorized", message: err?.message || "Invalid credentials." }, 401);
  }
};

api.post("/login", handleHeadlessLogin);
api.post("/token", handleHeadlessLogin);

/**
 * POST /api/auth/refresh Silent token refresh endpoint for native clients (e.g. Unreal Engine 5).
 * Exchanges a valid refresh token for a new access token without interrupting gameplay.
 */
api.post("/refresh", async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as {
      refresh_token?: string;
      refreshToken?: string;
    };
    const refreshToken = (body.refresh_token || body.refreshToken || "").trim();

    if (!refreshToken) {
      return c.json(
        { error: "Bad Request", message: t("api.message.refresh-token-required") },
        400,
      );
    }

    const tokens = await refreshAuth0Token({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId || "",
      clientSecret: auth0Config.clientSecret,
      refreshToken,
    });

    let session = null;
    if (tokens.id_token || tokens.access_token) {
      const payload = decodeJwt(tokens.id_token || tokens.access_token);
      session = mapAuth0PayloadToSession(payload, {
        rolesClaim: auth0Config.rolesClaim || "https://rimelight.com/roles",
        userTypeClaim: auth0Config.userTypeClaim || "https://rimelight.com/user_type",
        permissionsClaim: auth0Config.permissionsClaim || "permissions",
        defaultRole: auth0Config.defaultRole || "user",
      });
    }

    return c.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token || refreshToken,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      user: session,
    });
  } catch (err: any) {
    console.error("Token refresh failed:", err);
    return c.json(
      { error: "Unauthorized", message: err?.message || "Invalid refresh token." },
      401,
    );
  }
});

/**
 * GET /api/auth/callback Handles OAuth2 redirect from Auth0, exchanges code, and creates session
 * cookie
 */
api.get("/callback", async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    console.error("Auth0 Callback error:", error, errorDescription);
    return c.text(`Authentication error: ${errorDescription || error}`, 400);
  }

  if (!code) {
    return c.text("Missing authorization code", 400);
  }

  let returnTo = "/";
  if (stateParam) {
    try {
      const parsed = JSON.parse(atob(stateParam));
      if (parsed.returnTo && typeof parsed.returnTo === "string") {
        returnTo = parsed.returnTo;
      }
    } catch {}
  }

  const baseUrl = getBaseUrl(c);
  const redirectUri = `${baseUrl}/api/auth/callback`;

  try {
    const tokens = await exchangeAuth0Code({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId || "",
      clientSecret: auth0Config.clientSecret,
      code,
      redirectUri,
    });

    // Decode user payload from ID token or Access token
    const rawJwt = tokens.id_token || tokens.access_token;
    const payload = decodeJwt(rawJwt);

    const session = mapAuth0PayloadToSession(payload, {
      rolesClaim: auth0Config.rolesClaim || "https://rimelight.com/roles",
      userTypeClaim: auth0Config.userTypeClaim || "https://rimelight.com/user_type",
      permissionsClaim: auth0Config.permissionsClaim || "permissions",
      defaultRole: auth0Config.defaultRole || "user",
    });

    // Sync profile to database (employees or users table)
    await syncAuth0UserToDb(session);

    // Generate signed compact session cookie
    const sessionSecret =
      auth0Config.sessionSecret ||
      "rimelight_default_development_secret_key_32bytes_minimum_length";
    const sessionToken = await createSessionToken(session, sessionSecret, "7d");

    setCookie(c, auth0Config.sessionCookieName || "rimelight_session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      secure: url.protocol === "https:",
    });

    return c.redirect(returnTo);
  } catch (err: any) {
    console.error("Auth0 code exchange failed:", err);
    return c.text(`Authentication failed: ${err?.message || "Unknown error"}`, 500);
  }
});

/**
 * GET /api/auth/logout Clears local session cookie and redirects to Auth0 logout endpoint
 */
api.get("/logout", (c) => {
  const baseUrl = getBaseUrl(c);
  const returnTo = `${baseUrl}/`;

  deleteCookie(c, auth0Config.sessionCookieName || "rimelight_session", {
    path: "/",
    secure: new URL(c.req.url).protocol === "https:",
  });

  if (auth0Config.clientId && auth0Config.clientId !== "default_client_id") {
    const logoutUrl = createAuth0LogoutUrl({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      returnTo,
    });
    return c.redirect(logoutUrl);
  }

  return c.redirect(returnTo);
});

/**
 * GET /api/auth/session Returns authenticated user/employee context
 */
api.get("/session", async (c) => {
  const session = await auth.getSession(c.req.raw);
  if (!session) {
    return c.json({ user: null, session: null }, 200);
  }
  return c.json({
    user: session,
    session: {
      id: session.userId,
      userId: session.userId,
      roles: session.roles,
      userType: session.userType,
    },
  });
});

/**
 * GET /api/auth/me Returns current user context
 */
api.get("/me", async (c) => {
  const session = await auth.getSession(c.req.raw);
  if (!session) {
    return c.json({ user: null }, 401);
  }
  return c.json({ user: session });
});

export default api;

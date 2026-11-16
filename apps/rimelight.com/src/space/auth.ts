/**
 * Rimelight Space sign-in on the website Worker (port of backend/api/src/service.rs, auth0.rs,
 * pending.rs and session.rs). Routes: /v1/auth/login, /v1/auth/callback, /v1/auth/exchange,
 * /v1/auth/signout. Employees only; users must already exist in `employees` (provisioned by an admin).
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getDb } from "../db/index.ts";

const APP_SCHEME_REDIRECT = "rimelight-space://auth";
const SESSION_TTL_SECS = 30 * 24 * 60 * 60;
const LOGIN_CODE_TTL_SECS = 2 * 60;
const PENDING_TTL_SECS = 10 * 60;
const CLOCK_LEEWAY_SECS = 60;
const CLAIM_USER_TYPE = "https://rimelight.com/user_type";
const CLAIM_EMAIL = "https://rimelight.com/email";
const SCOPE = "openid profile email offline_access";
const MAX_APP_STATE_LEN = 512;

type Settings = {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
  publicBaseUrl: string;
  webAppOrigins: string[];
};

/** Auth0 and return-address settings, read from the Worker's bindings on each request. */
function settings(): Settings {
  const e = env as unknown as Record<string, string | undefined>;
  const get = (name: string): string => {
    const value = (e[name] ?? "").trim();
    if (!value) throw new Error(`missing setting ${name}`);
    return value;
  };
  const origins = (e["WEB_APP_ORIGINS"] ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return {
    domain: get("AUTH0_DOMAIN"),
    clientId: get("AUTH0_CLIENT_ID"),
    clientSecret: get("AUTH0_CLIENT_SECRET"),
    // Space's API audience, which the Rust backend also uses (not the website's own audience).
    audience: (e["SPACE_AUTH0_AUDIENCE"] ?? "").trim() || "https://api.rimelight.com",
    publicBaseUrl:
      (e["PUBLIC_BASE_URL"] ?? "").trim().replace(/\/+$/, "") || "https://rimelight.com",
    webAppOrigins: origins.length ? origins : ["https://space.rimelight.com"],
  };
}

function redirectUri(s: Settings): string {
  return `${s.publicBaseUrl}/v1/auth/callback`;
}

// ---- encoding helpers -------------------------------------------------------------------------

function b64url(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(text: string): Uint8Array {
  const padded = text
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(text.length / 4) * 4, "=");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function randomToken(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

async function sha256(input: string | Uint8Array): Promise<Uint8Array> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
}

function formEncode(pairs: [string, string][]): string {
  return pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

function appendQuery(base: string, pairs: [string, string][]): string {
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${formEncode(pairs)}`;
}

function rfc3339(unix: number): string {
  return new Date(unix * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ---- pending login state (HMAC over the Auth0 `state`) -----------------------------------------

type Pending = { r: string; c: string; s: string; t: number };

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sealPending(secret: string, pending: Pending): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(pending)));
  const mac = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(body)),
  );
  return `${body}.${b64url(mac)}`;
}

async function openPending(secret: string, sealed: string, now: number): Promise<Pending | null> {
  const dot = sealed.lastIndexOf(".");
  if (dot < 0) return null;
  const body = sealed.slice(0, dot);
  let mac: Uint8Array;
  try {
    mac = b64urlDecode(sealed.slice(dot + 1));
  } catch {
    return null;
  }
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    mac as BufferSource,
    new TextEncoder().encode(body),
  );
  if (!ok) return null;
  let pending: Pending;
  try {
    pending = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  } catch {
    return null;
  }
  if (now > pending.t + PENDING_TTL_SECS) return null;
  return pending;
}

// ---- redirect and PKCE rules -------------------------------------------------------------------

function isAllowedRedirect(uri: string, s: Settings): boolean {
  if (/\s|[\x00-\x1f\x7f]/.test(uri) || uri.includes("#")) return false;
  if (uri === APP_SCHEME_REDIRECT) return true;
  const loopback = uri.match(/^http:\/\/(127\.0\.0\.1|localhost):(\d{1,5})(\/.*)?$/);
  if (loopback) {
    const port = Number(loopback[2]);
    return port >= 1 && port <= 65535;
  }
  if (uri === s.publicBaseUrl || uri.startsWith(`${s.publicBaseUrl}/`)) return true;
  return s.webAppOrigins.some((o) => uri === o || uri.startsWith(`${o}/`));
}

function isS256Challenge(value: string): boolean {
  return value.length === 43 && /^[A-Za-z0-9_-]+$/.test(value);
}

async function verifyPkce(verifier: string, challenge: string): Promise<boolean> {
  if (!(verifier.length >= 43 && verifier.length <= 128 && /^[A-Za-z0-9\-._~]+$/.test(verifier))) {
    return false;
  }
  return b64url(await sha256(verifier)) === challenge;
}

// ---- Auth0 token checks (RS256 over JWKS) ------------------------------------------------------

type Jwk = { kty: string; kid?: string; n: string; e: string };

async function verifyAccessToken(
  token: string,
  s: Settings,
  now: number,
): Promise<{ sub: string; email: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerSeg = "", payloadSeg = "", sigSeg = ""] = parts;
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(headerSeg)));
  if (header.alg !== "RS256" || !header.kid) return null;

  const jwksRes = await fetch(`https://${s.domain}/.well-known/jwks.json`);
  if (!jwksRes.ok) throw new Error(`jwks ${jwksRes.status}`);
  const jwks = (await jwksRes.json()) as { keys: Jwk[] };
  const jwk = jwks.keys.find((k) => k.kty === "RSA" && k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlDecode(sigSeg) as BufferSource,
    new TextEncoder().encode(`${headerSeg}.${payloadSeg}`),
  );
  if (!ok) return null;

  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadSeg)));
  if (payload.iss !== `https://${s.domain}/`) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(s.audience)) return null;
  if (typeof payload.exp !== "number" || now > payload.exp + CLOCK_LEEWAY_SECS) return null;
  if (typeof payload.nbf === "number" && now + CLOCK_LEEWAY_SECS < payload.nbf) return null;
  if (typeof payload.sub !== "string" || !payload.sub) return null;
  if (payload[CLAIM_USER_TYPE] !== "employee") return null;
  const email = payload[CLAIM_EMAIL];
  if (typeof email !== "string" || !email) return null;
  return { sub: payload.sub, email };
}

// ---- routes ------------------------------------------------------------------------------------

const auth = new Hono();

const htmlError = (status: number, message: string) =>
  new Response(`<!doctype html><meta charset="utf-8"><p>${message}</p>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });

/** GET /v1/auth/login: validates the app's return address and PKCE challenge, then sends the browser to Auth0. */
auth.get("/login", async (c) => {
  const s = settings();
  const redirect = c.req.query("redirect_uri");
  if (!redirect)
    return htmlError(
      400,
      "This sign-in link is incomplete. Start sign-in again from Rimelight Space.",
    );
  if (!isAllowedRedirect(redirect, s))
    return htmlError(400, "Rimelight Space does not accept this return address.");
  const challenge = c.req.query("code_challenge") ?? "";
  if (!isS256Challenge(challenge))
    return htmlError(400, "The sign-in request is missing a valid PKCE challenge.");
  const method = c.req.query("code_challenge_method");
  if (method && method !== "S256")
    return htmlError(400, "The sign-in request is missing a valid PKCE challenge.");
  const appState = c.req.query("state") ?? "";
  if (!appState || appState.length > MAX_APP_STATE_LEN) {
    return htmlError(
      400,
      "This sign-in link is incomplete. Start sign-in again from Rimelight Space.",
    );
  }

  const sealed = await sealPending(s.clientSecret, {
    r: redirect,
    c: challenge,
    s: appState,
    t: Math.floor(Date.now() / 1000),
  });
  const authorize = `https://${s.domain}/authorize?${formEncode([
    ["response_type", "code"],
    ["client_id", s.clientId],
    ["redirect_uri", redirectUri(s)],
    ["scope", SCOPE],
    ["audience", s.audience],
    ["state", sealed],
  ])}`;
  return c.redirect(authorize, 302);
});

/** GET /v1/auth/callback: Auth0 returns here. Exchanges the code, checks the employee token, and hands the app a one-time code. */
auth.get("/callback", async (c) => {
  const s = settings();
  const now = Math.floor(Date.now() / 1000);
  const sealed = c.req.query("state");
  if (!sealed)
    return htmlError(
      400,
      "This sign-in link is incomplete. Start sign-in again from Rimelight Space.",
    );
  const pending = await openPending(s.clientSecret, sealed, now);
  if (!pending)
    return htmlError(
      400,
      "This sign-in link is invalid or has expired. Start sign-in again from Rimelight Space.",
    );

  const fail = (code: string) =>
    c.redirect(
      appendQuery(pending.r, [
        ["error", code],
        ["state", pending.s],
      ]),
      302,
    );

  const auth0Error = c.req.query("error");
  if (auth0Error) return fail(auth0Error === "access_denied" ? "access_denied" : "server_error");
  const code = c.req.query("code");
  if (!code) return fail("server_error");

  // Exchange the Auth0 code for an access token.
  let accessToken: string;
  try {
    const tokenRes = await fetch(`https://${s.domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formEncode([
        ["grant_type", "authorization_code"],
        ["code", code],
        ["redirect_uri", redirectUri(s)],
        ["client_id", s.clientId],
        ["client_secret", s.clientSecret],
      ]),
    });
    if (!tokenRes.ok) throw new Error(`token endpoint ${tokenRes.status}`);
    accessToken = ((await tokenRes.json()) as { access_token: string }).access_token;
  } catch (err) {
    console.error("space callback: token exchange failed", err);
    return fail("server_error");
  }

  let claims: { sub: string; email: string } | null;
  try {
    claims = await verifyAccessToken(accessToken, s, now);
  } catch (err) {
    console.error("space callback: token check failed", err);
    return fail("server_error");
  }
  if (!claims) return fail("not_employee");

  try {
    const sql = getDb().$client;
    const rows = await sql`
      SELECT id::text AS id FROM employees
       WHERE lower(email) = lower(${claims.email}) AND is_active AND deleted_at IS NULL`;
    const row = rows[0];
    if (!row) return fail("not_provisioned");
    const userId = row["id"] as string;

    // Link the Auth0 subject to the provisioned person. Refuse if they are linked to someone else.
    const linked = await sql`
      SELECT auth0_id FROM employees WHERE id = ${userId}::uuid`;
    const existing = linked[0]?.["auth0_id"] as string | null;
    if (existing && existing !== claims.sub) return fail("server_error");
    if (!existing) {
      await sql`
        UPDATE employees SET auth0_id = ${claims.sub}, updated_at = now()
         WHERE id = ${userId}::uuid AND is_active AND deleted_at IS NULL`;
    }

    const loginCode = randomToken();
    await sql`
      INSERT INTO login_codes (code_hash, user_id, code_challenge, expires_at)
      VALUES (${await sha256(loginCode)}, ${userId}::uuid, ${pending.c},
              now() + make_interval(secs => ${LOGIN_CODE_TTL_SECS}))`;

    return c.redirect(
      appendQuery(pending.r, [
        ["code", loginCode],
        ["state", pending.s],
      ]),
      302,
    );
  } catch (err) {
    console.error("space callback: database step failed", err);
    return fail("server_error");
  }
});

/** POST /v1/auth/exchange: spends a one-time code with its PKCE verifier and creates a session. */
auth.post("/exchange", async (c) => {
  let body: { code?: string; code_verifier?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { error: "invalid_request", message: "The exchange request body is not valid." },
      400,
    );
  }
  if (!body.code || !body.code_verifier) {
    return c.json(
      { error: "invalid_request", message: "The exchange request body is not valid." },
      400,
    );
  }
  const invalid = () =>
    c.json(
      {
        error: "invalid_code",
        message: "The sign-in code is invalid, already used or expired. Start sign-in again.",
      },
      400,
    );

  try {
    const sql = getDb().$client;
    // The code is spent before the verifier is checked, so a wrong verifier cannot be retried.
    const spent = await sql`
      UPDATE login_codes SET used_at = now()
       WHERE code_hash = ${await sha256(body.code ?? "")} AND used_at IS NULL AND expires_at > now()
   RETURNING user_id::text AS user_id, code_challenge`;
    const record = spent[0];
    if (!record) return invalid();
    if (!(await verifyPkce(body.code_verifier ?? "", record["code_challenge"] as string)))
      return invalid();

    const users = await sql`
      SELECT id::text AS id, email, name AS display_name, auth0_id AS auth0_sub
        FROM employees
       WHERE id = ${record["user_id"] as string}::uuid AND is_active AND deleted_at IS NULL`;
    const user = users[0];
    if (!user)
      return c.json(
        { error: "account_inactive", message: "This account is no longer active." },
        403,
      );

    const token = randomToken();
    const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECS;
    await sql`
      INSERT INTO sessions (id, user_id, token_hash, created_at, last_used_at, expires_at)
      VALUES (gen_random_uuid(), ${user["id"] as string}::uuid, ${await sha256(token)},
              now(), now(), to_timestamp(${expires}))`;

    return c.json({
      session_token: token,
      expires_at: rfc3339(expires),
      user: {
        id: user["id"],
        email: user["email"],
        display_name: user["display_name"],
        auth0_sub: user["auth0_sub"] ?? null,
      },
    });
  } catch (err) {
    console.error("space exchange failed", err);
    return c.json(
      { error: "server_error", message: "Something went wrong. Try again in a moment." },
      500,
    );
  }
});

/** POST /v1/auth/signout: revokes the bearer session. Unknown tokens are not an error. */
auth.post("/signout", async (c) => {
  const header = c.req.header("Authorization") ?? "";
  const [scheme, token] = header.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return c.json({ error: "unauthorized", message: "Sign in to continue." }, 401);
  }
  try {
    const sql = getDb().$client;
    await sql`UPDATE sessions SET revoked_at = now() WHERE token_hash = ${await sha256(token.trim())} AND revoked_at IS NULL`;
    return c.json({ ok: true });
  } catch (err) {
    console.error("space signout failed", err);
    return c.json(
      { error: "server_error", message: "Something went wrong. Try again in a moment." },
      500,
    );
  }
});

export default auth;

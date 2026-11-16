/**
 * Auth0 Management API calls for Rimelight Space people admin: create the sign-in account for a new
 * employee, look one up by email, send the password setup email, and delete an account this request
 * created when the rest of the create fails.
 *
 * Uses the website's own Auth0 application (client credentials, the Management API client grant). Secrets
 * and tokens are never logged; errors carry only the HTTP status and Auth0's error code.
 */
import { env } from "cloudflare:workers";

const MANAGEMENT_AUDIENCE = "https://rimelight.eu.auth0.com/api/v2/";
const DB_CONNECTION = "Username-Password-Authentication";
const PASSWORD_SETUP_TTL_SECS = 604800;
const PASSWORD_SETUP_RESULT_URL = "https://rimelight.com/";
const PASSWORD_LENGTH = 32;
const PASSWORD_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";

/** An Auth0 call failed. The message is safe to log: it has no secret, token or password. */
export class Auth0Error extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "Auth0Error";
    this.status = status;
  }
}

type Config = { domain: string; clientId: string; clientSecret: string };

function config(): Config {
  const e = env as unknown as Record<string, string | undefined>;
  const get = (name: string): string => {
    const value = (e[name] ?? "").trim();
    if (!value) throw new Error(`missing setting ${name}`);
    return value;
  };
  return {
    domain: get("AUTH0_DOMAIN"),
    clientId: get("AUTH0_CLIENT_ID"),
    clientSecret: get("AUTH0_CLIENT_SECRET"),
  };
}

/** A random password that satisfies typical Auth0 policies (mixed case, digits, symbols). */
export function randomPassword(): string {
  const bytes = new Uint8Array(PASSWORD_LENGTH);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += PASSWORD_CHARS[b % PASSWORD_CHARS.length];
  return out;
}

/** Calls the Management API with a fresh client-credentials token and returns the parsed JSON (or null). */
async function managementCall(
  cfg: Config,
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: unknown }> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`https://${cfg.domain}/api/v2/${path}`, init);
  const json: unknown = await res.json().catch(() => null);
  return { status: res.status, json };
}

function errorCode(json: unknown): string {
  const code = (json as { errorCode?: unknown } | null)?.errorCode;
  return typeof code === "string" ? code : "unknown";
}

/** Gets a Management API access token with the website's client credentials. */
export async function managementToken(): Promise<string> {
  const cfg = config();
  const res = await fetch(`https://${cfg.domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      audience: MANAGEMENT_AUDIENCE,
      grant_type: "client_credentials",
    }),
  });
  const json = (await res.json().catch(() => null)) as { access_token?: unknown } | null;
  if (!res.ok || typeof json?.access_token !== "string") {
    throw new Auth0Error(`token request failed (${res.status})`, res.status);
  }
  return json.access_token;
}

/**
 * Creates a database-connection account for an employee with `app_metadata.user_type = "employee"`.
 * If Auth0 says the email already has an account (409), that account's user id is reused instead.
 * Returns the Auth0 user id (`sub`, for example "auth0|...") and whether this call created it.
 */
export async function createEmployeeAccount(
  token: string,
  email: string,
  name: string,
): Promise<{ userId: string; created: boolean }> {
  const cfg = config();
  const created = await managementCall(cfg, token, "POST", "users", {
    email,
    connection: DB_CONNECTION,
    email_verified: false,
    password: randomPassword(),
    name,
    app_metadata: { user_type: "employee" },
  });
  if (created.status === 201) {
    const id = (created.json as { user_id?: unknown } | null)?.user_id;
    if (typeof id === "string" && id) return { userId: id, created: true };
    throw new Auth0Error("create user response had no user_id", created.status);
  }
  if (created.status === 409) {
    const found = await managementCall(
      cfg,
      token,
      "GET",
      `users-by-email?email=${encodeURIComponent(email)}`,
    );
    const first = Array.isArray(found.json) ? (found.json[0] as { user_id?: unknown }) : undefined;
    if (found.status === 200 && typeof first?.user_id === "string") {
      return { userId: first.user_id, created: false };
    }
    throw new Auth0Error(`user lookup failed (${found.status})`, found.status);
  }
  throw new Auth0Error(
    `create user failed (${created.status}, ${errorCode(created.json)})`,
    created.status,
  );
}

/** Emails the new person a link to set their password. Throws on failure; the caller decides. */
export async function sendPasswordSetupEmail(token: string, userId: string): Promise<void> {
  const cfg = config();
  const res = await managementCall(cfg, token, "POST", "tickets/password-change", {
    user_id: userId,
    result_url: PASSWORD_SETUP_RESULT_URL,
    ttl_sec: PASSWORD_SETUP_TTL_SECS,
  });
  if (res.status !== 201) {
    throw new Auth0Error(
      `password ticket failed (${res.status}, ${errorCode(res.json)})`,
      res.status,
    );
  }
}

/** Deletes an Auth0 account. Used only to roll back an account this request created. */
export async function deleteAccount(token: string, userId: string): Promise<void> {
  const cfg = config();
  const res = await managementCall(cfg, token, "DELETE", `users/${encodeURIComponent(userId)}`);
  if (res.status !== 204 && res.status !== 404) {
    throw new Auth0Error(`delete user failed (${res.status})`, res.status);
  }
}

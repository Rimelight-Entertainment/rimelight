/**
 * Bearer session check for the Rimelight Space API (shared by every route that needs a signed-in person).
 * Same rules as the Rust backend: a live session is not revoked and not expired; a valid call slides its
 * expiry to 30 days from now.
 */
import type { Context } from "hono";
import { getSql } from "../db/index.ts";

export type Caller = {
  id: string;
  email: string;
  display_name: string;
  auth0_sub: string | null;
};

const unauthorized = () =>
  Response.json(
    { error: "unauthorized", message: "Sign in to continue." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );

const serverError = () =>
  Response.json(
    { error: "server_error", message: "Something went wrong. Try again in a moment." },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );

/** The signed-in person, or the 401/500 response to send back. */
export async function caller(c: Context): Promise<Caller | Response> {
  const header = c.req.header("Authorization") ?? "";
  const [scheme, token] = header.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer" || !token.trim())
    return unauthorized();

  try {
    const digest = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token.trim())),
    );
    const sql = getSql();
    const rows = await sql`
      UPDATE sessions s
         SET last_used_at = now(),
             expires_at = now() + interval '30 days'
        FROM employees u
       WHERE s.token_hash = ${digest}
         AND s.revoked_at IS NULL
         AND s.expires_at > now()
         AND u.id = s.user_id
         AND u.is_active
         AND u.deleted_at IS NULL
       RETURNING u.id::text AS id, u.email, u.name AS display_name, u.auth0_id AS auth0_sub`;
    const row = rows[0];
    if (!row) return unauthorized();
    return {
      id: row["id"] as string,
      email: row["email"] as string,
      display_name: row["display_name"] as string,
      auth0_sub: (row["auth0_sub"] as string | null) ?? null,
    };
  } catch (err) {
    console.error("space session check failed", err);
    return serverError();
  }
}

export const isResponse = (value: unknown): value is Response => value instanceof Response;

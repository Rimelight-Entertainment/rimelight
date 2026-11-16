/**
 * Rimelight Space API, served from the website Worker under /v1 (decision 0039 and the Space plan).
 * Mounted before the site middleware in fetch.ts, so the site's per-IP limits and redirects never
 * see Space traffic.
 *
 * Slice 1: health and the current user. Sign-in follows in a later slice; until then, sessions created
 * by the Rust backend (same `sessions` table) work here.
 */
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import auth from "./auth.ts";
import people from "./people.ts";

const space = new Hono();

space.route("/auth", auth);
space.route("/", people);

/** SHA-256 of the token, the same bytes the Rust backend stores in `sessions.token_hash`. */
async function hashToken(token: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return new Uint8Array(digest);
}

/** The token from `Authorization: Bearer <token>`, or `undefined`. Same rule as the Rust backend. */
function bearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const [scheme, token] = header.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return undefined;
  return token.trim() || undefined;
}

function unauthorized(): Response {
  return Response.json(
    { error: "unauthorized", message: "Sign in to continue." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

function serverError(): Response {
  return Response.json(
    { error: "server_error", message: "Something went wrong. Try again in a moment." },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

space.get("/health", (c) => c.json({ ok: true }, 200, { "Cache-Control": "no-store" }));

/**
 * GET /v1/me: the signed-in person behind a live session. A live session is not revoked and not expired;
 * a successful call slides its expiry to 30 days from now, as the Rust backend does.
 */
space.get("/me", async (c) => {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) return unauthorized();

  try {
    const sql = getDb().$client;
    const hash = await hashToken(token);
    const rows = await sql`
      UPDATE sessions s
         SET last_used_at = now(),
             expires_at = now() + interval '30 days'
        FROM employees u
       WHERE s.token_hash = ${hash}
         AND s.revoked_at IS NULL
         AND s.expires_at > now()
         AND u.id = s.user_id
         AND u.is_active
         AND u.deleted_at IS NULL
       RETURNING u.id::text AS id, u.email, u.name AS display_name, u.auth0_id AS auth0_sub`;
    const row = rows[0];
    if (!row) return unauthorized();
    return c.json(
      {
        id: row["id"],
        email: row["email"],
        display_name: row["display_name"],
        auth0_sub: row["auth0_sub"] ?? null,
      },
      200,
      { "Cache-Control": "no-store" },
    );
  } catch (err) {
    console.error("space /v1/me failed", err);
    return serverError();
  }
});

export default space;

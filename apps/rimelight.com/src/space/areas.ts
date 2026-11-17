/**
 * Rimelight Space issue areas on the website Worker. An area is an admin-created name an issue can carry (its tags). Any
 * signed-in person may read the list; only the `admin` role may create one. Errors use the codes and messages of
 * locations.ts and people-admin.ts.
 */
import type { Context } from "hono";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
type Sql = ReturnType<typeof getDb>["$client"];

const ROLE_ADMIN = "admin";
const ADMIN_DENIED = "Only admins can do this.";
const NAME_MAX = 60;

/** Carries a ready-made error response out of a handler. */
class Failure {
  readonly response: Response;
  constructor(response: Response) {
    this.response = response;
  }
}

const areas = new Hono();

function apiError(status: number, code: string, message: string): Response {
  return Response.json(
    { error: code, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function serverError(): Response {
  return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
}

function fail(status: number, code: string, message: string): never {
  throw new Failure(apiError(status, code, message));
}

/** Runs a handler body; a Failure becomes its response, anything else a 500. */
async function handle(c: Context, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof Failure) return err.response;
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`space areas failed ${c.req.method} ${c.req.path}: ${detail}`);
    return serverError();
  }
}

/** Admin gate: the caller must hold the admin role. Returns the response to send when refused. */
async function adminGate(c: Context): Promise<Response | null> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      SELECT 1 FROM user_roles r
       WHERE r.user_id = ${who.id}::text::uuid
         AND r.role = ${ROLE_ADMIN}
       LIMIT 1`;
    if (rows.length > 0) return null;
  } catch (err) {
    console.error("space areas role check failed", err);
    return serverError();
  }
  return apiError(403, "forbidden", ADMIN_DENIED);
}

/** The area names, by name. The issue writes check their tags against this list. */
export async function areaNames(sql: Sql): Promise<string[]> {
  const rows: Row[] = await sql`SELECT name FROM areas ORDER BY lower(name)`;
  return rows.map((row) => String(row.name));
}

/** Refuses the first tag that is not an area. Tags are compared as written (trimmed by the caller). */
export async function requireKnownAreas(sql: Sql, tags: string[]): Promise<void> {
  if (tags.length === 0) return;
  const known = new Set((await areaNames(sql)).map((name) => name.toLowerCase()));
  const unknown = tags.find((tag) => !known.has(tag.toLowerCase()));
  if (unknown !== undefined) {
    fail(422, "invalid_field", `tags: "${unknown}" is not an area. Ask an admin to add it.`);
  }
}

/** GET /v1/areas: every area by name. Any signed-in person may read it. */
areas.get("/areas", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      SELECT id::text AS id, name FROM areas ORDER BY lower(name)`;
    return c.json(
      rows.map((row) => ({ id: String(row.id), name: String(row.name) })),
      200,
      { "Cache-Control": "no-store" },
    );
  } catch (err) {
    console.error("space /v1/areas failed", err);
    return serverError();
  }
});

/** POST /v1/admin/areas: body { name }. Names are unique without regard to case. Replies 201 with the area. */
areas.post("/admin/areas", (c) =>
  handle(c, async () => {
    const refused = await adminGate(c);
    if (refused) return refused;
    const raw: unknown = await c.req.json().catch(() => null);
    const name =
      typeof (raw as { name?: unknown } | null)?.name === "string"
        ? (raw as { name: string }).name.trim()
        : "";
    if (name === "") fail(422, "invalid_field", "name: enter a name");
    if (name.length > NAME_MAX) fail(422, "invalid_field", `name: at most ${NAME_MAX} characters`);
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      INSERT INTO areas (name)
      VALUES (${name}::text)
      ON CONFLICT (lower(name)) DO NOTHING
      RETURNING id::text AS id, name`;
    if (rows.length === 0) {
      fail(409, "area_taken", "An area with that name already exists.");
    }
    return c.json({ id: String(rows[0].id), name: String(rows[0].name) }, 201, {
      "Cache-Control": "no-store",
    });
  }),
);

export default areas;

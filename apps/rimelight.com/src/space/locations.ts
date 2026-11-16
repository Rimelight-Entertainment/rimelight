/**
 * Rimelight Space company locations on the website Worker (offices, sites and remote hubs).
 * Reads need any signed-in person; writes need the `admin` role. Errors use the same codes and
 * messages as people-admin.ts. Locations hold no seats yet, so delete has no 409 case.
 */
import type { Context } from "hono";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;
type Sql = ReturnType<typeof getDb>["$client"];

const ROLE_ADMIN = "admin";
const ADMIN_DENIED = "Only admins can do this.";
const KINDS = ["office", "site", "remote_hub"];
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const FIELDS = ["name", "kind", "address", "city", "country", "timezone", "note"];

/** Carries a ready-made error response out of a handler. */
class Failure {
  readonly response: Response;
  constructor(response: Response) {
    this.response = response;
  }
}

const locations = new Hono();

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

function notFound(message: string): never {
  return fail(404, "not_found", message);
}

function invalid(field: string, message: string): never {
  return fail(422, "invalid_field", `${field}: ${message}`);
}

function badRequest(message = "The request body is not valid."): never {
  return fail(400, "invalid_request", message);
}

/** Runs a handler body; a Failure becomes its response, anything else a 500. */
async function handle(c: Context, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof Failure) return err.response;
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`space locations failed ${c.req.method} ${c.req.path}: ${detail}`);
    return serverError();
  }
}

/** Parses a JSON object body. Unknown keys and wrong types are a 400, as serde's deny_unknown_fields. */
async function readBody(c: Context): Promise<Body> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return badRequest();
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return badRequest();
  const source = raw as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (!FIELDS.includes(key)) badRequest();
    const value = source[key];
    if (value !== undefined && value !== null && typeof value !== "string") badRequest();
  }
  return source;
}

/** Trims a text field and enforces its length. Absent is `undefined`. */
function text(field: string, value: string | null | undefined, max: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  if (Array.from(trimmed).length > max) invalid(field, `at most ${max} characters`);
  return trimmed;
}

function required(field: string, value: string | null | undefined, max: number): string {
  const trimmed = text(field, value, max) ?? "";
  if (trimmed === "") invalid(field, "is required");
  return trimmed;
}

function locationKind(value: string | null | undefined, mustHave: boolean): string | undefined {
  if (value === undefined || value === null) {
    if (mustHave) invalid("kind", "is required");
    return undefined;
  }
  if (!KINDS.includes(value)) invalid("kind", "use office, site or remote_hub");
  return value;
}

function toLocation(r: Row) {
  return {
    id: String(r.id),
    name: String(r.name),
    kind: String(r.kind),
    address: String(r.address),
    city: String(r.city),
    country: String(r.country),
    timezone: String(r.timezone),
    note: String(r.note),
  };
}

async function getLocation(sql: Sql, id: string) {
  const rows: Row[] = await sql`
    SELECT id::text AS id, name, kind, address, city, country, timezone, note
      FROM locations
     WHERE id = ${id}::text::uuid`;
  return rows[0] ? toLocation(rows[0]) : null;
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
    console.error("space locations role check failed", err);
    return serverError();
  }
  return apiError(403, "forbidden", ADMIN_DENIED);
}

/** GET /v1/locations: every location by name. Any signed-in person may read it. */
locations.get("/locations", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      SELECT id::text AS id, name, kind, address, city, country, timezone, note
        FROM locations
       ORDER BY name`;
    return c.json(rows.map(toLocation), 200, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("space /v1/locations failed", err);
    return serverError();
  }
});

/** POST /v1/admin/locations */
locations.post("/admin/locations", (c) =>
  handle(c, async () => {
    const refused = await adminGate(c);
    if (refused) return refused;
    const body = await readBody(c);
    const name = required("name", body.name, 100);
    const kind = locationKind(body.kind, true) as string;
    const address = text("address", body.address, 300) ?? "";
    const city = text("city", body.city, 100) ?? "";
    const country = text("country", body.country, 100) ?? "";
    const timezone = text("timezone", body.timezone, 100) ?? "";
    const note = text("note", body.note, 2000) ?? "";
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      INSERT INTO locations (name, kind, address, city, country, timezone, note)
      VALUES (${name}::text, ${kind}::text, ${address}::text, ${city}::text,
              ${country}::text, ${timezone}::text, ${note}::text)
      RETURNING id::text AS id`;
    const created = await getLocation(sql, String(rows[0]?.id));
    if (!created) throw new Error("location insert returned no row");
    return c.json(created, 201, { "Cache-Control": "no-store" });
  }),
);

/** PATCH /v1/admin/locations/:id. Absent fields keep their value; "" clears a text field. */
locations.patch("/admin/locations/:id", (c) =>
  handle(c, async () => {
    const refused = await adminGate(c);
    if (refused) return refused;
    const id = c.req.param("id") ?? "";
    if (!UUID.test(id)) notFound("There is no such location.");
    const sql = getDb().$client;
    if (!(await getLocation(sql, id))) notFound("There is no such location.");
    const body = await readBody(c);
    const name = body.name === undefined ? undefined : required("name", body.name, 100);
    const kind = locationKind(body.kind, false);
    const address = text("address", body.address, 300);
    const city = text("city", body.city, 100);
    const country = text("country", body.country, 100);
    const timezone = text("timezone", body.timezone, 100);
    const note = text("note", body.note, 2000);
    await sql`
      UPDATE locations SET
        name = COALESCE(${name ?? null}::text, name),
        kind = COALESCE(${kind ?? null}::text, kind),
        address = COALESCE(${address ?? null}::text, address),
        city = COALESCE(${city ?? null}::text, city),
        country = COALESCE(${country ?? null}::text, country),
        timezone = COALESCE(${timezone ?? null}::text, timezone),
        note = COALESCE(${note ?? null}::text, note)
      WHERE id = ${id}::text::uuid`;
    const updated = await getLocation(sql, id);
    if (!updated) notFound("There is no such location.");
    return c.json(updated, 200, { "Cache-Control": "no-store" });
  }),
);

/** DELETE /v1/admin/locations/:id. Nothing links to a location yet, so only a missing id fails. */
locations.delete("/admin/locations/:id", (c) =>
  handle(c, async () => {
    const refused = await adminGate(c);
    if (refused) return refused;
    const id = c.req.param("id") ?? "";
    if (!UUID.test(id)) notFound("There is no such location.");
    const sql = getDb().$client;
    const deleted: Row[] =
      await sql`DELETE FROM locations WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    if (deleted.length === 0) notFound("There is no such location.");
    return c.json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }),
);

export default locations;

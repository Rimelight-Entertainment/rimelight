/**
 * Rimelight Space people routes on the website Worker (port of people_service.rs and pg_people.rs).
 * Slice 2: the read-only directory: departments. Teams, positions, people and the org tree follow.
 */
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

const people = new Hono();

/** GET /v1/departments: every department with its member count, by name. Any signed-in person may read it. */
people.get("/departments", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const rows = await sql`
      SELECT d.id::text AS id, d.name,
             d.parent_department_id::text AS parent_department_id,
             d.head_id::text AS head_id,
             (SELECT count(*)::int FROM employees m
               WHERE m.department_id = d.id AND m.deleted_at IS NULL) AS member_count
        FROM departments d
       ORDER BY d.name`;
    return c.json(
      rows.map((r) => ({
        id: r["id"],
        name: r["name"],
        parent_department_id: r["parent_department_id"] ?? null,
        head_id: r["head_id"] ?? null,
        member_count: Number(r["member_count"]),
      })),
      200,
      { "Cache-Control": "no-store" },
    );
  } catch (err) {
    console.error("space /v1/departments failed", err);
    return c.json(
      { error: "server_error", message: "Something went wrong. Try again in a moment." },
      500,
    );
  }
});

export default people;

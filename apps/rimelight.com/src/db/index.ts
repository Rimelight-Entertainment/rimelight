import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "cloudflare:workers";
import { relations } from "./schema/relations.ts";

/**
 * Returns a Drizzle client for the current request. postgres-js holds socket state, so create it
 * inside the handler, not at module load. Hyperdrive pools the connections.
 */
export function getDb() {
  const connectionString =
    env.HYPERDRIVE?.connectionString || env.DATABASE_URL || process.env["DATABASE_URL"] || "";
  return drizzle({
    client: postgres(connectionString, { prepare: false, max: 5 }),
    relations,
  });
}

/**
 * A plain postgres.js client for routes that only run SQL (the Space session check and the canvas routes). It skips
 * the Drizzle wrapper and postgres.js's array-type lookup on connect (`fetch_types: false`), which the Space routes do
 * not need: on Workers Free each request has 10 ms of CPU, and the canvas list went over it (2026-11-19). One connection
 * per client; create it inside the handler, as getDb.
 */
export function getSql() {
  const connectionString =
    env.HYPERDRIVE?.connectionString || env.DATABASE_URL || process.env["DATABASE_URL"] || "";
  return postgres(connectionString, { prepare: false, max: 1, fetch_types: false });
}

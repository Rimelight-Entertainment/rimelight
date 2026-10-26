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

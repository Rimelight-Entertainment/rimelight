import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "cloudflare:workers";
import { relations } from "./schema/relations.ts";

export const db = drizzle({
  client: neon(
    env.HYPERDRIVE?.connectionString || env.DATABASE_URL || process.env["DATABASE_URL"] || "",
  ),
  relations,
});

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "./schema/relations.ts";

const databaseUrl =
  (typeof import.meta.env !== "undefined"
    ? import.meta.env["HYPERDRIVE_URL"] || import.meta.env["DATABASE_URL"]
    : undefined) ||
  (typeof process !== "undefined" && process.env
    ? process.env["HYPERDRIVE_URL"] || process.env["DATABASE_URL"]
    : undefined);

export const db = drizzle({ client: neon(databaseUrl || ""), relations });

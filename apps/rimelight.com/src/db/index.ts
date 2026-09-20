import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema/index.ts"

const databaseUrl =
  (typeof import.meta.env !== "undefined"
    ? import.meta.env["HYPERDRIVE_URL"] || import.meta.env["DATABASE_URL"]
    : undefined) ||
  (typeof process !== "undefined" && process.env
    ? process.env["HYPERDRIVE_URL"] || process.env["DATABASE_URL"]
    : undefined)

export function getDb(url: string = databaseUrl) {
  return drizzle(neon(url), { schema })
}

export const db = getDb()

export * from "./schema/index.ts"

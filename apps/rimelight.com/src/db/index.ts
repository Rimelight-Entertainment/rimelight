import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema/index.ts"

export * from "./schema/index.ts"
export { schema }

function anyObject(): any {
  return {}
}

function createDbProxy(): NeonHttpDatabase<typeof schema> {
  let cachedDb: NeonHttpDatabase<typeof schema> | null = null
  let cachedUrl: string | null = null
  return new Proxy(anyObject(), {
    get(_target, prop) {
      if (prop === "then") return undefined

      const databaseUrl =
        (typeof import.meta.env !== "undefined"
          ? import.meta.env["HYPERDRIVE_URL"] || import.meta.env["DATABASE_URL"]
          : undefined) ||
        (typeof process !== "undefined" && process.env
          ? process.env["HYPERDRIVE_URL"] || process.env["DATABASE_URL"]
          : undefined)

      if (!databaseUrl) {
        throw new Error(
          "[db] DATABASE_URL or HYPERDRIVE_URL is not set. Set the variable and restart the dev server."
        )
      }

      if (!cachedDb || cachedUrl !== databaseUrl) {
        cachedUrl = databaseUrl
        cachedDb = drizzle(neon(databaseUrl), { schema })
      }

      return Reflect.get(cachedDb, prop)
    }
  })
}

export const db = createDbProxy()

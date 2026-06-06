import { drizzle } from "drizzle-orm/d1"
import type { DrizzleD1Database } from "drizzle-orm/d1"
import * as schema from "@/db/schema"

export * from "@/db/schema"
export { schema }

function stub(): DrizzleD1Database<typeof schema>
function stub(): unknown {
  console.warn("[db] DB binding is not set. Any attempt to query the database will throw.")
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined
        return () => {
          throw new Error("[db] DB binding is not set. Bind the D1 database to the environment.")
        }
      }
    }
  )
}

let db!: DrizzleD1Database<typeof schema>

const d1Binding = globalThis.DB

if (d1Binding) {
  db = drizzle(d1Binding, { schema })
} else {
  db = stub()
}

export { db }

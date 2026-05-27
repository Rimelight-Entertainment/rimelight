import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

export * from "@/db/schema"
export { schema }

const databaseUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL
export const db = drizzle(neon(databaseUrl), { schema })

import fs from "node:fs"
import path from "node:path"

// Read .env file manually
const envPath = path.resolve(process.cwd(), ".env")
const envContent = fs.readFileSync(envPath, "utf-8")
const envVars: Record<string, string> = {}

envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=")
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim()
  }
})

// Set DATABASE_URL
if (envVars.DATABASE_URL) {
  process.env.DATABASE_URL = envVars.DATABASE_URL
  console.log("DATABASE_URL loaded from .env")
}

// Now import and run the migration
const { migrateDocs } = await import("./migrate-docs-simple.ts")
await migrateDocs()

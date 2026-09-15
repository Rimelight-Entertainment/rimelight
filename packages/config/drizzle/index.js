import { defineConfig } from "drizzle-kit"

export function rimelightDrizzleConfig(options = {}) {
  const {
    out = "./drizzle",
    schema = "./src/db/schema/index.ts",
    dialect = "sqlite",
    ...rest
  } = options

  return defineConfig({
    out,
    schema,
    dialect,
    ...rest
  })
}

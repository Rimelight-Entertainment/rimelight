import { defineConfig, type Config } from "drizzle-kit"

export type RimelightDrizzleOptions = Partial<Config>

export function rimelightDrizzleConfig(options: RimelightDrizzleOptions = {}): Config {
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

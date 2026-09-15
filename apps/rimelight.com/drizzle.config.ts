import { rimelightDrizzleConfig } from "@rimelight/config/drizzle"

export default rimelightDrizzleConfig({
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || ""
  }
})

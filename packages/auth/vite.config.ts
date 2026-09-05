import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: [
      "src/index.ts",
      "src/types.ts",
      "src/adapters/cf-access.ts",
      "src/adapters/auth0.ts",
      "src/adapters/mock.ts",
      "src/permissions/index.ts",
      "src/plugins/reserved-usernames/index.ts",
      "src/plugins/construction-guest/index.ts"
    ]
  })
)

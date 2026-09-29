import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: [
      "src/index.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/integration.ts",
      "src/plugin.ts",
      "src/storage/index.ts",
      "src/server/index.ts"
    ]
  })
)

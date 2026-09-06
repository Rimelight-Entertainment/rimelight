import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: [
      "src/index.ts",
      "src/hono.ts",
      "src/plugin.ts",
      "src/runtime.ts",
      "src/types.ts",
      "src/utils.ts"
    ]
  })
)

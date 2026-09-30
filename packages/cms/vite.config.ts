import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  pack: {
    entry: [
      "src/index.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/integration.ts",
      "src/plugin.ts",
      "src/storage/index.ts",
      "src/server/index.ts"
    ],
    dts: true,
    checks: { pluginTimings: false }
  }
})

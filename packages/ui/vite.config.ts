import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: [
      "src/index.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/shortcuts.ts",
      "src/stores.ts",
      "src/types.ts",
      "src/icons.ts"
    ]
  })
)

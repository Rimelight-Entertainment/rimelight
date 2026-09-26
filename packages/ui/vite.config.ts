import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    test: {
      environment: "node"
    },
    entry: [
      "src/index.ts",
      "src/plugin.ts",
      "src/head.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/shortcuts.ts",
      "src/stores.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts"
    ]
  })
)

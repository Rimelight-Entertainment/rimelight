import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"
import solid from "@solidjs/vite-plugin"

export default defineConfig(
  rimelightPackConfig({
    plugins: [solid()],
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
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts"
    ]
  })
)

import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"
import solid from "@solidjs/vite-plugin"

export default defineConfig(
  rimelightPackConfig({
    pack: {
      plugins: [
        solid({
          solid: {
            generate: "dom"
          }
        })
      ]
    },
    test: {
      environment: "node"
    },
    entry: [
      "src/index.ts",
      "src/head.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/shortcuts.ts",
      "src/stores.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/components/index.ts"
    ]
  })
)

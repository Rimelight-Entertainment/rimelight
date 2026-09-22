import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"
import solid from "vite-plugin-solid"

export default defineConfig(
  rimelightPackConfig({
    plugins: [
      solid({
        solid: {
          generate: "ssr"
        }
      })
    ],
    resolve: {
      alias: {
        "solid-js/web": "solid-js/web/dist/server.js"
      }
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
      "src/icons.ts"
    ]
  })
)

import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"
import solid from "@solidjs/vite-plugin"

export default defineConfig({
  ...rimelightConfig(),
  plugins: [solid()],
  pack: {
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
    ],
    dts: true,
    checks: { pluginTimings: false }
  }
})

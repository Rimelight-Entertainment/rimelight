import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  pack: {
    entry: ["src/**/*.ts"],
    dts: true,
    checks: { pluginTimings: false }
  }
})

import { defineConfig } from "vite-plus"
import { rimelightConfig } from "./vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  pack: {
    entry: ["vite-plus/base.ts"],
    dts: true,
    checks: { pluginTimings: false }
  }
})

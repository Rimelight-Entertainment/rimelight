import { defineConfig } from "vite-plus"

export default defineConfig({
  pack: {
    entry: ["vite-plus/base.ts"],
    dts: true,
    checks: { pluginTimings: false }
  }
})

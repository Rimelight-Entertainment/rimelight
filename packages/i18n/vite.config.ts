import { defineConfig } from "vite-plus"

export default defineConfig({
  pack: {
    entry: ["src/**/*.ts"],
    exclude: ["**/*.d.ts"],
    dts: true,
    checks: { pluginTimings: false }
  }
})

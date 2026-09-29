import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "./vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: ["vite-plus/base.ts", "drizzle/index.ts", "solid/index.ts"]
  })
)

import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: ["src/index.ts", "src/types.ts", "src/sitemap.ts", "src/robots.ts"]
  })
)

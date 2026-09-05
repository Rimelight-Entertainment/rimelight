import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    entry: ["src/integrations/index.ts", "src/middleware/index.ts", "src/config/index.ts"]
  })
)

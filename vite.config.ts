import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  run: {
    cache: true,
    tasks: {
      check: {
        dependsOn: [
          "@rimelight/auth#check",
          "@rimelight/cli#check",
          "@rimelight/cms#check",
          "@rimelight/i18n#check",
          "@rimelight/security#check",
          "@rimelight/seo#check",
          "@rimelight/ui#check",
          "rimelight-dot-com#check",
          "starter-dot-rimelight-dot-com#check"
        ],
        command: 'node -e "process.exit(0)"'
      }
    }
  }
})

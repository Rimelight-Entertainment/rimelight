import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"
import solid from "@solidjs/vite-plugin"
import { cloudflare } from "@cloudflare/vite-plugin"
import { filesystemRouting } from "filesystem-routing"
import { i18n } from "@rimelight/i18n/plugin"
import { auth } from "@rimelight/auth/plugin"
import { security } from "@rimelight/security/plugin"
import { seo } from "@rimelight/seo/plugin"

export default defineConfig({
  ...rimelightConfig(),
  plugins: [
    solid({
      ssr: true
    }),
    filesystemRouting({
      dir: "src/pages"
    }),
    cloudflare({
      configPath: "./wrangler.jsonc"
    }),
    i18n({
      locales: ["en", "pt"],
      defaultLocale: "en"
    }),
    auth(),
    security(),
    seo({
      domain: "starter.rimelight.com",
      name: "Rimelight Starter",
      description: "Welcome to my website!",
      author: "Rimelight",
      titleTemplate: "%s | Rimelight Starter",
      locales: {
        en: "en-US",
        pt: "pt-BR"
      }
    })
  ]
})

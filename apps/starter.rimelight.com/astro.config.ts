import { defineConfig } from "astro/config"
import { rimelightAstroConfig } from "@rimelight/config/astro"

export default defineConfig(
  rimelightAstroConfig({
    domain: "starter.rimelight.com",
    seo: {
      name: "Rimelight Starter",
      description: "Welcome to my website!",
      author: "Rimelight",
      branding: {
        favicon: "https://cdn.rimelight.com/logos/logomark_color.svg",
        logo: {
          alt: "Rimelight Starter"
        },
        colors: {
          themeColor: "#ffffff",
          backgroundColor: "#ffffff"
        }
      },
      titleTemplate: "%s | Rimelight Starter",
      locales: {
        en: "en-US",
        pt: "pt-BR"
      },
      privatePathPrefixes: [
        "/dashboard",
        "/admin",
        "/cms",
        "/internal",
        "/api",
        "/dev",
        "/og",
        "/open-graph",
        "/auth"
      ]
    },
    solid: true,
    cms: true,
    auth: true,
    security: true,
    i18n: {
      locales: ["en", "pt"],
      defaultLocale: "en"
    },
    ui: {
      logos: {
        logomark: {
          color: "https://cdn.rimelight.com/logos/logomark_color.svg",
          white: "https://cdn.rimelight.com/logos/logomark_white.svg",
          black: "https://cdn.rimelight.com/logos/logomark_black.svg"
        },
        logotype: {
          color: "https://cdn.rimelight.com/logos/logotype_color.svg",
          white: "https://cdn.rimelight.com/logos/logotype_white.svg",
          black: "https://cdn.rimelight.com/logos/logotype_black.svg"
        }
      }
    }
  })
)

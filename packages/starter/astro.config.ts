import { defineConfig } from "astro/config"
import { ui } from "@rimelight/ui/integrations"

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    ui({
      colors: {
        primary: {
          light: {
            "50": "#f4f0ff",
            "100": "#e9e2ff",
            "500": "#7146ff",
            "600": "#6222ff"
          },
          dark: {
            "50": "#1e1040",
            "100": "#2d1a5e",
            "500": "#9b7aff",
            "600": "#b096ff"
          }
        }
      },
      logos: {
        logomark: {
          color: "/favicon.svg",
          white: "/favicon.svg",
          black: "/favicon.svg"
        }
      }
    })
  ]
})

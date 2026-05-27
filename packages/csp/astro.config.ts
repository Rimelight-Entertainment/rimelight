import { ui, sri } from "@rimelight/ui/integrations"
import { defineSecurity } from "@rimelight/ui/config"
import cloudflare from "@astrojs/cloudflare"
import { defineConfig, memoryCache, svgoOptimizer } from "astro/config"

export default defineConfig({
  experimental: {
    contentIntellisense: true,
    queuedRendering: {
      enabled: true,
      contentCache: true
    },
    cache: {
      provider: memoryCache()
    },
    svgOptimizer: svgoOptimizer({
      plugins: [
        "preset-default",
        "removeXMLNS",
        {
          name: "removeXlink",
          params: {
            includeLegacy: true
          }
        }
      ]
    })
  },

  site: "https://csp.rimelight.com",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),

  security: defineSecurity({
    domain: "csp.rimelight.com"
  }),

  i18n: {
    locales: ["en", "pt", "es"],
    defaultLocale: "en",
  },

  integrations:[
    ui({
      logos: {
        logomark: "/favicon.svg"
      }
    }),

    sri()
  ]
})

import { visualizer } from "rollup-plugin-visualizer"
import nanostoresI18n from "astro-nanostores-i18n"
import en from "./src/translations/en.json"
import es from "./src/translations/es.json"
import pt from "./src/translations/pt.json"
import sitemap from "@astrojs/sitemap"
import mdx from "@astrojs/mdx"
import { ui, sri } from "@rimelight/ui/integrations"
import { defineSecurity } from "@rimelight/ui/config"
import cloudflare from "@astrojs/cloudflare"
import { rimelightI18n } from "@rimelight/i18n/integration"
import { defineConfig, fontProviders, memoryCache, svgoOptimizer } from "astro/config"

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
    routeRules: {
      "/api/[...path]": {
        swr: 600 // 10 minutes stale-while-revalidate
      },
      "/[...path]": {
        maxAge: 300 // 5 minutes cache
      }
    },
    clientPrerender: true,
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

  vite: {
    plugins: [
      visualizer({
        emitFile: true,
        filename: "stats.html"
      })
    ]
  },

  site: "https://starter.rimelight.com",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),

  security: defineSecurity({
    domain: "starter.rimelight.com"
  }),

  i18n: {
    locales: ["en", "pt", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Serif",
      cssVariable: "--font-serif",
      fallbacks: ["serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"]
    }
  ],

  integrations: [
    rimelightI18n({
      translations: { en, es, pt },
      kvBinding: "starter-dot-rimelight-dot-com_translations"
    }),
    nanostoresI18n({
      translationLoader: "./src/i18n/loader.ts",
      addMiddleware: true,
      translations: {
        "en": en,
        "es": es,
        "pt-br": pt
      }
    }),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          pt: "pt-BR",
          es: "es-ES"
        }
      }
    }),

    mdx(),

    ui({
      logos: {
        logomark: {
          color: "./src/assets/logos/logomark_color.svg",
          white: "./src/assets/logos/logomark_white.svg",
          black: "./src/assets/logos/logomark_black.svg"
        },
        logotype: {
          color: "./src/assets/logos/logotype_color.svg",
          white: "./src/assets/logos/logotype_color.svg",
          black: "./src/assets/logos/logotype_black.svg"
        }
      }
    }),

    sri()
  ]
})

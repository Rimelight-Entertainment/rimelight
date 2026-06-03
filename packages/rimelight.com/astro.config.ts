import { visualizer } from "rollup-plugin-visualizer"
import nanostoresI18n from "astro-nanostores-i18n"
import en from "./src/translations/en.json"
import es from "./src/translations/es.json"
import pt from "./src/translations/pt.json"
import sitemap from "@astrojs/sitemap"
import mdx from "@astrojs/mdx"
import astroExpressiveCode from "astro-expressive-code"
import { createCssVariablesTheme } from "shiki/core"
import { ui, sri } from "@rimelight/ui/integrations"
import { defineSecurity } from "@rimelight/ui/config"
import cloudflare from "@astrojs/cloudflare"
import { defineConfig, fontProviders, memoryCache, svgoOptimizer } from "astro/config"

const theme = (() => {
  const t = createCssVariablesTheme({
    name: "csp-theme",
    variablePrefix: "--shiki-",
    fontStyle: true
  })
  t.colors = Object.fromEntries(
    Object.entries(t.colors || {}).filter(
      ([_, val]) => typeof val === "string" && val.startsWith("#")
    )
  )
  return t
})()

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

  site: "https://rimelight.com",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),

  security: defineSecurity({
    domain: "rimelight.com"
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

    astroExpressiveCode({
      emitExternalStylesheet: true,
      themes: [theme],
      themeCssRoot: ":root"
    }),

    mdx(),

    ui({
      logos: {
        logomark: {
          black: "/images/logos/RIMELIGHT_LOGOMARK_BLACK.svg",
          white: "/images/logos/RIMELIGHT_LOGOMARK_WHITE.svg",
          color: "/images/logos/RIMELIGHT_LOGOMARK_COLOR.svg"
        },
        logotype: {
          black: "/images/logos/RIMELIGHT_LOGOTYPE_BLACK.svg",
          white: "/images/logos/RIMELIGHT_LOGOTYPE_WHITE.svg",
          color: "/images/logos/RIMELIGHT_LOGOTYPE_COLOR.svg"
        },
        combomark_horizontal: {
          black: "/images/logos/RIMELIGHT_COMBOMARK_HORIZONTAL_BLACK.svg",
          white: "/images/logos/RIMELIGHT_COMBOMARK_HORIZONTAL_WHITE.svg",
          color: "/images/logos/RIMELIGHT_COMBOMARK_HORIZONTAL_COLOR.svg"
        },
        combomark_vertical: {
          black: "/images/logos/RIMELIGHT_COMBOMARK_VERTICAL_BLACK.svg",
          white: "/images/logos/RIMELIGHT_COMBOMARK_VERTICAL_WHITE.svg",
          color: "/images/logos/RIMELIGHT_COMBOMARK_VERTICAL_COLOR.svg"
        }
      }
    }),

    sri()
  ]
})

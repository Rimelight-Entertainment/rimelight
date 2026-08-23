import en from "./src/translations/en.json"
import pt from "./src/translations/pt.json"
import solid from "@astrojs/solid-js"
import { ui } from "@rimelight/ui"
import { sri } from "@rimelight/security"
import { defineSecurity } from "@rimelight/security/config"
import cloudflare from "@astrojs/cloudflare"
import { rimelightI18n } from "@rimelight/i18n/integration"
import { defineConfig, fontProviders, svgoOptimizer } from "astro/config"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"

export default defineConfig({
  experimental: {
    incrementalBuild: true,
    contentIntellisense: true,
    clientPrerender: true,
    collectionStorage: "chunked",
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

  site: "https://starter.rimelight.com",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),
  cache: {
    provider: cacheCloudflare()
  },
  routeRules: {
    "/api/[...path]": {
      swr: 600 // 10 minutes stale-while-revalidate
    },
    "/[...path]": {
      maxAge: 300 // 5 minutes cache
    }
  },

  security: defineSecurity({
    domain: "starter.rimelight.com",
    imgSrc: ["https://cdn.rimelight.com"]
  }),

  i18n: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    routing: "manual"
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

  image: {
    domains: ["starter.rimelight.com", "cdn.starter.rimelight.com"],
    layout: "constrained",
    responsiveStyles: true
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  integrations: [
    solid({
      include: ["**/solid/**", "**/*.tsx"]
    }),
    rimelightI18n({
      translations: { en, pt },
      kvBinding: "starter-dot-rimelight-dot-com_translations"
    }),

    sri()
  ],

  vite: {
    plugins: [
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
        },
        shortcuts: {
          categories: {
            system: { label: "System" },
            navigation: { label: "Navigation" }
          }
        }
      })
    ]
  }
})

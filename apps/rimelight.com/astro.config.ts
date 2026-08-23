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
import { extractAllMeta } from "./src/docs/extractAll"

function localDocsIntegration() {
  return {
    name: "rimelight-docs-integration",
    hooks: {
      "astro:config:setup": async ({
        updateConfig,
        logger
      }: {
        updateConfig: (config: any) => void
        logger: any
      }) => {
        logger.info("Extracting documentation metadata from @rimelight/ui components...")
        const startTime = Date.now()
        const docsMeta = await extractAllMeta()
        logger.info(
          `Documentation metadata extracted in ${((Date.now() - startTime) / 1000).toFixed(2)}s`
        )
        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-ui-docs-meta",
                enforce: "pre",
                resolveId(id: string) {
                  if (id === "virtual:rimelight-ui-docs-meta") {
                    return "\0" + id
                  }
                  return null
                },
                load(id: string) {
                  if (id === "\0virtual:rimelight-ui-docs-meta") {
                    return `export default ${JSON.stringify(docsMeta)}`
                  }
                  return null
                }
              }
            ]
          }
        })
      }
    }
  }
}

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

  site: "https://rimelight.com",
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
    domain: "rimelight.com",
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
    domains: ["rimelight.com", "cdn.rimelight.com"],
    layout: "constrained",
    responsiveStyles: true
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  integrations: [
    rimelightI18n({
      translations: { en, pt },
      kvBinding: "rimelight-dot-com_translations"
    }),

    solid({
      include: ["**/solid/**", "**/*.tsx"]
    }),

    sri(),

    localDocsIntegration()
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

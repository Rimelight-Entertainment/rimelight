import { visualizer } from "rollup-plugin-visualizer"
import nanostoresI18n from "astro-nanostores-i18n"
import en from "./src/translations/en.json"
import es from "./src/translations/es.json"
import pt from "./src/translations/pt.json"
import sitemap from "@astrojs/sitemap"
import starlight from "@astrojs/starlight"
import { ui } from "@rimelight/ui/integrations"
import { sri } from "@rimelight/ui/integrations"
import { starlightAddons } from "@rimelight/ui/plugins"
import lunaria from "@lunariajs/starlight"
import { defineConfig, fontProviders, memoryCache, svgoOptimizer } from "astro/config"
import cloudflare from "@astrojs/cloudflare"

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

  site: "https://playground.rimelight.com",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),

  // security: {
  //   checkOrigin: true,
  //   allowedDomains: [
  //     {
  //       hostname: "**.playground.rimelight.com",
  //       protocol: "https"
  //     }
  //   ],
  //   csp: {
  //     algorithm: "SHA-384",
  //     directives: [
  //       "default-src 'none'",
  //       "img-src 'self' https://cdn.playground.rimelight.com https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
  //       "font-src 'self'",
  //       "connect-src 'self'",
  //       "frame-ancestors 'none'",
  //       "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  //       "upgrade-insecure-requests",
  //       "base-uri 'self'",
  //       "form-action 'self'"
  //     ],
  //     scriptDirective: {
  //       resources: [
  //         "'self'",
  //         "https://challenges.cloudflare.com",
  //         "https://betterlytics.io/analytics.js"
  //       ]
  //     },
  //     styleDirective: {
  //       resources: ["'self'"]
  //     }
  //   }
  // },

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

  markdown: {
    syntaxHighlight: "prism"
  },

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

    starlight({
      customCss: ["./src/styles/starlight.css"],
      plugins: [starlightAddons(), lunaria({ route: "/i18n" })],
      //TODO Temporarily true while issue gets resolved: https://github.com/withastro/starlight/issues/3859
      //prerender: false,
      lastUpdated: true,
      disable404Route: true,
      title: {
        en: "Website Docs"
      },
      description: "Rimelight Entertainment Documentation",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/Rimelight-Entertainment" }
      ],
      sidebar: [
        { label: "Home", link: "/docs/" },
        {
          label: "Documentation",
          items: [{ autogenerate: { directory: "docs" } }]
        }
      ]
    }),

    ui({
      colors: {
        blurple: {
          light: {
            "50": "#f4f0ff",
            "100": "#e9e2ff",
            "200": "#d6ccff",
            "300": "#b9a8ff",
            "400": "#967aff",
            "500": "#7146ff",
            "600": "#6222ff",
            "700": "#5512e9",
            "800": "#460ebf",
            "900": "#3b0e9c",
            "950": "#220869"
          },
          dark: {
            "50": "#1e1040",
            "100": "#2d1a5e",
            "200": "#3d2580",
            "300": "#5535a8",
            "400": "#7555cc",
            "500": "#9b7aff",
            "600": "#b096ff",
            "700": "#c4b0ff",
            "800": "#d8ccff",
            "900": "#ebe6ff",
            "950": "#f5f0ff"
          }
        },
        "grand-tale-primary": {
          light: {
            "50": "oklch(1 0 0)",
            "100": "oklch(0.8897 0.0348 17.82)",
            "200": "oklch(0.7784 0.075 18.91)",
            "300": "oklch(0.6721 0.1165 20.61)",
            "400": "oklch(0.5759 0.1601 23.59)",
            "500": "oklch(0.5035 0.1896 27.5)",
            "600": "oklch(0.4281 0.1594 27.3)",
            "700": "oklch(0.389 0.145 27.297)",
            "800": "oklch(0.326 0.123 27.556)",
            "900": "oklch(0.1815 0.0536 24.18)",
            "950": "oklch(0 0 0)"
          },
          dark: {
            "50": "oklch(0.15 0.04 24)",
            "100": "oklch(0.25 0.06 24)",
            "200": "oklch(0.35 0.08 24)",
            "300": "oklch(0.45 0.10 24)",
            "400": "oklch(0.55 0.12 24)",
            "500": "oklch(0.62 0.14 27.5)",
            "600": "oklch(0.55 0.12 27.3)",
            "700": "oklch(0.48 0.10 27.3)",
            "800": "oklch(0.40 0.08 27.6)",
            "900": "oklch(0.30 0.06 24.2)",
            "950": "oklch(0.20 0.04 24)"
          }
        },
        "grand-tale-secondary": {
          "50": "oklch(1 0 0)",
          "100": "oklch(0.9242 0.029 77.54)",
          "200": "oklch(0.8483 0.0583 77.19)",
          "300": "oklch(0.772 0.0853 76.63)",
          "400": "oklch(0.6976 0.1107 74.68)",
          "500": "oklch(0.728 0.141 69.479)",
          "600": "oklch(0.671 0.132 73.044)",
          "700": "oklch(0.4348 0.0853 71.27)",
          "800": "oklch(0.3329 0.0633 71.87)",
          "900": "oklch(0.2209 0.0379 75.04)",
          "950": "oklch(0 0 0)"
        },
        blagenta: {
          "374": "#ff3366"
        },
        "flat-test": {
          "500": "#ff6600",
          "600": "#cc5500"
        },
        "mode-aware": {
          light: {
            "500": "#0064d7",
            "600": "#0050ac"
          },
          dark: {
            "500": "#4a9eff",
            "600": "#3a7ee0"
          }
        },
        "mode-pinned": {
          light: {
            "500": "#22c55e",
            "600": "#16a34a"
          },
          unthemed: {
            "500": "#166534",
            "600": "#14532d"
          }
        },
        "no-dark": {
          light: {
            "500": "#8b5cf6",
            "600": "#7c3aed"
          }
          // dark falls back to light (no change between modes)
        },
        "no-light": {
          dark: {
            "500": "#f472b6",
            "600": "#ec4899"
          }
          // light/fallback: no flat, no light → undefined (blank in light mode)
        }
      },
      logos: {
        logomark: "/favicon.svg"
      }
    }),

    sri()
  ]
})

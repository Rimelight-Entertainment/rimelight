import en from "./src/translations/en.json"
import pt from "./src/translations/pt.json"
import mdx from "@astrojs/mdx"
import vue from "@astrojs/vue"
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

  vite: {
    define: {
      "import.meta.env.BUILD_TIME": JSON.stringify(process.env.BUILD_TIME || "static")
    }
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
    domains: ["rimelight.com", "cdn.rimelight.com"]
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  integrations: [
    rimelightI18n({
      translations: { en, pt },
      kvBinding: "rimelight-dot-com_translations"
    }),

    mdx(),

    vue(),

    solid({
      include: ["**/solid/**", "**/*.tsx"]
    }),

    ui({
      components: {
        themes: {
          link: {
            variants: {
              active: {
                true: "text-primary-500",
                false: "text-muted"
              }
            }
          },
          formField: {
            slots: {
              description: "text-sm",
              help: "text-xs"
            }
          },
          checkbox: {
            slots: {
              description: "text-sm"
            }
          },
          toast: {
            slots: {
              root: "bg-black border-none ring-0"
            }
          },
          dropdownMenu: {
            slots: {
              content: "ring-0"
            }
          },
          selectMenu: {
            slots: {
              content: "min-w-fit"
            }
          },
          popover: {
            slots: {
              content: "ring-0"
            }
          },
          modal: {
            variants: {
              fullscreen: {
                false: {
                  content: "ring-0 bg-muted divide-none"
                }
              }
            }
          },
          slideover: {
            slots: {
              content: "bg-black"
            }
          },
          banner: {
            slots: {
              icon: "text-default",
              title: "text-default",
              close: "text-default"
            }
          },
          page: {
            slots: {
              root: "lg:gap-8"
            }
          },
          pageAside: {
            slots: {
              root: "lg:px-4 lg:pe-0 lg:ps-0 lg:ms-0"
            }
          },
          pageHeader: {
            slots: {
              links: "justify-end"
            }
          },
          pageCTA: {
            slots: {
              root: "rounded-none"
            }
          },
          navigationMenu: {
            slots: {
              separator: "my-2",
              viewport: "ring-0"
            },
            variants: {
              active: {
                true: {
                  childLink: "before:bg-elevated text-highlighted",
                  childLinkIcon: "text-highlighted"
                },
                false: {
                  link: "text-default",
                  linkLeadingIcon: "text-dimmed"
                }
              }
            },
            compoundVariants: [
              {
                disabled: false,
                active: false,
                variant: "pill",
                class: {
                  link: ["hover:text-toned", "transition-colors"],
                  linkLeadingIcon: ["group-hover:text-toned", "transition-colors"]
                }
              },
              {
                disabled: false,
                active: false,
                variant: "link",
                class: {
                  link: ["hover:text-toned", "transition-colors"],
                  linkLeadingIcon: ["group-hover:text-toned", "transition-colors"]
                }
              },
              {
                orientation: "vertical",
                collapsed: false,
                class: {
                  childList: "border-muted"
                }
              }
            ]
          },
          footerColumns: {
            slots: {
              label: "text-white"
            },
            variants: {
              active: {
                true: { link: "text-primary-300 hover:text-primary-200" },
                false: { link: "text-white hover:text-primary-200" }
              }
            }
          },
          dashboardGroup: {
            base: "flex-1 flex overflow-hidden relative"
          },
          dashboardPanel: {
            slots: {
              root: "min-h-full"
            }
          },
          dashboardNavbar: {
            slots: {
              root: "h-12",
              title: "text-xl"
            }
          },
          dashboardSidebar: {
            slots: {
              root: "min-h-full"
            }
          },
          dashboardToolbar: {
            slots: {
              root: "h-12"
            }
          },
          blogPost: {
            slots: {
              root: "rounded-none"
            }
          }
        }
      },
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

    sri(),

    localDocsIntegration()
  ]
})

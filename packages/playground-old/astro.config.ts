import { defineConfig, memoryCache } from "astro/config"
import UnoCSS from "@unocss/astro"
import { execSync } from "node:child_process"
import sitemap from "@astrojs/sitemap"
import cloudflare from "@astrojs/cloudflare"
import Icons from "unplugin-icons/vite"
import mdx from "@astrojs/mdx"
import vue from "@astrojs/vue"
import { sri, ui } from "@rimelight/ui/integrations"

const BUILD_ID = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim()
  } catch {
    return `build-${Date.now()}`
  }
})()

export default defineConfig({
  experimental: {
    contentIntellisense: true,
    rustCompiler: true,
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
    svgo: {
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
    }
  },

  integrations: [sitemap(), mdx(), vue(), UnoCSS(), sri(), ui()],

  site: "https://playground.rimelight.com",
  base: "/",
  trailingSlash: "ignore",

  output: "server",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport"
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  adapter: cloudflare({
    prerenderEnvironment: "workerd",
    imageService: {
      build: "compile",
      runtime: "cloudflare-binding"
    }
  }),

  vite: {
    plugins: [
      Icons({
        compiler: "astro"
      })
    ],
    assetsInclude: ["**/*.wasm"],
    ssr: {
      external: ["buffer", "path", "fs"].map((i) => `node:${i}`)
    },
    define: {
      "import.meta.env.BUILD_ID": JSON.stringify(BUILD_ID)
    }
  },

  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        hostname: "**.rimelight.com",
        protocol: "https"
      }
    ],
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'none'",
        "img-src 'self' https://cdn.rimelight.com https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
        "upgrade-insecure-requests",
        "base-uri 'self'",
        "form-action 'self'"
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "https://challenges.cloudflare.com",
          "https://betterlytics.io/analytics.js"
        ]
      },
      styleDirective: {
        resources: ["'self'"]
      }
    }
  }
})

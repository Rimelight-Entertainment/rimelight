import { defineConfig, memoryCache } from "astro/config"
import UnoCSS from "@unocss/astro"
import { execSync } from "node:child_process"
import sitemap from "@astrojs/sitemap"
import cloudflare from "@astrojs/cloudflare"
import Icons from "unplugin-icons/vite"
import mdx from "@astrojs/mdx"
import { sri, ui } from "@rimelight/ui/integrations"
import { remarkModifiedTime } from "@rimelight/ui/lib"
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@rimelight/ui/domain"
import { SITE_CONFIG } from "./src/config"

// import { mergeConfig, validateConfig } from "astro/config"
// import sharedConfig from "@danielmarchi/astro-config"
// export default mergeConfig(sharedConfig, { /* Local overrides */ })

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

  integrations: [sitemap(), mdx(), UnoCSS(), sri(), ui()],

  site: SITE_CONFIG.url,
  base: "/",
  trailingSlash: "ignore",

  output: "server",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport"
  },

  markdown: {
    remarkPlugins: [remarkModifiedTime],
    syntaxHighlight: "prism"
  },

  adapter: cloudflare({
    prerenderEnvironment: "workerd",
    imageService: {
      build: "compile",
      runtime: "cloudflare-binding"
    }
    // imagesBindingName: 'MY_IMAGES',
    // sessionKVBindingName: 'MY_SESSION_BINDING',
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
        hostname: "**.danielmarchi.dev",
        protocol: "https"
      }
    ],
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'none'",
        "img-src 'self' https://cdn.danielmarchi.dev https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
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
  },

  i18n: {
    locales: [...SUPPORTED_LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false
    }
  }
})

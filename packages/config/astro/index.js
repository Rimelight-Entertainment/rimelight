import fs from "node:fs"
import path from "node:path"
import cloudflare from "@astrojs/cloudflare"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"
import { fontProviders } from "astro/config"

export function cacheRulesPreset(options = {}) {
  const { apiSwrSeconds = 600, pageMaxAgeSeconds = 300, customRules = {} } = options
  return {
    routeRules: {
      "/api/[...path]": {
        swr: apiSwrSeconds
      },
      "/[...path]": {
        maxAge: pageMaxAgeSeconds
      },
      ...customRules
    }
  }
}

export function fontsPreset(options = {}) {
  const defaultFonts = [
    {
      name: "Noto Sans",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"],
      subsets: ["latin", "latin-ext"],
      weights: [400, 500, 600, 700],
      styles: ["normal"]
    },
    {
      name: "Noto Serif",
      cssVariable: "--font-serif",
      fallbacks: ["serif"],
      subsets: ["latin", "latin-ext"],
      weights: [400, 700],
      styles: ["normal"]
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"],
      subsets: ["latin", "latin-ext"],
      weights: [400, 500, 700],
      styles: ["normal"]
    }
  ]

  const provider = (options.fontProviders || fontProviders)?.fontsource
    ? (options.fontProviders || fontProviders).fontsource()
    : undefined

  return {
    fonts: (options.fonts || defaultFonts).map((font) => ({
      ...(provider ? { provider } : {}),
      ...font
    }))
  }
}

export function imagePreset(options = {}) {
  const { domains = [], layout = "constrained", responsiveStyles = true } = options
  return {
    image: {
      domains,
      layout,
      responsiveStyles
    }
  }
}

export function cloudflarePreset(options = {}) {
  const { adapter = cloudflare(), cacheProvider = cacheCloudflare(), session = false } = options
  return {
    output: "server",
    session,
    adapter,
    cache: { provider: cacheProvider }
  }
}

function discoverTranslations(dir = "./src/translations") {
  const translations = {}
  try {
    const resolvedDir = path.resolve(process.cwd(), dir)
    if (fs.existsSync(resolvedDir)) {
      const files = fs.readdirSync(resolvedDir)
      for (const file of files) {
        if (file.endsWith(".json")) {
          const locale = path.basename(file, ".json")
          const content = JSON.parse(fs.readFileSync(path.join(resolvedDir, file), "utf8"))
          translations[locale] = content
        }
      }
    }
  } catch {}
  return translations
}

function rimelightIntegration(options, imageDomains, domain) {
  return {
    name: "rimelight-auto-plugins",
    hooks: {
      "astro:config:setup": async ({ updateConfig }) => {
        const integrations = []
        const plugins = []

        if (options.solid) {
          const solidMod = await import("@astrojs/solid-js")
          const solidFn = solidMod.default || solidMod
          const solidOpts =
            typeof options.solid === "object"
              ? options.solid
              : { include: ["**/solid/**", "**/*.tsx"] }
          integrations.push(solidFn(solidOpts))
        }

        if (options.cms) {
          const cmsMod = await import("@rimelight/cms/integration")
          const { rimelightCms } = cmsMod
          const cmsOpts = typeof options.cms === "object" ? options.cms : {}
          let storage = cmsOpts.storage
          if (!storage) {
            const storageMod = await import("@rimelight/cms/storage")
            const { r2 } = storageMod
            storage = r2({ binding: cmsOpts.binding || "BLOB" })
          }
          integrations.push(
            rimelightCms({
              storage,
              auth: cmsOpts.auth || "./src/auth/auth.ts",
              ...cmsOpts
            })
          )
        }

        if (options.security) {
          const secMod = await import("@rimelight/security")
          const { security: securityFn } = secMod
          const secOpts = typeof options.security === "object" ? options.security : {}
          const defaultImgSrc = imageDomains.map((d) =>
            d.startsWith("http://") || d.startsWith("https://") ? d : `https://${d}`
          )
          const imgSrc = secOpts.imgSrc
            ? Array.from(new Set([...defaultImgSrc, ...secOpts.imgSrc]))
            : defaultImgSrc

          plugins.push(
            securityFn({
              domain: secOpts.domain || domain,
              imgSrc,
              ...secOpts
            })
          )
        }

        if (options.i18n) {
          const i18nMod = await import("@rimelight/i18n")
          const { i18n: i18nFn } = i18nMod
          const i18nOpts = typeof options.i18n === "object" ? options.i18n : {}
          const translations = i18nOpts.translations || discoverTranslations()
          const locales = i18nOpts.locales || Object.keys(translations)
          const defaultLocale = i18nOpts.defaultLocale || (locales.length > 0 ? locales[0] : "en")
          const kvBinding =
            i18nOpts.kvBinding ||
            (domain ? `${domain.replaceAll(".", "-")}_translations` : undefined)

          plugins.push(
            i18nFn({
              locales,
              defaultLocale,
              prefixDefaultLocale: i18nOpts.prefixDefaultLocale ?? true,
              translations,
              ...(kvBinding ? { kvBinding } : {}),
              ...i18nOpts
            })
          )
        }

        if (options.ui) {
          const uiMod = await import("@rimelight/ui")
          const { ui: uiFn } = uiMod
          const uiOpts = typeof options.ui === "object" ? options.ui : {}
          plugins.push(uiFn(uiOpts))
        }

        updateConfig({
          integrations,
          vite: {
            plugins
          }
        })
      }
    }
  }
}

export function rimelightAstroConfig(options = {}) {
  const {
    domain,
    site = domain ? `https://${domain}` : undefined,
    imageDomains = domain ? [domain, `cdn.${domain}`, "cdn.rimelight.com"] : [],
    apiSwrSeconds = 600,
    pageMaxAgeSeconds = 300,
    adapter,
    cacheProvider,
    fonts,
    solid,
    security,
    i18n,
    cms,
    ui,
    integrations = [],
    vite = {},
    ...rest
  } = options

  const hasFlags = Boolean(solid || security || i18n || cms || ui)

  return {
    ...(site ? { site } : {}),
    prefetch: {
      prefetchAll: true
    },
    ...cloudflarePreset({
      ...(adapter !== undefined ? { adapter } : {}),
      ...(cacheProvider !== undefined ? { cacheProvider } : {})
    }),
    ...cacheRulesPreset({
      ...(apiSwrSeconds !== undefined ? { apiSwrSeconds } : {}),
      ...(pageMaxAgeSeconds !== undefined ? { pageMaxAgeSeconds } : {})
    }),
    ...fontsPreset(fonts !== undefined ? { fonts } : {}),
    ...imagePreset({ domains: imageDomains }),
    markdown: {
      syntaxHighlight: "prism"
    },
    integrations: [
      ...(hasFlags ? [rimelightIntegration(options, imageDomains, domain)] : []),
      ...integrations
    ],
    vite,
    ...rest
  }
}

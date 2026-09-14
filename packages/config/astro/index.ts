import cloudflare from "@astrojs/cloudflare"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"
import { fontProviders } from "astro/config"

export interface CacheRulesPresetOptions {
  apiSwrSeconds?: number
  pageMaxAgeSeconds?: number
  customRules?: Record<string, any>
}

export function cacheRulesPreset(options: CacheRulesPresetOptions = {}): any {
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

export interface FontsPresetOptions {
  fontProviders?: any
  fonts?: any[]
}

export function fontsPreset(options: FontsPresetOptions = {}): any {
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

export interface ImagePresetOptions {
  domains?: string[]
  layout?: "constrained" | "fixed" | "full-width" | "responsive"
  responsiveStyles?: boolean
}

export function imagePreset(options: ImagePresetOptions = {}): any {
  const { domains = [], layout = "constrained", responsiveStyles = true } = options
  return {
    image: {
      domains,
      layout,
      responsiveStyles
    }
  }
}

export interface CloudflarePresetOptions {
  adapter?: any
  cacheProvider?: any
  session?: boolean
}

export function cloudflarePreset(options: CloudflarePresetOptions = {}): any {
  const { adapter = cloudflare(), cacheProvider = cacheCloudflare(), session = false } = options
  return {
    output: "server" as const,
    session,
    adapter,
    cache: { provider: cacheProvider }
  }
}

export interface RimelightAstroOptions {
  domain?: string
  site?: string
  imageDomains?: string[]
  apiSwrSeconds?: number
  pageMaxAgeSeconds?: number
  adapter?: any
  cacheProvider?: any
  fonts?: any[]
  solid?: boolean | { include?: string[]; [key: string]: any }
  security?:
    | boolean
    | {
        domain?: string
        imgSrc?: string[]
        directives?: Record<string, any>
        [key: string]: any
      }
  i18n?: {
    translations?: Record<string, any>
    locales?: string[]
    defaultLocale?: string
    prefixDefaultLocale?: boolean
    kvBinding?: string
    [key: string]: any
  }
  cms?:
    | boolean
    | {
        storage?: any
        binding?: string
        auth?: string
        [key: string]: any
      }
  ui?:
    | boolean
    | {
        logos?: any
        shortcuts?: any
        [key: string]: any
      }
  integrations?: any[]
  vite?: {
    plugins?: any[]
    [key: string]: any
  }
  [key: string]: any
}

function rimelightIntegration(
  options: RimelightAstroOptions,
  imageDomains: string[],
  domain?: string
) {
  return {
    name: "rimelight-auto-plugins",
    hooks: {
      "astro:config:setup": async ({ updateConfig }: { updateConfig: (config: any) => void }) => {
        const integrations: any[] = []
        const plugins: any[] = []

        if (options.solid) {
          const solidMod = await import("@astrojs/solid-js")
          const solidFn = (solidMod as any).default || solidMod
          const solidOpts =
            typeof options.solid === "object"
              ? options.solid
              : { include: ["**/solid/**", "**/*.tsx"] }
          integrations.push(solidFn(solidOpts))
        }

        if (options.cms) {
          const cmsMod = await import("@rimelight/cms/integration")
          const { rimelightCms } = cmsMod as any
          const cmsOpts = typeof options.cms === "object" ? options.cms : {}
          let storage = cmsOpts.storage
          if (!storage) {
            const storageMod = await import("@rimelight/cms/storage")
            const { r2 } = storageMod as any
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
          const { security: securityFn } = secMod as any
          const secOpts = typeof options.security === "object" ? options.security : {}
          const defaultImgSrc = imageDomains.map((d: string) =>
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
          const { i18n: i18nFn } = i18nMod as any
          const translations = options.i18n.translations || {}
          const locales = options.i18n.locales || Object.keys(translations)
          const defaultLocale =
            options.i18n.defaultLocale || (locales.length > 0 ? locales[0] : "en")
          const kvBinding =
            options.i18n.kvBinding ||
            (domain ? `${domain.replaceAll(".", "-")}_translations` : undefined)

          plugins.push(
            i18nFn({
              locales,
              defaultLocale,
              prefixDefaultLocale: options.i18n.prefixDefaultLocale ?? true,
              translations,
              ...(kvBinding ? { kvBinding } : {}),
              ...options.i18n
            })
          )
        }

        if (options.ui) {
          const uiMod = await import("@rimelight/ui")
          const { ui: uiFn } = uiMod as any
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

export function rimelightAstroConfig(options: RimelightAstroOptions = {}): any {
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
      syntaxHighlight: "prism" as const
    },
    integrations: [
      ...(hasFlags ? [rimelightIntegration(options, imageDomains, domain)] : []),
      ...integrations
    ],
    vite,
    ...rest
  }
}

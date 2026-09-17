/// <reference types="astro/client" />

declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "virtual:rimelight/seo" {
  export const siteConfig: import("@rimelight/seo").SiteConfig
  export const SEO_LOCALES:
    | import("@rimelight/seo").LocaleConfig
    | Record<string, string>
    | undefined
  export const PRIVATE_PATH_PREFIXES: string[]
  export const seoConfig: {
    SEO_LOCALES?: import("@rimelight/seo").LocaleConfig | Record<string, string>
    PRIVATE_PATH_PREFIXES: string[]
  }
  export default siteConfig
}

declare module "virtual:rimelight/i18n" {
  export const locales: string[]
  export const languages: string[]
  export const defaultLocale: string
  export const prefixDefaultLocale: boolean
  export const translations: Record<string, Record<string, any>> | undefined
  export default {
    locales: [] as string[],
    defaultLocale: ""
  }
}

declare module "virtual:rimelight-auth" {
  export const auth: import("@rimelight/auth").AuthAdapter
  export const authAdapter: import("@rimelight/auth").AuthAdapter
  export default auth
}

declare module "virtual:rimelight-auth-client" {
  export const authClient: import("@rimelight/auth/client").AuthClient
  export const createAuthClient: typeof import("@rimelight/auth/client").createAuthClient
  export default authClient
}

declare module "#auth/auth" {
  export const auth: import("@rimelight/auth").AuthAdapter
  export const authAdapter: import("@rimelight/auth").AuthAdapter
  export default auth
}

declare module "#auth/auth-client" {
  export const authClient: import("@rimelight/auth/client").AuthClient
  export const createAuthClient: typeof import("@rimelight/auth/client").createAuthClient
  export default authClient
}

declare module "astro-nanostores-i18n:runtime" {
  export * from "astro-nanostores-i18n/runtime"
}

declare module "virtual:rimelight-i18n-config" {
  export const locales: string[]
  export const defaultLocale: string
}

declare module "cloudflare:workers" {
  /**
   * Ambient Cloudflare Workers env — populated at runtime by the CF runtime.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const env: Record<string, any>
}

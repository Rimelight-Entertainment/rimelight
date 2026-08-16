declare module "@rimelight/i18n:runtime" {
  export * from "@rimelight/i18n/runtime"
}

declare module "virtual:rimelight-i18n-config" {
  export const locales: string[]
  export const defaultLocale: string
}

declare module "cloudflare:workers" {
  /**
   * Ambient Cloudflare Workers env — populated at runtime by the CF runtime.
   */
  export const env: Record<string, any>
}

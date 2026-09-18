declare module "virtual:rimelight-security-config" {
  export const config: import("./types").SecurityOptions
}

declare module "virtual:sri-manifest" {
  export const manifest: Record<string, string>
}

declare module "virtual:rimelight/seo" {
  export const siteConfig: Record<string, any>
  export const SEO_LOCALES: Array<{ code: string; label?: string; [key: string]: any }> | undefined
  export const PRIVATE_PATH_PREFIXES: string[] | undefined
  export const seoConfig: Record<string, any>
  const defaultExport: Record<string, any>
  export default defaultExport
}

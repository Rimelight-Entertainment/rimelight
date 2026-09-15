declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "virtual:rimelight-seo-config" {
  const config: import("./integration.js").RimelightSeoOptions
  export default config
}

declare module "virtual:rimelight-seo/options" {
  const config: import("./integration.js").RimelightSeoOptions
  export default config
}

declare module "virtual:rimelight-seo/config" {
  export const SEO_LOCALES: import("./types.js").LocaleConfig | undefined
  export const PRIVATE_PATH_PREFIXES: string[] | undefined
  export const seoEntries: (() => Promise<import("./types.js").SeoEntry[]>) | undefined
  export const rssEntries: (() => Promise<import("./types.js").RssItem[]>) | undefined
}

declare module "virtual:rimelight-seo/site-config" {
  export const siteConfig: import("./types.js").SiteConfig | Record<string, any>
}

declare module "virtual:rimelight-seo/db" {
  export const db: any
  export const pages: any
}

declare module "virtual:rimelight-seo/corpus" {
  export const corpusPages: any[]
}

declare module "#db/schema" {
  export const pages: any
}

declare module "drizzle-orm" {
  export const and: (...args: any[]) => any
  export const isNull: (column: any) => any
  export const isNotNull: (column: any) => any
  export const sql: any
  export const eq: (column: any, value: any) => any
}

declare module "@rimelight/cms" {
  export const renderCorpusMarkdown: (db: any, options: any) => Promise<string>
}

declare module "astro:content" {
  export const getCollection: (collection: string) => Promise<any[]>
}

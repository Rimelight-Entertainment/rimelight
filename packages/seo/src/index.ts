export type {
  ChangeFreq,
  LocaleConfig,
  RobotsOptions,
  SeoEntry,
  SitemapAlternate,
  SitemapUrl,
  UserAgentRule,
  SiteConfig,
  OGImage,
  RSSFeed,
  HeadProps,
  LlmsPage,
  LlmsTxtOptions,
  LlmsFullTxtOptions,
  ArticleSchemaOptions,
  BreadcrumbItem
} from "./types.js"

export {
  buildSitemapUrls,
  buildSitemapXml,
  buildSitemapIndexXml,
  chunkSitemapUrls
} from "./sitemap.js"

export { buildRobotsTxt } from "./robots.js"

export {
  buildCanonicalUrl,
  buildPageTitle,
  buildSafeDescription,
  buildRobotsMetaContent,
  buildWebSiteSchema
} from "./meta.js"

export { buildLlmsTxt, buildLlmsFullTxt } from "./llms.js"
export { buildArticleSchema, buildBreadcrumbSchema } from "./schema.js"

export { default as SEOHead } from "./components/SEOHead.astro"
export { default as AgentDirective } from "./components/AgentDirective.astro"

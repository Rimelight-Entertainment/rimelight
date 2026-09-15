export type {
  ChangeFreq,
  LocaleConfig,
  RobotsOptions,
  RobotsRouteOptions,
  SeoEntry,
  SitemapAlternate,
  SitemapUrl,
  SitemapOptions,
  UserAgentRule,
  SiteConfig,
  OGImage,
  RSSFeed,
  RssItem,
  RssFeedOptions,
  RssOptions,
  HeadProps,
  OpenGraphMeta,
  TwitterMeta,
  LlmsPage,
  LlmsTxtOptions,
  LlmsFullTxtOptions,
  LlmsRouteOptions,
  LlmsFullRouteOptions,
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

export { buildRssXml, escapeXml } from "./rss.js"

export {
  buildCanonicalUrl,
  buildPageTitle,
  buildSafeDescription,
  buildRobotsMetaContent,
  buildWebSiteSchema,
  deepMerge
} from "./meta.js"

export { buildLlmsTxt, buildLlmsFullTxt } from "./llms.js"
export { buildArticleSchema, buildBreadcrumbSchema } from "./schema.js"

import { rimelightSeo } from "./integration.js"
export type { RimelightSeoOptions } from "./integration.js"
export { rimelightSeo }
export default rimelightSeo

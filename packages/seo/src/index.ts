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
  RssCollectionConfig,
  HeadProps,
  OpenGraphMeta,
  TwitterMeta,
  LlmsPage,
  LlmsTxtOptions,
  LlmsFullTxtOptions,
  LlmsRouteOptions,
  LlmsFullRouteOptions,
  ArticleSchemaOptions,
  BreadcrumbItem,
  SecurityTxtOptions,
  SecurityRouteOptions,
  WebManifestIcon,
  WebManifestShortcut,
  WebManifest,
  WebManifestOptions,
  ManifestRouteOptions,
  ApiCatalogItem,
  ApiCatalog,
  ApiCatalogOptions,
  ApiCatalogRouteOptions,
  AssetRouteOptions,
  RimelightSeoOptions,
  OgRouteOptions
} from "./types.js"

export {
  createSeoHead,
  createHead,
  defineSeoConfig,
  renderTagsToHtml,
  mergeHeadTags,
  type HeadTag,
  type HeadResult
} from "./head.js"

export { escapeHtml, serializeJsonLd, sanitizeUrl } from "./sanitize.js"

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
  buildDefaultOgImageUrl,
  deepMerge
} from "./meta.js"

export { buildLlmsTxt, buildLlmsFullTxt } from "./llms.js"
export { buildSecurityTxt } from "./security.js"
export { buildWebManifest } from "./manifest.js"
export { buildApiCatalog } from "./catalog.js"
export { buildArticleSchema, buildBreadcrumbSchema } from "./schema.js"
export { generatePng, generateMaskablePng, generateIco, generateOgCard } from "./assets.js"

export {
  NOTO_SANS,
  defaultOgLayout,
  loadOgFonts,
  renderOgResponse,
  renderDefaultOg,
  type OgFontConfig,
  type OgLayoutOptions,
  type OgRenderConfig
} from "./og.js"

export { handleOgRequest, createHonoOgHandler } from "./og/index.js"

import { rimelightSeo } from "./plugin.js"
export { rimelightSeo }
export default rimelightSeo

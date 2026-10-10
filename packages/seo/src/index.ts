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
  OgRouteOptions,
} from "./types";

export { escapeHtml, serializeJsonLd, sanitizeUrl } from "./sanitize";

export {
  buildSitemapUrls,
  buildSitemapXml,
  buildSitemapIndexXml,
  chunkSitemapUrls,
} from "./sitemap";

export { buildRobotsTxt } from "./robots";

export { buildRssXml, escapeXml } from "./rss";

export {
  buildCanonicalUrl,
  buildPageTitle,
  buildSafeDescription,
  buildRobotsMetaContent,
  buildWebSiteSchema,
  buildDefaultOgImageUrl,
  deepMerge,
} from "./meta";

export { buildLlmsTxt, buildLlmsFullTxt } from "./llms";
export { buildSecurityTxt } from "./security";
export { buildWebManifest } from "./manifest";
export { buildApiCatalog } from "./catalog";
export { buildArticleSchema, buildBreadcrumbSchema } from "./schema";
export { generatePng, generateMaskablePng, generateIco, generateOgCard } from "./assets";

export {
  NOTO_SANS,
  defaultOgLayout,
  loadOgFonts,
  renderOgResponse,
  renderDefaultOg,
  handleOgRequest,
  createHonoOgHandler,
  type OgFontConfig,
  type OgLayoutOptions,
  type OgRenderConfig,
  type OgHandlerOptions,
  type HonoContext,
} from "./og/index";

// The `seo` Vite plugin factory is Node-only, so it is deliberately NOT
// re-exported from this runtime entry point to prevent pulling Node APIs
// into the browser bundle. Import it from `@rimelight/seo/plugin` in your
// `vite.config.ts` instead. The types stay re-exported here because types
// are erased at compile time.
export type { RimelightSeoPluginOptions } from "./plugin";

export type {
  ChangeFreq,
  RobotsOptions,
  RobotsRouteOptions,
  SeoEntry,
  SitemapAlternate,
  SitemapUrl,
  SitemapOptions,
  UserAgentRule,
  BrandingConfig,
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
  SeoConfig,
  OgRouteOptions,
} from "./types";

export { serializeJsonLd, sanitizeUrl } from "./sanitize";

export { buildSitemapUrls, buildSitemapXml, buildSitemapIndexXml } from "./sitemap";
export type { SitemapBuildOptions } from "./sitemap";

export { buildRobotsTxt } from "./robots";

export { buildRssXml } from "./rss";

export {
  buildCanonicalUrl,
  buildPageTitle,
  buildSafeDescription,
  buildRobotsMetaContent,
  buildWebSiteSchema,
  buildDefaultOgImageUrl,
} from "./meta";

export { buildLlmsTxt, buildLlmsFullTxt } from "./llms";
export { buildWebManifest } from "./manifest";
export { buildApiCatalog } from "./catalog";
export { buildArticleSchema, buildBreadcrumbSchema } from "./schema";

export { config as activeConfig } from "virtual:rimelight-seo";

export {
  defaultOgLayout,
  renderOgResponse,
  renderDefaultOg,
  handleOgRequest,
  createHonoOgHandler,
  type OgLayoutOptions,
  type OgRenderConfig,
  type OgHandlerOptions,
  type HonoContext,
} from "./og";

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

import { config as virtualConfig } from "virtual:rimelight-seo";
import type { SeoConfig } from "./types";

const DEFAULT_PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/admin",
  "/cms",
  "/internal",
  "/api",
  "/dev",
  "/og",
  "/open-graph",
  "/auth",
  "/cdn-cgi",
];

export const activeConfig: SeoConfig = {
  privatePathPrefixes: DEFAULT_PRIVATE_PATH_PREFIXES,
  ...virtualConfig,
};

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

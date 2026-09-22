import type { LlmsTxtOptions, LlmsFullTxtOptions } from "./llms.js"

/**
 * Change frequency for sitemap entries
 */
export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"

/**
 * SEO entry — a single page to include in sitemaps
 */
export interface SeoEntry {
  /**
   * Locale-less path, e.g. "/company/blog/hello". Leading slash required.
   */
  path: string
  lastmod?: Date
  changefreq?: ChangeFreq
  priority?: number
  /**
   * Restrict to a subset of locales; defaults to all configured locales.
   */
  locales?: readonly string[]
}

/**
 * Locale configuration for SEO builders
 */
export interface LocaleConfig {
  /**
   * Absolute origin, e.g. "https://rimelight.com"
   */
  site: string
  /**
   * Map of locale segment -> hreflang, e.g. { en: "en-US", pt: "pt-BR" }
   */
  locales: Record<string, string>
  defaultLocale: string
  /**
   * Emit the default locale without a prefix. Default: false.
   */
  prefixDefaultLocale?: boolean
  trailingSlash?: "always" | "never"
}

/**
 * Fully resolved sitemap URL with alternates
 */
export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: number
  alternates?: SitemapAlternate[]
}

/**
 * Language alternate for a sitemap URL
 */
export interface SitemapAlternate {
  hreflang: string
  href: string
}

/**
 * Options for robots.txt generation
 */
export interface RobotsOptions {
  /**
   * The sitemap URL to reference
   */
  sitemapUrl: string
  /**
   * Paths to disallow for all user agents
   */
  disallow?: string[]
  /**
   * Paths to allow for all user agents
   */
  allow?: string[]
  /**
   * User-agent specific rules
   */
  userAgentRules?: UserAgentRule[]
}

/**
 * User-agent specific robots.txt rule
 */
export interface UserAgentRule {
  userAgent: string
  disallow?: string[]
  allow?: string[]
}

export interface OpenGraphMeta {
  type?: string
  locale?: string
  url?: string
  title?: string
  description?: string
  images?: OGImage[] | OGImage
  siteName?: string
  [key: string]: unknown
}

export interface TwitterMeta {
  card?: "summary" | "summary_large_image" | "player" | "app"
  site?: string
  creator?: string
  title?: string
  description?: string
  images?: OGImage[] | OGImage | string
  [key: string]: unknown
}

/**
 * Site identity and SEO defaults shared across all Rimelight Astro sites. The UI-specific overrides
 * (component themes, shortcuts, etc.) live in UIConfig (packages/ui) and are passed directly to the
 * ui() integration.
 */
export interface SiteConfig {
  id: string
  name: string
  description: string
  url: string
  ogImage?: string
  author: string
  email: string
  branding: {
    logo: {
      alt: string
      src?: string
      [key: string]: unknown
    }
    favicon?:
      | {
          svg?: string
          ico?: string
          png?: string
          [key: string]: string | undefined
        }
      | string
    appleTouchIcon?: string
    icons?: WebManifestIcon[]
    icon?: string
    colors: {
      themeColor: string
      backgroundColor: string
    }
    [key: string]: unknown
  }
  seo: {
    titleTemplate: string
    ogImageFallback?: string
    maxDescriptionLength: number
    authorHandle?: string
  }
  openGraph?: OpenGraphMeta
  twitter?: TwitterMeta
}

/**
 * Open Graph image with alt text
 */
export interface OGImage {
  /**
   * Image URL (relative or absolute)
   */
  src: string
  /**
   * Alt text for the image
   */
  alt: string
}

/**
 * RSS feed link configuration
 */
export interface RSSFeed {
  /**
   * RSS feed URL
   */
  href: string
  /**
   * Feed title (defaults to "RSS")
   */
  title?: string
}

/**
 * Props for the RLAHead Astro component. Defined here so consumers can construct head props without
 * importing @rimelight/ui.
 */
export interface HeadProps {
  /**
   * Page title
   */
  title?: string
  /**
   * Page description
   */
  description?: string
  /**
   * Open Graph image with alt text
   */
  ogImage?: OGImage
  /**
   * Open Graph type (e.g., "website", "article")
   */
  ogType?: string
  /**
   * Open Graph locale (defaults to "en_US")
   */
  ogLocale?: string
  /**
   * Whether to prevent indexing
   */
  noindex?: boolean
  /**
   * Whether this is a 404 page
   */
  is404?: boolean
  /**
   * Robots metadata (overrides noindex/is404 logic if provided)
   */
  robots?: string
  /**
   * Canonical URL
   */
  canonical?: string
  /**
   * Current page URL
   */
  url?: string
  /**
   * CSP Nonce for generated inline <script> tags
   */
  nonce?: string
  /**
   * Language alternates for i18n
   */
  languageAlternates?: Array<{ hreflang: string; href: string }>
  /**
   * Custom favicon SVG or image path (overrides config.branding.favicon)
   */
  favicon?: string
  /**
   * Custom Apple Touch Icon path or CDN URL (overrides config.branding.appleTouchIcon)
   */
  appleTouchIcon?: string
  /**
   * Site configuration for defaults
   */
  config?: SiteConfig
  /**
   * Whether to enable View Transitions (ClientRouter)
   */
  transitions?: boolean
  /**
   * Meta charset
   */
  charset?: string
  /**
   * Meta viewport
   */
  viewport?: string
  /**
   * RSS feed configuration
   */
  rssFeed?: RSSFeed
  /**
   * Article or BlogPosting JSON-LD configuration
   */
  articleSchema?: import("./schema.js").ArticleSchemaOptions
  /**
   * Breadcrumb list for JSON-LD structured data
   */
  breadcrumbs?: import("./schema.js").BreadcrumbItem[]
  /**
   * URL for this page's raw Markdown alternate twin
   */
  markdownUrl?: string
  /**
   * Version alternates for multi-version documentation
   */
  versionAlternates?: Array<{ version: string; href: string }>
  /**
   * Whether the title should bypass site title template
   */
  absolute?: boolean
  /**
   * Twitter card type
   */
  twitterCard?: "summary" | "summary_large_image" | "player" | "app"
  /**
   * Open Graph metadata overrides
   */
  openGraph?: OpenGraphMeta
  /**
   * Twitter metadata overrides
   */
  twitter?: TwitterMeta
}

export interface RssItem {
  title: string
  link: string
  pubDate: Date | string | number
  description?: string
  content?: string
  guid?: string
  author?: string
}

export interface RssFeedOptions {
  title: string
  description: string
  site: string
  feedUrl?: string
  language?: string
  items: RssItem[]
}

export interface RssCollectionConfig {
  name: string
  pathPrefix?: string
}

export interface RssOptions extends Omit<Partial<RssFeedOptions>, "items"> {
  /**
   * Custom RSS route pattern (default: "/rss.xml")
   */
  path?: string
  /**
   * Custom items loader or static items array
   */
  items?: RssItem[] | (() => Promise<RssItem[]> | RssItem[])
  /**
   * Collections to include in RSS feed (defaults to ["blog", "posts", "news", "articles"])
   */
  collections?: (string | RssCollectionConfig)[]
}

export interface SitemapOptions {
  /**
   * Sitemap route pattern (default: "/sitemap.xml")
   */
  path?: string
  urls?: SitemapUrl[]
  entries?: () => Promise<SeoEntry[]> | SeoEntry[]
  locales?: LocaleConfig
  [key: string]: unknown
}

export interface SecurityTxtOptions {
  /**
   * Contact URI or list of contact URIs (e.g. "mailto:security@example.com") - REQUIRED by RFC 9116
   */
  contact: string | string[]
  /**
   * Expiration date/time (ISO 8601 string or Date) - REQUIRED by RFC 9116
   */
  expires?: Date | string
  /**
   * URI to PGP/GPG public key
   */
  encryption?: string | string[]
  /**
   * URI to security acknowledgments / hall of fame
   */
  acknowledgments?: string | string[]
  /**
   * Comma-separated list of preferred languages (e.g. "en, pt")
   */
  preferredLanguages?: string
  /**
   * Canonical URI of the security.txt file
   */
  canonical?: string
  /**
   * URI to security policy
   */
  policy?: string
  /**
   * URI to security hiring page
   */
  hiring?: string
  /**
   * URI to Common Security Advisory Framework (CSAF) provider
   */
  csaf?: string
}

export interface SecurityRouteOptions extends Partial<SecurityTxtOptions> {
  /**
   * Route pattern (default: "/.well-known/security.txt")
   */
  path?: string
  /**
   * Whether to also inject legacy fallback route at "/security.txt" (default: true)
   */
  legacyRoute?: boolean
}

export interface WebManifestIcon {
  src: string
  sizes: string
  type: string
  purpose?: "any" | "maskable" | "monochrome"
}

export interface WebManifestShortcut {
  name: string
  url: string
  short_name?: string
  description?: string
  icons?: WebManifestIcon[]
}

export interface WebManifest {
  name: string
  short_name?: string
  description?: string
  start_url: string
  display: "fullscreen" | "standalone" | "minimal-ui" | "browser"
  background_color: string
  theme_color: string
  icons: WebManifestIcon[]
  shortcuts?: WebManifestShortcut[]
  categories?: string[]
  lang?: string
  dir?: "auto" | "ltr" | "rtl"
  orientation?: "any" | "natural" | "landscape" | "portrait"
  scope?: string
  [key: string]: unknown
}

export interface WebManifestOptions {
  name: string
  shortName?: string
  description?: string
  startUrl?: string
  display?: "fullscreen" | "standalone" | "minimal-ui" | "browser"
  backgroundColor?: string
  themeColor?: string
  icons?: WebManifestIcon[]
  shortcuts?: WebManifestShortcut[]
  categories?: string[]
  lang?: string
  dir?: "auto" | "ltr" | "rtl"
  orientation?: "any" | "natural" | "landscape" | "portrait"
  scope?: string
}

export interface ManifestRouteOptions extends Partial<WebManifestOptions> {
  /**
   * Route pattern (default: "/site.webmanifest")
   */
  path?: string
}

export interface ApiCatalogItem {
  rel: string
  href: string
  type?: string
  title?: string
  [key: string]: unknown
}

export interface ApiCatalog {
  "api-catalog": ApiCatalogItem[]
}

export interface ApiCatalogOptions {
  items: ApiCatalogItem[]
}

export interface ApiCatalogRouteOptions extends Partial<ApiCatalogOptions> {
  /**
   * Route pattern (default: "/.well-known/api-catalog")
   */
  path?: string
}

export interface RobotsRouteOptions extends Partial<RobotsOptions> {
  /**
   * Route pattern (default: "/robots.txt")
   */
  path?: string
}

export interface LlmsRouteOptions extends Partial<LlmsTxtOptions> {
  /**
   * Route pattern (default: "/llms.txt")
   */
  path?: string
}

export interface LlmsFullRouteOptions extends Partial<LlmsFullTxtOptions> {
  /**
   * Route pattern (default: "/llms-full.txt")
   */
  path?: string
}

export interface AssetRouteOptions {
  /**
   * Path to the master SVG/PNG icon file (relative to project root or absolute). If omitted, will
   * search in src/assets/logos/ or siteConfig.branding.icon.
   */
  icon?: string
  /**
   * Background color for maskable icons (defaults to siteConfig.branding.colors.backgroundColor or
   * #ffffff)
   */
  backgroundColor?: string
  /**
   * Whether to inject /favicon.ico (default: true)
   */
  faviconIco?: boolean
  /**
   * Whether to inject /apple-touch-icon.png (default: true)
   */
  appleTouchIcon?: boolean
  /**
   * Whether to inject /icon-192.png (default: true)
   */
  icon192?: boolean
  /**
   * Whether to inject /icon-512.png (default: true)
   */
  icon512?: boolean
  /**
   * Whether to inject /icon-maskable-512.png (default: true)
   */
  iconMaskable?: boolean
  /**
   * Whether to generate and emit /og.png branded card (default: true)
   */
  ogImage?: boolean
}

export interface RimelightSeoOptions {
  /**
   * Site identifier / domain (e.g. "rimelight.com")
   */
  id?: string
  /**
   * Primary site name (e.g. "Rimelight")
   */
  name?: string
  /**
   * Default site description
   */
  description?: string
  /**
   * Canonical origin URL (e.g. "https://rimelight.com")
   */
  url?: string
  ogImage?: string
  author?: string
  email?: string
  branding?: Partial<SiteConfig["branding"]>
  titleTemplate?: string
  maxDescriptionLength?: number
  authorHandle?: string
  openGraph?: OpenGraphMeta
  twitter?: TwitterMeta
  /**
   * Full or partial SiteConfig object
   */
  site?: Partial<SiteConfig>
  /**
   * Locale mappings for hreflang / sitemaps
   */
  locales?: LocaleConfig | Record<string, string>
  /**
   * Path prefixes to exclude from sitemap and indexing
   */
  privatePathPrefixes?: string[]
  /**
   * Custom SEO entry generator function
   */
  entries?: () => Promise<SeoEntry[]> | SeoEntry[]
  /**
   * Sitemap configuration or false to disable automatic /sitemap.xml (default: true)
   */
  sitemap?: boolean | SitemapOptions
  /**
   * Robots.txt configuration or false to disable automatic /robots.txt (default: true)
   */
  robots?: boolean | RobotsRouteOptions
  /**
   * RSS feed configuration or false to disable automatic /rss.xml (default: true)
   */
  rss?: boolean | RssOptions
  /**
   * LLMs.txt configuration or false to disable automatic /llms.txt (default: true)
   */
  llms?: boolean | LlmsRouteOptions
  /**
   * LLMs-full.txt configuration or false to disable automatic /llms-full.txt (default: true)
   */
  llmsFull?: boolean | LlmsFullRouteOptions
  /**
   * Security.txt configuration or false to disable automatic /.well-known/security.txt (default:
   * true)
   */
  security?: boolean | SecurityRouteOptions
  /**
   * RFC 9652 API Catalog configuration or false to disable automatic /.well-known/api-catalog
   * (default: true)
   */
  apiCatalog?: boolean | ApiCatalogRouteOptions
  /**
   * Web App Manifest configuration or false to disable automatic /site.webmanifest (default: true)
   */
  manifest?: boolean | ManifestRouteOptions
  /**
   * Automatic generation of compliant public image assets (favicon.ico, apple-touch-icon.png, PWA
   * icons) from a single master icon (default: true)
   */
  assets?: boolean | AssetRouteOptions
  /**
   * Open Graph image route configuration, or false to disable automatic /open-graph/[...route].png
   * (default: true). When enabled, the route reads brand/background from seo.name and injects a
   * handler that supports query-param overrides and optional DB slug lookup.
   */
  og?: boolean | OgRouteOptions
}

/**
 * Configuration for the auto-injected /open-graph/[...route].png route.
 */
export interface OgRouteOptions {
  /**
   * Route pattern for the OG image handler.
   *
   * @default "/open-graph/[...route].png"
   */
  path?: string
  /**
   * Brand name shown top-left of every OG image. Defaults to seo.name / site.name from integration
   * config.
   */
  brand?: string
  /**
   * Background style used for standard pages.
   *
   * @default "dark"
   */
  defaultBackground?: "dark" | "gradient" | (string & {})
  /**
   * Background style used when ?isDocs=true or the route segment contains "docs".
   *
   * @default "gradient"
   */
  docsBackground?: "dark" | "gradient" | (string & {})
}

export type { LlmsPage, LlmsTxtOptions, LlmsFullTxtOptions } from "./llms.js"
export type { ArticleSchemaOptions, BreadcrumbItem } from "./schema.js"

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
  ogImage: string
  author: string
  email: string
  branding: {
    logo: {
      alt: string
    }
    favicon: {
      svg: string
    }
    colors: {
      themeColor: string
      backgroundColor: string
    }
  }
  seo: {
    titleTemplate: string
    ogImageFallback: string
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
   * Language alternates for i18n
   */
  languageAlternates?: Array<{ hreflang: string; href: string }>
  /**
   * Custom favicon SVG or image path (overrides config.branding.favicon.svg)
   */
  favicon?: string
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

export interface RssOptions extends Partial<RssFeedOptions> {
  /**
   * Custom RSS route pattern (default: "/rss.xml")
   */
  path?: string
  /**
   * Custom items loader
   */
  items?: RssItem[]
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

export interface RimelightSeoOptions {
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
}

export type { LlmsPage, LlmsTxtOptions, LlmsFullTxtOptions } from "./llms.js"
export type { ArticleSchemaOptions, BreadcrumbItem } from "./schema.js"


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

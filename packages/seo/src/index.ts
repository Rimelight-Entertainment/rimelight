export type {
  ChangeFreq,
  LocaleConfig,
  RobotsOptions,
  SeoEntry,
  SitemapAlternate,
  SitemapUrl,
  UserAgentRule
} from "./types.js"

export {
  buildSitemapUrls,
  buildSitemapXml,
  buildSitemapIndexXml,
  chunkSitemapUrls
} from "./sitemap.js"

export { buildRobotsTxt } from "./robots.js"

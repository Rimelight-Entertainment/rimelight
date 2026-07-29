import type { APIRoute } from "astro"

const getRobotsTxt = (sitemapURL: URL) => `\
User-agent: GPTBot
Disallow: /dashboard/
Disallow: /internal/
Disallow: /*/dashboard/
Disallow: /*/internal/
Allow: /

User-agent: ClaudeBot
Disallow: /dashboard/
Disallow: /internal/
Disallow: /*/dashboard/
Disallow: /*/internal/
Allow: /

User-agent: *
Disallow: /dashboard/
Disallow: /internal/
Disallow: /*/dashboard/
Disallow: /*/internal/
Allow: /


Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site)
  return new Response(getRobotsTxt(sitemapURL))
}

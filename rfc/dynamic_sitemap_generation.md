# RFC: Fixing Sitemap Generation for SSR-Only Astro Sites

- **Status**: Draft
- **Author(s)**: Devin (Coding Assistant)
- **Created**: 2026-08-02
- **Last Updated**: 2026-08-02

---

## 1. Summary

Both `rimelight.com` and `starter.rimelight.com` ship `@astrojs/sitemap`, configured with i18n locale maps, and both publish a sitemap containing **exactly one URL**. The integration builds its URL list at build time from prerendered pages and statically-known routes; our sites are `output: "server"` with every page under `src/pages/[locale]/…`, so neither source yields anything.

This RFC documents the root cause, evaluates three fixes (keep the integration and feed it `customPages`; hand-roll SSR routes; a hybrid), and proposes a **generic, app-agnostic `@rimelight/seo` package** exposing pure URL/XML builders that can drive either delivery mechanism, so each site picks the mechanism its content model requires.

---

## 2. Motivation

### 2.1. Evidence

Fetched from production on 2026-08-02:

```xml
<!-- https://rimelight.com/sitemap-0.xml -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ...>
  <url><loc>https://rimelight.com/</loc></url>
</urlset>
```

`starter.rimelight.com/sitemap-0.xml` is identical modulo the host. The single entry is `src/pages/index.astro`, an empty i18n redirect page. Every blog post, doc page, legal document and wiki page is absent.

### 2.2. Root cause

`@astrojs/sitemap@3.7.3` collects URLs in `astro:build:done` from two sources:

```js
// node_modules/@astrojs/sitemap/dist/index.js
"astro:build:done": async ({ dir, pages, logger }) => {
  let pageUrls = pages.filter(...)                 // (1) prerendered pages only
  const addRouteUrl = (urls, r) => {
    if (r.pathname) { /* … */ }                    // (2) routes with a static pathname only
  }
  const routeUrls = _routes.reduce((urls, r) => {
    if (r.type !== "page") return urls
    addRouteUrl(urls, r)
    …
```

Against our configuration:

| Source | Our result |
| --- | --- |
| `pages` (prerendered) | empty — the only `prerender = true` module is `pages/open-graph/[...route].png.ts`, which is an endpoint, not a `page` route |
| `_routes` with static `pathname` | only `/` — every content route is `src/pages/[locale]/…`, and a route with a dynamic segment has `pathname === undefined` |

The `i18n: { defaultLocale, locales }` option in both `astro.config.ts` files therefore never applies to anything.

This is structural, not a tuning problem, and it gets worse with `rfc/cms_d1_migration.md`: wiki content already lives in the `pages` table and cannot be known at build time at all.

### 2.3. Goals

- Every public, indexable URL of a Rimelight Astro site appears in its sitemap, in every locale, with reciprocal `hreflang` alternates.
- The URL catalog is derived from typed sources (route registries, content collections, DB queries) — never a hand-maintained XML file.
- The logic is a shared, generic package: the seven Astro projects in the ecosystem should not each re-solve this.
- The core is pure and unit-testable (the repo currently has **zero** test files, despite `vp test` and the vitest lint plugin being configured).

### 2.4. Non-goals

- Replacing `@astrojs/sitemap` for sites where it already works (static/prerendered projects).
- Image/video/news sitemap extensions.

---

## 3. Options considered

### 3.1. Option A — keep `@astrojs/sitemap`, feed it `customPages`

The integration is more configurable than the current usage suggests. Its full option surface (3.7.3):

```ts
type SitemapOptions = {
  filenameBase?: string
  filter?(page: string): boolean
  customPages?: string[]         // absolute URLs injected into the list
  customSitemaps?: string[]      // extra <sitemap> entries in the index
  i18n?: { defaultLocale: string; locales: Record<string, string> }
  entryLimit?: number            // default 45000
  changefreq?: ChangeFreq
  lastmod?: Date                 // global, not per-URL
  priority?: number
  serialize?(item: SitemapItem): SitemapItem | Promise<SitemapItem | undefined> | undefined
  xslURL?: string
  chunks?: Record<string, (item: SitemapItem) => SitemapItem | Promise<SitemapItem | undefined> | undefined>
  namespaces?: { news?: boolean; xhtml?: boolean; image?: boolean; video?: boolean }
}
```

`customPages` is the missing piece: injected URLs are merged before `generateSitemap`, so they receive the same treatment as discovered ones — including i18n alternates, which are computed by parsing the locale prefix out of each URL:

```js
// dist/generate-sitemap.js — alternates are derived from the URL list itself
const parsedI18nUrls = urls.map((url) => parseI18nUrl(url, defaultLocale, locales, finalSiteUrl))
// URLs sharing the same locale-stripped path become each other's <xhtml:link> alternates
```

So a config like the following would produce a correct, fully-localized sitemap:

```ts
sitemap({
  i18n: { defaultLocale: "en", locales: { en: "en-US", pt: "pt-BR" } },
  customPages: await buildSiteUrls(),                       // registries + content collections
  filter: (url) => !PRIVATE_PREFIXES.some((p) => url.includes(p)),
  serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) })   // per-URL lastmod
})
```

`astro.config.ts` is ESM and may `await` at module scope, so `customPages` can be produced by reading `src/content/**` and the docs registry directly.

**Pros**

- No new route, no new delivery mechanism; XML generation, chunking (`entryLimit`, `chunks`), the sitemap index, and hreflang stay in a maintained upstream package.
- Output is a static asset — zero request-time cost, no Worker CPU, no cache-invalidation question.
- Smallest diff for `starter.rimelight.com`, whose content is 100% file-based.

**Cons**

- **Build-time only.** D1/CMS-backed pages (`pages` table, the wiki, anything published through the editor) cannot appear until the next deploy. This directly contradicts the direction of `rfc/cms_d1_migration.md`.
- Content collections must be read outside Astro's loader in `astro.config.ts` (raw `fs`/globbing or a small loader shim), duplicating a little of what `getCollection` does.
- `lastmod` is global unless you go through `serialize`, which means holding a URL→date map in module scope.
- No `x-default` alternate (the upstream link builder emits only the configured locales).
- The failure mode is silent: it warns "No pages found!" to the build log and moves on — which is precisely how we shipped an empty sitemap without noticing.

### 3.2. Option B — hand-rolled SSR route (the blog post's pattern)

`src/pages/sitemap.xml.ts` returns XML built at request time from the same registries plus live DB queries.

**Pros**

- Always current: CMS/D1 pages appear the moment they are published.
- Total control (per-URL `lastmod`, `x-default`, custom chunking, per-section sitemaps).
- The builder is a pure function → real unit tests.

**Cons**

- We own XML escaping, chunking, the 50k/50MB limits, and the sitemap index.
- Request-time cost on Cloudflare (mitigated by `Cache-Control` + the existing cache provider).
- Two mechanisms to keep in sync if some sites keep the integration.

### 3.3. Option C — hybrid (recommended)

Extract the catalog into a shared package whose **core is pure and delivery-agnostic**, then let each site choose:

- `starter.rimelight.com` (file-based content only) → integration + `customPages` (Option A).
- `rimelight.com` (file-based **and** D1-backed wiki) → SSR route (Option B), or the integration for build-time content plus a second `customSitemaps`-registered SSR sitemap for DB content.

The expensive, error-prone part — enumerating URLs across locales with correct alternates — is written once either way.

---

## 4. Proposed design

### 4.1. `@rimelight/seo` — generic by construction

The package must be usable by any Astro site (including non-Rimelight ones): it takes a site URL, a locale config and a list of entries, and returns URLs or XML. It imports nothing from `@rimelight/ui`, no site config, no DB, no Astro runtime.

```ts
// packages/seo/src/types.ts
export interface SeoEntry {
  /** Locale-less path, e.g. "/company/blog/hello". Leading slash required. */
  path: string
  lastmod?: Date
  changefreq?: ChangeFreq
  priority?: number
  /** Restrict to a subset of locales; defaults to all configured locales. */
  locales?: readonly string[]
}

export interface LocaleConfig {
  /** Absolute origin, e.g. "https://rimelight.com" */
  site: string
  /** Map of locale segment -> hreflang, e.g. { en: "en-US", pt: "pt-BR" } */
  locales: Record<string, string>
  defaultLocale: string
  /** Emit the default locale without a prefix. Default: false. */
  prefixDefaultLocale?: boolean
  trailingSlash?: "always" | "never"
}
```

```ts
// packages/seo/src/sitemap.ts — pure
export function buildSitemapUrls(entries: SeoEntry[], config: LocaleConfig): SitemapUrl[]
export function buildSitemapXml(urls: SitemapUrl[]): string
export function buildSitemapIndexXml(sitemapUrls: string[]): string
export function chunkSitemapUrls(urls: SitemapUrl[], limit?: number): SitemapUrl[][]
```

```ts
// packages/seo/src/robots.ts — pure
export function buildRobotsTxt(options: RobotsOptions): string
```

Adapters are thin and optional, so the pure core stays dependency-free:

```ts
// @rimelight/seo/astro  — Option A users
export function sitemapCustomPages(entries: SeoEntry[], config: LocaleConfig): string[]

// @rimelight/seo/route  — Option B users
export function createSitemapRoute(loader: () => Promise<SeoEntry[]>, config: LocaleConfig): APIRoute
export function createRobotsRoute(options: RobotsOptions): APIRoute
```

### 4.2. Entry sources

Nothing here is invented; each source already exists in the repo.

| Source | Where | `lastmod` |
| --- | --- | --- |
| Static marketing/company paths | new `STATIC_PATHS` const array per app | — |
| Docs pages | `src/config/docs.config.ts` (already a typed registry with `/{locale}/…` hrefs) | collection `updatedDate` |
| Blog / legal / docs entries | `getCollection()` (`src/content.config.ts`) | `data.updatedDate ?? data.pubDate` |
| Wiki / CMS pages | `pages` table (Drizzle, `slug`, `postedAt`, `updatedAt`, `deletedAt`) | `updatedAt` |

Private prefixes (`/dashboard`, `/admin`, `/internal`, `/api`, `/dev`, `/og`, `/open-graph`) are excluded by a single shared deny-list that also feeds `buildRobotsTxt`, so robots and sitemap cannot drift apart.

### 4.3. Usage

Option A site (`starter.rimelight.com`):

```ts
// astro.config.ts
import sitemap from "@astrojs/sitemap"
import { sitemapCustomPages } from "@rimelight/seo/astro"
import { seoEntries, SEO_LOCALES } from "./src/config/seo.config"

sitemap({
  i18n: { defaultLocale: "en", locales: { en: "en-US", pt: "pt-BR" } },
  customPages: sitemapCustomPages(await seoEntries(), SEO_LOCALES),
  filter: (url) => !isPrivatePath(url)
})
```

Option B site (`rimelight.com`):

```ts
// src/pages/sitemap.xml.ts
import type { APIRoute } from "astro"
import { buildSitemapUrls, buildSitemapXml } from "@rimelight/seo"
import { SEO_LOCALES, seoEntries } from "@/config/seo.config"

export const GET: APIRoute = async (ctx) => {
  const xml = buildSitemapXml(buildSitemapUrls(await seoEntries(ctx.locals), SEO_LOCALES))
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
```

`robots.txt.ts` in both apps collapses to `createRobotsRoute({ … })`, removing the ~95% duplication between the two current copies.

### 4.4. Testing

`buildSitemapUrls` / `buildSitemapXml` / `buildRobotsTxt` are pure, so this becomes the first vitest suite in the monorepo:

- every `STATIC_PATHS` entry is present, in every locale;
- alternates are reciprocal and include `x-default`;
- private prefixes never appear;
- XML escaping of `&`, `<`, quotes;
- **total URL count** asserted against an expected number — the only assertion that would have caught the current bug;
- a drift guard: enumerate `src/pages/[locale]/**` and fail if a public page is missing from the catalog.

---

## 5. Secondary issues to fix alongside

1. **No `hreflang` on pages.** `RLAHead.astro` accepts `languageAlternates`, but no page or layout passes it. Should be derived from the same locale config in `AppLayout`/`DashboardLayout`.
2. **`robots.txt` gaps.** Neither app disallows `/api/` (rimelight.com serves `pages/api/[...path].ts`) or the OG preview routes (`/og/`, `/open-graph/`). `Allow: /` after the `Disallow` block is a no-op. (`/dev/` is already handled at runtime by `devOnly` in `@rimelight/security`, but belongs in the deny-list for consistency.)
3. **No `noindex` on private areas.** `/dashboard/**` relies solely on robots.txt, which prevents crawling but not indexing of linked URLs; the dashboard layouts should default `noindex`.
4. **`rss.xml.js` is en-only** and hardcodes `/en/company/blog/…`. It has the same "URL catalog" shape and should read from the same entry source.
5. **Sitemap path.** `robots.txt.ts` points at `sitemap-index.xml`. Whichever option is chosen, the advertised path must keep resolving (serve the dynamic sitemap at `sitemap-index.xml`, or update robots and re-submit in Search Console).
6. **Fail loudly.** If the catalog produces fewer than N URLs, fail the build/test rather than emitting a near-empty sitemap.

---

## 6. Drawbacks & trade-offs

- A new workspace package (~200 LOC + tests) to maintain, for a problem two of seven sites have today.
- Option A keeps us dependent on the integration's build-time model; Option B moves XML correctness in-house.
- The hybrid means two delivery paths coexist, though only one code path builds the URLs.
- Reading content collections from `astro.config.ts` (Option A) is slightly off Astro's happy path.

---

## 7. Rollout

1. `packages/seo` with pure builders + vitest suite.
2. Adopt in `starter.rimelight.com` (Option A) — it is the template every new site inherits.
3. Adopt in `rimelight.com` (Option B, incl. D1 wiki entries); ensure the old `sitemap-index.xml` path still resolves and remove `@astrojs/sitemap` if it is no longer the producer.
4. Secondary fixes from §5.
5. Re-submit both sitemaps in Search Console and verify indexed-URL counts.

---

## 8. Open questions

- Do we standardize on one option across all seven Astro sites, or keep per-site choice? (Uniformity is cheaper to maintain; Option A is cheaper to run.)
- Should wiki pages be in the sitemap at all before the CMS migration settles, and what marks a `pages` row as publicly indexable (`postedAt != null && deletedAt == null`)?
- `priority`/`changefreq`: emit them at all? Google ignores both; omitting keeps the file smaller.

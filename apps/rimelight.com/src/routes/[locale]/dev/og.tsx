import { For, Show, createSignal } from "solid-js";
import { type JSX } from "@solidjs/web";
import DevLayout from "#layouts/DevLayout";
import { RLButton } from "@rimelight/ui";
import { createSeoHead, type HeadTag } from "@rimelight/seo/head";
import {
  buildApiCatalog,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildCanonicalUrl,
  buildDefaultOgImageUrl,
  buildLlmsTxt,
  buildPageTitle,
  buildRobotsTxt,
  buildRobotsMetaContent,
  buildRssXml,
  buildSafeDescription,
  buildSecurityTxt,
  buildSitemapUrls,
  buildSitemapXml,
  buildWebManifest,
  buildWebSiteSchema,
  escapeHtml,
  sanitizeUrl,
  serializeJsonLd,
  type SiteConfig,
} from "@rimelight/seo";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_SITE = "https://rimelight.com";

const DEMO_LOCALE_CONFIG = {
  site: DEMO_SITE,
  locales: { en: "en-US", pt: "pt-BR" },
  defaultLocale: "en",
};

const DEMO_ENTRIES = [
  { path: "/", priority: 1.0 },
  { path: "/company", priority: 0.8 },
  { path: "/products", priority: 0.8 },
];

const DEMO_SITE_CONFIG: SiteConfig = {
  id: "rimelight",
  name: "Rimelight Entertainment",
  url: DEMO_SITE,
  description: "Creating interactive entertainment and software tools.",
  author: "Rimelight Entertainment",
  email: "support@rimelight.com",
  branding: {
    logo: { alt: "Rimelight Logo" },
    colors: {
      themeColor: "#8b5cf6",
      backgroundColor: "#0a0a0a",
    },
  },
  seo: {
    titleTemplate: "%s | Rimelight",
    maxDescriptionLength: 160,
  },
};

const DEMO_HEAD = createSeoHead({
  title: "Grand Tale",
  description: "The ultimate interactive fiction engine.",
  ogType: "website",
  url: `${DEMO_SITE}/products/grand-tale`,
  noindex: false,
  config: DEMO_SITE_CONFIG,
});

const DEMO_RSS_OPTIONS = {
  title: "Rimelight Blog",
  description: "News and updates from Rimelight Entertainment.",
  site: DEMO_SITE,
  feedUrl: `${DEMO_SITE}/rss.xml`,
  items: [
    {
      title: "Announcing Grand Tale v2",
      link: "/blog/grand-tale-v2",
      pubDate: new Date("2026-09-01"),
      description: "A look at what's new in our biggest update yet.",
    },
    {
      title: "Open-sourcing Rimelight UI",
      link: "/blog/open-source-ui",
      pubDate: new Date("2026-08-15"),
      description: "Our design system is now fully open source.",
    },
  ],
};

const DEMO_LLMS = {
  site: DEMO_SITE,
  title: "Rimelight Documentation",
  description: "Developer reference for Rimelight integrations.",
  pages: [
    {
      title: "Getting Started",
      url: `${DEMO_SITE}/docs`,
      description: "Install, configure, and ship.",
      section: "Docs",
    },
    {
      title: "API Reference",
      url: `${DEMO_SITE}/docs/api`,
      description: "Full HTTP and SDK reference.",
      section: "Docs",
    },
  ],
};

const DEMO_MANIFEST = {
  name: "Rimelight Entertainment",
  shortName: "Rimelight",
  description: "Creating interactive entertainment and software tools.",
  themeColor: "#8b5cf6",
  backgroundColor: "#0a0a0a",
};

const DEMO_ARTICLE = {
  type: "BlogPosting" as const,
  title: "Announcing Grand Tale v2",
  description: "A look at what's new in our biggest update yet.",
  url: `${DEMO_SITE}/blog/grand-tale-v2`,
  datePublished: new Date("2026-09-01"),
  authorName: "Rimelight Team",
  publisherName: "Rimelight Entertainment",
};

const DEMO_BREADCRUMBS = [
  { name: "Home", url: DEMO_SITE },
  { name: "Blog", url: `${DEMO_SITE}/blog` },
  { name: "Announcing Grand Tale v2", url: `${DEMO_SITE}/blog/grand-tale-v2` },
];

const DEMO_SECURITY = {
  contact: "mailto:security@rimelight.com",
  preferredLanguages: "en, pt",
  policy: `${DEMO_SITE}/.well-known/security.txt`,
};

const DEMO_API_CATALOG = {
  items: [
    { rel: "service-desc", href: `${DEMO_SITE}/api/openapi.json`, type: "application/json" },
    { rel: "describedby", href: `${DEMO_SITE}/docs/api`, type: "text/html" },
  ],
};

// ---------------------------------------------------------------------------
// OG preview pages data
// ---------------------------------------------------------------------------

interface OgPageItem {
  label: string;
  title: string;
  description: string;
  type: string;
  isDocs: boolean;
}

const OG_PAGES: OgPageItem[] = [
  {
    label: "Home",
    title: "Rimelight Entertainment",
    description: "Tell your story.",
    type: "",
    isDocs: false,
  },
  {
    label: "Company",
    title: "About Rimelight",
    description: "Creating interactive entertainment and software tools.",
    type: "Company",
    isDocs: false,
  },
  {
    label: "Products",
    title: "Rimelight Products & Games",
    description: "Explore Grand Tale and our ecosystem of open-source tools.",
    type: "Products",
    isDocs: false,
  },
  {
    label: "Docs — Overview",
    title: "Getting Started",
    description: "Everything you need to get up and running with Rimelight.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Docs — API Reference",
    title: "API Reference",
    description: "Complete API reference for Rimelight integrations.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Blog Post",
    title: "Announcing Grand Tale v2",
    description: "A look at what's new in our biggest update yet.",
    type: "Blog Post",
    isDocs: false,
  },
];

function ogUrl(page: OgPageItem) {
  const params = new URLSearchParams({
    title: page.title,
    description: page.description,
    ...(page.type ? { type: page.type } : {}),
    ...(page.isDocs ? { isDocs: "true" } : {}),
  });
  return `/open-graph/page.png?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DevSeoPage() {
  const [sandboxTitle, setSandboxTitle] = createSignal("My Custom Page Title");
  const [sandboxDesc, setSandboxDesc] = createSignal("A short description of this page.");
  const [sandboxType, setSandboxType] = createSignal("");
  const [sandboxDocs, setSandboxDocs] = createSignal(false);
  const [copiedOg, setCopiedOg] = createSignal<string | null>(null);

  const sandboxUrl = () => {
    const params = new URLSearchParams({ title: sandboxTitle(), description: sandboxDesc() });
    if (sandboxType()) params.set("type", sandboxType());
    if (sandboxDocs()) params.set("isDocs", "true");
    return `/open-graph/page.png?${params.toString()}`;
  };

  const copyOgUrl = async (url: string) => {
    const full = new URL(url, window.location.origin).toString();
    await navigator.clipboard.writeText(full);
    setCopiedOg(url);
    setTimeout(() => setCopiedOg(null), 2000);
  };

  // Computed demo values
  const sitemapUrls = buildSitemapUrls(DEMO_ENTRIES, DEMO_LOCALE_CONFIG);
  const sitemapXml = buildSitemapXml(sitemapUrls);
  const robotsTxt = buildRobotsTxt({
    sitemapUrl: `${DEMO_SITE}/sitemap.xml`,
    disallow: ["/api/", "/dev/", "/_/"],
    allow: ["/api/public/"],
  });
  const rssXml = buildRssXml(DEMO_RSS_OPTIONS);
  const llmsTxt = buildLlmsTxt(DEMO_LLMS);
  const manifest = buildWebManifest(DEMO_MANIFEST);
  const articleSchema = buildArticleSchema(DEMO_ARTICLE);
  const breadcrumbSchema = buildBreadcrumbSchema(DEMO_BREADCRUMBS);
  const securityTxt = buildSecurityTxt(DEMO_SECURITY);
  const apiCatalog = buildApiCatalog(DEMO_API_CATALOG);
  const websiteSchema = buildWebSiteSchema(DEMO_SITE_CONFIG);
  const headHtml = DEMO_HEAD.html;

  const sections = (): {
    title: string;
    mono?: boolean;
    output?: string;
    rows: {
      label?: string;
      mono?: boolean;
      code?: string;
      description?: string;
      value?: string;
      content?: JSX.Element;
    }[];
  }[] => [
    // ── 1. Head / Meta ────────────────────────────────────────────────────
    {
      title: "createSeoHead()",
      mono: true,
      output: headHtml,
      rows: [
        {
          label: "Resolved tags",
          code: `createSeoHead({ title, description, ogType, url, noindex })`,
          description:
            "Builds the full set of strongly-typed head tags from props — title, canonical, OG, Twitter cards, JSON-LD, icons, and manifest link.",
          value: DEMO_HEAD.tags
            .map((t: HeadTag) => {
              if (t.tag === "title") return "<title>";
              if (t.tag === "meta") {
                const p = t.props as Record<string, string | undefined>;
                if (p["name"]) return `<meta name="${p["name"]}">`;
                if (p["property"]) return `<meta property="${p["property"]}">`;
                if (p["charset"]) return `<meta charset="${p["charset"]}">`;
                return "<meta>";
              }
              if (t.tag === "link") {
                const p = t.props as Record<string, string | undefined>;
                return `<link rel="${p["rel"]}">`;
              }
              if (t.tag === "script") {
                const p = t.props as Record<string, string | undefined>;
                return `<script type="${p["type"] || "text/javascript"}">`;
              }
              return `<${t.tag}>`;
            })
            .join("\n"),
        },
      ],
    },
    // ── 2. buildPageTitle ─────────────────────────────────────────────────
    {
      title: "buildPageTitle()",
      mono: true,
      rows: [
        {
          label: "Normal page",
          code: `buildPageTitle({ title: "Grand Tale", siteName: "Rimelight", titleTemplate: "%s | Rimelight" })`,
          description: "Interpolates %s in the template with the page title.",
          value: buildPageTitle({
            title: "Grand Tale",
            siteName: "Rimelight",
            titleTemplate: "%s | Rimelight",
          }),
        },
        {
          label: "Untitled page",
          code: `buildPageTitle({ siteName: "Rimelight", titleTemplate: "%s | Rimelight" })`,
          description: "Falls back to siteName when no page title is provided.",
          value: buildPageTitle({ siteName: "Rimelight", titleTemplate: "%s | Rimelight" }),
        },
        {
          label: "404 page",
          code: `buildPageTitle({ is404: true, siteName: "Rimelight", titleTemplate: "%s | Rimelight" })`,
          description: "Always emits the standard 404 pattern regardless of template.",
          value: buildPageTitle({
            is404: true,
            siteName: "Rimelight",
            titleTemplate: "%s | Rimelight",
          }),
        },
        {
          label: "Absolute title",
          code: `buildPageTitle({ title: "Custom Exact Title", absolute: true, siteName: "Rimelight", titleTemplate: "%s | Rimelight" })`,
          description: "Bypasses the title template entirely — title used verbatim.",
          value: buildPageTitle({
            title: "Custom Exact Title",
            absolute: true,
            siteName: "Rimelight",
            titleTemplate: "%s | Rimelight",
          }),
        },
      ],
    },
    // ── 3. buildSafeDescription ───────────────────────────────────────────
    {
      title: "buildSafeDescription()",
      mono: true,
      rows: [
        {
          label: "Short description (≤160 chars)",
          code: `buildSafeDescription("Tell your story.", 160)`,
          description: "Passes through unchanged when within the max length.",
          value: buildSafeDescription("Tell your story.", 160),
        },
        {
          label: "Long description (truncated)",
          code: `buildSafeDescription("A very long description that exceeds the limit...", 40)`,
          description: "Truncates at maxLength − 3 and appends ellipsis.",
          value: buildSafeDescription(
            "A very long description that exceeds the configured limit by quite a few characters.",
            40,
          ),
        },
      ],
    },
    // ── 4. buildRobotsMetaContent ─────────────────────────────────────────
    {
      title: "buildRobotsMetaContent()",
      mono: true,
      rows: [
        {
          label: "Indexable page",
          code: `buildRobotsMetaContent({ noindex: false })`,
          description:
            "Emits the full index directive including max-image-preview for large image previews.",
          value: buildRobotsMetaContent({ noindex: false }),
        },
        {
          label: "noindex page",
          code: `buildRobotsMetaContent({ noindex: true })`,
          description: "Signals crawlers to skip this page entirely.",
          value: buildRobotsMetaContent({ noindex: true }),
        },
        {
          label: "404 page",
          code: `buildRobotsMetaContent({ is404: true })`,
          description: "404 is always treated as noindex, nofollow.",
          value: buildRobotsMetaContent({ is404: true }),
        },
        {
          label: "Override",
          code: `buildRobotsMetaContent({ override: "noindex, follow" })`,
          description: "Explicit override bypasses all automatic logic.",
          value: buildRobotsMetaContent({ override: "noindex, follow" }),
        },
      ],
    },
    // ── 5. buildCanonicalUrl ──────────────────────────────────────────────
    {
      title: "buildCanonicalUrl()",
      mono: true,
      rows: [
        {
          label: "Root path",
          code: `buildCanonicalUrl("/", "https://rimelight.com")`,
          description: "Trailing slash is preserved on root paths.",
          value: buildCanonicalUrl("/", DEMO_SITE),
        },
        {
          label: "Deep path",
          code: `buildCanonicalUrl("/blog/grand-tale-v2", "https://rimelight.com")`,
          description: "Appends trailing slash to clean paths per canonical convention.",
          value: buildCanonicalUrl("/blog/grand-tale-v2", DEMO_SITE),
        },
        {
          label: "With query params",
          code: `buildCanonicalUrl("/search?q=grand+tale", "https://rimelight.com")`,
          description: "Query strings are preserved; trailing slash removed.",
          value: buildCanonicalUrl("/search?q=grand+tale", DEMO_SITE),
        },
      ],
    },
    // ── 6. buildDefaultOgImageUrl ─────────────────────────────────────────
    {
      title: "buildDefaultOgImageUrl()",
      mono: true,
      rows: [
        {
          label: "With title + description",
          code: `buildDefaultOgImageUrl({ title: "Grand Tale", description: "Tell your story.", siteName: "Rimelight" })`,
          description:
            "Generates the dynamic OG image URL pointing to /open-graph/page.png with query params.",
          value: buildDefaultOgImageUrl({
            title: "Grand Tale",
            description: "Tell your story.",
            siteName: "Rimelight",
          }),
        },
        {
          label: "Title only",
          code: `buildDefaultOgImageUrl({ title: "Grand Tale" })`,
          value: buildDefaultOgImageUrl({ title: "Grand Tale" }),
        },
        {
          label: "No args",
          code: `buildDefaultOgImageUrl({})`,
          description: "Falls back to bare /open-graph/page.png.",
          value: buildDefaultOgImageUrl({}),
        },
      ],
    },
    // ── 7. buildWebSiteSchema ─────────────────────────────────────────────
    {
      title: "buildWebSiteSchema()",
      mono: true,
      rows: [
        {
          label: "WebSite JSON-LD",
          code: `buildWebSiteSchema({ name, url, description })`,
          description:
            "Emits a Schema.org WebSite node for site-wide structured data; should be injected on every page.",
          value: JSON.stringify(websiteSchema, null, 2),
        },
      ],
    },
    // ── 8. Serialization utilities ────────────────────────────────────────
    {
      title: "Serialization & Sanitization",
      rows: [
        {
          label: "escapeHtml()",
          code: `escapeHtml('<script>alert("xss")</script>')`,
          description:
            "Encodes &, <, >, \", and ' for safe use in HTML attribute values and text nodes.",
          value: escapeHtml('<script>alert("xss")</script>'),
        },
        {
          label: "serializeJsonLd()",
          code: `serializeJsonLd({ "@type": "WebSite", name: "<Rimelight>" })`,
          description:
            "JSON.stringify with < > / escaping to prevent </script> injection breakouts in any browser parsing mode.",
          value: serializeJsonLd({ "@type": "WebSite", name: "<Rimelight>" }),
        },
        {
          label: "sanitizeUrl() — safe",
          code: `sanitizeUrl("https://rimelight.com/blog/grand-tale")`,
          description:
            "Allowlist-based URL sanitizer: permits https, http, mailto, tel, root-relative, and relative paths.",
          value: sanitizeUrl("https://rimelight.com/blog/grand-tale") || "(empty)",
        },
        {
          label: "sanitizeUrl() — blocked",
          code: `sanitizeUrl("javascript:alert(1)")`,
          description: "Returns an empty string for any non-allowlisted protocol.",
          value: sanitizeUrl("javascript:alert(1)") || "(empty — blocked)",
        },
      ],
    },
    // ── 9. Sitemap ────────────────────────────────────────────────────────
    {
      title: "buildSitemapUrls() + buildSitemapXml()",
      mono: true,
      output: sitemapXml,
      rows: [
        {
          label: "Resolved URLs",
          code: `buildSitemapUrls(entries, { site, locales: { en: "en-US", pt: "pt-BR" }, defaultLocale: "en" })`,
          description:
            "Expands each entry into per-locale URLs with hreflang alternates and x-default.",
          value: JSON.stringify(sitemapUrls, null, 2),
        },
      ],
    },
    // ── 10. Robots ────────────────────────────────────────────────────────
    {
      title: "buildRobotsTxt()",
      mono: true,
      output: robotsTxt,
      rows: [
        {
          label: "robots.txt",
          code: `buildRobotsTxt({ sitemapUrl, disallow: ["/api/", "/dev/", "/_/"], allow: ["/api/public/"] })`,
          description:
            "Generates standards-compliant robots.txt with wildcard user-agent, disallow/allow rules, and the sitemap URL.",
          value: `Disallow: 3 paths\nAllow: 1 path\nSitemap: ${DEMO_SITE}/sitemap.xml`,
        },
        {
          label: "Live endpoint",
          description: "Auto-injected by the seo() plugin at /robots.txt.",
          content: (
            <RLButton
              variant="soft"
              color="neutral"
              href="/robots.txt"
              label="/robots.txt"
              rel="external"
            />
          ),
        },
      ],
    },
    // ── 11. RSS ───────────────────────────────────────────────────────────
    {
      title: "buildRssXml()",
      mono: true,
      output: rssXml,
      rows: [
        {
          label: "RSS 2.0 feed",
          code: `buildRssXml({ title, description, site, feedUrl, items })`,
          description:
            "Emits a valid RSS 2.0 document with Atom namespace self-link and content:encoded support.",
          value: `${DEMO_RSS_OPTIONS.items.length} items rendered`,
        },
        {
          label: "Live endpoint",
          description: "Auto-injected by the seo() plugin at /rss.xml.",
          content: (
            <RLButton
              variant="soft"
              color="neutral"
              href="/rss.xml"
              label="/rss.xml"
              rel="external"
            />
          ),
        },
      ],
    },
    // ── 12. LLMs.txt ──────────────────────────────────────────────────────
    {
      title: "buildLlmsTxt()",
      mono: true,
      output: llmsTxt,
      rows: [
        {
          label: "llms.txt",
          code: `buildLlmsTxt({ site, title, description, pages })`,
          description:
            "Standard /llms.txt format for AI agent discovery — grouped by section with markdown URL support.",
          value: `${DEMO_LLMS.pages.length} pages indexed`,
        },
        {
          label: "Live endpoints",
          description: "Auto-injected by the seo() plugin at /llms.txt and /llms-full.txt.",
          content: (
            <div class="flex gap-sm flex-wrap">
              <RLButton
                variant="soft"
                color="neutral"
                href="/llms.txt"
                label="/llms.txt"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/llms-full.txt"
                label="/llms-full.txt"
                rel="external"
              />
            </div>
          ),
        },
      ],
    },
    // ── 13. Web Manifest ──────────────────────────────────────────────────
    {
      title: "buildWebManifest()",
      mono: true,
      rows: [
        {
          label: "site.webmanifest",
          code: `buildWebManifest({ name, shortName, description, themeColor, backgroundColor })`,
          description:
            "Generates a W3C Web App Manifest with default PWA icons (192, 512, maskable-512).",
          value: JSON.stringify(manifest, null, 2),
        },
        {
          label: "Live endpoint",
          description: "Auto-injected by the seo() plugin at /site.webmanifest.",
          content: (
            <RLButton
              variant="soft"
              color="neutral"
              href="/site.webmanifest"
              label="/site.webmanifest"
              rel="external"
            />
          ),
        },
      ],
    },
    // ── 14. Structured Data ───────────────────────────────────────────────
    {
      title: "buildArticleSchema() + buildBreadcrumbSchema()",
      mono: true,
      rows: [
        {
          label: "BlogPosting JSON-LD",
          code: `buildArticleSchema({ type: "BlogPosting", title, description, url, datePublished, authorName })`,
          description:
            "Emits Schema.org Article / BlogPosting / TechArticle structured data for rich search results.",
          value: JSON.stringify(articleSchema, null, 2),
        },
        {
          label: "BreadcrumbList JSON-LD",
          code: `buildBreadcrumbSchema([{ name: "Home", url }, { name: "Blog", url }, { name: "Post title", url }])`,
          description:
            "Emits Schema.org BreadcrumbList for sitelinks breadcrumb display in search results.",
          value: JSON.stringify(breadcrumbSchema, null, 2),
        },
      ],
    },
    // ── 15. security.txt ──────────────────────────────────────────────────
    {
      title: "buildSecurityTxt()",
      mono: true,
      output: securityTxt,
      rows: [
        {
          label: "security.txt",
          code: `buildSecurityTxt({ contact, preferredLanguages, policy })`,
          description:
            "Generates an RFC 9116-compliant security.txt. Contact and Expires are required; auto-defaults Expires to 1 year from generation.",
          value: `Contact: ${DEMO_SECURITY.contact}\nLanguages: ${DEMO_SECURITY.preferredLanguages}\nPolicy: ${DEMO_SECURITY.policy}`,
        },
        {
          label: "Live endpoints",
          description: "Auto-injected by the seo() plugin.",
          content: (
            <div class="flex gap-sm flex-wrap">
              <RLButton
                variant="soft"
                color="neutral"
                href="/.well-known/security.txt"
                label="/.well-known/security.txt"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/security.txt"
                label="/security.txt (legacy)"
                rel="external"
              />
            </div>
          ),
        },
      ],
    },
    // ── 16. API Catalog ───────────────────────────────────────────────────
    {
      title: "buildApiCatalog()",
      mono: true,
      rows: [
        {
          label: "/.well-known/api-catalog",
          code: `buildApiCatalog({ items: [{ rel: "service-desc", href, type }] })`,
          description:
            "Generates an RFC 9652 Application Linkset for machine-readable API discovery.",
          value: JSON.stringify(apiCatalog, null, 2),
        },
        {
          label: "Live endpoint",
          description: "Auto-injected by the seo() plugin.",
          content: (
            <RLButton
              variant="soft"
              color="neutral"
              href="/.well-known/api-catalog"
              label="/.well-known/api-catalog"
              rel="external"
            />
          ),
        },
      ],
    },
    // ── 17. OG Image Preview gallery ─────────────────────────────────────
    {
      title: "Open Graph Image Previews",
      rows: [
        {
          label: "Rendered gallery",
          code: `/open-graph/page.png?title=...&description=...&type=...&isDocs=true`,
          description:
            "Live OG images served by the auto-injected handler. Dark background for standard pages, gradient for docs. Click any card to open full-size.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                <For each={OG_PAGES}>
                  {(page) => {
                    const url = ogUrl(page);
                    const isCopied = () => copiedOg() === url;
                    return (
                      <article class="bg-elevated/20 border border-default rounded-xl overflow-hidden shadow-xs">
                        <div class="flex items-center gap-sm px-md py-xs border-b border-default/40">
                          <span class="text-sm font-semibold text-highlighted">{page.label}</span>
                          <Show when={page.type}>
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                              {page.type}
                            </span>
                          </Show>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          class="block relative group overflow-hidden bg-default"
                        >
                          <img
                            src={url}
                            alt={`OG image for ${page.label}`}
                            class="w-full aspect-[1200/630] object-cover"
                            loading="lazy"
                          />
                          <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Open full size ↗
                          </div>
                        </a>
                        <div class="flex items-center justify-between gap-sm px-md py-xs border-t border-default/40">
                          <div class="flex flex-col min-w-0">
                            <strong class="text-sm text-highlighted truncate">{page.title}</strong>
                            <Show when={page.description}>
                              <span class="text-xs text-muted truncate">{page.description}</span>
                            </Show>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyOgUrl(url)}
                            class="px-3 py-1.5 bg-elevated hover:bg-elevated/80 border border-default rounded-md text-xs font-medium text-toned transition-colors shrink-0"
                            style={{
                              color: isCopied() ? "#4ade80" : undefined,
                              "border-color": isCopied() ? "rgba(74, 222, 128, 0.4)" : undefined,
                            }}
                          >
                            {isCopied() ? "Copied!" : "Copy URL"}
                          </button>
                        </div>
                      </article>
                    );
                  }}
                </For>
              </div>
            </div>
          ),
        },
      ],
    },
    // ── 18. OG Sandbox ────────────────────────────────────────────────────
    {
      title: "OG Image Sandbox",
      rows: [
        {
          label: "Live preview",
          code: `/open-graph/page.png?title=...&description=...&type=...&isDocs=true`,
          description: "Render a custom OG image with any title, description, and tags.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <div class="flex flex-wrap gap-sm items-end">
                <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[160px]">
                  Title
                  <input
                    type="text"
                    value={sandboxTitle()}
                    onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                      setSandboxTitle(e.currentTarget.value)
                    }
                    class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[160px]">
                  Description
                  <input
                    type="text"
                    value={sandboxDesc()}
                    onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                      setSandboxDesc(e.currentTarget.value)
                    }
                    class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[140px]">
                  Type badge
                  <input
                    type="text"
                    value={sandboxType()}
                    placeholder="e.g. Blog Post"
                    onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                      setSandboxType(e.currentTarget.value)
                    }
                    class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
                  />
                </label>
                <label class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={sandboxDocs()}
                    onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                      setSandboxDocs(e.currentTarget.checked)
                    }
                    class="size-4 rounded accent-primary"
                  />
                  Docs style
                </label>
              </div>
              <div class="rounded-xl overflow-hidden border border-default bg-elevated/20">
                <img
                  src={sandboxUrl()}
                  alt="Sandbox OG preview"
                  class="w-full aspect-[1200/630] object-cover"
                />
              </div>
            </div>
          ),
        },
      ],
    },
    // ── 19. Public asset endpoints ────────────────────────────────────────
    {
      title: "Public Asset Endpoints",
      rows: [
        {
          label: "Icons & images",
          description:
            "Auto-generated from the master icon by the assets() route handler. Favicon, Apple Touch, PWA icons, and the branded OG card.",
          content: (
            <div class="flex flex-wrap gap-sm">
              <RLButton
                variant="soft"
                color="neutral"
                href="/favicon.ico"
                label="/favicon.ico"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/favicon.svg"
                label="/favicon.svg"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/apple-touch-icon.png"
                label="/apple-touch-icon.png"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/icon-192.png"
                label="/icon-192.png"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/icon-512.png"
                label="/icon-512.png"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/icon-maskable-512.png"
                label="/icon-maskable-512.png"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/og.png"
                label="/og.png"
                rel="external"
              />
            </div>
          ),
        },
        {
          label: "Sitemap",
          description: "Auto-injected by the seo() plugin.",
          content: (
            <RLButton
              variant="soft"
              color="neutral"
              href="/sitemap.xml"
              label="/sitemap.xml"
              rel="external"
            />
          ),
        },
      ],
    },
  ];

  return (
    <DevLayout>
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">SEO</h1>
          <p class="text-sm text-muted">
            Auditing @rimelight/seo — head generation, meta utilities, structured data, OG images,
            sitemap, robots.txt, RSS, LLMs.txt, web manifest, security.txt, and API catalog.
          </p>
        </header>

        <For each={sections()}>
          {(section) => (
            <section class="bg-elevated/20">
              <header class="bg-elevated/40 px-xl py-sm">
                <h2 class="text-xs text-muted">
                  {section.mono ? <code>{section.title}</code> : section.title}
                </h2>
              </header>
              <hr class="border-default" />
              <div class="flex flex-col">
                <For each={section.rows}>
                  {(row, index) => (
                    <>
                      <Show when={index() > 0}>
                        <hr class="border-default" />
                      </Show>
                      <div class="grid grid-cols-1 items-start gap-xl px-xl py-md lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                        <div class="flex min-w-0 flex-col gap-xs">
                          <Show when={row.label}>
                            {row.mono ? (
                              <code class="text-sm text-highlighted">{row.label}</code>
                            ) : (
                              <span class="text-sm text-highlighted">{row.label}</span>
                            )}
                          </Show>
                          <Show when={row.code}>
                            <pre class="whitespace-pre-wrap break-words text-xs text-muted">
                              {row.code}
                            </pre>
                          </Show>
                          <Show when={row.description}>
                            <p class="text-xs text-muted">{row.description}</p>
                          </Show>
                        </div>
                        <div class="min-w-0 text-sm text-highlighted">
                          <Show when={row.value}>
                            <pre class="whitespace-pre-wrap break-words">{row.value}</pre>
                          </Show>
                          {row.content}
                        </div>
                      </div>
                    </>
                  )}
                </For>
              </div>
              <Show when={section.output}>
                <hr class="border-default" />
                <div class="px-xl py-md">
                  <h3 class="mb-xs text-xs text-muted">Rendered output</h3>
                  <pre class="max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-elevated/40 px-sm py-xs font-mono text-xs text-muted">
                    {section.output}
                  </pre>
                </div>
              </Show>
            </section>
          )}
        </For>
      </div>
    </DevLayout>
  );
}

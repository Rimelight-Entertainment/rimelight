import { For, Show, createSignal } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
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
  type SeoEntry,
} from "@rimelight/seo";
import {
  siteConfig as liveSiteConfig,
  SEO_LOCALES as liveSeoLocales,
  PRIVATE_PATH_PREFIXES as livePrivatePathPrefixes,
} from "virtual:rimelight-seo";

interface OgPreviewItem {
  label: string;
  title: string;
  description: string;
  type: string;
  isDocs: boolean;
}

const summarizeHeadTags = (tags: HeadTag[]): string => {
  return tags
    .map((t) => {
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
    .join("\n");
};

const resolveOgUrl = (item: OgPreviewItem) => {
  const params = new URLSearchParams({
    title: item.title,
    description: item.description,
    ...(item.type ? { type: item.type } : {}),
    ...(item.isDocs ? { isDocs: "true" } : {}),
  });
  return `/open-graph/page.png?${params.toString()}`;
};

export default function DevSeoPage() {
  const location = useLocation();

  const [sandboxTitle, setSandboxTitle] = createSignal("Interactive Sandbox Title");
  const [sandboxDesc, setSandboxDesc] = createSignal(
    "Testing Open Graph banner rendering using current site theme.",
  );
  const [sandboxType, setSandboxType] = createSignal("");
  const [sandboxDocs, setSandboxDocs] = createSignal(false);
  const [copiedOg, setCopiedOg] = createSignal<string | null>(null);

  const activeOrigin = () =>
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : liveSiteConfig.url || "https://rimelight.com";

  const liveConfig = () => liveSiteConfig;
  const liveLocales = () => (liveSeoLocales as Record<string, string>) || { en: "en-US" };
  const livePrivatePrefixes = () => livePrivatePathPrefixes || [];

  const defaultLocaleKey = () => Object.keys(liveLocales())[0] || "en";

  const liveHead = () =>
    createSeoHead({
      title: "SEO Audit",
      description: liveConfig().description,
      ogType: "website",
      url: `${activeOrigin()}${location.pathname}`,
      noindex: false,
      config: liveConfig(),
    });

  const liveLocaleConfig = () => ({
    site: activeOrigin(),
    locales: liveLocales(),
    defaultLocale: defaultLocaleKey(),
  });

  const discoveredEntries = (): SeoEntry[] => [
    { path: "/", priority: 1.0 },
    { path: "/company", priority: 0.8 },
    { path: "/products", priority: 0.8 },
    { path: "/docs", priority: 0.7 },
  ];

  const liveSitemapUrls = () => buildSitemapUrls(discoveredEntries(), liveLocaleConfig());
  const liveSitemapXml = () => buildSitemapXml(liveSitemapUrls());

  const liveRobotsTxt = () =>
    buildRobotsTxt({
      sitemapUrl: `${activeOrigin()}/sitemap.xml`,
      disallow: livePrivatePrefixes(),
      allow: ["/api/public/"],
    });

  const liveRssFeed = () =>
    buildRssXml({
      title: `${liveConfig().name} Newsroom`,
      description: liveConfig().description,
      site: activeOrigin(),
      feedUrl: `${activeOrigin()}/rss.xml`,
      language: liveLocales()[defaultLocaleKey()] || "en-US",
      items: [
        {
          title: "Platform Overview",
          link: "/",
          pubDate: new Date("2026-09-01"),
          description: liveConfig().description,
        },
        {
          title: "Developer Tools Release",
          link: "/dev/seo",
          pubDate: new Date("2026-10-01"),
          description: "Live runtime SEO auditing and validation tooling.",
        },
      ],
    });

  const liveLlmsTxt = () =>
    buildLlmsTxt({
      site: activeOrigin(),
      title: `${liveConfig().name} AI Directory`,
      description: "Index of public pages for automated agents and LLM ingest.",
      pages: [
        {
          title: "Documentation Overview",
          url: `${activeOrigin()}/docs`,
          description: "Getting started guide and references.",
          section: "Docs",
        },
        {
          title: "Platform Runtime",
          url: `${activeOrigin()}/dev`,
          description: "Developer tools and environment.",
          section: "Dev",
        },
      ],
    });

  const liveWebManifest = () =>
    buildWebManifest({
      name: liveConfig().name,
      shortName: liveConfig().name,
      description: liveConfig().description,
      themeColor: liveConfig().branding?.colors?.themeColor || "#ffffff",
      backgroundColor: liveConfig().branding?.colors?.backgroundColor || "#0a0a0a",
    });

  const liveArticleSchema = () =>
    buildArticleSchema({
      type: "BlogPosting",
      title: `${liveConfig().name} Feature Showcase`,
      description: liveConfig().description,
      url: `${activeOrigin()}${location.pathname}`,
      datePublished: new Date("2026-10-11"),
      authorName: liveConfig().author || liveConfig().name,
      publisherName: liveConfig().name,
    });

  const liveBreadcrumbSchema = () =>
    buildBreadcrumbSchema([
      { name: "Home", url: activeOrigin() },
      { name: "Developer", url: `${activeOrigin()}/dev` },
      { name: "SEO", url: `${activeOrigin()}/dev/seo` },
    ]);

  const liveSecurityTxt = () =>
    buildSecurityTxt({
      contact: `mailto:${liveConfig().email || "security@rimelight.com"}`,
      preferredLanguages: Object.keys(liveLocales()).join(", "),
      policy: `${activeOrigin()}/.well-known/security.txt`,
    });

  const liveApiCatalog = () =>
    buildApiCatalog({
      items: [
        {
          rel: "service-desc",
          href: `${activeOrigin()}/api/openapi.json`,
          type: "application/json",
        },
        { rel: "describedby", href: `${activeOrigin()}/docs/api`, type: "text/html" },
      ],
    });

  const ogPreviewCards: OgPreviewItem[] = [
    {
      label: "Home",
      title: liveConfig().name,
      description: liveConfig().description || "Interactive entertainment and software tools.",
      type: "",
      isDocs: false,
    },
    {
      label: "Company",
      title: `About ${liveConfig().name}`,
      description: "Creating interactive entertainment and software tools.",
      type: "Company",
      isDocs: false,
    },
    {
      label: "Products",
      title: "Products & Games",
      description: "Explore Grand Tale and our ecosystem of open-source tools.",
      type: "Products",
      isDocs: false,
    },
    {
      label: "Documentation",
      title: "Getting Started",
      description: "Everything you need to get up and running with Rimelight.",
      type: "Documentation",
      isDocs: true,
    },
    {
      label: "API Reference",
      title: "API Reference",
      description: "Complete API reference for integrations.",
      type: "Documentation",
      isDocs: true,
    },
    {
      label: "Blog Post",
      title: "Announcing Platform v2",
      description: "A look at what's new in our latest release.",
      type: "Blog Post",
      isDocs: false,
    },
  ];

  const sandboxUrl = () => {
    const params = new URLSearchParams({ title: sandboxTitle(), description: sandboxDesc() });
    if (sandboxType()) params.set("type", sandboxType());
    if (sandboxDocs()) params.set("isDocs", "true");
    return `/open-graph/page.png?${params.toString()}`;
  };

  const copyOgUrl = async (url: string) => {
    const full = new URL(url, activeOrigin()).toString();
    await navigator.clipboard.writeText(full);
    setCopiedOg(url);
    setTimeout(() => setCopiedOg(null), 2000);
  };

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
    {
      title: "Active Configuration",
      rows: [
        {
          label: "Site Config",
          code: `import { siteConfig } from "virtual:rimelight-seo"`,
          description:
            "Active metadata passed to the Vite plugin and exported by the virtual module at build/dev runtime.",
          value: JSON.stringify(liveConfig(), null, 2),
        },
        {
          label: "Configured Locales",
          code: `import { SEO_LOCALES } from "virtual:rimelight-seo"`,
          description: "Locale to hreflang mappings used for alternate URLs and sitemaps.",
          value: JSON.stringify(liveLocales(), null, 2),
        },
        {
          label: "Private Path Prefixes",
          code: `import { PRIVATE_PATH_PREFIXES } from "virtual:rimelight-seo"`,
          description: "Prefixes excluded from public indexing and disallowed in robots.txt.",
          value: JSON.stringify(livePrivatePrefixes(), null, 2),
        },
      ],
    },
    {
      title: "createSeoHead()",
      mono: true,
      output: liveHead().html,
      rows: [
        {
          label: "Resolved head tags",
          code: `createSeoHead({ title: "SEO Audit", description, ogType: "website", url, noindex: false, config: siteConfig })`,
          description:
            "Builds strongly-typed head tags — title, canonical, OG, Twitter, JSON-LD, icons, and web manifest link.",
          value: summarizeHeadTags(liveHead().tags),
        },
      ],
    },
    {
      title: "buildPageTitle()",
      mono: true,
      rows: [
        {
          label: "Templated title",
          code: `buildPageTitle({ title: "SEO Audit", siteName: siteConfig.name, titleTemplate: siteConfig.seo.titleTemplate })`,
          description: "Interpolates %s with the title according to the active template.",
          value: buildPageTitle({
            title: "SEO Audit",
            siteName: liveConfig().name,
            titleTemplate: liveConfig().seo.titleTemplate,
          }),
        },
        {
          label: "Untitled fallback",
          code: `buildPageTitle({ siteName: siteConfig.name, titleTemplate: siteConfig.seo.titleTemplate })`,
          description: "Falls back to siteName when title is omitted.",
          value: buildPageTitle({
            siteName: liveConfig().name,
            titleTemplate: liveConfig().seo.titleTemplate,
          }),
        },
        {
          label: "404 route",
          code: `buildPageTitle({ is404: true, siteName: siteConfig.name, titleTemplate: siteConfig.seo.titleTemplate })`,
          description: "Standard 404 title format.",
          value: buildPageTitle({
            is404: true,
            siteName: liveConfig().name,
            titleTemplate: liveConfig().seo.titleTemplate,
          }),
        },
        {
          label: "Absolute bypass",
          code: `buildPageTitle({ title: "Custom Verbatim Title", absolute: true, siteName: siteConfig.name, titleTemplate: siteConfig.seo.titleTemplate })`,
          description: "Bypasses the site template entirely.",
          value: buildPageTitle({
            title: "Custom Verbatim Title",
            absolute: true,
            siteName: liveConfig().name,
            titleTemplate: liveConfig().seo.titleTemplate,
          }),
        },
      ],
    },
    {
      title: "buildSafeDescription()",
      mono: true,
      rows: [
        {
          label: "Within character limit",
          code: `buildSafeDescription(siteConfig.description, siteConfig.seo.maxDescriptionLength)`,
          description: "Description passed through without truncation when under the limit.",
          value: buildSafeDescription(
            liveConfig().description,
            liveConfig().seo.maxDescriptionLength,
          ),
        },
        {
          label: "Truncated description",
          code: `buildSafeDescription("...", 24)`,
          description: "Truncates at boundary and appends ellipsis.",
          value: buildSafeDescription(
            "Creating interactive entertainment and software tools for the web.",
            24,
          ),
        },
      ],
    },
    {
      title: "buildRobotsMetaContent()",
      mono: true,
      rows: [
        {
          label: "Indexable page",
          code: `buildRobotsMetaContent({ noindex: false })`,
          value: buildRobotsMetaContent({ noindex: false }),
        },
        {
          label: "noindex page",
          code: `buildRobotsMetaContent({ noindex: true })`,
          value: buildRobotsMetaContent({ noindex: true }),
        },
        {
          label: "404 error page",
          code: `buildRobotsMetaContent({ is404: true })`,
          value: buildRobotsMetaContent({ is404: true }),
        },
        {
          label: "Custom directive override",
          code: `buildRobotsMetaContent({ override: "noindex, follow" })`,
          value: buildRobotsMetaContent({ override: "noindex, follow" }),
        },
      ],
    },
    {
      title: "buildCanonicalUrl()",
      mono: true,
      rows: [
        {
          label: "Root URL",
          code: `buildCanonicalUrl("/", siteConfig.url)`,
          value: buildCanonicalUrl("/", liveConfig().url),
        },
        {
          label: "Current location path",
          code: `buildCanonicalUrl(location.pathname, siteConfig.url)`,
          value: buildCanonicalUrl(location.pathname, liveConfig().url),
        },
        {
          label: "Query string preserved",
          code: `buildCanonicalUrl("${location.pathname}?tab=audit", siteConfig.url)`,
          value: buildCanonicalUrl(`${location.pathname}?tab=audit`, liveConfig().url),
        },
      ],
    },
    {
      title: "buildDefaultOgImageUrl()",
      mono: true,
      rows: [
        {
          label: "Derived from active site",
          code: `buildDefaultOgImageUrl({ title: "SEO Audit", description: siteConfig.description, siteName: siteConfig.name })`,
          description: "Standard dynamic query URL for Open Graph card generation.",
          value: buildDefaultOgImageUrl({
            title: "SEO Audit",
            description: liveConfig().description,
            siteName: liveConfig().name,
          }),
        },
        {
          label: "Fallback route",
          code: `buildDefaultOgImageUrl({})`,
          value: buildDefaultOgImageUrl({}),
        },
      ],
    },
    {
      title: "buildWebSiteSchema()",
      mono: true,
      rows: [
        {
          label: "Active WebSite JSON-LD",
          code: `buildWebSiteSchema(siteConfig, siteConfig.url)`,
          description: "Emits Schema.org WebSite node for search engines.",
          value: JSON.stringify(buildWebSiteSchema(liveConfig(), liveConfig().url), null, 2),
        },
      ],
    },
    {
      title: "Serialization & Sanitization",
      rows: [
        {
          label: "escapeHtml()",
          code: `escapeHtml('<meta name="author" content="Rimelight & Co">')`,
          description: "Encodes HTML entities for safe attribute insertion.",
          value: escapeHtml('<meta name="author" content="Rimelight & Co">'),
        },
        {
          label: "serializeJsonLd()",
          code: `serializeJsonLd({ "@type": "WebSite", name: "<Rimelight>" })`,
          description: "Neutralizes script tag breakout vectors in JSON-LD.",
          value: serializeJsonLd({ "@type": "WebSite", name: "<Rimelight>" }),
        },
        {
          label: "sanitizeUrl() — approved",
          code: `sanitizeUrl("${liveConfig().url}/dev/seo")`,
          value: sanitizeUrl(`${liveConfig().url}/dev/seo`) || "(empty)",
        },
        {
          label: "sanitizeUrl() — blocked",
          code: `sanitizeUrl("javascript:evil()")`,
          value: sanitizeUrl("javascript:evil()") || "(empty — blocked)",
        },
      ],
    },
    {
      title: "buildSitemapUrls() + buildSitemapXml()",
      mono: true,
      output: liveSitemapXml(),
      rows: [
        {
          label: "Generated URLs",
          code: `buildSitemapUrls(entries, { site: siteConfig.url, locales: SEO_LOCALES, defaultLocale })`,
          description:
            "Generates language alternates and x-default URLs across all active locales.",
          value: `${liveSitemapUrls().length} URLs resolved across ${Object.keys(liveLocales()).length} locales`,
        },
      ],
    },
    {
      title: "buildRobotsTxt()",
      mono: true,
      output: liveRobotsTxt(),
      rows: [
        {
          label: "robots.txt configuration",
          code: `buildRobotsTxt({ sitemapUrl: siteConfig.url + "/sitemap.xml", disallow: PRIVATE_PATH_PREFIXES })`,
          description:
            "Enforces privatePathPrefixes configured on the seo() plugin to shield internal routes.",
          value: `Disallow: ${livePrivatePrefixes().length} paths\nSitemap: ${activeOrigin()}/sitemap.xml`,
        },
        {
          label: "Live endpoint",
          description: "Endpoint served directly by the seo() plugin middleware.",
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
    {
      title: "buildRssXml()",
      mono: true,
      output: liveRssFeed(),
      rows: [
        {
          label: "Active channel",
          code: `buildRssXml({ title: siteConfig.name, site: siteConfig.url, items: [...] })`,
          description: "Generates an RSS 2.0 XML feed with Atom namespace linkage.",
          value: `${liveConfig().name} Newsfeed`,
        },
        {
          label: "Live endpoint",
          description: "Endpoint served by the seo() plugin middleware.",
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
    {
      title: "buildLlmsTxt()",
      mono: true,
      output: liveLlmsTxt(),
      rows: [
        {
          label: "AI Corpus Index",
          code: `buildLlmsTxt({ site: siteConfig.url, title: siteConfig.name, pages: [...] })`,
          description: "Standard /llms.txt manifest for automated crawler context.",
          value: "Live corpus manifest generated",
        },
        {
          label: "Live endpoints",
          description: "Endpoints served by the seo() plugin middleware.",
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
    {
      title: "buildWebManifest()",
      mono: true,
      rows: [
        {
          label: "site.webmanifest",
          code: `buildWebManifest({ name: siteConfig.name, themeColor: siteConfig.branding.colors.themeColor })`,
          description: "Progressive Web App manifest derived from active site configuration.",
          value: JSON.stringify(liveWebManifest(), null, 2),
        },
        {
          label: "Live endpoint",
          description: "Endpoint served by the seo() plugin middleware.",
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
    {
      title: "buildArticleSchema() + buildBreadcrumbSchema()",
      mono: true,
      rows: [
        {
          label: "Article JSON-LD",
          code: `buildArticleSchema({ type: "BlogPosting", title, publisherName: siteConfig.name, ... })`,
          description: "Emits Schema.org Article / BlogPosting structured data.",
          value: JSON.stringify(liveArticleSchema(), null, 2),
        },
        {
          label: "BreadcrumbList JSON-LD",
          code: `buildBreadcrumbSchema([...])`,
          description:
            "Emits Schema.org BreadcrumbList structured data for search result sitelinks.",
          value: JSON.stringify(liveBreadcrumbSchema(), null, 2),
        },
      ],
    },
    {
      title: "buildSecurityTxt()",
      mono: true,
      output: liveSecurityTxt(),
      rows: [
        {
          label: "security.txt",
          code: `buildSecurityTxt({ contact: siteConfig.email, preferredLanguages, policy })`,
          description:
            "RFC 9116 compliant security contact document with automated expiration date.",
          value: `Contact: mailto:${liveConfig().email || "security@rimelight.com"}\nLanguages: ${Object.keys(liveLocales()).join(", ")}`,
        },
        {
          label: "Live endpoints",
          description: "RFC 9116 security policy endpoints.",
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
    {
      title: "buildApiCatalog()",
      mono: true,
      rows: [
        {
          label: "/.well-known/api-catalog",
          code: `buildApiCatalog({ items: [...] })`,
          description: "RFC 9652 machine-readable API catalog linkset.",
          value: JSON.stringify(liveApiCatalog(), null, 2),
        },
        {
          label: "Live endpoint",
          description: "API catalog discovery document.",
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
    {
      title: "Open Graph Previews",
      rows: [
        {
          label: "Active card templates",
          code: `/open-graph/page.png?title=...&description=...&type=...&isDocs=true`,
          description:
            "Live Open Graph images generated via the Takumi renderer with live site identity tokens.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                <For each={ogPreviewCards}>
                  {(page) => {
                    const url = resolveOgUrl(page);
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
    {
      title: "Open Graph Sandbox",
      rows: [
        {
          label: "Live generator",
          code: `/open-graph/page.png?title=...&description=...&type=...&isDocs=true`,
          description: "Interactively test title, description, and badge parameters.",
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
                    placeholder="e.g. Documentation"
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
    {
      title: "Public Asset Endpoints",
      rows: [
        {
          label: "Branding assets & sitemap",
          description:
            "Public assets served by the seo() plugin middleware and static route injectors.",
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
              <RLButton
                variant="soft"
                color="neutral"
                href="/sitemap.xml"
                label="/sitemap.xml"
                rel="external"
              />
            </div>
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
            Auditing @rimelight/seo — live runtime site metadata, head generation, structured data,
            Open Graph image generation, sitemap, robots.txt, RSS feeds, LLMs.txt, web manifest,
            security policy, and API catalogs.
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

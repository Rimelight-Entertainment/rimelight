import { For, Show, createMemo, createSignal } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { RLButton, RLCarousel } from "@rimelight/ui";
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
  defaultOgLayout,
  sanitizeUrl,
  serializeJsonLd,
  activeConfig as liveConfigRaw,
  type SeoEntry,
} from "@rimelight/seo";

interface OgPreviewItem {
  label: string;
  title: string;
  description: string;
  type: string;
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
  });
  return `/open-graph/card.svg?${params.toString()}`;
};

const OgSandbox = () => {
  const [sandboxTitle, setSandboxTitle] = createSignal("Interactive Sandbox Title");
  const [sandboxDesc, setSandboxDesc] = createSignal(
    "Testing Open Graph banner rendering using current site theme.",
  );
  const [sandboxBrand, setSandboxBrand] = createSignal("Rimelight");
  const [sandboxType, setSandboxType] = createSignal("Documentation");
  const [sandboxBg, setSandboxBg] = createSignal<"dark" | "gradient" | "custom">("dark");
  const [sandboxCustomBg, setSandboxCustomBg] = createSignal("#1e1b4b");
  const [sandboxDate, setSandboxDate] = createSignal("2026-10-18");
  const [sandboxPreview, setSandboxPreview] = createSignal(false);
  const [copiedOg, setCopiedOg] = createSignal<string | null>(null);

  const activeOrigin = () =>
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : liveConfigRaw.url || "https://rimelight.com";

  const sandboxUrl = createMemo(() => {
    const params = new URLSearchParams({
      title: sandboxTitle(),
      description: sandboxDesc(),
    });
    if (sandboxBrand()) params.set("brand", sandboxBrand());
    if (sandboxType()) params.set("type", sandboxType());
    if (sandboxDate()) params.set("date", sandboxDate());
    if (sandboxPreview()) params.set("preview", "true");
    const bg = sandboxBg() === "custom" ? sandboxCustomBg() : sandboxBg();
    if (bg && bg !== "dark") params.set("bg", bg);
    return `/open-graph/card.svg?${params.toString()}`;
  });

  const ogSvg = createMemo(() =>
    defaultOgLayout({
      title: sandboxTitle(),
      description: sandboxDesc() || undefined,
      brand: sandboxBrand(),
      badge: sandboxType() || undefined,
      date: sandboxDate() || undefined,
      background: sandboxBg() === "custom" ? sandboxCustomBg() : sandboxBg(),
      preview: sandboxPreview(),
    }),
  );

  const previewSrc = createMemo(
    () => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ogSvg()),
  );
  const copyOgUrl = async (url: string) => {
    const full = new URL(url, activeOrigin()).toString();
    await navigator.clipboard.writeText(full);
    setCopiedOg(url);
    setTimeout(() => setCopiedOg(null), 2000);
  };

  return (
    <div class="flex flex-col gap-md w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-sm items-start">
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Title
          <input
            type="text"
            value={sandboxTitle()}
            onInput={(e) => setSandboxTitle(e.currentTarget.value)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Description
          <input
            type="text"
            value={sandboxDesc()}
            onInput={(e) => setSandboxDesc(e.currentTarget.value)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Brand Name
          <input
            type="text"
            value={sandboxBrand()}
            onInput={(e) => setSandboxBrand(e.currentTarget.value)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Type / Badge
          <input
            type="text"
            value={sandboxType()}
            placeholder="e.g. Documentation, Blog, Changelog"
            onInput={(e) => setSandboxType(e.currentTarget.value)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Date
          <input
            type="text"
            value={sandboxDate()}
            placeholder="e.g. 2026-10-18"
            onInput={(e) => setSandboxDate(e.currentTarget.value)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider">
          Background
          <select
            value={sandboxBg()}
            onChange={(e) => setSandboxBg(e.currentTarget.value as any)}
            class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
          >
            <option value="dark">Dark (#0a0a0a)</option>
            <option value="gradient">Gradient (#0a0a0a → #1a1a2e)</option>
            <option value="custom">Custom Color</option>
          </select>
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-md">
        <Show when={sandboxBg() === "custom"}>
          <label class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
            Custom Fill:
            <input
              type="text"
              value={sandboxCustomBg()}
              placeholder="#1e1b4b"
              onInput={(e) => setSandboxCustomBg(e.currentTarget.value)}
              class="px-2 py-1 bg-default border border-default rounded text-highlighted text-xs font-mono outline-none"
            />
          </label>
        </Show>

        <label class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer">
          <input
            type="checkbox"
            checked={sandboxPreview()}
            onChange={(e) => setSandboxPreview(e.currentTarget.checked)}
            class="size-4 rounded accent-primary"
          />
          PREVIEW Watermark Border
        </label>

        <div class="ml-auto">
          <button
            type="button"
            onClick={() => copyOgUrl(sandboxUrl())}
            class="px-3 py-1.5 bg-elevated hover:bg-elevated/80 border border-default rounded-md text-xs font-medium text-toned transition-colors"
          >
            {copiedOg() === sandboxUrl() ? "Copied URL!" : "Copy Sandbox URL"}
          </button>
        </div>
      </div>

      <pre class="text-xs text-muted break-all">{sandboxUrl()}</pre>
      <img
        src={previewSrc()}
        alt="Sandbox OG preview"
        class="w-full aspect-[1200/630] object-cover rounded-xl border border-default bg-elevated/20"
      />
      <a href={sandboxUrl()} target="_blank" rel="noreferrer" class="text-xs text-muted underline">
        Open full size ?
      </a>
    </div>
  );
};

export default function DevSeoPage() {
  const location = useLocation();

  const [copiedOg, setCopiedOg] = createSignal<string | null>(null);

  const activeOrigin = () =>
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : liveConfigRaw.url || "https://rimelight.com";

  const liveConfig = () => liveConfigRaw;
  const liveLocales = (): Record<string, string> =>
    typeof liveConfigRaw.locales === "object" && liveConfigRaw.locales !== null
      ? "locales" in liveConfigRaw.locales && typeof liveConfigRaw.locales.locales === "object"
        ? (liveConfigRaw.locales.locales as Record<string, string>)
        : (liveConfigRaw.locales as Record<string, string>)
      : { en: "en-US" };
  const livePrivatePrefixes = () => liveConfigRaw.privatePathPrefixes || [];

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
      title: `${liveConfig().name || "Rimelight"} Newsroom`,
      description: liveConfig().description || "",
      site: activeOrigin(),
      feedUrl: `${activeOrigin()}/rss.xml`,
      language: liveLocales()[defaultLocaleKey()] || "en-US",
      items: [
        {
          title: "Platform Overview",
          link: "/",
          pubDate: new Date("2026-09-01"),
          description: liveConfig().description || "",
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

  const liveWebManifest = () => {
    const cfg = liveConfig();
    const faviconSrc =
      typeof cfg.branding?.favicon === "string"
        ? cfg.branding.favicon.startsWith("<svg")
          ? "/favicon.svg"
          : cfg.branding.favicon
        : cfg.branding?.favicon?.svg || cfg.branding?.favicon?.png || "/favicon.svg";

    return buildWebManifest({
      name: cfg.name || "Rimelight",
      shortName: cfg.name || "Rimelight",
      description: cfg.description || "",
      themeColor: cfg.branding?.colors?.themeColor || "#ffffff",
      backgroundColor: cfg.branding?.colors?.backgroundColor || "#0a0a0a",
      icons: cfg.branding?.icons || [
        {
          src: faviconSrc,
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
    });
  };

  const liveArticleSchema = () =>
    buildArticleSchema({
      type: "BlogPosting",
      title: `${liveConfig().name || "Rimelight"} Feature Showcase`,
      description: liveConfig().description || "",
      url: `${activeOrigin()}${location.pathname}`,
      datePublished: new Date("2026-10-11"),
      authorName: liveConfig().author || liveConfig().name || "Rimelight",
      publisherName: liveConfig().name || "Rimelight",
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
      title: liveConfig().name || "Rimelight",
      description: liveConfig().description || "Interactive entertainment and software tools.",
      type: "",
    },
    {
      label: "Company",
      title: `About ${liveConfig().name || "Rimelight"}`,
      description: "Creating interactive entertainment and software tools.",
      type: "Company",
    },
    {
      label: "Products",
      title: "Products & Games",
      description: "Explore Grand Tale and our ecosystem of open-source tools.",
      type: "Products",
    },
    {
      label: "Documentation",
      title: "Getting Started",
      description: "Everything you need to get up and running with Rimelight.",
      type: "Documentation",
    },
    {
      label: "API Reference",
      title: "API Reference",
      description: "Complete API reference for integrations.",
      type: "Reference",
    },
    {
      label: "Blog Post",
      title: "Announcing Platform v2",
      description: "A look at what's new in our latest release.",
      type: "Blog Post",
    },
  ];

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
          code: `import { config } from "virtual:rimelight-seo"`,
          description:
            "Active metadata passed to the Vite plugin and exported by the virtual module at build/dev runtime.",
          value: JSON.stringify(liveConfig(), null, 2),
        },
        {
          label: "Configured Locales",
          code: `config.locales`,
          description: "Locale to hreflang mappings used for alternate URLs and sitemaps.",
          value: JSON.stringify(liveLocales(), null, 2),
        },
        {
          label: "Private Path Prefixes",
          code: `config.privatePathPrefixes`,
          description: "Prefixes excluded from public indexing and disallowed in robots.txt.",
          value: JSON.stringify(livePrivatePrefixes(), null, 2),
        },
      ],
    },
    {
      title: "createSeoHead()",
      mono: true,
      output: summarizeHeadTags(liveHead()),
      rows: [
        {
          label: "Resolved head tags",
          code: `createSeoHead({ title: "SEO Audit", description, ogType: "website", url, noindex: false, config: siteConfig })`,
          description:
            "Builds strongly-typed head tags — title, canonical, OG, Twitter, JSON-LD, icons, and web manifest link.",
          value: summarizeHeadTags(liveHead()),
        },
      ],
    },
    {
      title: "buildPageTitle()",
      mono: true,
      rows: [
        {
          label: "Templated title",
          code: `buildPageTitle({ title: "SEO Audit", siteName: siteConfig.name, titleTemplate: siteConfig.titleTemplate })`,
          description: "Interpolates %s with the title according to the active template.",
          value: buildPageTitle({
            title: "SEO Audit",
            siteName: liveConfig().name || "Rimelight",
            titleTemplate: liveConfig().titleTemplate || "%s | Rimelight",
          }),
        },
        {
          label: "Untitled fallback",
          code: `buildPageTitle({ siteName: siteConfig.name, titleTemplate: siteConfig.titleTemplate })`,
          description: "Falls back to siteName when title is omitted.",
          value: buildPageTitle({
            siteName: liveConfig().name || "Rimelight",
            titleTemplate: liveConfig().titleTemplate || "%s | Rimelight",
          }),
        },
        {
          label: "404 route",
          code: `buildPageTitle({ is404: true, siteName: siteConfig.name, titleTemplate: siteConfig.titleTemplate })`,
          description: "Standard 404 title format.",
          value: buildPageTitle({
            is404: true,
            siteName: liveConfig().name || "Rimelight",
            titleTemplate: liveConfig().titleTemplate || "%s | Rimelight",
          }),
        },
        {
          label: "Absolute bypass",
          code: `buildPageTitle({ title: "Custom Verbatim Title", absolute: true, siteName: siteConfig.name, titleTemplate: siteConfig.titleTemplate })`,
          description: "Bypasses the site template entirely.",
          value: buildPageTitle({
            title: "Custom Verbatim Title",
            absolute: true,
            siteName: liveConfig().name || "Rimelight",
            titleTemplate: liveConfig().titleTemplate || "%s | Rimelight",
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
          code: `buildSafeDescription(siteConfig.description, siteConfig.maxDescriptionLength)`,
          description: "Description passed through without truncation when under the limit.",
          value: buildSafeDescription(
            liveConfig().description || "",
            liveConfig().maxDescriptionLength || 160,
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
          value: buildCanonicalUrl("/", liveConfig().url || "https://rimelight.com"),
        },
        {
          label: "Current location path",
          code: `buildCanonicalUrl(location.pathname, siteConfig.url)`,
          value: buildCanonicalUrl(location.pathname, liveConfig().url || "https://rimelight.com"),
        },
        {
          label: "Query string preserved",
          code: `buildCanonicalUrl("${location.pathname}?tab=audit", siteConfig.url)`,
          value: buildCanonicalUrl(
            `${location.pathname}?tab=audit`,
            liveConfig().url || "https://rimelight.com",
          ),
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
          value: JSON.stringify(
            buildWebSiteSchema(liveConfig(), liveConfig().url || "https://rimelight.com"),
            null,
            2,
          ),
        },
      ],
    },
    {
      title: "Serialization & Sanitization",
      rows: [
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
          code: `/open-graph/page.png?title=...&description=...&type=...`,
          description:
            "Live Open Graph images generated via the SVG layout renderer with live site identity tokens.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <RLCarousel items={ogPreviewCards} dots arrows>
                {(ctx: { item: OgPreviewItem; index: number }) => {
                  const page = ctx.item;
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
              </RLCarousel>
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
          code: "/open-graph/card.svg?title=...&description=...&type=...&brand=...&bg=...&date=...&preview=true",
          description:
            "Interactively test title, description, brand, background, date, and preview parameters.",
          content: <OgSandbox />,
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
                href="/site.webmanifest"
                label="/site.webmanifest"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/open-graph/card.svg"
                label="/open-graph/card.svg"
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
    <DevLayout
      title="SEO"
      description="Head tags generation, meta tags, Open Graph images, JSON-LD schemas, sitemap, robots.txt, RSS feeds, LLMs.txt, and web manifest audit"
    >
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

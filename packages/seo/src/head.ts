import type { HeadProps, OpenGraphMeta, SeoConfig, TwitterMeta } from "./types";
export type { HeadProps } from "./types";
import {
  buildCanonicalUrl,
  buildDefaultOgImageUrl,
  buildPageTitle,
  buildRobotsMetaContent,
  buildSafeDescription,
  buildWebSiteSchema,
  deepMerge,
} from "./meta";
import { buildArticleSchema, buildBreadcrumbSchema } from "./schema";
import { sanitizeUrl, serializeJsonLd } from "./sanitize";
import type { HeadTag } from "@solidjs/web";
import { getDefaultLocale, getLocaleInfo, getLocales, getLocaleUrl } from "@rimelight/i18n";

export type { HeadTag } from "@solidjs/web";

const DEFAULT_SEO_CONFIG: SeoConfig = {
  id: "rimelight",
  name: "Rimelight",
  description: "",
  url: "https://rimelight.com",
  author: "Rimelight Entertainment",
  email: "support@rimelight.com",
  branding: {
    logo: {
      alt: "Rimelight Logo",
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#0a0a0a",
    },
  },
  titleTemplate: "%s | Rimelight",
  maxDescriptionLength: 160,
};

/** hreflang alternates for a page URL, derived from @rimelight/i18n. Empty for single-locale sites. */
function defaultAlternates(pageUrl: string | undefined): Array<{ hreflang: string; href: string }> {
  const locales = getLocales();
  if (!pageUrl || locales.length < 2) return [];
  let parsed: URL;
  try {
    parsed = new URL(pageUrl);
  } catch {
    return [];
  }
  const path = parsed.pathname + parsed.search;
  const href = (locale: string) => parsed.origin + getLocaleUrl(path, locale);
  return [
    ...locales.map((l) => ({ hreflang: getLocaleInfo(l).tag, href: href(l) })),
    { hreflang: "x-default", href: href(getDefaultLocale()) },
  ];
}

/**
 * Internal tag generator from resolved HeadProps.
 */
function generateTags(props: HeadProps, baseConfig?: SeoConfig): HeadTag[] {
  const {
    title,
    description,
    ogImage,
    ogType = "website",
    ogLocale = getLocaleInfo().tag.replace("-", "_"),
    noindex = false,
    is404 = false,
    robots,
    canonical,
    url,
    languageAlternates,
    config: propsConfig,
    favicon: customFavicon,
    appleTouchIcon: customAppleTouchIcon,
    charset = "utf-8",
    viewport = "width=device-width, initial-scale=1",
    rssFeed,
    articleSchema,
    breadcrumbs,
    markdownUrl,
    versionAlternates = [],
    absolute = false,
    twitterCard,
    openGraph,
    twitter,
    nonce,
  } = props;

  const config: SeoConfig = deepMerge(DEFAULT_SEO_CONFIG, baseConfig || {}, propsConfig || {});

  const siteName = config.name || "Rimelight";
  const siteDescription = config.description || "";
  const siteUrl = config.url || (url ? new URL(url).origin : "");
  const currentUrl = url || canonical || siteUrl || "https://rimelight.com";
  const themeColor = config.branding?.colors?.themeColor || "#ffffff";
  const darkThemeColor = config.branding?.colors?.backgroundColor || "#0a0a0a";

  const rawFavicon =
    customFavicon ||
    (typeof config.branding?.favicon === "string"
      ? config.branding.favicon
      : config.branding?.favicon?.svg) ||
    config.branding?.icon ||
    "/favicon.svg";

  const rawFaviconIco =
    typeof config.branding?.favicon === "object" ? config.branding?.favicon?.ico : undefined;

  const favicon = rawFavicon;
  const faviconType = favicon.endsWith(".ico")
    ? "image/x-icon"
    : favicon.endsWith(".png")
      ? "image/png"
      : "image/svg+xml";

  const appleTouchIcon =
    customAppleTouchIcon ||
    config.branding?.appleTouchIcon ||
    (typeof config.branding?.favicon === "string"
      ? config.branding.favicon
      : config.branding?.favicon?.svg) ||
    "/favicon.svg";
  const twitterHandle = config.authorHandle;
  const titleTemplate = config.titleTemplate || `%s | ${siteName}`;

  // Calculated Values (strictly bounded per RFC)
  const displayTitle = buildPageTitle({
    ...(title !== undefined && { title }),
    siteName,
    titleTemplate,
    ...(is404 !== undefined && { is404 }),
    ...(absolute !== undefined && { absolute }),
  }).slice(0, 200);

  const finalDescription = description || siteDescription;
  const safeDescription = config.maxDescriptionLength
    ? buildSafeDescription(finalDescription, Math.min(config.maxDescriptionLength, 300))
    : buildSafeDescription(finalDescription, 300);

  // Resolve matching layout from routes pattern if defined (e.g. "*/blog/*" or "/blog")
  let matchedLayout: string | undefined;
  if (config.og && typeof config.og === "object" && config.og.routes) {
    const pathname = (() => {
      try {
        return new URL(currentUrl).pathname;
      } catch {
        return currentUrl;
      }
    })();

    for (const [pattern, compOrLayout] of Object.entries(config.og.routes)) {
      const regexStr =
        "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
      if (new RegExp(regexStr).test(pathname) || pathname.includes(pattern.replace(/\*/g, ""))) {
        const match = compOrLayout.match(/\/([^/]+?)(?:OgCard|Og)?\.(?:tsx|ts)$/);
        matchedLayout = match?.[1] ? match[1].toLowerCase() : compOrLayout;
        break;
      }
    }
  }

  const defaultDynamicOg = buildDefaultOgImageUrl({
    title,
    description: finalDescription,
    siteName,
    layout: matchedLayout,
  });
  const ogImageFallback = config.ogImage || defaultDynamicOg;

  const rawOgImage = Array.isArray(ogImage)
    ? ogImage[0]
    : typeof ogImage === "string"
      ? { src: ogImage, alt: siteName }
      : ogImage;

  const finalOgImage =
    rawOgImage ||
    (ogImageFallback
      ? typeof ogImageFallback === "string"
        ? { src: ogImageFallback, alt: siteName }
        : ogImageFallback
      : undefined);

  let absoluteOgImage: string | undefined;
  if (finalOgImage?.src) {
    try {
      absoluteOgImage = new URL(finalOgImage.src, currentUrl).toString();
    } catch {
      absoluteOgImage = finalOgImage.src;
    }
  }

  let finalCanonical: string | undefined;
  if (canonical) {
    finalCanonical = buildCanonicalUrl(canonical, siteUrl || currentUrl);
  } else if (!is404 && currentUrl) {
    finalCanonical = buildCanonicalUrl(currentUrl, siteUrl || currentUrl);
  }

  const robotsContent = buildRobotsMetaContent({
    noindex,
    is404,
    ...(robots !== undefined && { override: robots }),
  });

  // Deep-merged OpenGraph
  const defaultOpenGraph: OpenGraphMeta = {
    type: ogType,
    locale: ogLocale,
    url: currentUrl,
    title: title || siteName,
    ...(safeDescription && { description: safeDescription }),
    ...(absoluteOgImage && {
      images: [{ src: absoluteOgImage, alt: finalOgImage?.alt || siteName }],
    }),
    siteName,
    ...config.openGraph,
  };
  const resolvedOpenGraph = deepMerge(defaultOpenGraph, openGraph || {});
  if (ogImage) {
    resolvedOpenGraph.images = ogImage;
  }

  const ogImgUrl = resolvedOpenGraph.images
    ? Array.isArray(resolvedOpenGraph.images)
      ? resolvedOpenGraph.images[0]?.src
      : typeof resolvedOpenGraph.images === "string"
        ? resolvedOpenGraph.images
        : (resolvedOpenGraph.images as { src: string }).src
    : absoluteOgImage;

  const ogImgAlt = resolvedOpenGraph.images
    ? Array.isArray(resolvedOpenGraph.images)
      ? resolvedOpenGraph.images[0]?.alt
      : typeof resolvedOpenGraph.images === "object" && "alt" in resolvedOpenGraph.images
        ? (resolvedOpenGraph.images as { alt?: string }).alt
        : finalOgImage?.alt || siteName
    : finalOgImage?.alt || siteName;

  let absoluteResolvedOgImage: string | undefined;
  if (ogImgUrl) {
    try {
      absoluteResolvedOgImage = new URL(ogImgUrl, currentUrl).toString();
    } catch {
      absoluteResolvedOgImage = ogImgUrl;
    }
  }

  // Deep-merged Twitter
  const defaultTwitter: TwitterMeta = {
    card:
      twitterCard ||
      config.twitter?.card ||
      (absoluteResolvedOgImage ? "summary_large_image" : "summary"),
    ...(twitterHandle && { site: twitterHandle, creator: twitterHandle }),
    title: resolvedOpenGraph.title || title || siteName,
    ...(safeDescription && { description: safeDescription }),
    ...(absoluteResolvedOgImage && { images: absoluteResolvedOgImage }),
    ...config.twitter,
  };
  const resolvedTwitter = deepMerge(defaultTwitter, twitter || {});
  if (twitterCard) {
    resolvedTwitter.card = twitterCard;
  }
  if (!resolvedTwitter.card) {
    resolvedTwitter.card = absoluteResolvedOgImage ? "summary_large_image" : "summary";
  }

  const tags: HeadTag[] = [];

  // Basic Metadata
  // charset is shell-only: browsers ignore it once parsing starts and useHead warns
  // ("shell-only and ignored on the client") when it is re-registered during hydration.
  // Emit it only while rendering the HTML shell (server); the client copy omits it.
  if (charset && typeof document === "undefined") {
    tags.push({ tag: "meta", props: { charset } });
  }
  if (viewport) {
    tags.push({ tag: "meta", props: { name: "viewport", content: viewport } });
  }

  // Sitemap
  tags.push({ tag: "link", props: { rel: "sitemap", href: "/sitemap.xml" } });

  // RSS Feed
  if (rssFeed?.href) {
    tags.push({
      tag: "link",
      props: {
        rel: "alternate",
        type: "application/rss+xml",
        href: sanitizeUrl(rssFeed.href),
        title: rssFeed.title || "RSS",
      },
    });
  }

  // Title & SEO
  tags.push({ tag: "title", props: { children: displayTitle } });
  if (safeDescription) {
    tags.push({ tag: "meta", props: { name: "description", content: safeDescription } });
  }
  tags.push({ tag: "meta", props: { name: "robots", content: robotsContent } });
  if (finalCanonical) {
    tags.push({
      tag: "link",
      props: { rel: "canonical", href: sanitizeUrl(finalCanonical) },
    });
  }

  // i18n Alternates (default: every configured locale of the current page, plus x-default)
  for (const alt of languageAlternates ?? defaultAlternates(url || canonical)) {
    if (alt?.href && alt?.hreflang) {
      tags.push({
        tag: "link",
        props: {
          rel: "alternate",
          hreflang: alt.hreflang,
          href: sanitizeUrl(alt.href),
        },
      });
    }
  }

  // Markdown twin & version alternates
  if (markdownUrl) {
    tags.push({
      tag: "link",
      props: {
        rel: "alternate",
        type: "text/markdown",
        href: sanitizeUrl(markdownUrl),
        title: "Markdown Format",
      },
    });
  }
  for (const alt of versionAlternates) {
    if (alt?.href && alt?.version) {
      tags.push({
        tag: "link",
        props: {
          rel: "alternate",
          "data-version": alt.version,
          href: sanitizeUrl(alt.href),
        },
      });
    }
  }

  // Open Graph
  tags.push({
    tag: "meta",
    props: { property: "og:type", content: String(resolvedOpenGraph.type || "website") },
  });
  tags.push({
    tag: "meta",
    props: { property: "og:locale", content: String(resolvedOpenGraph.locale || "en_US") },
  });
  tags.push({
    tag: "meta",
    props: {
      property: "og:url",
      content: sanitizeUrl(String(resolvedOpenGraph.url || currentUrl)),
    },
  });
  tags.push({
    tag: "meta",
    props: {
      property: "og:title",
      content: String(resolvedOpenGraph.title || title || siteName).slice(0, 200),
    },
  });
  if (resolvedOpenGraph.description) {
    tags.push({
      tag: "meta",
      props: {
        property: "og:description",
        content: String(resolvedOpenGraph.description).slice(0, 300),
      },
    });
  }
  if (absoluteResolvedOgImage) {
    tags.push({
      tag: "meta",
      props: { property: "og:image", content: sanitizeUrl(absoluteResolvedOgImage) },
    });
  }
  if (ogImgAlt) {
    tags.push({
      tag: "meta",
      props: { property: "og:image:alt", content: String(ogImgAlt) },
    });
  }
  tags.push({
    tag: "meta",
    props: {
      property: "og:site_name",
      content: String(resolvedOpenGraph.siteName || siteName),
    },
  });

  // Twitter
  tags.push({
    tag: "meta",
    props: {
      property: "twitter:card",
      content: String(resolvedTwitter.card || "summary_large_image"),
    },
  });
  tags.push({
    tag: "meta",
    props: { property: "twitter:url", content: sanitizeUrl(currentUrl) },
  });
  tags.push({
    tag: "meta",
    props: {
      property: "twitter:title",
      content: String(resolvedTwitter.title || resolvedOpenGraph.title || title || siteName).slice(
        0,
        200,
      ),
    },
  });
  if (resolvedTwitter.description) {
    tags.push({
      tag: "meta",
      props: {
        property: "twitter:description",
        content: String(resolvedTwitter.description).slice(0, 300),
      },
    });
  }
  if (absoluteResolvedOgImage) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:image", content: sanitizeUrl(absoluteResolvedOgImage) },
    });
  }
  if (ogImgAlt) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:image:alt", content: String(ogImgAlt) },
    });
  }
  if (resolvedTwitter.site) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:site", content: String(resolvedTwitter.site) },
    });
  }
  if (resolvedTwitter.creator) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:creator", content: String(resolvedTwitter.creator) },
    });
  }

  // Icons & Manifest
  tags.push({
    tag: "link",
    props: { rel: "icon", type: faviconType, href: sanitizeUrl(favicon) },
  });
  if (rawFaviconIco) {
    tags.push({
      tag: "link",
      props: { rel: "icon", href: sanitizeUrl(rawFaviconIco), sizes: "32x32" },
    });
  }
  tags.push({
    tag: "link",
    props: { rel: "apple-touch-icon", href: sanitizeUrl(appleTouchIcon) },
  });
  tags.push({
    tag: "link",
    props: { rel: "manifest", href: "/site.webmanifest" },
  });

  // Theme Metadata
  tags.push({ tag: "meta", props: { name: "color-scheme", content: "light dark" } });
  tags.push({
    tag: "meta",
    props: {
      name: "theme-color",
      media: "(prefers-color-scheme: light)",
      content: themeColor,
    },
  });
  tags.push({
    tag: "meta",
    props: {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: darkThemeColor,
    },
  });

  // Structured Data (JSON-LD) with serializeJsonLd
  const scriptProps = nonce
    ? { type: "application/ld+json", nonce }
    : { type: "application/ld+json" };

  if (config) {
    const websiteSchema = buildWebSiteSchema(config, siteUrl);
    const content = serializeJsonLd(websiteSchema);
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: content },
    });
  }

  if (articleSchema) {
    const article = buildArticleSchema(articleSchema);
    const content = serializeJsonLd(article);
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: content },
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumb = buildBreadcrumbSchema(breadcrumbs);
    const content = serializeJsonLd(breadcrumb);
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: content },
    });
  }

  return tags;
}

/**
 * Builds the strongly-typed head tag list for a page's <head>. Feed the result directly to
 * `useHead()` from @solidjs/web.
 */
export function createSeoHead(props: HeadProps = {}, boundConfig?: SeoConfig): HeadTag[] {
  return generateTags(props, boundConfig);
}

/**
 * Factory that returns a pre-configured createSeoHead bound to a custom SeoConfig. Ideal for
 * multi-tenant apps, edge workers, and contexts outside Vite virtual modules.
 */
export function defineSeoConfig(config: SeoConfig) {
  return function configuredCreateSeoHead(props: HeadProps = {}): HeadTag[] {
    return createSeoHead(props, config);
  };
}

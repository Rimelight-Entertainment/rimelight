import type { HeadProps, OpenGraphMeta, SiteConfig, TwitterMeta } from "./types.js"
import {
  buildCanonicalUrl,
  buildDefaultOgImageUrl,
  buildPageTitle,
  buildRobotsMetaContent,
  buildSafeDescription,
  buildWebSiteSchema,
  deepMerge
} from "./meta.js"
import { buildArticleSchema, buildBreadcrumbSchema } from "./schema.js"
import { escapeHtml, sanitizeUrl, serializeJsonLd } from "./sanitize.js"

/**
 * Discriminated union of all supported head tag shapes. Typed per-tag so JSX consumers get
 * autocomplete and safety on .tags without needing to fall back to raw .html.
 */
export type HeadTag =
  | { tag: "title"; children: string; props?: never }
  | {
      tag: "meta"
      props:
        | { name: string; content: string; [k: string]: string | undefined }
        | { property: string; content: string; [k: string]: string | undefined }
        | { charset: string; [k: string]: string | undefined }
        | { "http-equiv": string; "content": string; [k: string]: string | undefined }
        | Record<string, string | undefined>
      children?: never
    }
  | {
      tag: "link"
      props: { rel: string; href: string; [k: string]: string | undefined }
      children?: never
    }
  | {
      tag: "script"
      props?: { type?: string; nonce?: string; [k: string]: string | undefined }
      children: string
    }
  | {
      tag: "style"
      props?: { nonce?: string; [k: string]: string | undefined }
      children: string
    }

export interface HeadResult {
  /**
   * Sanitized raw HTML ready for direct insertion into <head>. Attribute values are
   * escapeHtml()-encoded; JSON-LD content is serializeJsonLd()-encoded; URLs are
   * sanitizeUrl()-encoded. Safe for set:html / dangerouslySetInnerHTML.
   */
  readonly html: string

  /**
   * Strongly-typed tag list for JSX, SSR AST walkers, or client meta-managers.
   */
  readonly tags: HeadTag[]

  /**
   * Return a new HeadResult with the given props merged on top of this one. Deduplication is
   * last-wins per identity key.
   */
  extend(overrides: HeadProps): HeadResult
}

/**
 * Renders an array of HeadTag objects into a clean HTML string.
 */
export function renderTagsToHtml(tags: HeadTag[]): string {
  const lines: string[] = []

  for (const t of tags) {
    if (t.tag === "title") {
      lines.push(`<title>${escapeHtml(t.children)}</title>`)
    } else if (t.tag === "meta") {
      const attrs = Object.entries(t.props || {})
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${escapeHtml(String(v))}"`)
        .join(" ")
      lines.push(`<meta ${attrs} />`)
    } else if (t.tag === "link") {
      const attrs = Object.entries(t.props || {})
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => {
          if (k === "href") {
            return `${k}="${escapeHtml(sanitizeUrl(String(v)))}"`
          }
          return `${k}="${escapeHtml(String(v))}"`
        })
        .join(" ")
      lines.push(`<link ${attrs} />`)
    } else if (t.tag === "script") {
      const attrs = Object.entries(t.props || {})
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${escapeHtml(String(v))}"`)
        .join(" ")
      const attrStr = attrs ? ` ${attrs}` : ""
      lines.push(`<script${attrStr}>${t.children}</script>`)
    } else if (t.tag === "style") {
      const attrs = Object.entries(t.props || {})
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${escapeHtml(String(v))}"`)
        .join(" ")
      const attrStr = attrs ? ` ${attrs}` : ""
      lines.push(`<style${attrStr}>${t.children}</style>`)
    }
  }

  return lines.join("\n")
}

function getTagKey(tag: HeadTag): string | null {
  if (tag.tag === "title") return "title"
  if (tag.tag === "meta") {
    const props = tag.props as Record<string, string | undefined>
    if (props["name"]) return `meta:name:${props["name"].toLowerCase()}`
    if (props["property"]) return `meta:property:${props["property"].toLowerCase()}`
    if (props["charset"]) return "meta:charset"
    if (props["http-equiv"]) return `meta:http-equiv:${props["http-equiv"].toLowerCase()}`
    return null
  }
  if (tag.tag === "link") {
    const props = tag.props
    const rel = props.rel.toLowerCase()
    if (rel === "alternate") {
      if (props["hreflang"]) return `link:alternate:hreflang:${props["hreflang"].toLowerCase()}`
      if (props["type"]) return `link:alternate:type:${props["type"].toLowerCase()}`
      if (props["data-version"]) return `link:alternate:version:${props["data-version"]}`
      return `link:alternate:${props.href}`
    }
    if (rel === "icon") {
      if (props["sizes"]) return `link:icon:${props["sizes"]}`
      if (props["type"]) return `link:icon:${props["type"]}`
      return "link:icon"
    }
    return `link:${rel}`
  }
  // LD+JSON scripts accumulate (never deduplicated)
  if (tag.tag === "script" && tag.props?.type === "application/ld+json") {
    return null
  }
  return null
}

/**
 * Merges two HeadTag lists with deterministic last-wins deduplication.
 */
export function mergeHeadTags(parentTags: HeadTag[], childTags: HeadTag[]): HeadTag[] {
  const merged: HeadTag[] = []
  const keyIndexMap = new Map<string, number>()

  for (const tag of parentTags) {
    const key = getTagKey(tag)
    if (key) {
      keyIndexMap.set(key, merged.length)
    }
    merged.push(tag)
  }

  for (const tag of childTags) {
    const key = getTagKey(tag)
    if (key && keyIndexMap.has(key)) {
      const idx = keyIndexMap.get(key)!
      merged[idx] = tag
    } else {
      if (key) {
        keyIndexMap.set(key, merged.length)
      }
      merged.push(tag)
    }
  }

  return merged
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  id: "rimelight",
  name: "Rimelight",
  description: "",
  url: "https://rimelight.com",
  author: "Rimelight Entertainment",
  email: "support@rimelight.com",
  branding: {
    logo: {
      alt: "Rimelight Logo"
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#0a0a0a"
    }
  },
  seo: {
    titleTemplate: "%s | Rimelight",
    maxDescriptionLength: 160
  }
}

/**
 * Internal tag generator from resolved HeadProps.
 */
function generateTags(props: HeadProps, baseConfig?: Partial<SiteConfig>): HeadTag[] {
  const {
    title,
    description,
    ogImage,
    ogType = "website",
    ogLocale = "en_US",
    noindex = false,
    is404 = false,
    robots,
    canonical,
    url,
    languageAlternates = [],
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
    nonce
  } = props

  const config: SiteConfig = deepMerge(DEFAULT_SITE_CONFIG, baseConfig || {}, propsConfig || {})

  const siteName = config.name || "Rimelight"
  const siteDescription = config.description || ""
  const siteUrl = config.url || (url ? new URL(url).origin : "")
  const currentUrl = url || canonical || siteUrl || "https://rimelight.com"
  const themeColor = config.branding?.colors?.themeColor || "#ffffff"
  const darkThemeColor = config.branding?.colors?.backgroundColor || "#0a0a0a"

  const rawFavicon =
    customFavicon ||
    (typeof config.branding?.favicon === "string"
      ? config.branding.favicon
      : config.branding?.favicon?.svg) ||
    config.branding?.icon ||
    "/favicon.svg"

  const rawFaviconIco =
    typeof config.branding?.favicon === "object" ? config.branding?.favicon?.ico : undefined

  const favicon = rawFavicon
  const faviconType = favicon.endsWith(".ico")
    ? "image/x-icon"
    : favicon.endsWith(".png")
      ? "image/png"
      : "image/svg+xml"

  const appleTouchIcon =
    customAppleTouchIcon || config.branding?.appleTouchIcon || "/apple-touch-icon.png"
  const twitterHandle = config.seo?.authorHandle
  const titleTemplate = config.seo?.titleTemplate || `%s | ${siteName}`

  // Calculated Values (strictly bounded per RFC)
  const displayTitle = buildPageTitle({
    ...(title !== undefined && { title }),
    siteName,
    titleTemplate,
    ...(is404 !== undefined && { is404 }),
    ...(absolute !== undefined && { absolute })
  }).slice(0, 200)

  const finalDescription = description || siteDescription
  const safeDescription = config.seo?.maxDescriptionLength
    ? buildSafeDescription(finalDescription, Math.min(config.seo.maxDescriptionLength, 300))
    : buildSafeDescription(finalDescription, 300)

  const defaultDynamicOg = buildDefaultOgImageUrl({
    title,
    description: finalDescription,
    siteName
  })
  const ogImageFallback = config.seo?.ogImageFallback || config.ogImage || defaultDynamicOg

  const rawOgImage = Array.isArray(ogImage)
    ? ogImage[0]
    : typeof ogImage === "string"
      ? { src: ogImage, alt: siteName }
      : ogImage

  const finalOgImage =
    rawOgImage ||
    (ogImageFallback
      ? typeof ogImageFallback === "string"
        ? { src: ogImageFallback, alt: siteName }
        : ogImageFallback
      : undefined)

  let absoluteOgImage: string | undefined
  if (finalOgImage?.src) {
    try {
      absoluteOgImage = new URL(finalOgImage.src, currentUrl).toString()
    } catch {
      absoluteOgImage = finalOgImage.src
    }
  }

  let finalCanonical: string | undefined
  if (canonical) {
    finalCanonical = buildCanonicalUrl(canonical, siteUrl || currentUrl)
  } else if (!is404 && currentUrl) {
    finalCanonical = buildCanonicalUrl(currentUrl, siteUrl || currentUrl)
  }

  const robotsContent = buildRobotsMetaContent({
    noindex,
    is404,
    ...(robots !== undefined && { override: robots })
  })

  // Deep-merged OpenGraph
  const defaultOpenGraph: OpenGraphMeta = {
    type: ogType,
    locale: ogLocale,
    url: currentUrl,
    title: title || siteName,
    ...(safeDescription && { description: safeDescription }),
    ...(absoluteOgImage && {
      images: [{ src: absoluteOgImage, alt: finalOgImage?.alt || siteName }]
    }),
    siteName,
    ...config.openGraph
  }
  const resolvedOpenGraph = deepMerge(defaultOpenGraph, openGraph || {})
  if (ogImage) {
    resolvedOpenGraph.images = ogImage
  }

  const ogImgUrl = resolvedOpenGraph.images
    ? Array.isArray(resolvedOpenGraph.images)
      ? resolvedOpenGraph.images[0]?.src
      : typeof resolvedOpenGraph.images === "string"
        ? resolvedOpenGraph.images
        : (resolvedOpenGraph.images as { src: string }).src
    : absoluteOgImage

  const ogImgAlt = resolvedOpenGraph.images
    ? Array.isArray(resolvedOpenGraph.images)
      ? resolvedOpenGraph.images[0]?.alt
      : typeof resolvedOpenGraph.images === "object" && "alt" in resolvedOpenGraph.images
        ? (resolvedOpenGraph.images as { alt?: string }).alt
        : finalOgImage?.alt || siteName
    : finalOgImage?.alt || siteName

  let absoluteResolvedOgImage: string | undefined
  if (ogImgUrl) {
    try {
      absoluteResolvedOgImage = new URL(ogImgUrl, currentUrl).toString()
    } catch {
      absoluteResolvedOgImage = ogImgUrl
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
    ...config.twitter
  }
  const resolvedTwitter = deepMerge(defaultTwitter, twitter || {})
  if (twitterCard) {
    resolvedTwitter.card = twitterCard
  }
  if (!resolvedTwitter.card) {
    resolvedTwitter.card = absoluteResolvedOgImage ? "summary_large_image" : "summary"
  }

  const tags: HeadTag[] = []

  // Basic Metadata
  if (charset) {
    tags.push({ tag: "meta", props: { charset } })
  }
  if (viewport) {
    tags.push({ tag: "meta", props: { name: "viewport", content: viewport } })
  }

  // Sitemap
  tags.push({ tag: "link", props: { rel: "sitemap", href: "/sitemap.xml" } })

  // RSS Feed
  if (rssFeed?.href) {
    tags.push({
      tag: "link",
      props: {
        rel: "alternate",
        type: "application/rss+xml",
        href: sanitizeUrl(rssFeed.href),
        title: rssFeed.title || "RSS"
      }
    })
  }

  // Title & SEO
  tags.push({ tag: "title", children: displayTitle })
  if (safeDescription) {
    tags.push({ tag: "meta", props: { name: "description", content: safeDescription } })
  }
  tags.push({ tag: "meta", props: { name: "robots", content: robotsContent } })
  if (finalCanonical) {
    tags.push({
      tag: "link",
      props: { rel: "canonical", href: sanitizeUrl(finalCanonical) }
    })
  }

  // i18n Alternates
  for (const alt of languageAlternates) {
    if (alt?.href && alt?.hreflang) {
      tags.push({
        tag: "link",
        props: {
          rel: "alternate",
          hreflang: alt.hreflang,
          href: sanitizeUrl(alt.href)
        }
      })
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
        title: "Markdown Format"
      }
    })
  }
  for (const alt of versionAlternates) {
    if (alt?.href && alt?.version) {
      tags.push({
        tag: "link",
        props: {
          "rel": "alternate",
          "data-version": alt.version,
          "href": sanitizeUrl(alt.href)
        }
      })
    }
  }

  // Open Graph
  tags.push({
    tag: "meta",
    props: { property: "og:type", content: String(resolvedOpenGraph.type || "website") }
  })
  tags.push({
    tag: "meta",
    props: { property: "og:locale", content: String(resolvedOpenGraph.locale || "en_US") }
  })
  tags.push({
    tag: "meta",
    props: { property: "og:url", content: sanitizeUrl(String(resolvedOpenGraph.url || currentUrl)) }
  })
  tags.push({
    tag: "meta",
    props: {
      property: "og:title",
      content: String(resolvedOpenGraph.title || title || siteName).slice(0, 200)
    }
  })
  if (resolvedOpenGraph.description) {
    tags.push({
      tag: "meta",
      props: {
        property: "og:description",
        content: String(resolvedOpenGraph.description).slice(0, 300)
      }
    })
  }
  if (absoluteResolvedOgImage) {
    tags.push({
      tag: "meta",
      props: { property: "og:image", content: sanitizeUrl(absoluteResolvedOgImage) }
    })
  }
  if (ogImgAlt) {
    tags.push({
      tag: "meta",
      props: { property: "og:image:alt", content: String(ogImgAlt) }
    })
  }
  tags.push({
    tag: "meta",
    props: {
      property: "og:site_name",
      content: String(resolvedOpenGraph.siteName || siteName)
    }
  })

  // Twitter
  tags.push({
    tag: "meta",
    props: {
      property: "twitter:card",
      content: String(resolvedTwitter.card || "summary_large_image")
    }
  })
  tags.push({
    tag: "meta",
    props: { property: "twitter:url", content: sanitizeUrl(currentUrl) }
  })
  tags.push({
    tag: "meta",
    props: {
      property: "twitter:title",
      content: String(resolvedTwitter.title || resolvedOpenGraph.title || title || siteName).slice(
        0,
        200
      )
    }
  })
  if (resolvedTwitter.description) {
    tags.push({
      tag: "meta",
      props: {
        property: "twitter:description",
        content: String(resolvedTwitter.description).slice(0, 300)
      }
    })
  }
  if (absoluteResolvedOgImage) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:image", content: sanitizeUrl(absoluteResolvedOgImage) }
    })
  }
  if (ogImgAlt) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:image:alt", content: String(ogImgAlt) }
    })
  }
  if (resolvedTwitter.site) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:site", content: String(resolvedTwitter.site) }
    })
  }
  if (resolvedTwitter.creator) {
    tags.push({
      tag: "meta",
      props: { property: "twitter:creator", content: String(resolvedTwitter.creator) }
    })
  }

  // Icons & Manifest
  tags.push({
    tag: "link",
    props: { rel: "icon", type: faviconType, href: sanitizeUrl(favicon) }
  })
  if (rawFaviconIco) {
    tags.push({
      tag: "link",
      props: { rel: "icon", href: sanitizeUrl(rawFaviconIco), sizes: "32x32" }
    })
  } else if (!customFavicon) {
    tags.push({
      tag: "link",
      props: { rel: "icon", href: "/favicon.ico", sizes: "32x32" }
    })
  }
  tags.push({
    tag: "link",
    props: { rel: "apple-touch-icon", href: sanitizeUrl(appleTouchIcon) }
  })
  tags.push({
    tag: "link",
    props: { rel: "manifest", href: "/site.webmanifest" }
  })

  // Theme Metadata
  tags.push({ tag: "meta", props: { name: "color-scheme", content: "light dark" } })
  tags.push({
    tag: "meta",
    props: {
      name: "theme-color",
      media: "(prefers-color-scheme: light)",
      content: themeColor
    }
  })
  tags.push({
    tag: "meta",
    props: {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: darkThemeColor
    }
  })

  // Structured Data (JSON-LD) with serializeJsonLd
  const scriptProps = nonce
    ? { type: "application/ld+json", nonce }
    : { type: "application/ld+json" }

  if (config) {
    const websiteSchema = buildWebSiteSchema(config, siteUrl)
    tags.push({
      tag: "script",
      props: scriptProps,
      children: serializeJsonLd(websiteSchema)
    })
  }

  if (articleSchema) {
    const article = buildArticleSchema(articleSchema)
    tags.push({
      tag: "script",
      props: scriptProps,
      children: serializeJsonLd(article)
    })
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumb = buildBreadcrumbSchema(breadcrumbs)
    tags.push({
      tag: "script",
      props: scriptProps,
      children: serializeJsonLd(breadcrumb)
    })
  }

  return tags
}

/**
 * Creates a strongly-typed HeadResult containing sanitized HTML and HeadTag AST.
 */
export function createSeoHead(
  props: HeadProps = {},
  boundConfig?: Partial<SiteConfig>
): HeadResult {
  const tags = generateTags(props, boundConfig)
  const html = renderTagsToHtml(tags)

  return {
    html,
    tags,
    extend(overrides: HeadProps): HeadResult {
      const mergedProps = deepMerge(props, overrides)
      return createSeoHead(mergedProps, boundConfig)
    }
  }
}

/**
 * Alias for createSeoHead for ergonomic imports.
 */
export const createHead = createSeoHead

/**
 * Factory that returns a pre-configured createSeoHead bound to a custom SiteConfig. Ideal for
 * multi-tenant apps, edge workers, and contexts outside Vite virtual modules.
 */
export function defineSeoConfig(siteConfig: Partial<SiteConfig>) {
  return function configuredCreateSeoHead(props: HeadProps = {}): HeadResult {
    return createSeoHead(props, siteConfig)
  }
}

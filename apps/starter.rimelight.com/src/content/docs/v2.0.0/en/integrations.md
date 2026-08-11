---
title: Integrations
description: Astro integrations bundled with the starter — UI, i18n, security, sitemap, MDX, Cloudflare, and more.
---

The starter wires up a curated set of Astro integrations in `astro.config.ts`. This page documents each integration, what it does, and how to configure it.

---

## `@rimelight/ui` — UI Component Library

The `ui()` integration from `@rimelight/ui` is the heart of the template. It:

- Injects global CSS design tokens and base styles
- Registers the UnoCSS preset (Tailwind v4-style utilities)
- Configures logo assets used by `<RLALogo>`
- Sets up keyboard shortcut categories for `<RLAShortcuts>`

```ts
import { ui } from "@rimelight/ui"

ui({
  shortcuts: {
    categories: {
      system: { label: "System" },
      navigation: { label: "Navigation" }
    }
  },
  logos: {
    logomark: {
      color: "./src/assets/logos/logomark_color.svg",
      white: "./src/assets/logos/logomark_white.svg",
      black: "./src/assets/logos/logomark_black.svg"
    },
    logotype: {/* … */}
  }
})
```

---

## `@rimelight/i18n` — Internationalization

The `rimelightI18n()` integration handles multi-locale routing and translation loading:

- Loads translation JSON from `src/translations/`
- Publishes translations to a Cloudflare KV namespace for edge delivery
- Injects the `t()` helper into `Astro.locals`

```ts
import { rimelightI18n } from "@rimelight/i18n/integration"

rimelightI18n({
  translations: { en, pt },
  kvBinding: "my-project_translations"
})
```

See the [Internationalization docs](/en/docs/i18n/) for full setup instructions.

---

## `@rimelight/security` — CSP & SRI

The `sri()` integration and `defineSecurity()` config helper apply security hardening:

- **Content Security Policy (CSP)** — strict `default-src` with explicit allow-lists
- **Subresource Integrity (SRI)** — hash attributes on `<script>` and `<link>` tags
- **Secure cookies** — `Secure`, `HttpOnly`, `SameSite=Strict` on auth cookies

```ts
import { sri } from "@rimelight/security"
import { defineSecurity } from "@rimelight/security/config"

security: defineSecurity({
  domain: "my-project.com",
  imgSrc: ["https://cdn.example.com"]
})

integrations: [sri()]
```

---

## `@astrojs/cloudflare` — Edge Adapter

The Cloudflare adapter transforms the Astro build output into a Cloudflare Workers bundle:

```ts
import cloudflare from "@astrojs/cloudflare"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"

output:  "server",
adapter: cloudflare(),
cache: {
  provider: cacheCloudflare()
}
```

`cacheCloudflare()` wires Astro's cache API to Cloudflare's Cache API, so `routeRules` caching is respected at the edge.

---

## `@astrojs/sitemap` — XML Sitemap

Generates a standards-compliant `sitemap.xml` with locale alternate links:

```ts
import sitemap from "@astrojs/sitemap"

sitemap({
  i18n: {
    defaultLocale: "en",
    locales: { en: "en-US", pt: "pt-BR" }
  }
})
```

The sitemap is served at `/sitemap-index.xml` and linked from `<head>`.

---

## `@astrojs/mdx` — MDX Support

Enables `.mdx` files in content collections, allowing Rimelight UI components to be embedded directly inside Markdown documentation:

```ts
import mdx from "@astrojs/mdx"

integrations: [mdx()]
```

Syntax highlighting is configured globally via:

```ts
markdown: {
  syntaxHighlight: "prism"
}
```

---

## Astro Fonts — Web Font Optimization

Astro's built-in Fonts API loads fonts from the Fontsource CDN with automatic subset optimization:

```ts
fonts: [
  {
    provider: fontProviders.fontsource(),
    name: "Noto Sans",
    cssVariable: "--font-sans",
    fallbacks: ["sans-serif"]
  },
  {
    provider: fontProviders.fontsource(),
    name: "Noto Serif",
    cssVariable: "--font-serif",
    fallbacks: ["serif"]
  },
  {
    provider: fontProviders.fontsource(),
    name: "JetBrains Mono",
    cssVariable: "--font-mono",
    fallbacks: ["monospace"]
  }
]
```

---

## Experimental Features

The following Astro experimental flags are enabled:

| Flag                           | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `contentIntellisense`          | TypeScript types for content collection frontmatter in your editor |
| `clientPrerender`              | Prefetches and prerenders pages on hover for instant navigation    |
| `collectionStorage: "chunked"` | Splits large content collections into lazy-loaded chunks           |
| `svgOptimizer`                 | Runs SVGO on imported SVG files to reduce bundle size              |

These can be disabled individually in `astro.config.ts > experimental` if not needed.

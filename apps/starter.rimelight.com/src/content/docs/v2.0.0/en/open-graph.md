---
title: Open Graph Images
description: Automatic edge-rendered social share images using Satori and Resvg-WASM.
---

The starter generates **Open Graph (OG) images** on-demand at the edge — no pre-rendered images, no external services. Each page's social preview card is rendered as a 1200×630 PNG directly inside the Cloudflare Worker.

---

## How It Works

The image endpoint lives at `src/pages/open-graph/[...route].png.ts` and responds to URLs like:

```
/open-graph/my-page-title.png?title=Hello+World&description=A+great+post&type=Blog
```

The pipeline is:

1. **Satori** converts a JSX-like object tree into an SVG.
2. **Resvg-WASM** rasterizes the SVG into a PNG buffer.
3. The response is returned with aggressive cache headers (`max-age=31536000, immutable`).

Both Satori and Resvg are loaded from WASM modules, so they run natively inside the Worker without any Node.js dependencies.

---

## Initialization

WASM modules are initialized once per isolate:

```ts
let initialized = false

async function init() {
  if (initialized) return
  await initYoga(yogaWasm)
  try {
    await initWasm(resvgWasm)
  } catch {
    // Already initialized (harmless)
  }
  initialized = true
}
```

Font buffers (Noto Sans Regular + Bold) are fetched from `cdn.jsdelivr.net` on first use and cached in module scope for the lifetime of the isolate.

---

## Card Styles

Two visual styles are supported via the `isDocs` parameter:

| Style       | Background                   | Use case                  |
| ----------- | ---------------------------- | ------------------------- |
| **Default** | Solid `#0a0a0a`              | Blog posts, general pages |
| **Docs**    | Gradient `#0a0a0a → #1a1a2e` | Documentation pages       |

The docs style adds a blue accent bar above the title and a pill badge showing the content type.

---

## Query Parameters

| Parameter     | Type                 | Description                                           |
| ------------- | -------------------- | ----------------------------------------------------- |
| `title`       | `string`             | Main heading on the card                              |
| `description` | `string`             | Subtitle / excerpt                                    |
| `type`        | `string`             | Content type label (e.g. `"Blog"`, `"Documentation"`) |
| `pubDate`     | `string`             | Publication date (shown in footer)                    |
| `isDocs`      | `"true"` / `"false"` | Switches to the docs card style                       |

The route parameter itself (`[...route]`) can also encode the title, and if the route contains `"docs"` the docs style is applied automatically.

---

## Using OG Images in Pages

Layouts automatically inject `<meta property="og:image">` tags. To point a page at a custom OG image, pass the query-string-encoded URL:

```astro
---
const ogUrl = new URL("/open-graph/my-page.png", Astro.site)
ogUrl.searchParams.set("title", "My Page Title")
ogUrl.searchParams.set("description", "A short description.")
ogUrl.searchParams.set("type", "Blog")
---
<meta property="og:image" content={ogUrl.toString()} />
```

The base layout does this automatically using the `title` and `description` frontmatter from each page.

---

## Fonts

Noto Sans (latin subset) is loaded at runtime from the Fontsource CDN:

```ts
const [regular, bold] = await Promise.all([
  fetch("https://cdn.jsdelivr.net/.../noto-sans@latest/latin-400-normal.ttf"),
  fetch("https://cdn.jsdelivr.net/.../noto-sans@latest/latin-700-normal.ttf")
])
```

Font buffers are cached in module scope, so only the first request per isolate incurs the fetch cost. On Cloudflare, isolates are reused across many requests, so in practice fonts are fetched only on cold starts.

---

## Customising the Card Design

Edit the `buildOgJsx()` function in `src/pages/open-graph/[...route].png.ts` to change colours, layout, or add your logo. Satori accepts a subset of CSS Flexbox and a JSX-like object tree — see the [Satori README](https://github.com/vercel/satori) for supported properties.

To embed a logo SVG, convert it to a base64 data URI and pass it as the `src` of an `img` element in the JSX tree.

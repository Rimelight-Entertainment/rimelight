/**
 * Font configuration for OG image rendering. Pass to `loadOgFonts()` or `renderOgResponse()`.
 */
export interface OgFontConfig {
  /**
   * Font-family name referenced in layout styles
   */
  name: string
  /**
   * URL to the regular-weight TTF
   */
  regularUrl: string
  /**
   * URL to the bold-weight TTF
   */
  boldUrl: string
}

/**
 * Default font: Noto Sans from jsDelivr Fontsource CDN.
 */
export const NOTO_SANS: OgFontConfig = {
  name: "Noto Sans",
  regularUrl: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf",
  boldUrl: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf"
}

/**
 * Options for the default OG image layout. Build your own layout instead via `renderOgResponse()`
 * directly.
 */
export interface OgLayoutOptions {
  /**
   * Main heading -- required
   */
  title: string
  /**
   * Subtitle / excerpt beneath the title
   */
  description?: string
  /**
   * Branding shown top-left. Pass a plain string (site name) or a pre-built takumi-js VNode for a
   * custom logo treatment.
   */
  brand?: string | object
  /**
   * Pill badge shown bottom-left. e.g. "Blog Post", "Documentation", "Legal"
   */
  badge?: string
  /**
   * Date string shown bottom-right. e.g. new Date(postedAt).toLocaleDateString()
   */
  date?: string
  /**
   * Background style. "dark" -> solid #0a0a0a (default) "gradient" -> diagonal dark-to-navy
   * gradient any string -> treated as a CSS `background` value
   */
  background?: "dark" | "gradient" | (string & {})
  /**
   * When true, overlays a dashed red PREVIEW border. Useful during development.
   */
  preview?: boolean
}

/**
 * Rendering config shared by `renderOgResponse()` and `renderDefaultOg()`.
 */
export interface OgRenderConfig {
  /**
   * Font to embed -- defaults to `NOTO_SANS`
   */
  font?: OgFontConfig
  /**
   * Image width in px -- defaults to 1200
   */
  width?: number
  /**
   * Image height in px -- defaults to 630
   */
  height?: number
}

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

const fontCaches = new Map<string, { regular: ArrayBuffer; bold: ArrayBuffer }>()

/**
 * Fetches an ArrayBuffer with a timeout.
 */
async function fetchArrayBuffer(url: string, timeoutMs = 5000): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`Failed to fetch font from ${url}: status ${res.status}`)
    }
    return await res.arrayBuffer()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetches and caches the regular + bold TTF buffers for the given font config. Uses a module-level
 * cache keyed on `regularUrl`, so repeated calls within the same Worker lifetime are free after the
 * first fetch.
 */
export async function loadOgFonts(
  config: OgFontConfig = NOTO_SANS,
  timeoutMs = 5000
): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  const cached = fontCaches.get(config.regularUrl)
  if (cached) return cached

  const [regular, bold] = await Promise.all([
    fetchArrayBuffer(config.regularUrl, timeoutMs),
    fetchArrayBuffer(config.boldUrl, timeoutMs)
  ])
  const result = { regular, bold }
  fontCaches.set(config.regularUrl, result)
  return result
}

// ---------------------------------------------------------------------------
// Default layout builder
// ---------------------------------------------------------------------------

/**
 * Builds a takumi-js-compatible VNode for the default Rimelight OG layout.
 *
 * Consumers that need a fully custom look should build their own VNode and call
 * `renderOgResponse()` directly -- this function is just the house style.
 */
export function defaultOgLayout(options: OgLayoutOptions, font: OgFontConfig = NOTO_SANS): object {
  const {
    title = "",
    description,
    brand,
    badge,
    date,
    background = "dark",
    preview = false
  } = options

  const MAX_TITLE_LEN = 160
  const MAX_DESC_LEN = 240
  const safeTitle = title.length > MAX_TITLE_LEN ? title.slice(0, MAX_TITLE_LEN - 1) + "…" : title
  const safeDescription =
    description && description.length > MAX_DESC_LEN
      ? description.slice(0, MAX_DESC_LEN - 1) + "…"
      : description

  const bg =
    background === "dark"
      ? { backgroundColor: "#0a0a0a" }
      : background === "gradient"
        ? { background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)" }
        : { background }

  const isGradient = background !== "dark"

  const brandNode: object =
    typeof brand === "object" && brand !== null
      ? brand
      : {
          type: "span",
          props: {
            style: {
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em"
            },
            children: brand ?? ""
          }
        }

  const accentBar: object | null = isGradient
    ? {
        type: "div",
        props: {
          style: {
            width: "60px",
            height: "4px",
            backgroundColor: "#60a5fa",
            borderRadius: "2px",
            marginBottom: "16px"
          }
        }
      }
    : null

  const titleFontSize = isGradient ? "52px" : "56px"
  const descColor = isGradient ? "#94a3b8" : "#a0a0a0"
  const descFontSize = isGradient ? "22px" : "24px"

  const badgeNode: object | null = badge
    ? isGradient
      ? {
          type: "div",
          props: {
            style: {
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(96,165,250,0.15)",
              border: "1px solid rgba(96,165,250,0.3)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#93c5fd"
            },
            children: badge
          }
        }
      : {
          type: "div",
          props: {
            style: {
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid #333333",
              fontSize: "16px",
              fontWeight: 600,
              color: "#e5e5e5"
            },
            children: badge
          }
        }
    : null

  const dateNode: object | null = date
    ? {
        type: "div",
        props: {
          style: { fontSize: "16px", color: "#666666" },
          children: date
        }
      }
    : null

  const previewOverlay: object | null = preview
    ? {
        type: "div",
        props: {
          style: {
            position: "absolute",
            inset: 0,
            border: "6px dashed #ff4444",
            pointerEvents: "none"
          }
        }
      }
    : null

  const previewLabel: object | null = preview
    ? {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: "#ff4444",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            padding: "6px 16px",
            borderRadius: "4px",
            letterSpacing: "0.05em"
          },
          children: "PREVIEW"
        }
      }
    : null

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px",
        color: "#e5e5e5",
        fontFamily: font.name,
        position: "relative",
        overflow: "hidden",
        ...bg
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center" },
            children: [brandNode]
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
              paddingTop: "24px"
            },
            children: [
              accentBar,
              {
                type: "div",
                props: {
                  style: {
                    fontSize: titleFontSize,
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    maxWidth: "950px"
                  },
                  children: safeTitle
                }
              },
              safeDescription
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: descFontSize,
                        fontWeight: 400,
                        color: descColor,
                        marginTop: isGradient ? "12px" : "16px",
                        lineHeight: 1.4,
                        maxWidth: isGradient ? "800px" : "850px"
                      },
                      children: safeDescription
                    }
                  }
                : null
            ].filter(Boolean)
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: isGradient ? "flex-start" : "space-between",
              gap: "12px",
              marginTop: "auto"
            },
            children: [badgeNode, dateNode].filter(Boolean)
          }
        },
        previewOverlay,
        previewLabel
      ].filter(Boolean)
    }
  }
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

/**
 * Renders any takumi-js VNode to a PNG `Response` with standard OG headers. Use this when you
 * supply your own layout entirely.
 *
 * @example
 *   const vnode = myBrandedLayout({ title, description })
 *   return renderOgResponse(vnode, { font: MY_FONT })
 */
export async function renderOgResponse(
  vnode: object,
  config: OgRenderConfig = {}
): Promise<Response> {
  const { font = NOTO_SANS, width = 1200, height = 630 } = config

  try {
    const { render } = await import("takumi-js")
    const { regular, bold } = await loadOgFonts(font)

    const pngBuffer = await render(vnode, {
      width,
      height,
      fonts: [
        { name: font.name, data: regular, weight: 400, style: "normal" },
        { name: font.name, data: bold, weight: 700, style: "normal" }
      ]
    })

    return new Response(new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000"
      }
    })
  } catch (error) {
    console.error("[OG Render Error]:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to render Open Graph image",
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    )
  }
}

/**
 * Renders the default OG layout to a PNG `Response`. The 90% case -- use `renderOgResponse()` for
 * full layout control.
 *
 * @example
 *   export const GET: APIRoute = async ({ request }) => {
 *     const url = new URL(request.url)
 *     return renderDefaultOg({
 *       title: url.searchParams.get("title") ?? "Untitled",
 *       description: url.searchParams.get("description") ?? "",
 *       brand: "My Site",
 *       badge: url.searchParams.get("type") ?? ""
 *     })
 *   }
 */
export async function renderDefaultOg(
  options: OgLayoutOptions,
  config: OgRenderConfig = {}
): Promise<Response> {
  const { font = NOTO_SANS } = config
  const vnode = defaultOgLayout(options, font)
  return renderOgResponse(vnode, config)
}

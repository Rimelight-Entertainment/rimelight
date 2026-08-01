import type { APIContext, MiddlewareNext } from "astro"
import { defineMiddleware } from "astro:middleware"

// @ts-ignore virtual module resolved by SRI Vite plugin
import { manifest as sriManifest } from "virtual:sri-manifest"

function isManifestRecord(obj: unknown): obj is Record<string, string> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj)
}

const manifest: Record<string, string> = isManifestRecord(sriManifest) ? sriManifest : {}

declare const HTMLRewriter: any

function assertManifest(obj: unknown): asserts obj is Record<string, string> {
  if (!obj || typeof obj !== "object") throw new Error("Expected manifest")
}

// Assert and pre-compile regular expressions once at startup
assertManifest(manifest)

const manifestRegexes = Object.entries(manifest).map(([url, hash]) => ({
  hash,
  scriptRegex: new RegExp(`(<script[^>]+src=["']${url}["'][^>]*)(/?>)`, "g"),
  linkRegex: new RegExp(`(<link[^>]+href=["']${url}["'][^>]*)(/?>)`, "g")
}))

function addSecurityHeaders(response: Response, origin?: string): Response {
  try {
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin")
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    )
    response.headers.set("No-Vary-Search", 'except=("q" "search" "locale"), params=?1')
    if (origin) {
      response.headers.set(
        "Link",
        [
          `<${origin}/sitemap-index.xml>; rel="sitemap"`,
          `<${origin}/llms.txt>; rel="llms"`,
          `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
          `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`
        ].join(", ")
      )
    }
    return response
  } catch {
    const headers = new Headers(response.headers)
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    headers.set("X-Content-Type-Options", "nosniff")
    headers.set("X-Frame-Options", "DENY")
    headers.set("Cross-Origin-Resource-Policy", "same-origin")
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    )
    headers.set("No-Vary-Search", 'except=("q" "search" "locale"), params=?1')
    if (origin) {
      headers.set(
        "Link",
        [
          `<${origin}/sitemap-index.xml>; rel="sitemap"`,
          `<${origin}/llms.txt>; rel="llms"`,
          `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
          `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`
        ].join(", ")
      )
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
}

/**
 * Security Middleware: Injects SRI integrity attributes and security headers.
 */
export const security = defineMiddleware(async (context: APIContext, next: MiddlewareNext) => {
  // HTTP to HTTPS redirect only in production based on x-forwarded-proto
  const isProd = import.meta.env.PROD
  const isDev = import.meta.env.DEV
  const proto = context.request.headers.get("x-forwarded-proto")
  if (isProd && proto === "http") {
    const httpsUrl = context.request.url.replace(/^http:/, "https:")
    return Response.redirect(httpsUrl, 301)
  }

  const response = await next()
  const contentType = response.headers.get("content-type") || ""

  // Early return for non-HTML responses (avoid body parsing/corruption/overhead)
  if (!contentType.includes("text/html")) {
    return addSecurityHeaders(response, context.url.origin)
  }

  if (isDev) {
    const cleanHeaders = new Headers(response.headers)
    cleanHeaders.delete("content-security-policy")
    let modifiedHtml = await response.text()
    modifiedHtml = modifiedHtml.replace(
      /<meta\s[^>]*http-equiv\s*=\s*["']?content-security-policy[^>]*>/gi,
      ""
    )
    return addSecurityHeaders(
      new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: cleanHeaders
      }),
      context.url.origin
    )
  }

  // Generate a per-request nonce. Cloudflare reads 'nonce-*' from the CSP header and
  // automatically applies it to any scripts it injects (e.g. challenge-platform).
  // The nonce is also stamped on every <script> tag so Astro's own scripts still load.
  const nonce = crypto.randomUUID().replace(/-/g, "")

  let cspHeader = response.headers.get("content-security-policy")
  const newHeaders = new Headers(response.headers)

  if (cspHeader) {
    // Unescape HTML entities (like &#39; or &#x27; to ') that Astro's native CSP generation mistakenly puts in the header
    cspHeader = cspHeader
      .replace(/&#0*39;/g, "'")
      .replace(/&#x0*27;/gi, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")

    // Inject the nonce into script-src (additive alongside existing hashes)
    cspHeader = cspHeader.replace(/(script-src\s)/i, `$1'nonce-${nonce}' `)

    newHeaders.set("content-security-policy", cspHeader)
  }

  if (typeof HTMLRewriter !== "undefined") {
    let rewriter = new HTMLRewriter()

    // Only register handlers if there are items to hash
    if (manifestRegexes.length > 0) {
      rewriter = rewriter
        .on("script[src]", {
          element(el: any) {
            const src = el.getAttribute("src")
            if (src && manifest[src]) {
              el.setAttribute("integrity", manifest[src])
              el.setAttribute("crossorigin", "anonymous")
            }
          }
        })
        .on('link[rel="stylesheet"][href]', {
          element(el: any) {
            const href = el.getAttribute("href")
            if (href && manifest[href]) {
              el.setAttribute("integrity", manifest[href])
              el.setAttribute("crossorigin", "anonymous")
            }
          }
        })
    }

    // Stamp nonce on every <script> tag so Astro's own scripts are still allowed
    rewriter = rewriter.on("script", {
      element(el: any) {
        el.setAttribute("nonce", nonce)
      }
    })

    rewriter = rewriter.on('meta[http-equiv="content-security-policy" i]', {
      element(el: any) {
        el.remove()
      }
    })

    return addSecurityHeaders(
      rewriter.transform(
        new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        })
      ),
      context.url.origin
    )
  }

  let modifiedHtml = await response.text()

  // Remove Astro-injected CSP meta tag to prevent duplicate CSP headers and HTML escaping errors
  modifiedHtml = modifiedHtml.replace(
    /<meta\s[^>]*http-equiv\s*=\s*["']?content-security-policy[^>]*>/gi,
    ""
  )

  // Stamp nonce on every <script> tag (regex fallback path)
  modifiedHtml = modifiedHtml.replace(
    /<script(\s[^>]*)?>/gi,
    (_match, attrs = "") => `<script${attrs} nonce="${nonce}">`
  )

  // Use pre-compiled regexes
  for (const { hash, scriptRegex, linkRegex } of manifestRegexes) {
    if (!hash) continue

    modifiedHtml = modifiedHtml.replace(
      scriptRegex,
      `$1 integrity="${hash}" crossorigin="anonymous"$2`
    )

    modifiedHtml = modifiedHtml.replace(
      linkRegex,
      `$1 integrity="${hash}" crossorigin="anonymous"$2`
    )
  }

  return addSecurityHeaders(
    new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    }),
    context.url.origin
  )
})

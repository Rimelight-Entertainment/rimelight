import { defineMiddleware } from "astro:middleware"

declare const HTMLRewriter: any

export const nonce = defineMiddleware(async (context, next) => {
  const response = await next()
  const contentType = response.headers.get("content-type") || ""

  if (!contentType.includes("text/html")) {
    return response
  }

  const cspHeader = response.headers.get("content-security-policy")
  if (!cspHeader) {
    return response
  }

  // Generate a cryptographically secure random nonce
  const nonceValue = crypto.randomUUID().replace(/-/g, "")

  // Append the nonce to the script-src directive
  let newCsp = cspHeader
  if (newCsp.includes("script-src ")) {
    newCsp = newCsp.replace("script-src ", `script-src 'nonce-${nonceValue}' `)
  } else {
    newCsp = newCsp + `; script-src 'nonce-${nonceValue}'`
  }

  const newHeaders = new Headers(response.headers)
  newHeaders.set("content-security-policy", newCsp)

  // Use HTMLRewriter (Cloudflare production edge) if available
  if (typeof HTMLRewriter !== "undefined") {
    const transformedResponse = new HTMLRewriter()
      .on("script:not([src])", {
        element(el: any) {
          el.setAttribute("nonce", nonceValue)
        }
      })
      .transform(new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      }))
    return transformedResponse
  }

  // Fallback for local development/Node environments (regex replace)
  let html = await response.text()
  
  // Inject the nonce attribute into any script tag that does NOT have a src attribute
  html = html.replace(
    /<script(?![^>]*src=)(?![^>]*nonce=)([^>]*)>/gi,
    `<script$1 nonce="${nonceValue}">`
  )

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
})

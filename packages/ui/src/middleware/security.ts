import { defineMiddleware } from "astro:middleware"

export const security = defineMiddleware(async (context, next) => {
  // HTTP to HTTPS redirect
  if (context.request.url.startsWith("http://")) {
    const httpsUrl = context.request.url.replace(/^http:/, "https:")
    return Response.redirect(httpsUrl, 301)
  }

  const response = await next()

  const newResponse = new Response(response.body, response)

  // Standard Security Headers
  newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  newResponse.headers.set("X-Content-Type-Options", "nosniff")
  newResponse.headers.set("X-Frame-Options", "DENY")
  newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin")
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

  return newResponse
})
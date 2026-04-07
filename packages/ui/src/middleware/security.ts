import { defineMiddleware } from "astro:middleware"

export const security = defineMiddleware(async (_, next) => {
  const response = await next()

  const newResponse = new Response(response.body, response)

  // Standard Security Headers
  newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  newResponse.headers.set("X-Content-Type-Options", "nosniff")
  newResponse.headers.set("X-Frame-Options", "DENY")
  newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin")

  return newResponse
})

import type { APIRoute } from "astro"
import { masterIconBuffer, isSvg } from "virtual:rimelight-seo/assets"

export const prerender = true

export const GET: APIRoute = async () => {
  if (!masterIconBuffer || !isSvg) {
    return new Response(null, { status: 404 })
  }

  return new Response(new Uint8Array(masterIconBuffer), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  })
}

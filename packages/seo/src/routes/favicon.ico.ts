import type { APIRoute } from "astro"
import { generateIco } from "../assets.js"
import { masterIconBuffer } from "virtual:rimelight-seo/assets"

export const prerender = true

export const GET: APIRoute = async () => {
  if (!masterIconBuffer) {
    return new Response(null, { status: 404 })
  }

  const ico = await generateIco(masterIconBuffer, 32)
  return new Response(new Uint8Array(ico), {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  })
}

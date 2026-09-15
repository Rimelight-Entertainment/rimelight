import type { APIRoute } from "astro"
import { generateMaskablePng } from "../assets.js"
import { masterIconBuffer, backgroundColor } from "virtual:rimelight-seo/assets"

export const prerender = true

export const GET: APIRoute = async () => {
  if (!masterIconBuffer) {
    return new Response(null, { status: 404 })
  }

  const png = await generateMaskablePng(masterIconBuffer, {
    size: 512,
    background: backgroundColor || "#ffffff",
    paddingRatio: 0.15
  })

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  })
}

import type { APIRoute } from "astro"
import { generatePng } from "../assets.js"
import { masterIconBuffer } from "virtual:rimelight-seo/assets"

export const prerender = true

export const GET: APIRoute = async () => {
  if (!masterIconBuffer) {
    return new Response(null, { status: 404 })
  }

  const png = await generatePng(masterIconBuffer, { width: 512, height: 512 })
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  })
}

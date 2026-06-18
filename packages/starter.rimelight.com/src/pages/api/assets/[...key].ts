import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ params }) => {
  const key = params.key
  if (!key) {
    return new Response("Missing asset key", { status: 400 })
  }

  const bucket = globalThis.BLOB
  if (!bucket) {
    return new Response("R2 binding not available", { status: 500 })
  }

  try {
    const object = await bucket.get(key)
    if (!object) {
      return new Response("Asset not found", { status: 404 })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream")
    headers.set("Cache-Control", "public, max-age=31536000")

    return new Response(object.body, { headers })
  } catch (err: any) {
    return new Response(err.message || "Internal error", { status: 500 })
  }
}

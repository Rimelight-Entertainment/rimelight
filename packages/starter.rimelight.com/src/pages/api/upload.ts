import type { APIRoute } from "astro"
import { db } from "@/db"
import { images } from "@/db/schema"

export const POST: APIRoute = async ({ request }) => {
  const bucket = globalThis.BLOB
  if (!bucket) {
    return new Response(JSON.stringify({ error: "R2 binding not available" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const formData = await request.formData()
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    const file = formData.get("file") as File
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    const ext = file.name.split(".").pop() || "webp"
    const key = `blog/${timestamp}-${random}.${ext}`

    const buffer = await file.arrayBuffer()
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type || "image/webp" }
    })

    const fileUrl = `/api/assets/${key}`

    await db.insert(images).values({
      filename: file.name,
      url: fileUrl,
      size: file.size,
      mimeType: file.type || "image/webp"
    })

    return new Response(JSON.stringify({ url: fileUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

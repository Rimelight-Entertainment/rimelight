import type { APIRoute } from "astro"
import { getR2Bucket } from "../../storage/index"
// @ts-ignore
import { storageConfig } from "virtual:rimelight-cms/storage"

export const prerender = false

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const bindingName = storageConfig?.binding ?? "BLOB"
    const bucket = await getR2Bucket(locals, bindingName)

    if (!bucket) {
      return new Response("Storage binding not found.", { status: 500 })
    }

    const key = params.key as string
    if (!key) {
      return new Response("Missing file key.", { status: 400 })
    }

    const object = await bucket.get(key)
    if (!object) {
      return new Response("File not found in R2 storage.", { status: 404 })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set("etag", object.httpEtag)
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new Response(object.body, {
      status: 200,
      headers
    })
  } catch (error: any) {
    return new Response(error.message || "Failed to retrieve file", { status: 500 })
  }
}

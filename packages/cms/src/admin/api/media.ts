import type { APIRoute } from "astro"
import { getR2Bucket, listR2Files, uploadR2File, deleteR2File } from "../../storage/index"
// @ts-ignore
import { storageConfig } from "virtual:rimelight-cms/storage"
// @ts-ignore
import authAdapter from "virtual:rimelight-cms/auth"

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const session = await authAdapter.getSession(request)
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }
    const url = new URL(request.url)
    const prefix = (url.searchParams.get("prefix") ??
      (storageConfig?.prefix as string | undefined) ??
      "media/") as string
    const cursor = (url.searchParams.get("cursor") || undefined) as string | undefined
    const limit = Number(url.searchParams.get("limit")) || 50
    const search = url.searchParams.get("search")?.toLowerCase()
    const typeFilter = url.searchParams.get("type")?.toLowerCase()

    const bindingName = (storageConfig?.binding as string | undefined) ?? "BLOB"
    const bucket = await getR2Bucket(locals, bindingName)

    if (!bucket) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Storage binding "${bindingName}" not found in runtime environment. Ensure R2 bucket is configured in wrangler.jsonc or astro.config.`
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const apiBasePath = `${url.pathname.replace(/\/$/, "")}/file`
    const result = await listR2Files(bucket, {
      prefix,
      cursor,
      limit,
      publicUrl: storageConfig?.publicUrl as string | undefined,
      apiBasePath
    })

    let files = result.files

    if (search) {
      files = files.filter(
        (f) => f.name.toLowerCase().includes(search) || f.key.toLowerCase().includes(search)
      )
    }

    if (typeFilter && typeFilter !== "all") {
      files = files.filter((f) => {
        if (typeFilter === "images") return f.mimeType.startsWith("image/")
        if (typeFilter === "videos") return f.mimeType.startsWith("video/")
        if (typeFilter === "audio") return f.mimeType.startsWith("audio/")
        if (typeFilter === "documents")
          return (
            f.mimeType.includes("pdf") ||
            f.mimeType.includes("text") ||
            f.mimeType.includes("document")
          )
        return true
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          files,
          truncated: result.truncated,
          cursor: result.cursor,
          provider: storageConfig?.provider ?? "r2",
          binding: bindingName
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to list media files"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const session = await authAdapter.getSession(request)
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const bindingName = storageConfig?.binding ?? "BLOB"
    const bucket = await getR2Bucket(locals, bindingName)

    if (!bucket) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Storage binding "${bindingName}" not found in runtime environment.`
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: "Expected multipart/form-data content type." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No file found in form data payload (field name 'file')."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const url = new URL(request.url)
    const apiBasePath = `${url.pathname.replace(/\/$/, "")}/file`

    const uploaded = await uploadR2File(bucket, file, {
      prefix: (storageConfig?.prefix as string | undefined) ?? "media/",
      publicUrl: storageConfig?.publicUrl as string | undefined,
      apiBasePath
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: { file: uploaded }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to upload file to R2"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const session = await authAdapter.getSession(request)
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const bindingName = storageConfig?.binding ?? "BLOB"
    const bucket = await getR2Bucket(locals, bindingName)

    if (!bucket) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Storage binding "${bindingName}" not found in runtime environment.`
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    let key = ""
    const url = new URL(request.url)
    const queryKey = url.searchParams.get("key")

    if (queryKey) {
      key = queryKey
    } else {
      const body = await request.json().catch(() => ({}))
      key = body.key
    }

    if (!key) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required 'key' parameter for deletion." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    await deleteR2File(bucket, key)

    return new Response(
      JSON.stringify({ success: true, message: `File "${key}" deleted successfully.` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to delete file from R2"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

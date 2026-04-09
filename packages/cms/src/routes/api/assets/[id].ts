import type { APIRoute } from "astro"
import { assets } from "@/core/assets"

export const prerender = false

const getAdminLocale = (request: Request): string => {
  const referer = request.headers.get("referer") ?? ""
  const match = referer.match(/\/([a-z]{2})\/admin\//)
  return match?.[1] ?? "en"
}
const adminPath = (request: Request, path: string) => `/${getAdminLocale(request)}/admin${path}`

export const GET: APIRoute = async ({ params }) => {
  const id = params.id
  if (!id) return Response.json({ error: "Asset ID is required." }, { status: 400 })

  const asset = await assets.findById(id)
  if (!asset) return Response.json({ error: "Not found." }, { status: 404 })

  return Response.json(asset)
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id
  if (!id) return Response.json({ error: "Asset ID is required." }, { status: 400 })

  const body = (await request.json()) as Record<string, unknown>
  const data: {
    alt?: string
    filename?: string
    folder?: string | null
    focalX?: number | null
    focalY?: number | null
  } = {}
  if (typeof body.alt === "string") data.alt = body.alt
  if (typeof body.filename === "string") data.filename = body.filename
  if (body.folder === null || typeof body.folder === "string") data.folder = body.folder
  if (body.focalX === null || typeof body.focalX === "number") data.focalX = body.focalX
  if (body.focalY === null || typeof body.focalY === "number") data.focalY = body.focalY

  const result = await assets.update(id, data)
  if (!result) return Response.json({ error: "Not found." }, { status: 404 })

  return Response.json(result)
}

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id
  if (!id) return new Response(null, { status: 400 })

  await assets.delete(id)
  return new Response(null, { status: 204 })
}

export const POST: APIRoute = async ({ params, request }) => {
  const id = params.id
  if (!id) return new Response(null, { status: 400 })

  const formData = new URLSearchParams(await request.text())
  const method = formData.get("_method")

  if (method === "DELETE") {
    await assets.delete(id)
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/assets?_toast=success&_msg=Asset+deleted") }
    })
  }

  const action = formData.get("_action")
  if (action === "update") {
    const alt = formData.get("alt")
    const folder = formData.get("folder")
    const focalX = formData.get("focalX")
    const focalY = formData.get("focalY")
    const updateData: {
      alt?: string
      folder?: string | null
      focalX?: number | null
      focalY?: number | null
    } = {}
    if (alt !== null) updateData.alt = alt
    if (folder !== null) updateData.folder = folder === "" ? null : folder
    if (focalX !== null) updateData.focalX = focalX === "" ? null : Number(focalX)
    if (focalY !== null) updateData.focalY = focalY === "" ? null : Number(focalY)
    await assets.update(id, updateData)
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, `/assets/${id}?_toast=success&_msg=Asset+updated`) }
    })
  }

  return new Response(null, { status: 400 })
}

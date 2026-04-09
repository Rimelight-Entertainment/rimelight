import type { APIRoute } from "astro"

import { destroySession, clearSessionCookie } from "@/core/auth"

export const prerender = false

const getAdminLocale = (request: Request): string => {
  const referer = request.headers.get("referer") ?? ""
  const match = referer.match(/\/([a-z]{2})\/admin\//)
  return match?.[1] ?? "en"
}
const adminPath = (request: Request, path: string) => `/${getAdminLocale(request)}/admin${path}`

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const match = cookieHeader.match(/cms_session=([^;]+)/)

  if (match?.[1]) {
    await destroySession(match[1])
  }

  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookie()
      }
    })
  }

  return new Response(null, {
    status: 303,
    headers: {
      "Location": adminPath(request, "/login"),
      "Set-Cookie": clearSessionCookie()
    }
  })
}

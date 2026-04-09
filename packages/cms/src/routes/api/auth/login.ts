import type { APIRoute } from "astro"
import { eq } from "drizzle-orm"

import { getDb } from "@/core/db"
import { verifyPassword, createSession, setSessionCookie } from "@/core/auth"

export const prerender = false

const getAdminLocale = (request: Request): string => {
  const referer = request.headers.get("referer") ?? ""
  const match = referer.match(/\/([a-z]{2})\/admin\//)
  return match?.[1] ?? "en"
}
const adminPath = (request: Request, path: string) => `/${getAdminLocale(request)}/admin${path}`

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") ?? ""
  let email: string
  let password: string

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>
    email = typeof body.email === "string" ? body.email : ""
    password = typeof body.password === "string" ? body.password : ""
  } else {
    const formData = await request.formData()
    email = typeof formData.get("email") === "string" ? (formData.get("email") as string) : ""
    password =
      typeof formData.get("password") === "string" ? (formData.get("password") as string) : ""
  }

  if (!email || !password) {
    if (contentType.includes("application/json")) {
      return Response.json({ error: "Email and password are required." }, { status: 400 })
    }
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/login?error=missing") }
    })
  }

  const db = await getDb()
  const schema = await import("@/generated/schema")
  const tables = schema.cmsTables as Record<string, { main: any }>

  if (!tables.users) {
    return Response.json({ error: "Users collection not configured." }, { status: 500 })
  }

  const rows = await db
    .select()
    .from(tables.users.main)
    .where(eq(tables.users.main.email, email))
    .limit(1)

  if (rows.length === 0) {
    if (contentType.includes("application/json")) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 })
    }
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/login?error=invalid") }
    })
  }

  const user = rows[0] as Record<string, unknown>
  const storedHash = typeof user.password === "string" ? user.password : ""

  let valid = false
  try {
    valid = await verifyPassword(storedHash, password)
  } catch {
    // valid remains false
  }

  if (!valid) {
    if (contentType.includes("application/json")) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 })
    }
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/login?error=invalid") }
    })
  }

  const userId =
    typeof user._id === "string" || typeof user._id === "number" || typeof user._id === "boolean"
      ? String(user._id)
      : ""
  const session = await createSession(userId)

  if (contentType.includes("application/json")) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setSessionCookie(session.token, session.expiresAt)
      }
    })
  }

  return new Response(null, {
    status: 303,
    headers: {
      "Location": adminPath(request, "/recent"),
      "Set-Cookie": setSessionCookie(session.token, session.expiresAt)
    }
  })
}

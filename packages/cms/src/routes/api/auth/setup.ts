import type { APIRoute } from "astro"
import { nanoid } from "nanoid"

import { getDb } from "@/core/db"
import { hashPassword, createSession, setSessionCookie } from "@/core/auth"

export const prerender = false

const getAdminLocale = (request: Request): string => {
  const referer = request.headers.get("referer") ?? ""
  const match = referer.match(/\/([a-z]{2})\/admin\//)
  return match?.[1] ?? "en"
}
const adminPath = (request: Request, path: string) => `/${getAdminLocale(request)}/admin${path}`

function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData()
  const name = getFormDataString(formData, "name").trim()
  const email = getFormDataString(formData, "email").trim()
  const password = getFormDataString(formData, "password")
  const confirmPassword = getFormDataString(formData, "confirmPassword")

  if (!name || !email || !password) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/setup?error=missing") }
    })
  }

  if (password !== confirmPassword) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/setup?error=password") }
    })
  }

  if (password.length < 8) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/setup?error=short") }
    })
  }

  const db = await getDb()
  const schema = await import("@/generated/schema")
  const tables = schema.cmsTables as Record<string, { main: any }>

  if (!tables.users) {
    return Response.json({ error: "Users collection not configured." }, { status: 500 })
  }

  // Prevent setup if users already exist
  const existing = await db.select().from(tables.users.main).limit(1)
  if (existing.length > 0) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/login") }
    })
  }

  const id = nanoid()
  const now = new Date().toISOString()
  const hashedPassword = await hashPassword(password)

  await db.insert(tables.users.main).values({
    _id: id,
    name,
    email,
    password: hashedPassword,
    role: "admin",
    _createdAt: now,
    _updatedAt: now
  })

  const session = await createSession(id)

  return new Response(null, {
    status: 303,
    headers: {
      "Location": adminPath(request, "/recent"),
      "Set-Cookie": setSessionCookie(session.token, session.expiresAt)
    }
  })
}

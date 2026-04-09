import type { APIRoute } from "astro"
import { eq } from "drizzle-orm"

import { getDb } from "@/core/db"
import {
  createInvite,
  validateInvite,
  consumeInvite,
  hashPassword,
  createSession,
  setSessionCookie,
  getSessionUser
} from "@/core/auth"
import { sendInviteEmail, isEmailConfigured } from "@/core/email"

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

export const POST: APIRoute = async ({ request, url }) => {
  const formData = await request.formData()
  const action = getFormDataString(formData, "_action") || "create"

  if (action === "accept") {
    return handleAccept(formData, request)
  }

  return handleCreate(formData, url, request)
}

async function handleCreate(formData: FormData, url: URL, request: Request) {
  const user = await getSessionUser(request)
  if (!user || user.role !== "admin") {
    return new Response(null, {
      status: 303,
      headers: {
        Location: adminPath(request, "/users?_toast=error&_msg=Only+admins+can+invite+users")
      }
    })
  }

  const email = getFormDataString(formData, "email").trim()
  const role = getFormDataString(formData, "role") || "editor"
  const emailPrefix = email.split("@")[0] ?? ""
  const name = (getFormDataString(formData, "name") || emailPrefix).trim()

  if (!email) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/users/new?_toast=error&_msg=Email+is+required") }
    })
  }

  const db = await getDb()
  const schema = await import("@/generated/schema")
  const tables = schema.cmsTables as Record<string, { main: any }>
  if (!tables.users) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: adminPath(request, "/users?_toast=error&_msg=Users+collection+not+configured")
      }
    })
  }

  // Check for duplicate email
  const existing = await db
    .select()
    .from(tables.users.main)
    .where(eq(tables.users.main.email, email))
    .limit(1)
  if (existing.length > 0) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: adminPath(
          request,
          "/users/new?_toast=error&_msg=A+user+with+this+email+already+exists"
        )
      }
    })
  }

  const { nanoid } = await import("nanoid")
  const id = nanoid()
  const now = new Date().toISOString()

  await db.insert(tables.users.main).values({
    _id: id,
    name,
    email,
    password: "",
    role,
    _createdAt: now,
    _updatedAt: now
  })

  const invite = await createInvite(id)
  const inviteUrl = `${url.origin}${adminPath(request, `/invite?token=${invite.token}`)}`

  let emailSent = false
  if (isEmailConfigured()) {
    emailSent = await sendInviteEmail(email, inviteUrl)
  }

  const params = new URLSearchParams({
    _toast: "success",
    _msg: emailSent ? `Invitation sent to ${email}` : "User created",
    inviteToken: invite.token,
    emailSent: emailSent ? "true" : "false"
  })

  return new Response(null, {
    status: 303,
    headers: { Location: `${adminPath(request, `/users/${id}`)}?${params}` }
  })
}

async function handleAccept(formData: FormData, request: Request) {
  const token = getFormDataString(formData, "token")
  const name = getFormDataString(formData, "name").trim()
  const password = getFormDataString(formData, "password")
  const confirmPassword = getFormDataString(formData, "confirmPassword")

  if (!token) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/invite?error=invalid") }
    })
  }

  if (!name || !password) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, `/invite?token=${token}&error=missing`) }
    })
  }

  if (password !== confirmPassword) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, `/invite?token=${token}&error=password`) }
    })
  }

  if (password.length < 8) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, `/invite?token=${token}&error=short`) }
    })
  }

  const invite = await validateInvite(token)
  if (!invite) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, "/invite?error=expired") }
    })
  }

  const db = await getDb()
  const schema = await import("@/generated/schema")
  const tables = schema.cmsTables as Record<string, { main: any }>

  const hashedPassword = await hashPassword(password)
  const userTable = tables.users?.main
  if (!userTable) {
    return new Response(null, {
      status: 303,
      headers: { Location: adminPath(request, `/invite?token=${token}&error=config`) }
    })
  }

  await db
    .update(userTable)
    .set({ name, password: hashedPassword, _updatedAt: new Date().toISOString() })
    .where(eq(userTable._id, invite.userId))

  await consumeInvite(token)

  const session = await createSession(invite.userId)

  return new Response(null, {
    status: 303,
    headers: {
      "Location": adminPath(request, "/recent"),
      "Set-Cookie": setSessionCookie(session.token, session.expiresAt)
    }
  })
}

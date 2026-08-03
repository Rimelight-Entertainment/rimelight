import { Hono } from "hono"
import { auth } from "@/auth/auth"
import { sendVerificationEmail } from "@/auth/email/verification"

const api = new Hono()

api.post("/resend-verification", async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      return c.json({ error: "Email is required" }, 400)
    }

    // Generate a verification token
    const token = crypto.randomUUID()
    const acceptLanguage = c.req.header("accept-language")?.split(",")[0] || "en"
    const locale = acceptLanguage.split("-")[0] // Convert "en-US" to "en"
    const url = `${new URL(c.req.url).origin}/${locale}/auth/verify-email?token=${token}`

    // Send verification email
    await sendVerificationEmail({
      user: { email },
      url,
      token,
      locale: c.req.header("accept-language")?.split(",")[0] || "en"
    })

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return c.json({ error: error.message || "Failed to resend verification email" }, 500)
  }
})

api.on(["GET", "POST"], "/*", async (c) => {
  const response = await auth.handler(c.req.raw)

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    return new Response(text, { status: response.status })
  }

  const json = await response.json()
  return new Response(JSON.stringify(json), {
    status: response.status,
    headers: { "Content-Type": "application/json" }
  })
})

export default api

import { Hono } from "hono"
import { auth } from "@/auth/auth"

const api = new Hono()

api.post("/resend-verification", async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      return c.json({ error: "Email is required" }, 400)
    }

    // Generate a verification token and send email using better-auth
    const acceptLanguage = c.req.header("accept-language")?.split(",")[0] || "en"
    const locale = acceptLanguage.split("-")[0] // Convert "en-US" to "en"
    
    // Use better-auth's internal method to send verification email
    // This will generate a proper token and send it via the configured email service
    await auth.api.sendVerificationEmail({
      body: {
        email
      },
      headers: c.req.raw.headers
    })

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return c.json({ error: error.message || "Failed to resend verification email" }, 500)
  }
})

api.on(["GET", "POST"], "/*", async (c) => {
  return auth.handler(c.req.raw)
})

export default api

import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { env } from "cloudflare:workers"
import { verifyTurnstile } from "@/lib/turnstile"
import { sendEmail } from "@/auth/email"
import { renderContactEmail } from "@/auth/email/render"

export const contact = defineAction({
  accept: "form",
  input: z.object({
    "name": z.string().trim().min(1, "Please enter your name."),
    "email": z.string().trim().email({ message: "Please enter a valid email address." }),
    "subject": z.string().trim().optional(),
    "message": z.string().trim().min(10, "Your message should be at least 10 characters."),
    "cf-turnstile-response": z.string().optional()
  }),
  handler: async (input, context) => {
    const token = input["cf-turnstile-response"]
    const clientIP = context.request.headers.get("CF-Connecting-IP") || undefined

    const verification = await verifyTurnstile(token, env, clientIP)
    if (!verification.success) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: verification.error || "Anti-bot verification failed. Please try again."
      })
    }

    const ownerEmail =
      env.CONTACT_OWNER_EMAIL ||
      env.EMAIL_TEST_RECIPIENT ||
      `owner@${env.EMAIL_DOMAIN || "rimelight.com"}`

    const mailSubject =
      input.subject && input.subject.length > 0
        ? `[Contact Form] ${input.subject}`
        : `[Contact Form] New message from ${input.name}`

    const textBody = `Name: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`

    const htmlBody = await renderContactEmail({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message
    })

    try {
      await sendEmail({
        to: ownerEmail,
        subject: mailSubject,
        text: textBody,
        html: htmlBody
      })
      return { success: true }
    } catch (err: unknown) {
      console.error("[contact action error]", err)
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not send your contact message. Please try again later."
      })
    }
  }
})

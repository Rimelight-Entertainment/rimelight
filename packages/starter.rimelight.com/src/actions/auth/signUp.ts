import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { env } from "cloudflare:workers"
import { throwActionAuthError } from "./utils"
import { verifyTurnstile } from "@/lib/turnstile"

export const signUp = defineAction({
  accept: "form",
  input: z.object({
    "firstName": z.string(),
    "lastName": z.string(),
    "email": z.email(),
    "password": z.string().min(8).max(128),
    "cf-turnstile-response": z.string().optional()
  }),
  handler: async (input, context) => {
    try {
      const token = input["cf-turnstile-response"]
      const clientIP = context.request.headers.get("CF-Connecting-IP") || undefined

      const verification = await verifyTurnstile(token, env, clientIP)
      if (!verification.success) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: verification.error || "Bot check validation failed."
        })
      }

      const { auth } = await import("@/auth/auth")
      await auth.api.signUpEmail({
        body: {
          name: `${input.firstName} ${input.lastName}`,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: input.password
        }
      })
      return { success: true }
    } catch (error) {
      return throwActionAuthError("BAD_REQUEST", error)
    }
  }
})

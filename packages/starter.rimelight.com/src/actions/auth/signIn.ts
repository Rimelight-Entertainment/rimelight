import { defineAction } from "astro:actions"
import { z } from "astro/zod"
import { throwActionAuthError } from "./utils"

export const signIn = defineAction({
  accept: "form",
  input: z.object({
    email: z.email(),
    password: z.string()
  }),
  handler: async (input, ctx) => {
    try {
      const { auth } = await import("@/auth/auth")
      const response = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password
        },
        headers: ctx.request.headers,
        asResponse: true
      })
      return { cookies: response.headers.getSetCookie() }
    } catch (error) {
      return throwActionAuthError("UNAUTHORIZED", error)
    }
  }
})

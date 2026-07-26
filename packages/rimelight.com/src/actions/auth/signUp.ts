import { defineAction } from "astro:actions"
import { z } from "astro/zod"
import { throwActionAuthError } from "./utils"

export const signUp = defineAction({
  accept: "form",
  input: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z.string().min(8).max(128)
  }),
  handler: async (input) => {
    try {
      const { auth } = await import("@/auth/auth")
      await auth.api.signUpEmail({
        body: {
          name: `${input.firstName} ${input.lastName}`,
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

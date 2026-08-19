import { defineAction } from "astro:actions"
import { throwActionAuthError } from "./utils"

export const signOut = defineAction({
  accept: "form",
  handler: async (_input, ctx) => {
    try {
      const { auth } = await import("@/auth/auth")
      const response = await auth.api.signOut({
        headers: ctx.request.headers,
        asResponse: true
      })
      return { cookies: response.headers.getSetCookie() }
    } catch (error) {
      return throwActionAuthError("BAD_REQUEST", error)
    }
  }
})

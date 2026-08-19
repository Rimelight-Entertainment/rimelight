import { ActionError, type ActionErrorCode } from "astro:actions"
import { APIError } from "better-auth/api"

export function throwActionAuthError(code: ActionErrorCode, error: unknown): never {
  throw new ActionError({
    code,
    message:
      error instanceof APIError
        ? `${error.body?.message ?? "Unknown error"}.`
        : "Something went wrong, please try again later."
  })
}

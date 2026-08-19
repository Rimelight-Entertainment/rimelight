import { APIError } from "better-auth/api"
import { normalizeUsername, RESTRICTED_SET } from "../reserved-usernames"
import { eq, and, count } from "drizzle-orm"

export interface TagHookOptions {
  userTable?: any
  restrictedSet?: Set<string>
}

export function createTagAndUsernameHook(db: any, userTable: any, options?: TagHookOptions) {
  const restricted = options?.restrictedSet ?? RESTRICTED_SET

  return async (userData: any, _ctx: any) => {
    // 1. Normalize the username and check against the restricted set
    const normalizedInput = normalizeUsername(userData.name)
    if (restricted.has(normalizedInput)) {
      throw new APIError("BAD_REQUEST", {
        message: "This username is reserved for official use."
      })
    }

    // 2. Generate a unique 4-digit discriminator tag
    let uniqueTag = "0000"
    const tryFindTag = async (attemptsLeft: number): Promise<string> => {
      if (attemptsLeft <= 0) return "0000"
      const newTag = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")

      const result = await db
        .select({ count: count() })
        .from(userTable)
        .where(and(eq(userTable.name, userData.name), eq(userTable.tag, newTag)))

      const tagCount = result[0]?.count ?? 0
      if (tagCount === 0) return newTag
      return tryFindTag(attemptsLeft - 1)
    }

    uniqueTag = await tryFindTag(50)

    if (uniqueTag === "0000") {
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to generate a unique tag for this username. Please try again."
      })
    }

    return {
      data: {
        ...userData,
        tag: uniqueTag
      }
    }
  }
}

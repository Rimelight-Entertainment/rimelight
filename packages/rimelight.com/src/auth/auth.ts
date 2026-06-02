import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { admin as adminPlugin, organization as organizationPlugin } from "better-auth/plugins"
import { ac, owner, admin, member, user } from "@/auth/permissions"
import { eq, and, count } from "drizzle-orm"
import { user as userTable } from "@/db/schema/auth"
import { normalizeUsername, RESTRICTED_SET } from "@/auth/restricted-usernames"
import { APIError } from "better-auth/api"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  user: {
    changeEmail: {
      enabled: true
    },
    emailVerification: {
      // sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
      //     // Send change email confirmation to the old email
      // },
    },
    deleteUser: {
      enabled: true
      // sendDeleteAccountVerification: async ({ user, url, token }, request) => {
      // 	    await sendEmail(Odata.user.email, "Delete Account Verification", data.url)
      // 	},
      // 	beforeDelete: async (user) => {
      // 	    // Perform actions before user deletion
      // 	},
      // 	afterDelete: async (user) => {
      // 	    // Perform cleanup after user deletion
      // 	}
      // }
    },
    additionalFields: {
      tag: {
        type: "string",
        required: false,
        default: "0000",
        input: false
      },
      firstName: {
        type: "string",
        required: true,
        default: "",
        input: true
      },
      lastName: {
        type: "string",
        required: true,
        default: "",
        input: true
      },
      role: {
        type: "string",
        required: false,
        default: "user",
        input: false
      },
      availability: {
        type: "string",
        required: false,
        default: "available"
      },
      status: {
        type: "string",
        required: false,
        default: ""
      },
      publicKey: {
        type: "string",
        required: false,
        input: true
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 15,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  rateLimit: {
    window: 10,
    max: 100,
    storage: "database",
    modelName: "rateLimit"
  },
  plugins: [
    adminPlugin(),
    organizationPlugin({
      teams: {
        enabled: true
      },
      ac,
      roles: {
        owner,
        admin,
        member,
        user
      }
    })
  ],
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "auth",
    database: {
      generateId: () => crypto.randomUUID()
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData, _ctx) => {
          // 1. Normalize the username and check against the restricted set
          const normalizedInput = normalizeUsername(userData.name)
          if (RESTRICTED_SET.has(normalizedInput)) {
            throw new APIError("BAD_REQUEST", {
              message: "This username is reserved for official use."
            })
          }

          // 2. Generate a unique 4-digit discriminator tag
          let uniqueTag = "0000"
          const MAX_RETRIES = 50
          for (let i = 0; i < MAX_RETRIES; i++) {
            const newTag = Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")

            const result = await db
              .select({ count: count() })
              .from(userTable)
              .where(and(eq(userTable.name, userData.name), eq(userTable.tag, newTag)))

            const tagCount = result[0]?.count ?? 0
            if (tagCount === 0) {
              uniqueTag = newTag
              break
            }
          }

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
    }
  }
})

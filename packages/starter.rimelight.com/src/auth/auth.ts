import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { admin as adminPlugin, organization as organizationPlugin } from "better-auth/plugins"
import { ac, owner, admin, member, user as userRole } from "@/auth/permissions"
import { cmsStatements } from "@rimelight/cms"
import { eq, and, count } from "drizzle-orm"
import { user as userTable } from "@/db/schema/auth"
import { normalizeUsername, RESTRICTED_SET } from "@/auth/restricted-usernames"
import { APIError } from "better-auth/api"
import { sendVerificationEmail } from "./email/verification"
import { sendPasswordResetEmail } from "./email/password-reset"
import { sendExistingUserSignUpNotification } from "./email/notifications"
import { createSyntheticUserWrapper } from "./customSyntheticUser"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    customSyntheticUser: createSyntheticUserWrapper,
    sendResetPassword: sendPasswordResetEmail,
    onExistingUserSignUp: async (existingUser: any) => {
      await sendExistingUserSignUpNotification({ user: { email: existingUser.email } })
    }
  },
  emailVerification: {
    sendVerificationEmail: sendVerificationEmail,
    autoSignInAfterVerification: true
  },
  user: {
    changeEmail: {
      enabled: true
    },
    deleteUser: {
      enabled: true
    },
    additionalFields: {
      tag: {
        type: "string",
        required: false,
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
        user: userRole
      }
    })
  ],
  auth: {
    statements: cmsStatements
  },
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
          const normalizedInput = normalizeUsername(userData.name)
          if (RESTRICTED_SET.has(normalizedInput)) {
            throw new APIError("BAD_REQUEST", {
              message: "This username is reserved for official use."
            })
          }

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
    }
  }
})

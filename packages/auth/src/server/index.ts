import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth"
import { createSyntheticUserWrapper } from "../plugins/synthetic-user"
import { createTagAndUsernameHook } from "../plugins/discriminator-tag"

export interface RimelightAuthFactoryOptions {
  database: BetterAuthOptions["database"]
  db?: any
  userTable?: any
  emailHandlers?: {
    sendVerificationEmail?: (data: any, request?: Request) => Promise<void>
    sendPasswordResetEmail?: (data: any, request?: Request) => Promise<void>
    sendExistingUserSignUpNotification?: (existingUser: any) => Promise<void>
  }
  additionalUserFields?: Record<string, any>
  plugins?: BetterAuthOptions["plugins"]
  statements?: any
  advanced?: BetterAuthOptions["advanced"]
  session?: BetterAuthOptions["session"]
  rateLimit?: BetterAuthOptions["rateLimit"]
  customDatabaseHooks?: BetterAuthOptions["databaseHooks"]
  enableTagGenerator?: boolean
  restrictedUsernameBlacklist?: string[]
}

export function createRimelightAuth(options: RimelightAuthFactoryOptions) {
  const enableTag = options.enableTagGenerator ?? (options.db && options.userTable)

  const defaultUserHooks =
    enableTag && options.db && options.userTable
      ? {
          create: {
            before: createTagAndUsernameHook(options.db, options.userTable)
          }
        }
      : undefined

  const emailAndPasswordConfig: BetterAuthOptions["emailAndPassword"] = {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    customSyntheticUser: createSyntheticUserWrapper
  }

  if (options.emailHandlers?.sendPasswordResetEmail) {
    emailAndPasswordConfig.sendResetPassword = options.emailHandlers.sendPasswordResetEmail
  }
  if (options.emailHandlers?.sendExistingUserSignUpNotification) {
    const handler = options.emailHandlers.sendExistingUserSignUpNotification
    emailAndPasswordConfig.onExistingUserSignUp = async (existingUser: any) => {
      await handler(existingUser)
    }
  }

  const emailVerificationConfig: BetterAuthOptions["emailVerification"] = {
    autoSignInAfterVerification: true
  }

  if (options.emailHandlers?.sendVerificationEmail) {
    emailVerificationConfig.sendVerificationEmail = options.emailHandlers.sendVerificationEmail
  }

  return betterAuth({
    database: options.database,
    emailAndPassword: emailAndPasswordConfig,
    emailVerification: emailVerificationConfig,
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
        },
        ...options.additionalUserFields
      }
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 15,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5
      },
      ...options.session
    },
    rateLimit: {
      window: 10,
      max: 100,
      storage: "database",
      modelName: "rateLimit",
      ...options.rateLimit
    },
    plugins: options.plugins ?? [],
    auth: options.statements ? { statements: options.statements } : undefined,
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      cookiePrefix: "auth",
      database: {
        generateId: () => crypto.randomUUID()
      },
      ...options.advanced
    },
    databaseHooks:
      options.customDatabaseHooks ?? (defaultUserHooks ? { user: defaultUserHooks } : undefined)
  })
}

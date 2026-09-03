import {
  auth0Auth,
  createAuth0AuthorizeUrl,
  createAuth0LogoutUrl,
  exchangeAuth0Code,
  createSessionToken,
  verifySessionToken,
  loginWithAuth0Password,
  refreshAuth0Token,
  type Auth0AdapterOptions
} from "@rimelight/auth/auth0"
import type { AuthAdapter, UserSessionContext } from "@rimelight/auth"

export {
  createAuth0AuthorizeUrl,
  createAuth0LogoutUrl,
  exchangeAuth0Code,
  createSessionToken,
  verifySessionToken,
  loginWithAuth0Password,
  refreshAuth0Token
}

const getEnvVal = (importMetaVal: string | undefined, processKey: string, fallback = ""): string => {
  if (typeof importMetaVal !== "undefined" && importMetaVal !== "") return importMetaVal
  if (typeof process !== "undefined" && process.env?.[processKey]) return process.env[processKey]!
  return fallback
}

export const auth0Config: Auth0AdapterOptions = {
  domain: getEnvVal(import.meta.env?.AUTH0_DOMAIN, "AUTH0_DOMAIN", "rimelight.eu.auth0.com"),
  audience:
    getEnvVal(import.meta.env?.AUTH0_USE_CUSTOM_AUDIENCE, "AUTH0_USE_CUSTOM_AUDIENCE") === "true"
      ? getEnvVal(import.meta.env?.AUTH0_AUDIENCE, "AUTH0_AUDIENCE") || undefined
      : undefined,
  clientId: getEnvVal(import.meta.env?.AUTH0_CLIENT_ID, "AUTH0_CLIENT_ID", ""),
  clientSecret: getEnvVal(import.meta.env?.AUTH0_CLIENT_SECRET, "AUTH0_CLIENT_SECRET", ""),
  rolesClaim: getEnvVal(
    import.meta.env?.AUTH0_ROLES_CLAIM,
    "AUTH0_ROLES_CLAIM",
    "https://rimelight.com/roles"
  ),
  userTypeClaim: getEnvVal(
    import.meta.env?.AUTH0_USER_TYPE_CLAIM,
    "AUTH0_USER_TYPE_CLAIM",
    "https://rimelight.com/user_type"
  ),
  permissionsClaim: "permissions",
  sessionCookieName: "rimelight_session",
  sessionSecret: getEnvVal(
    import.meta.env?.AUTH0_SECRET,
    "AUTH0_SECRET",
    "rimelight_default_development_secret_key_32bytes_minimum_length"
  ),
  loginUrl: "/api/auth/login",
  defaultRole: "user"
}

export const auth0Adapter = auth0Auth(auth0Config)

/**
 * Auth adapter for rimelight.com — Auth0 as the sole identity provider. Server-side only: reads
 * session cookie or Bearer token and returns UserSessionContext.
 */
export const auth: AuthAdapter = {
  name: "auth0",
  options: auth0Config,
  async getSession(req: Request): Promise<UserSessionContext | null> {
    return auth0Adapter.getSession(req)
  },
  handleUnauthorized(req: Request) {
    return auth0Adapter.handleUnauthorized?.(req) ?? new Response("Unauthorized", { status: 401 })
  }
}

/**
 * Synchronizes an authenticated Auth0 user or employee profile into Postgres. Called from the
 * /api/auth/callback handler after a successful code exchange.
 */
export async function syncAuth0UserToDb(session: UserSessionContext) {
  try {
    if (!session.email) return null

    const { db } = await import("@/db")
    const { employees } = await import("@/db/schema/employees")
    const { users } = await import("@/db/schema/users")
    const { eq, or } = await import("drizzle-orm")

    if (session.userType === "employee") {
      const existing = await db
        .select()
        .from(employees)
        .where(or(eq(employees.auth0Id, session.userId), eq(employees.email, session.email)))
        .limit(1)

      const role = session.roles[0] || "employee"

      if (existing.length > 0) {
        const [updated] = await db
          .update(employees)
          .set({
            auth0Id: session.userId,
            name: session.name || existing[0]!.name,
            avatar: session.avatar || existing[0]!.avatar,
            role,
            permissions: session.permissions,
            metadata: session.metadata || existing[0]!.metadata,
            updatedAt: new Date()
          })
          .where(eq(employees.id, existing[0]!.id))
          .returning()
        return { type: "employee", record: updated }
      } else {
        const [inserted] = await db
          .insert(employees)
          .values({
            auth0Id: session.userId,
            email: session.email,
            name: session.name || session.email.split("@")[0] || "Employee",
            avatar: session.avatar || null,
            role,
            permissions: session.permissions,
            metadata: session.metadata || {}
          })
          .returning()
        return { type: "employee", record: inserted }
      }
    } else {
      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.auth0Id, session.userId), eq(users.email, session.email)))
        .limit(1)

      if (existing.length > 0) {
        const [updated] = await db
          .update(users)
          .set({
            auth0Id: session.userId,
            name: session.name || existing[0]!.name,
            avatar: session.avatar || existing[0]!.avatar,
            emailVerified: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, existing[0]!.id))
          .returning()
        return { type: "user", record: updated }
      } else {
        const [inserted] = await db
          .insert(users)
          .values({
            auth0Id: session.userId,
            email: session.email,
            name: session.name || session.email.split("@")[0] || "User",
            tag: "0000",
            avatar: session.avatar || null,
            emailVerified: true
          })
          .returning()
        return { type: "user", record: inserted }
      }
    }
  } catch (error) {
    console.error("[Auth] Error syncing Auth0 user to database:", error)
    return null
  }
}

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

const getEnvVal = (
  importMetaVal: string | undefined,
  processKey: string,
  fallback = ""
): string => {
  if (typeof importMetaVal !== "undefined" && importMetaVal !== "") return importMetaVal
  if (typeof process !== "undefined" && process.env?.[processKey]) return process.env[processKey]!
  return fallback
}

export const auth0Config: Auth0AdapterOptions = {
  domain: getEnvVal(import.meta.env?.["AUTH0_DOMAIN"], "AUTH0_DOMAIN", "rimelight.eu.auth0.com"),
  audience:
    getEnvVal(import.meta.env?.["AUTH0_USE_CUSTOM_AUDIENCE"], "AUTH0_USE_CUSTOM_AUDIENCE") ===
    "true"
      ? getEnvVal(import.meta.env?.["AUTH0_AUDIENCE"], "AUTH0_AUDIENCE") || undefined
      : undefined,
  clientId: getEnvVal(import.meta.env?.["AUTH0_CLIENT_ID"], "AUTH0_CLIENT_ID", ""),
  clientSecret: getEnvVal(import.meta.env?.["AUTH0_CLIENT_SECRET"], "AUTH0_CLIENT_SECRET", ""),
  rolesClaim: getEnvVal(
    import.meta.env?.["AUTH0_ROLES_CLAIM"],
    "AUTH0_ROLES_CLAIM",
    "https://rimelight.com/roles"
  ),
  userTypeClaim: getEnvVal(
    import.meta.env?.["AUTH0_USER_TYPE_CLAIM"],
    "AUTH0_USER_TYPE_CLAIM",
    "https://rimelight.com/user_type"
  ),
  permissionsClaim: "permissions",
  sessionCookieName: "rimelight_session",
  sessionSecret: getEnvVal(
    import.meta.env?.["AUTH0_SECRET"],
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
    const session = await auth0Adapter.getSession(req)
    if (session) return session

    // In local development without active Auth0 session, provide dev admin session
    if (import.meta.env.DEV && (!auth0Config.clientId || auth0Config.clientId === "" || auth0Config.clientId === "default_client_id")) {
      return {
        userId: "dev-admin-user",
        email: "admin@rimelight.com",
        name: "Admin (Dev)",
        avatar: "https://cdn.rimelight.com/Images/default_avatar.png",
        roles: ["admin", "owner", "editor"],
        permissions: ["*"],
        userType: "employee",
        metadata: { isDev: true }
      }
    }

    return null
  },
  handleUnauthorized(req: Request) {
    return auth0Adapter.handleUnauthorized?.(req) ?? new Response("Unauthorized", { status: 401 })
  }
}

export const authAdapter = auth
export default auth

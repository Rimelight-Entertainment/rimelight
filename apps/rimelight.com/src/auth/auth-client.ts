import type { UserSessionContext } from "@rimelight/auth"

export type { UserSessionContext }

export interface AuthClientSession {
  user: (UserSessionContext & { id: string }) | null
  session: {
    id: string
    userId: string
    roles: string[]
    userType?: string
  } | null
}

/**
 * Browser-side Auth0 client. All auth flows are redirect-based — Auth0 owns the login/signup UI.
 */
export const authClient = {
  /**
   * Redirect to Auth0 Universal Login.
   */
  login(returnTo = "/") {
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
  },

  /**
   * Redirect to Auth0 Universal Login with signup hint.
   */
  signup(returnTo = "/") {
    window.location.href = `/api/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(returnTo)}`
  },

  /**
   * Clear local session cookie and redirect to Auth0 logout.
   */
  signOut(returnTo = "/") {
    window.location.href = `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`
  },

  /**
   * Fetch the current session from the server. Returns null user/session if unauthenticated.
   */
  async getSession(): Promise<AuthClientSession> {
    try {
      const res = await fetch("/api/auth/session")
      if (!res.ok) return { user: null, session: null }
      return await res.json()
    } catch {
      return { user: null, session: null }
    }
  }
}

import type { UserSessionContext } from "../types";

export interface AuthClientSession<TUser = UserSessionContext> {
  user: TUser | null;
  session: {
    id: string;
    userId: string;
    roles?: string[];
    userType?: string;
  } | null;
}

export interface AuthClientOptions {
  sessionEndpoint?: string;
  meEndpoint?: string;
  loginEndpoint?: string;
  logoutEndpoint?: string;
  fetch?: typeof fetch;
}

export interface AuthClient<TUser = UserSessionContext> {
  getSession(): Promise<AuthClientSession<TUser>>;
  getMe(): Promise<TUser | null>;
  login(returnTo?: string, extraParams?: Record<string, string>): void;
  signup(returnTo?: string, extraParams?: Record<string, string>): void;
  signOut(returnTo?: string): void;
}

/**
 * Universal browser-side Auth Client factory.
 */
export function createAuthClient<TUser = UserSessionContext>(
  options: AuthClientOptions = {}
): AuthClient<TUser> {
  const {
    sessionEndpoint = "/api/auth/session",
    meEndpoint = "/api/auth/me",
    loginEndpoint = "/api/auth/login",
    logoutEndpoint = "/api/auth/logout",
    fetch: customFetch = typeof fetch !== "undefined" ? fetch : undefined
  } = options;

  return {
    async getSession(): Promise<AuthClientSession<TUser>> {
      try {
        if (!customFetch) return { user: null, session: null };
        const res = await customFetch(sessionEndpoint);
        if (!res.ok) return { user: null, session: null };
        return await res.json();
      } catch {
        return { user: null, session: null };
      }
    },

    async getMe(): Promise<TUser | null> {
      try {
        if (!customFetch) return null;
        const res = await customFetch(meEndpoint);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.user ?? null;
      } catch {
        return null;
      }
    },

    login(returnTo = "/", extraParams: Record<string, string> = {}) {
      if (typeof window === "undefined") return;
      const url = new URL(loginEndpoint, window.location.origin);
      url.searchParams.set("returnTo", returnTo);
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
      window.location.href = url.toString();
    },

    signup(returnTo = "/", extraParams: Record<string, string> = {}) {
      if (typeof window === "undefined") return;
      const url = new URL(loginEndpoint, window.location.origin);
      url.searchParams.set("screen_hint", "signup");
      url.searchParams.set("returnTo", returnTo);
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
      window.location.href = url.toString();
    },

    signOut(returnTo = "/") {
      if (typeof window === "undefined") return;
      const url = new URL(logoutEndpoint, window.location.origin);
      url.searchParams.set("returnTo", returnTo);
      window.location.href = url.toString();
    }
  };
}

export const authClient = createAuthClient();
export default authClient;

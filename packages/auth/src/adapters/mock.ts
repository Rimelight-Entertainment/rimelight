import type { AuthAdapter, UserSessionContext } from "../types";

export interface MockAuthOptions {
  session?: Partial<UserSessionContext> | null;
  unauthorizedResponse?: Response;
}

export function mockAuth(options: MockAuthOptions | Partial<UserSessionContext> = {}): AuthAdapter {
  const opts: MockAuthOptions =
    "session" in options || "unauthorizedResponse" in options
      ? (options as MockAuthOptions)
      : { session: options as Partial<UserSessionContext> };

  const defaultSession: UserSessionContext = {
    userId: "mock-user-id",
    email: "dev@rimelight.com",
    name: "Mock Dev User",
    avatar: "https://cdn.rimelight.com/Images/default_avatar.png",
    roles: ["admin", "editor"],
    permissions: ["*"],
    userType: "employee",
    metadata: { isMock: true }
  };

  return {
    name: "mock",
    options: opts,
    async getSession(): Promise<UserSessionContext | null> {
      if (opts.session === null) {
        return null;
      }
      return {
        ...defaultSession,
        ...opts.session
      };
    },
    handleUnauthorized() {
      if (opts.unauthorizedResponse) {
        return opts.unauthorizedResponse;
      }
      return new Response("Unauthorized Mock Session", { status: 401 });
    }
  };
}

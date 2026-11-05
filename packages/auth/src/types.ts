import type { Context } from "hono";

export type UserType = "user" | "employee" | "guest" | (string & {});

export interface AuthSession {
  id: string;
  userId: string;
  roles?: string[] | undefined;
  userType?: UserType | undefined;
}

export type AuthEnv = {
  Variables: {
    user: UserSessionContext | null;
    session: AuthSession | null;
  };
};

declare module "hono" {
  interface ContextVariableMap {
    user: UserSessionContext | null;
    session: AuthSession | null;
  }
}

export interface UserSessionContext {
  /**
   * Unique user identifier (e.g. Auth0 sub claim, user UUID, or email)
   */
  userId: string;

  /**
   * Roles assigned to the authenticated user (e.g. ["admin"], ["editor"], ["user"])
   */
  roles: string[];

  /**
   * Specific permissions assigned (e.g. ["page:create", "draft:edit", "*"])
   */
  permissions: string[];

  /**
   * User's primary email address
   */
  email?: string | undefined;

  /**
   * User's display or full name
   */
  name?: string | undefined;

  /**
   * User's avatar URL or profile picture
   */
  avatar?: string | undefined;

  /**
   * Discriminator or classification: "user" (customer/public) vs "employee" (staff/enterprise) vs
   * "guest"
   */
  userType?: UserType | undefined;

  /**
   * Custom identity metadata or raw token claims
   */
  metadata?: Record<string, any> | undefined;
}

/**
 * A credential the identity provider has verified: signature, issuer, audience and expiry checked.
 */
export interface AccessIdentity {
  /** Provider-stable subject: Auth0 `sub`, CF Access `sub`. */
  subject: string;
  email: string;
  /** Auth0: the `email_verified` claim. CF Access: always true, since Access admits only IdP-authenticated identities. */
  emailVerified: boolean;
  name?: string | undefined;
  /** Unmapped provider groups (CF Access) or the roles claim (Auth0). */
  groups: string[];
}

export interface AuthAdapter {
  /**
   * Unique name of the auth adapter
   */
  name: string;

  /**
   * Optional configuration options used to initialize the adapter
   */
  options?: any;

  /**
   * Resolves the authenticated session from an incoming Request. Returns `null` if unauthenticated
   * or invalid.
   */
  getSession(request: Request): Promise<UserSessionContext | null>;

  /**
   * Verifies the request's credential and returns the verified identity, or `null` when no valid
   * credential is present. Throws when the provider cannot be reached, so callers can tell
   * "anonymous" apart from "unavailable".
   */
  identify?(request: Request): Promise<AccessIdentity | null>;

  /**
   * Optional hook for handling unauthorized page loads / redirects
   */
  handleUnauthorized?: ((request: Request) => Response | Promise<Response>) | undefined;
}

export interface RoleGuard {
  roles?: string[];
  userTypes?: UserType[];
  check?: (user: UserSessionContext | null, c: Context) => boolean | Promise<boolean>;
}

export interface AuthMiddlewareOptions {
  /**
   * The auth adapter instance or custom session resolver function.
   */
  auth?:
    | AuthAdapter
    | { getSession(req: Request): Promise<UserSessionContext | null> }
    | ((c: Context) => Promise<UserSessionContext | null>);

  /**
   * Whether to automatically skip static asset paths.
   *
   * @default true
   */
  skipStaticAssets?: boolean;

  /**
   * Route patterns to completely bypass session resolution.
   *
   * @default ["/docs/"]
   */
  ignoredRoutes?: (string | RegExp)[] | ((path: string) => boolean);

  /**
   * Route patterns that require an authenticated session.
   *
   * @default ["/internal"]
   */
  protectedRoutes?: (string | RegExp)[] | ((path: string) => boolean);

  /**
   * Role / permission requirements for specific route prefixes. E.g.: { "/admin": ["admin",
   * "owner"], "/internal": { roles: ["employee", "staff", "admin", "owner"], userTypes:
   * ["employee"] } }
   */
  roleGuards?: Record<string, string[] | RoleGuard>;

  /**
   * Routes that should redirect to home/dashboard if user is already logged in.
   *
   * @default ["/auth/sign-in", "/auth/sign-up"]
   */
  guestOnlyRoutes?: (string | RegExp)[];

  /**
   * URL to redirect to when `/auth` is accessed directly.
   *
   * @default "/auth/sign-in"
   */
  authRedirectUrl?: string;

  /**
   * URL to redirect unauthenticated users accessing protected pages.
   *
   * @default "/auth/sign-in"
   */
  signInUrl?: string;

  /**
   * Home URL to redirect logged-in users away from guest routes or forbidden pages.
   *
   * @default "/"
   */
  homeUrl?: string;

  /**
   * Custom response when unauthorized (not logged in).
   */
  onUnauthorized?: (
    c: Context,
    meta: { isApi: boolean; path: string },
  ) => Response | Promise<Response>;

  /**
   * Custom response when forbidden (insufficient role/permissions).
   */
  onForbidden?: (
    c: Context,
    meta: { isApi: boolean; path: string; requiredRoles?: string[] | undefined },
  ) => Response | Promise<Response>;
}

export interface AuthConfig extends AuthMiddlewareOptions {
  /**
   * Identity provider for this deployment, set via the `auth()` Vite plugin's `provider` option.
   * Unset or unknown means every request is anonymous.
   */
  provider?: "cf-access" | "auth0";
  /**
   * Additional adapter-specific configuration overrides.
   */
  [key: string]: any;
}

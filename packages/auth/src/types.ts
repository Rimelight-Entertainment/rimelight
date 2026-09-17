export type UserType = "user" | "employee" | "guest" | (string & {})

export interface UserSessionContext {
  /**
   * Unique user identifier (e.g. Auth0 sub claim, user UUID, or email)
   */
  userId: string

  /**
   * Roles assigned to the authenticated user (e.g. ["admin"], ["editor"], ["user"])
   */
  roles: string[]

  /**
   * Specific permissions assigned (e.g. ["page:create", "draft:edit", "*"])
   */
  permissions: string[]

  /**
   * User's primary email address
   */
  email?: string | undefined

  /**
   * User's display or full name
   */
  name?: string | undefined

  /**
   * User's avatar URL or profile picture
   */
  avatar?: string | undefined

  /**
   * Discriminator or classification: "user" (customer/public) vs "employee" (staff/enterprise) vs
   * "guest"
   */
  userType?: UserType | undefined

  /**
   * Custom identity metadata or raw token claims
   */
  metadata?: Record<string, any> | undefined
}

export interface AuthAdapter {
  /**
   * Unique name of the auth adapter
   */
  name: string

  /**
   * Optional configuration options used to initialize the adapter
   */
  options?: any

  /**
   * Resolves the authenticated session from an incoming Request. Returns `null` if unauthenticated
   * or invalid.
   */
  getSession(request: Request): Promise<UserSessionContext | null>

  /**
   * Optional hook for handling unauthorized page loads / redirects
   */
  handleUnauthorized?: ((request: Request) => Response | Promise<Response>) | undefined
}

export interface RoleGuard {
  roles?: string[]
  userTypes?: UserType[]
  check?: (user: UserSessionContext | null, c: any) => boolean | Promise<boolean>
}

export interface AuthMiddlewareOptions {
  /**
   * The auth adapter instance or custom session resolver function.
   */
  auth?:
    | AuthAdapter
    | { getSession(req: Request): Promise<UserSessionContext | null> }
    | ((c: any) => Promise<UserSessionContext | null>)

  /**
   * Fall back to construction guest session if no user is signed in.
   *
   * @default true
   */
  allowConstructionGuest?: boolean

  /**
   * Whether to automatically skip static asset paths.
   *
   * @default true
   */
  skipStaticAssets?: boolean

  /**
   * Route patterns to completely bypass session resolution.
   *
   * @default ["/docs/"]
   */
  ignoredRoutes?: (string | RegExp)[] | ((path: string) => boolean)

  /**
   * Route patterns that require an authenticated session.
   *
   * @default ["/internal"]
   */
  protectedRoutes?: (string | RegExp)[] | ((path: string) => boolean)

  /**
   * Role / permission requirements for specific route prefixes. E.g.: { "/admin": ["admin",
   * "owner"], "/internal": { roles: ["employee", "staff", "admin", "owner"], userTypes:
   * ["employee"] } }
   */
  roleGuards?: Record<string, string[] | RoleGuard>

  /**
   * Routes that should redirect to home/dashboard if user is already logged in.
   *
   * @default ["/auth/sign-in", "/auth/sign-up"]
   */
  guestOnlyRoutes?: (string | RegExp)[]

  /**
   * URL to redirect to when `/auth` is accessed directly.
   *
   * @default "/auth/sign-in"
   */
  authRedirectUrl?: string

  /**
   * URL to redirect unauthenticated users accessing protected pages.
   *
   * @default "/auth/sign-in"
   */
  signInUrl?: string

  /**
   * Home URL to redirect logged-in users away from guest routes or forbidden pages.
   *
   * @default "/"
   */
  homeUrl?: string

  /**
   * Custom response when unauthorized (not logged in).
   */
  onUnauthorized?: (c: any, meta: { isApi: boolean; path: string }) => Response | Promise<Response>

  /**
   * Custom response when forbidden (insufficient role/permissions).
   */
  onForbidden?: (
    c: any,
    meta: { isApi: boolean; path: string; requiredRoles?: string[] }
  ) => Response | Promise<Response>
}

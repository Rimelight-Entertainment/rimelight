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

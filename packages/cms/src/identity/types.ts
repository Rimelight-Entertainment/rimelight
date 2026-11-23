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

/** Resolves the verified identity behind a request, or `null` when there is no valid credential. */
export type IdentifyFn = (request: Request) => Promise<AccessIdentity | null>;

/** Lazily-read configuration, so Worker bindings are visible on the first request. */
export type Lazy<T> = T | (() => T);

export function resolveLazy<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

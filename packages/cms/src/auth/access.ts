/**
 * How verified sign-ins map onto CMS accounts. Mirrors emdash's external-auth provisioning: the
 * first account becomes `admin`; later accounts take the first mapped IdP group, else `defaultRole`.
 */
export interface CmsAccessConfig {
  /** Create a `cms_users` row on first verified sign-in. `false` makes the CMS invite-only. Default `true`. */
  autoProvision?: boolean;
  /** Role when no mapped group matches. Default `"viewer"`. */
  defaultRole?: string;
  /** Re-derive the role from the IdP on every sign-in, so the IdP is the source of truth. Default `false`. */
  syncRoles?: boolean;
  /** Copy the IdP display name onto the account on every sign-in. Default `true`. */
  syncName?: boolean;
  /** IdP group → CMS role. The first identity group with a mapping wins. */
  roleMapping?: Record<string, string>;
}

/** Role for the first identity group, in IdP order, that has a mapping. */
export function resolveMappedRole(
  groups: readonly string[],
  roleMapping?: Record<string, string>,
): string | undefined {
  if (!roleMapping) return undefined;
  for (const group of groups) {
    if (Object.hasOwn(roleMapping, group)) return roleMapping[group];
  }
  return undefined;
}

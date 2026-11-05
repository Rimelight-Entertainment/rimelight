/** Pure role checks shared by server services and the dashboard (no server imports). */
export interface RoleSubject {
  roles: string[];
  permissions: string[];
}

export const isAdmin = (actor: RoleSubject): boolean =>
  actor.permissions.includes("*") ||
  actor.roles.some((r) => ["owner", "admin"].includes(r.toLowerCase()));

export function hasAnyRole(actor: RoleSubject, roles: string[] | undefined): boolean {
  if (!roles || roles.length === 0) return true;
  return isAdmin(actor) || actor.roles.some((r) => roles.includes(r));
}

/** Roles a CMS account can hold. Identity groups map onto these via the access `roleMapping`. */
export const CMS_ROLES = ["owner", "admin", "editor", "viewer"] as const;

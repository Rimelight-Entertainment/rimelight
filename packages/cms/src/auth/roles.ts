/** Pure role checks shared by the server services (no server imports). */
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

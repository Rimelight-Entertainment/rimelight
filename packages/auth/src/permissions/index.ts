import type { UserSessionContext } from "../types";

// ============================================================================
// Standalone RBAC Evaluation Helpers
// ============================================================================

export function hasRole(
  session: UserSessionContext | null | undefined,
  requiredRoles: string | string[],
): boolean {
  if (!session || !session.roles || session.roles.length === 0) return false;
  const normalized = (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).map((r) =>
    r.toLowerCase(),
  );
  if (normalized.includes("*")) return true;
  return session.roles.some((r) => normalized.includes(r.toLowerCase()));
}

export function hasPermission(
  session: UserSessionContext | null | undefined,
  requiredPermission: string,
): boolean {
  if (!session || !session.permissions || session.permissions.length === 0) return false;
  if (session.permissions.includes("*") || session.permissions.includes("admin")) return true;
  if (session.permissions.includes(requiredPermission)) return true;
  const [resource] = requiredPermission.split(":");
  if (resource && session.permissions.includes(`${resource}:*`)) return true;
  return false;
}

export function evaluateAccess(
  session: UserSessionContext | null | undefined,
  constraints: { roles?: string[]; permission?: string },
): boolean {
  if (constraints.roles && constraints.roles.length > 0) {
    if (!hasRole(session, constraints.roles)) return false;
  }
  if (constraints.permission) {
    if (!hasPermission(session, constraints.permission)) return false;
  }
  return true;
}

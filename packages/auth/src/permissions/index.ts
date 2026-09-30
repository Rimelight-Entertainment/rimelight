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

// ============================================================================
// Lightweight AC builder — replaces the old access-control plugin for rimelight.com
// ============================================================================

export type StatementMap = Record<string, readonly string[]>;

export interface AccessRole<TStatements extends StatementMap> {
  statements: Partial<{ [K in keyof TStatements]: (TStatements[K][number] | "*")[] }>;
  can(statement: string, action: string): boolean;
}

export class AccessControl<TStatements extends StatementMap> {
  readonly statements: TStatements;

  constructor(statements: TStatements) {
    this.statements = statements;
  }

  newRole(
    permissions: Partial<{ [K in keyof TStatements]: (TStatements[K][number] | "*")[] }>,
  ): AccessRole<TStatements> {
    const stmts = permissions;
    return {
      statements: stmts,
      can(statement: string, action: string): boolean {
        const allowed = (stmts as any)[statement] ?? [];
        return allowed.includes(action) || allowed.includes("*");
      },
    };
  }
}

export function createAccessControl<const TStatements extends StatementMap>(
  statements: TStatements,
): AccessControl<TStatements> {
  return new AccessControl(statements);
}

export const defaultStatements = {
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "setRole"] as const,
} satisfies StatementMap;

export const ownerAc = {
  statements: { user: ["create", "list", "set-role", "ban", "impersonate", "delete", "setRole"] },
};
export const adminAc = {
  statements: { user: ["create", "list", "set-role", "ban", "impersonate", "delete", "setRole"] },
};
export const memberAc = {
  statements: { user: ["create", "list"] },
};

export function createPermissions<const TStatements extends StatementMap>(statements: TStatements) {
  const mergedStatements = { ...defaultStatements, ...statements };
  const ac = createAccessControl(mergedStatements);
  return { ac, statements: mergedStatements };
}

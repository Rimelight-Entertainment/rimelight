import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc
} from "better-auth/plugins/organization/access"

export { createAccessControl, defaultStatements, ownerAc, adminAc, memberAc }

export interface CreatePermissionsOptions<TStatements extends Record<string, readonly string[]>> {
  statements: TStatements
}

export function createPermissions<const TStatements extends Record<string, readonly string[]>>(
  statements: TStatements
) {
  const mergedStatements = {
    ...defaultStatements,
    ...statements
  }
  const ac = createAccessControl(mergedStatements)
  return {
    ac,
    statements: mergedStatements
  }
}

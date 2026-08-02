import type { PageTemplate } from "../core/types/templates"
import type { UserSessionContext } from "./permissions"

export function canUserInstantiateTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  if (template.allowedRoles && template.allowedRoles.length > 0) {
    if (!session || !session.roles.some((r) => template.allowedRoles.includes(r))) {
      return false
    }
  }

  if (template.requiredPermission) {
    if (!session || !session.permissions.includes(template.requiredPermission)) {
      return false
    }
  }

  return true
}

export function filterTemplatesForUser(
  templates: PageTemplate[],
  session?: UserSessionContext
): PageTemplate[] {
  return templates.filter((t) => canUserInstantiateTemplate(t, session))
}

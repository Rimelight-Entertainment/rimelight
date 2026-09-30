import type { PageTemplate } from "../core/types/templates";
import type { UserSessionContext } from "./permissions";

export function canUserCreateFromTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  const allowedCreate = template.rolePermissions?.whoCanCreate?.length
    ? template.rolePermissions.whoCanCreate
    : template.allowedRoles;

  if (allowedCreate && allowedCreate.length > 0) {
    if (!session || !session.roles.some((r) => allowedCreate.includes(r))) {
      return false;
    }
  }

  if (template.requiredPermission) {
    if (!session || !session.permissions.includes(template.requiredPermission)) {
      return false;
    }
  }

  return true;
}

export function canUserEditFromTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  const allowedEdit = template.rolePermissions?.whoCanEdit;
  if (allowedEdit && allowedEdit.length > 0) {
    if (!session || !session.roles.some((r) => allowedEdit.includes(r))) {
      return false;
    }
  }
  return true;
}

export function canUserReviewFromTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  const allowedReview = template.rolePermissions?.whoCanReview?.length
    ? template.rolePermissions.whoCanReview
    : template.approvalRules?.requiredRolesForApproval;

  if (allowedReview && allowedReview.length > 0) {
    if (!session || !session.roles.some((r) => allowedReview.includes(r))) {
      return false;
    }
  }
  return true;
}

export function canUserViewFromTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  const allowedView = template.rolePermissions?.whoCanView;
  if (allowedView && allowedView.length > 0) {
    if (!session || !session.roles.some((r) => allowedView.includes(r))) {
      return false;
    }
  }
  return true;
}

export function canUserInstantiateTemplate(
  template: PageTemplate,
  session?: UserSessionContext
): boolean {
  return canUserCreateFromTemplate(template, session);
}

export function filterTemplatesForUser(
  templates: PageTemplate[],
  session?: UserSessionContext
): PageTemplate[] {
  return templates.filter((t) => canUserInstantiateTemplate(t, session));
}

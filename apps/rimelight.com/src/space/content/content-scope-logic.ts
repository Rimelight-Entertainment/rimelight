/**
 * Pure helpers for PATCH /v1/content/pages/:id/scope (CMS.6, decision 0049). Kept apart from content-scope.ts so the
 * tests load without the database module. Access checks are in content-access.ts; existence is checked in the route.
 */

export const SCOPE_KINDS = ["Project", "Team", "Department", "Company"] as const;
export type MoveScopeKind = (typeof SCOPE_KINDS)[number];

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export type ScopeMove =
  | { ok: true; kind: MoveScopeKind; id: string | null }
  | { ok: false; message: string };

/**
 * Validates the body {scopeKind, scopeId}. scopeId must be null (or absent) exactly for Company, and a UUID for the
 * other three kinds. Returns the lower-cased id.
 */
export function validateScopeMove(body: Record<string, unknown>): ScopeMove {
  const kind = body["scopeKind"];
  if (typeof kind !== "string" || !(SCOPE_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, message: "scopeKind is Project, Team, Department or Company." };
  }
  const id = body["scopeId"];
  const hasId = id !== undefined && id !== null && id !== "";
  if (kind === "Company") {
    if (hasId) return { ok: false, message: "A Company page has no scopeId." };
    return { ok: true, kind: "Company", id: null };
  }
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, message: "scopeId is the id of the project, team or department." };
  }
  return { ok: true, kind: kind as MoveScopeKind, id: id.toLowerCase() };
}

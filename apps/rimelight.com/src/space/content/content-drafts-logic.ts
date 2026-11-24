/**
 * Pure helpers for GET /v1/content/drafts (CMS.6, decision 0049): the query, and which roles a draft has for the
 * caller. Kept apart from content-drafts.ts so the tests load without the database module.
 *
 * Roles: `mine` (the caller authored the draft), `member` (the caller was invited to it), `reviewer` (the draft is
 * InReview and the caller may manage its page). A draft is listed only when the caller may view its page.
 */
import { atLeast, type AccessLevel } from "../canvas-access.ts";
import { canReviewDraft, type DraftFacts } from "./content-access.ts";

export const DRAFT_LIST_STATUSES = ["Open", "InReview"] as const;
export const DRAFT_ROLES = ["mine", "member", "reviewer"] as const;

export type DraftListStatus = (typeof DRAFT_LIST_STATUSES)[number];
export type DraftRole = (typeof DRAFT_ROLES)[number];

export type DraftListQuery =
  | { ok: true; statuses: DraftListStatus[]; roles: DraftRole[] }
  | { ok: false; message: string };

/**
 * The status and role query params. Each is optional: no status means Open and InReview, no role means all three
 * roles. An unknown value is a 400 message.
 */
export function parseDraftListQuery(
  status: string | undefined | null,
  role: string | undefined | null,
): DraftListQuery {
  let statuses: DraftListStatus[] = [...DRAFT_LIST_STATUSES];
  if (status !== undefined && status !== null && status !== "") {
    if (!(DRAFT_LIST_STATUSES as readonly string[]).includes(status)) {
      return { ok: false, message: "status is Open or InReview." };
    }
    statuses = [status as DraftListStatus];
  }
  let roles: DraftRole[] = [...DRAFT_ROLES];
  if (role !== undefined && role !== null && role !== "") {
    if (!(DRAFT_ROLES as readonly string[]).includes(role)) {
      return { ok: false, message: "role is mine, member or reviewer." };
    }
    roles = [role as DraftRole];
  }
  return { ok: true, statuses, roles };
}

/**
 * The roles a draft has for the caller, in DRAFT_ROLES order. Empty when the caller may not view the page (the draft
 * is then not listed at all), or when the caller has no part in the draft.
 */
export function draftRolesFor(
  draft: DraftFacts,
  callerId: string,
  pageLevel: AccessLevel,
): DraftRole[] {
  if (!atLeast(pageLevel, "view")) return [];
  const roles: DraftRole[] = [];
  if (draft.authorId === callerId) roles.push("mine");
  if (draft.memberIds.includes(callerId)) roles.push("member");
  if (canReviewDraft(draft, pageLevel)) roles.push("reviewer");
  return roles;
}

/**
 * The drafts to list, each once, with the roles that matched. A draft is kept when its status is in the query, and
 * when it has at least one of the requested roles. `levelOf` gives the caller's access to the draft's page.
 */
export function selectDrafts<T extends DraftFacts & { id: string; status: string }>(
  drafts: T[],
  callerId: string,
  query: { statuses: readonly string[]; roles: readonly DraftRole[] },
  levelOf: (draft: T) => AccessLevel,
): { draft: T; roles: DraftRole[] }[] {
  const out: { draft: T; roles: DraftRole[] }[] = [];
  for (const draft of drafts) {
    if (!query.statuses.includes(draft.status)) continue;
    const matched = draftRolesFor(draft, callerId, levelOf(draft)).filter((r) =>
      query.roles.includes(r),
    );
    if (matched.length === 0) continue;
    out.push({ draft, roles: matched });
  }
  return out;
}

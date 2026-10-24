import { asc, eq } from "drizzle-orm";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized } from "../core/types/pages";
import type {
  PageTemplate,
  TemplateApprovalRules,
  TemplateRolePermissions,
} from "../core/types/templates";
import { normalizeBlocks } from "../core/blocks/tree";
import { filterTemplatesForUser } from "../auth/filter-templates";
import {
  CmsError,
  isAdmin,
  json,
  notFound,
  slugify,
  type CmsActor,
  type CmsContext,
} from "./context";

/**
 * Templates are reusable starting points *within* a collection: pre-built block layouts, default
 * property values, and per-template permissions/approval rules (e.g. "Patch note" inside "blog").
 */

export interface TemplateInput {
  slug?: string;
  title: Localized | string;
  description?: Localized | string | null;
  /** Collection slug (stored as `page_type`). */
  collection: string;
  allowedRoles?: string[];
  rolePermissions?: TemplateRolePermissions;
  requiredPermission?: string | null;
  approvalRules?: TemplateApprovalRules;
  defaultProperties?: Record<string, any>;
  initialBlocks?: BaseBlock[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const loc = (v: Localized | string | null | undefined) =>
  v == null ? null : typeof v === "string" ? { en: v } : v;

function toTemplate(row: any): PageTemplate {
  return {
    ...row,
    title: json(row.title, {}),
    description: json(row.description, undefined),
    allowedRoles: json(row.allowedRoles, []),
    rolePermissions: json(row.rolePermissions, {}),
    approvalRules: json(row.approvalRules, {}),
    defaultProperties: json(row.defaultProperties, {}),
    initialBlocks: normalizeBlocks(json(row.initialBlocks, [])),
  };
}

export async function listTemplates(ctx: CmsContext, actor?: CmsActor, collection?: string) {
  const t = ctx.t.pageTemplates;
  const q = ctx.db.select().from(t);
  const rows = await (collection ? q.where(eq(t.pageType, collection)) : q).orderBy(asc(t.slug));
  const all = rows.map(toTemplate);
  return actor ? filterTemplatesForUser(all, actor) : all;
}

export async function getTemplate(ctx: CmsContext, idOrSlug: string): Promise<PageTemplate> {
  const t = ctx.t.pageTemplates;
  const rows = await ctx.db
    .select()
    .from(t)
    .where(UUID.test(idOrSlug) ? eq(t.id, idOrSlug) : eq(t.slug, idOrSlug))
    .limit(1);
  if (!rows[0]) throw notFound("Template");
  return toTemplate(rows[0]);
}

function assertAdmin(actor: CmsActor) {
  if (!isAdmin(actor)) throw new CmsError(403, "Only admins can manage templates");
}

function values(input: Partial<TemplateInput>) {
  const v: Record<string, any> = {};
  if (input.title !== undefined) v["title"] = loc(input.title);
  if (input.description !== undefined) v["description"] = loc(input.description);
  if (input.collection !== undefined) v["pageType"] = input.collection;
  if (input.rolePermissions !== undefined) {
    v["rolePermissions"] = input.rolePermissions;
    v["allowedRoles"] = input.rolePermissions.whoCanCreate ?? [];
  } else if (input.allowedRoles !== undefined) {
    v["allowedRoles"] = input.allowedRoles;
  }
  if (input.requiredPermission !== undefined) v["requiredPermission"] = input.requiredPermission;
  if (input.approvalRules !== undefined) v["approvalRules"] = input.approvalRules;
  if (input.defaultProperties !== undefined) v["defaultProperties"] = input.defaultProperties;
  if (input.initialBlocks !== undefined) v["initialBlocks"] = normalizeBlocks(input.initialBlocks);
  return v;
}

export async function createTemplate(ctx: CmsContext, actor: CmsActor, input: TemplateInput) {
  assertAdmin(actor);
  const slug = slugify(
    input.slug || (typeof input.title === "string" ? input.title : (input.title["en"] ?? "")),
  ).replace(/\//g, "-");
  if (!slug) throw new CmsError(422, "Template slug is required");
  const [row] = await ctx.db
    .insert(ctx.t.pageTemplates)
    .values({ slug, version: 1, createdAt: new Date(), ...values(input) })
    .returning();
  return toTemplate(row);
}

/** Every structural edit bumps `version` so entries can tell they were made from an older layout. */
export async function updateTemplate(
  ctx: CmsContext,
  actor: CmsActor,
  idOrSlug: string,
  input: Partial<TemplateInput>,
) {
  assertAdmin(actor);
  const current = await getTemplate(ctx, idOrSlug);
  const patch = values(input);
  if (input.slug) patch["slug"] = slugify(input.slug);
  if (input.initialBlocks !== undefined || input.defaultProperties !== undefined) {
    patch["version"] = current.version + 1;
  }
  const [row] = await ctx.db
    .update(ctx.t.pageTemplates)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(ctx.t.pageTemplates.id, current.id))
    .returning();
  return toTemplate(row);
}

export async function deleteTemplate(ctx: CmsContext, actor: CmsActor, idOrSlug: string) {
  assertAdmin(actor);
  const current = await getTemplate(ctx, idOrSlug);
  // pages.template_id is ON DELETE SET NULL, so entries keep their content.
  await ctx.db.delete(ctx.t.pageTemplates).where(eq(ctx.t.pageTemplates.id, current.id));
  return { success: true };
}

/** Seeds templates declared in code (cms.config `templates`) that don't exist yet. */
export async function seedTemplates(ctx: CmsContext, templates: TemplateInput[]) {
  let created = 0;
  for (const tpl of templates) {
    const slug = slugify(tpl.slug ?? "");
    if (!slug) continue;
    const exists = await ctx.db
      .select({ id: ctx.t.pageTemplates.id })
      .from(ctx.t.pageTemplates)
      .where(eq(ctx.t.pageTemplates.slug, slug))
      .limit(1);
    if (exists[0]) continue;
    await ctx.db
      .insert(ctx.t.pageTemplates)
      .values({ slug, version: 1, createdAt: new Date(), ...values(tpl) });
    created++;
  }
  return created;
}

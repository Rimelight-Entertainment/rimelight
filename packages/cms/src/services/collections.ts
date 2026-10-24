import { asc, eq } from "drizzle-orm";
import type { CmsActor, CmsContext } from "./context";
import { CmsError, isAdmin, json, notFound, slugify } from "./context";
import { builtinCollections } from "../core/collections/builtins";
import { resolveCollection, resolveLabel } from "../core/collections/define";
import type { CollectionDefinition, ResolvedCollection } from "../core/collections/types";

function fromRow(row: any): ResolvedCollection {
  const { groups = {}, fields = {} } = json<{ groups?: any; fields?: any }>(row.fieldSchema, {});
  const features = json<Record<string, any>>(row.features, {});
  const def: CollectionDefinition = {
    slug: row.slug,
    label: json<any>(row.name, {}),
    description: json<any>(row.description, null) ?? undefined,
    icon: row.icon ?? "i-lucide-box",
    ...(row.color ? { color: row.color } : {}),
    kind: row.mode ?? "document",
    groups,
    fields,
    features,
    workflow: json(row.workflow, {}),
    initialBlocks: json(row.initialBlocks, []),
  };
  return { ...resolveCollection(def, "database"), id: row.id };
}

function toRow(def: CollectionDefinition) {
  const label = typeof def.label === "string" ? { en: def.label } : def.label;
  const description =
    def.description === undefined
      ? null
      : typeof def.description === "string"
        ? { en: def.description }
        : def.description;
  return {
    slug: def.slug,
    name: label,
    description,
    icon: def.icon ?? "i-lucide-box",
    color: def.color ?? null,
    mode: def.kind ?? "document",
    fieldSchema: { groups: def.groups ?? {}, fields: def.fields ?? {} },
    features: def.features ?? {},
    workflow: def.workflow ?? {},
    initialBlocks: Array.isArray(def.initialBlocks) ? def.initialBlocks : [],
  };
}

/**
 * Collections come from built-ins, `cms.config.ts`, and `content_types` rows (dashboard-created
 * or overrides). Later sources override earlier ones by slug.
 */
export async function listCollections(ctx: CmsContext): Promise<ResolvedCollection[]> {
  const bySlug = new Map<string, ResolvedCollection>();
  for (const def of builtinCollections) bySlug.set(def.slug, resolveCollection(def, "code"));
  for (const def of ctx.collections) bySlug.set(def.slug, resolveCollection(def, "code"));

  const rows = await ctx.db.select().from(ctx.t.contentTypes).orderBy(asc(ctx.t.contentTypes.slug));
  for (const row of rows) bySlug.set(row.slug, fromRow(row));

  return [...bySlug.values()];
}

export async function getCollection(ctx: CmsContext, slug: string): Promise<ResolvedCollection> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.contentTypes)
    .where(eq(ctx.t.contentTypes.slug, slug))
    .limit(1);
  if (rows[0]) return fromRow(rows[0]);
  const code =
    ctx.collections.find((c) => c.slug === slug) ?? builtinCollections.find((c) => c.slug === slug);
  if (code) return resolveCollection(code, "code");
  throw notFound(`Collection "${slug}"`);
}

function assertAdmin(actor: CmsActor) {
  if (!isAdmin(actor)) throw new CmsError(403, "Only admins can change collection schemas");
}

export async function createCollection(
  ctx: CmsContext,
  actor: CmsActor,
  def: CollectionDefinition,
) {
  assertAdmin(actor);
  const slug = slugify(def.slug || resolveLabel(def.label)).replace(/\//g, "-");
  if (!slug) throw new CmsError(422, "Collection slug is required");
  const existing = await ctx.db
    .select({ id: ctx.t.contentTypes.id })
    .from(ctx.t.contentTypes)
    .where(eq(ctx.t.contentTypes.slug, slug))
    .limit(1);
  if (existing[0]) throw new CmsError(409, `Collection "${slug}" already exists`);
  const [row] = await ctx.db
    .insert(ctx.t.contentTypes)
    .values(toRow({ ...def, slug }))
    .returning();
  return fromRow(row);
}

/**
 * Updates (or, for a code collection, overrides) a collection. Overriding a code
 * collection stores a DB copy that then takes precedence; deleting it restores the code version.
 */
export async function updateCollection(
  ctx: CmsContext,
  actor: CmsActor,
  slug: string,
  patch: Partial<CollectionDefinition>,
) {
  assertAdmin(actor);
  const current = await getCollection(ctx, slug);
  const next: CollectionDefinition = { ...current, ...patch, slug };
  const values = { ...toRow(next), updatedAt: new Date() };
  if (current.source === "database") {
    const [row] = await ctx.db
      .update(ctx.t.contentTypes)
      .set(values)
      .where(eq(ctx.t.contentTypes.slug, slug))
      .returning();
    return fromRow(row);
  }
  const [row] = await ctx.db.insert(ctx.t.contentTypes).values(values).returning();
  return fromRow(row);
}

export async function deleteCollection(ctx: CmsContext, actor: CmsActor, slug: string) {
  assertAdmin(actor);
  const rows = await ctx.db
    .select()
    .from(ctx.t.contentTypes)
    .where(eq(ctx.t.contentTypes.slug, slug))
    .limit(1);
  if (!rows[0]) throw new CmsError(400, `"${slug}" is defined in code and cannot be deleted here`);
  if (rows[0].isSystem) throw new CmsError(403, `"${slug}" is a system collection`);
  // Entries are kept: the collection falls back to its code definition (if any).
  await ctx.db.delete(ctx.t.contentTypes).where(eq(ctx.t.contentTypes.slug, slug));
  return { success: true };
}

import { asc, eq, sql } from "drizzle-orm";
import type { CmsActor, CmsContext } from "./context";
import { CmsError, isAdmin, json, notFound, slugify } from "./context";
import {
  collectionPresets,
  getCollectionPreset,
  type CollectionPreset,
} from "../core/collections/presets";
import { resolveCollection, resolveLabel } from "../core/collections/define";
import type { CollectionDefinition, Label, ResolvedCollection } from "../core/collections/types";

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
  return { ...resolveCollection(def), id: row.id };
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

/** Every collection in the database. Collections are created in the CMS, never in code. */
export async function listCollections(ctx: CmsContext): Promise<ResolvedCollection[]> {
  const rows = await ctx.db.select().from(ctx.t.contentTypes).orderBy(asc(ctx.t.contentTypes.slug));
  return rows.map(fromRow);
}

export async function getCollection(ctx: CmsContext, slug: string): Promise<ResolvedCollection> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.contentTypes)
    .where(eq(ctx.t.contentTypes.slug, slug))
    .limit(1);
  if (!rows[0]) throw notFound(`Collection "${slug}"`);
  return fromRow(rows[0]);
}

/** Presets available to scaffold a collection from. Plain data. */
export function listCollectionPresets(): CollectionPreset[] {
  return collectionPresets;
}

function assertAdmin(actor: CmsActor) {
  if (!isAdmin(actor)) throw new CmsError(403, "Only admins can change collection schemas");
}

export async function createCollection(
  ctx: CmsContext,
  actor: CmsActor,
  def: CollectionDefinition,
): Promise<ResolvedCollection> {
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
 * Creates a collection from a preset. `slug` and `label` default to the preset's and can be
 * overridden, e.g. to create a second "blog"-shaped collection under another slug.
 */
export async function createCollectionFromPreset(
  ctx: CmsContext,
  actor: CmsActor,
  presetId: string,
  overrides: { slug?: string; label?: Label } = {},
): Promise<ResolvedCollection> {
  assertAdmin(actor);
  if (!presetId) throw new CmsError(422, "A preset id is required");
  const preset = getCollectionPreset(presetId);
  if (!preset) throw notFound(`Collection preset "${presetId}"`);
  return createCollection(ctx, actor, {
    ...preset.definition,
    ...(overrides.slug ? { slug: overrides.slug } : {}),
    ...(overrides.label ? { label: overrides.label } : {}),
  });
}

export async function updateCollection(
  ctx: CmsContext,
  actor: CmsActor,
  slug: string,
  patch: Partial<CollectionDefinition>,
): Promise<ResolvedCollection> {
  assertAdmin(actor);
  const current = await getCollection(ctx, slug);
  const next: CollectionDefinition = { ...current, ...patch, slug };
  const [row] = await ctx.db
    .update(ctx.t.contentTypes)
    .set({ ...toRow(next), updatedAt: new Date() })
    .where(eq(ctx.t.contentTypes.slug, slug))
    .returning();
  return fromRow(row);
}

/**
 * Deletes a collection row. Refused while entries still use it: a collection with no definition
 * makes its entries unloadable, so move or delete the entries first.
 */
export async function deleteCollection(
  ctx: CmsContext,
  actor: CmsActor,
  slug: string,
): Promise<{ success: true }> {
  assertAdmin(actor);
  const rows = await ctx.db
    .select()
    .from(ctx.t.contentTypes)
    .where(eq(ctx.t.contentTypes.slug, slug))
    .limit(1);
  if (!rows[0]) throw notFound(`Collection "${slug}"`);
  const [{ n } = { n: 0 }] = await ctx.db
    .select({ n: sql<number>`count(*)` })
    .from(ctx.t.pages)
    .where(eq(ctx.t.pages.type, slug));
  if (Number(n) > 0)
    throw new CmsError(409, `"${slug}" still has ${Number(n)} entries; move or delete them first`);
  await ctx.db.delete(ctx.t.contentTypes).where(eq(ctx.t.contentTypes.slug, slug));
  return { success: true };
}

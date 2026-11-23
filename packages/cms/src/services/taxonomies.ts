import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { TaxonomyDefinition, TaxonomyTerm } from "../core/types/taxonomies";
import {
  getTaxonomyPreset,
  taxonomyPresets,
  type TaxonomyPreset,
} from "../core/taxonomies/presets";
import { resolveLabel } from "../core/collections/define";
import {
  CmsError,
  isAdmin,
  json,
  notFound,
  slugify,
  type CmsActor,
  type CmsContext,
} from "./context";

const loc = (v: string | Record<string, string>) => (typeof v === "string" ? { en: v } : v);

/** Taxonomies are created in the CMS (or from a preset) and stored in the `taxonomies` table. */
export interface Taxonomy extends TaxonomyDefinition {
  label: TaxonomyDefinition["label"];
  hierarchical: boolean;
  collections: string[];
}

/**
 * Boolean columns come back as Postgres text ("t"/"f") when the worker driver runs in raw-text mode,
 * and as 1/0 from SQLite, so `!!value` is wrong for them: "f" is truthy.
 */
export function isTrueColumn(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true" || value === "1";
}

function toTaxonomy(row: any): Taxonomy {
  return {
    slug: row.slug,
    label: json<any>(row.label, row.label),
    description: json<any>(row.description, null) ?? undefined,
    hierarchical: isTrueColumn(row.hierarchical),
    collections: json<string[]>(row.collections, []),
  };
}

function assertAdmin(actor: CmsActor) {
  if (!isAdmin(actor)) throw new CmsError(403, "Only admins can change taxonomies");
}

export async function listTaxonomies(ctx: CmsContext): Promise<Taxonomy[]> {
  const rows = await ctx.db.select().from(ctx.t.taxonomies).orderBy(asc(ctx.t.taxonomies.slug));
  return rows.map(toTaxonomy);
}

export async function getTaxonomy(ctx: CmsContext, slug: string): Promise<Taxonomy> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.taxonomies)
    .where(eq(ctx.t.taxonomies.slug, slug))
    .limit(1);
  if (!rows[0]) throw notFound(`Taxonomy "${slug}"`);
  return toTaxonomy(rows[0]);
}

/** Presets available to scaffold a taxonomy from. Plain data. */
export function listTaxonomyPresets(): TaxonomyPreset[] {
  return taxonomyPresets;
}

export async function createTaxonomy(
  ctx: CmsContext,
  actor: CmsActor,
  def: TaxonomyDefinition,
): Promise<Taxonomy> {
  assertAdmin(actor);
  const slug = slugify(def.slug || resolveLabel(def.label)).replace(/\//g, "-");
  if (!slug) throw new CmsError(422, "Taxonomy slug is required");
  const existing = await ctx.db
    .select({ slug: ctx.t.taxonomies.slug })
    .from(ctx.t.taxonomies)
    .where(eq(ctx.t.taxonomies.slug, slug))
    .limit(1);
  if (existing[0]) throw new CmsError(409, `Taxonomy "${slug}" already exists`);
  const [row] = await ctx.db
    .insert(ctx.t.taxonomies)
    .values({
      slug,
      label: typeof def.label === "string" ? { en: def.label } : def.label,
      description: def.description == null ? null : loc(def.description),
      hierarchical: !!def.hierarchical,
      collections: def.collections ?? [],
      createdAt: new Date(),
    })
    .returning();
  return toTaxonomy(row);
}

/** Scaffolds a taxonomy from a preset. `slug` and `label` can be overridden. */
export async function createTaxonomyFromPreset(
  ctx: CmsContext,
  actor: CmsActor,
  presetId: string,
  overrides: { slug?: string; label?: TaxonomyDefinition["label"] } = {},
): Promise<Taxonomy> {
  assertAdmin(actor);
  if (!presetId) throw new CmsError(422, "A preset id is required");
  const preset = getTaxonomyPreset(presetId);
  if (!preset) throw notFound(`Taxonomy preset "${presetId}"`);
  return createTaxonomy(ctx, actor, {
    ...preset.definition,
    ...(overrides.slug ? { slug: overrides.slug } : {}),
    ...(overrides.label ? { label: overrides.label } : {}),
  });
}

export async function updateTaxonomy(
  ctx: CmsContext,
  actor: CmsActor,
  slug: string,
  patch: Partial<TaxonomyDefinition>,
): Promise<Taxonomy> {
  assertAdmin(actor);
  await getTaxonomy(ctx, slug);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.label !== undefined) set["label"] = loc(patch.label);
  if (patch.description !== undefined)
    set["description"] = patch.description == null ? null : loc(patch.description);
  if (patch.hierarchical !== undefined) set["hierarchical"] = !!patch.hierarchical;
  if (patch.collections !== undefined) set["collections"] = patch.collections;
  const [row] = await ctx.db
    .update(ctx.t.taxonomies)
    .set(set)
    .where(eq(ctx.t.taxonomies.slug, slug))
    .returning();
  return toTaxonomy(row);
}

/** Refused while terms exist: their entries would lose the vocabulary they belong to. */
export async function deleteTaxonomy(
  ctx: CmsContext,
  actor: CmsActor,
  slug: string,
): Promise<{ success: true }> {
  assertAdmin(actor);
  await getTaxonomy(ctx, slug);
  const [{ n } = { n: 0 }] = await ctx.db
    .select({ n: sql<number>`count(*)` })
    .from(ctx.t.taxonomyTerms)
    .where(eq(ctx.t.taxonomyTerms.taxonomy, slug));
  if (Number(n) > 0)
    throw new CmsError(409, `"${slug}" still has ${Number(n)} terms; delete them first`);
  await ctx.db.delete(ctx.t.taxonomies).where(eq(ctx.t.taxonomies.slug, slug));
  return { success: true };
}

function toTerm(row: any, count = 0): TaxonomyTerm {
  const label = json<any>(row.label, row.label);
  const description = json<any>(row.description, row.description);
  return {
    id: row.id,
    taxonomy: row.taxonomy,
    slug: row.slug,
    label,
    name: resolveLabel(label),
    description: description ?? null,
    parentId: row.parentId ?? null,
    displayOrder: row.displayOrder ?? 0,
    count,
    postCount: count,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function buildTermTree(terms: TaxonomyTerm[]): TaxonomyTerm[] {
  const byId = new Map(terms.map((t) => [t.id, { ...t, children: [] as TaxonomyTerm[] }]));
  const roots: TaxonomyTerm[] = [];
  for (const term of byId.values()) {
    const parent = term.parentId ? byId.get(term.parentId) : undefined;
    if (parent) parent.children!.push(term);
    else roots.push(term);
  }
  return roots;
}

/** Flat list of terms with published-entry counts. Use `buildTermTree` for hierarchy. */
export async function listTerms(ctx: CmsContext, taxonomy: string): Promise<TaxonomyTerm[]> {
  const { taxonomyTerms: tt, pageTaxonomyTerms: ptt, pages: p } = ctx.t;
  const [rows, counts] = await Promise.all([
    ctx.db
      .select()
      .from(tt)
      .where(eq(tt.taxonomy, taxonomy))
      .orderBy(asc(tt.displayOrder), asc(tt.slug)),
    ctx.db
      .select({ termId: ptt.termId, n: sql<number>`count(*)` })
      .from(ptt)
      .innerJoin(p, eq(p.id, ptt.pageId))
      .innerJoin(tt, eq(tt.id, ptt.termId))
      .where(and(eq(tt.taxonomy, taxonomy), isNull(p.deletedAt), eq(p.status, "published")))
      .groupBy(ptt.termId),
  ]);
  const countMap = new Map<string, number>(counts.map((c: any) => [c.termId, Number(c.n)]));
  return rows.map((r: any) => toTerm(r, countMap.get(r.id) ?? 0));
}

export async function getTerm(
  ctx: CmsContext,
  taxonomy: string,
  idOrSlug: string,
): Promise<TaxonomyTerm> {
  const tt = ctx.t.taxonomyTerms;
  const rows = await ctx.db
    .select()
    .from(tt)
    .where(and(eq(tt.taxonomy, taxonomy), eq(tt.slug, idOrSlug)))
    .limit(1);
  const row =
    rows[0] ??
    (
      await ctx.db
        .select()
        .from(tt)
        .where(eq(tt.id, idOrSlug))
        .limit(1)
        .catch(() => [])
    )[0];
  if (!row) throw notFound("Term");
  return toTerm(row);
}

export interface TermInput {
  slug?: string;
  label: string | Record<string, string>;
  description?: string | Record<string, string> | null;
  parentId?: string | null;
  displayOrder?: number;
}

export async function createTerm(
  ctx: CmsContext,
  _actor: CmsActor,
  taxonomy: string,
  input: TermInput,
): Promise<TaxonomyTerm> {
  const exists = await ctx.db
    .select({ slug: ctx.t.taxonomies.slug })
    .from(ctx.t.taxonomies)
    .where(eq(ctx.t.taxonomies.slug, taxonomy))
    .limit(1);
  if (!exists[0]) throw new CmsError(404, `Unknown taxonomy "${taxonomy}". Create it first.`);
  const slug = slugify(input.slug || resolveLabel(input.label)).replace(/\//g, "-");
  if (!slug) throw new CmsError(422, "Term slug is required");
  const [row] = await ctx.db
    .insert(ctx.t.taxonomyTerms)
    .values({
      taxonomy,
      slug,
      label: input.label,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      displayOrder: input.displayOrder ?? 0,
      createdAt: new Date(),
    })
    .returning();
  return toTerm(row);
}

export async function updateTerm(
  ctx: CmsContext,
  _actor: CmsActor,
  id: string,
  input: Partial<TermInput>,
): Promise<TaxonomyTerm> {
  if (input.parentId && input.parentId === id)
    throw new CmsError(422, "A term cannot be its own parent");
  const patch: Record<string, any> = { updatedAt: new Date() };
  if (input.slug !== undefined) patch["slug"] = slugify(input.slug).replace(/\//g, "-");
  if (input.label !== undefined) patch["label"] = input.label;
  if (input.description !== undefined) patch["description"] = input.description;
  if (input.parentId !== undefined) patch["parentId"] = input.parentId;
  if (input.displayOrder !== undefined) patch["displayOrder"] = input.displayOrder;
  const [row] = await ctx.db
    .update(ctx.t.taxonomyTerms)
    .set(patch)
    .where(eq(ctx.t.taxonomyTerms.id, id))
    .returning();
  if (!row) throw notFound("Term");
  return toTerm(row);
}

export async function deleteTerm(
  ctx: CmsContext,
  _actor: CmsActor,
  id: string,
): Promise<{ success: true }> {
  await ctx.db.delete(ctx.t.taxonomyTerms).where(eq(ctx.t.taxonomyTerms.id, id));
  return { success: true };
}

export async function getEntryTerms(
  ctx: CmsContext,
  entryId: string,
  taxonomy?: string,
): Promise<TaxonomyTerm[]> {
  const { taxonomyTerms: tt, pageTaxonomyTerms: ptt } = ctx.t;
  const where = [eq(ptt.pageId, entryId)];
  if (taxonomy) where.push(eq(tt.taxonomy, taxonomy));
  const rows = await ctx.db
    .select({ term: tt })
    .from(ptt)
    .innerJoin(tt, eq(tt.id, ptt.termId))
    .where(and(...where))
    .orderBy(asc(tt.displayOrder));
  return rows.map((r: any) => toTerm(r.term));
}

/** Terms for many entries in one query, grouped by entry id (for list/delivery responses). */
export async function getTermsForEntries(
  ctx: CmsContext,
  entryIds: string[],
): Promise<Map<string, TaxonomyTerm[]>> {
  const out = new Map<string, TaxonomyTerm[]>();
  if (!entryIds.length) return out;
  const { taxonomyTerms: tt, pageTaxonomyTerms: ptt } = ctx.t;
  const rows = await ctx.db
    .select({ pageId: ptt.pageId, term: tt })
    .from(ptt)
    .innerJoin(tt, eq(tt.id, ptt.termId))
    .where(inArray(ptt.pageId, entryIds))
    .orderBy(asc(tt.displayOrder));
  for (const r of rows) {
    const list = out.get(String(r.pageId)) ?? [];
    list.push(toTerm(r.term));
    out.set(String(r.pageId), list);
  }
  return out;
}

/** Replaces the entry's terms within one taxonomy. */
export async function setEntryTerms(
  ctx: CmsContext,
  _actor: CmsActor,
  entryId: string,
  taxonomy: string,
  termIds: string[],
): Promise<TaxonomyTerm[]> {
  const { taxonomyTerms: tt, pageTaxonomyTerms: ptt } = ctx.t;
  const current = await getEntryTerms(ctx, entryId, taxonomy);
  const keep = new Set(termIds);
  const remove = current.filter((t: any) => !keep.has(t.id)).map((t: any) => t.id);
  if (remove.length) {
    await ctx.db.delete(ptt).where(and(eq(ptt.pageId, entryId), inArray(ptt.termId, remove)));
  }
  const have = new Set(current.map((t: any) => t.id));
  const add = termIds.filter((id) => !have.has(id));
  if (add.length) {
    const valid = await ctx.db
      .select({ id: tt.id })
      .from(tt)
      .where(and(eq(tt.taxonomy, taxonomy), inArray(tt.id, add)));
    if (valid.length !== add.length) throw new CmsError(422, `Some terms are not in "${taxonomy}"`);
    await ctx.db
      .insert(ptt)
      .values(add.map((termId) => ({ pageId: entryId, termId, assignedAt: new Date() })))
      .onConflictDoNothing();
  }
  return getEntryTerms(ctx, entryId, taxonomy);
}

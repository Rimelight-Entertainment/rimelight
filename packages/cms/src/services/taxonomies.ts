import { taxonomyTerms, pageTaxonomyTerms } from "../schema/taxonomies";
import { pages } from "../schema/pages";
import type { TaxonomyTerm, TaxonomyQueryOptions } from "../core/types/taxonomies";
import { eq, and, isNull, asc, sql } from "drizzle-orm";

/**
 * Retrieves all terms for a given taxonomy. If hierarchical, returns a tree structure with
 * `children: TaxonomyTerm[]`.
 */
export async function getTaxonomyTerms(
  db: any,
  taxonomy: string,
  options: TaxonomyQueryOptions = {},
): Promise<TaxonomyTerm[]> {
  if (!db) return [];

  const includeCounts = options.includeCounts ?? true;

  const rawTerms = await db
    .select()
    .from(taxonomyTerms)
    .where(eq(taxonomyTerms.taxonomy, taxonomy))
    .orderBy(asc(taxonomyTerms.displayOrder), asc(taxonomyTerms.createdAt));

  if (!rawTerms || rawTerms.length === 0) return [];

  // Count active published posts per term if requested
  const countsMap = new Map<string, number>();
  if (includeCounts) {
    try {
      const counts = await db
        .select({
          termId: pageTaxonomyTerms.termId,
          count: sql<number>`count(${pageTaxonomyTerms.pageId})::int`,
        })
        .from(pageTaxonomyTerms)
        .innerJoin(pages, eq(pages.id, pageTaxonomyTerms.pageId))
        .where(isNull(pages.deletedAt))
        .groupBy(pageTaxonomyTerms.termId);

      for (const row of counts) {
        countsMap.set(row.termId, Number(row.count));
      }
    } catch {
      // Fallback if joined counts query fails
    }
  }

  const termsWithCounts: TaxonomyTerm[] = rawTerms.map((t: any) =>
    normalizeTermRecord(t, countsMap.get(t.id) ?? 0),
  );

  // Determine if this taxonomy is hierarchical (any term has parentId)
  const isHierarchical = termsWithCounts.some((t) => !!t.parentId);
  if (!isHierarchical) {
    return termsWithCounts;
  }

  // Build tree
  const idMap = new Map<string, TaxonomyTerm>();
  const rootTerms: TaxonomyTerm[] = [];

  termsWithCounts.forEach((term) => {
    idMap.set(term.id, term);
  });

  termsWithCounts.forEach((term) => {
    if (term.parentId && idMap.has(term.parentId)) {
      const parent = idMap.get(term.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(term);
    } else {
      rootTerms.push(term);
    }
  });

  return rootTerms;
}

/**
 * Retrieves a single term by taxonomy and slug.
 */
export async function getTerm(
  db: any,
  taxonomy: string,
  slug: string,
): Promise<TaxonomyTerm | null> {
  if (!db) return null;

  const results = await db
    .select()
    .from(taxonomyTerms)
    .where(and(eq(taxonomyTerms.taxonomy, taxonomy), eq(taxonomyTerms.slug, slug)))
    .limit(1);

  if (!results[0]) return null;

  // Get post count
  let count = 0;
  try {
    const countResult = await db
      .select({ count: sql<number>`count(${pageTaxonomyTerms.pageId})::int` })
      .from(pageTaxonomyTerms)
      .innerJoin(pages, eq(pages.id, pageTaxonomyTerms.pageId))
      .where(and(eq(pageTaxonomyTerms.termId, results[0].id), isNull(pages.deletedAt)));
    count = Number(countResult[0]?.count ?? 0);
  } catch {
    count = 0;
  }

  return normalizeTermRecord(results[0], count);
}

/**
 * Retrieves all terms assigned to a specific page entry.
 */
export async function getEntryTerms(
  db: any,
  pageId: string,
  taxonomy?: string,
): Promise<TaxonomyTerm[]> {
  if (!db || !pageId) return [];

  const conditions = [eq(pageTaxonomyTerms.pageId, pageId)];
  if (taxonomy) {
    conditions.push(eq(taxonomyTerms.taxonomy, taxonomy));
  }

  const results = await db
    .select({
      id: taxonomyTerms.id,
      taxonomy: taxonomyTerms.taxonomy,
      slug: taxonomyTerms.slug,
      label: taxonomyTerms.label,
      description: taxonomyTerms.description,
      parentId: taxonomyTerms.parentId,
      displayOrder: taxonomyTerms.displayOrder,
    })
    .from(pageTaxonomyTerms)
    .innerJoin(taxonomyTerms, eq(taxonomyTerms.id, pageTaxonomyTerms.termId))
    .where(and(...conditions))
    .orderBy(asc(taxonomyTerms.displayOrder));

  return results;
}

/**
 * Retrieves pages tagged with a given taxonomy term.
 */
export async function getEntriesByTerm(
  db: any,
  taxonomy: string,
  slug: string,
  options: { limit?: number; offset?: number; type?: string } = {},
) {
  if (!db) return { entries: [], total: 0 };

  const term = await getTerm(db, taxonomy, slug);
  if (!term) return { entries: [], total: 0 };

  const conditions: any[] = [eq(pageTaxonomyTerms.termId, term.id), isNull(pages.deletedAt)];

  if (options.type) {
    conditions.push(eq(pages.type, options.type));
  }

  let query = db
    .select({ page: pages })
    .from(pageTaxonomyTerms)
    .innerJoin(pages, eq(pages.id, pageTaxonomyTerms.pageId))
    .where(and(...conditions))
    .orderBy(asc(pages.createdAt));

  if (options.limit) query = query.limit(options.limit);
  if (options.offset) query = query.offset(options.offset);

  const rows = await query;
  const entries = rows.map((r: any) => r.page);

  return { entries, total: term.count ?? entries.length, term };
}

/**
 * Sets/syncs the assigned terms for a page within a specific taxonomy.
 */
export async function assignEntryTerms(
  db: any,
  pageId: string,
  taxonomy: string,
  termIds: string[],
) {
  if (!db || !pageId) return;

  // Find all current terms in this taxonomy assigned to the page
  const currentAssigned = await getEntryTerms(db, pageId, taxonomy);
  const currentTermIds = new Set(currentAssigned.map((t) => t.id));
  const newTermIds = new Set(termIds);

  // Remove unassigned
  for (const term of currentAssigned) {
    if (!newTermIds.has(term.id)) {
      await db
        .delete(pageTaxonomyTerms)
        .where(and(eq(pageTaxonomyTerms.pageId, pageId), eq(pageTaxonomyTerms.termId, term.id)));
    }
  }

  // Insert newly assigned
  for (const termId of termIds) {
    if (!currentTermIds.has(termId)) {
      await db.insert(pageTaxonomyTerms).values({ pageId, termId }).onConflictDoNothing();
    }
  }
}

function normalizeTermRecord(t: any, count = 0): TaxonomyTerm {
  const rawLabel = t?.label ?? t?.name ?? "";
  const nameStr =
    typeof rawLabel === "object" && rawLabel !== null
      ? rawLabel.en || Object.values(rawLabel)[0] || ""
      : String(rawLabel);
  const rawDesc = t?.description ?? "";
  const descStr =
    typeof rawDesc === "object" && rawDesc !== null
      ? rawDesc.en || Object.values(rawDesc)[0] || ""
      : rawDesc
        ? String(rawDesc)
        : undefined;
  return {
    id: t.id,
    taxonomy: t.taxonomy,
    slug: t.slug,
    label: rawLabel,
    name: nameStr,
    description: descStr,
    parentId: t.parentId,
    displayOrder: t.displayOrder,
    count,
    postCount: count,
    children: [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

/**
 * Creates a new taxonomy term.
 */
export async function createTerm(
  db: any,
  data: {
    taxonomy: string;
    slug: string;
    label?: any;
    name?: string;
    description?: any;
    parentId?: string | null;
    displayOrder?: number;
  },
) {
  const insertData = {
    taxonomy: data.taxonomy,
    slug: data.slug,
    label: data.label ?? data.name ?? data.slug,
    description: data.description,
    parentId: data.parentId,
    displayOrder: data.displayOrder ?? 0,
  };
  const result = await db.insert(taxonomyTerms).values(insertData).returning();
  return result[0] ? normalizeTermRecord(result[0], 0) : null;
}

/**
 * Updates an existing taxonomy term.
 */
export async function updateTerm(
  db: any,
  id: string,
  updates: Partial<{
    slug: string;
    label: any;
    name: string;
    description: any;
    parentId: string | null;
    displayOrder: number;
  }>,
) {
  const updatePayload: any = { ...updates, updatedAt: new Date() };
  if (updates.name && !updates.label) {
    updatePayload.label = updates.name;
    delete updatePayload.name;
  }
  const result = await db
    .update(taxonomyTerms)
    .set(updatePayload)
    .where(eq(taxonomyTerms.id, id))
    .returning();
  return result[0] ? normalizeTermRecord(result[0], 0) : null;
}

/**
 * Deletes a taxonomy term.
 */
export async function deleteTerm(db: any, id: string) {
  await db.delete(taxonomyTerms).where(eq(taxonomyTerms.id, id));
  return { success: true };
}

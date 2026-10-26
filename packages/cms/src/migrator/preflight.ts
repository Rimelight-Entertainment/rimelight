import { sql } from "drizzle-orm";
import { detectDialect } from "../db/index";
import { collectionPresets } from "../core/collections/presets";
import { taxonomyPresets } from "../core/taxonomies/presets";

export interface MissingCollection {
  slug: string;
  entries: number;
  /** A preset with this id exists, so the collection can be scaffolded from it. */
  preset?: string;
}

export interface CollectionPreflight {
  dialect: "sqlite" | "pg";
  /** Every `pages.type` in use, with how many entries use it. */
  referenced: { slug: string; entries: number }[];
  /** Referenced slugs that have a `content_types` row. */
  inDatabase: string[];
  /** Referenced slugs with no `content_types` row: entries of these types can't be loaded. */
  missing: MissingCollection[];
  /** Taxonomy slugs that collections or terms use but no `taxonomies` row defines. */
  missingTaxonomies: { slug: string; uses: number; preset?: string }[];
  /** Templates whose collection has no `content_types` row. */
  orphanTemplates: { slug: string; collection: string }[];
  /** Names recorded in `_rimelight_cms_migrations`. */
  appliedMigrations: string[];
}

const rowsOf = (res: any): any[] => (Array.isArray(res) ? res : (res?.rows ?? res?.results ?? []));
const asObject = (v: unknown): Record<string, any> =>
  typeof v === "string" ? JSON.parse(v || "{}") : ((v as Record<string, any>) ?? {});

/**
 * Read-only check of everything content depends on: every collection that entries use, every
 * taxonomy that collections or terms use, and every template's collection. Missing items are
 * flagged, with a preset to scaffold from when one matches. Run it before a deploy so a gap shows
 * up there rather than as broken pages. Never writes.
 */
export async function collectionPreflight(db: any): Promise<CollectionPreflight> {
  const dialect = detectDialect(db);
  const run = async (statement: string) => {
    const res =
      dialect === "sqlite"
        ? await db.all(sql.raw(statement))
        : await db.execute(sql.raw(statement));
    return rowsOf(res);
  };

  const usage = await run(`SELECT type AS slug, COUNT(*) AS entries FROM pages GROUP BY type`);
  const contentTypes = await run(`SELECT slug, features FROM content_types`);
  const taxonomyRows = await run(`SELECT slug FROM taxonomies`);
  const termUsage = await run(
    `SELECT taxonomy, COUNT(*) AS terms FROM taxonomy_terms GROUP BY taxonomy`,
  );
  const templates = await run(`SELECT slug, page_type AS collection FROM page_templates`);
  const migrations = await run(`SELECT name FROM _rimelight_cms_migrations`);

  const dbSlugs = new Set(contentTypes.map((r: any) => String(r.slug)));
  const taxonomySlugs = new Set(taxonomyRows.map((r: any) => String(r.slug)));
  const presetIds = new Set(collectionPresets.map((p) => p.id));
  const taxonomyPresetIds = new Set(taxonomyPresets.map((p) => p.id));

  const referenced = usage
    .map((r: any) => ({ slug: String(r.slug ?? ""), entries: Number(r.entries) }))
    .sort((a, b) => b.entries - a.entries || a.slug.localeCompare(b.slug));

  // A taxonomy is needed by a collection that lists it in `features.taxonomies`, or by terms.
  const taxonomyUses = new Map<string, number>();
  for (const row of contentTypes) {
    const names: unknown[] = asObject(row.features)["taxonomies"] ?? [];
    for (const name of names)
      taxonomyUses.set(String(name), (taxonomyUses.get(String(name)) ?? 0) + 1);
  }
  for (const row of termUsage) {
    const name = String(row.taxonomy);
    taxonomyUses.set(name, (taxonomyUses.get(name) ?? 0) + Number(row.terms));
  }

  return {
    dialect,
    referenced,
    inDatabase: referenced.filter((r) => dbSlugs.has(r.slug)).map((r) => r.slug),
    missing: referenced
      .filter((r) => !dbSlugs.has(r.slug))
      .map((r) => ({ ...r, ...(presetIds.has(r.slug) ? { preset: r.slug } : {}) })),
    missingTaxonomies: [...taxonomyUses.entries()]
      .filter(([slug]) => !taxonomySlugs.has(slug))
      .map(([slug, uses]) => ({
        slug,
        uses,
        ...(taxonomyPresetIds.has(slug) ? { preset: slug } : {}),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
    orphanTemplates: templates
      .map((r: any) => ({ slug: String(r.slug), collection: String(r.collection) }))
      .filter((t) => !dbSlugs.has(t.collection)),
    appliedMigrations: migrations.map((r: any) => String(r.name)),
  };
}

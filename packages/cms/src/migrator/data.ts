import { eq } from "drizzle-orm";
import { getCmsDb } from "../db/index";
import {
  canonicalType,
  flattenTemplateDefaults,
  normalizeLegacyContent,
  normalizeLegacyBlocks,
  normalizeLegacyProperties,
  parseFieldSchema,
} from "./legacy";

/**
 * Data migrations: one-time rewrites of stored JSON into the current shapes. After these run,
 * the runtime only understands the current format — there are no compatibility code paths.
 */
export interface DataMigration {
  name: string;
  run: (db: any) => Promise<void>;
}

export const DATA_MIGRATIONS: DataMigration[] = [
  {
    name: "0003_content_v2",
    async run(raw) {
      const { db, tables: t } = getCmsDb({ db: raw });
      const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);

      const same = (a: unknown, b: unknown) => JSON.stringify(parse(a)) === JSON.stringify(b);
      const updates: (() => Promise<unknown>)[] = [];

      for (const row of await db.select().from(t.pages)) {
        const next = {
          type: canonicalType(row.type),
          content: normalizeLegacyContent(row.content),
        };
        if (next.type !== row.type || !same(row.content, next.content)) {
          updates.push(() => db.update(t.pages).set(next).where(eq(t.pages.id, row.id)));
        }
      }
      for (const row of await db.select().from(t.pageDrafts)) {
        const content = normalizeLegacyContent(row.content);
        if (!same(row.content, content)) {
          updates.push(() =>
            db.update(t.pageDrafts).set({ content }).where(eq(t.pageDrafts.pageId, row.pageId)),
          );
        }
      }
      for (const row of await db.select().from(t.pageVersions)) {
        const next = {
          type: canonicalType(row.type),
          content: normalizeLegacyContent(row.content),
        };
        if (next.type !== row.type || !same(row.content, next.content)) {
          updates.push(() =>
            db.update(t.pageVersions).set(next).where(eq(t.pageVersions.id, row.id)),
          );
        }
      }
      for (const row of await db.select().from(t.pageTemplates)) {
        const next = {
          pageType: canonicalType(row.pageType),
          initialBlocks: normalizeLegacyBlocks(row.initialBlocks),
          defaultProperties: flattenTemplateDefaults(row.defaultProperties),
        };
        updates.push(() =>
          db.update(t.pageTemplates).set(next).where(eq(t.pageTemplates.id, row.id)),
        );
      }
      for (const row of await db.select().from(t.contentTypes)) {
        const name = parse(row.name);
        const next = {
          slug: canonicalType(row.slug),
          name: typeof name === "string" ? { en: name } : name,
          fieldSchema: parseFieldSchema(row.fieldSchema ?? (row as any).schema),
          initialBlocks: normalizeLegacyBlocks(row.initialBlocks),
        };
        updates.push(() =>
          db.update(t.contentTypes).set(next).where(eq(t.contentTypes.id, row.id)),
        );
      }

      // Only rows that actually change are written, 16 at a time (each is an HTTP round trip on Neon).
      for (let i = 0; i < updates.length; i += 16) {
        await Promise.all(updates.slice(i, i + 16).map((run) => run()));
      }
      console.info(`[@rimelight/cms] 0003_content_v2 rewrote ${updates.length} rows`);
    },
  },
  {
    // Content saved by the old editor after 0003 ran (or that 0003 missed) still had block-shaped
    // inline nodes (`{ type: "text", props: { content } }`). Re-run the normalizer everywhere.
    name: "0004_inline_nodes",
    async run(raw) {
      const { db, tables: t } = getCmsDb({ db: raw });
      const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
      const same = (a: unknown, b: unknown) => JSON.stringify(parse(a)) === JSON.stringify(b);
      const updates: (() => Promise<unknown>)[] = [];
      for (const row of await db.select().from(t.pages)) {
        const content = normalizeLegacyContent(row.content);
        if (!same(row.content, content))
          updates.push(() => db.update(t.pages).set({ content }).where(eq(t.pages.id, row.id)));
      }
      for (const row of await db.select().from(t.pageDrafts)) {
        const content = normalizeLegacyContent(row.content);
        if (!same(row.content, content))
          updates.push(() =>
            db.update(t.pageDrafts).set({ content }).where(eq(t.pageDrafts.pageId, row.pageId)),
          );
      }
      for (const row of await db.select().from(t.pageVersions)) {
        const content = normalizeLegacyContent(row.content);
        if (!same(row.content, content))
          updates.push(() =>
            db.update(t.pageVersions).set({ content }).where(eq(t.pageVersions.id, row.id)),
          );
      }
      for (const row of await db.select().from(t.pageTemplates)) {
        const initialBlocks = normalizeLegacyBlocks(row.initialBlocks);
        if (!same(row.initialBlocks, initialBlocks))
          updates.push(() =>
            db.update(t.pageTemplates).set({ initialBlocks }).where(eq(t.pageTemplates.id, row.id)),
          );
      }
      for (let i = 0; i < updates.length; i += 16) {
        await Promise.all(updates.slice(i, i + 16).map((run) => run()));
      }
      console.info(`[@rimelight/cms] 0004_inline_nodes rewrote ${updates.length} rows`);
    },
  },
  {
    // Properties saved by the old editor were grouped and wrapped (`{ identity: { name: { en } } }`,
    // references as `{ slug, type, label }`). Flatten them to the field keys and plain values.
    name: "0005_flat_properties",
    async run(raw) {
      const { db, tables: t } = getCmsDb({ db: raw });
      const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
      const pages = await db.select().from(t.pages);
      const idBySlug = new Map<string, string>(
        pages.map((p: any) => [String(p.slug).replace(/^\/+/, ""), p.id]),
      );
      const fix = (content: unknown) => {
        const c = parse(content) ?? {};
        return { ...c, properties: normalizeLegacyProperties(c.properties, idBySlug) };
      };
      const same = (a: unknown, b: unknown) => JSON.stringify(parse(a)) === JSON.stringify(b);
      const updates: (() => Promise<unknown>)[] = [];
      for (const row of pages) {
        const content = fix(row.content);
        if (!same(row.content, content))
          updates.push(() => db.update(t.pages).set({ content }).where(eq(t.pages.id, row.id)));
      }
      for (const row of await db.select().from(t.pageDrafts)) {
        const content = fix(row.content);
        if (!same(row.content, content))
          updates.push(() =>
            db.update(t.pageDrafts).set({ content }).where(eq(t.pageDrafts.pageId, row.pageId)),
          );
      }
      for (const row of await db.select().from(t.pageVersions)) {
        const content = fix(row.content);
        if (!same(row.content, content))
          updates.push(() =>
            db.update(t.pageVersions).set({ content }).where(eq(t.pageVersions.id, row.id)),
          );
      }
      for (let i = 0; i < updates.length; i += 16) {
        await Promise.all(updates.slice(i, i + 16).map((run) => run()));
      }
      console.info(`[@rimelight/cms] 0005_flat_properties rewrote ${updates.length} rows`);
    },
  },
];

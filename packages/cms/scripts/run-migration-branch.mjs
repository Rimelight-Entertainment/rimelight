/**
 * Phase 5 Migration Script:
 * Migrates existing `pages` and `page_templates` data into the generic v2 Collections architecture.
 *
 * Safe & Additive:
 * - Creates system collections and fields in `_cms_collections` & `_cms_fields`
 * - Creates physical collection tables `ec_<type>`
 * - Migrates all 322 existing pages into their respective `ec_<type>` tables
 * - Preserves existing `pages` table completely intact.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(
  "c:/Users/idant/WebstormProjects/rimelight/packages/cms/package.json",
);
const { neon } = require("@neondatabase/serverless");

const branchUri = readFileSync(
  "C:/Users/idant/.gemini/antigravity/brain/3c75fdb0-e279-4da4-bb9a-c0d1bda65971/scratch/branch-uri.txt",
  "utf8",
).trim();

const sql = neon(branchUri);

console.log("=== Step 1: Create v2 System Tables ===");

await sql`
CREATE TABLE IF NOT EXISTS "_cms_collections" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "label" jsonb NOT NULL,
  "description" jsonb,
  "icon" text DEFAULT 'box' NOT NULL,
  "kind" text DEFAULT 'document' NOT NULL,
  "features" jsonb DEFAULT '{"versioned": true, "localized": false, "hierarchical": false, "routable": true, "scheduled": false}'::jsonb NOT NULL,
  "workflow" jsonb DEFAULT '{"minApprovals": 1, "allowSelfApproval": true}'::jsonb NOT NULL,
  "initial_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "default_locale" text DEFAULT 'en' NOT NULL,
  "locales" jsonb DEFAULT '["en"]'::jsonb NOT NULL,
  "schema_version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);
`;

await sql`
CREATE TABLE IF NOT EXISTS "_cms_fields" (
  "id" text PRIMARY KEY NOT NULL,
  "collection_id" text NOT NULL,
  "key" text NOT NULL,
  "type" text NOT NULL,
  "label" jsonb NOT NULL,
  "description" jsonb,
  "required" boolean DEFAULT false NOT NULL,
  "unique" boolean DEFAULT false NOT NULL,
  "queryable" boolean DEFAULT false NOT NULL,
  "translatable" boolean DEFAULT false NOT NULL,
  "options" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone,
  UNIQUE("collection_id", "key")
);
`;

console.log("=== Step 2: Discover and Register Distinct Collections ===");

const pageTypes = await sql`
  SELECT DISTINCT type FROM pages WHERE deleted_at IS NULL ORDER BY type
`;
console.log(
  `Discovered ${pageTypes.length} collection types:`,
  pageTypes.map((r) => r.type),
);

for (const { type } of pageTypes) {
  const collectionId = crypto.randomUUID();
  const slug = type.toLowerCase();

  // Register in _cms_collections
  await sql`
    INSERT INTO "_cms_collections" ("id", "slug", "label", "kind", "features")
    VALUES (
      ${collectionId},
      ${slug},
      ${JSON.stringify({ en: type })},
      'document',
      ${JSON.stringify({
        versioned: true,
        localized: false,
        hierarchical: type === "doc" || type === "wiki",
        routable: true,
        scheduled: false,
      })}
    )
    ON CONFLICT ("slug") DO NOTHING
  `;

  // Create physical ec_<slug> table
  const tableName = `ec_${slug}`;
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      "id" text PRIMARY KEY NOT NULL,
      "slug" text NOT NULL,
      "status" text DEFAULT 'draft' NOT NULL,
      "parent_id" text,
      "sort" integer DEFAULT 0 NOT NULL,
      "published_revision_id" text,
      "published_at" timestamp with time zone,
      "scheduled_at" timestamp with time zone,
      "created_by" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone,
      "deleted_at" timestamp with time zone,
      "data" jsonb DEFAULT '{}'::jsonb NOT NULL
    );
  `);

  await sql.query(`CREATE INDEX IF NOT EXISTS "${tableName}_slug_idx" ON "${tableName}" ("slug");`);
  await sql.query(
    `CREATE INDEX IF NOT EXISTS "${tableName}_status_idx" ON "${tableName}" ("status");`,
  );
}

console.log("=== Step 3: Populate ec_<collection> from pages table ===");

let totalMigrated = 0;
for (const { type } of pageTypes) {
  const slug = type.toLowerCase();
  const tableName = `ec_${slug}`;

  const pagesForType = await sql`
    SELECT * FROM pages WHERE type = ${type}
  `;

  for (const page of pagesForType) {
    const dataPayload = {
      title: page.title,
      description: page.description,
      tags: page.tags,
      authorIds: page.author_ids,
      bylines: page.bylines,
      content: page.content,
    };

    const status = page.published_version_id ? "published" : "draft";

    await sql.query(
      `
      INSERT INTO "${tableName}" (
        "id", "slug", "status", "created_at", "updated_at", "deleted_at", "published_revision_id", "published_at", "data"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) ON CONFLICT ("id") DO UPDATE SET
        "data" = EXCLUDED."data",
        "status" = EXCLUDED."status"
    `,
      [
        page.id,
        page.slug,
        status,
        page.created_at,
        page.updated_at,
        page.deleted_at,
        page.published_version_id,
        page.posted_at,
        JSON.stringify(dataPayload),
      ],
    );

    totalMigrated++;
  }

  const [{ count }] = await sql.query(`SELECT count(*)::int as count FROM "${tableName}"`);
  console.log(`  Table "${tableName}": ${count} records populated.`);
}

console.log(`\nMigration Complete! Total rows migrated across all collections: ${totalMigrated}`);

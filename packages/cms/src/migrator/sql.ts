/**
 * Schema migrations, applied in order and recorded by name in `_rimelight_cms_migrations`. Names
 * are permanent: a database has them recorded, so never rename or reorder an applied migration.
 * The gaps (0003–0005, 0007) were data migrations that rewrote stored JSON; they were retired
 * once every database had run them, so their numbers are not reused.
 */
export const SQLITE_CMS_MIGRATIONS = [
  {
    name: "0001_initial_cms_tables",
    sql: `
CREATE TABLE IF NOT EXISTS \`page_templates\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`slug\` text NOT NULL,
	\`title\` text NOT NULL,
	\`description\` text,
	\`page_type\` text NOT NULL,
	\`version\` integer DEFAULT 1 NOT NULL,
	\`allowed_roles\` text DEFAULT '[]' NOT NULL,
	\`role_permissions\` text DEFAULT '{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}' NOT NULL,
	\`required_permission\` text,
	\`approval_rules\` text DEFAULT '{"allowSelfApproval":true,"minApprovals":1}' NOT NULL,
	\`default_properties\` text DEFAULT '{}' NOT NULL,
	\`initial_blocks\` text DEFAULT '[]' NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`page_templates_slug_unique\` ON \`page_templates\` (\`slug\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_versions\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`page_id\` text NOT NULL,
	\`version_number\` integer NOT NULL,
	\`status\` text DEFAULT 'pending' NOT NULL,
	\`slug\` text NOT NULL,
	\`type\` text NOT NULL,
	\`title\` text NOT NULL,
	\`description\` text,
	\`tags\` text DEFAULT '[]' NOT NULL,
	\`author_ids\` text DEFAULT '[]',
	\`bylines\` text DEFAULT '[]',
	\`content\` text NOT NULL,
	\`created_by\` text NOT NULL,
	\`approved_by\` text DEFAULT '[]' NOT NULL,
	\`approved_at\` integer,
	\`change_summary\` text,
	\`created_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`page_versions_page_id_version_idx\` ON \`page_versions\` (\`page_id\`,\`version_number\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`pages\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`slug\` text NOT NULL,
	\`type\` text NOT NULL,
	\`template_id\` text,
	\`template_version\` integer DEFAULT 1 NOT NULL,
	\`title\` text NOT NULL,
	\`description\` text,
	\`tags\` text DEFAULT '[]' NOT NULL,
	\`author_ids\` text DEFAULT '[]',
	\`bylines\` text DEFAULT '[]',
	\`content\` text NOT NULL,
	\`published_version_id\` text,
	\`posted_at\` integer,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer,
	\`deleted_at\` integer,
	FOREIGN KEY (\`template_id\`) REFERENCES \`page_templates\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`published_version_id\`) REFERENCES \`page_versions\`(\`id\`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`pages_slug_active_unique_idx\` ON \`pages\` (\`slug\`) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_drafts\` (
	\`page_id\` text PRIMARY KEY NOT NULL,
	\`content\` text NOT NULL,
	\`updated_by\` text NOT NULL,
	\`updated_at\` integer NOT NULL,
	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_draft_locks\` (
	\`page_id\` text PRIMARY KEY NOT NULL,
	\`locked_by_user_id\` text NOT NULL,
	\`locked_by_user_name\` text NOT NULL,
	\`acquired_at\` integer NOT NULL,
	\`expires_at\` integer NOT NULL,
	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_version_approvals\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`version_id\` text NOT NULL,
	\`user_id\` text NOT NULL,
	\`user_role\` text NOT NULL,
	\`approved_at\` integer NOT NULL,
	FOREIGN KEY (\`version_id\`) REFERENCES \`page_versions\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_version_comments\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`version_id\` text NOT NULL,
	\`user_id\` text NOT NULL,
	\`user_role\` text NOT NULL,
	\`content\` text NOT NULL,
	\`block_id\` text,
	\`created_at\` integer NOT NULL,
	FOREIGN KEY (\`version_id\`) REFERENCES \`page_versions\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`content_types\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`slug\` text NOT NULL,
	\`name\` text NOT NULL,
	\`description\` text,
	\`icon\` text,
	\`schema\` text DEFAULT '[]' NOT NULL,
	\`is_system\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`content_types_slug_unique\` ON \`content_types\` (\`slug\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`content_search_index\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`page_id\` text NOT NULL,
	\`locale\` text NOT NULL,
	\`title_text\` text NOT NULL,
	\`content_text\` text NOT NULL,
	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS \`content_search_index_page_id_idx\` ON \`content_search_index\` (\`page_id\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`site_settings\` (
	\`id\` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	\`name\` text NOT NULL,
	\`description\` text NOT NULL,
	\`url\` text NOT NULL,
	\`og_image\` text NOT NULL,
	\`author\` text NOT NULL,
	\`email\` text DEFAULT '' NOT NULL,
	\`branding\` text NOT NULL,
	\`seo\` text NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`taxonomy_terms\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`taxonomy\` text NOT NULL,
	\`slug\` text NOT NULL,
	\`label\` text NOT NULL,
	\`description\` text,
	\`parent_id\` text,
	\`display_order\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`taxonomy_terms\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`taxonomy_terms_tax_slug_idx\` ON \`taxonomy_terms\` (\`taxonomy\`,\`slug\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`page_taxonomy_terms\` (
	\`page_id\` text NOT NULL,
	\`term_id\` text NOT NULL,
	\`assigned_at\` integer NOT NULL,
	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`term_id\`) REFERENCES \`taxonomy_terms\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`page_taxonomy_terms_page_term_idx\` ON \`page_taxonomy_terms\` (\`page_id\`,\`term_id\`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`bylines\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`slug\` text NOT NULL,
	\`website_url\` text,
	\`bio\` text,
	\`avatar\` text,
	\`user_id\` text,
	\`socials\` text DEFAULT '{}',
	\`metadata\` text DEFAULT '{}',
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL,
	\`deleted_at\` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`bylines_slug_idx\` ON \`bylines\` (\`slug\`);
`,
  },

  {
    // Reconciles drift between the 0001 SQL and the Drizzle schema, and adds entry lifecycle.
    // Each statement runs individually; "duplicate column" errors are tolerated by the runner,
    // so this is safe on databases that were created with `drizzle-kit push`.
    name: "0002_collections_and_lifecycle",
    sql: `
CREATE TABLE IF NOT EXISTS \`search_index\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`source_type\` text NOT NULL,
	\`source_id\` text NOT NULL,
	\`title\` text NOT NULL,
	\`url\` text NOT NULL,
	\`body_content\` text NOT NULL,
	\`searchable_text\` text NOT NULL,
	\`updated_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS \`search_index_source_type_source_id_key\` ON \`search_index\` (\`source_type\`, \`source_id\`);
--> statement-breakpoint
ALTER TABLE \`pages\` ADD COLUMN \`status\` text DEFAULT 'published' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`pages\` ADD COLUMN \`scheduled_at\` integer;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`mode\` text DEFAULT 'document' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`field_schema\` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`ecom_settings\` text;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`initial_blocks\` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`features\` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`content_types\` ADD COLUMN \`workflow\` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS \`pages_type_status_idx\` ON \`pages\` (\`type\`, \`status\`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS \`pages_scheduled_idx\` ON \`pages\` (\`scheduled_at\`);
`,
  },
  {
    name: "0006_collection_color",
    sql: `ALTER TABLE \`content_types\` ADD COLUMN \`color\` text;
`,
  },
  {
    name: "0008_taxonomies_and_retired_columns",
    sql: `CREATE TABLE IF NOT EXISTS \`taxonomies\` (
\t\`slug\` text PRIMARY KEY NOT NULL,
\t\`label\` text NOT NULL,
\t\`description\` text,
\t\`hierarchical\` integer DEFAULT 0 NOT NULL,
\t\`collections\` text DEFAULT '[]' NOT NULL,
\t\`created_at\` integer NOT NULL,
\t\`updated_at\` integer
);
--> statement-breakpoint
ALTER TABLE \`content_types\` DROP COLUMN \`is_system\`;
--> statement-breakpoint
ALTER TABLE \`content_types\` DROP COLUMN \`ecom_settings\`;
`,
  },
  {
    name: "0009_drop_legacy_schema_column",
    sql: `ALTER TABLE \`content_types\` DROP COLUMN \`schema\`;
`,
  },
  {
    name: "0010_media_library",
    sql: `CREATE TABLE IF NOT EXISTS "media_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"caption" text,
	"focal_x" real,
	"focal_y" real,
	"folder_id" text,
	"created_at" integer NOT NULL,
	"updated_at" integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_storage_key_idx" ON "media_assets" ("storage_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_assets_folder_idx" ON "media_assets" ("folder_id");
`,
  },
  {
    name: "0011_byline_fields",
    sql: `ALTER TABLE "bylines" ADD COLUMN "is_guest" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "bylines" ADD COLUMN "fields" text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "byline_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"required" integer DEFAULT 0 NOT NULL,
	"translatable" integer DEFAULT 0 NOT NULL,
	"options" text DEFAULT '[]' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "byline_fields_slug_idx" ON "byline_fields" ("slug");
`,
  },
];

export const PG_CMS_MIGRATIONS = [
  {
    name: "0001_initial_cms_tables",
    sql: `
CREATE TABLE IF NOT EXISTS "page_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"page_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"allowed_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role_permissions" jsonb DEFAULT '{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}'::jsonb NOT NULL,
	"required_permission" text,
	"approval_rules" jsonb DEFAULT '{"allowSelfApproval":true,"minApprovals":1}'::jsonb NOT NULL,
	"default_properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"initial_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "page_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"template_id" uuid,
	"template_version" integer DEFAULT 1 NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_ids" jsonb DEFAULT '[]'::jsonb,
	"bylines" jsonb DEFAULT '[]'::jsonb,
	"content" jsonb NOT NULL,
	"published_version_id" uuid,
	"posted_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_ids" jsonb DEFAULT '[]'::jsonb,
	"bylines" jsonb DEFAULT '[]'::jsonb,
	"content" jsonb NOT NULL,
	"created_by" uuid,
	"approved_by" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approved_at" timestamp with time zone,
	"change_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_drafts" (
	"page_id" uuid PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_draft_locks" (
	"page_id" uuid PRIMARY KEY NOT NULL,
	"locked_by_user_id" text NOT NULL,
	"locked_by_user_name" text NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_version_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_version_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"content" text NOT NULL,
	"block_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"schema" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "content_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"og_image" text NOT NULL,
	"author" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"branding" jsonb NOT NULL,
	"seo" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomy_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taxonomy" text NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_taxonomy_terms" (
	"page_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_taxonomy_terms_page_id_term_id_pk" PRIMARY KEY("page_id","term_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bylines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website_url" text,
	"bio" text,
	"avatar" text,
	"user_id" text,
	"socials" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "bylines_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_search_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title_text" text NOT NULL,
	"content_text" text NOT NULL
);
`,
  },

  {
    // Additive + idempotent. Brings any existing database (created by 0001, drizzle push,
    // or the app's drizzle-kit migrations) up to the current Drizzle schema without data loss.
    name: "0002_collections_and_lifecycle",
    sql: `
CREATE TABLE IF NOT EXISTS "search_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"body_content" text NOT NULL,
	"searchable_text" tsvector,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_index_source_type_source_id_key" UNIQUE("source_type","source_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_index_text" ON "search_index" USING gin ("searchable_text");
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'published' NOT NULL;
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "template_id" uuid;
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "template_version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "bylines" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "published_version_id" uuid;
--> statement-breakpoint
ALTER TABLE "page_versions" ADD COLUMN IF NOT EXISTS "version_number" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "page_versions" ADD COLUMN IF NOT EXISTS "bylines" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "page_versions" ADD COLUMN IF NOT EXISTS "change_summary" text;
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='page_versions' AND column_name='approved_by') = 'uuid' THEN
    ALTER TABLE "page_versions" ALTER COLUMN "approved_by" DROP DEFAULT;
    ALTER TABLE "page_versions" ALTER COLUMN "approved_by" TYPE jsonb USING (CASE WHEN "approved_by" IS NULL THEN '[]'::jsonb ELSE jsonb_build_array("approved_by"::text) END);
    ALTER TABLE "page_versions" ALTER COLUMN "approved_by" SET DEFAULT '[]'::jsonb;
    UPDATE "page_versions" SET "approved_by" = '[]'::jsonb WHERE "approved_by" IS NULL;
    ALTER TABLE "page_versions" ALTER COLUMN "approved_by" SET NOT NULL;
  END IF;
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='page_versions' AND column_name='created_by') = 'uuid' THEN
    ALTER TABLE "page_versions" ALTER COLUMN "created_by" TYPE text USING "created_by"::text;
  END IF;
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='page_drafts' AND column_name='updated_by') = 'uuid' THEN
    ALTER TABLE "page_drafts" ALTER COLUMN "updated_by" TYPE text USING "updated_by"::text;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'document' NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "field_schema" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "ecom_settings" jsonb;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "initial_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "features" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "workflow" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='content_types' AND column_name='name') = 'text' THEN
    ALTER TABLE "content_types" ALTER COLUMN "name" TYPE jsonb USING jsonb_build_object('en', "name");
  END IF;
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='content_types' AND column_name='description') = 'text' THEN
    ALTER TABLE "content_types" ALTER COLUMN "description" TYPE jsonb USING (CASE WHEN "description" IS NULL THEN NULL ELSE jsonb_build_object('en', "description") END);
  END IF;
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='taxonomy_terms' AND column_name='label') = 'text' THEN
    ALTER TABLE "taxonomy_terms" ALTER COLUMN "label" TYPE jsonb USING to_jsonb("label");
  END IF;
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='taxonomy_terms' AND column_name='description') = 'text' THEN
    ALTER TABLE "taxonomy_terms" ALTER COLUMN "description" TYPE jsonb USING to_jsonb("description");
  END IF;
END $$;
--> statement-breakpoint
UPDATE "content_types" SET "icon" = 'i-lucide-box' WHERE "icon" IS NULL;
--> statement-breakpoint
ALTER TABLE "content_search_index" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_gin_idx" ON "content_search_index" USING gin ("search_vector");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_type_status_idx" ON "pages" ("type", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_scheduled_idx" ON "pages" ("scheduled_at") WHERE "status" = 'scheduled';
`,
  },
  {
    name: "0006_collection_color",
    sql: `ALTER TABLE "content_types" ADD COLUMN IF NOT EXISTS "color" text;
`,
  },
  {
    name: "0008_taxonomies_and_retired_columns",
    sql: `CREATE TABLE IF NOT EXISTS "taxonomies" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" jsonb NOT NULL,
	"description" jsonb,
	"hierarchical" boolean DEFAULT false NOT NULL,
	"collections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "content_types" DROP COLUMN IF EXISTS "is_system";
--> statement-breakpoint
ALTER TABLE "content_types" DROP COLUMN IF EXISTS "ecom_settings";
`,
  },
  {
    name: "0009_drop_legacy_schema_column",
    sql: `ALTER TABLE "content_types" DROP COLUMN IF EXISTS "schema";
`,
  },
  {
    name: "0010_media_library",
    sql: `CREATE TABLE IF NOT EXISTS "media_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" jsonb,
	"caption" jsonb,
	"focal_x" double precision,
	"focal_y" double precision,
	"folder_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_storage_key_idx" ON "media_assets" ("storage_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_assets_folder_idx" ON "media_assets" ("folder_id");
`,
  },
  {
    name: "0011_byline_fields",
    sql: `ALTER TABLE "bylines" ADD COLUMN IF NOT EXISTS "is_guest" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "bylines" ADD COLUMN IF NOT EXISTS "fields" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "byline_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"translatable" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "byline_fields_slug_idx" ON "byline_fields" ("slug");
`,
  },
];

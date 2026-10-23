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
];

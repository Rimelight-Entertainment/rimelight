CREATE TABLE "site_settings" (
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
CREATE TABLE "page_taxonomy_terms" (
	"page_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taxonomy" text NOT NULL,
	"slug" text NOT NULL,
	"label" jsonb NOT NULL,
	"description" jsonb,
	"parent_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bylines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website_url" text,
	"bio" text,
	"avatar" text,
	"user_id" text,
	"socials" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "page_versions" ADD COLUMN "bylines" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "bylines" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "page_taxonomy_terms" ADD CONSTRAINT "page_taxonomy_terms_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_taxonomy_terms" ADD CONSTRAINT "page_taxonomy_terms_term_id_taxonomy_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."taxonomy_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_terms" ADD CONSTRAINT "taxonomy_terms_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."taxonomy_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_taxonomy_terms_page_term_idx" ON "page_taxonomy_terms" USING btree ("page_id","term_id");--> statement-breakpoint
CREATE UNIQUE INDEX "taxonomy_terms_tax_slug_idx" ON "taxonomy_terms" USING btree ("taxonomy","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "bylines_slug_idx" ON "bylines" USING btree ("slug");
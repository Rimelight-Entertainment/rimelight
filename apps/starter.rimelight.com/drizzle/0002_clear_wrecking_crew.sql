CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"permissions" text DEFAULT '[]' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "page_templates" ADD COLUMN "role_permissions" jsonb DEFAULT '{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}'::jsonb NOT NULL;
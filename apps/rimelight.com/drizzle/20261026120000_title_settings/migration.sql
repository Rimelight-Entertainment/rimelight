CREATE TABLE "title_settings" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_settings_user_id_title_pk" PRIMARY KEY("user_id","title")
);
--> statement-breakpoint
ALTER TABLE "title_settings" ADD CONSTRAINT "title_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE "title_presets" (
	"user_id" uuid,
	"title" text,
	"slot" integer,
	"name" text NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_presets_user_id_title_slot_pk" PRIMARY KEY("user_id","title","slot"),
	CONSTRAINT "title_presets_slot_check" CHECK ("slot" >= 1 AND "slot" <= 5)
);
--> statement-breakpoint
ALTER TABLE "title_presets" ADD CONSTRAINT "title_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
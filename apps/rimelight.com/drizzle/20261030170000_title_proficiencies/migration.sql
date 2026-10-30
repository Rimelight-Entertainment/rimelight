CREATE TABLE "title_proficiencies" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"proficiency_id" uuid NOT NULL,
	"experience" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_proficiencies_user_id_title_proficiency_pk" PRIMARY KEY("user_id","title","proficiency_id")
);
--> statement-breakpoint
ALTER TABLE "title_proficiencies" ADD CONSTRAINT "title_proficiencies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE "title_items" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"item_id" uuid NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_items_user_id_title_item_pk" PRIMARY KEY("user_id","title","item_id")
);
--> statement-breakpoint
ALTER TABLE "title_items" ADD CONSTRAINT "title_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

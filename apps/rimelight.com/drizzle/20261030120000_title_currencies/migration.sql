CREATE TABLE "title_currencies" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"currency" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_currencies_user_id_title_currency_pk" PRIMARY KEY("user_id","title","currency")
);
--> statement-breakpoint
ALTER TABLE "title_currencies" ADD CONSTRAINT "title_currencies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

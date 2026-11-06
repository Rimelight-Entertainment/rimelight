CREATE TABLE "title_mail" (
	"id" uuid PRIMARY KEY,
	"recipient_id" uuid NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"items" jsonb NOT NULL,
	"currency" jsonb NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "title_mail_recipient_id_title_sent_at_idx" ON "title_mail" ("recipient_id","title","sent_at");--> statement-breakpoint
ALTER TABLE "title_mail" ADD CONSTRAINT "title_mail_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE;
CREATE TABLE "title_ledger_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"request_id" uuid NOT NULL,
	"game_server_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_ledger_batches_user_id_title_request_id_key" UNIQUE("user_id","title","request_id")
);
--> statement-breakpoint
CREATE TABLE "title_ledger_entries" (
	"batch_id" uuid,
	"kind" text NOT NULL,
	"item_id" uuid,
	"delta" integer NOT NULL,
	"balance_after" integer NOT NULL,
	CONSTRAINT "title_ledger_entries_batch_id_item_id_pk" PRIMARY KEY("batch_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "game_server_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"label" text NOT NULL,
	"secret_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "title_ledger_batches" ADD CONSTRAINT "title_ledger_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_ledger_batches" ADD CONSTRAINT "title_ledger_batches_game_server_id_game_server_credentials_id_fk" FOREIGN KEY ("game_server_id") REFERENCES "game_server_credentials"("id");--> statement-breakpoint
ALTER TABLE "title_ledger_entries" ADD CONSTRAINT "title_ledger_entries_batch_id_title_ledger_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "title_ledger_batches"("id") ON DELETE CASCADE;
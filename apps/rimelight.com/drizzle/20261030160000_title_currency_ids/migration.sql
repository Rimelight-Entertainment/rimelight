ALTER TABLE "title_currencies" DROP CONSTRAINT "title_currencies_user_id_title_currency_pk";
--> statement-breakpoint
ALTER TABLE "title_currencies" DROP COLUMN "currency";
--> statement-breakpoint
ALTER TABLE "title_currencies" ADD COLUMN "currency_id" uuid NOT NULL;
--> statement-breakpoint
ALTER TABLE "title_currencies" ADD CONSTRAINT "title_currencies_user_id_title_currency_pk" PRIMARY KEY("user_id","title","currency_id");

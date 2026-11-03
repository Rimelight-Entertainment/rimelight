CREATE TABLE "title_estate_facilities" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"facility_id" uuid NOT NULL,
	"tier" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_estate_facilities_user_id_title_facility_pk" PRIMARY KEY("user_id","title","facility_id")
);
--> statement-breakpoint
CREATE TABLE "title_estate_expeditions" (
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"expedition_id" uuid NOT NULL,
	"tier" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reward" bigint,
	CONSTRAINT "title_estate_expeditions_user_id_title_expedition_pk" PRIMARY KEY("user_id","title","expedition_id")
);
--> statement-breakpoint
ALTER TABLE "title_estate_facilities" ADD CONSTRAINT "title_estate_facilities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "title_estate_expeditions" ADD CONSTRAINT "title_estate_expeditions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

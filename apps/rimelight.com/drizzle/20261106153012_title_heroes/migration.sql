CREATE TABLE "title_heroes" (
	"user_id" uuid,
	"title" text,
	"hero_id" uuid,
	"experience" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_heroes_user_id_title_hero_id_pk" PRIMARY KEY("user_id","title","hero_id")
);

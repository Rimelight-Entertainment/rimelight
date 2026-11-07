CREATE TABLE "title_hero_catalogue" (
	"title" text,
	"hero_id" uuid,
	CONSTRAINT "title_hero_catalogue_title_hero_id_pk" PRIMARY KEY("title","hero_id")
);
--> statement-breakpoint
INSERT INTO "title_hero_catalogue" ("title", "hero_id") VALUES
	('grand-tale', '3e0c79c3-6b8e-4f6b-056c-c4b002fffd9b'),
	('grand-tale', '0900d41e-389f-45ad-3861-a79d1bb606d8');

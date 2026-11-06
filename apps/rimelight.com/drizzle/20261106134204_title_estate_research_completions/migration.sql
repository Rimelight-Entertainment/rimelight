CREATE TABLE "title_estate_research_completions" (
	"user_id" uuid,
	"title" text,
	"research_id" uuid,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "title_estate_research_completions_user_id_title_research_pk" PRIMARY KEY("user_id","title","research_id")
);

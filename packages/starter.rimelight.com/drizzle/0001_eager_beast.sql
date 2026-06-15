CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`cover_image` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_search_index` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`body_content` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_search_index`("id", "source_type", "source_id", "title", "url", "body_content", "updated_at") SELECT "id", "source_type", "source_id", "title", "url", "body_content", "updated_at" FROM `search_index`;--> statement-breakpoint
DROP TABLE `search_index`;--> statement-breakpoint
ALTER TABLE `__new_search_index` RENAME TO `search_index`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `search_index_source_type_source_id_key` ON `search_index` (`source_type`,`source_id`);--> statement-breakpoint
CREATE TABLE `__new_search_index_fts` (
	`rowid` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body_content` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_search_index_fts`("rowid", "title", "body_content") SELECT "rowid", "title", "body_content" FROM `search_index_fts`;--> statement-breakpoint
DROP TABLE `search_index_fts`;--> statement-breakpoint
ALTER TABLE `__new_search_index_fts` RENAME TO `search_index_fts`;
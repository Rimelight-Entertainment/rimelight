import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { Localized } from "../core/types/pages";

/** A folder in the media tree. Virtual: moving or renaming a folder never touches storage. */
export const mediaFolders: PgTableWithColumns<any> = pgTable("media_folders", {
  id: text("id").notNull().primaryKey(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * A file in the media library. `storageKey` is immutable (`{id}{ext}` for uploads), so the public
 * URL never changes when the file is moved, renamed or given new metadata.
 */
export const mediaAssets: PgTableWithColumns<any> = pgTable("media_assets", {
  id: text("id").notNull().primaryKey(),
  storageKey: text("storage_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  /** Localized alt text, keyed by locale. */
  alt: jsonb("alt").$type<Localized>(),
  caption: jsonb("caption").$type<Localized>(),
  focalX: doublePrecision("focal_x"),
  focalY: doublePrecision("focal_y"),
  folderId: text("folder_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

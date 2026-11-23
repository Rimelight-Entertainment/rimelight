import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
  type AnySQLiteColumn,
  type SQLiteTableWithColumns,
} from "drizzle-orm/sqlite-core";
import type { BaseBlock } from "../core/types/blocks";
import type { EntryStatus, Localized } from "../core/types/pages";
import type { BylineCredit, BylineFieldStored, BylineFieldType } from "../core/types/bylines";
import type { PageVersionStatus } from "../core/types/versioning";
import type { TemplateApprovalRules, TemplateRolePermissions } from "../core/types/templates";

export interface SiteSettingsBranding {
  logo: {
    alt: string;
  };
  favicon: {
    svg: string;
  };
  colors: {
    themeColor: string;
    backgroundColor: string;
  };
}

export interface SiteSettingsSeo {
  titleTemplate: string;
  ogImageFallback: string;
  maxDescriptionLength: number;
  authorHandle?: string;
}

// 1. Page Templates
export const pageTemplates: SQLiteTableWithColumns<any> = sqliteTable("page_templates", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title", { mode: "json" }).$type<Localized>().notNull(),
  description: text("description", { mode: "json" }).$type<Localized>(),
  pageType: text("page_type").$type<string>().notNull(),
  version: integer("version").default(1).notNull(),
  allowedRoles: text("allowed_roles", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  rolePermissions: text("role_permissions", { mode: "json" })
    .$type<TemplateRolePermissions>()
    .default(sql`'{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}'`)
    .notNull(),
  requiredPermission: text("required_permission"),
  approvalRules: text("approval_rules", { mode: "json" })
    .$type<TemplateApprovalRules>()
    .default(sql`'{"allowSelfApproval":true,"minApprovals":1}'`)
    .notNull(),
  defaultProperties: text("default_properties", { mode: "json" })
    .default(sql`'{}'`)
    .notNull(),
  initialBlocks: text("initial_blocks", { mode: "json" })
    .$type<BaseBlock[]>()
    .default(sql`'[]'`)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

// 2. Page Versions
export const pageVersions: SQLiteTableWithColumns<any> = sqliteTable(
  "page_versions",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    pageId: text("page_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    status: text("status").$type<PageVersionStatus>().default("pending").notNull(),
    slug: text("slug").notNull(),
    type: text("type").$type<string>().notNull(),
    title: text("title", { mode: "json" }).$type<Localized>().notNull(),
    description: text("description", { mode: "json" }).$type<Localized>(),
    tags: text("tags", { mode: "json" })
      .$type<Localized[]>()
      .default(sql`'[]'`)
      .notNull(),
    authorIds: text("author_ids", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`),
    bylines: text("bylines", { mode: "json" })
      .$type<BylineCredit[]>()
      .default(sql`'[]'`),
    content: text("content", { mode: "json" })
      .$type<{
        blocks: BaseBlock[];
        properties: Record<string, any>;
      }>()
      .notNull(),
    createdBy: text("created_by").notNull(),
    approvedBy: text("approved_by", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    approvedAt: integer("approved_at", { mode: "timestamp" }),
    changeSummary: text("change_summary"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("page_versions_page_id_version_idx").on(table.pageId, table.versionNumber),
  ],
);

// 3. Pages
export const pages: SQLiteTableWithColumns<any> = sqliteTable(
  "pages",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    slug: text("slug").notNull(),
    type: text("type").$type<string>().notNull(),
    templateId: text("template_id").references(() => pageTemplates.id, { onDelete: "set null" }),
    templateVersion: integer("template_version").default(1).notNull(),
    title: text("title", { mode: "json" }).$type<Localized>().notNull(),
    description: text("description", { mode: "json" }).$type<Localized>(),
    tags: text("tags", { mode: "json" })
      .$type<Localized[]>()
      .default(sql`'[]'`)
      .notNull(),
    authorIds: text("author_ids", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`),
    bylines: text("bylines", { mode: "json" })
      .$type<BylineCredit[]>()
      .default(sql`'[]'`),
    content: text("content", { mode: "json" })
      .$type<{
        blocks: BaseBlock[];
        properties: Record<string, any>;
      }>()
      .notNull(),
    status: text("status").$type<EntryStatus>().default("published").notNull(),
    /** Space scope (migration 0017), as in the Postgres schema. */
    scopeKind: text("scope_kind")
      .$type<"Project" | "Team" | "Department" | "Company">()
      .default("Company")
      .notNull(),
    scopeId: text("scope_id"),
    visibility: text("visibility").$type<"Internal" | "Public">().default("Internal").notNull(),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    publishedVersionId: text("published_version_id").references(() => pageVersions.id, {
      onDelete: "set null",
    }),
    postedAt: integer("posted_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    uniqueIndex("pages_slug_active_unique_idx")
      .on(table.slug)
      .where(sql`deleted_at IS NULL`),
  ],
);

// 4. Page Drafts
export const pageDrafts: SQLiteTableWithColumns<any> = sqliteTable("page_drafts", {
  pageId: text("page_id")
    .notNull()
    .primaryKey()
    .references(() => pages.id, { onDelete: "cascade" }),
  content: text("content", { mode: "json" })
    .$type<{
      blocks: BaseBlock[];
      properties: Record<string, any>;
    }>()
    .notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// 5. Page Draft Locks
export const pageDraftLocks: SQLiteTableWithColumns<any> = sqliteTable("page_draft_locks", {
  pageId: text("page_id")
    .notNull()
    .primaryKey()
    .references(() => pages.id, { onDelete: "cascade" }),
  lockedByUserId: text("locked_by_user_id").notNull(),
  lockedByUserName: text("locked_by_user_name").notNull(),
  acquiredAt: integer("acquired_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// 6. Page Version Approvals
export const pageVersionApprovals: SQLiteTableWithColumns<any> = sqliteTable(
  "page_version_approvals",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    versionId: text("version_id")
      .notNull()
      .references(() => pageVersions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    userRole: text("user_role").notNull(),
    approvedAt: integer("approved_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
);

// 7. Page Version Comments
export const pageVersionComments: SQLiteTableWithColumns<any> = sqliteTable(
  "page_version_comments",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    versionId: text("version_id")
      .notNull()
      .references(() => pageVersions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    userRole: text("user_role").notNull(),
    content: text("content").notNull(),
    blockId: text("block_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
);

// 8. Search
export const contentSearchIndex: SQLiteTableWithColumns<any> = sqliteTable(
  "content_search_index",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    titleText: text("title_text").notNull(),
    contentText: text("content_text").notNull(),
  },
  (table) => [index("content_search_index_page_id_idx").on(table.pageId)],
);

export const searchIndex: SQLiteTableWithColumns<any> = sqliteTable(
  "search_index",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    bodyContent: text("body_content").notNull(),
    searchableText: text("searchable_text").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [uniqueIndex("search_index_source_type_source_id_key").on(t.sourceType, t.sourceId)],
);

export type SearchIndex = typeof searchIndex.$inferSelect;
export type NewSearchIndex = typeof searchIndex.$inferInsert;

// 9. Site Settings
export const siteSettings: SQLiteTableWithColumns<any> = sqliteTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  ogImage: text("og_image").notNull(),
  author: text("author").notNull(),
  email: text("email").notNull().default(""),
  branding: text("branding", { mode: "json" }).$type<SiteSettingsBranding>().notNull(),
  seo: text("seo", { mode: "json" }).$type<SiteSettingsSeo>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// 10. Taxonomies
/** A vocabulary. Its terms live in `taxonomy_terms`, keyed by this slug. */
export const taxonomies: SQLiteTableWithColumns<any> = sqliteTable("taxonomies", {
  slug: text("slug").primaryKey().notNull(),
  label: text("label", { mode: "json" }).$type<Localized>().notNull(),
  description: text("description", { mode: "json" }).$type<Localized>(),
  hierarchical: integer("hierarchical", { mode: "boolean" }).default(false).notNull(),
  collections: text("collections", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const taxonomyTerms: SQLiteTableWithColumns<any> = sqliteTable(
  "taxonomy_terms",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    taxonomy: text("taxonomy").notNull(),
    slug: text("slug").notNull(),
    label: text("label", { mode: "json" }).$type<Localized | string>().notNull(),
    description: text("description", { mode: "json" }).$type<Localized | string>(),
    parentId: text("parent_id").references((): AnySQLiteColumn => taxonomyTerms.id, {
      onDelete: "cascade",
    }),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("taxonomy_terms_tax_slug_idx").on(table.taxonomy, table.slug)],
);

export const pageTaxonomyTerms: SQLiteTableWithColumns<any> = sqliteTable(
  "page_taxonomy_terms",
  {
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    termId: text("term_id")
      .notNull()
      .references(() => taxonomyTerms.id, { onDelete: "cascade" }),
    assignedAt: integer("assigned_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("page_taxonomy_terms_page_term_idx").on(table.pageId, table.termId)],
);

// 11. Bylines
export const bylines: SQLiteTableWithColumns<any> = sqliteTable(
  "bylines",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    websiteUrl: text("website_url"),
    bio: text("bio"),
    avatar: text("avatar"),
    userId: text("user_id"),
    socials: text("socials", { mode: "json" })
      .$type<Record<string, string>>()
      .default(sql`'{}'`),
    metadata: text("metadata", { mode: "json" })
      .$type<Record<string, any>>()
      .default(sql`'{}'`),
    isGuest: integer("is_guest", { mode: "boolean" }).default(false).notNull(),
    fields: text("fields", { mode: "json" })
      .$type<Record<string, BylineFieldStored>>()
      .default(sql`'{}'`)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [uniqueIndex("bylines_slug_idx").on(table.slug)],
);

// Custom field definitions shown on every byline (see services/bylines.ts).
export const bylineFields: SQLiteTableWithColumns<any> = sqliteTable(
  "byline_fields",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    type: text("type").$type<BylineFieldType>().notNull(),
    required: integer("required", { mode: "boolean" }).default(false).notNull(),
    translatable: integer("translatable", { mode: "boolean" }).default(false).notNull(),
    options: text("options", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("byline_fields_slug_idx").on(table.slug)],
);

export type BylineField = typeof bylineFields.$inferSelect;
export type NewBylineField = typeof bylineFields.$inferInsert;

export type Byline = typeof bylines.$inferSelect;
export type NewByline = typeof bylines.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;

// 12. Dynamic Content Types
export const contentTypes: SQLiteTableWithColumns<any> = sqliteTable(
  "content_types",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    slug: text("slug").notNull(),
    name: text("name", { mode: "json" }).$type<Localized>().notNull(),
    description: text("description", { mode: "json" }).$type<Localized>(),
    icon: text("icon").default("i-lucide-box").notNull(),
    color: text("color"),
    mode: text("mode").$type<"document" | "data" | "singleton">().default("document").notNull(),
    fieldSchema: text("field_schema", { mode: "json" })
      .$type<Record<string, any>>()
      .default(sql`'{}'`)
      .notNull(),
    initialBlocks: text("initial_blocks", { mode: "json" })
      .$type<BaseBlock[]>()
      .default(sql`'[]'`)
      .notNull(),
    features: text("features", { mode: "json" })
      .$type<Record<string, any>>()
      .default(sql`'{}'`)
      .notNull(),
    workflow: text("workflow", { mode: "json" })
      .$type<Record<string, any>>()
      .default(sql`'{}'`)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("content_types_slug_idx").on(table.slug)],
);

export type ContentType = typeof contentTypes.$inferSelect;
export type InsertContentType = typeof contentTypes.$inferInsert;

// 11. Media library
/** A folder in the media tree. Virtual: moving or renaming a folder never touches storage. */
export const mediaFolders: SQLiteTableWithColumns<any> = sqliteTable("media_folders", {
  id: text("id").primaryKey().notNull(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/**
 * A file in the media library. `storageKey` is immutable (`{id}{ext}` for uploads), so the public
 * URL never changes when the file is moved, renamed or given new metadata.
 */
export const mediaAssets: SQLiteTableWithColumns<any> = sqliteTable("media_assets", {
  id: text("id").primaryKey().notNull(),
  storageKey: text("storage_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  /** Localized alt text, keyed by locale (same shape as other localized CMS text). */
  alt: text("alt", { mode: "json" }).$type<Localized>(),
  caption: text("caption", { mode: "json" }).$type<Localized>(),
  focalX: real("focal_x"),
  focalY: real("focal_y"),
  folderId: text("folder_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

import { defineConfig } from "drizzle-kit";

/**
 * Tables drizzle-kit must not manage. Each is created and altered by something else:
 * - the CMS tables and its bookkeeping table, by the CMS migrator (@rimelight/cms, src/migrator/sql.ts);
 * - the Better Auth tables, by the auth library, which has no drizzle schema in this app.
 */
const UNMANAGED_TABLES = [
  "bylines",
  "content_search_index",
  "content_types",
  "page_draft_locks",
  "page_drafts",
  "page_taxonomy_terms",
  "page_templates",
  "page_version_approvals",
  "page_version_comments",
  "page_versions",
  "pages",
  "search_index",
  "site_settings",
  "taxonomies",
  "taxonomy_terms",
  "_rimelight_cms_migrations",
  "account",
  "invitation",
  "member",
  "organization",
  "rate_limit",
  "role",
  "session",
  "team",
  "team_member",
  "user",
  "verification",
];

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/app-tables.ts",
  dialect: "postgresql",
  tablesFilter: UNMANAGED_TABLES.map((name) => `!${name}`),
  dbCredentials: {
    url: process.env["DATABASE_URL"]!,
  },
});

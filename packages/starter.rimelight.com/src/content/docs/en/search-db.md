---
title: Search & Database Setup
description: Learn how Cloudflare D1 (SQLite), Drizzle ORM, and FTS5 search indexing are configured in Rimelight.
---

Rimelight features a cloud-native database setup powered by **Cloudflare D1 (SQLite)** and **Drizzle ORM**, coupled with a native full-text search indexing pipeline leveraging SQLite's built-in **FTS5** engine.

---

## 1. Database Architecture & Client

The database client is located at `src/db/index.ts`. Since Cloudflare Workers inject resources on a per-request basis, the database client is initialized lazily using a JavaScript `Proxy`.

- **Lazy Initialization**: It fetches the request-level `globalThis.DB` binding dynamically on the first query.
- **Dialect**: Targets **SQLite** using Drizzle ORM's D1 driver (`drizzle-orm/d1`).

### Running Migrations

To apply schema modifications to your D1 database, run the migration commands below:

```bash
# Apply migrations locally (for development)
npx wrangler d1 migrations apply starter-dot-rimelight-dot-com_db --local

# Apply migrations to production (live Cloudflare D1 instance)
npx wrangler d1 migrations apply starter-dot-rimelight-dot-com_db --remote
```

---

## 2. Search Indexing Pipeline

The search system does not require external SaaS providers; it runs in-process inside your worker.

### Index & FTS5 Virtual Table

Search relies on two database tables defined in `src/db/schema/search.ts`:

1. **`search_index`**: The content store containing columns like `source_type`, `source_id`, `title`, `url`, and `body_content`. It uses an auto-incrementing `integer` primary key.
2. **`search_index_fts`**: A standard FTS5 virtual table indexing the `title` and `body_content` columns. It maps its search `rowid` directly to `search_index.id`.

### Synchronization (/api/syncSearch)

An API endpoint at `/api/syncSearch` scans all static markdown collections (`blog`, `docs`, `legal`) and dynamic database pages to sync them into the index:

- **Batch Chunking**: D1 limits the number of SQL variables (parameters) allowed per query (maximum of 100). The sync utility chunks batch insertions to `10` rows and batch deletions to `50` rows to prevent variable overflow errors.
- **Row-by-Row FTS Deletions**: Because FTS5 requires coordinate cleanup during deletions, the virtual table's indices are updated row-by-row (`rowid = ?`) instead of using `IN` operators.
- **Localized URLs**: Parses paths to match localized folder structures, rendering pages under `/[locale]/[type]/[slug]`.

### Auto-Sync on Deployments

You do not need to manually trigger the sync. When you deploy updates:

1. The search API detects a mismatch between the current frontend `BUILD_TIME` and the database's record.
2. The search endpoint calls `waitUntil()` to run `doSearchSync()` asynchronously in the background.

---

## 3. Querying & Prefix Matching (/api/search)

Queries are processed by `src/pages/api/search.ts`.

- **Prefix wildcards (`term*`)**: User input is cleaned and tokenized. A wildcard suffix `*` is appended to each word (e.g., searching for `toke` targets `toke*` in SQLite FTS5) to enable instantaneous prefix and partial keyword matching.
- **Snippet Highlights**: Uses FTS5's built-in `highlight()` function to dynamically extract matching text segments wrapped in `<mark>` tags.
- **Fallback Search**: If the virtual table query fails, search falls back to a standard SQL `LIKE %term%` pattern match.

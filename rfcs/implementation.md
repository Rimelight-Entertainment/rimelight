Markdown

# Implementation Guide: Dual Search Architecture for Astro SSR on Cloudflare Workers

This document outlines the zero-cost, edge-compatible search strategies for our Astro SSR fleet deployed on Cloudflare Workers/Pages. We avoid external SaaS dependencies and heavy Java/disk-based engines by leveraging two distinct patterns based on the site's data architecture.

---

## Architecture Overview

1. **For Hybrid / Dynamic Sites (Postgres + Markdown):** We use native PostgreSQL Full-Text Search (FTS) with a unified index table inside our existing Neon / PlanetScale database.
2. **For Pure Markdown Sites (No DB Backend):** We use Pagefind by generating its highly compressed static search shards at build time and querying them natively inside our Astro SSR routes via Cloudflare's environment bindings.

---

## Track 1: Postgres Native Full-Text Search (Hybrid Sites)

This track turns our existing Neon/PlanetScale PostgreSQL instance into a high-performance search engine. We consolidate content from dynamic tables and static Markdown files into a single optimized search index table.

### 1.1 Database Schema Setup

Execute the following SQL migration on the Postgres instance. This sets up the central index using a `tsvector` column and a GIN (Generalized Inverted Index) for sub-millisecond execution.

```sql
-- Enable the trigram extension for typo tolerance support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the centralized search index table
CREATE TABLE IF NOT EXISTS search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,         -- 'markdown' or 'database_table_name'
    source_id TEXT NOT NULL,           -- File path (e.g., 'blog/post-1.md') or relational primary key
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    body_content TEXT NOT NULL,        -- Retained for snippet generation
    searchable_text tsvector,          -- Tokenized lexical vector
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a GIN index on the searchable text vector for full-text search
CREATE INDEX IF NOT EXISTS idx_search_index_text ON search_index USING GIN(searchable_text);

-- Create a GiST/GIN index on the title for trigram-based fuzzy typo matching
CREATE INDEX IF NOT EXISTS idx_search_index_title_trgm ON search_index USING gin (title gin_trgm_ops);
1.2 Data Syncing Strategy
A. Database Content (Automated Sync via Hook or Application Logic)
Whenever rows are created, updated, or deleted in your primary content tables (e.g., products, articles), sync them to the search_index.

SQL
-- Example UPSERT pattern when a product or article changes
INSERT INTO search_index (source_type, source_id, title, url, body_content, searchable_text, updated_at)
VALUES (
    'products',
    'prod_999',
    'Wireless Noise-Cancelling Headphones',
    '/shop/products/wireless-headphones',
    'Premium over-ear headphones with 40-hour battery life and active ambient noise cancellation.',
    -- Concatenate and weight title (A) and description (B)
    setweight(to_tsvector('english', 'Wireless Noise-Cancelling Headphones'), 'A') ||
    setweight(to_tsvector('english', 'Premium over-ear headphones with 40-hour battery life and active ambient noise cancellation.'), 'B'),
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    url = EXCLUDED.url,
    body_content = EXCLUDED.body_content,
    searchable_text = EXCLUDED.searchable_text,
    updated_at = CURRENT_TIMESTAMP;
B. Markdown Content Sync (Build/Deploy Step)
Create an execution script (scripts/sync-md-to-db.mjs) that reads local Content Collections or markdown directories during your deployment pipeline and pushes them into your database via an edge-compatible client.

JavaScript
import { Client } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

async function syncMarkdown() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const postsDirectory = path.join(process.cwd(), 'src/content/blog');
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(postsDirectory, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const url = `/blog/${file.replace('.md', '')}`;

    const query = `
      INSERT INTO search_index (source_type, source_id, title, url, body_content, searchable_text, updated_at)
      VALUES ($1, $2, $3, $4, $5, setweight(to_tsvector('english', $3), 'A') || setweight(to_tsvector('english', $5), 'B'), CURRENT_TIMESTAMP)
      ON CONFLICT (source_type, source_id) DO UPDATE SET
         title = EXCLUDED.title, url = EXCLUDED.url, body_content = EXCLUDED.body_content, searchable_text = EXCLUDED.searchable_text, updated_at = CURRENT_TIMESTAMP;
    `;

    await client.query(query, ['markdown', file, data.title, url, content]);
  }
  await client.end();
}
syncMarkdown().catch(console.error);
1.3 Astro SSR Edge Route (Cloudflare Friendly)
Create a clean API endpoint inside Astro using the native, non-blocking @neondatabase/serverless driver (WebSocket/HTTP transport optimized for V8 isolates).

TypeScript
// src/pages/api/search.ts
import type { APIRoute } from 'astro';
import { Client } from '@neondatabase/serverless';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const searchPrompt = url.searchParams.get('q') || '';

  if (!searchPrompt) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Use connection string from Cloudflare Environment Variables
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  // Combine Lexical Text Search Matcher and Fuzzy Trigram Metric for dynamic fallback
  const sqlQuery = `
    SELECT
      title,
      url,
      source_type,
      ts_rank(searchable_text, query) as rank,
      ts_headline('english', body_content, query, 'StartSel=<b>, StopSel=</b>, MaxWords=25') as snippet
    FROM search_index, websearch_to_tsquery('english', $1) query
    WHERE searchable_text @@ query OR title % $1
    ORDER BY rank DESC, title % $1 DESC
    LIMIT 15;
  `;

  try {
    const { rows } = await client.query(sqlQuery, [searchPrompt]);
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await client.end();
  }
};
Track 2: Pagefind Node API (Pure Markdown Sites)
For sites that contain only Markdown files and maintain a $0 overhead without any transactional databases, we use Pagefind. Pagefind is executed strictly during the deployment pipeline inside the Cloudflare CI/CD runner. Instead of client-side static rendering, we wrap Pagefind's index lookup natively in an SSR endpoint.

2.1 Configuration Setup
Install the necessary dev dependencies:

Bash
npm install -D pagefind
2.2 Configure Build Pipelines for Cloudflare
Update your package.json build sequence. Pagefind must compile its index shards after Astro compiles its files.

JSON
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro check && astro build && pagefind --site dist"
}
Note: Make sure your configuration outputs your build assets into the dist/ directory or your explicit output path.

2.3 Astro SSR Edge Route utilizing Pagefind Client API
Since we run under pure SSR (output: 'server' or output: 'hybrid' in astro.config.mjs), we do not mount raw static index arrays into global client scopes. Instead, we call Pagefind dynamically.

TypeScript
// src/pages/api/search.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (!query) {
    return new Response(JSON.stringify({ results: [] }), { status: 200 });
  }

  try {
    // Dynamic import handles the build-time generated module safely inside Cloudflare environment
    // @ts-ignore
    const pagefind = await import(/* @vite-ignore */ '/dist/pagefind/pagefind.js');

    // Initialize search execution
    const searchResult = await pagefind.search(query);

    // Resolve detailed item fields from index data shards safely (limit to top 10)
    const detailedHits = await Promise.all(
      searchResult.hits.slice(0, 10).map(async (hit: any) => {
        const data = await hit.data();
        return {
          title: data.meta.title,
          url: data.url,
          excerpt: data.excerpt
        };
      })
    );

    return new Response(JSON.stringify({ results: detailedHits }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Search index unavailable or empty.", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
Architecture Selection Matrix for Agent Execution
Prior to running the implementation scripts across target repositories, verify selection against this matrix:

                  ┌───────────────────────────────┐
                  │ Does the site have a Database │
                  │     (Neon/Planetscale)?       │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
               [ YES ]                         [ NO ]
                  │                               │
                  ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │     Execute Track 1       │   │     Execute Track 2       │
    │  (Postgres Native FTS)    │   │  (Pagefind Build + SSR)   │
    └───────────────────────────┘   └───────────────────────────┘
Verify Config: Ensure Cloudflare compatibility flags (compatibility_flags = [ "nodejs_compat" ]) are evaluated inside wrangler.toml if any secondary library relies on buffer adjustments.

Key Access: Confirm DATABASE_URL is configured safely via Cloudflare Secret Management dashboard (wrangler secret put DATABASE_URL).
```

---
title: API Reference
description: How to query content from Rimelight CMS in your frontend.
---

Rimelight CMS generates a tailored API client based on your configuration. This client is fully type-safe and optimized for Astro.

## Importing the Client

The client is generated in your `src/cms/.generated/api` location.

```typescript
import { cms } from "../cms/.generated/api"
```

## Querying Content

### Get Multiple Entries

Use `cms.[collection].find()` to get a list of entries.

```typescript
const posts = await cms.posts.find({
  where: { featured: true },
  limit: 10,
  sort: { publishedDate: "desc" },
  locale: "en"
})
```

### Get Single Entry by ID

```typescript
const post = await cms.posts.findById("my-post-id", {
  locale: "en"
})
```

### Get Single Entry by Slug

```typescript
const post = await cms.posts.findOne({
  where: { slug: "hello-world" },
  locale: "en"
})
```

## Options and Filtering

The `find` methods accept an options object:

- `where`: Filter entries (e.g., `{ category: "News" }`).
- `limit` / `offset`: Pagination.
- `sort`: Sorting (e.g., `{ _updatedAt: "desc" }`).
- `locale`: The locale to fetch. If provided, the client will automatically merge localized field values.
- `depth`: Control recursion for relations (default: 1).

## Utility Functions

The `@rimelight/cms/define` package exports several utilities often needed in hooks or frontends.

### `richTextToPlainText(doc)`

Converts a Rich Text document (JSON) into a simple string. Useful for SEO descriptions or search indexing.

```typescript
import { richTextToPlainText } from "@rimelight/cms/define"

const plain = richTextToPlainText(post.body)
```

### `slugify(text)`

Generates a URL-safe slug from a string.

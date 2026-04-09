---
title: Getting Started
description: How to set up and configure Rimelight CMS in your project.
---

This guide will walk you through the steps to integrate Rimelight CMS into your Astro project.

## Installation

Install the `@rimelight/cms` package and its peer dependencies:

```bash
pnpm add @rimelight/cms
```

## Setup

### 1. Create a CMS Configuration

Create a file at `src/cms/cms.config.ts`. This file defines your collections and global settings.

```typescript
import { defineConfig, fields } from "@rimelight/cms/define"

export default defineConfig({
  database: { dialect: "sqlite" }, // Or "postgres"
  locales: {
    default: "en",
    supported: ["en", "es"]
  },
  collections: [
    {
      slug: "posts",
      labels: { singular: "Post", plural: "Posts" },
      fields: {
        title: fields.text({ required: true, translatable: true }),
        content: fields.richText({ translatable: true })
      }
    }
  ]
})
```

### 2. Add the Integration

In your `astro.config.ts`, import the integration and your configuration:

```typescript
import { defineConfig } from "astro/config"
import cms from "@rimelight/cms"
import cmsConfig from "./src/cms/cms.config"

export default defineConfig({
  integrations: [
    cms({
      config: cmsConfig
    })
  ]
})
```

### 3. Configure Database (Optional)

If you are using Cloudflare D1, ensure your `wrangler.jsonc` has a D1 database binding. The CMS will automatically detect it and use it in development.

## Accessing the Admin Panel

Start your development server:

```bash
pnpm dev
```

The admin panel will be available at:
`http://localhost:4321/en/admin` (replacing `en` with your default locale).

On the first run, the CMS will guide you through creating an initial admin account.

## Generated Files

The CMS automatically generates code in `src/cms/.generated/` every time your config changes. This includes:

- `schema.ts`: Drizzle database schema.
- `api.ts`: A type-safe CMS client.
- `types.ts`: TypeScript definitions for your collections.

You should usually add `src/cms/.generated` to your `.gitignore`.

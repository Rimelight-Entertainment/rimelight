# @rimelight/cms

[![npm](https://img.shields.io/npm/v/@rimelight/cms?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cms)
[![downloads](https://img.shields.io/npm/dt/@rimelight/cms?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cms)

Content management for Rimelight sites. Content is built from typed collections and blocks, with taxonomies, templates, and versioning. A Solid dashboard lets editors manage it, and the package serves it to your routes with permission-aware filtering.

## Features

- **Collections**: typed content types with fields, features, and routable paths (`defineCollection`).
- **Blocks**: a registry of built-in and custom content blocks (`defineBlock`), with a block editor.
- **Taxonomies and templates**: categories, tags, and page templates.
- **Versioning and diffs**: revision history with a diff view.
- **Media**: uploads stored in R2 (`@rimelight/cms/storage`).
- **Dashboard**: a Solid-based editor, served from `@rimelight/cms/dashboard`.
- **Permission-aware reads**: block and template filtering by user role.
- **Storage backends**: Postgres (`./schema`) and SQLite/Cloudflare D1 (`./schema/sqlite`).
- **MCP server**: exposes content to AI tools (`@rimelight/cms/mcp`).
- **Scheduled jobs**: publishing and maintenance tasks (`@rimelight/cms/cron`).
- **Markdown and rich text**: parsing, excerpts, and previews.

## Installation

```sh
pnpm add @rimelight/cms
```

### Peer dependencies

| Package           | Version           |
| ----------------- | ----------------- |
| `@solidjs/router` | `>=2.0.0-next.42` |
| `solid-js`        | `>=2.0.0-rc.18`   |
| `vite-plus`       | `^1.0.0`          |

`@rimelight/auth`, `@rimelight/i18n`, and `@rimelight/ui` are installed as dependencies.

## Usage

Define your content model in `cms.config.ts`:

```ts
import { defineCmsConfig, defineCollection } from "@rimelight/cms";

export default defineCmsConfig({
  collections: [
    defineCollection({
      slug: "projects",
      label: "Project",
      labelPlural: "Projects",
      icon: "i-lucide-folder-kanban",
      features: { taxonomies: ["category", "tag"], routable: "/projects/{slug}" },
      fields: {
        cover: { type: "media", label: "Cover image" },
        featured: { type: "boolean", label: "Featured", defaultValue: false },
      },
    }),
  ],
});
```

Then add the Vite plugin and the server middleware:

```ts
// vite.config.ts
import { cms } from "@rimelight/cms/plugin";

export default defineConfig({
  plugins: [cms({ autoMigrate: true })],
});
```

```ts
// src/fetch.ts
import { cms } from "@rimelight/cms/middleware";

app.use(cms());
```

Collections can also be created in the dashboard and stored in the database. Config-defined collections are the ones your code relies on.

## Exports

| Import                           | Purpose                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `@rimelight/cms`                 | `defineCmsConfig`, `defineCollection`, `defineBlock`, and content types |
| `@rimelight/cms/schema`          | Postgres schema                                                         |
| `@rimelight/cms/schema/sqlite`   | SQLite (D1) schema                                                      |
| `@rimelight/cms/services`        | Content services for reading and writing                                |
| `@rimelight/cms/server`          | Server-side content API                                                 |
| `@rimelight/cms/middleware`      | Hono middleware                                                         |
| `@rimelight/cms/plugin`          | Vite plugin                                                             |
| `@rimelight/cms/migrator`        | Migration runner                                                        |
| `@rimelight/cms/storage`         | Media storage (R2)                                                      |
| `@rimelight/cms/mcp`             | MCP server                                                              |
| `@rimelight/cms/cron`            | Scheduled job handlers                                                  |
| `@rimelight/cms/cron/scheduled`  | Scheduled entry point                                                   |
| `@rimelight/cms/docs`            | Documentation helpers                                                   |
| `@rimelight/cms/solid`           | Solid components for rendering content                                  |
| `@rimelight/cms/dashboard`       | Dashboard components                                                    |
| `@rimelight/cms/dashboard/route` | Dashboard route                                                         |
| `@rimelight/cms/virtual`         | Virtual modules for the Vite plugin                                     |
| `@rimelight/cms/client/types`    | Client type definitions                                                 |

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/cms test
pnpm --filter @rimelight/cms build
pnpm --filter @rimelight/cms check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

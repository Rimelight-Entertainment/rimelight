# @rimelight/cms

[![npm](https://img.shields.io/npm/v/@rimelight/cms?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cms)
[![downloads](https://img.shields.io/npm/dt/@rimelight/cms?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cms)

Content delivery for Rimelight sites. Content is built from typed collections and blocks, with taxonomies, templates, and versioning. The package serves published content to your routes with anonymous, permission-free filtering.

Editing moved to Rimelight Space (decision 0049). The package no longer has a dashboard, an admin API, a user table, or an MCP server. Website editing stops at the next deploy; content is edited in Rimelight Space.

## Features

- **Collections**: typed content types with fields, features, and routable paths (`defineCollection`).
- **Blocks**: a registry of built-in and custom content blocks (`defineBlock`).
- **Taxonomies and templates**: categories, tags, and page templates.
- **Public delivery API**: published pages with `visibility` `Public`, taxonomies, bylines, docs navigation, and search, mounted under `/content` and `/search`.
- **Internal content stays internal**: pages whose visibility is not `Public` are never served, and blocks marked `visibility: "internal"` are dropped for every reader.
- **Scheduled jobs**: publishing and maintenance tasks (`@rimelight/cms/cron`).
- **Markdown and rich text**: parsing, excerpts, and previews.
- **Storage backends**: Postgres (`./schema`) and SQLite/Cloudflare D1 (`./schema/sqlite`).

## Installation

```sh
pnpm add @rimelight/cms
```

### Peer dependencies

| Package     | Version         |
| ----------- | --------------- |
| `solid-js`  | `>=2.0.0-rc.18` |
| `vite-plus` | `^1.0.0`        |

`@rimelight/i18n` and `@rimelight/ui` are peer dependencies too.

## Usage

Define the site configuration in `cms.config.ts`:

```ts
import { defineCmsConfig } from "@rimelight/cms";

export default defineCmsConfig({
  locales: ["en", "pt", "es"],
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

Collections, taxonomies, and templates are created in the database. Content is created and published in Rimelight Space.

## Exports

| Import                          | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@rimelight/cms`                | `defineCmsConfig`, `defineCollection`, `defineBlock`, and content types |
| `@rimelight/cms/schema`         | Postgres schema                                                         |
| `@rimelight/cms/schema/sqlite`  | SQLite (D1) schema                                                      |
| `@rimelight/cms/services`       | Content services (used by the delivery API and server code)             |
| `@rimelight/cms/server`         | Public delivery API (`createCmsApi`)                                    |
| `@rimelight/cms/middleware`     | Hono middleware for the delivery API                                    |
| `@rimelight/cms/plugin`         | Vite plugin                                                             |
| `@rimelight/cms/migrator`       | Migration runner                                                        |
| `@rimelight/cms/cron`           | Scheduled job handlers                                                  |
| `@rimelight/cms/cron/scheduled` | Scheduled entry point                                                   |
| `@rimelight/cms/docs`           | Documentation helpers                                                   |
| `@rimelight/cms/solid`          | Solid components for rendering content                                  |
| `@rimelight/cms/blocks`         | Block definitions and built-in blocks                                   |
| `@rimelight/cms/virtual`        | Virtual modules for the Vite plugin                                     |
| `@rimelight/cms/client/types`   | Client type definitions                                                 |

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

# @rimelight/seo

[![npm](https://img.shields.io/npm/v/@rimelight/seo?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/seo)
[![downloads](https://img.shields.io/npm/dt/@rimelight/seo?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/seo)

Search and discovery tooling for Rimelight sites. It generates the head metadata, JSON-LD structured data, sitemaps, `robots.txt`, RSS feeds, the web app manifest, `llms.txt`, an API catalog, and Open Graph images.

## Features

- **Head metadata**: title templates, descriptions, canonical URLs, Open Graph, and theme colors.
- **Structured data**: JSON-LD for articles and breadcrumbs, serialized safely.
- **Sitemaps**: sitemaps and sitemap indexes, built from your routes and content.
- **`robots.txt`**: generated from configuration.
- **RSS**: feeds for blogs and other collections.
- **Web manifest**: `site.webmanifest`, with your branding.
- **`llms.txt`**: a summary and full-text file for AI agents.
- **API catalog**: a machine-readable index of your API.
- **Open Graph images**: per-route social cards, with a component for each route pattern.
- **Sanitization**: escaping and sanitizing for user-supplied metadata.

## Installation

```sh
pnpm add @rimelight/seo
```

### Peer dependencies

| Package        | Version         |
| -------------- | --------------- |
| `@solidjs/web` | `>=2.0.0-rc.18` |
| `hono`         | `^5.0.0-rc.1`   |
| `vite-plus`    | `^1.0.0`        |

`@rimelight/i18n` is installed as a dependency.

## Usage

Configure the Vite plugin with your site identity and branding:

```ts
// vite.config.ts
import { seo } from "@rimelight/seo/plugin";

export default defineConfig({
  plugins: [
    seo({
      id: "example.com",
      url: "https://example.com",
      name: "Example",
      description: "Welcome to my website!",
      author: "Jane Doe",
      email: "jane@example.com",
      titleTemplate: "%s | Example",
      branding: {
        logo: { alt: "Example" },
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" },
      },
      og: {
        routes: {
          "*/blog/*": "./src/components/og/BlogOgCard.tsx",
        },
      },
    }),
  ],
});
```

Then mount the middleware in your Hono app:

```ts
import { seo } from "@rimelight/seo/middleware";

app.use(seo());
```

## Exports

| Import                      | Purpose                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `@rimelight/seo`            | Builders for sitemaps, robots, RSS, manifest, `llms.txt`, API catalog, and JSON-LD schemas |
| `@rimelight/seo/client`     | Client-side head helpers                                                                   |
| `@rimelight/seo/head`       | Head metadata helpers                                                                      |
| `@rimelight/seo/middleware` | Hono middleware                                                                            |
| `@rimelight/seo/plugin`     | Vite plugin                                                                                |
| `@rimelight/seo/sanitize`   | Escaping and sanitization helpers                                                          |
| `@rimelight/seo/types`      | Public type definitions                                                                    |
| `@rimelight/seo/sitemap`    | Sitemap builders                                                                           |
| `@rimelight/seo/robots`     | `robots.txt` builder                                                                       |
| `@rimelight/seo/rss`        | RSS builder                                                                                |
| `@rimelight/seo/manifest`   | Web manifest builder                                                                       |
| `@rimelight/seo/catalog`    | API catalog builder                                                                        |
| `@rimelight/seo/og`         | Open Graph image helpers                                                                   |

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/seo test
pnpm --filter @rimelight/seo build
pnpm --filter @rimelight/seo check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

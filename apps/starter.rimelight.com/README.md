# starter.rimelight.com

Rimelight's starter template for Solid 2.0 websites on Cloudflare Workers. It ships with the standard Rimelight stack already wired together: auth, CMS, i18n, security, SEO, and UI. New sites are scaffolded from it with `@rimelight/cli`.

## Create a New Site

```sh
pnpm dlx @rimelight/cli create my-site --domain my-site.com
```

The CLI copies this template, sets the domain, and optionally installs dependencies and initializes Git. Use `rimelight update` later to pull in template changes. See the [CLI README](../../packages/cli/README.md).

## Features

- **Blog and docs**: a blog, and a docs section.
- **Company pages**: about, contact, branding, and legal pages.
- **Localization**: English, Portuguese, and Spanish.
- **CMS**: content managed through `@rimelight/cms`.
- **Authentication**: wired through `@rimelight/auth`.
- **Security**: CSP, SRI, rate limiting, Turnstile, and construction mode.
- **SEO**: sitemap, robots, RSS, manifest, `llms.txt`, and Open Graph images.

## Stack

- Solid 2.0 with SSR (`solid-js`, `@solidjs/router`, `@solidjs/web`)
- Vite+ (`vp`) and Vite, with `@cloudflare/vite-plugin`
- Hono on Cloudflare Workers
- Cloudflare D1 (SQLite) with Drizzle ORM, and R2 for media
- Rimelight packages: `@rimelight/auth`, `@rimelight/cms`, `@rimelight/i18n`, `@rimelight/security`, `@rimelight/seo`, `@rimelight/ui`

## Project Structure

```text
├── .cloudflare/            # Generated Worker types
├── drizzle/                # SQL migrations (D1)
├── src/
│   ├── api/                # Hono API routes, mounted under /api
│   ├── components/         # UI components, grouped by feature (app, blog, docs, og)
│   ├── db/                 # Drizzle schema and client
│   ├── i18n/               # en.json, es.json, pt.json
│   ├── routes/[locale]/    # File-based routes, prefixed with the locale
│   ├── App.tsx             # Root component
│   ├── Document.tsx        # HTML shell
│   └── fetch.ts            # Worker entry: middleware chain and SSR handler
├── .dev.vars.example
├── cloudflare.config.ts    # Worker name, bindings, routes
├── drizzle.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 26.12.1 (see `.node-version`)
- pnpm 12.15.0
- A Cloudflare account

### Setup

```sh
pnpm install
cp .dev.vars.example .dev.vars   # fill in the values
pnpm generate-types
pnpm db:migrate
pnpm dev
```

## Environment Variables

Set these in `.dev.vars` for local development, and as Worker secrets in production. Never commit `.dev.vars`.

| Variable                  | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `CONSTRUCTION_MODE`       | Set to `true` to hold the site behind the construction passphrase |
| `CONSTRUCTION_PASSPHRASE` | Passphrase that unlocks a site in construction mode               |
| `TURNSTILE_SITE_KEY`      | Cloudflare Turnstile site key (client-side widget)                |
| `TURNSTILE_SECRET_KEY`    | Cloudflare Turnstile secret key (server-side verification)        |

## Cloudflare Bindings

Defined in `cloudflare.config.ts`: `ASSETS`, `IMAGES`, `BLOB` (R2), `DB` (D1), `EMAIL`, and `RATE_LIMIT`.

## Scripts

| Command                  | Action                                                      |
| ------------------------ | ----------------------------------------------------------- |
| `pnpm dev`               | Start the local dev server (`vp dev`)                       |
| `pnpm build`             | Build every `@rimelight/*` package, then the site           |
| `pnpm preview`           | Preview the production build                                |
| `pnpm deploy`            | Deploy the Worker with `cf deploy`                          |
| `pnpm generate-types`    | Generate Worker binding types                               |
| `pnpm check`             | Regenerate types, check i18n keys, and run `vp check --fix` |
| `pnpm db:generate`       | Generate Drizzle migrations from `src/db/schema`            |
| `pnpm db:migrate`        | Apply migrations to the local D1 database                   |
| `pnpm db:migrate:remote` | Apply migrations to the remote D1 database                  |

## Database

The schema is in `src/db/schema`, and migrations are in `drizzle/`. To change the schema, edit it, run `pnpm db:generate`, commit the migration, then run `pnpm db:migrate` locally. Run `pnpm db:migrate:remote` before deploying schema changes.

## Deployment

```sh
pnpm build
pnpm db:migrate:remote   # if the schema changed
pnpm deploy
```

## Construction Mode

With `CONSTRUCTION_MODE=true`, visitors need `CONSTRUCTION_PASSPHRASE` to see the site. Passing `?preview=<passphrase>` sets an access cookie. See [`@rimelight/security`](../../packages/security/README.md#construction-mode) for details.

## License

MIT. Copyright (c) 2026 Rimelight Entertainment. See [LICENSE](../../LICENSE).

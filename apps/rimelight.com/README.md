# rimelight.com

The company website for Rimelight Entertainment. It hosts company pages, the documentation site, the Grand Tale franchise hub (wiki, guides, news, leaderboards), the store, forums, and events. Content is managed through `@rimelight/cms`, with custom screenplay blocks for franchise content.

## Features

- **Company pages**: about, careers, studio, blog, legal, and branding.
- **Documentation**: a docs section, with API and component documentation extracted from source (`src/docs`).
- **Franchise hub**: Grand Tale news, guides, calculators, leaderboards, wiki, and support.
- **Wiki**: browse, edit, and review pages, with a contribution guide.
- **Store**: product catalog and orders.
- **Authentication**: sign-in, sign-up, and sign-out through Auth0.
- **Localization**: English, Portuguese, and Spanish.
- **Developer showcase**: component, localization, security, and SEO demos under `/dev`.
- **Custom CMS blocks**: screenplay blocks (`ScriptBlock`, `DialogueBlock`, `SceneBlock`, and others) defined in `cms.config.ts`.

## Stack

- Solid 2.0 with SSR (`solid-js`, `@solidjs/router`, `@solidjs/web`)
- Vite+ (`vp`) and Vite, with `@cloudflare/vite-plugin`
- Hono on Cloudflare Workers
- PostgreSQL (Neon) through Cloudflare Hyperdrive, with Drizzle ORM
- Cloudflare R2 for media, and Rate Limiting
- Rimelight packages: `@rimelight/auth`, `@rimelight/cms`, `@rimelight/i18n`, `@rimelight/security`, `@rimelight/seo`, `@rimelight/ui`

## Project Structure

```text
├── .cloudflare/            # Generated Worker types
├── drizzle/                # SQL migrations (PostgreSQL)
├── src/
│   ├── api/                # Hono API routes, mounted under /api
│   ├── auth/               # Auth0 integration and permissions
│   ├── components/         # UI components, grouped by feature
│   ├── db/                 # Drizzle schema and client
│   ├── docs/               # Docs extraction and Vite plugin
│   ├── i18n/               # en.json, es.json, pt.json
│   ├── routes/[locale]/    # File-based routes, prefixed with the locale
│   ├── App.tsx             # Root component
│   ├── Document.tsx        # HTML shell
│   └── fetch.ts            # Worker entry: middleware chain and SSR handler
├── .dev.vars.example
├── cloudflare.config.ts    # Worker name, bindings, routes
├── cms.config.ts           # CMS locales and custom blocks
├── drizzle.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 26.13.1 (see `.node-version`)
- pnpm 12.16.1
- A Cloudflare account, and a PostgreSQL database reachable through Hyperdrive
- An Auth0 tenant. See [`docs/auth0-setup.md`](../../docs/auth0-setup.md).

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

| Variable                  | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `CONSTRUCTION_MODE`       | Set to `true` to hold the site behind the construction passphrase            |
| `CONSTRUCTION_PASSPHRASE` | Passphrase that unlocks a site in construction mode                          |
| `TURNSTILE_SITE_KEY`      | Cloudflare Turnstile site key (client-side widget)                           |
| `TURNSTILE_SECRET_KEY`    | Cloudflare Turnstile secret key (server-side verification)                   |
| `DATABASE_URL`            | PostgreSQL connection string                                                 |
| `AUTH0_DOMAIN`            | Auth0 tenant domain                                                          |
| `AUTH0_CLIENT_ID`         | Auth0 application client ID                                                  |
| `AUTH0_CLIENT_SECRET`     | Auth0 application client secret                                              |
| `AUTH0_AUDIENCE`          | Auth0 API audience                                                           |
| `AUTH0_SECRET`            | Required. Session secret for the Auth0 integration; sign-in fails when unset |
| `AUTH0_BASE_URL`          | Public base URL of the site, used for Auth0 callbacks                        |
| `AUTH0_ROLES_CLAIM`       | Token claim that holds user roles                                            |
| `AUTH0_USER_TYPE_CLAIM`   | Token claim that holds the user type                                         |
| `GITHUB_TOKEN`            | GitHub token for fetching data during builds                                 |

## Cloudflare Bindings

Defined in `cloudflare.config.ts`:

| Binding            | Type       | Purpose                         |
| ------------------ | ---------- | ------------------------------- |
| `ASSETS`           | Assets     | Static assets                   |
| `IMAGES`           | Images     | Image transformation            |
| `BLOB`             | R2 bucket  | Media storage                   |
| `HYPERDRIVE`       | Hyperdrive | Pooled connection to PostgreSQL |
| `RATE_LIMIT`       | Rate limit | General request limiting        |
| `RATE_LIMIT_LOGIN` | Rate limit | Stricter limit for sign-in      |

## Scripts

| Command               | Action                                                               |
| --------------------- | -------------------------------------------------------------------- |
| `pnpm dev`            | Start the local dev server (`vp dev`)                                |
| `pnpm build`          | Build every `@rimelight/*` package, then the site                    |
| `pnpm preview`        | Preview the production build                                         |
| `pnpm deploy`         | Deploy the Worker with `cf deploy`                                   |
| `pnpm generate-types` | Generate Worker binding types                                        |
| `pnpm db:generate`    | Generate Drizzle migrations from `src/db/schema`                     |
| `pnpm db:migrate`     | Apply migrations (`drizzle-kit migrate`)                             |
| `pnpm db:push`        | Push the schema directly, without migration files (development only) |
| `pnpm test`           | Run the test suite                                                   |
| `pnpm check`          | Regenerate types, check i18n keys, and run `vp check --fix`          |

## Database

The schema is in `src/db/schema`, and migrations are in `drizzle/`. To change the schema, edit it, run `pnpm db:generate`, commit the migration, and run `pnpm db:migrate`. Use `db:push` only for throwaway local databases.

## Deployment

```sh
pnpm build
pnpm deploy
```

The site is served on `rimelight.com` and `www.rimelight.com`, as set in `cloudflare.config.ts`.

## Construction Mode

With `CONSTRUCTION_MODE=true`, visitors need `CONSTRUCTION_PASSPHRASE` to see the site. Passing `?preview=<passphrase>` sets an access cookie. See [`@rimelight/security`](../../packages/security/README.md#construction-mode) for details.

## License

MIT. Copyright (c) 2026 Rimelight Entertainment. See [LICENSE](../../LICENSE).

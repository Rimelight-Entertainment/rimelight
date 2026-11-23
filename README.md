# Rimelight Entertainment Monorepo

The source for Rimelight Entertainment's websites and the shared packages behind them. Everything is built with Solid 2.0, served from Cloudflare Workers, and tooled through [Vite+](https://viteplus.dev/guide/) (`vp`).

## Repository Layout

```text
├── apps/
│   ├── rimelight.com/            # Company website
├── packages/
│   ├── auth/                     # @rimelight/auth
│   ├── cms/                      # @rimelight/cms
│   ├── config/                   # @rimelight/config
│   ├── i18n/                     # @rimelight/i18n
│   ├── security/                 # @rimelight/security
│   ├── seo/                      # @rimelight/seo
│   └── ui/                       # @rimelight/ui
├── docs/                         # Setup guides and reference notes
├── rfc/                          # Design proposals
└── .github/workflows/            # CI
```

## Apps

| App                                             | Description                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`rimelight.com`](apps/rimelight.com/README.md) | The company website: company pages, documentation, the Grand Tale franchise hub, store, and forums |

## Packages

| Package                                              | Description                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`@rimelight/auth`](packages/auth/README.md)         | Authentication and identity: Auth0, Cloudflare Access, JWTs, and permissions      |
| [`@rimelight/cms`](packages/cms/README.md)           | Content management: collections, blocks, taxonomies, versioning, and a dashboard  |
| [`@rimelight/config`](packages/config/README.md)     | Shared TypeScript configs                                                         |
| [`@rimelight/i18n`](packages/i18n/README.md)         | Typed translations, locale URLs, and per-route loading                            |
| [`@rimelight/security`](packages/security/README.md) | CSP, SRI, security headers, rate limiting, Turnstile, and construction mode       |
| [`@rimelight/seo`](packages/seo/README.md)           | Head metadata, sitemaps, robots, RSS, manifest, `llms.txt`, and Open Graph images |
| [`@rimelight/ui`](packages/ui/README.md)             | The SolidJS 2.0 component library                                                 |

## Getting Started

### Prerequisites

- Node.js 26.13.1 (see `.node-version`)
- pnpm 12.16.1 (see `packageManager` in `package.json`)

### Install

```sh
pnpm install
```

The `prepare` script runs `vp config`, which sets up the Vite+ toolchain and git hooks.

## Scripts

Run these from the monorepo root:

| Command        | Action                                             |
| -------------- | -------------------------------------------------- |
| `pnpm install` | Install all workspace dependencies                 |
| `pnpm build`   | Build every package that has a build step          |
| `pnpm test`    | Run the test suite in every workspace              |
| `pnpm check`   | Format, lint, and type check with `vp check --fix` |

To work on a single package or app, use a filter:

```sh
pnpm --filter @rimelight/ui test
pnpm --filter rimelight-dot-com dev
```

## Documentation

- [`docs/new-project-setup.md`](docs/new-project-setup.md): checklist for onboarding a new domain and project (Cloudflare zone, DNS, SSL, and more)
- [`docs/auth0-setup.md`](docs/auth0-setup.md): Auth0 tenant setup for the website and the client API
- [`docs/lmg-financial-transparency.md`](docs/lmg-financial-transparency.md): research notes on Linus Media Group's financial transparency data

Design proposals live in [`rfc/`](rfc/). Start new ones from [`rfc/template.md`](rfc/template.md).

## CI

[`.github/workflows/preview.yml`](.github/workflows/preview.yml) publishes every package in `packages/` to [pkg.pr.new](https://pkg.pr.new) on each push and pull request, and comments the commit SHA on the PR.

## Contributing

1. Create a branch and make your change.
2. Run `pnpm check` and `pnpm test`.
3. Open a pull request. Describe what changed and why.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Rimelight Entertainment.

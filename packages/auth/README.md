# @rimelight/auth

[![npm](https://img.shields.io/npm/v/@rimelight/auth?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/auth)
[![downloads](https://img.shields.io/npm/dt/@rimelight/auth?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/auth)

Universal authentication and identity for Rimelight sites. It verifies sessions and JWTs on the server, exposes the current user to Solid components, and enforces a role and permission matrix. It works with Auth0, Cloudflare Access, or a mock adapter for local development.

## Features

- **Pluggable adapters**: Auth0 and Cloudflare Access (`cf-access`). One is selected per deployment by the `auth()` Vite plugin's `provider` option; the other is never consulted. Plus a mock adapter for development and tests.
- **Hono middleware**: resolves the session on each request and exposes it to route handlers.
- **JWT utilities**: verification helpers for signed tokens.
- **Permissions**: a role and user-type permission matrix, shared with `@rimelight/cms` for filtering content.
- **Client helpers**: session access for Solid components.
- **Vite plugin**: wires auth configuration into the build.
- **Reserved usernames**: a plugin that blocks reserved handles at sign-up.

## Installation

```sh
pnpm add @rimelight/auth
```

### Peer dependencies

Install these alongside the package:

| Package     | Version       |
| ----------- | ------------- |
| `hono`      | `^5.0.0-rc.1` |
| `vite-plus` | `^1.0.0`      |

## Usage

Add the Vite plugin, then mount the middleware on your Hono app. Mount it before routes that need the session.

```ts
// vite.config.ts
import { auth } from "@rimelight/auth/plugin";

export default defineConfig({
  plugins: [auth()],
});
```

```ts
// src/fetch.ts
import { Hono } from "hono";
import { auth } from "@rimelight/auth/middleware";

const app = new Hono<{ Bindings: Env }>();

app.use(auth());
```

Sites that use Auth0 configure it through environment variables. See [`docs/auth0-setup.md`](../../docs/auth0-setup.md) for the tenant setup.

## Exports

| Import                                       | Purpose                                   |
| -------------------------------------------- | ----------------------------------------- |
| `@rimelight/auth`                            | Runtime `auth` helper and shared types    |
| `@rimelight/auth/types`                      | Public type definitions                   |
| `@rimelight/auth/middleware`                 | Hono middleware that resolves the session |
| `@rimelight/auth/plugin`                     | Vite plugin                               |
| `@rimelight/auth/auth0`                      | Auth0 adapter                             |
| `@rimelight/auth/cf-access`                  | Cloudflare Access adapter                 |
| `@rimelight/auth/mock`                       | Mock adapter for development and tests    |
| `@rimelight/auth/permissions`                | Role and permission matrix                |
| `@rimelight/auth/jwt`                        | JWT verification helpers                  |
| `@rimelight/auth/client`                     | Client-side session access                |
| `@rimelight/auth/client/types`               | Client type definitions                   |
| `@rimelight/auth/plugins/reserved-usernames` | Reserved-username plugin                  |

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/auth test
pnpm --filter @rimelight/auth build
pnpm --filter @rimelight/auth check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

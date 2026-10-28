# @rimelight/security

[![npm](https://img.shields.io/npm/v/@rimelight/security?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/security)
[![downloads](https://img.shields.io/npm/dt/@rimelight/security?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/security)

Web security for Rimelight sites, built for Hono and Solid on Cloudflare Workers. It sets Content Security Policy and security headers, adds subresource integrity (SRI) to built assets, rate-limits requests, verifies Cloudflare Turnstile tokens, publishes `security.txt`, and can gate a site behind a construction-mode passphrase.

## Features

- **Content Security Policy**: builds the CSP header from your config, with a fallback for routes that need one.
- **Subresource integrity**: dual SRI hashes for built scripts and styles, via the Vite plugin.
- **Security headers**: standard response headers set by the middleware.
- **Rate limiting**: per-route rules backed by Cloudflare Rate Limiting bindings.
- **Turnstile**: server-side verification of Cloudflare Turnstile tokens on configured routes.
- **`security.txt`**: generated from your contact details.
- **Construction mode**: holds a site behind a passphrase until it launches. See [Construction mode](#construction-mode).

## Installation

```sh
pnpm add @rimelight/security
```

### Peer dependencies

| Package     | Version       |
| ----------- | ------------- |
| `hono`      | `^5.0.0-rc.1` |
| `vite-plus` | `^1.0.0`      |

## Usage

Add the Vite plugin, then mount the middleware:

```ts
// vite.config.ts
import { security } from "@rimelight/security/plugin";

export default defineConfig({
  plugins: [security({ domain: "example.com" })],
});
```

```ts
// src/fetch.ts
import { security } from "@rimelight/security/middleware";

app.use(security());
```

Mount the security middleware first, so headers and checks apply to every route.

## Construction mode

Construction mode holds a whole site behind a passphrase. It is turned on with environment variables:

| Variable                  | Description                          |
| ------------------------- | ------------------------------------ |
| `CONSTRUCTION_MODE`       | Set to `true` to turn the gate on    |
| `CONSTRUCTION_PASSPHRASE` | The passphrase that unlocks the site |

Visitors get a passphrase form. Passing `?preview=<passphrase>` sets an access cookie and redirects to the same page. Static assets, `robots.txt`, `sitemap*.xml`, and the other files search engines need are always served.

## Exports

| Import                           | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| `@rimelight/security`            | `verifyTurnstile`, `activeConfig`, `buildCspHeader` |
| `@rimelight/security/client`     | Client-side helpers                                 |
| `@rimelight/security/middleware` | Hono middleware                                     |
| `@rimelight/security/plugin`     | Vite plugin                                         |

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/security test
pnpm --filter @rimelight/security build
pnpm --filter @rimelight/security check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

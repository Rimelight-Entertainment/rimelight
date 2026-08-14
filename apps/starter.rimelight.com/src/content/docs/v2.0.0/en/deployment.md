---
title: Deployment
description: Deploying the starter to Cloudflare Workers with Wrangler.
---

The starter is configured to deploy as a **Cloudflare Worker** (server-side rendered) using the `@astrojs/cloudflare` adapter. Astro compiles your project to a Worker bundle, and Wrangler publishes it to Cloudflare's global edge network.

---

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm i -g wrangler`)
- D1 database and KV namespace created (see [Database](/en/docs/database/) and [i18n](/en/docs/i18n/))
- All secrets set in Cloudflare's dashboard or via `wrangler secret put`

---

## Build

```bash
pnpm build
# or from the monorepo root:
vp build
```

This runs `astro build`, which outputs the Worker bundle to `dist/`. The entry point is `src/worker.ts`, which is specified in `wrangler.jsonc`:

```json
{
  "main": "./src/worker.ts"
}
```

---

## Deploy

```bash
npx wrangler deploy
```

Wrangler reads `wrangler.jsonc` in the project root and pushes the bundle, bindings, and routes to Cloudflare.

---

## Custom Domains

The `routes` array in `wrangler.jsonc` maps your Worker to custom domains:

```json
"routes": [
  { "pattern": "my-project.com",     "custom_domain": true },
  { "pattern": "www.my-project.com", "custom_domain": true }
]
```

Set up DNS records in Cloudflare (CNAME to `workers.dev`) before deploying with custom domains.

---

## Environment Variables & Secrets

Cloudflare Workers have two kinds of runtime values:

### `vars` (non-secret, in wrangler.jsonc)

```json
"vars": {
  "CONSTRUCTION_MODE":       "false",
  "CONSTRUCTION_AUTH":       "false",
  "CONSTRUCTION_GUEST_EMAIL": "guest@example.com",
  "EMAIL_DOMAIN":            "example.com",
  "CONTACT_OWNER_EMAIL":     "owner@example.com"
}
```

These are inlined into the Worker bundle and visible in your repository — do not store secrets here.

### Secrets (via Wrangler or the Dashboard)

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put TURNSTILE_SECRET_KEY
```

Secrets are encrypted at rest and injected into the Worker environment at runtime. You can also set them in the **Cloudflare Workers dashboard → Settings → Environment Variables**.

---

## Cloudflare Bindings

All bindings declared in `wrangler.jsonc` are automatically provisioned:

| Binding               | Type           | Notes                                                                |
| --------------------- | -------------- | -------------------------------------------------------------------- |
| `DB`                  | D1             | Primary SQLite database — must have migrations applied before deploy |
| `BLOB`                | R2 Bucket      | Binary asset storage                                                 |
| `<name>_translations` | KV             | Translation blobs — populate after creating the namespace            |
| `ChatRoom`            | Durable Object | WebSocket chat rooms — requires `migrations` entry for class         |
| `MY_RATE_LIMITER`     | Rate Limit     | Native Cloudflare rate limiter                                       |
| `EMAIL`               | Send Email     | Cloudflare Email Workers (configure sender in dashboard)             |
| `ASSETS`              | Static Assets  | Served from `dist/` — handled automatically                          |

---

## CI/CD (GitHub Actions)

A minimal GitHub Actions workflow to deploy on push to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .node-version
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        working-directory: packages/starter.rimelight.com
      - run: npx wrangler deploy
        working-directory: packages/starter.rimelight.com
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Generate your API token in the Cloudflare dashboard under **My Profile → API Tokens** with the **Edit Cloudflare Workers** template.

---

## Cache Strategy

Route-level caching is configured in `astro.config.ts`:

```ts
routeRules: {
  "/api/[...path]": { swr: 600 },   // 10-min stale-while-revalidate for API
  "/[...path]":     { maxAge: 300 } // 5-min cache for all other routes
}
```

This uses Cloudflare's cache layer in front of the Worker. Static assets in `dist/` are served directly from Cloudflare's CDN with long-lived cache headers.

---

## Observability

Worker observability is enabled in `wrangler.jsonc`:

```json
"observability": {
  "enabled": true,
  "logs":   { "enabled": true, "head_sampling_rate": 1, "invocation_logs": true },
  "traces": { "enabled": true }
}
```

Logs and traces are visible in the **Cloudflare Workers dashboard → Observability** tab in real time.

---

## Construction Mode

Set `CONSTRUCTION_MODE=true` in `vars` to show a locked splash page while you're building. Optionally enable `CONSTRUCTION_AUTH=true` to allow a guest login using `CONSTRUCTION_GUEST_EMAIL` for internal preview access.

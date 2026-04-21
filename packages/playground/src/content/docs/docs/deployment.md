---
title: Deployment
description: How to deploy rimelight/playground
---

## Deployment Platform

This website is configured to be deployed on **Cloudflare Pages**.

## Deployment Process

1. **Automatic Deployment**: Any changes pushed to the `main` branch of the monorepo are automatically built and deployed by Cloudflare Pages.
2. **Preview Deployments**: Pull requests and other branches also trigger preview deployments.

## Configuration

The deployment is configured via:
- `astro.config.ts`: Uses the `@astrojs/cloudflare` adapter.
- `wrangler.jsonc`: Cloudflare-specific configurations.

## Manual Build

To build the project locally (from the package directory):

```bash
pnpm run build
```

The output will be in the `dist/` directory.

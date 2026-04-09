---
title: Deployment
description: Deploying Rimelight CMS to production.
---

Rimelight CMS is designed to be deployed alongside your Astro site. This page covers the requirements and configuration for production environments.

## Production Requirements

### 1. Database

The CMS requires a database for content storage.

- **Cloudflare D1:** Ideal for zero-latency access with Cloudflare Pages/Workers.
- **PostgreSQL:** Supported for other environments (e.g., Vercel, Netlify, or self-hosted).

Ensure your production database URL or binding is provided in your environment variables.

### 2. Environment Variables

The following variables are required or recommended for production:

| Variable         | Description                            | Required       |
| :--------------- | :------------------------------------- | :------------- |
| `DATABASE_URL`   | Connection string (if not using D1).   | Yes (Postgres) |
| `AUTH_SECRET`    | Secret key for session encryption.     | Yes            |
| `CRON_SECRET`    | Bearer token for automated publishing. | Recommended    |
| `OPENAI_API_KEY` | For AI features.                       | Optional       |
| `RESEND_API_KEY` | For invitation emails.                 | Optional       |

## Deployment Steps

### Build Command

The CMS code generation happens during the Astro config setup. Standard build commands will work:

```bash
pnpm build
```

### Database Migrations

Rimelight CMS handles schema synchronization automatically in development. For production, it is recommended to use the generated schemas in `src/cms/.generated/schema.ts` with your preferred migration tool (e.g., `drizzle-kit`).

## CI/CD Tips

- **Caching:** Cache the `src/cms/.generated` directory to speed up builds (though it is fast to re-generate).
- **Secrets:** Ensure all secrets are populated in your deployment platform's dashboard.

---
title: Getting Started
description: How to clone, configure, and run the Rimelight Starter template locally and on Cloudflare.
---

This guide walks you through getting a fresh copy of the Rimelight Starter up and running — from cloning the repository to your first local dev server.

## Prerequisites

| Requirement        | Version                          |
| ------------------ | -------------------------------- |
| Node.js            | ≥ 22 (see `.node-version`)       |
| pnpm               | ≥ 10                             |
| Wrangler CLI       | ≥ 4 (`npm i -g wrangler`)        |
| Cloudflare account | Free tier is sufficient to start |

---

## 1. Clone or Use as Template

If you are working inside the Rimelight monorepo, the starter already lives at `packages/starter.rimelight.com/`. If you are creating a standalone project from this template, clone the repository and copy the package out:

```bash
git clone https://github.com/Rimelight-Entertainment/rimelight.git
cp -r rimelight/packages/starter.rimelight.com my-project
cd my-project
```

> If you only need the starter, you can also use `degit` to pull just the package folder without the full monorepo history:
>
> ```bash
> npx degit Rimelight-Entertainment/rimelight/packages/starter.rimelight.com my-project
> cd my-project
> ```

---

## 2. Install Dependencies

The project uses `pnpm` as its package manager:

```bash
pnpm install
```

If you are inside the monorepo, run `pnpm install` from the root instead — workspace packages are linked automatically.

---

## 3. Configure Environment Variables

Copy the example environment file and fill in your secrets:

```bash
cp .env.example .env
```

Open `.env` and set the required values:

```dotenv
# Better Auth secret — generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:4321

# Cloudflare Turnstile (contact form bot protection)
TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Drizzle (used by drizzle-kit for studio/migrations)
DATABASE_URL=.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite
```

> The `DATABASE_URL` for local development is auto-created by Wrangler when you first run migrations. You can leave it blank until after step 5.

---

## 4. Rename Cloudflare Resources

The `wrangler.jsonc` file ships with names tied to the `starter.rimelight.com` domain. Before deploying to your own account, find-and-replace `starter-dot-rimelight-dot-com` with a slug that matches your project name:

```jsonc
// wrangler.jsonc
{
  "name": "my-project",
  "d1_databases": [{ "binding": "DB", "database_name": "my-project_db", ... }],
  "kv_namespaces": [{ "binding": "my-project_translations", ... }]
}
```

---

## 5. Set Up the D1 Database

Create a Cloudflare D1 database for your project:

```bash
npx wrangler d1 create my-project_db
```

Copy the output `database_id` into `wrangler.jsonc`, then apply migrations:

```bash
# Apply locally (creates .wrangler/state/... SQLite file)
npx wrangler d1 migrations apply my-project_db --local

# Apply to production
npx wrangler d1 migrations apply my-project_db --remote
```

---

## 6. Create the KV Namespace for Translations

The i18n integration stores translations in a Cloudflare KV namespace for live edge delivery:

```bash
npx wrangler kv namespace create my-project_translations
```

Paste the returned `id` into the `kv_namespaces` entry in `wrangler.jsonc`.

---

## 7. Start the Dev Server

```bash
pnpm dev
# or, from the monorepo root:
vp dev
```

The site will be available at **http://localhost:4321**. Wrangler's local simulator handles D1, KV, and R2 bindings so you get a near-production environment on your laptop.

---

## 8. Customise the Site Config

Open `src/config/site.config.ts` and update the metadata for your project:

```ts
export const siteConfig: SiteConfig = {
  id: "my-project",
  name: "My Project",
  description: "My project description.",
  url: "https://my-project.com"
  // ...
}
```

This config is consumed by layouts and the open graph image generator.

---

## Next Steps

- Add your brand logos to `src/assets/logos/` (SVG files)
- Configure supported locales in `src/config/i18n.config.ts` and `astro.config.ts`
- Set `CONSTRUCTION_MODE=true` in `wrangler.jsonc > vars` to put the site behind a locked-down splash page during development

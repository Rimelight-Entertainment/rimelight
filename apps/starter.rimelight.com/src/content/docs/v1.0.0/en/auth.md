---
title: Authentication
description: User auth with Better Auth — email/password, sessions, roles, and organizations.
---

Authentication in the starter is powered by [Better Auth](https://better-auth.com), a type-safe, full-stack auth library. The setup lives entirely in `src/auth/` and integrates with the Cloudflare D1 database via Drizzle ORM.

---

## Architecture

```
src/auth/
├── auth.ts                 # Main Better Auth server instance
├── auth-client.ts          # Browser-side auth client
├── permissions.ts          # Role-based access control (RBAC) statements
├── restricted-usernames.ts # Blocked username list
├── construction-guest.ts   # Guest session logic (construction mode)
└── email/                  # Email templates (verification, reset)
```

The server instance is initialised once and exported from `src/auth/auth.ts`. On Cloudflare Workers, each isolate that handles a request imports the same module, so the instance is effectively per-isolate.

---

## Features Enabled

| Feature                            | Status             |
| ---------------------------------- | ------------------ |
| Email + password sign-up / sign-in | ✅ Enabled         |
| Email verification on sign-up      | ✅ Required        |
| Auto sign-in after registration    | ✅ Enabled         |
| Password length (8–128 chars)      | ✅ Enforced        |
| Change email                       | ✅ Enabled         |
| Delete account                     | ✅ Enabled         |
| Session cookie cache (5 min)       | ✅ Enabled         |
| Rate limiting (100 req / 10 sec)   | ✅ Database-backed |
| Admin plugin                       | ✅ Enabled         |
| Organizations + Teams              | ✅ Enabled         |

---

## User Schema Extensions

The default Better Auth user is extended with custom fields:

| Field          | Type     | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `tag`          | `string` | 4-digit discriminator (e.g. `#4827`), auto-generated |
| `firstName`    | `string` | First name, required at sign-up                      |
| `lastName`     | `string` | Last name, required at sign-up                       |
| `role`         | `string` | Global role — `"user"` by default                    |
| `availability` | `string` | Presence status — `"available"` by default           |
| `status`       | `string` | User-set status message                              |
| `publicKey`    | `string` | Optional public key for E2E encrypted features       |

### Discriminator Tag Generation

When a user registers, a database hook runs before the record is inserted to:

1. Check the username against the `RESTRICTED_SET` (a normalised list of reserved names).
2. Generate a unique 4-digit `tag` for the `username#tag` combination (up to 50 attempts before failing).

This means two users named `Alex` can coexist as `Alex#2341` and `Alex#9102`.

---

## Sessions

Sessions are configured with the following defaults:

```ts
session: {
  expiresIn:   60 * 60 * 24 * 7, // 7 days
  updateAge:   60 * 60 * 24,      // refresh after 1 day of activity
  freshAge:    60 * 15,           // "fresh" within 15 minutes
  cookieCache: { enabled: true, maxAge: 60 * 5 } // 5-minute cookie cache
}
```

The cookie cache means that on subsequent requests within 5 minutes, session validation is served from the cookie itself rather than hitting the database, reducing D1 round-trips on hot paths.

---

## Role-Based Access Control (RBAC)

Permissions are defined in `src/auth/permissions.ts` using Better Auth's `createAccessControl`. Four roles exist:

| Role     | Scope                                            |
| -------- | ------------------------------------------------ |
| `owner`  | Full control — create/edit/delete everything     |
| `admin`  | Manage teams, members, projects, assets, content |
| `member` | Manage projects and assets within their org      |
| `user`   | No organizational permissions                    |

The permission statements extend Better Auth's built-in defaults with custom resources:

```ts
const statement = {
  ...defaultStatements,
  project: ["create", "edit", "delete"],
  asset: ["view", "create", "edit", "delete"],
  blogPost: ["create", "edit", "review", "delete"],
  legal: ["create", "edit", "review", "delete"]
}
```

---

## Organizations & Teams

The `organization` plugin is enabled with `teams: { enabled: true }`. This adds:

- `Organization` model with slug, logo, metadata
- `Member` join table (user ↔ organization with a role)
- `Team` sub-grouping within an organization
- `Invitation` model for email-based org invites

---

## Browser Client

`src/auth/auth-client.ts` exports the Better Auth client for use in Vue components and browser scripts:

```ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: import.meta.env.BETTER_AUTH_URL
})
```

Use it in Vue components to sign in, sign out, or read the current session:

```ts
const { data: session } = await authClient.getSession()
await authClient.signIn.email({ email, password })
await authClient.signOut()
```

---

## Auth Pages

The auth pages live at `src/pages/[locale]/auth/`:

| Route                     | File             | Description                                            |
| ------------------------- | ---------------- | ------------------------------------------------------ |
| `/[locale]/auth/sign-in`  | `sign-in.astro`  | Email + password sign-in form                          |
| `/[locale]/auth/sign-up`  | `sign-up.astro`  | Registration form (first/last name + email + password) |
| `/[locale]/auth/sign-out` | `sign-out.astro` | Signs out and redirects to `/`                         |

---

## Environment Variables

```dotenv
BETTER_AUTH_SECRET=<random 32-byte hex>
BETTER_AUTH_URL=http://localhost:4321
```

In production, set `BETTER_AUTH_URL` to your canonical site URL (e.g. `https://my-project.com`) via the Cloudflare Workers dashboard or `wrangler secret put`.

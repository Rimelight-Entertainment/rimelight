# RFC-0006: Universal Authentication Layer & Multi-Provider Adapters in `@rimelight/auth`

- **Status**: **Draft**
- **Author(s)**: Idan T. / Antigravity
- **Created**: 2026-08-25
- **Last Updated**: 2026-08-25
- **Discussion/PR**: N/A

---

## 1. Summary

This RFC proposes refactoring **`@rimelight/auth`** from being exclusively a Better-Auth configuration wrapper into the **Universal Authentication & Identity Contract Layer** for the entire Rimelight monorepo.

Under this architecture, `@rimelight/auth` defines the shared session contracts, permission evaluators, and a pluggable collection of tree-shakeable **Auth Adapters** (**Cloudflare Access**, **Auth0 / OIDC**, **Better-Auth**, and **Custom / Dev Mock**). Downstream packages like `@rimelight/cms`, `@rimelight/email`, and consumer applications (`idantity.me`, `rimelight.com`) consume this unified contract without binding themselves to any specific auth provider or database schema.

---

## 2. Motivation

Currently, `@rimelight/auth` is tightly coupled to `better-auth` and `@better-auth/drizzle-adapter`. While Better-Auth is powerful for self-hosted apps with local database tables, modern Rimelight projects have diverging authentication needs:

1. **Lightweight & Personal Sites (`idantity.me`)**: Use Cloudflare Access (Zero Trust) header-based authentication to gate admin tools (CMS, Email, Dashboard) with **zero database user tables** and zero runtime dependency on Better-Auth.
2. **Enterprise & Scaled Platforms (`rimelight.com`)**: May migrate to **Auth0**, **Clerk**, or corporate **OIDC/SAML** providers to manage large-scale user identity, social logins, and enterprise compliance.
3. **Ecosystem Package Reusability**: Modular integrations like `@rimelight/cms` (RFC-0004) and `@rimelight/email` (RFC-0005) require a single, agnostic way to verify user sessions without baking vendor-specific auth logic into their cores.

---

## 3. Detailed Design

### 3.1. Unified Identity Contracts

`@rimelight/auth` exports the fundamental types consumed by all apps, integrations, and middlewares:

```typescript
// packages/auth/src/types.ts

export interface UserSessionContext {
  userId: string
  roles: string[]
  permissions: string[]
  email?: string
  name?: string
  avatar?: string
  metadata?: Record<string, any>
}

export interface AuthAdapter {
  name: string
  /**
   * Resolves the authenticated session from an incoming Request
   * Returns null if unauthenticated
   */
  getSession(request: Request): Promise<UserSessionContext | null>

  /**
   * Optional hook for handling unauthorized page loads
   */
  handleUnauthorized?: (request: Request) => Response | Promise<Response>
}
```

---

### 3.2. Pluggable Auth Adapters

`@rimelight/auth` provides distinct, tree-shakeable adapters under subpath exports:

```
@rimelight/auth
├── / (Core contracts, types, permissions)
├── /cf-access (Cloudflare Access Zero Trust adapter)
├── /auth0 (Auth0 / OIDC JWT adapter)
├── /better-auth (Better-Auth wrapper & adapter)
├── /mock (Dev / Testing mock adapter)
└── /permissions (RBAC evaluation utilities)
```

#### 1. Cloudflare Access Adapter (`@rimelight/auth/cf-access`)

Designed for edge workers and apps with zero local database auth requirements (`idantity.me`):

```typescript
// packages/auth/src/adapters/cf-access.ts
import type { AuthAdapter, UserSessionContext } from "../types"

export interface CfAccessAdapterOptions {
  aud?: string
  teamDomain?: string
  defaultRole?: string
  adminEmails?: string[]
}

export function cfAccessAuth(options: CfAccessAdapterOptions = {}): AuthAdapter {
  return {
    name: "cf-access",
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const email = req.headers.get("cf-access-authenticated-user-email")
      const jwt = req.headers.get("cf-access-jwt-assertion")

      if (!email && !jwt) return null

      const userEmail = email?.toLowerCase() || "cf-access-user"
      const isAdmin = options.adminEmails ? options.adminEmails.includes(userEmail) : true

      return {
        userId: userEmail,
        email: userEmail,
        roles: isAdmin ? [options.defaultRole || "admin"] : ["viewer"],
        permissions: isAdmin ? ["*"] : []
      }
    }
  }
}
```

#### 2. Better-Auth Adapter (`@rimelight/auth/better-auth`)

Bridges the existing self-hosted Better-Auth setup for full-stack apps:

```typescript
// packages/auth/src/adapters/better-auth.ts
import type { AuthAdapter, UserSessionContext } from "../types"

export function betterAuthAdapter(authClientOrServer: any): AuthAdapter {
  return {
    name: "better-auth",
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const session = await authClientOrServer.api.getSession({ headers: req.headers })
      if (!session?.user) return null

      return {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        roles: session.user.role ? [session.user.role] : ["user"],
        permissions: session.user.permissions || []
      }
    }
  }
}
```

#### 3. Auth0 / OIDC Adapter (`@rimelight/auth/auth0`)

For enterprise identity federation:

```typescript
// packages/auth/src/adapters/auth0.ts
import type { AuthAdapter, UserSessionContext } from "../types"

export interface Auth0AdapterOptions {
  domain: string
  audience: string
  rolesClaim?: string
}

export function auth0Auth(options: Auth0AdapterOptions): AuthAdapter {
  return {
    name: "auth0",
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const authHeader = req.headers.get("authorization")
      if (!authHeader?.startsWith("Bearer ")) return null

      const token = authHeader.slice(7)
      // Verify JWT against JWKS endpoint
      const payload = await verifyAuth0Jwt(token, options)
      if (!payload) return null

      return {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload[options.rolesClaim || "https://rimelight.com/roles"] || ["user"],
        permissions: payload.permissions || []
      }
    }
  }
}
```

---

### 3.3. Monorepo Usage Examples

#### Example 1: `idantity.me` (`astro.config.mjs`)

Shared Cloudflare Access adapter gating both CMS and Email integrations:

```typescript
import { defineConfig } from "astro/config"
import { rimelightCms } from "@rimelight/cms"
import { rimelightEmail } from "@rimelight/email"
import { cfAccessAuth } from "@rimelight/auth/cf-access"

const auth = cfAccessAuth({
  teamDomain: "idantity.cloudflareaccess.com",
  adminEmails: ["daniel@idantity.me"]
})

export default defineConfig({
  integrations: [rimelightCms({ auth }), rimelightEmail({ auth })]
})
```

#### Example 2: `rimelight.com` with Auth0

```typescript
import { defineConfig } from "astro/config"
import { rimelightCms } from "@rimelight/cms"
import { auth0Auth } from "@rimelight/auth/auth0"

const auth = auth0Auth({
  domain: process.env.AUTH0_DOMAIN!,
  audience: process.env.AUTH0_AUDIENCE!
})

export default defineConfig({
  integrations: [rimelightCms({ auth })]
})
```

---

### 3.4. Package Dependencies & Tree-Shaking

To prevent projects using `cf-access` from pulling in `better-auth` or database drivers, `package.json` designates provider dependencies as optional peer dependencies:

```jsonc
// packages/auth/package.json
{
  "name": "@rimelight/auth",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./cf-access": "./src/adapters/cf-access.ts",
    "./auth0": "./src/adapters/auth0.ts",
    "./better-auth": "./src/adapters/better-auth.ts",
    "./mock": "./src/adapters/mock.ts",
    "./permissions": "./src/permissions/index.ts"
  },
  "peerDependencies": {
    "better-auth": ">=1.0.0",
    "drizzle-orm": ">=0.30.0"
  },
  "peerDependenciesMeta": {
    "better-auth": { "optional": true },
    "drizzle-orm": { "optional": true }
  }
}
```

---

## 4. Drawbacks & Trade-offs

- **Adapter Normalization**: Different providers structure role claims and user metadata differently (e.g. Auth0 namespaces vs. Better-Auth user table columns). The adapter must map provider payloads accurately to `UserSessionContext`.
- **Edge Compatibility**: Adapters must strictly adhere to web-standard APIs (`Request`, Web Crypto, Fetch) to run without friction inside Cloudflare Workers.

---

## 5. Alternatives Considered

1. **Keep Adapters inside `@rimelight/cms` & `@rimelight/email` individually**:
   - _Rejected_: Duplicates auth parsing logic, creates incompatible session schemas across packages, and clutters content/email packages with identity provider code.
2. **Single Monolithic `@rimelight/auth` bundle**:
   - _Rejected_: Bundling Better-Auth, Auth0 SDKs, and Jose JWT parsers into a single entry would drastically inflate bundle size on edge workers that only need lightweight header validation.

---

## 6. Adoption & Migration Strategy

1. **Phase 1 (`@rimelight/auth`)**:
   - Refactor `packages/auth` with subpath exports (`/cf-access`, `/better-auth`, `/auth0`, `/permissions`).
   - Move current Better-Auth factory and plugins under `./better-auth` subpath.
2. **Phase 2 (`@rimelight/cms` & `@rimelight/email`)**:
   - Update integration options to accept `AuthAdapter` from `@rimelight/auth`.
3. **Phase 3 (Apps)**:
   - `idantity.me`: Import `cfAccessAuth` from `@rimelight/auth/cf-access`.
   - `starter.rimelight.com`: Import `betterAuthAdapter` from `@rimelight/auth/better-auth`.
   - `rimelight.com`: Migrate to `auth0Auth` when transitioning identity providers.

---

## 7. Verification & Testing Plan

### 7.1. Automated Tests

- Unit tests verifying header parsing and role assignment across all adapters.
- Integration tests ensuring subpath imports only bundle intended provider modules (tree-shaking verification).

### 7.2. Manual Verification

- Test `idantity.me` under Cloudflare Access simulation.
- Verify `starter.rimelight.com` authentication lifecycle remains completely intact.

# @rimelight/config

Shared configuration package for Rimelight Entertainment projects.

## Installation

```bash
pnpm add -D @rimelight/config
```

## TypeScript Configs

### Base Config

Default strict TypeScript configuration for all Rimelight projects:

```json
{
  "extends": "@rimelight/config/tsconfig/base"
}
```

### SolidJS Config

For Solid Start projects (adds Solid JSX support):

```json
{
  "extends": "@rimelight/config/tsconfig/solid"
}
```

## Vite+ Configs

### App / Standard Config

```typescript
import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig()
  // your custom config
})
```

### Package Config (with Auto-Entry Discovery)

For library / workspace packages:

```typescript
import { defineConfig } from "vite-plus"
import { rimelightPackConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig(
  rimelightPackConfig({
    // Automatically discovers all entry modules in src/ (ignoring tests and .d.ts)
    autoEntry: true
  })
)
```

## Solid Configs

Zero-boilerplate site derivation for Solid Start projects. Automatically derives `site`
and `imageDomains` from `domain`, plus ready-to-use `securityOptions` (domain + `imgSrc`)
for both the `security()` Vite plugin and the `security()` Hono middleware:

```typescript
import { rimelightSolidConfig } from "@rimelight/config/solid"

const site = rimelightSolidConfig({
  // Automatically derives site: "https://example.com",
  // imageDomains: ["example.com", "cdn.example.com", "cdn.rimelight.com"],
  // and securityOptions: { domain, imgSrc: ["https://example.com", ...] }
  domain: "example.com"
})
```

```typescript
// vite.config.ts
import { security } from "@rimelight/security/plugin"

security(site.securityOptions ?? {})
```

```typescript
// fetch.ts / worker entry
import { security } from "@rimelight/security/middleware"

app.use(security(site.securityOptions ?? {}))
```

Granular / composable pieces (`resolveImageDomains`, `resolveSecurityOptions`) are exported
from the same module. Declaring a `domain` is enough — `security` is opt-**out**, so you never
have to re-declare `domain` (and cannot accidentally produce a CSP that blocks your own CDN).
Pass `security: { imgSrc: [...] }` to merge extra origins, or `security: false` to omit
`securityOptions` entirely.

## Drizzle Configs

Zero-boilerplate Drizzle Kit configuration with standard defaults (`sqlite` dialect, `./drizzle` out directory, `./src/db/schema/index.ts` schema):

```typescript
import { rimelightDrizzleConfig } from "@rimelight/config/drizzle"

export default rimelightDrizzleConfig()
```

Custom / overridden options:

```typescript
import { rimelightDrizzleConfig } from "@rimelight/config/drizzle"

export default rimelightDrizzleConfig({
  schema: "./src/db/schema.ts",
  tablesFilter: ["custom_*"]
})
```

## Config Details

### TypeScript Base Config

- Target: ESNext
- Module: ESNext
- Strict mode enabled
- DOM and Node types
- Solid JSX support
- No emission (for Vite projects)
- All strict checks enabled by default

### Vite+ Base Config

- Type-aware linting
- Type checking
- Consistent formatting rules
- No trailing commas
- No semicolons
- Consistent quote props

## Usage in Rimelight Monorepo

Internal packages should reference the config via workspace:

```json
{
  "devDependencies": {
    "@rimelight/config": "workspace:*"
  }
}
```

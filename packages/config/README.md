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

### Package Config

For library / workspace packages, spread `rimelightConfig()` and declare the pack entry points yourself. `vp pack` accepts globs:

```typescript
import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  pack: {
    // Discovers every module in src/ as a build entry
    entry: ["src/**/*.ts"],
    dts: true
  }
})
```

Packages that only publish a subset of `src/` can list those paths explicitly instead of using a glob.

## Drizzle Configs

This package does not ship a Drizzle preset. Each project declares its own `drizzle.config.ts` so the schema path and dialect are visible in the repo rather than inherited from a published default.

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

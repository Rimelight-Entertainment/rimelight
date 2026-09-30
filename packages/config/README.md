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

## Usage in Rimelight Monorepo

Internal packages should reference the config via workspace:

```json
{
  "devDependencies": {
    "@rimelight/config": "workspace:*"
  }
}
```

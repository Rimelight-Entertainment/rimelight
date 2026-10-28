# @rimelight/config

[![npm](https://img.shields.io/npm/v/@rimelight/config?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/config)
[![downloads](https://img.shields.io/npm/dt/@rimelight/config?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/config)

Shared configuration for Rimelight projects. It provides the strict TypeScript base config used across the monorepo and the Solid variant for Solid projects.

## Features

- **Strict base config**: the default TypeScript settings for every Rimelight project.
- **Solid config**: the base config plus Solid JSX support.

## Installation

```sh
pnpm add -D @rimelight/config
```

### Peer dependencies

| Package     | Version  |
| ----------- | -------- |
| `vite-plus` | `^1.0.0` |

## Usage

Extend the base config in your `tsconfig.json`:

```json
{
  "extends": "@rimelight/config/tsconfig/base"
}
```

For Solid projects, extend the Solid config instead:

```json
{
  "extends": "@rimelight/config/tsconfig/solid"
}
```

Inside the monorepo, reference the config through the workspace:

```json
{
  "devDependencies": {
    "@rimelight/config": "workspace:*"
  }
}
```

## Exports

| Import                             | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `@rimelight/config/tsconfig/base`  | Strict TypeScript base config      |
| `@rimelight/config/tsconfig/solid` | Base config with Solid JSX support |

## Development

This package lives in the [Rimelight monorepo](../../README.md). It has no build step. From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/config test
pnpm --filter @rimelight/config check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

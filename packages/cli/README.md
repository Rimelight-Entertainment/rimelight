# @rimelight/cli

[![npm](https://img.shields.io/npm/v/@rimelight/cli?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cli)
[![downloads](https://img.shields.io/npm/dt/@rimelight/cli?style=flat-square&logo=npm)](https://www.npmjs.com/package/@rimelight/cli)

The command line interface for Rimelight projects. It creates new websites from the Rimelight starter template, and compares or updates existing projects against that template.

## Features

- **`create`**: scaffolds a new Solid 2.0 site on Cloudflare Workers from the starter template, with the domain, Git, and install options you choose.
- **`compare`**: shows how a project differs from the current starter template.
- **`update`**: applies starter-template changes to an existing project.

## Installation

Run it without installing:

```sh
pnpm dlx @rimelight/cli create my-site
```

Or install it globally:

```sh
pnpm add -g @rimelight/cli
```

### Peer dependencies

| Package     | Version  |
| ----------- | -------- |
| `vite-plus` | `^1.0.0` |

## Usage

```sh
# Create a new site
rimelight create my-site --domain my-site.com

# Compare an existing project with the starter template
rimelight compare ./my-site

# Apply starter-template updates to an existing project
rimelight update ./my-site
```

Running `rimelight my-site` without a command is the same as `rimelight create my-site`.

### Options

| Flag                       | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `-d, --domain <domain>`    | Website domain, for example `example.com`                |
| `-g, --git`                | Initialize a Git repository (default: auto)              |
| `-i, --install`            | Install dependencies automatically (default: auto)       |
| `--package-manager <name>` | Force a package manager: `npm`, `pnpm`, `yarn`, or `bun` |
| `-h, --help`               | Show help                                                |
| `-v, --version`            | Show the CLI version                                     |

## Exports

| Import                   | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `@rimelight/cli`         | Programmatic access to the create, compare, and update functions |
| `@rimelight/cli/prompts` | Interactive prompts used by the CLI                              |
| `@rimelight/cli/cli`     | The command entry point                                          |

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/cli test
pnpm --filter @rimelight/cli build
pnpm --filter @rimelight/cli check
```

## Contributing

Open an issue or pull request in the [monorepo](https://github.com/Rimelight-Entertainment/rimelight). Run `check` and `test` before submitting.

## License

MIT. See [LICENSE](../../LICENSE).

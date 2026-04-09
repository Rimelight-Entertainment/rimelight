---
title: Contribution Guide
description: How to contribute to the Rimelight monorepo — from setup to pull requests.
---

This guide walks you through the process of contributing to Rimelight. Whether you're fixing a typo or adding a new component family, the workflow is the same.

## Repository Setup

Rimelight is a **pnpm monorepo** with apps in `apps/*` and shared packages in `packages/*`:

```
rimelight/
├── apps/
│   ├── starter/      # Base Astro + Cloudflare template
│   ├── docs/         # This documentation site
│   └── rimelight.com # Main website
└── packages/
    ├── ui/           # Shared UI component library
    ├── cli/          # CLI tools
    └── cms/          # CMS integration
```

### First-Time Setup

```bash
pnpm install
```

This installs all dependencies and links workspace packages automatically.

## Development Workflow

### Running an App

```bash
# Run the docs site
pnpm --filter @rimelight/docs dev

# Run the starter app
pnpm --filter @rimelight/starter dev
```

### Running Commands Across the Monorepo

```bash
# Build everything
pnpm -r build

# Run checks across all packages
pnpm -r check
```

## Making Changes

### 1. Pick an Area

- **Bug fixes** — look for open issues or file one yourself
- **Features** — discuss the approach in a GitHub issue first
- **Documentation** — typos, clarifications, and new guides are always welcome

### 2. Create a Branch

```bash
git checkout -b <short-description>
```

Use a descriptive branch name like `fix/button-hover-color` or `docs/contribution-guide`.

### 3. Make Your Changes

Follow the existing patterns in the codebase:

- Match the code style (the project has linting configured)
- Add tests where applicable
- Update documentation if behavior changes

### 4. Verify

```bash
# Type check
pnpm --filter <package> check

# Build
pnpm --filter <package> build
```

### 5. Open a Pull Request

Push your branch and open a PR against `main`. Include:

- A clear description of **what** changed and **why**
- Screenshots for visual changes
- Links to any related issues

## Component Development

If you're adding a component to `@rimelight/ui`, see the [UI Component Architecture](/rimelight-ui/ui-component-architecture/) guide for the full pattern. The short version:

1. Create the theme file in `packages/ui/src/themes/`
2. Register it in `packages/ui/src/themes/index.ts`
3. Create both `RLA<Component>.astro` and `RLV<Component>.vue`
4. Export via `package.json` subpath

## Commit Messages

Use conventional commit format:

```
type(scope): description

feat(ui): add RLASelect component
fix(starter): resolve hydration mismatch
docs: update getting started guide
```

## Questions?

If you're unsure about something, ask in a GitHub issue or discussion. No contribution is too small.

# Rimelight Documentation

This is the documentation site for Rimelight, built with [Starlight](https://starlight.astro.build/) and [Astro](https://astro.build/).

## Getting Started

From the monorepo root:

```bash
pnpm install
pnpm --filter @rimelight/docs dev
```

## Building

```bash
pnpm --filter @rimelight/docs build
```

## Structure

- `src/content/docs/` - Documentation pages in Markdown
- `astro.config.mjs` - Starlight configuration
- `src/content.config.ts` - Content collections setup

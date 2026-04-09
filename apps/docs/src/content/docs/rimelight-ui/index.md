---
title: Rimelight UI
description: Overview of the @rimelight/ui component library — dual Astro/Vue families, shared theming, and the ui prop pattern.
---

`@rimelight/ui` is the core component library behind every Rimelight app. It ships **two parallel component families** that share the same theme configuration, the same styling pipeline, and the same `ui` prop API.

## Component Families

| Prefix  | Runtime | File extension | Example           |
| ------- | ------- | -------------- | ----------------- |
| **RLA** | Astro   | `.astro`       | `RLAButton.astro` |
| **RLV** | Vue     | `.vue`         | `RLVButton.vue`   |

Both families import the same theme files and resolve classes through **css-variants** (`cv`) + **tailwind-merge**. Change a theme once and both families update.

## Key Concepts

### Shared Theme System

Every component's styles derive from a shared theme config in `themes/<component>.theme.ts`. This means:

- One source of truth for all visual variants
- Types stay in sync automatically via indexed access types
- Zero duplication between Astro and Vue components

### The `ui` Prop Pattern

Inspired by Nuxt UI, every component accepts an optional `ui` prop for per-instance style overrides:

```astro
<RLAButton ui={{ base: 'font-bold rounded-full' }}>Bold</RLAButton>
```

The `ui` prop merges with the global theme via `defu` (first argument wins), giving you three levels of customization:

1. **Per-instance** — `ui` prop on the component
2. **Global** — configured via the `ui()` Astro integration
3. **Default** — the shared theme file

### Global Configuration

The Astro integration exposes a virtual module (`virtual:rimelight-ui`) that provides `getUIConfig()`. Configure defaults for all components in your `astro.config.mjs`:

```js
import { ui } from "@rimelight/ui/integrations"

export default defineConfig({
  integrations: [
    ui({
      ui: {
        button: {
          defaultVariants: { variant: "primary" }
        }
      }
    })
  ]
})
```

## What's Next

- **[UI Component Architecture](/rimelight-ui/ui-component-architecture/)** — Deep dive into the internals: the styling pipeline, config merge, and how to add new components
- **[Components](/rimelight-ui/components/)** — Full component reference with props and examples

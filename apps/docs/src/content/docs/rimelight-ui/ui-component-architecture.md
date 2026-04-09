---
title: UI Component Architecture
description: How @rimelight/ui components work — the ui prop pattern, shared themes, and dual Astro/Vue rendering.
---

The `@rimelight/ui` package is a component library that ships **two parallel component families**:

- **RLA** — Rimelight Astro components (`.astro`)
- **RLV** — Rimelight Vue components (`.vue`)

Both families share the same theme configuration, the same styling pipeline, and the same `ui` prop API. This guide explains how that architecture works, using the Button component as the reference implementation.

## Package Structure

```
packages/ui/src/
├── components/
│   ├── astro/          # RLA* — Astro island components
│   │   └── RLAButton.astro
│   ├── vue/            # RLV* — Vue island components
│   │   └── RLVButton.vue
│   └── button/         # Legacy base components
│       └── Button.astro
├── composables/
│   └── useComponentUI.ts   # Vue composable for reactive ui merge
├── integrations/
│   └── ui.ts               # Astro integration (virtual module)
├── themes/
│   ├── index.ts            # defaultUIConfig export
│   └── button.theme.ts     # Shared button theme
└── env.d.ts            # virtual:rimelight-ui type declaration
```

## The Shared Theme System

All components derive their styles from a shared theme config. For Button, this lives in `themes/button.theme.ts`:

```ts
export const buttonTheme = {
  base: [
    "inline-flex items-center justify-center gap-4xs rounded-md font-medium",
    "transition-all outline-none focus-visible:ring-3",
    "disabled:pointer-events-none disabled:op-50"
  ],
  variants: {
    variant: {
      default: "bg-foreground text-background hover:bg-foreground/90",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "bg-background hover:bg-muted hover:text-foreground"
      // ...
    },
    size: {
      xs: "px-xs py-2xs text-xs",
      sm: "px-sm py-3xs text-sm",
      md: "px-md py-2xs text-md"
      // ...
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
} as const
```

Both `RLAButton` (Astro) and `RLVButton` (Vue) import this same file. Change the theme once, and both component families update.

## The Styling Pipeline

Each component uses **css-variants** (`cv`) with **tailwind-merge** for conflict resolution:

```ts
import { cv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"

const button = cv({
  ...buttonTheme,
  classNameResolver: (...args) => twMerge(cx(...args))
})
```

The `cv()` function returns a resolver that:

1. Collects base classes from `buttonTheme.base`
2. Adds variant classes based on `variant` and `size` props
3. Merges in any `className` override (from the `ui` prop)
4. Runs everything through `twMerge` to resolve conflicts

The result is a single class string.

## The `ui` Prop Pattern

This is the Nuxt UI-inspired pattern that lets consumers override styles on a per-instance basis.

### How it works

Every component accepts an optional `ui` prop:

```astro
<RLAButton variant="primary" ui={{ base: 'font-bold rounded-full' }}>
  Click me
</RLAButton>
```

The `ui` prop is merged with the global theme config via `defu` (deep merge, first argument wins):

```
ui prop (highest priority)
    ↓
global config (from Astro integration)
    ↓
shared theme (button.theme.ts)
    ↓
final classes
```

### Using the `ui` prop

Override any part of the base class string:

```astro
<!-- Bold text with rounded corners -->
<RLAButton ui={{ base: 'font-bold rounded-full' }}>Bold</RLAButton>

<!-- Add a glow effect -->
<RLAButton ui={{ base: 'ring-4 ring-primary/50 shadow-xl' }}>Glowing</RLAButton>

<!-- Combine with external class prop -->
<RLAButton ui={{ base: 'animate-pulse' }} class="px-12">Pulse</RLAButton>
```

### For multi-slot components

Components with multiple slots (built with `scv`) would have a `ui` prop with keys per slot:

```astro
<Card ui={{ root: '...', header: '...', footer: '...' }}>
```

## Global Configuration

The Astro integration exposes a virtual module (`virtual:rimelight-ui`) that provides `getUIConfig()`. Components import this to access the merged global config.

Configure it in your `astro.config.mjs`:

```js
import { ui } from "@rimelight/ui/integrations"

export default defineConfig({
  integrations: [
    ui({
      ui: {
        button: {
          // Change the default variant for ALL buttons
          defaultVariants: { variant: "primary" }
        }
      }
    })
  ]
})
```

## RLAButton (Astro)

```astro
---
import RLAButton from '@rimelight/ui/components/astro/RLAButton.astro'
---

<RLAButton variant="primary" size="lg">Primary Large</RLAButton>
<RLAButton variant="outline" href="/about">Outline Link</RLAButton>
```

### Props

| Prop      | Type                | Default     | Description                 |
| --------- | ------------------- | ----------- | --------------------------- |
| `variant` | `string`            | `'default'` | Button style variant        |
| `size`    | `string`            | `'md'`      | Button size                 |
| `ui`      | `{ base?: string }` | `undefined` | Per-instance class override |
| `class`   | `string`            | `undefined` | Additional external classes |
| `href`    | `string`            | `undefined` | When set, renders as `<a>`  |

## RLVButton (Vue)

```astro
---
import RLVButton from '@rimelight/ui/components/vue/RLVButton.vue'
---

<RLVButton client:load variant="primary" size="lg">Primary Large</RLVButton>
```

> **Important:** In `.astro` files, always use Astro's `{}` expression syntax for object props — **not** Vue's `:prop` shorthand. The Vue `:` prefix only works inside `.vue` files.

```astro
<!-- ✅ Correct in .astro files -->
<RLVButton client:load ui={{ base: 'font-bold' }}>Bold</RLVButton>

<!-- ❌ Wrong — Vue syntax, doesn't work in .astro -->
<RLVButton client:load :ui="{ base: 'font-bold' }">Bold</RLVButton>
```

### Props

| Prop      | Type                | Default     | Description                 |
| --------- | ------------------- | ----------- | --------------------------- |
| `variant` | `string`            | `'default'` | Button style variant        |
| `size`    | `string`            | `'md'`      | Button size                 |
| `ui`      | `{ base?: string }` | `undefined` | Per-instance class override |
| `class`   | `string`            | `undefined` | Additional external classes |
| `href`    | `string`            | `undefined` | When set, renders as `<a>`  |

### Client Directives

Since RLV components are Vue islands in an Astro page, they require a client directive:

```astro
<RLVButton client:load variant="primary">Hydrated on load</RLVButton>
<RLVButton client:visible variant="outline">Hydrated when visible</RLVButton>
<RLVButton client:idle variant="ghost">Hydrated at idle</RLVButton>
```

## Type System

Props use **indexed access types** on the theme config (same pattern as Nuxt UI):

```ts
export interface RLVButtonProps {
  variant?: keyof typeof buttonTheme.variants.variant
  size?: keyof typeof buttonTheme.variants.size
  ui?: { base?: string }
  class?: string
  href?: string
}
```

This ensures the `variant` and `size` props are always in sync with the theme. Add a new variant to `buttonTheme` and the types update automatically.

## Adding a New Component

To add a new component to `@rimelight/ui`:

### 1. Create the theme file

```ts
// src/themes/card.theme.ts
export const cardTheme = {
  base: ["rounded-xl border border-border bg-card text-card-foreground"],
  variants: {
    variant: {
      default: "",
      elevated: "shadow-lg",
      outlined: "ring-1 ring-border"
    }
  },
  defaultVariants: { variant: "default" }
} as const
```

### 2. Register in the default config

```ts
// src/themes/index.ts
import { cardTheme } from "./card.theme"

export const defaultUIConfig = {
  button: buttonTheme,
  card: cardTheme
} as const
```

### 3. Create the Astro component

```astro
---
// src/components/astro/RLACard.astro
import { cv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import defu from "defu"
import { cardTheme } from "../../themes/card.theme"
import { getUIConfig } from "virtual:rimelight-ui"

const card = cv({
  ...cardTheme,
  classNameResolver: (...args) => twMerge(cx(...args)),
})

const { variant, class: className, ui: uiProp, ...rest } = Astro.props
const globalConfig = getUIConfig()
const mergedUI = defu(uiProp ?? {}, globalConfig.card ?? {})
const classes = card({ variant, className: mergedUI.base })
---

<div class:list={[classes, className]} {...rest}>
  <slot />
</div>
```

### 4. Create the Vue component

```vue
<script setup lang="ts">
import { computed } from "vue"
import { cv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { cardTheme } from "../../themes/card.theme"

const card = cv({
  ...cardTheme,
  classNameResolver: (...args) => twMerge(cx(...args))
})

const props = defineProps<{
  variant?: keyof typeof cardTheme.variants.variant
  ui?: { base?: string }
  class?: string
}>()

const resolvedClasses = computed(() => card({ variant: props.variant, className: props.ui?.base }))
</script>

<template>
  <div :class="[resolvedClasses, props.class]">
    <slot />
  </div>
</template>
```

# CSS Architecture Considerations

This document captures architectural improvements identified for `@rimelight/ui`'s CSS and styling pipeline. None of these are implemented yet. They are recorded here as a reference for future development iterations.

---

## 1. Preflights Instead of a Stylesheet

### Current State

The library's base CSS (design token variables, resets, etc.) is delivered as a static CSS file that consumers must import manually or that the Astro integration injects via a Vite plugin. This file lives outside UnoCSS's pipeline — it has no access to the resolved theme object, lands outside CSS layer ordering, and requires consumers to actively import it.

### The Improvement

Move all design token definitions and base styles into UnoCSS **preflights** inside the preset. A preflight is a block of raw CSS injected by UnoCSS itself before any utility classes, with full access to the resolved `theme` object.

### Sample Implementation

```typescript
// packages/ui/src/presets/index.ts

const colorShades = ["50","100","200","300","400","500","600","700","800","900","950"] as const

export default definePreset((options?: RimelightPresetOptions) => {
  const allColors = [...coreColors, ...(options?.colors ?? [])]

  return {
    name: "rimelight-ui",

    preflights: [
      {
        // Emit all --color-{name}-{shade} CSS custom properties
        getCSS: () => {
          const vars = allColors.flatMap(color =>
            colorShades.map(shade =>
              `  --color-${color}-${shade}: ${options?.colorValues?.[color]?.[shade] ?? `/* define --color-${color}-${shade} */`};`
            )
          )
          return `:root {\n${vars.join("\n")}\n}`
        }
      },
      {
        // Base reset and global defaults
        getCSS: () => `
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; font-family: var(--font-sans, system-ui, sans-serif); }
          a { color: inherit; text-decoration: none; }
        `
      }
    ]
  }
})
```

This means a consumer's `global.css` would only need project-specific styles (fonts loaded by Astro's font provider, page-level layout) — the design system tokens arrive automatically.

### Pros

- **Zero required imports** — consumers don't need to import a CSS file; the preset handles it
- **Layer-aware** — preflights respect `outputToCssLayers`, so tokens land in the correct cascade layer
- **Theme-aware** — `getCSS` receives the resolved `theme` object, enabling dynamic output based on registered colors
- **Single source of truth** — color values move into the preset config, not spread across CSS files

### Cons

- **Color values must live in JS/TS** — hex values can no longer be edited in a CSS file; they must be defined in the preset config object or a separate tokens file imported by the preset
- **Astro font provider incompatible** — font-face declarations managed by `astro:fonts` must remain as CSS files; only design tokens and resets should move into preflights
- **Debugging is harder** — inspecting a preflight in DevTools shows generated CSS, not a source file with line numbers

---

## 2. Single Place to Define Colors

### Current State

Adding a new color requires touching **three separate files**:

1. `global.css` — define `--color-{name}-{shade}` CSS custom properties
2. `uno.config.ts` — pass the color name to `rimelightUiPreset({ colors: ["..."] })`
3. `astro.config.ts` — pass the color name to `ui({ colors: ["..."] })`

This is error-prone. Forgetting one of the three means either missing CSS variables (invisible button backgrounds), missing utility classes (UnoCSS can't generate `bg-blurple-500`), or missing component variants (RLAButton doesn't know about `color="blurple"`).

### The Improvement

A single `rimelight.config.ts` file at the project root, read by both the UnoCSS preset and the Astro integration via a shared config resolution utility.

### Sample Implementation

```typescript
// rimelight.config.ts (project root)
import { defineRimelightConfig } from "@rimelight/ui/config"

export default defineRimelightConfig({
  colors: {
    blurple: {
      50:  "#f4f0ff",
      100: "#e9e2ff",
      200: "#d6ccff",
      300: "#b9a8ff",
      400: "#967aff",
      500: "#7146ff",
      600: "#6222ff",
      700: "#5512e9",
      800: "#460ebf",
      900: "#3b0e9c",
      950: "#220869",
    }
  }
})
```

```typescript
// uno.config.ts
import { loadRimelightConfig } from "@rimelight/ui/config"
import rimelightUiPreset from "@rimelight/ui/presets"

const rlConfig = await loadRimelightConfig()

export default defineConfig({
  presets: [rimelightUiPreset(rlConfig)]
})
```

```typescript
// astro.config.ts
import { loadRimelightConfig } from "@rimelight/ui/config"
import { ui } from "@rimelight/ui/integrations"

const rlConfig = await loadRimelightConfig()

export default defineConfig({
  integrations: [ui(rlConfig)]
})
```

With this pattern, the preset's preflight (from improvement #1) would also emit the `--color-blurple-*` CSS variables automatically from the `colors` object — completely eliminating the `global.css` declaration too.

### Pros

- **One place to add a color, period** — name + hex values in one config file; everything else is automatic
- **Eliminates the CSS variables step** — the preflight generates them from the config
- **Typo-safe** — TypeScript enforces the config shape; mismatched names between files is impossible
- **Easier to document** — a single onboarding step for contributors

### Cons

- **Requires a new `loadRimelightConfig` utility** — this needs to be a synchronous-compatible resolver (Vite configs can't easily do top-level async)
- **Config file discovery** — needs a convention for where the file lives and how it's resolved relative to the workspace root in a monorepo
- **Vite/Astro cold-start caching** — changes to `rimelight.config.ts` need to invalidate both the UnoCSS cache and Astro's Vite cache; this requires explicit `server.watch` configuration

---

## 3. Attributify Mode / CSS Variable Rules Instead of Safelist

### Current State

Because component theme classes are generated via string interpolation (`` `bg-${color}-500` ``), UnoCSS's static file scanner cannot detect them. The workaround is explicitly adding every possible generated class to the preset's `safelist` array. This is a manual list that must be kept in sync with the factory functions — if a new variant class is added to a theme factory, the safelist must also be updated.

```typescript
// Current workaround — fragile and repetitive
const safelist = allColors.flatMap(color => [
  `bg-${color}-500`,
  `hover:bg-${color}-600`,
  `text-${color}-600`,
  // ...and so on for every variant
])
```

### The Improvement: CSS Variable Rules

Instead of safelisting concrete utility classes, define a **single CSS custom property per color** that components reference. UnoCSS generates the custom property class once, and all variant logic reads it via `var()`.

```typescript
// preset: define a rule that maps any --rl-color-* usage
rules: [
  [/^rl-color-(.+)$/, ([, color]) => ({
    "--rl-bg": `var(--color-${color}-500)`,
    "--rl-bg-hover": `var(--color-${color}-600)`,
    "--rl-text": `var(--color-${color}-600)`,
    "--rl-ring": `var(--color-${color}-500)`,
  })]
]
```

```typescript
// button.theme.ts: base uses the CSS variables instead of per-color utilities
base: {
  root: "rl-color-primary" // sets --rl-bg, --rl-text, etc.
},
// compoundVariants just swap the color rule
compoundVariants: [
  ...colors.map(color => ({
    variant: "solid",
    color,
    classNames: { root: `rl-color-${color}` } // single class, UnoCSS sees it
  }))
]
```

```css
/* The solid variant base class reads the CSS variables */
.btn-solid {
  background-color: var(--rl-bg);
  color: white;
}
.btn-solid:hover {
  background-color: var(--rl-bg-hover);
}
```

### Alternative: Attributify Mode

UnoCSS's `presetAttributify` allows writing utilities as HTML attributes instead of class strings, which the scanner always detects:

```html
<button bg="blurple-500 hover:blurple-600" text="white">...</button>
```

This sidesteps the interpolation problem entirely since the attribute values are static strings in source files. However it changes the component authoring model significantly and is incompatible with the current `css-variants` theme approach.

### Pros (CSS Variable Rules)

- **No safelist to maintain** — UnoCSS detects `rl-color-blurple` as a literal string in source
- **Fewer generated classes** — one class per color instead of 6–12 per color per variant
- **Dark mode friendly** — CSS variables can be re-declared in `[data-theme="dark"]` to retheme all components at once

### Cons

- **Debugging complexity** — computed styles show `var(--rl-bg)` not the actual hex; harder to inspect in DevTools
- **Requires base CSS classes** — the `.btn-solid` structural class must be globally available, pushing more logic into preflights
- **Behavioural shift** — replaces the compound variant model entirely; needs a migration plan

---

## 4. Better Dark / Light Mode Handling

### Current State

Dark mode is handled ad-hoc — individual color variables are redeclared inside `.dark` or `[data-theme="dark"]` selectors in `global.css`. Components have no semantic awareness of which mode they're in; they just inherit whatever CSS variables are currently in scope.

There is no typed system for a component to say "this shade is for dark backgrounds" vs "this shade is for light backgrounds", and there's no way for a user to define a color that automatically adapts to both modes with a single declaration.

### The Improvement: Semantic Foreground Variables

Pair each registered color with a `--color-{name}-foreground` variable that specifies the appropriate text color for that background. The component factory reads this instead of hardcoding `text-white`.

```typescript
// rimelight.config.ts
colors: {
  blurple: {
    shades: { 500: "#7146ff", 600: "#6222ff", /* ... */ },
    foreground: "#ffffff",      // text on a blurple background
    darkForeground: "#e9e2ff",  // text on a dark-mode blurple background
  },
  secondary: {
    shades: { 500: "#f59e0b", /* ... */ },
    foreground: "#1c1917",      // dark text — secondary is amber, needs dark text
  }
}
```

```typescript
// button factory: no more hardcoded "text-white"
...colors.map(color => ({
  variant: "solid",
  color,
  classNames: {
    root: `bg-${color}-500 text-${color}-foreground hover:bg-${color}-600`
  }
}))
```

```css
/* Preflight emits this for each registered color */
:root {
  --color-blurple-foreground: #ffffff;
}

[data-theme="dark"] {
  --color-blurple-foreground: #e9e2ff;
}
```

### Alternative: Color-Scheme Aware oklch Values

Define all shades using `oklch()` with light/dark variants, relying on `color-scheme` and `prefers-color-scheme` to switch automatically without a class toggle:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-500: oklch(55% 0.2 250); /* lighter for dark bg readability */
  }
}
```

### Pros

- **Correct contrast automatically** — amber buttons get dark text without any per-usage decision
- **WCAG compliance by default** — foreground is defined centrally alongside the color, not left to each usage site
- **Single re-declaration for dark mode** — change `--color-blurple-foreground` in `.dark` to retheme all blurple buttons at once

### Cons

- **More config surface** — each color needs a `foreground` value in addition to shades; slightly higher setup cost
- **Override friction** — a consumer who wants a specific button to use a different text color still needs to reach for the `ui` prop slot override

---

## 5. Migrating Away from Tailwind

### Current State

Tailwind v4 is present as a Vite plugin (`tailwindcss/vite`) and is used exclusively to support **Nuxt UI** — a Vue component library that is built entirely on Tailwind v4 utilities. Without it, Nuxt UI components render unstyled.

The consequence is that Tailwind compiles its own utility CSS in addition to UnoCSS. Because Tailwind v4 hard-compiles colour utility classes using its internal colour map, any custom CSS colour variables (like `--color-primary-500: #0064d7`) are ignored unless re-declared inside an `@theme {}` block — which is a Tailwind v4-specific directive. This is the reason all custom color definitions in `global.css` are currently wrapped in `@theme` instead of a plain `:root`.

### The Migration Path

Tailwind's presence is entirely conditional on Nuxt UI. The removal process is therefore:

#### Phase 1 — Eliminate Nuxt UI component usage

Audit all usages of Nuxt UI components across playground, rimelight.com, and other packages. For each:

1. Identify the Nuxt UI component (e.g. `<UNavigationMenu>`, `<UButton>`)
2. Confirm an `@rimelight/ui` equivalent exists (`RLAButton`, `RLAHeader`, etc.)
3. Replace and test

The largest remaining blocker is the `NavigationMenu` (currently used in `AppHeader.astro` across multiple sites), which relies on Nuxt UI's Vue component for its dropdown/hover behaviour.

#### Phase 2 — Remove Tailwind

Once no Nuxt UI components remain:

```typescript
// astro.config.ts — remove this
import tailwindcss from "@astrojs/tailwind" // or tailwindcss/vite

// vite.plugins — remove this
plugins: [tailwindcss()]
```

```bash
pnpm remove tailwindcss @tailwindcss/vite
```

#### Phase 3 — Convert `@theme` blocks to `:root`

```css
/* Before (Tailwind-specific) */
@theme {
  --color-primary-500: #0064d7;
}

/* After (standard CSS) */
:root {
  --color-primary-500: #0064d7;
}
```

UnoCSS reads `--color-primary-500` directly via its `createScale()` mapping in the preset — it has never needed `@theme`. The `@theme` blocks were only required to intercept Tailwind's compilation step.

#### Phase 4 — Clean up dead config

Remove any Tailwind-specific configuration from `uno.config.ts` and the integration:

- Any `content` paths that existed to feed Tailwind's scanner
- Any `@tailwind base/components/utilities` directives in CSS files
- The Nuxt UI virtual module plugin from `ui.ts`

### Before / After Comparison

| Concern | With Tailwind | Without Tailwind |
|---|---|---|
| Color registration | `@theme` block required | Plain `:root` sufficient |
| CSS pipeline | Two compilers (Tailwind + UnoCSS) | One compiler (UnoCSS only) |
| Build time | Longer — two full compiler passes | Faster — single pass |
| CSS output | Potentially duplicated utilities | Single clean output |
| `global.css` complexity | `@theme` + `:root` split | Plain `:root` only |
| Vue dependency | Required (Nuxt UI is Vue) | Eliminated |

### Pros

- **One CSS compiler** — eliminates potential class conflicts and duplicate output
- **Simpler `global.css`** — no `@theme` blocks; standard CSS everywhere
- **Smaller bundle** — Tailwind's base reset, preflight, and utility layers are removed
- **No Vue dependency** — if Nuxt UI is the only Vue usage, the entire Vue runtime can be dropped from the Astro build

### Cons

- **NavigationMenu rewrite** — the interactive navigation menu (hover states, keyboard nav, ARIA) is the most complex component to replace; it needs a proper `@rimelight/ui` equivalent before migration can complete
- **Regression risk** — any component that accidentally relied on Tailwind utilities (rather than UnoCSS ones) will silently break; requires a thorough visual regression pass
- **`@theme` blocks must be kept until Nuxt UI is gone** — partial migration is not possible; removing `@theme` while Tailwind is still present will break Nuxt UI component colours

---

## Summary Table

| Improvement | Complexity | Impact | Blocks On |
|---|---|---|---|
| Preflights instead of stylesheet | Medium | High — zero-import DX | Single config file improvement |
| Single color definition source | Medium-High | High — eliminates triple registration | Vite config async resolution |
| CSS variable rules / no safelist | High | Medium — maintenance reduction | Component authoring refactor |
| Semantic foreground variables | Low-Medium | High — WCAG compliance | Color config schema update |
| Remove Tailwind | Medium | Very High — simpler pipeline | Full Nuxt UI component replacement |

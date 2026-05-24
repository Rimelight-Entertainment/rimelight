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

const colorShades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950"
] as const

export default definePreset((options?: RimelightPresetOptions) => {
  const allColors = [...coreColors, ...(options?.colors ?? [])]

  return {
    name: "rimelight-ui",

    preflights: [
      {
        // Emit all --color-{name}-{shade} CSS custom properties
        getCSS: () => {
          const vars = allColors.flatMap((color) =>
            colorShades.map(
              (shade) =>
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
      50: "#f4f0ff",
      100: "#e9e2ff",
      200: "#d6ccff",
      300: "#b9a8ff",
      400: "#967aff",
      500: "#7146ff",
      600: "#6222ff",
      700: "#5512e9",
      800: "#460ebf",
      900: "#3b0e9c",
      950: "#220869"
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
const safelist = allColors.flatMap((color) => [
  `bg-${color}-500`,
  `hover:bg-${color}-600`,
  `text-${color}-600`
  // ...and so on for every variant
])
```

### The Improvement: CSS Variable Rules

Instead of safelisting concrete utility classes, define a **single CSS custom property per color** that components reference. UnoCSS generates the custom property class once, and all variant logic reads it via `var()`.

```typescript
// preset: define a rule that maps any --rl-color-* usage
rules: [
  [
    /^rl-color-(.+)$/,
    ([, color]) => ({
      "--rl-bg": `var(--color-${color}-500)`,
      "--rl-bg-hover": `var(--color-${color}-600)`,
      "--rl-text": `var(--color-${color}-600)`,
      "--rl-ring": `var(--color-${color}-500)`
    })
  ]
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

| Concern                 | With Tailwind                     | Without Tailwind           |
| ----------------------- | --------------------------------- | -------------------------- |
| Color registration      | `@theme` block required           | Plain `:root` sufficient   |
| CSS pipeline            | Two compilers (Tailwind + UnoCSS) | One compiler (UnoCSS only) |
| Build time              | Longer — two full compiler passes | Faster — single pass       |
| CSS output              | Potentially duplicated utilities  | Single clean output        |
| `global.css` complexity | `@theme` + `:root` split          | Plain `:root` only         |
| Vue dependency          | Required (Nuxt UI is Vue)         | Eliminated                 |

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

| Improvement                      | Complexity  | Impact                                | Blocks On                          |
| -------------------------------- | ----------- | ------------------------------------- | ---------------------------------- |
| Preflights instead of stylesheet | Medium      | High — zero-import DX                 | Single config file improvement     |
| Single color definition source   | Medium-High | High — eliminates triple registration | Vite config async resolution       |
| CSS variable rules / no safelist | High        | Medium — maintenance reduction        | Component authoring refactor       |
| Semantic foreground variables    | Low-Medium  | High — WCAG compliance                | Color config schema update         |
| Remove Tailwind                  | Medium      | Very High — simpler pipeline          | Full Nuxt UI component replacement |

---

## Implementation Plan (Decided 2026-05-23)

Archived from conversation with the following constraint: **no `rimelight.config.ts`**. The Astro integration config (`astro.config.ts`) is the single source of truth. The UnoCSS preset reads from it via a shared module-level state (`setColorConfig()` / `getColorConfig()` in `src/presets/index.ts`).

### Phase 1 — Consolidate Presets & Move Base CSS to Preflights ✅ *Done*

**Files touched**: `src/presets/index.ts`, deleted `src/preset.ts`

Moved the hardcoded base CSS custom properties (`:root` + `.dark` variables for `--background`, `--primary`, `--foreground`, `--sidebar`, `--chart`, etc.) from the orphaned `src/preset.ts` into the active preset's `preflights`.

Also added `--{name}-accent` variables for `info`, `success`, `warning`, `error`, `commentary`, `ideation`, `source` (both light and dark modes) to match what `createScale()` expects — these were missing before.

The playground was unchanged (no visual diff) because the same values were already coming from Nuxt UI's theme. This establishes **preflights as the delivery mechanism** for Phase 2+.

### Phase 2 — Single Source of Colors via Integration Config ✅ *Done*

**The Problem**: Adding a custom color (e.g. "blurple") required touching three files:
1. `astro.config.ts` — `ui({ colors: ["blurple"] })`
2. `uno.config.ts` — `rimelightUiPreset({ colors: ["blurple"] })`
3. `global.css` — `@theme { --color-blurple-50: ... }`

**The Solution**: The integration calls `setColorConfig({ colors, colorValues })` which stores the config in module-level shared state. The UnoCSS preset reads this state via `getColorConfig()` at factory time.

```
astro.config.ts
  └── ui({ colors: ["blurple"], colorValues: { blurple: {50: "...", ...} } })
        ├── setColorConfig({ colors: [...core, "blurple"], colorValues: {blurple: ...} })
        │     └── stored in module-level shared state (_sharedColorConfig)
        │
        └── Virtual module stores merged config for component variants

uno.config.ts  (no color args needed)
  └── rimelightUiPreset()  ← reads getColorConfig() internally
        ├── Preflight emits --color-blurple-50 through --color-blurple-950
        ├── createScale("blurple") maps to var(--color-blurple-*)
        └── Safelist includes bg-blurple-500, text-blurple-600, etc.
```

A custom color now only requires one declaration (`colorValues` in `ui()` options). The `uno.config.ts` loses the `colors` argument but keeps its project-specific config (shortcuts, rules, transformers). The `global.css` `@theme` block is removed for that color.

### Phase 3 — CSS Variable Rules Instead of Safelist *(Planned)*

Replace string-interpolated compound variants (`bg-${color}-500`, `text-${color}-600`) with a single CSS variable rule (`rl-color-${color}`). Add a UnoCSS rule:

```ts
rules: [
  [/^rl-color-(.+)$/, ([, color]) => ({
    "--rl-bg": `var(--color-${color}-500)`,
    "--rl-bg-hover": `var(--color-${color}-600)`,
    "--rl-text": `var(--color-${color}-600)`,
    "--rl-ring": `var(--color-${color}-500)`
  })]
]
```

Compound variants reduce to one class per color. The safelist shrinks dramatically. Theme files (134) need updating incrementally — start with highest-traffic components (button, badge, alert) and work down.

### Phase 4 — Semantic Foreground Variables *(Planned)*

Extend the color config schema with `foreground` and `darkForeground` per color. The preflight emits `--color-{name}-foreground` in both `:root` and `.dark`. Theme files use `text-{name}-foreground` instead of hardcoded `text-white`. Enables WCAG compliance for custom colors automatically.

### Phase 5 — Remove Tailwind *(Planned)*

Replace all remaining Nuxt UI components with `@rimelight/ui` equivalents (per `next-steps.md` ranking). Remove `tailwindcss`, `@tailwindcss/vite`, `@nuxt/ui` dependencies. Convert remaining `@theme` blocks to plain `:root`. Single compiler, faster builds, no Vue dependency for most consumers.

### Phase 6 — Dark Mode via Preflight *(Planned)*

Once Tailwind is gone and preflights are the sole delivery, the `.dark` block in the preflight is the single source of truth for dark mode. No separate CSS file overrides needed.

### Dependency Graph

```
Phase 1 (Preflights)
  └── Phase 2 (Single color source via integration)
        ├── Phase 3 (CSS var rules)
        ├── Phase 4 (Semantic foreground)
        └── Phase 5 (Nuxt UI replacement)
              └── Phase 5 completes (remove Tailwind)
                    └── Phase 6 (Dark mode cleanup)
```

---

## CSS Cascade & Override Model

This section describes how styles flow from the library to the final rendered page, and at what point each layer can be overridden.

### The Full Override Ladder

From lowest to highest priority:

| Priority | Source | What it controls | How to override |
|----------|--------|------------------|-----------------|
| 1 (lowest) | **Preflight base tokens** | `--background`, `--foreground`, `--primary`, `--color-{name}-{shade}` for custom colors | Not intended for direct override — these are defaults |
| 2 | **Preflight element styles** | `* { border-color }`, `body { background }`, `button { cursor }` | Override in `global.css` or component-level CSS |
| 3 | **UnoCSS theme utilities** | `bg-primary-500`, `text-muted`, `gap-md`, `rounded-lg` | Generated on-demand by UnoCSS from class strings |
| 4 | **Component theme base** | `.btn-root`, `.btn-label` — structural classes from `defineTheme()` | Via `ui` prop slot or `ui` integration config |
| 5 | **Component theme variants** | `.btn-solid`, `.btn-outline`, compound variant classes | Via `variant`, `color`, `size` props on `<RLAButton>` |
| 6 | **global.css (project level)** | Any `:root` declarations, page-level layout, font imports | Write directly in `global.css` — unlayered beats layered |
| 7 | **Component style overrides** | `class="..."` or `<style>` in the consumer's Astro/Vue file | Standard CSS specificity |
| 8 (highest) | **Inline styles / utility classes** | Direct `style=""` or high-specificity UnoCSS utilities | Use sparingly |

### Why Layers Matter

The preset enables `outputToCssLayers: true` with this layer order:

```
theme (1)  →  preflights (2)  →  shortcuts (3)  →  default (4)
```

The `global.css` file is imported as a **regular, unlayered** stylesheet. In CSS, **unlayered styles always beat layered styles** regardless of specificity. This means:

- A rule in `global.css`'s `:root` block overrides the same variable in the preflight's `:root`
- A utility like `.bg-primary-500` in `global.css` overrides the same utility in the `default` layer
- This is intentional: it gives the consumer project the final say

### What Goes Where (User's Decision Guide)

#### In `astro.config.ts` (the `ui()` call)

This is where **all colors and design tokens are configured**. Not just color names — the actual shade values.

```ts
ui({
  colors: ["blurple"],
  colorValues: {
    blurple: { "50": "#f4f0ff", ... "500": "#7146ff", ... }
  }
})
```

The `colorValues` option is for the library's own custom colors. Here you define:
- New custom colors (like `blurple`, `brand`, `accent`)
- Overrides for existing core color shades

Everything that goes in here becomes CSS variables emitted by the preflight, UnoCSS theme entries via `createScale()`, and available as component variant colors.

#### In `uno.config.ts`

This is for **non-color project-specific UnoCSS configuration**:

- Custom **shortcuts** (composite utility classes like `.card`)
- Custom **rules** (regex-based dynamic utilities)
- Additional **presets** (typography, icons, etc.)
- **Transformers** (directives, variant groups)
- **Content scanning paths** (if your project has unusual file locations)

You should **not** repeat `colors` here — the integration handles it.

#### In `global.css`

This is for **everything that isn't a design token or a utility class**:

- **Font-face declarations** (from `astro:fonts` or manual `@font-face`)
- **Project-specific element styles** (`h1 { font-size: ... }`)
- **Animations** specific to this project
- **Scrollbar styling**
- **Third-party CSS overrides**

You should **not** define design tokens here — they belong in the integration config. You CAN override them here if needed (unlayered beats layered).

### How to Change Padding on a Button

If you want to override `RLAButton`'s padding:

1. **For one instance**: Use the `class` prop or `style` attribute directly on `<RLAButton>`
2. **For all buttons globally**: Use the `ui` integration option:
   ```ts
   ui({
     ui: {
       button: {
         defaultVariants: { size: "lg" }
       }
     }
   })
   ```
   Or override the theme in an `.astro` file's style section.
3. **For this project only**: Define a custom utility in `uno.config.ts` shortcuts:
   ```ts
   shortcuts: {
     "btn-custom": "px-4xl py-sm"
   }
   ```

### How to Change the Primary Color

1. In `astro.config.ts`, pass `colorValues` for the core color:
   ```ts
   ui({
     colorValues: {
       primary: {
         "50": "...",
         "500": "#0064d7",
         "600": "#0050ac",
         ...
       }
     }
   })
   ```
2. The preflight emits `--color-primary-500: #0064d7` etc.
3. All components using `color="primary"` automatically use the new shade
4. If you also need to change `--primary` (the DEFAULT semantic variable), add that in `global.css`'s `:root`:
   ```css
   :root {
     --primary: #0064d7;
   }
   ```

### The Flow Illustrated

```
User writes in astro.config.ts:
  ui({ colorValues: { blurple: { 500: "#7146ff" } } })
             │
             ▼
    setColorConfig() stores in module state
             │
             ▼
    rimelightUiPreset() reads from state
      ├─ preflight.getCSS() → emits --color-blurple-500: #7146ff in :root
      ├─ createScale("blurple") → maps bg-blurple-500 to var(--color-blurple-500)
      └─ safelist → includes bg-blurple-500, text-blurple-600, etc.

User writes in global.css:
  :root { --color-blurple-500: #ff0000; }
             │  (unlayered, beats layered preflight)
             ▼
    --color-blurple-500 resolves to #ff0000 despite the preflight value

User writes in astro component:
  <RLAButton color="blurple" />
             │
             ▼
    RLAButton theme compound variant applies bg-blurple-500
    Which reads var(--color-blurple-500) → #ff0000
```

The key principle: **integration config defines defaults; CSS overrides win via cascade; component props win via specificity**. No single config file intermediary.

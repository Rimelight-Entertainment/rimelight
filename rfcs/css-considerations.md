# RFC: CSS Architecture & Component Styling System

* **Title**: CSS Architecture & Component Styling System
* **Author**: Daniel Marchi & Rimelight Team
* **Status**: Implemented
* **Created**: 2026-05-26

---

## 1. Abstract

This document details the CSS import chain, integration layers, component styling via variants and UnoCSS, and the custom color system used in `@rimelight/ui`.

## 2. CSS Import Chain

The UI package's `src/styles/index.css` bundles:

```css
@import "tailwindcss"; /* Tailwind v4 theme + preflight + utilities */
@import "@nuxt/ui"; /* Nuxt UI base styles */
@import "./prism.css"; /* Prism.js syntax highlighting theme */

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

Consuming projects import it in their `global.css`:

```css
@import "@rimelight/ui/styles/index.css";
```

Projects should **not** import `tailwindcss` directly or include it in their own `package.json`—it's managed through `@rimelight/ui`.

---

## 3. Integration: `ui()` in `astro.config.ts`

The `ui()` integration (from `@rimelight/ui/integrations`) handles all build tooling:

```ts
import { ui } from "@rimelight/ui/integrations"

export default defineConfig({
  integrations: [
    ui({
      logos: { logomark: "/favicon.svg" },
      colors: { primary: { "500": "#0064d7" /* ... */ } },
      ui: { button: { defaultVariants: { variant: "primary" } } }
    })
  ]
})
```

Internally it returns:

1. **UnoCSS** (`@unocss/astro`) — with `rimelightUiPreset({ colors })` — generates component variant classes from theme files
2. **Vue** (`@astrojs/vue`) — required for native Rimelight UI Vue components
3. **Virtual module** (`virtual:rimelight-ui`) — provides merged UI config to components
4. **SSR / optimizeDeps config** — ensures `@rimelight/ui` is properly handled

An optional `uno.config.ts` in consuming projects can override any theme value — it merges on top of the integration's inline config. An empty file is fine; it signals where overrides go.

---

## 4. Component Styling (css-variants + UnoCSS)

Components use theme files (`*.theme.ts`) that export variant-based class configurations via `defineTheme()`. The `resolveClasses()` utility from `css-variants` merges component props with the theme config and outputs UnoCSS utility classes:

```
RLAButton.astro → reads theme from button.theme.ts → resolveClasses() → UnoCSS utility classes
```

The UnoCSS scanner picks up these classes from theme files (including from the UI package's own `src/`) and generates the corresponding CSS at build time.

---

## 5. Color System

Colors are defined in `astro.config.ts` via `ui({ colors })`. Two formats:

**Flat format** — string values at root, used in all modes:

```ts
colors: {
  blurple: { "500": "#7146ff", "600": "#6222ff" }
}
```

**Mode format** — root string keys serve as flat base; `light`, `dark`, `flat` buckets override per-mode:

```ts
colors: {
  blurple: {
    "500": "#7146ff",
    light: { "600": "#7a55ff" },
    dark: { "500": "#9b7aff", "600": "#b096ff" },
    flat: { "500": "#7146ff" }
  }
}
```

### CSS Variable Emission

For every color/shade, the UnoCSS preflight emits in `:root`:

- `--color-{name}-{shade}` — themed var (light mode value, overridden in `.dark`)
- `--color-{name}-{shade}-f` — flat pinned (never overridden)
- `--color-{name}-{shade}-l` — light pinned (never overridden)
- `--color-{name}-{shade}-d` — dark pinned (never overridden)

Then in `.dark`:

- `--color-{name}-{shade}` overridden to dark value (only when differs from light)

### rl-color-{name} Rule

The regex rule `/^rl-color-(.+)$/` sets per-color CSS variable groups:

```
--rl-bg: var(--color-{name}-500)           --rl-bg-f: var(--color-{name}-500-f)
--rl-bg-hover: var(--color-{name}-600)     --rl-bg-hover-f: var(--color-{name}-600-f)
--rl-text: var(--color-{name}-600)         --rl-text-f: var(--color-{name}-600-f)
--rl-ring: var(--color-{name}-500)         --rl-ring-f: var(--color-{name}-500-f)
--rl-border: var(--color-{name}-500)       --rl-border-f: var(--color-{name}-500-f)
```

Each variable also has pinned `-l` and `-d` variants for light/dark mode targeting.

### Override Classes

```css
.rl-flat  { --rl-bg: var(--rl-bg-f); --rl-bg-hover: var(--rl-bg-hover-f); ... }
.rl-light { --rl-bg: var(--rl-bg-l); --rl-bg-hover: var(--rl-bg-hover-l); ... }
.rl-dark  { --rl-bg: var(--rl-bg-d); --rl-bg-hover: var(--rl-bg-hover-d); ... }
```

Component compound variants reference `bg-[var(--rl-bg)]`, `text-[var(--rl-text)]` etc., so overriding `--rl-*` pins all color-driven styling at once. The `theme` prop on components (currently only button) applies these classes.

---

## 6. Consuming Project Setup

### `global.css`

```css
@import "@rimelight/ui/styles/index.css";

:root {
  --color-primary-50: #ffffff;
  /* project-specific overrides */
  --font-sans: "Noto Sans", sans-serif;
  --ui-container: 90rem;
}
```

No `@import "tailwindcss"`.

### `uno.config.ts` (optional — for overrides)

```ts
import { defineConfig } from "unocss"

export default defineConfig({})
```

File can exist empty or with custom theme overrides. It merges on top of the integration's inline config — file values win.

### `astro.config.ts`

```ts
import { ui } from "@rimelight/ui/integrations"

export default defineConfig({
  integrations: [
    ui({
      logos: { logomark: "/favicon.svg" },
      colors: {
        /* optional */
      }
    })
  ]
})
```

No `@unocss/astro` or `@tailwindcss/vite` in the project itself — all handled by the integration.

### `package.json`

```json
{
  "dependencies": {
    "@rimelight/ui": "^0.0.32",
    "@astrojs/vue": "..."
  }
}
```

No `tailwindcss`, `@nuxt/ui`, `unocss`, or `@tailwindcss/vite` — all managed by `@rimelight/ui`.

### Component Imports

```astro
import type { ButtonProps } from "@rimelight/ui/types"
```

---

## 7. Component Renames

The following components were renamed (old files removed, imports will break):

| Old Name          | New Name         |
| ----------------- | ---------------- |
| `RLAAlertDialog`  | `RLAConfirm`     |
| `RLADropzone`     | `RLAFileUpload`  |
| `RLAField`        | `RLAFormField`   |
| `RLACombobox`     | `RLAInputMenu`   |
| `RLADialog`       | `RLAModal`       |
| `RLASection`      | `RLAPageSection` |
| `RLASheet`        | `RLASlideover`   |
| `RLAResizable`    | `RLASplitter`    |
| `RLAEmbedYoutube` | `RLAVideo`       |
| `RLAInputGroup`   | `RLAFieldGroup`  |

Theme files were also renamed from camelCase to kebab-case (e.g. `aspectRatio.theme.ts` → `aspect-ratio.theme.ts`). These are consumed internally by UnoCSS scanning — no project should import them directly.

---

## 8. Project Migration Checklist

Not all consuming projects have been updated to the latest patterns yet. Verify each:

### `package.json`

- [ ] Dep `@rimelight/ui` is at `^0.0.32`
- [ ] No `tailwindcss`, `unocss`, `@nuxt/ui`, `@tailwindcss/vite` in direct dependencies
- [ ] `@astrojs/vue` present (needed for native Vue components)

### `uno.config.ts` (project root)

- [ ] Exists (even if empty) — makes it discoverable that UnoCSS overrides go here
- [ ] Imports `defineConfig` from `"unocss"`

### `astro.config.ts`

- [ ] Uses `ui()` integration from `@rimelight/ui/integrations`
- [ ] No standalone `@unocss/astro` or `@tailwindcss/vite`
- [ ] Starlight config has `customCss: ["./src/styles/starlight.css"]` (not `global.css`)
- [ ] Component imports updated to new names (see Component Renames table)

### `src/styles/global.css`

- [ ] Imports `@import "@rimelight/ui/styles/index.css"` at the top
- [ ] No `@import "tailwindcss"` (managed by `@rimelight/ui`)
- [ ] Project-level `--font-sans`, `--primary`, `--ui-container` overrides present

### `src/styles/starlight.css` (if Starlight is used)

- [ ] Exists and is referenced in Starlight's `customCss`
- [ ] Defines `--sl-*` color variables for light/dark mode
- [ ] Does NOT import `global.css` or `@rimelight/ui/styles/index.css`

## 9. Final Step — Remove Tailwind / Nuxt UI (Completed)

Functional parity reached. All references removed:

1. Replaced all remaining Nuxt UI components with `@rimelight/ui` equivalents
2. Removed `tailwindcss`, `@tailwindcss/vite`, `@nuxt/ui` from `@rimelight/ui`'s `package.json`
3. Removed `@import "tailwindcss"` and `@import "@nuxt/ui"` from `src/styles/index.css`
4. Removed `@nuxt/ui/vite` and `@tailwindcss/vite` plugins from `ui.ts`
5. Removed `./nuxt` export from `package.json`
6. Result: single compiler (UnoCSS), no Tailwind, native Vue support without Nuxt UI dependency.

---

## 10. Future Considerations

- **`theme` prop for all components** — currently only button has it; the CSS rules exist for all (`.rl-flat`, `.rl-light`, `.rl-dark`), just need component variants
- **Simplified color config** — auto-generate light/dark shades from a single base value via oklch
- **Dynamic foreground** — `rl-color-{name}` currently hardcodes text to shade 600; could use luminance-based selection
- **Configurable semantic vars** — `--primary`, `--background`, etc. are currently hardcoded in the preflight; could be made configurable
- **Emissions optimization** — flat-only colors emit redundant `-f`, `-l`, `-d` sets; could be skipped for non-mode colors

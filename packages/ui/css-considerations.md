# CSS Architecture

## What Has Been Done

### Phase 1 — Consolidate Presets & Move Base CSS to Preflights ✅

- Merged orphaned `src/preset.ts` into `src/presets/index.ts`
- Moved hardcoded `:root` + `.dark` CSS variables (background, foreground, primary, sidebar, chart, etc.) into the active preset's preflight
- Added missing `--{name}-accent` variables for info, success, warning, error, commentary, ideation, source in both modes

### Phase 2 — Single Source of Truth for Colors ✅

- `ui()` in `astro.config.ts` accepts a `colors` record: `{ name: { shade: value } }`
- Integration calls `setColorConfig()` which stores config in `globalThis.__rimelightColorConfig`
- Preset factory reads from `globalThis` when called without arguments — `uno.config.ts` is just `rimelightUiPreset()` with no color args
- Preflight emits `--color-{name}-{shade}` for all registered colors in `:root` and `.dark`
- `createScale()` maps UnoCSS theme colors to `var(--color-{name}-{shade})`

### Phase 3 — rl-color-{name} CSS Variable Rule ✅

- Added `rl-color-{name}` UnoCSS rule (regex): sets `--rl-bg`, `--rl-text`, `--rl-ring`, `--rl-border`, `--rl-bg-hover`
- Refactored button compound variants: all 6 variants use `rl-color-{color}` + `bg-[var(--rl-bg)]` etc.
- Safelist reduced from ~13 entries per color to 1 (`rl-color-{color}`)
- Added default 50–950 shade scales (`defaults.ts`) for all 10 built-in colors

### Phase 4 — Theme-Aware Colors with Light/Dark/Flat Modes ✅

- Colors can define `light`, `dark`, `flat` mode buckets (or plain flat string values at root)
- `resolveColorModes()` resolves each shade per-mode with per-shade fallback cascade
- Preflight emits three pinned variable sets in `:root` (never overridden in `.dark`):
  - `-f` (flat pinned), `-l` (light pinned), `-d` (dark pinned)
- Three override CSS rules:
  - `rl-flat` — swaps `--rl-*` to `-f` pinned vars
  - `rl-light` — swaps `--rl-*` to `-l` pinned vars
  - `rl-dark` — swaps `--rl-*` to `-d` pinned vars
- Component `theme` prop: `<Button theme="flat" />`, `theme="light"`, `theme="dark"`
- Only the button component has the `theme` prop implemented so far

---

## How It Works Now

### Color Config Formats

Colors accept two formats, mixable per entry:

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
    "500": "#7146ff",               // flat base
    light: { "600": "#7a55ff" },     // light-only override
    dark: { "500": "#9b7aff", "600": "#b096ff" },
    flat: { "500": "#7146ff" }       // mode-independent pinned value
  }
}
```

### Per-Shade Cascade

Each shade resolves independently per mode:

| Mode       | Resolution order                           |
| ---------- | ------------------------------------------ |
| Light      | `light` bucket → flat keys → `flat` bucket → `dark` bucket |
| Dark       | `dark` bucket → flat keys → `flat` bucket → `light` bucket |
| Flat/theme | `flat` bucket → flat keys → `light` bucket → `dark` bucket |

If a shade is missing from all sources, it is not emitted. Defining a single value in `dark` bucket propagates to all modes through the chain.

### CSS Variable Emission

For every color/shade, the preflight emits in `:root`:
- `--color-{name}-{shade}` — themed var (light mode value, overridden in `.dark`)
- `--color-{name}-{shade}-f` — flat pinned (never overridden)
- `--color-{name}-{shade}-l` — light pinned (never overridden)
- `--color-{name}-{shade}-d` — dark pinned (never overridden)

Then in `.dark`:
- `--color-{name}-{shade}` overridden to dark value (only when differs from light)

### rl-color-{name} Rule

The regex rule `/^rl-color-(.+)$/` sets per-color CSS variable groups. Themed values (change with mode) plus all three pinned sets:

```
--rl-bg: var(--color-{name}-500)
--rl-bg-f: var(--color-{name}-500-f)
--rl-bg-l: var(--color-{name}-500-l)
--rl-bg-d: var(--color-{name}-500-d)
--rl-bg-hover: var(--color-{name}-600)
--rl-bg-hover-f: var(--color-{name}-600-f)
--rl-bg-hover-l: var(--color-{name}-600-l)
--rl-bg-hover-d: var(--color-{name}-600-d)
--rl-text: var(--color-{name}-600)
--rl-text-f: var(--color-{name}-600-f)
--rl-text-l: var(--color-{name}-600-l)
--rl-text-d: var(--color-{name}-600-d)
--rl-ring: var(--color-{name}-500)
--rl-ring-f: var(--color-{name}-500-f)
--rl-ring-l: var(--color-{name}-500-l)
--rl-ring-d: var(--color-{name}-500-d)
--rl-border: var(--color-{name}-500)
--rl-border-f: var(--color-{name}-500-f)
--rl-border-l: var(--color-{name}-500-l)
--rl-border-d: var(--color-{name}-500-d)
```

### Override Classes

Each class swaps the themed `--rl-*` chain to a pinned set:

```css
.rl-flat  { --rl-bg: var(--rl-bg-f); --rl-bg-hover: var(--rl-bg-hover-f); ... }
.rl-light { --rl-bg: var(--rl-bg-l); --rl-bg-hover: var(--rl-bg-hover-l); ... }
.rl-dark  { --rl-bg: var(--rl-bg-d); --rl-bg-hover: var(--rl-bg-hover-d); ... }
```

Since every compound variant references `bg-[var(--rl-bg)]`, `text-[var(--rl-text)]`, etc., overriding the `--rl-*` chain pins all color-driven styling at once.

### Component Integration

Button theme (`button.theme.ts`):
```ts
theme: {
  flat: { root: "rl-flat" },
  light: { root: "rl-light" },
  dark: { root: "rl-dark" }
}
```

Usage in Astro:
```astro
<RLAButton theme="flat">Stays same in all modes</RLAButton>
<RLAButton theme="light">Always light mode colors</RLAButton>
<RLAButton theme="dark">Always dark mode colors</RLAButton>
<RLAButton>Responds to mode normally</RLAButton>
```

### UnoCSS Rule Generation

- `rl-color-{name}` is a **regex rule** — generated on-demand. Must be in the `safelist` for each registered color name.
- `rl-flat`, `rl-light`, `rl-dark` are **static rules** — detected by the scanner when referenced in source files (the theme config in `*.theme.ts`). No safelist entry needed.
- Safelist = 1 entry per color: `rl-color-{color}`

---

## Remaining Steps

### Step 1 — Add `theme` Prop to All Themeable Components

Follow the same pattern as the button:

1. In each component's `*.theme.ts`, add a `theme` variant:
   ```ts
   theme: {
     flat: { root: "rl-flat" },
     light: { root: "rl-light" },
     dark: { root: "rl-dark" }
   }
   ```

2. In each component's `*.astro`, destructure `theme` and pass it to `resolveClasses`:
   ```astro
   const { theme, ...rest } = Astro.props
   const classes = resolveClasses(themeConfig, { theme, ...rest }, ...)
   ```

3. Update the component's type file to declare `theme?: "flat" | "light" | "dark"` (or use `[key: string]: unknown` index signature).

**Components needing this** (typical list):
- `RLAAlert`
- `RLABadge`
- `RLAInput` and other form controls
- `RLATag`
- `RLAChip`
- Any other component with `color`-based compound variants

### Step 2 — Remove Tailwind / Nuxt UI Dependency

- Audit and replace all remaining Nuxt UI components with `@rimelight/ui` equivalents
- Remove `tailwindcss`, `@tailwindcss/vite`, `@nuxt/ui` dependencies from `package.json`
- Remove `tailwindcss/vite` plugin from integration `ui.ts`
- Convert any remaining `@theme` blocks in `global.css` to plain `:root`
- Single compiler (UnoCSS only), faster builds, no Vue dependency for most consumers

### Step 3 — CSP Compliance

- Rewrite remaining inline styles (`style=""`) in RLAChart, RLASlider, scroll-to-top components to CSS variable + class approach
- All styling should go through `<style>` tags (CSP-safe) or UnoCSS classes

---

## Further Considerations

### GlobalThis Timing

The `setColorConfig` → `getColorConfig` pipeline relies on `globalThis.__rimelightColorConfig` because pnpm's `packageImportMethod: copy` causes different ES module instances in Node.js vs Vite contexts. `globalThis` is the same object across all contexts. Timing order:

```
Astro config loading → setColorConfig() → Vite startup → uno.config.ts → rimelightUiPreset() → getColorConfig()
```

This order is guaranteed by Astro's lifecycle. The `setColorConfig` is called during `astro:config:setup`, before Vite plugins (including UnoCSS) are initialized.

### Debugging Generated CSS

When inspecting in DevTools:
- Themed `--color-{name}-{shade}` variables appear in `:root` and `.dark`
- Pinned `-f`, `-l`, `-d` variables only appear in `:root`
- `rl-color-{name}` classes set `--rl-bg` etc. as intermediates
- Compound variants apply `bg-[var(--rl-bg)]` which resolves through the chain

### Potential Future Improvements

- **`theme="light"` and `theme="dark"` for other elements** — currently the CSS rules exist but only button has the component variant. Easy to extend.
- **Simplified color config** — auto-generate light/dark shades from a single base value using oklch lightness adjustments, reducing config surface.
- **Foreground system** — extend `rl-color-{name}` to also set `--rl-text` dynamically (currently hardcoded to shade 600). Could use an algorithmic approach based on luminance.
- **Semantic `--primary` etc.** — the base CSS custom properties (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--primary-accent`) remain hardcoded in the preflight. Could be made configurable via the integration.
- **Default `flat` for colors without modes** — flat-only colors (like the built-in defaults) emit `-f`, `-l`, `-d` all with the same value, adding CSS bloat. An optimization could skip redundant pinned emissions.
- **Safelist optimization** — `rl-color-{color}` is safelisted once per color. If a color is never used in any component, it still generates the rule. Could be migrated to dynamic detection if the scanner improves.

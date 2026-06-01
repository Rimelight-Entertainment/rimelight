# RFC: Adopting Native CSS `light-dark()` & `color-scheme` for Modular Color Modes

- **Title**: Adopting Native CSS `light-dark()` & `color-scheme` for Modular Color Modes
- **Author**: Antigravity (AI Coding Assistant) & Daniel Marchi
- **Status**: Proposed
- **Created**: 2026-05-29

---

## 1. Abstract

This RFC proposes a transition in `@rimelight/ui` from a traditional class-based dark mode override system to a native CSS context-aware system leveraging the **CSS `light-dark()` color function** and the **`color-scheme` property** (Baseline 2024).

Adopting this architecture will dramatically simplify our color preflight generation, reduce CSS footprint, and completely solve the challenge of forcing components/sections (like headers or footers) into fixed branding aesthetics without breaking theme integrity or relying on heavy custom CSS overrides.

---

## 2. Background & Current Architecture

Currently, `@rimelight/ui` manages color modes using a class-based toggle structure in `src/presets/index.ts`:

1. **Global CSS Variables**: Inside `:root`, light-mode variables are declared (e.g., `--background: #ffffff`).
2. **Class-Based Redefinitions**: Inside a `.dark` CSS rule block, variables are redefined for dark mode (e.g., `--background: #030712`).
3. **Local Theme Swapping**: To force components into light or dark mode regardless of the global mode (e.g. `<RLAButton theme="dark">`), our UnoCSS preset generates parallel light-pinned (`-l`) and dark-pinned (`-d`) variables. We then apply custom helper classes (`rl-light`, `rl-dark`) that swap the active variable references:
   ```css
   .rl-light {
     --rl-bg: var(--rl-bg-l);
     --rl-text: var(--rl-text-l);
   }
   .rl-dark {
     --rl-bg: var(--rl-bg-d);
     --rl-text: var(--rl-text-d);
   }
   ```

### Limitations of the Current Approach:

- **Friction with Pinned Components**: Forcing a specific page section (like a dark header/footer or light card inside a dark page) to a fixed brand aesthetic requires manual, duplicate variable mappings and application of custom wrapper classes.
- **Heavy Preflight Footprint**: Generating distinct light, dark, and flat variables (`-l`, `-d`, `-f`) for every single shade of every color scale inflates the global stylesheet's preflight block.
- **Maintenance Complexity**: Compounding utility definitions is required in both the component styles and the UnoCSS rules file to ensure all components properly respond to local theme scoping.

---

## 3. Proposed Architecture: Native Context-Aware Color Modes

By transitioning our theme variables to use the native `light-dark()` CSS function, color mode resolution shifts from being **globally coupled** (dependent on a `.dark` class on `<html>`) to **locally context-aware** (computed based on an element's `color-scheme` property).

### Core Concept:

To support `light-dark()`, we define supported schemes on `:root`:

```css
:root {
  color-scheme: light dark;
}
```

We then redefine our variables to specify both their light and dark colors inside the single `light-dark()` function:

```css
:root {
  --background: light-dark(#ffffff, #030712);
  --foreground: light-dark(#030712, #f9fafb);

  --text-color-default: light-dark(var(--color-neutral-700), var(--color-neutral-200));
}
```

---

## 4. Solving Brand Aesthetic Overrides (`color-scheme` Contexts)

The biggest advantage of `light-dark()` is its native context isolation. Because `light-dark()` is evaluated dynamically by the browser based on the computed value of the `color-scheme` CSS property, **we can isolate and force any section of a page to ignore the global scheme simply by declaring its own scheme.**

### Example: A Dark-Themed Brand Footer

If a website is running in light mode, but the brand guidelines specify that the footer is _always dark_, we do not need to write custom class overrides or toggle local state. We simply write:

```css
.brand-footer {
  color-scheme: dark;
}
```

```html
<footer class="brand-footer bg-inverted text-default">
  <p>Standard text (automatically uses dark-mode white text)</p>
  <RLAButton color="primary">Primary Button</RLAButton>
</footer>
```

#### How the browser resolves this:

1. Since `.brand-footer` has `color-scheme: dark`, all child elements inherit this context.
2. Inside the footer, any component that references global variables (e.g. `var(--text-color-default)`) will automatically resolve to the dark-mode color of the `light-dark()` function.
3. The `<RLAButton>` will natively render in its dark-mode variant because its primary background and hover colors are computed against the `dark` scheme context.

This completely eliminates the need for custom `rl-light` and `rl-dark` swapper rules and parallel variables!

---

## 5. Technical Implementation Details

### A. Simplification of UnoCSS Preset (`src/presets/index.ts`)

Instead of resolving colors into parallel `light`, `dark`, and `flat` objects and outputting complex light-pinned and dark-pinned rules, we can output clean, unified `light-dark()` properties.

#### Before:

```typescript
// Pinned light/dark scale generations
const lightPinnedLines = Object.entries(resolvedColors).map(
  ([shade, value]) => `            --color-${color}-${shade}-l: ${value};`
)
const darkPinnedLines = Object.entries(resolvedColors).map(
  ([shade, value]) => `            --color-${color}-${shade}-d: ${value};`
)
```

#### After:

```typescript
const colorLines = Object.entries(resolvedColors)
  .flatMap(([color, modes]) =>
    Object.keys(modes.light).map((shade) => {
      const lightVal = modes.light[shade]
      const darkVal = modes.dark[shade]
      return `            --color-${color}-${shade}: light-dark(${lightVal}, ${darkVal});`
    })
  )
  .join("\n")
```

This dramatically reduces the number of custom variables injected into the DOM.

### B. Simplification of Component Themes

We can phase out the `theme` variant block inside individual component theme configurations (e.g. `button.theme.ts`), reducing setup size:

#### Before:

```typescript
theme: {
  flat: { root: "rl-flat" },
  light: { root: "rl-light" },
  dark: { root: "rl-dark" }
}
```

#### After:

Components can simply toggle native color schemes dynamically on their root tags when the `theme` property is supplied:

```astro
---
// inside RLAButton.astro or similar
const { theme } = Astro.props;

// Compute style attribute to set native color-scheme override
const styleScheme = theme && theme !== "flat" ? { style: `color-scheme: ${theme};` } : {};
---
<button {...styleScheme} {...rest}>
  <slot />
</button>
```

---

## 6. Pros, Cons & Compatibility

### Pros:

1. **Dramatically Simpler CSS**: No more parallel `--color-*-l` and `--color-*-d` variable scales. Our CSS preflight output shrinks by up to 50%.
2. **Native Contextual Scoping**: Forcing components/layouts into brand-aesthetic modes is fully standardized. A simple `style="color-scheme: dark"` completely sets the theme.
3. **No Overrides Proliferation**: You do not have to write custom selector chains (e.g. `.dark .some-element` or `.always-dark .some-element`) for fixed sections.
4. **HMR-Friendly**: No complex JS-driven class syncing in monorepo development.

### Cons & Compatibility:

- **Baseline 2024 Constraint**: `light-dark()` is a relatively modern CSS standard, becoming fully supported across all major browser engines in early 2024:
  - Chrome/Edge 123+ (March 2024)
  - Safari 17.5+ (May 2024)
  - Firefox 120+ (November 2023)
- **Legacy Fallbacks**: If extremely legacy systems are targeted (e.g. old institutional environments running Chrome < 120), `light-dark()` calls will fall back to transparent or unstyled behaviors unless a post-processing compiler plugin is added. However, given `@rimelight/ui` is built on modern Baseline standards, this is a standard trade-off.

---

## 7. Migration Plan

1. **Phase 1: Dual Support**: Update `src/presets/index.ts` to output standard custom variables using `light-dark()` while preserving old variables temporarily.
2. **Phase 2: Deprecate `rl-light` and `rl-dark`**: Introduce a utility class or directive in our preset mapping `rl-light` to `color-scheme: light` and `rl-dark` to `color-scheme: dark`.
3. **Phase 3: Refactor Component Themes**: Remove the `theme: { flat, light, dark }` blocks from component themes and map the component `theme` props directly to the native `color-scheme` style attribute.

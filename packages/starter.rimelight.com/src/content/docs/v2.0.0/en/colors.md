---
title: Color Palettes
description: OKLCH-based color system with automatic light/dark modes and semantic utility scales.
---

Rimelight UI's color system is built on the **OKLCH** color space, which provides perceptually uniform lightness across hues. This means your `primary-500` will appear equally "mid-tone" whether it's blue, green, or orange — no more washed-out warm colors or overly dark cool ones.

---

## Color Scales

Each palette is a 12-step scale from `50` (near-white) to `950` (near-black):

| Step  | Typical use                |
| ----- | -------------------------- |
| `50`  | Very light backgrounds     |
| `100` | Subtle tinted backgrounds  |
| `200` | Hover states on light bg   |
| `300` | Borders and dividers       |
| `400` | Disabled text              |
| `500` | Mid-tone accent            |
| `600` | Body text on light bg      |
| `700` | Strong accent, interactive |
| `800` | Heading text               |
| `900` | Near-black text            |
| `950` | Deepest shade              |

---

## Semantic Palettes

The following palettes are available as CSS custom properties:

| Palette       | Token prefix          | Purpose                    |
| ------------- | --------------------- | -------------------------- |
| **Primary**   | `--color-primary-*`   | Brand accent color         |
| **Secondary** | `--color-secondary-*` | Supporting accent          |
| **Neutral**   | `--color-neutral-*`   | Text, backgrounds, borders |
| **Success**   | `--color-success-*`   | Positive states            |
| **Info**      | `--color-info-*`      | Informational states       |
| **Warning**   | `--color-warning-*`   | Cautionary states          |
| **Error**     | `--color-error-*`     | Destructive / error states |

```css
.my-button {
  background-color: var(--color-primary-700);
  color: var(--color-primary-50);
}

.my-button:hover {
  background-color: var(--color-primary-800);
}
```

---

## Light / Dark Mode

Rimelight UI automatically generates `prefers-color-scheme` media queries for each palette. The Neutral palette inverts automatically (e.g. `--color-neutral-50` becomes white in light mode and near-black in dark mode).

You can also toggle the theme manually using the `data-theme` attribute on `<html>`:

```js
document.documentElement.dataset.theme = "dark" // or "light"
```

The `useTheme()` composable in Vue components handles this reactively.

---

## Customising the Primary Color

Override `--color-primary-*` in your global CSS to apply your brand color across all components:

```css
/* src/styles/global.css */
:root {
  --color-primary-50: oklch(97% 0.02 265);
  --color-primary-100: oklch(93% 0.05 265);
  /* … continue for all 12 steps … */
  --color-primary-950: oklch(15% 0.04 265);
}
```

The `265` hue value (blue-violet) is the Rimelight default. Rotate the hue to your brand color while keeping the lightness values constant for automatic dark-mode compatibility.

---

## Using Colors in UnoCSS

The Rimelight UnoCSS preset maps palette tokens to utility classes:

```html
<div class="bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100">
  Brand card
</div>

<span class="text-error-700">This field is required.</span>
```

---

## Neutral Scale (Backgrounds & Text)

The neutral palette is the backbone of UI surfaces. Recommended pairings:

| Element         | Light mode    | Dark mode     |
| --------------- | ------------- | ------------- |
| Page background | `neutral-50`  | `neutral-950` |
| Card surface    | `neutral-100` | `neutral-900` |
| Border          | `neutral-200` | `neutral-800` |
| Muted text      | `neutral-500` | `neutral-400` |
| Body text       | `neutral-800` | `neutral-100` |
| Heading text    | `neutral-950` | `neutral-50`  |

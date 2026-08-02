---
title: Design Tokens
description: Spacing, radius, and typography tokens that establish a consistent visual language across the starter.
---

Rimelight UI exposes a system of design tokens as CSS custom properties. Every component consumes these tokens, so changing a single variable re-themes the entire application.

---

## How Tokens Are Applied

The `ui()` Astro integration injects a global stylesheet that defines all tokens on `:root`. Tokens are used internally by components via `var(--token-name)` and can be overridden in your own CSS files:

```css
/* src/styles/global.css */
:root {
  --radius: 0.5rem; /* override border radius globally */
  --font-sans: "My Font", sans-serif;
}
```

---

## Spacing

Fluid spacing tokens adapt to the viewport width using `clamp()`. The scale runs from `6xs` (tiny) to `6xl` (huge):

| Token           | Approximate value |
| --------------- | ----------------- |
| `--spacing-6xs` | ~2px              |
| `--spacing-5xs` | ~4px              |
| `--spacing-4xs` | ~6px              |
| `--spacing-3xs` | ~8px              |
| `--spacing-2xs` | ~10px             |
| `--spacing-xs`  | ~12px             |
| `--spacing-sm`  | ~16px             |
| `--spacing-md`  | ~20px             |
| `--spacing-lg`  | ~24px             |
| `--spacing-xl`  | ~32px             |
| `--spacing-2xl` | ~40px             |
| `--spacing-3xl` | ~48px             |
| `--spacing-4xl` | ~64px             |
| `--spacing-5xl` | ~80px             |
| `--spacing-6xl` | ~96px             |

Use them in your own Astro and CSS files:

```css
.my-section {
  padding-block: var(--spacing-xl);
  gap: var(--spacing-md);
}
```

---

## Border Radius

A single `--radius` variable drives the entire radius scale:

| Token           | Value                        |
| --------------- | ---------------------------- |
| `--radius-none` | `0`                          |
| `--radius-xs`   | `calc(var(--radius) * 0.25)` |
| `--radius-sm`   | `calc(var(--radius) * 0.5)`  |
| `--radius-md`   | `var(--radius)`              |
| `--radius-lg`   | `calc(var(--radius) * 1.5)`  |
| `--radius-xl`   | `calc(var(--radius) * 2)`    |
| `--radius-full` | `9999px`                     |

The default value is `--radius: 0.5rem`. Set it to `0` for a sharp/angular look, or `1rem` for a rounder style.

---

## Typography

Three font family tokens are available:

| Token          | Default font   |
| -------------- | -------------- |
| `--font-sans`  | Noto Sans      |
| `--font-serif` | Noto Serif     |
| `--font-mono`  | JetBrains Mono |

These are populated by Astro's Fonts API via `fontProviders.fontsource()` in `astro.config.ts`. Swap them by changing the font name in the `fonts` array:

```ts
// astro.config.ts
fonts: [
  {
    provider: fontProviders.fontsource(),
    name: "Inter", // ← change this
    cssVariable: "--font-sans",
    fallbacks: ["sans-serif"]
  }
]
```

---

## Z-Index

A layered z-index scale prevents stacking context conflicts:

| Token          | Value | Used for            |
| -------------- | ----- | ------------------- |
| `--z-base`     | `0`   | Normal content      |
| `--z-dropdown` | `100` | Dropdowns, popovers |
| `--z-sticky`   | `200` | Sticky headers      |
| `--z-overlay`  | `300` | Modal backdrops     |
| `--z-modal`    | `400` | Modals and dialogs  |
| `--z-toast`    | `500` | Toast notifications |
| `--z-tooltip`  | `600` | Tooltips            |

---

## Transitions

Shared duration and easing tokens for consistent animations:

```css
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 350ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

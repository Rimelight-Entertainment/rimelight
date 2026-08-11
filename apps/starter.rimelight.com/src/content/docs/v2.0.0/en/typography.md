---
title: Fluid Typography
description: Viewport-responsive font sizes using CSS clamp(), custom font families via Astro Fonts, and the Rimelight type scale.
---

Rimelight UI's typography system uses **CSS `clamp()`** to make font sizes scale smoothly between a minimum (mobile) and maximum (desktop) value without breakpoints. Every heading and body text token is fluid by default.

---

## Font Families

Three font stacks are configured via Astro's Fonts API in `astro.config.ts`:

| Token          | Default font   | Fallback     |
| -------------- | -------------- | ------------ |
| `--font-sans`  | Noto Sans      | `sans-serif` |
| `--font-serif` | Noto Serif     | `serif`      |
| `--font-mono`  | JetBrains Mono | `monospace`  |

Fonts are loaded from the **Fontsource** CDN via the `fontProviders.fontsource()` provider, which serves the minimum required unicode subsets and weights automatically.

### Swapping Fonts

Change the `name` field in `astro.config.ts` to any Fontsource-compatible family:

```ts
fonts: [
  {
    provider: fontProviders.fontsource(),
    name: "Inter", // ← replace with any Fontsource font name
    cssVariable: "--font-sans",
    fallbacks: ["sans-serif"]
  },
  {
    provider: fontProviders.fontsource(),
    name: "Lora",
    cssVariable: "--font-serif",
    fallbacks: ["serif"]
  }
]
```

Browse available fonts at [fontsource.org](https://fontsource.org).

---

## Type Scale

The scale is defined using `clamp(min, preferred, max)` so font sizes grow fluidly between viewport widths of 320px (minimum) and 1280px (maximum):

| Token         | Min     | Max      | Usage             |
| ------------- | ------- | -------- | ----------------- |
| `--text-xs`   | 0.75rem | 0.75rem  | Captions, labels  |
| `--text-sm`   | 0.8rem  | 0.875rem | Secondary text    |
| `--text-base` | 0.9rem  | 1rem     | Body copy         |
| `--text-lg`   | 1rem    | 1.125rem | Lead paragraphs   |
| `--text-xl`   | 1.1rem  | 1.25rem  | Small headings    |
| `--text-2xl`  | 1.25rem | 1.5rem   | Section headings  |
| `--text-3xl`  | 1.5rem  | 1.875rem | Page sub-headings |
| `--text-4xl`  | 1.75rem | 2.25rem  | Page headings     |
| `--text-5xl`  | 2rem    | 3rem     | Hero headings     |
| `--text-6xl`  | 2.5rem  | 3.75rem  | Display headings  |

---

## Line Height & Letter Spacing

| Token               | Value      | Usage              |
| ------------------- | ---------- | ------------------ |
| `--leading-tight`   | `1.25`     | Headings           |
| `--leading-snug`    | `1.375`    | Sub-headings       |
| `--leading-normal`  | `1.5`      | Body text          |
| `--leading-relaxed` | `1.625`    | Long-form reading  |
| `--leading-loose`   | `2`        | Spaced UI elements |
| `--tracking-tight`  | `-0.025em` | Large display text |
| `--tracking-normal` | `0`        | Body               |
| `--tracking-wide`   | `0.025em`  | Uppercase labels   |
| `--tracking-widest` | `0.1em`    | All-caps badges    |

---

## Prose Styles

Docs and blog content is wrapped in the `prose` utility class, which applies opinionated readability styles to raw HTML generated from Markdown:

```astro
<article class="prose">
  <Content />
</article>
```

The `prose` class sets comfortable `max-width`, `line-height`, heading margins, list indentation, `<code>` styling, and link colors — all consistent with the active theme.

---

## Using Type Tokens in CSS

```css
.hero-title {
  font-size: var(--text-5xl);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  font-family: var(--font-serif);
}

.caption {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  letter-spacing: var(--tracking-wide);
}
```

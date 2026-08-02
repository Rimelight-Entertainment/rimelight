---
title: Astro Components
description: Server-rendered Rimelight UI Astro components — zero client-side JavaScript by default.
---

Rimelight UI ships a rich library of native Astro components compiled fully server-side. Because Astro components produce static HTML with no JavaScript payload, they are ideal for SEO-critical and performance-sensitive parts of your site.

---

## Installation

The `@rimelight/ui` package is registered as a workspace dependency and wired up through the `ui()` Vite integration in `astro.config.ts`. No separate install step is needed inside the starter.

---

## Key Components

### `RLAButton`

A configurable button with multiple visual variants:

```astro
import RLAButton from "@rimelight/ui/components/button/RLAButton.astro"

<RLAButton variant="default"      href="/en/docs/">Read the Docs</RLAButton>
<RLAButton variant="outline"      href="/en/auth/sign-up">Get Started</RLAButton>
<RLAButton variant="ghost"        href="/en/about">About</RLAButton>
<RLAButton variant="destructive"  onClick="handleDelete()">Delete</RLAButton>
```

Props: `variant`, `size` (`sm` | `md` | `lg`), `href`, `icon`, `loading`, `disabled`.

### `RLAInput`

Labelled text input with integrated error display:

```astro
import RLAInput from "@rimelight/ui/components/input/RLAInput.astro"

<RLAInput
  id="email"
  label="Email address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

### `RLASearch`

A full-site search overlay connected to the `/api/search` endpoint:

```astro
import RLASearch from "@rimelight/ui/components/search/RLASearch.astro"

<!-- Renders a trigger button; the overlay opens on click or ⌘K -->
<RLASearch placeholder="Search docs..." />
```

### `RLACard` + `RLAGrid`

Responsive card grid for content navigation:

```astro
import RLAGrid from "@rimelight/ui/components/grid/RLAGrid.astro"
import RLACard from "@rimelight/ui/components/card/RLACard.astro"

<RLAGrid>
  <RLACard
    href="/en/docs/auth"
    title="Authentication"
    description="Email/password auth with Better Auth."
    icon="i-lucide-lock"
  />
  <RLACard
    href="/en/docs/database"
    title="Database"
    description="Cloudflare D1 + Drizzle ORM."
    icon="i-lucide-database"
  />
</RLAGrid>
```

### `RLAShortcuts`

A global keyboard shortcut cheat-sheet panel:

```astro
import RLAShortcuts from "@rimelight/ui/components/shortcuts/RLAShortcuts.astro"

<!-- Place in your layout — opens when user presses the configured shortcut -->
<RLAShortcuts />
```

### `RLATableOfContents`

Auto-generates a sticky ToC from an array of page headings. Used automatically by `DocsLayout`:

```astro
import RLATableOfContents from "@rimelight/ui/components/table-of-contents/RLATableOfContents.astro"

<RLATableOfContents headings={headings} minLevel={2} maxLevel={3} />
```

### `RLACodeBlock`

Syntax-highlighted code block with a copy-to-clipboard button:

```astro
import RLACodeBlock from "@rimelight/ui/components/code-block/RLACodeBlock.astro"

<RLACodeBlock lang="ts" code={`const x = 42`} />
```

---

## Layouts

Pre-built layouts in `src/layouts/` wrap these components into full page shells:

| Layout file        | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `BaseLayout.astro` | Root HTML shell with `<head>`, fonts, and meta tags |
| `DocsLayout.astro` | Three-column docs layout: sidebar / content / ToC   |
| `BlogLayout.astro` | Single-column blog post layout with byline          |
| `AuthLayout.astro` | Centred card layout for sign-in / sign-up pages     |

---

## Zero-JS Guarantee

Astro components emit no `<script>` tags. If you need client-side interactivity, use Vue components with a hydration directive (see [Components](/en/docs/components/)).

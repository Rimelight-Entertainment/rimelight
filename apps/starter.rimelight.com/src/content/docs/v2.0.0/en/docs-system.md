---
title: Docs System
description: Versioned MDX documentation with sidebar navigation, table of contents, and edit links.
---

The starter includes a fully featured documentation system powered by Astro's content collections and the `@rimelight/docs` package. It supports **versioned docs**, **sidebar scopes**, **table of contents** generation, prev/next navigation, and edit links.

---

## File Structure

```
src/
├── content/
│   └── docs/
│       ├── v1.0.0/          # One directory per version
│       │   ├── en/          # One directory per locale
│       │   │   ├── index.mdx        # Homepage (maps to /[locale]/docs/)
│       │   │   ├── getting-started.md
│       │   │   └── ...
│       │   ├── pt/
│       │   └── es/
│       └── v2.0.0/
│           └── en/
├── config/
│   └── docs.config.ts       # Sidebar configuration
└── pages/
    └── [locale]/
        └── docs/
            ├── index.astro          # /[locale]/docs/ → latest version
            └── [...slug].astro      # /[locale]/docs/[version]/[page]
```

---

## Content Schema

Each doc file must have a frontmatter block matching the schema defined in `src/content.config.ts`:

```md
---
title: "Page Title" # required
description: "Short description." # optional — used in <meta> and OG
editUrl: false # optional — set false to hide edit link
tableOfContents: # optional — override ToC settings
  minHeadingLevel: 2
  maxHeadingLevel: 3
prev: # optional — override prev link
  label: "Previous Page"
  href: "/en/docs/previous"
next: # optional — override next link
  label: "Next Page"
  href: "/en/docs/next"
---
```

---

## Versioning

Version directories follow the format `v<semver>` (e.g. `v1.0.0`, `v2.0.0`). The routing system in `@rimelight/docs` automatically detects available versions and redirects `/[locale]/docs/` to the latest version.

When multiple versions exist, a version switcher appears in the docs header. URLs are structured as:

```
/en/docs/v1.0.0/getting-started
/en/docs/v2.0.0/getting-started
```

If only one version exists (or `includeVersionInUrl` returns `false`), version is omitted:

```
/en/docs/getting-started
```

---

## Sidebar Configuration

The sidebar is configured in `src/config/docs.config.ts` using `defineDocsConfig`:

```ts
import { defineDocsConfig } from "@rimelight/docs"

export default defineDocsConfig({
  editLink: {
    baseUrl: "https://github.com/your-org/your-repo/edit/main/src/content/docs/"
  },
  sidebar: [
    {
      id: "overview",
      label: "Overview",
      icon: "i-lucide-book-open",
      href: "/{locale}/docs/",
      items: [
        { label: "Home", href: "/{locale}/docs/" },
        { label: "Getting Started", href: "/{locale}/docs/getting-started" }
      ]
    },
    {
      id: "features",
      label: "Features",
      icon: "i-lucide-layers",
      items: [
        { label: "Authentication", href: "/{locale}/docs/auth" },
        {
          label: "Database",
          collapsed: true,
          items: [
            { label: "Overview", href: "/{locale}/docs/database" },
            { label: "Migrations", href: "/{locale}/docs/database/migrations" }
          ]
        }
      ]
    }
  ]
})
```

The `{locale}` placeholder in `href` values is replaced at render time with the active locale (e.g. `en`, `pt`).

### Sidebar Item Options

| Option      | Type                   | Description                              |
| ----------- | ---------------------- | ---------------------------------------- |
| `label`     | `string`               | Display text                             |
| `href`      | `string`               | URL (use `{locale}` placeholder)         |
| `icon`      | `string`               | UnoCSS icon class (e.g. `i-lucide-book`) |
| `badge`     | `string \| BadgeProps` | Optional badge (text + colour)           |
| `collapsed` | `boolean`              | Start collapsed (default: `false`)       |
| `items`     | `SidebarItem[]`        | Nested child items                       |

---

## Table of Contents

The ToC is auto-generated from the headings in each MDX file. By default it includes `h2` and `h3` headings. You can override this per-page in frontmatter:

```md
---
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 4
---
```

Or disable it entirely:

```md
---
tableOfContents: false
---
```

---

## Edit Links

Each page displays an "Edit this page" link pointing to the source file on GitHub. Configure the base URL in `docs.config.ts`:

```ts
editLink: {
  baseUrl: "https://github.com/your-org/repo/edit/main/src/content/docs/"
}
```

Disable on a specific page with `editUrl: false` in frontmatter.

---

## Writing MDX

Doc files can use standard Markdown and also import and render Rimelight UI components:

```markdown
---
title: My Page
description: An example MDX page.
---

import RLACard from "@rimelight/ui/components/card/RLACard.astro"

<RLACard title="Hello" description="This is a card." href="/en/docs/" />

## Standard Markdown

Everything below is **regular Markdown**.
```

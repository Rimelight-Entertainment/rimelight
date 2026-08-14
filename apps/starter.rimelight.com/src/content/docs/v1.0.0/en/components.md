---
title: Components
description: Overview of the Rimelight UI component library — Astro server components and Vue interactive components.
---

The starter is built on **Rimelight UI** (`@rimelight/ui`), a component library designed for Astro applications. Components are split into two categories: **Astro components** (server-rendered, zero JS by default) and **Vue components** (hydrated on the client for interactivity).

---

## Astro Components (Server-Side)

Astro components compile fully on the server and ship no JavaScript to the browser unless explicitly specified. Import them in `.astro` files:

```astro
import RLAButton from "@rimelight/ui/components/button/RLAButton.astro"
```

### Layout & Navigation

| Component            | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `RLAHeader`          | Top navigation bar with logo, nav links, and action slots |
| `RLAFooter`          | Site footer with configurable columns                     |
| `RLASidebar`         | Collapsible sidebar for docs/dashboard layouts            |
| `RLABreadcrumb`      | Breadcrumb trail from current route                       |
| `RLATableOfContents` | Auto-generated anchor links from page headings            |

### Content Display

| Component      | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| `RLACard`      | Linked content card with title, description, and optional icon/image |
| `RLAGrid`      | Responsive CSS grid wrapper for card layouts                         |
| `RLABadge`     | Inline status badge with semantic colour variants                    |
| `RLAAvatar`    | User avatar with fallback initials                                   |
| `RLACodeBlock` | Syntax-highlighted code block with copy button                       |
| `RLAImage`     | Optimised `<img>` wrapper using Astro's image service                |

### Forms & Inputs

| Component     | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `RLAButton`   | Button with `default`, `outline`, `ghost`, and `destructive` variants |
| `RLAInput`    | Labelled text input with error state support                          |
| `RLASelect`   | Native `<select>` with styled wrapper                                 |
| `RLACheckbox` | Accessible checkbox with label                                        |
| `RLATextarea` | Multi-line text input                                                 |

### Feedback & Overlays

| Component           | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `RLAAlert`          | Contextual alert block (`info`, `success`, `warning`, `error`) |
| `RLAToast`          | Toast notification trigger (pairs with the Vue toast manager)  |
| `RLAModal`          | Accessible dialog (`<dialog>` element) with slot-based content |
| `RLASkeletonLoader` | Animated placeholder while content loads                       |

### Search

| Component   | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| `RLASearch` | Full-site search overlay triggered by keyboard shortcut or button |

---

## Vue Components (Client-Side)

Vue components run in the browser and handle stateful interactions. Import them in Astro pages using the `client:*` directive:

```astro
import RLVCommandPalette from "@rimelight/ui/components/command-palette/RLVCommandPalette.vue"

<RLVCommandPalette client:load />
```

### Interactive UI

| Component           | Description                                  |
| ------------------- | -------------------------------------------- |
| `RLVCommandPalette` | `⌘K` command palette for navigating the site |
| `RLVShortcuts`      | Keyboard shortcut cheat-sheet overlay        |
| `RLVColorPicker`    | Full-featured HSL/HEX color picker input     |
| `RLVRichTextEditor` | ProseMirror-based rich text editor           |

### Forms

| Component       | Description                        |
| --------------- | ---------------------------------- |
| `RLVCombobox`   | Searchable combobox / autocomplete |
| `RLVDatePicker` | Calendar-based date selection      |
| `RLVToggle`     | Animated toggle switch             |
| `RLVSlider`     | Range slider with min/max/step     |

### Communication

| Component             | Description                                 |
| --------------------- | ------------------------------------------- |
| `RLVChatPrompt`       | AI-style prompt input with send action      |
| `RLVNotificationBell` | Notification centre with unread count badge |

---

## Logos

Logos are configured in `astro.config.ts` via the `ui()` integration and accessed through the `<RLALogo>` component:

```ts
ui({
  logos: {
    logomark: {
      color: "./src/assets/logos/logomark_color.svg",
      white: "./src/assets/logos/logomark_white.svg",
      black: "./src/assets/logos/logomark_black.svg"
    },
    logotype: {
      color: "./src/assets/logos/logotype_color.svg",
      white: "./src/assets/logos/logotype_color.svg",
      black: "./src/assets/logos/logotype_black.svg"
    }
  }
})
```

Replace the SVG files in `src/assets/logos/` with your own brand assets.

---

## Shortcut Categories

Keyboard shortcuts are organised into categories defined in the `ui()` integration config:

```ts
ui({
  shortcuts: {
    categories: {
      system: { label: "System" },
      navigation: { label: "Navigation" }
    }
  }
})
```

Add shortcuts to the registry in any component using the `useShortcuts` composable (Vue) or `defineShortcut` helper (Astro).

---

## Using Components in MDX

All Astro components can be imported and used inside `.mdx` doc files:

```jsx
import RLACard from "@rimelight/ui/components/card/RLACard.astro"
import RLAGrid from "@rimelight/ui/components/grid/RLAGrid.astro"
import RLAAlert from "@rimelight/ui/components/alert/RLAAlert.astro"

<RLAAlert type="warning">This is a warning callout rendered inside MDX.</RLAAlert>

<RLAGrid>
  <RLACard title="Feature A" description="Description of feature A." href="/en/docs/feature-a" />
  <RLACard title="Feature B" description="Description of feature B." href="/en/docs/feature-b" />
</RLAGrid>
```

---
title: Vue Components
description: Client-side interactive components powered by Vue 3 and hydrated with Astro's island architecture.
---

For complex client-side interactions, Rimelight UI provides **Vue 3 components** that hydrate seamlessly on top of Astro's server-rendered HTML. Each Vue component is an isolated "island" — only the component's JavaScript is shipped to the browser, nothing else.

---

## Hydration Directives

Astro controls _when_ a Vue component loads its JavaScript via directives:

| Directive                           | When JS loads                                    |
| ----------------------------------- | ------------------------------------------------ |
| `client:load`                       | Immediately on page load                         |
| `client:idle`                       | When the browser is idle (`requestIdleCallback`) |
| `client:visible`                    | When the component enters the viewport           |
| `client:media="(max-width: 768px)"` | When a media query matches                       |
| `client:only="vue"`                 | Never server-renders — pure client component     |

Example:

```astro
import RLVCommandPalette from "@rimelight/ui/components/command-palette/RLVCommandPalette.vue"

<!-- Load immediately — the command palette must be ready on first keypress -->
<RLVCommandPalette client:load />
```

---

## Key Components

### `RLVCommandPalette`

An accessible, keyboard-navigable command palette (`⌘K` / `Ctrl+K`). Supports search, navigation shortcuts, and custom action groups:

```astro
<RLVCommandPalette
  client:load
  :items="commandItems"
  placeholder="Type a command or search..."
/>
```

### `RLVChatPrompt`

A prompt input block for AI interactions, with streaming support and an expandable textarea:

```astro
<RLVChatPrompt
  client:load
  :onSend="handleSend"
  placeholder="Ask anything..."
/>
```

### `RLVColorPicker`

A full-featured colour picker with HSL sliders, HEX input, and a colour swatch history:

```astro
<RLVColorPicker
  client:visible
  v-model="selectedColor"
  :format="'hex'"
/>
```

### `RLVCombobox`

A searchable select / autocomplete:

```astro
<RLVCombobox
  client:idle
  :options="countryList"
  placeholder="Search countries..."
  v-model="country"
/>
```

### `RLVRichTextEditor`

A ProseMirror-based editor with toolbar for bold, italic, lists, and links:

```astro
<RLVRichTextEditor
  client:visible
  v-model="content"
  :toolbarItems="['bold', 'italic', 'link', 'bulletList']"
/>
```

---

## Composables

Vue composables provide shared reactive logic across components:

### `useAuth()`

Wraps the Better Auth client to provide reactive session state:

```ts
import { useAuth } from "@rimelight/ui/composables/useAuth"

const { session, signIn, signOut, isLoading } = useAuth()
```

### `useTheme()`

Reads and toggles the active theme (`light` / `dark` / `system`):

```ts
import { useTheme } from "@rimelight/ui/composables/useTheme"

const { theme, setTheme } = useTheme()
setTheme("dark")
```

### `useShortcuts()`

Registers keyboard shortcuts scoped to a component:

```ts
import { useShortcuts } from "@rimelight/ui/composables/useShortcuts"

useShortcuts({
  "meta+k": () => openCommandPalette(),
  "escape": () => close()
})
```

---

## Passing Data from Astro to Vue

Props flow from Astro templates to Vue components as normal HTML attributes:

```astro
---
const user = await getUser(Astro.locals.session)
---

<RLVUserMenu
  client:load
  :user={user}
  :showNotifications={true}
/>
```

Arrays and objects are serialized automatically by Astro's island bridge.

---

## State Management

For state shared between multiple islands on the same page, use Astro's built-in `nanostores` integration or a lightweight Pinia store. Simple component-local state can live in Vue's `ref()` / `reactive()` as usual.

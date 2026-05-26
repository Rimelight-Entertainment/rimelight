# Next Steps — Component Replication Priority

This document ranks Nuxt UI components by their **estimated implementation complexity** for replication
in `@rimelight/ui`'s Astro-native, UnoCSS-first pattern.

The ranking is based on five factors analysed directly from the Nuxt UI source:

1. **Lines of code** — raw size proxy for internal logic
2. **Reka UI primitives used** — each primitive (e.g. `PopoverRoot`, `DialogContent`) represents a
   behaviour contract that needs replacing with either a native HTML equivalent or a headless library
3. **Internal component coupling** — how many other Nuxt UI components it imports
4. **Interactivity requirement** — whether the component needs JS at all, or whether it's purely structural/visual
5. **Composability inside Vue islands** — Astro components cannot be imported inside `.vue` files.
   Components that are likely to be used _as children inside Vue islands_ at runtime (e.g. `Icon`
   inside a `DropdownMenu` item, `Badge` inside a `Select` option) need a Vue equivalent regardless
   of their own complexity — otherwise consumers are forced into the awkward `<slot>` workaround
   which breaks down as soon as the child needs to communicate state back up.

Each component now also carries a **primary target** judgment:

- 🟢 **Astro-only** — Pure HTML/CSS output. No client JS needed. Ship as `.astro` only.
- 🟡 **Astro-primary** — Astro renders the structure; a small inline `<script>` or `client:load` island handles interactivity. A Vue version may be offered for controlled/reactive use cases but is not the default.
- 🔴 **Vue-primary** — Reactive state, prop drilling, or complex event handling makes Vue the natural primary target. Astro wrapper may exist for SSR convenience but delegates to the Vue component.

The tables below also include a **Also needs Vue?** column that captures the composability consideration
independently of the primary target. A component can be 🟢 Astro-only in terms of its own behaviour
but still warrant a Vue version because it lives inside Vue islands at runtime.

---

## Tier 1 — Low Hanging Fruit (Purely Structural / No JS)

These components have **zero or minimal Reka UI dependency**, no significant internal coupling, and
can be built as pure Astro components with only CSS and class composition.

| Component     | Lines | Primary Target   | Also needs Vue? | Reasoning                                                                                                                                                     |
| ------------- | ----- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Skeleton`    | 48    | 🟢 Astro-only    | No              | Never a child of a Vue island. Page-level loading state only.                                                                                                 |
| `Container`   | 48    | 🟢 Astro-only    | No              | Page-level layout shell. Never composed inside a Vue component.                                                                                               |
| `Card`        | 81    | 🟢 Astro-only    | No              | Outermost container. Always rendered from Astro templates.                                                                                                    |
| `Badge`       | 93    | 🟢 Astro-only    | **Yes**         | Frequently used inside `Select` options, `Tabs` labels, `NavigationMenu` items, `DropdownMenu` items — all Vue islands. Needs a Vue version to be composable. |
| `Chip`        | 94    | 🟢 Astro-only    | **Yes**         | Likely used as an inline indicator inside interactive list components. Vue version needed for composability.                                                  |
| `Separator`   | 119   | 🟢 Astro-only    | **Yes**         | Used as a divider inside `DropdownMenu` and `ContextMenu` — both Vue islands.                                                                                 |
| `Kbd`         | 67    | 🟢 Astro-only    | **Yes**         | Commonly rendered inside `CommandPalette` shortcut hints and `Tooltip` content — both Vue islands.                                                            |
| `Footer`      | 74    | 🟢 Astro-only    | No              | Page-level layout. Always an Astro template outer shell.                                                                                                      |
| `Page`        | 70    | 🟢 Astro-only    | No              | Page-level layout wrapper. Never composed inside a Vue island.                                                                                                |
| `PageAside`   | 63    | 🟢 Astro-only    | No              | Layout slot. Always Astro-level.                                                                                                                              |
| `PageBody`    | 48    | 🟢 Astro-only    | No              | Layout slot. Always Astro-level.                                                                                                                              |
| `PageHeader`  | 91    | 🟢 Astro-only    | No              | Page section. Always Astro-level.                                                                                                                             |
| `PageColumns` | 48    | 🟢 Astro-only    | No              | Layout. Astro-level only.                                                                                                                                     |
| `PageGrid`    | 48    | 🟢 Astro-only    | No              | Layout. Astro-level only.                                                                                                                                     |
| `PageList`    | 50    | 🟢 Astro-only    | No              | Layout. Astro-level only.                                                                                                                                     |
| `Marquee`     | 83    | 🟢 Astro-only    | No              | Page-level animation strip. Never inside a Vue island.                                                                                                        |
| `FieldGroup`  | 64    | 🟢 Astro-only    | No              | Form layout wrapper. Composed in Astro form pages.                                                                                                            |
| `User`        | 115   | 🟢 Astro-only    | **Yes**         | User display appears inside `DropdownMenu` headers and `Sidebar` user sections — Vue islands.                                                                 |
| `Avatar`      | 137   | 🟢 Astro-only    | **Yes**         | Used inside `Select` options, `NavigationMenu`, `DropdownMenu` headers. Needs Vue version for composability.                                                  |
| `AvatarGroup` | 113   | 🟢 Astro-only    | Unlikely        | Usually a standalone display block. Less likely to be nested inside a Vue island.                                                                             |
| `Timeline`    | 184   | 🟢 Astro-only    | No              | Page-level content display. Always Astro-level.                                                                                                               |
| `Empty`       | 111   | 🟢 Astro-only    | **Yes**         | Used as the empty state slot inside `Listbox`, `Select`, and `CommandPalette` — all Vue islands.                                                              |
| `Alert`       | 153   | 🟡 Astro-primary | Unlikely        | Typically a standalone page-level notification. Rarely nested inside an interactive Vue island.                                                               |
| `Banner`      | 209   | 🟡 Astro-primary | No              | Page-level bar. Always Astro-level.                                                                                                                           |
| `BlogPost`    | 209   | 🟢 Astro-only    | No              | Content collection card. Always rendered from Astro.                                                                                                          |
| `BlogPosts`   | 80    | 🟢 Astro-only    | No              | Container for BlogPost. Astro-level.                                                                                                                          |
| `Progress`    | 195   | 🟢 Astro-only    | **Yes**         | Used inside `FileUpload` and `ChatMessages` progress indicators — Vue islands. Vue version needed for reactive value updates.                                 |

**Our existing coverage:** `RLAButton`, `RLAHeader`, `RLASection`, `RLALogo`, `RLAIcon`,
`RLAEmbedYoutube`, `BlogPost`, `BlogPosts` are already implemented.

---

## Tier 2 — Moderate Complexity (Light Reka / Simple Behaviour)

These components have real interactive behaviour but **most of it is achievable without Vue**. The
key question for each is whether native HTML elements (`<details>`, `<input>`, `<dialog>`) provide
sufficient accessibility semantics, or whether a headless primitive is genuinely needed.

| Component     | Lines | Primary Target   | Also needs Vue?                                                                                                                                                                                                                             | Reasoning                                                                                                                           |
| ------------- | ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb`  | 133   | 🟢 Astro-only    | No                                                                                                                                                                                                                                          | Pure `<nav aria-label="breadcrumb"><ol>` HTML structure. Never inside a Vue island.                                                 |
| `FormField`   | 152   | 🟢 Astro-only    | **Yes**                                                                                                                                                                                                                                     | Used inside Vue form components (AuthForm, Form). Needs a Vue version to wrap inputs with label/error in a reactive context.        |
| `Input`       | 224   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Directly composed inside Vue `Form`, `InputMenu`, `Select`. Vue version needed for `v-model` binding and reactive validation state. |
| `Textarea`    | 253   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Same as Input — used inside Vue form islands.                                                                                       |
| `Switch`      | 146   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Used inside Vue form and settings components. Needs `v-model` for two-way binding.                                                  |
| `Checkbox`    | 151   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Used inside `CheckboxGroup` (Vue island). Needs a Vue version for group state management.                                           |
| `RadioGroup`  | 227   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Entire component is a Vue island when reactive. Astro version for static forms only.                                                |
| `Slider`      | 142   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Used inside Vue settings/filter panels. Needs Vue for reactive value binding.                                                       |
| `Collapsible` | 64    | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Used inside `ChatReasoning` and `ChatTool` — both Vue islands. Needs Vue for controlled open state.                                 |
| `Accordion`   | 151   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Used inside `NavigationMenu` mobile variant (Vue island). Needs Vue for programmatic control.                                       |
| `Tabs`        | 205   | 🟡 Astro-primary | **Yes**                                                                                                                                                                                                                                     | Commonly used inside dashboard Vue islands. Vue version for reactive active-tab state.                                              |
| `Pagination`  | 198   | 🟡 Astro-primary | For server-side pagination (most Astro use cases), this is pure `<a>` links — zero JS. For client-side filtering/pagination (e.g. a reactive data table), Vue version is appropriate.                                                       |
| `PinInput`    | 153   | 🔴 Vue-primary   | Auto-advancing focus between digit inputs on keypress is the core behaviour. This is tricky to do correctly with keyboard, paste, and backspace handling. A small vanilla script works but is fragile enough that Vue is the safer primary. |
| `Stepper`     | 206   | 🔴 Vue-primary   | The active step is reactive state that changes based on user actions ("Next", "Back", validation). Astro can render a static stepper, but the component is only useful when it's interactive — which means Vue.                             |

---

## Tier 3 — High Complexity (Multi-Primitive / Overlay Pattern)

Overlay-anchored components (positioned relative to a trigger) are where Vue becomes genuinely
necessary — not because of framework preference but because **DOM positioning and focus trapping
across renders is inherently reactive**.

| Component         | Lines   | Primary Target   | Reasoning                                                                                                                                                                                                                                                                                                             |
| ----------------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Modal`           | 240     | 🟡 Astro-primary | Native `<dialog>` with `showModal()` handles focus trap, scroll lock, and `Escape` key natively. The Astro version uses a `<dialog>` + inline script. Vue version adds controlled open prop and `v-model`. Both are worth shipping — the Astro version covers the majority of cases (confirm dialogs, static modals). |
| `Slideover`       | 227     | 🟡 Astro-primary | Same as Modal — `<dialog>` with a CSS transform slide animation. Astro-primary with a Vue companion for controlled state.                                                                                                                                                                                             |
| `Tooltip`         | 112     | 🟡 Astro-primary | A CSS-only tooltip (`:hover + [role="tooltip"]`) works for 80% of cases and requires zero JS. For show delay, keyboard focus, and programmatic control, a small inline script or Vue is needed. Astro version with `data-tooltip` attribute + CSS is a viable default.                                                |
| `Popover`         | 142     | 🔴 Vue-primary   | The native `popover` API handles show/hide and light-dismiss natively, but **anchor positioning** (aligning the popover to a trigger element) requires either the new CSS `anchor-positioning` spec (not yet baseline) or Floating UI. Both require JS coordination that's cleanest in Vue.                           |
| `Drawer`          | 184     | 🔴 Vue-primary   | Drag gesture (touch/mouse delta tracking) for swipe-to-dismiss is the defining feature. This is reactive state by nature — current drag offset, snap points, animation spring. Vue-primary with no viable Astro equivalent.                                                                                           |
| `Toast / Toaster` | 207+170 | 🔴 Vue-primary   | A toast queue is a reactive data structure (add/remove/expire items). Requires either a Vue component with a Pinia/reactive store, or a vanilla JS singleton. The component itself must stay mounted to manage the queue. No meaningful Astro version.                                                                |
| `DropdownMenu`    | 215     | 🔴 Vue-primary   | Anchored overlay + nested submenus + keyboard navigation (arrow keys, escape, home/end). The positioning is Floating UI territory. While the `popover` API handles the overlay, sub-menu nesting needs tracked focus state — Vue is the right tool.                                                                   |
| `ContextMenu`     | 172     | 🔴 Vue-primary   | Same as DropdownMenu but triggered on right-click at cursor position. Position is dynamic per event. Vue-primary.                                                                                                                                                                                                     |
| `Select`          | 423     | 🔴 Vue-primary   | A custom-styled select listbox (not `<select>`) needs full keyboard nav, active-descendant ARIA, and anchor positioning. The native `<select>` is an option for simple cases but loses all styling control. Vue-primary.                                                                                              |
| `CheckboxGroup`   | 206     | 🟡 Astro-primary | A static group of checkboxes (e.g. a filter sidebar) is pure HTML `<fieldset>`. Vue version for reactive "select all / deselect all" or form-library binding.                                                                                                                                                         |
| `InputNumber`     | 237     | 🔴 Vue-primary   | Increment/decrement buttons mutate the input value on click and hold. Keyboard handling (`ArrowUp`/`Down`) adds to this. Native `<input type="number">` handles this but is unstyleable. Vue-primary.                                                                                                                 |
| `InputTags`       | 221     | 🔴 Vue-primary   | Tag list is a reactive array that updates on `Enter` and `Backspace`. Vue-primary.                                                                                                                                                                                                                                    |
| `ScrollArea`      | 321     | 🔴 Vue-primary   | Custom scrollbar track + thumb requires tracking scroll position and viewport size reactively. CSS `overflow: auto` with styled scrollbars via `::-webkit-scrollbar` is the Astro alternative (limited).                                                                                                              |
| `Table`           | 706     | 🔴 Vue-primary   | Sorting, filtering, and virtual rows all require reactive state. Static tables (read-only, server-rendered) are pure Astro HTML — but then there's no component needed at all. The component is only valuable as Vue for client-side interactivity.                                                                   |
| `Calendar`        | 259     | 🔴 Vue-primary   | Navigation between months, selected date state, range selection — all reactive. Vue-primary.                                                                                                                                                                                                                          |

---

## Tier 4 — Avoid / Deprioritise (Highly Coupled or Specialised)

| Component                      | Lines   | Primary Target | Why Deprioritise                                                                                                                              |
| ------------------------------ | ------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NavigationMenu`               | 566     | 🔴 Vue-primary | Desktop hover + mobile accordion simultaneously. Complex keyboard nav. Vue-primary — but highest actual priority to unblock Tailwind removal. |
| `CommandPalette`               | 663     | 🔴 Vue-primary | Full fuzzy search + virtualised list + keyboard nav. Vue-primary, no Astro equivalent.                                                        |
| `InputMenu`                    | 752     | 🔴 Vue-primary | Most complex component in the library. 5 Reka primitives + combobox + multi-select.                                                           |
| `SelectMenu`                   | 691     | 🔴 Vue-primary | Same as InputMenu.                                                                                                                            |
| `Form`                         | 471     | 🔴 Vue-primary | Schema validation integration. Framework-specific reactive state.                                                                             |
| `AuthForm`                     | 351     | 🔴 Vue-primary | Wraps Form. Requires Form first.                                                                                                              |
| `Editor`                       | 299+    | 🔴 Vue-primary | Tiptap rich text wrapper. External lib dependency.                                                                                            |
| `ColorPicker`                  | 318     | 🔴 Vue-primary | Canvas-based hue/saturation picker. Heavy canvas logic.                                                                                       |
| `InputDate` / `InputTime`      | 225/239 | 🔴 Vue-primary | Full date/time picker. i18n aware.                                                                                                            |
| `FileUpload`                   | 418     | 🔴 Vue-primary | Drag-and-drop, preview, chunked upload. Platform API heavy.                                                                                   |
| `PricingTable`                 | 353     | 🟢 Astro-only  | Marketing component. If built at all, it's static — pure Astro.                                                                               |
| `DashboardSidebar` / `Sidebar` | 230/328 | 🔴 Vue-primary | Tightly coupled to Nuxt router/layout. Would need full redesign.                                                                              |
| `Tree`                         | 403     | 🔴 Vue-primary | Recursive tree with drag-to-reorder.                                                                                                          |
| `Chat*`                        | 149–372 | 🔴 Vue-primary | AI chat suite. Reactive message queue.                                                                                                        |

> **Note on NavigationMenu:** Despite being Tier 4 by complexity, it's our **highest-priority**
> component to replace because it's the primary remaining blocker for eliminating Nuxt UI from the
> codebase. It should be approached as a dedicated project, not an incremental addition.

---

## Summary: Astro vs Vue Split

### By Interactivity

| Category         | Count | Notes                                                                                                                               |
| ---------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 Astro-only    | ~20   | Layout, display, and structural components. Ship first.                                                                             |
| 🟡 Astro-primary | ~15   | Native HTML elements cover the main case; Vue companion for controlled/reactive use. Ship Astro version first, Vue later.           |
| 🔴 Vue-primary   | ~30   | Real reactive state or DOM coordination makes Vue the right primary. Astro wrapper may render shell but delegates to Vue component. |

The key architectural insight: **roughly half the component library doesn't actually need Vue for its own behaviour**.
The components that do need Vue are almost exclusively those involving **positioned overlays**, **reactive
collections** (tag lists, toast queues, option lists), or **drag/gesture interaction**. Everything
else is HTML with good class composition.

### By Composability (the Astro Island Constraint)

Astro components **cannot be imported inside `.vue` files**. A component used as a child inside a
Vue island at runtime needs a Vue equivalent — even if it has zero interactive logic of its own.
This is a separate axis from interactivity, and changes the priority of some "simple" components.

| Category                                          | Components                                                                        | Notes                                                                                                                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page-level shells** (Astro-only, no Vue needed) | Container, Footer, Page\*, Header, Banner, BlogPost, BlogPosts, Marquee, Timeline | Always the outermost Astro template layer. Never a child of a Vue island.                                                                                                           |
| **UI primitives** (need Vue for composability)    | Icon, Badge, Chip, Kbd, Separator, Avatar, Empty, Progress, User                  | Simple display components that appear _inside_ DropdownMenus, Selects, CommandPalettes, etc. Their Vue version has no extra behaviour — it's just the same markup in a `.vue` file. |
| **Form primitives** (need Vue for `v-model`)      | Input, Textarea, Checkbox, Switch, RadioGroup, Slider, FormField                  | Composed inside Vue form islands for reactive binding.                                                                                                                              |
| **Interactive building blocks** (Vue inherently)  | Collapsible, Accordion, Tabs, Modal, Toast, Popover, Select, etc.                 | These are Vue islands themselves.                                                                                                                                                   |

> **Practical rule of thumb:** If a component is small enough to feel like a "primitive" (Badge, Icon,
> Kbd, Separator, Avatar), it almost certainly needs a Vue version — because the complex Vue components
> will want to use it internally. Prioritise Vue versions for primitives even when their own logic
> is trivial.

---

## Recommended Work Order

```
Phase A — Complete Tier 1 Astro-only (1–2 sprints)
  Skeleton, Badge, Chip, Separator, Kbd
  Avatar, AvatarGroup, User
  Alert, Banner (with inline dismiss script)
  Empty, Timeline, Card

Phase B — Astro-primary Forms & Layout (1–2 sprints)
  Input, Textarea (with inline auto-resize)
  Checkbox, RadioGroup, Switch (native HTML elements)
  FormField, FieldGroup
  Breadcrumb, Pagination (server-side link version)

Phase C — Astro-primary Interaction (1–2 sprints)
  Collapsible, Accordion (native <details>)
  Tabs (CSS :target version + scripted version)
  Modal, Slideover (native <dialog>)
  Tooltip (CSS-only baseline)

Phase D — NavigationMenu (dedicated project)
  Research: native popover API vs Floating UI vs custom
  Implement desktop hover variant (Vue)
  Implement mobile accordion variant (can be Astro-primary)
  Roll out across all sites → enables Tailwind removal

Phase E — Vue-primary Overlays (ongoing, as needed)
  Toast / Toaster
  Popover (Floating UI)
  DropdownMenu, ContextMenu
  Select

Phase F — Advanced Vue (as product needs dictate)
  InputNumber, InputTags
  Table (client-side interactive)
  Calendar
```

---

## Complexity & Target Reference

| Factor         | 🟢 Astro-only | 🟡 Astro-primary                        | 🔴 Vue-primary                     |
| -------------- | ------------- | --------------------------------------- | ---------------------------------- |
| JS requirement | None          | Inline script / single event listener   | Reactive state / Vue reactivity    |
| Interactivity  | None          | Toggle, dismiss, auto-resize            | Overlay positioning, queues, drag  |
| State          | None          | At most `hidden` / `open`               | Reactive arrays, controlled values |
| ARIA           | Native HTML   | Native HTML + minor attribute scripting | Programmatic `aria-*` updates      |

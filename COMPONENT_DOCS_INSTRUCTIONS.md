# Component Docs Consistency Instructions

These instructions are for the next agent tasked with completing the documentation
for all rimelight-ui component pages under:

```
packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/
```

The **button**, **avatar**, **avatar-group**, **badge**, **banner**, and **chip** pages
in `element/` have already been done and serve as the gold standard. Read them before
starting any other page.

---

## The Pattern — Non-Negotiable Rules

Every component page must follow these rules **without exception**.

### 1. File Structure

```mdx
---
title: "ComponentName"
description: "One concise sentence describing what it does."
---

import ComponentShowcase from "@/components/ComponentShowcase.astro"
import RLAComponentName from "@rimelight/ui/components/astro/RLAComponentName.astro"
import ApiProps from "@rimelight/ui/docs/components/ApiProps.astro"
import ApiSlots from "@rimelight/ui/docs/components/ApiSlots.astro"
import ApiEmits from "@rimelight/ui/docs/components/ApiEmits.astro"
import ApiTheme from "@rimelight/ui/docs/components/ApiTheme.astro"
import ApiChangelog from "@rimelight/ui/docs/components/ApiChangelog.astro"

One or two sentences describing the component and its main capabilities.

## Usage

<ComponentShowcase>
  <!-- basic usage, always first -->
</ComponentShowcase>

## Examples

<ComponentShowcase title="..." description="...">
  <!-- one per notable prop or concept -->
</ComponentShowcase>

## API

### Props

<ApiProps component="component-name" />

### Slots

<ApiSlots component="component-name" />

### Emits

<ApiEmits component="component-name" />

## Theme

<ApiTheme component="component-name" />

## Changelog

<ApiChangelog component="component-name" />
```

The `component` value in `<ApiProps>` etc. is the **kebab-case** component name
(e.g. `"avatar-group"`, `"color-slider"`, `"form-field"`).

---

### 2. ComponentShowcase — Every Instance Must Have Both Code Tabs

Every `<ComponentShowcase>` **without exception** must contain both:

- `<div slot="code-astro">` with an astro code block
- `<div slot="code-vue">` with a vue code block

**No excuses.** Even if the component has no Vue equivalent yet, write a fictional
`RLV*` version. Use the same prop names, and convert boolean shorthands to `:prop="true"`.

The Usage showcase also includes the import statement in the code-astro block:

````mdx
<ComponentShowcase>
  <RLAButton label="Button" />

  <div slot="code-astro">
    ```astro
    ---
    import RLAButton from "@rimelight/ui/components/astro/RLAButton.astro";
    ---

    <RLAButton label="Button" />
    ```

  </div>

  <div slot="code-vue">
    ```vue
    <script setup>
    import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
    </script>

    <template>
      <RLVButton label="Button" />
    </template>
    ```

  </div>
</ComponentShowcase>
````

The Vue component name is always `RLA` → `RLV` substitution (e.g. `RLABadge` → `RLVBadge`).
All other examples after Usage do NOT need to repeat the import.

---

### 3. Code Samples Must Exactly Mirror the Live Preview

If the live preview shows 4 elements, the code sample shows those exact same 4 elements
with the exact same props. **No HTML or code comments at all in code blocks.**
No abridged versions. Just clean usage code.

**Wrong:**

```astro
<!-- Dot indicator -->
<RLAAvatar src="..." badge badgeColor="success" />
<!-- Numeric badge -->
<RLAAvatar src="..." badge={5} />
```

**Correct:**

```astro
<RLAAvatar src="https://i.pravatar.cc/150?img=1" badge badgeColor="success" badgePosition="bottom-right" />
<RLAAvatar src="https://i.pravatar.cc/150?img=2" badge badgeColor="warning" badgePosition="top-right" />
<RLAAvatar src="https://i.pravatar.cc/150?img=3" badge badgeColor="error" badgePosition="bottom-left" />
<RLAAvatar src="https://i.pravatar.cc/150?img=4" badge={5} badgeColor="primary" badgePosition="top-left" />
```

---

### 4. Interactive Props (propsConfig) — When and How

Use `propsConfig` + `togglingPattern="tab-segmented"` for props whose values are a
**finite list of CSS-theme-driven options** — things like `variant`, `color`, `size`,
`shape`, `position`.

```mdx
<ComponentShowcase
  title="Variants"
  description="Use the `variant` prop to change the visual style."
  togglingPattern="tab-segmented"
  componentName="RLABadge"
  propsConfig={{
    variant: ["solid", "outline", "soft", "subtle"]
  }}
  defaultProps={{
    variant: "solid"
  }}
>
  <RLABadge label="Badge" />
</ComponentShowcase>
```

**Do NOT use `propsConfig` for:**

- Icon class strings (e.g. `leadingIcon="i-lucide-download"`) — the showcase
  system only swaps CSS classes on `data-slot` elements, it cannot swap arbitrary
  string prop values. Use a static side-by-side display instead (see button.mdx).
- Any prop whose value changes rendered HTML structure significantly.

When using `propsConfig`, the child component in the slot must already have a
sensible default state that works with ALL values in the config list.

Dynamic showcases (`propsConfig`) auto-generate their code blocks — you do NOT
add `code-astro` / `code-vue` slots to them; the JS does it at runtime.

---

### 5. Static Multi-Item Examples

For things that can't use `propsConfig` (icons, structural variants, combinations),
show a side-by-side static display. Every item in the live preview must appear in
the code sample.

````mdx
<ComponentShowcase
  title="Leading Icon"
  description="Use the `leadingIcon` prop with any icon class."
>
  <div class="flex flex-wrap items-center gap-3">
    <RLAButton label="Download" leadingIcon="i-lucide-download" />
    <RLAButton label="Add" leadingIcon="i-lucide-plus" />
    <RLAButton label="Search" leadingIcon="i-lucide-search" />
  </div>

<div slot="code-astro">
  ```astro
  <RLAButton label="Download" leadingIcon="i-lucide-download" />
  <RLAButton label="Add" leadingIcon="i-lucide-plus" />
  <RLAButton label="Search" leadingIcon="i-lucide-search" />
  ```
</div>

  <div slot="code-vue">
    ```vue
    <template>
      <RLVButton label="Download" leading-icon="i-lucide-download" />
      <RLVButton label="Add" leading-icon="i-lucide-plus" />
      <RLVButton label="Search" leading-icon="i-lucide-search" />
    </template>
    ```
  </div>
</ComponentShowcase>
````

---

### 6. Avatar Initials — Always Use Explicit Color (Not Neutral)

When using `RLAAvatar` with `initials` and no `src`, always set an explicit `color`
prop that is NOT `neutral`. The neutral color uses `text-muted` which is invisible
against the `bg-elevated` background.

```
GOOD:  <RLAAvatar initials="JD" color="primary" />
GOOD:  <RLAAvatar initials="AB" color="secondary" />
BAD:   <RLAAvatar initials="JD" />
BAD:   <RLAAvatar initials="JD" color="neutral" />
```

For overflow indicators (e.g. `+8`), omit the color prop entirely (default) — if
the text is still not visible, use `color="primary"`.

---

### 7. Real Images in Avatar Examples

Use `https://i.pravatar.cc/150?img=N` (N = 1–70) for all avatar image examples.
Do not use placeholder services that may be unreliable or produce broken images.

---

### 8. Verified Icon Names

Only use icons confirmed to exist in Lucide. Safe choices include:
`i-lucide-download`, `i-lucide-plus`, `i-lucide-search`, `i-lucide-star`,
`i-lucide-heart`, `i-lucide-trash-2`, `i-lucide-arrow-right`, `i-lucide-chevron-down`,
`i-lucide-external-link`, `i-lucide-check`, `i-lucide-x`, `i-lucide-cog`,
`i-lucide-info`, `i-lucide-user`, `i-lucide-mail`, `i-lucide-calendar`,
`i-lucide-bell`, `i-lucide-upload`, `i-lucide-share`, `i-lucide-copy`,
`i-lucide-eye`, `i-lucide-eye-off`, `i-lucide-lock`, `i-lucide-unlock`,
`i-lucide-settings`, `i-lucide-filter`, `i-lucide-refresh-cw`, `i-lucide-send`.

---

### 9. Banner Showcases — Always Disable Fixed Positioning

`RLABanner` defaults to `fixed={true}` which positions it at the top of the
viewport and breaks showcase layout. All live previews must pass:

```
fixed={false} sticky={false}
```

Do NOT put these overrides in the code sample — users want the real positioning behavior.

---

### 10. Replace Stub Descriptions

Replace all pages that still have stub descriptions like:

```
description: "This component is currently under development."
```

with a real one-sentence description of what the component does.

---

## How to Approach Each Component

1. **Read the component source** at:
   `packages/ui/src/components/astro/RLA<Name>.astro`
   Extract all props from the destructuring block.

2. **Read the types file** at:
   `packages/ui/src/types/components/<name>.ts`
   This has the full prop list with JSDoc comments.

3. **Identify prop categories:**
   - Theme-driven (variant, color, size, shape, position) → `propsConfig`
   - Structural/boolean flags → static before/after comparison showcase
   - Icon strings → static side-by-side showcase
   - Slot-based features → static showcase showing slot usage
   - Array/object props (e.g. `actions`, `items`) → static example

4. **Write examples in this order** (adapt as appropriate):
   - Usage (basic, always first)
   - Variants (if applicable)
   - Colors (if applicable)
   - Sizes (if applicable)
   - Shape/position/other finite enums (if applicable)
   - Icon props (if applicable, static)
   - Boolean flags as before/after comparison (if applicable)
   - Slot usage examples (if applicable)
   - Combined/real-world example (optional but good)

5. **Check the Vue components** directory:
   `packages/ui/src/components/vue/`
   to verify which components have real Vue equivalents.
   Write real imports for those; fictional `RLV*` for others.

---

## Component Categories Remaining

The following directories each contain MDX files that need to be updated.
Check each file — if it has stub content or a stub description, rewrite it fully.

```
components/
  element/
    DONE: button, avatar, avatar-group, badge, banner, chip
    TODO: calendar, card, callout, collapsible, field-group,
          fieldset, kbd, label, logo, separator, speed-dial

  form/
    TODO: checkbox, color-area, color-field, color-picker, color-slider,
          file-upload, form-field, form, input-date, input-menu, input-number,
          input-tags, input-time, input, knob, listbox, password, pin-input,
          radio-group, select, slider, switch, textarea

  ai/         TODO: all files
  app/        TODO: all files
  dashboard/  TODO: all files
  data/       TODO: all files
  editor/     TODO: all files
  effect/     TODO: all files
  layout/     TODO: all files
  media/      TODO: all files
  mockup/     TODO: all files
  navigation/ TODO: all files
  overlay/    TODO: all files
  page/       TODO: all files
  utility/    TODO: all files
```

---

## Working Example References

Read these files as your canonical reference before starting any new page:

- `packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/element/button.mdx`
  — interactive propsConfig + static icon examples + link mode + avatar + active state

- `packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/element/avatar.mdx`
  — image + initials + badge indicator + badge positions + profile layout

- `packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/element/badge.mdx`
  — pure propsConfig pattern + static comparison example

- `packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/element/banner.mdx`
  — slot-heavy component with actions array + dismissable + fixed/sticky explanation

- `packages/rimelight.com/src/content/docs/en/packages/rimelight-ui/components/element/chip.mdx`
  — attached vs standalone + position toggle + inset comparison + show/hide

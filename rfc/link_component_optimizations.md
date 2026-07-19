# RFC-0004: Link Component Optimizations & Consistency

- **Status**: **Draft**
- **Author(s)**: Antigravity / AI Assistant
- **Created**: 2026-07-19
- **Last Updated**: 2026-07-19
- **Discussion/PR**: N/A

---

## 1. Summary

This RFC outlines proposed optimizations, bug fixes, and typing improvements for the Link components (`RLALink`, `RLSLink`, `RLVLink`) within Rimelight UI. The goal is to address framework-specific discrepancies, fix a class duplication bug in the Vue variant, implement helper-level micro-optimizations, and establish a strategy for type safety that does not break the documentation metadata extraction pipeline.

---

## 2. Motivation

Reviewing the framework-specific implementations of the Link component in the `@rimelight/ui` package revealed several inconsistencies and areas for improvement:

- **Attribute Bug**: The Vue variant (`RLVLink.vue`) suffers from a class inheritance issue where custom classes pass down to the root element twice due to standard fallthrough behavior.
- **API Inconsistencies**: The Astro, Vue, and Solid variants have slight discrepancies in slot/prop naming conventions and template setups.
- **Typing Quality**: Props like `class` and `ui` are typed as `any` in `LinkProps`, which is type-unsafe.
- **Performance**: The URL pattern checker re-compiles its regex on every execution of the URL resolution helper.

---

## 3. Detailed Design

### 3.1. Proposed API & Code Changes

#### 3.1.1. Extracting Regex to Module Level (Done)

In `helpers.ts`, extract the external URL pattern matcher out of the function scope:

```typescript
// packages/ui/src/components/link/helpers.ts
const EXTERNAL_URL_RE = /^(?:https?:)?\/\//

export function resolveLinkAttrs(props: Partial<LinkProps>) {
  const isExternal = !!(props.external || (props.href && EXTERNAL_URL_RE.test(props.href)))
  // ...
}
```

#### 3.1.2. Solving Vue Attribute Inheritance Bug

Disable automatic attribute inheritance (`inheritAttrs: false`) in `RLVLink.vue` to prevent duplicate classes:

```html
<!-- RLVLink.vue -->
<script setup lang="ts">
  import { computed } from "vue"
  // ... imports

  defineOptions({
    name: "RLVLink",
    inheritAttrs: false
  })

  // ... logic
</script>

<template>
  <a
    v-bind="$attrs"
    :href="attrs.href"
    :target="attrs.target"
    :rel="attrs.rel"
    :aria-label="props.ariaLabel"
    :aria-current="attrs.ariaCurrent"
    :aria-disabled="attrs.ariaDisabled"
    :data-astro-prefetch="attrs.prefetchAttr"
    :class="resolvedClasses.root"
    data-slot="root"
  >
    <!-- Slots content -->
  </a>
</template>
```

#### 3.1.3. Strongly Typed Properties with Metadata Extractor Compatibility

To maintain type safety for styling options (`ui` and `class`) without breaking AST-based metadata extractors in `@rimelight/docs`, we will keep property declarations direct (avoiding typescript `extends` inheritance) because the extractor only loops over `node.members`:

```typescript
// packages/ui/src/components/link/link.ts
export interface LinkProps {
  // ... core props

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: Record<string, string | string[]>
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: string | string[] | Record<string, boolean>
  [key: string]: unknown
}
```

---

## 4. Drawbacks & Trade-offs

- **Code Redundancy**: Keeping `ui` and `class` declarations duplicated inside every component's prop interface instead of a shared base interface means more lines of code to maintain. However, it ensures complete compatibility with the simple, fast AST extraction parser.
- **Vue `inheritAttrs: false` overhead**: Disabling automatic class inheritance requires manually binding other attributes with `v-bind="$attrs"`, adding slight template verbosity.

---

## 5. Alternatives Considered

### Alternative: Upgrading the Docs Meta Extractors

- We could update the Astro and Vue metadata extractors (`extractAstro.ts` and `extractVue.ts`) to recursively resolve imported base interfaces (`extends BaseUIProps`).
- **Why Rejected**: This introduces significantly more complexity to the AST parsing script (handling imports resolution, parsing nested base interfaces, etc.) for a minor developer ergonomics benefit. Keeping local declarations is simple and robust.

---

## 6. Adoption & Migration Strategy

1. Merge the `helpers.ts` regex optimization.
2. Apply `inheritAttrs: false` to `RLVLink.vue` and verify no visual regressions in downstream Vue consumer apps.
3. Gradually update styling prop definitions (`ui` and `class`) across component `*.ts` files to use the stricter record/string typings rather than `any`.

---

## 7. Cross-Cutting Concerns

### 7.1. Performance & Bundle Size

- Moving the regex to module scope saves CPU cycles on link rendering.
- Disabling attribute inheritance avoids overhead from class resolution duplication at runtime in Vue.

### 7.2. Accessibility (a11y)

- No semantic changes are made to how ARIA tags (`aria-label`, `aria-current`, `aria-disabled`) are handled.

---

## 8. Verification & Testing Plan

### 8.1. Automated Tests

Run checking commands to format, lint, and verify typings:

```bash
vp check
vp test
```

---

## 9. Unresolved Questions

1. Should we eventually upgrade `@rimelight/docs` metadata extraction to support recursive type resolution so we can consolidate all global UI props under a single `BaseProps` interface?

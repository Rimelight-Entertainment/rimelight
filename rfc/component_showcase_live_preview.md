# RFC: Live Multi-Framework Previews in ComponentShowcase

- **Status**: Draft
- **Author(s)**: Antigravity (Coding Assistant)
- **Created**: 2026-07-19
- **Last Updated**: 2026-07-19

---

## 1. Summary

Currently, `ComponentShowcase.astro` renders a **live preview** using only the default slot (Astro component), while Vue and Solid code snippets are displayed as static syntax-highlighted text blocks. This proposal adds `preview-vue` and `preview-solid` named slots so that **all three framework implementations render live**, with a tab switcher to toggle between them. Users can then see, interact with, and compare the exact rendered output of each framework variant side by side.

---

## 2. Motivation

### Pain Points

1. **Developer trust gap**: Docs show Vue/Solid code snippets, but users have no way to verify those snippets actually produce the same visual result. This erodes confidence in the multi-framework support.
2. **Framework parity bugs**: When a Vue or Solid component drifts visually from its Astro counterpart (wrong classes, missing slots, icon misalignment), it goes unnoticed until a user files an issue.
3. **Incomplete DX**: Rimelight markets itself as framework-agnostic, but the docs implicitly prioritize Astro. Newcomers evaluating Vue or Solid support must mentally compile the snippet and imagine what it renders.

### Goals

- Render live Vue, Solid, and Astro previews inside every `ComponentShowcase`.
- Toggle between frameworks via a tab bar, with the active preview swapping in place.
- Maintain full compatibility with the existing dynamic showcase system (`propsConfig`, variant toggling, slot visualizer).
- Keep the doc author experience ergonomic — adding a preview slot should feel natural.

### Non-Goals

- Support for additional frameworks beyond Vue, Solid, and Astro (e.g., Svelte, Angular, React) in this iteration.
- Hot-reload or isolated sandbox execution for each preview.
- Removing or deprecating the existing code snippet slots (`code-astro`, `code-vue`, `code-solid`).

---

## 3. Detailed Design

### 3.1. Proposed API / Usage

A doc page would evolve from this (current):

````astro
<ComponentShowcase>
  <RLALink href="/">Go to Home</RLALink>

  <div slot="code-astro">
    ```astro
    <RLALink href="/">Go to Home</RLALink>
    ```
  </div>
  <div slot="code-vue">
    ```vue
    <RLVLink href="/">Go to Home</RLVLink>
    ```
  </div>
  <div slot="code-solid">
    ```tsx
    <RLSLink href="/">Go to Home</RLSLink>
    ```
  </div>
</ComponentShowcase>
````

To this (proposed):

````astro
<ComponentShowcase>
  <RLALink href="/" slot="preview-astro">Go to Home</RLALink>
  <RLVLink href="/" slot="preview-vue">Go to Home</RLVLink>
  <RLSLink href="/" slot="preview-solid">Go to Home</RLSLink>

  <div slot="code-astro">
    ```astro
    <RLALink href="/">Go to Home</RLALink>
    ```
  </div>
  <div slot="code-vue">
    ```vue
    <RLVLink href="/">Go to Home</RLVLink>
    ```
  </div>
  <div slot="code-solid">
    ```tsx
    <RLSLink href="/">Go to Home</RLSLink>
    ```
  </div>
</ComponentShowcase>
````

**Backward compatibility**: If only the default slot (Astro) is provided, the component falls back to current behavior — no framework tabs shown, just the single live preview. This lets authors migrate gradually.

### 3.2. Architecture & File Changes

#### 3.2.1. `ComponentShowcase.astro`

**Template changes:**

1. Add a **preview framework tab bar** above the preview area (similar to the existing code tab bar):

   ```
   [Astro] [Vue] [Solid]
   ```

   Each tab sets `activePreview` to the corresponding key. Tabs only appear if the corresponding slot is provided.

2. Replace `<slot />` in the preview area with a conditional render:

   ```
   {#if activePreview === 'astro'}
     <slot name="preview-astro" />
   {:else if activePreview === 'vue'}
     <slot name="preview-vue" />
   {:else if activePreview === 'solid'}
     <slot name="preview-solid" />
   {/if}
   ```

3. Detect which preview slots are provided:

   ```
   const hasAstroPreview = Astro.slots.has('preview-astro') || (!hasVuePreview && !hasSolidPreview)
   const hasVuePreview = Astro.slots.has('preview-vue')
   const hasSolidPreview = Astro.slots.has('preview-solid')
   ```

4. **Dynamic showcase (variant toggling)**: The `updateComponent()` JS function currently clones `originalTemplate` (the first child of `.preview-slot-wrapper`). This must be extended to cache **three** templates — one per framework — and clone the active one. The `applyStylesToClone` and `getCustomClasses` helpers work on DOM nodes and are framework-agnostic, so they need no changes.

5. **Slot visualizer (`refreshSlotVisualizer`)**: This inspects `[data-slot]` attributes in the rendered DOM and is already framework-agnostic. No changes needed.

**Client JS changes:**

- Add a `previewFramework` state variable (default: `'astro'`).
- Add click handlers on the preview tab bar to swap `previewFramework` and re-render.
- For dynamic showcases, the per-framework templates must be captured on first render and swapped via `cloneNode(true)` on tab change.

#### 3.2.2. Files Modified

| File                                                            | Change                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `packages/rimelight.com/src/components/ComponentShowcase.astro` | Add preview slots, tab bar, dynamic template caching for 3 frameworks                     |
| `packages/rimelight.com/src/content/docs/v1/en/**/*.mdx`        | ~137 files, ~311 `ComponentShowcase` usages — add `preview-vue` and `preview-solid` slots |

No changes to `@rimelight/ui` components — they already exist in all three frameworks.

### 3.3. Key Components

#### Preview Tab Bar

Rendered between the "controls area" and the preview area. Only shown when 2+ preview slots are filled:

```astro
<div class="preview-tabs flex items-center gap-1 border-b border-border px-4 py-1.5">
  {hasVuePreview && (
    <button class:list={['preview-tab', { active: activePreview === 'vue' }]}
            data-preview="vue">Vue</button>
  )}
  {hasSolidPreview && (
    <button class:list={['preview-tab', { active: activePreview === 'solid' }]}
            data-preview="solid">Solid</button>
  )}
  {hasAstroPreview && (
    <button class:list={['preview-tab', { active: activePreview === 'astro' }]}
            data-preview="astro">Astro</button>
  )}
</div>
```

#### Template Caching (Dynamic Showcase JS)

```js
const templates = {
  astro: previewWrapper?.querySelector('[data-preview="astro"]')?.cloneNode(true),
  vue: previewWrapper?.querySelector('[data-preview="vue"]')?.cloneNode(true),
  solid: previewWrapper?.querySelector('[data-preview="solid"]')?.cloneNode(true)
}

function updateComponent() {
  const activeTpl = templates[previewFramework]
  if (!activeTpl) return
  // ... existing variant resolution logic, but applied to the cloned activeTpl
}
```

#### Backward Compatibility Path

```astro
<!-- Determine default preview -->
{
  const hasAnyNamedPreview = hasVuePreview || hasSolidPreview
  const defaultPreview = hasVuePreview ? 'vue' : hasSolidPreview ? 'solid' : 'astro'
  // If no named preview slots, Astro is implicitly the default via <slot />
}
```

---

## 4. Drawbacks & Trade-offs

### Bundle Size

Each doc page will now mount up to three framework components instead of one. Since `@astrojs/vue` and `@astrojs/solid-js` are already registered, the runtime overhead is the component instantiation cost — typically negligible for simple components (buttons, links, badges), but could add up for complex ones (chat, carousel, dashboard). SSR output will also be larger (3× the HTML per showcase).

**Mitigation**: Lazy island hydration via `client:visible` could be applied to non-default previews where feasible, though this conflicts with the interactive dynamic showcase mode.

### Author Ergonomics

Each doc page becomes more verbose — every `<ComponentShowcase>` instance roughly triples in size. For components with many usage examples (e.g., Button with 10 showcases), the MDX file grows substantially.

**Mitigation**: A future enhancement could auto-generate preview slots with a convention-based helper macro, but this RFC keeps it explicit for clarity.

### Build Time

Astro will compile 3× the number of component instances per showcase. Given ~311 showcases across 137 files, this could add meaningful build time. Exact impact depends on component complexity.

### Maintenance Surface

The slot visualizer, dynamic class resolution, and template cloning logic must now handle three parallel DOM trees. Bugs in one framework's rendering (e.g., missing `data-slot` attributes) could cascade into the showcase UI.

---

## 5. Alternatives Considered

### A. Iframe Sandbox per Framework

Isolate each preview in a shadow DOM or `<iframe>` to guarantee no framework conflicts. **Rejected**: Over-engineered for the use case; Astro already handles framework isolation at the compiler level. Iframes break the slot visualizer (can't inspect DOM across boundaries) and hurt performance.

### B. Auto-Generate Non-Astro Previews from Theme

Derive Vue/Solid previews from a single theme descriptor, eliminating the need for separate slots. **Rejected**: Components have framework-specific logic (event handling, conditional rendering, slot structures) that a theme descriptor cannot express. The preview would not match the actual component behavior.

### C. Single Default Slot + Internal Re-Implementation

Keep one slot and internally re-implement the component in Vue/Solid using the theme. **Rejected**: Duplicates component logic in the showcase layer, creating a second source of truth that will diverge.

### D. Code Snippet → "Run" Button (Codesandbox / Stackblitz)

Replace live previews with editable sandboxes. **Rejected**: Useful for playgrounds but disrupts the smooth doc-reading experience. Sandboxes also add significant page weight and loading latency.

### E. Gradual Per-Component Migration

Start with a few high-traffic components (Button, Link, Input) and extend based on user feedback. **Viable alternative** — see Section 6.

---

## 6. Adoption & Migration Strategy

| Phase       | Scope                                                                                                         | Effort                           |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Phase 1** | Refactor `ComponentShowcase.astro` to support `preview-*` slots, template caching, and backward compatibility | 1 day                            |
| **Phase 2** | Migrate a handful of core component docs (Link, Button, Input, Badge, Select) as a pilot                      | ~2 hours                         |
| **Phase 3** | Bulk-migrate remaining ~306 showcases across ~130 files via a codemod script                                  | 4–6 hours script + manual review |
| **Phase 4** | Ship, monitor build times, fix framework-specific rendering quirks                                            | Ongoing                          |

### Codemod Strategy

A codemod script (Node.js + AST traversal on MDX, or simple regex replacement) would:

1. Find `<ComponentShowcase>` blocks that have `slot="code-vue"` / `slot="code-solid"` but no `slot="preview-*"`.
2. Parse the Astro code snippet (`slot="code-astro"`) to extract the component tag and props.
3. Generate Vue and Solid equivalents by:
   - Replacing the component tag (`RLALink` → `RLVLink` / `RLSLink`)
   - Converting boolean prop syntax (`noExternalIcon` → `:noExternalIcon="true"` for Vue)
4. Insert `<RLVLink slot="preview-vue" ...>` and `<RLSLink slot="preview-solid" ...>`.

**Accuracy**: The codemod will be conservative — it only handles simple self-closing tags. Complex showcases with children, wrappers, or inline expressions will be flagged for manual review.

### Backward Compatibility

- If only the default slot is provided, `ComponentShowcase` behaves identically to today.
- Existing `slot="code-*"` slots continue to work unchanged.
- No breaking changes to the `ComponentShowcase` API.

---

## 7. Cross-Cutting Concerns

### 7.1. Performance & Bundle Size

- **SSR output**: Each showcase renders 3 component trees instead of 1. For a typical page with 5 showcases, this could mean ~15 component instances vs ~5.
- **Client JS**: Vue and Solid hydration bundles are already loaded (registered in `astro.config.ts`). No additional vendor chunks needed. The preview tab JS is minimal (~50 lines).
- **Build time impact**: Estimate +15–30% for doc pages. Benchmark during Phase 2 pilot before committing to Phase 3.

### 7.2. Accessibility (a11y)

- The preview tab bar must use proper `role="tablist"` / `role="tab"` / `role="tabpanel"` semantics and `aria-selected` state.
- Only the active preview should be in the DOM focus order; inactive previews should be `aria-hidden="true"` and `inert` or `display:none`.
- Screen readers should announce when the preview framework changes.

### 7.3. Security & Privacy

- No new attack surface — all components are first-party and compiled server-side.
- The codemod script runs locally and does not access any network.

---

## 8. Verification & Testing Plan

### 8.1. Automated Tests

- **Visual regression**: Existing Playwright or Vitest screenshot tests should capture each preview tab and compare across frameworks for parity.
- **Dynamic showcase**: Verify that toggling variants applies classes correctly to all three framework previews, not just Astro.
- **Slot visualizer**: Confirm it detects and highlights slots in Vue and Solid previews identically to Astro.

```bash
vp check   # lint, type check
vp test    # unit + integration
```

### 8.2. Manual Verification

- Open `/docs/v1/en/packages/rimelight-ui/components/navigation/link` and toggle between Astro, Vue, and Solid previews. Confirm the rendered output is visually identical.
- Test a dynamic showcase (e.g., Button with `variant` propConfig) and verify that changing variants works in all three tabs.
- Test a component with complex children (e.g., Chat with nested elements) to ensure slot alignment across frameworks.
- Test backward compatibility — verify that a showcase with only the default slot renders without preview tabs.

---

## 9. Unresolved Questions

1. **Should interactive components (Select, Popover, Dialog) be live-previewed in all three frameworks?** Complex interactive components may behave differently across frameworks (event handling, focus management). We may need to flag certain showcases as "Astro-only preview" with a note.
2. **How do we handle components that don't have a Vue or Solid equivalent yet?** Some components may exist only in Astro. The preview tab bar should dynamically omit missing frameworks.
3. **Should the preview default to the user's preferred framework?** Could store a cookie or localStorage key so that a Vue developer always lands on the Vue preview tab.
4. **What about the slot visualizer's overlay positioning?** When the active preview changes, overlays hide the wrong elements until the slot list is re-queried. The `refreshSlotVisualizer` call must be gated on the active preview being visible.
5. **Can we lazy-load non-Astro previews with `client:visible`?** This would reduce SSR payload but breaks the dynamic showcase's client-side DOM cloning. Needs investigation during Phase 1.

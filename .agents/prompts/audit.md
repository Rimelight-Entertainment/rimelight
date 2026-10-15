# Rimelight Component Audit

## Parameters:

- Current component to audit:
  - RL
- Reference docs (if available):
  -

## Objective

Audit a component file to ensure strict adherence to our design patterns and functionality targets. The component must pass all checks and tests and have full API parity with the reference when provided, barring deliberate functionality additions and improvements over the reference.

## Context

- Components are built with SolidJS 2.0.
- Nuxt UI is the main reference and is used for API and slot patterns when provided.
- Nuxt UI is cloned locally under `WebStormProjects/ui` for reference; component docs will be provided if available.
- Some components are still non-functional/barebones/placeholder and will need to be built directly.
- Components are never meant to add new dependencies to the package, even if the original reference uses one. All functionality is meant to be rebuilt directly.
- Components should use other RL components internally when possible, instead of manual re-implementations for common functionality. i.e. If an RLModal has an action, it uses an RLButton not a <button>.
- Assume this starting state without re-verifying it at the start of your work. This is a strict order to preserve token usage:
  - Git status for related components is clean.
  - Checks all pass.
  - Tests all pass.
- There is often work being done in parallel — ignore unrelated changes or errors. Stay focused solely on the scope of your component and its subcomponents.
- Assume a clean dev server restart happens after every change and manual verification.
- I might make changes alongside you. Anything that differs from what you produced was changed by me and should be kept that way.

## Scope

### In scope

- The component file, its theme entries, its tests, and its audit page entry.

### Out of scope

- Creation of new subcomponents without asking permission and providing context as to why it would be needed or why it would be a reasonable addition to the library.
- Making changes to core library root files that touch the entire infrastructure. If you strongly believe there is a bug or possible improvement to one of them, you are to specifically request permission after explaining your reasoning.
- Changing lint or formatting rules to make components comply or to match Nuxt UI's.
- Using ignore comments to bypass checks and tests.
- Commenting the code to specify how it matches Nuxt UI or how it complies to the audit.

## Requirements

- Standardized Solid 2.0 component design: strictly native Solid 2.0 idioms.
  - Zero Vue or Astro artifact patterns: no `v-*`, `v-model`, `modelValue`, `$slots`, `$attrs`, `$emit`, or Astro slot mechanisms.
  - Zero backwards compatibility requirements: do not support legacy prop aliases (e.g. `leading-icon`, `aria-label`, `slot:trigger`, or dynamic string bags) or runtime polyfills.
- Component signature and typing:
  - Exclusively named exports with the exact form: `export const RL<Name>: Component<RL<Name>Props> = (props) => { ... }`.
  - Generic components must export `export const RL<Name> = <T,>(props: RL<Name>Props<T>) => { ... }` or typed component interface. No `export default`.
  - No type or interface declarations inside `RL<Name>.tsx`. All types, interfaces, and helper types live strictly in `<name>.types.ts`.
  - Clean typing: zero unsafe `as any` casts to access kebab-case or legacy props.
- Theme and Styling isolation:
  - No CSS/Uno utility classes hardcoded inside the component JSX. All styling definitions live solely in the `component.theme.ts` file and are exposed as typed slots/classes.
  - **All component classes must be computed via `createMemo`:** The component must compute theme classes via `const classes = createMemo(() => RL<Name>Theme({ ... }))`. Any sub-element, slot, separator, or item-level theme calls must also be wrapped in `createMemo` (never bare function calls or unmemoized getters `() => theme(...)`), ensuring reactivity is preserved without re-running expensive class resolution or thrashing DOM class bindings on unrelated updates.
  - No inline styles (`style={...}`), except for dynamic geometric coordinates or CSS variables that cannot be precomputed via UnoCSS classes, and even then, encapsulated in helpers.
  - No `cx` calls directly in the component JSX.
  - Use `color = "auto"` instead of hardcoding color variants when color is configurable.
- Full WAI-ARIA & Accessibility compliance:
  - Required props for aria labels on interactive elements (`ariaLabel`, `ariaLabelledby`).
  - Use camelCase prop names (`ariaLabel`, `ariaLabelledby`, `ariaDescribedby`). Never support or inspect kebab-case `aria-*` via `(props as any)["aria-label"]`.
  - SSR/Hydration-safe automatic ID generation: use `createUniqueId()` for deterministic element associations (`aria-labelledby`, `aria-describedby`, `id`).
  - No `innerHTML` or `dangerouslySetInnerHTML`.
- Strictly adhere to SolidJS 2.0 SSR & hydration invariants:
  - **Polymorphic elements (`as` prop):** Never use `<Dynamic component={...}>` in JSX. Always use the hoisted instance factory: `const Root = dynamic(() => props.as ?? "defaultTag")` (imported as `import { dynamic } from "@solidjs/web"`).
  - **Control Flow:** Always use `<Show when={...} fallback={...}>` for conditional JSX elements; never use raw ternary expressions (`condition ? <A /> : <B />`), null coalescing element fallbacks (`val ?? <Default />` inside JSX), or logical AND short-circuiting (`cond && <A />`) for rendering DOM branches.
  - **List Rendering:** Always use `<For each={...}>` (for reference-keyed collections) or `<Index each={...}>` (for primitive/index-keyed lists); never use raw array `.map(...)` inside JSX.
  - **Server/Client State Parity:** Initial render branches must NEVER depend on client-only globals (`window`, `localStorage`, `sessionStorage`, `document`, `matchMedia`, etc.) during component initialization or render. Access to browser globals must occur exclusively inside `onMount`, `onSettled`, or event handlers to avoid hydration mismatches.
  - **Props & Reactivity:** Do not destructure props. Use `props.propName` directly or access memoized/getter signals to preserve Solid's fine-grained reactivity. Use `omit(...)` consistently to isolate HTML attribute passthroughs (`rest`).
  - **Slots & Children:** Use native Solid JSX slot props (`props.leadingSlot`, `props.trailingSlot`, `props.children`), or typed render functions `(item: T) => JSX.Element`.
    - Never use Vue-like `props.slots` record bags or dynamic string lookups (`props.slots?.['header']`).
    - Use `<Show when={props.slotName}>{(slot) => (typeof slot() === "function" ? (slot() as Function)() : slot())}</Show>` or children helper conventions.
- Audit & Test Coverage:
  - Do not surround the component in any wrapper on the audit page.
  - The audit page must include a test scenario where every slot of the component is passed children (a single dedicated example per slot, including the default slot).
  - Create a robust test suite for the component in question to avoid regressions.
  - If you notice another component with the same issue, always fix it alongside.
  - If you have suggestions or remarks, say them.

## Implementation notes

- Component package layout, `packages/ui/src/components/<name>/`:
  - `RL<Name>.tsx` — implementation, exported as `export const RL<Name>: Component<RL<Name>Props>`.
  - `<name>.types.ts` — props interface extending the base component props, JSDoc on every prop.
  - `<name>.theme.ts` — the only place classes/Uno utilities live; the component reads them from the theme.
  - `<name>.helpers.ts` — non-rendering logic, only when it is worth splitting out.
- Audit page: `apps/rimelight.com/src/components/dev/audits/<name>.audit.tsx`, importing the component from `@rimelight/ui/components/<name>/RL<Name>.tsx` and following an existing audit as the pattern reference.
- Tests: `packages/ui/test/<name>.test.tsx` (plus `<name>.helpers.test.ts` / `<name>.browser.test.tsx` when applicable). Mirror an existing component's test file for setup and conventions.
- Read one healthy existing component end to end (component, theme, tests, audit page) before writing anything; conform to it rather than inventing structure.

## Validation

- Run `vpr check` and `vpr test` after every change to ensure nothing broke.
- `vpr check` must pass with zero errors and zero warnings.
- `vpr test` must pass with zero errors and zero warnings.
- Manual verification by me must be requested for any hydration errors or other console warnings. You never run `dev` directly to verify.
- Do not mark audits as passed unless specifically told to, after my manual verification.

## Deliverables

- Updated component (`RL<Name>.tsx`), props (`<name>.types.ts`), theme (`<name>.theme.ts`), helpers (`<name>.helpers.ts`).
- Test suite covering the component's props, states, slots, and interaction behavior.
- Audit page entry exercising every prop, variant, and state.
- Completion report in the structure below.
- Ensure you follow current package standards, and not mocking of nuxt ui/vue patterns just because they are the reference.

## Completion report

Report in this exact structure, omitting nothing:

1. **Status** — `awaiting manual verification` unless I have explicitly said otherwise. Never self-declare a pass.
2. **Component** — the audited component and whether it was already functional or built from placeholder.
3. **Files changed** — every file touched, grouped as component / theme / tests / audit page / drive-by fixes.
4. **Validation** — the exact `vpr check` and `vpr test` results (zero errors, zero warnings) and when they were last run.
5. **API parity** — differences from the reference: missing features, added features, and renamed or restructured props. Empty only if truly identical.
6. **Tests** — test file path, number of tests, and what is covered (props, states, slots, keyboard/interaction, edge cases).
7. **Drive-by fixes** — other components fixed alongside, with the shared issue that was corrected.
8. **Manual verification needed** — exactly what to check in the browser: hydration warnings, console warnings, and the audit page behaviors to click through.
9. **Suggestions and remarks** — anything you would do differently or that needs a decision from me.
10. **Follow-up work** — anything intentionally left undone and why.

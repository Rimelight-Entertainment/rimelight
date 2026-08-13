# RFC-0005: Standardized Custom Element Base & Automatic Lifecycle Cleanup

- **Status**: **Draft**
- **Author(s)**: Rimelight UI Team
- **Created**: 2026-08-13
- **Last Updated**: 2026-08-13
- **Discussion/PR**: N/A

---

## 1. Summary

This RFC proposes introducing a lightweight base Web Component class (`RimelightElement`) in `@rimelight/ui/utils/customElement` to standardize client-side interactive custom elements across Astro components (such as `RLACopyMarkdown`, `RLAButton`, `RLAInputDate`, `RLACarousel`, etc.).

The base class automates event listener registration and guarantees clean event unbinding in `disconnectedCallback` during single-page application (SPA) client-side navigation.

---

## 2. Motivation

Currently, interactive Astro components in `@rimelight/ui` define custom elements directly using native `HTMLElement` with ad-hoc cleanup logic:

```ts
// Existing pattern in components (e.g., RLACopyMarkdown.astro)
class RLACopyMarkdown extends HTMLElement {
  private copyCleanup: (() => void) | null = null

  connectedCallback() {
    const onClick = async () => {
      /* ... */
    }
    copyBtn.addEventListener("click", onClick)
    this.copyCleanup = () => copyBtn.removeEventListener("click", onClick)
  }

  disconnectedCallback() {
    if (this.copyCleanup) {
      this.copyCleanup()
    }
  }
}
```

### Pain Points:

1. **Boilerplate Duplication**: Each interactive component re-invents event tracking and manual `disconnectedCallback` cleanup routines.
2. **Memory Leak Risk**: Missing or incomplete `disconnectedCallback` handlers leak event listeners when client-side transitions dynamically unmount DOM subtrees.
3. **Inconsistent Error Handling**: Event handler exceptions and async promise rejections are handled inconsistently between components.

---

## 3. Detailed Design

### 3.1. Proposed API & Helper Class

We introduce `RimelightElement` in `packages/ui/src/utils/customElement.ts`:

```typescript
import { HTMLElement } from "window" // Browser environment safe

export abstract class RimelightElement extends HTMLElement {
  private _cleanups: Array<() => void> = []

  /**
   * Safe event listener attachment with automatic lifecycle cleanup.
   */
  protected listen<K extends keyof HTMLElementEventMap>(
    target: EventTarget | null | undefined,
    type: K,
    listener: (evt: HTMLElementEventMap[K]) => void | Promise<void>,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!target) return
    const handler = (evt: Event) => {
      try {
        const res = listener(evt as HTMLElementEventMap[K])
        if (res instanceof Promise) {
          res.catch((err) => this.onUnhandledError(err))
        }
      } catch (err) {
        this.onUnhandledError(err)
      }
    }
    target.addEventListener(type, handler, options)
    this._cleanups.push(() => target.removeEventListener(type, handler, options))
  }

  /**
   * Hook executed when an unhandled error occurs within an event handler.
   */
  protected onUnhandledError(error: unknown): void {
    console.error(`[${this.tagName.toLowerCase()}] Unhandled event error:`, error)
  }

  /**
   * Native Web Component teardown lifecycle.
   */
  disconnectedCallback(): void {
    for (const cleanup of this._cleanups) {
      cleanup()
    }
    this._cleanups = []
  }
}
```

### 3.2. Refactored Component Usage Example

```astro
<!-- Refactored RLACopyMarkdown.astro -->
<script>
  import { RimelightElement } from "@rimelight/ui/utils/customElement"

  class RLACopyMarkdown extends RimelightElement {
    connectedCallback() {
      this.style.display = 'contents'
      const copyBtn = this.querySelector(".rl-copy-markdown") as HTMLButtonElement | null
      if (!copyBtn) return

      this.listen(copyBtn, "click", async () => {
        const markdown = copyBtn.getAttribute("data-raw")
        if (!markdown) return
        await navigator.clipboard.writeText(markdown)
      })
    }
  }

  if (!customElements.get('rla-copy-markdown')) {
    customElements.define('rla-copy-markdown', RLACopyMarkdown)
  }
</script>
```

---

## 4. Drawbacks & Trade-offs

- **Tiny Module Overhead**: Adds ~0.2 KB to the client-side JavaScript bundle (shared across custom element scripts).
- **Migration Effort**: Requires updating existing interactive Astro components to inherit from `RimelightElement`.

---

## 5. Alternatives Considered

- **Keeping Ad-hoc Cleanups**: Rejected due to high risk of missed unbinds during SPA page navigation.
- **RxJS / Event Aggregators**: Rejected due to heavy runtime bundle size impact.

---

## 6. Adoption & Verification Plan

1. Export `RimelightElement` from `@rimelight/ui/utils/customElement`.
2. Progressively update interactive components (`copy-markdown`, `button`, `carousel`, `dropdown-menu`) to inherit from `RimelightElement`.
3. Validate using `vp check` and `vp test`.

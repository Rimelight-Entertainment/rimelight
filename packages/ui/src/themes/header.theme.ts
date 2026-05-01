/**
 * Theme configuration for the Header component. Defines the slots, base styles, and variants for
 * layout management.
 *
 * Slots:
 *
 * - `root` — the `<header>` element
 * - `content` — inner wrapper div used for height measurement (fixed/hideOnScroll mode)
 * - `container` — max-width flex row
 * - `left` — left region
 * - `center` — center region
 * - `right` — right region
 *
 * Variants:
 *
 * - `contain` — constrains container to max-w-7xl
 * - `sticky` — sticky positioning (ignored when `fixed` variant is true)
 * - `fixed` — position: fixed with left/right 0 and smooth top/opacity transition; used for stacked
 *   header layers. Top offset and z-index are applied via inline style (top prop + stackIndex prop)
 *   rather than theme classes.
 */
export const headerTheme = {
  slots: ["root", "content", "container", "left", "center", "right"],
  base: {
    root: "w-full",
    content: "w-full",
    container:
      "flex flex-row items-center justify-between gap-4xs h-16 md:h-18 px-4 md:px-6 lg:px-8",
    left: "flex flex-none items-center justify-start",
    center: "flex items-center justify-center",
    right: "flex flex-none items-center justify-end"
  },
  variants: {
    contain: {
      true: {
        container: "mx-auto max-w-7xl"
      },
      false: {
        container: "max-w-none"
      }
    },
    sticky: {
      true: {
        root: "sticky top-0 inset-x-0 z-50"
      },
      false: {
        root: "relative"
      }
    },
    /**
     * Fixed-layer mode. When true, overrides sticky/relative positioning with `position: fixed` and
     * enables smooth transitions. `top` and `z-index` are applied via inline `:style` on the
     * component.
     */
    fixed: {
      true: {
        root: "fixed left-0 right-0 transition-[top,opacity] duration-200 ease-in-out"
      },
      false: {}
    }
  },
  defaultVariants: {
    contain: true,
    sticky: true,
    fixed: false
  }
} as const

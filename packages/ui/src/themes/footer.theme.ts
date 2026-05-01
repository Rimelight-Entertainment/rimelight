/**
 * Theme configuration for the Footer component. Defines the slots, base styles, and variants for
 * layout management.
 */
export const footerTheme = {
  slots: ["root", "container", "left", "center", "right"],
  base: {
    root: "py-8 lg:py-12",
    container:
      "flex flex-col justify-between gap-xl lg:flex-row lg:items-stretch px-4 md:px-6 lg:px-8",
    left: "order-last flex flex-col items-center justify-between gap-xl lg:order-1 lg:flex-none lg:items-start",
    center: "flex flex-col items-center justify-start lg:order-2 lg:flex-1",
    right:
      "order-first flex flex-col items-center justify-between gap-xl lg:order-3 lg:flex-none lg:items-end"
  },
  variants: {
    contain: {
      true: {
        container: "mx-auto max-w-7xl"
      },
      false: {
        container: "w-full"
      }
    }
  },
  defaultVariants: {
    contain: false
  }
} as const

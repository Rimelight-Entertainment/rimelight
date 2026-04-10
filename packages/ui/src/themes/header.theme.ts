export const headerTheme = {
  slots: ["root", "container", "left", "center", "right"],
  base: {
    root: "w-full",
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
    }
  },
  defaultVariants: {
    contain: true,
    sticky: true
  }
} as const

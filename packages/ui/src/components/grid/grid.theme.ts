import { defineTheme } from "../../themes/defineTheme"

export const createGridTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "grid w-full [&>*]:mt-0!"
    },
    variants: {
      cols: {
        1: { root: "grid-cols-1" },
        2: { root: "grid-cols-1 sm:grid-cols-2" },
        3: { root: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" },
        4: { root: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" },
        5: { root: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" },
        6: { root: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6" }
      },
      gap: {
        none: { root: "gap-0" },
        xs: { root: "gap-1 sm:gap-2" },
        sm: { root: "gap-2 sm:gap-4" },
        md: { root: "gap-4 sm:gap-6" },
        lg: { root: "gap-6 sm:gap-8" },
        xl: { root: "gap-8 sm:gap-12" }
      },
      stagger: {
        true: { root: "pb-20 [&>:nth-child(2n)]:translate-y-20" },
        false: { root: "" }
      }
    },
    defaultVariants: {
      cols: 2,
      gap: "md",
      stagger: false
    }
  })

export default createGridTheme()

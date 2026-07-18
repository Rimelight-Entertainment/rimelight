import { defineTheme } from "../../themes/defineTheme"

export const createSkeletonTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "animate-pulse bg-elevated shrink-0"
    },
    variants: {
      shape: {
        circle: { root: "rounded-full" },
        rectangle: { root: "rounded-none" },
        rounded: { root: "rounded-md" }
      }
    },
    defaultVariants: {
      shape: "rounded"
    }
  })

export default createSkeletonTheme()

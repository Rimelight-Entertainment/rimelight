import { defineTheme } from "../utils/defineTheme"

export const skeletonTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "animate-pulse bg-muted shrink-0"
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

export default skeletonTheme

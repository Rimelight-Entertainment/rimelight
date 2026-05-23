import { defineTheme } from "../utils/defineTheme"

export const createToggleGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "inline-flex items-center justify-center gap-1 rounded-md border border-border bg-muted p-1"
    },
    variants: {
      size: {
        sm: { root: "h-8 gap-0.5" },
        md: { root: "h-9 gap-1" },
        lg: { root: "h-10 gap-1.5" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createToggleGroupTheme()

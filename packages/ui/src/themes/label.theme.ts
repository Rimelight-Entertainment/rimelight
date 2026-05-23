import { defineTheme } from "../utils/defineTheme"

export const labelTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  },
  variants: {
    size: {
      sm: { root: "text-xs" },
      md: { root: "text-sm" },
      lg: { root: "text-base" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})

export default labelTheme

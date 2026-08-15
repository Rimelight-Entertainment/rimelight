import { defineTheme } from "../../utils/resolver"

export const labelTheme = defineTheme("label", {
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

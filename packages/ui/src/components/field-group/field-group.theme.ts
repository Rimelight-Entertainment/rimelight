import { defineTheme } from "../../utils/resolver"

export const fieldGroupTheme = defineTheme("field-group", {
  slots: ["root", "prepend", "append"],
  base: {
    root: "relative flex items-stretch w-full rounded-md border border-default bg-default shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
    prepend: "flex items-center bg-muted px-3 text-sm text-muted border-r border-default",
    append: "flex items-center bg-muted px-3 text-sm text-muted border-l border-default"
  },
  variants: {
    size: {
      sm: { prepend: "px-2 text-xs", append: "px-2 text-xs" },
      md: { prepend: "px-3 text-sm", append: "px-3 text-sm" },
      lg: { prepend: "px-4 text-base", append: "px-4 text-base" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})

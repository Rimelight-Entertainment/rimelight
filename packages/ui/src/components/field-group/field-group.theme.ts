import { defineTheme } from "../../utils/resolver"

export const createFieldGroupTheme = () =>
  defineTheme({
    slots: ["root", "prepend", "append"],
    base: {
      root: "relative flex items-stretch w-full rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
      prepend:
        "flex items-center bg-muted px-3 text-sm text-muted-foreground border-r border-input",
      append: "flex items-center bg-muted px-3 text-sm text-muted-foreground border-l border-input"
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

export default createFieldGroupTheme()

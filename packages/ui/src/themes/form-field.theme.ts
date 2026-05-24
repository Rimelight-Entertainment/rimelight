import { defineTheme } from "../utils/defineTheme"

export const createFormFieldTheme = () =>
  defineTheme({
    slots: ["root", "label", "description", "error"],
    base: {
      root: "flex flex-col gap-1.5 w-full",
      label: "text-sm font-medium text-foreground",
      description: "text-xs text-muted-foreground leading-normal",
      error: "text-xs font-medium text-error-500 leading-normal"
    },
    variants: {
      size: {
        sm: { label: "text-xs", description: "text-[10px]", error: "text-[10px]" },
        md: { label: "text-sm", description: "text-xs", error: "text-xs" },
        lg: { label: "text-base", description: "text-sm", error: "text-sm" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createFormFieldTheme()

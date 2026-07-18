import { defineTheme } from "../../themes/defineTheme"

export const createTextareaTheme = () =>
  defineTheme({
    slots: ["root", "textarea"],
    base: {
      root: "relative flex items-center w-full rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      textarea:
        "w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
    },
    variants: {
      size: {
        sm: { textarea: "py-1.5 text-xs min-h-[60px]" },
        md: { textarea: "py-2 text-sm min-h-[80px]" },
        lg: { textarea: "py-2.5 text-base min-h-[100px]" }
      },
      error: {
        true: { root: "border-error-500 focus-within:ring-error-500/50" }
      }
    },
    defaultVariants: {
      size: "md",
      error: false
    }
  })

export default createTextareaTheme()

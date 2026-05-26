import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createPopoverTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "trigger", "content"],
    base: {
      root: "relative inline-block group/popover",
      trigger: "",
      content: [
        "absolute z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "transition-all duration-200 invisible opacity-0 scale-95 origin-center",
        "group-hover/popover:visible group-hover/popover:opacity-100 group-hover/popover:scale-100",
        "focus-within:visible focus-within:opacity-100 focus-within:scale-100"
      ]
    },
    variants: {
      placement: {
        top: { content: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
        bottom: { content: "top-full left-1/2 -translate-x-1/2 mt-2" },
        left: { content: "right-full top-1/2 -translate-y-1/2 mr-2" },
        right: { content: "left-full top-1/2 -translate-y-1/2 ml-2" }
      }
    },
    defaultVariants: {
      placement: "bottom"
    }
  })

export default createPopoverTheme()

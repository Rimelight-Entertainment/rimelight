import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes/defineTheme"

export const createPopoverTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root", "trigger", "content"],
    base: {
      root: "relative inline-block",
      trigger: "",
      content: [
        "absolute z-50 w-72 rounded-xl border border-border bg-background p-4 text-foreground shadow-lg outline-none"
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

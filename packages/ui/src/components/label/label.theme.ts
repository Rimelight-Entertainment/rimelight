import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes/defineTheme"

export const createLabelTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
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

export default createLabelTheme()

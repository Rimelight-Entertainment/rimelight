import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error"]

export const createProgressTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "indicator"],
    base: {
      root: "relative w-full overflow-hidden rounded-full bg-muted shadow-inner",
      indicator: "h-full w-full flex-1 transition-all duration-300 ease-in-out"
    },
    variants: {
      color: Object.fromEntries(colors.map((color) => [color, { indicator: `bg-${color}-500` }])),
      size: {
        sm: { root: "h-1.5" },
        md: { root: "h-3" },
        lg: { root: "h-5" }
      }
    },
    defaultVariants: {
      color: "primary",
      size: "md"
    }
  })

export default createProgressTheme()

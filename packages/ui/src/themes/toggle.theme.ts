import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error"]

export const createToggleTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: [
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150 border border-transparent bg-transparent hover:bg-muted text-foreground cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      ]
    },
    variants: {
      size: {
        sm: { root: "h-8 px-2 text-xs" },
        md: { root: "h-9 px-3 text-sm" },
        lg: { root: "h-10 px-4 text-base" }
      },
      color: Object.fromEntries(colors.map((color) => [color, { root: "" }])),
      active: {
        true: { root: "bg-muted text-foreground border-border" },
        false: { root: "" }
      }
    },
    compoundVariants: [
      ...colors.map((color) => ({
        active: true as const,
        color,
        classNames: {
          root: `bg-${color}-500/10 text-${color}-600 border-${color}-500/20 hover:bg-${color}-500/20`
        }
      }))
    ],
    defaultVariants: {
      size: "md",
      color: "primary",
      active: false
    }
  })

export default createToggleTheme()

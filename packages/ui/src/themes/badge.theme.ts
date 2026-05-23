import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error"]

export const createBadgeTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "inline-flex items-center gap-1.5 font-medium select-none overflow-hidden transition-all duration-150"
    },
    variants: {
      variant: {
        solid: { root: "border border-transparent text-white" },
        outline: { root: "border" },
        soft: { root: "border border-transparent" },
        ghost: { root: "bg-transparent hover:bg-muted" }
      },
      color: Object.fromEntries(colors.map((color) => [color, { root: "" }])),
      size: {
        sm: { root: "px-2 py-0.5 text-2xs rounded-full h-5" },
        md: { root: "px-2.5 py-0.5 text-xs rounded-full h-6" },
        lg: { root: "px-3 py-1 text-sm rounded-full h-7" }
      },
      shape: {
        square: { root: "rounded-sm" },
        rounded: { root: "rounded-md" },
        pill: { root: "rounded-full" }
      }
    },
    compoundVariants: [
      ...colors.map((color) => ({
        variant: "solid" as const,
        color,
        classNames: {
          root: `bg-${color}-500 text-white hover:bg-${color}-600`
        }
      })),
      ...colors.map((color) => ({
        variant: "outline" as const,
        color,
        classNames: {
          root: `border-${color}-500/20 text-${color}-600 bg-transparent hover:bg-${color}-500/5`
        }
      })),
      ...colors.map((color) => ({
        variant: "soft" as const,
        color,
        classNames: {
          root: `text-${color}-600 bg-${color}-500/10 hover:bg-${color}-500/20`
        }
      }))
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
      shape: "pill"
    }
  })

export default createBadgeTheme()

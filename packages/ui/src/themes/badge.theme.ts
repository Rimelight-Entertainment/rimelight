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
      },
      theme: {
        flat: { root: "rl-flat" },
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    compoundVariants: [
      ...colors.map((color) => ({
        variant: "solid" as const,
        color,
        classNames: {
          root: `rl-color-${color} bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)]`
        }
      })),
      ...colors.map((color) => ({
        variant: "outline" as const,
        color,
        classNames: {
          root: `rl-color-${color} border-[var(--rl-border)]/20 text-[var(--rl-text)] bg-transparent hover:bg-[var(--rl-bg)]/5`
        }
      })),
      ...colors.map((color) => ({
        variant: "soft" as const,
        color,
        classNames: {
          root: `rl-color-${color} text-[var(--rl-text)] bg-[var(--rl-bg)]/10 hover:bg-[var(--rl-bg)]/20`
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

import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error"]

export const createAlertTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "icon", "content", "title", "description"],
    base: {
      root: "relative w-full rounded-lg border p-4 flex gap-3 text-sm transition-all shadow-sm",
      icon: "shrink-0 size-5 text-current",
      content: "flex flex-col gap-1 w-full",
      title: "font-semibold leading-none tracking-tight text-foreground",
      description: "text-xs opacity-90 leading-relaxed"
    },
    variants: {
      variant: {
        default: { root: "bg-background text-foreground border-border" },
        destructive: { root: "bg-error-500/10 text-error-700 border-error-500/20 dark:text-error-400" },
        outline: { root: "border bg-transparent" },
        solid: { root: "border-transparent text-white" }
      },
      color: Object.fromEntries(colors.map((color) => [color, { root: "" }])),
      hasIcon: {
        true: { icon: "block" },
        false: { icon: "hidden" }
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
          root: `rl-color-${color} bg-[var(--rl-bg)] text-white border-transparent`
        }
      })),
      ...colors.map((color) => ({
        variant: "outline" as const,
        color,
        classNames: {
          root: `rl-color-${color} border-[var(--rl-border)]/20 text-[var(--rl-text)] bg-[var(--rl-bg)]/5`
        }
      }))
    ],
    defaultVariants: {
      variant: "default",
      color: "primary",
      hasIcon: false
    }
  })

export default createAlertTheme()

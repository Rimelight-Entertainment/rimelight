import { defaultColors } from "../presets/defaults"
import { defineTheme } from "./defineTheme"

export const createProgressTheme = (colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "indicator"],
    base: {
      root: "relative w-full overflow-hidden rounded-full bg-muted shadow-inner",
      indicator: "h-full w-full flex-1 transition-all duration-300 ease-in-out"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            indicator: `bg-[var(--rl-bg)]`
          }
        ])
      ),
      size: {
        sm: { root: "h-1.5" },
        md: { root: "h-3" },
        lg: { root: "h-5" }
      },
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    defaultVariants: {
      color: "primary",
      size: "md"
    }
  })

export default createProgressTheme()

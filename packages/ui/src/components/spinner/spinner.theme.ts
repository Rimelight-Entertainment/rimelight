import { colorNames } from "../../config"
import { defineTheme } from "../../types/component"

export const createSpinnerTheme = (colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "animate-spin shrink-0 rounded-full border-2 border-t-transparent border-current"
    },
    variants: {
      size: {
        xs: { root: "size-3" },
        sm: { root: "size-4" },
        md: { root: "size-6" },
        lg: { root: "size-8" },
        xl: { root: "size-10" }
      },
      color: Object.fromEntries([
        ["current", { root: "text-current" }],
        ...colors.map((color) => [color, { root: "rl-color-" + color + " text-[var(--rl-text)]" }])
      ]),
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    defaultVariants: {
      size: "md",
      color: "current"
    }
  })

export default createSpinnerTheme()

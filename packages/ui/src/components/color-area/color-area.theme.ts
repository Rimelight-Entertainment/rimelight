import { colorNames } from "../../config"
import { defineTheme } from "../../utils/resolver"

export const createColorAreaTheme = (colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root", "area", "thumb"],
    base: {
      root: "relative block touch-none select-none rounded-lg w-full aspect-square outline-none",
      area: "relative w-full h-full rounded-lg cursor-crosshair bg-muted outline-none",
      thumb:
        "absolute block size-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            thumb: `focus-visible:ring-[var(--rl-ring)]/50`
          }
        ])
      ),
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    defaultVariants: {
      color: "primary"
    }
  })

export default createColorAreaTheme()

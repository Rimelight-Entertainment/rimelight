import { colorNames } from "../../config"
import { defineTheme } from "../../types/component"

export const createColorFieldTheme = (colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root", "input"],
    base: {
      root: "relative flex items-center border border-border rounded-lg bg-background shadow-sm px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      input:
        "w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 text-foreground placeholder-muted-foreground"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            input: `focus:ring-0`
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

export default createColorFieldTheme()

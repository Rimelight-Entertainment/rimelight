import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../utils/defineTheme"

export const createCheckboxTheme = (colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root", "input", "box", "indicator", "label"],
    base: {
      root: "inline-flex items-center gap-2 cursor-pointer select-none",
      input: "absolute opacity-0 size-0 pointer-events-none peer",
      box: [
        "size-4 shrink-0 rounded border border-border bg-background transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      ],
      indicator:
        "flex items-center justify-center text-white scale-0 transition-transform duration-150",
      label: "text-sm text-foreground leading-none"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            box: `peer-checked:bg-[var(--rl-bg)] peer-checked:border-[var(--rl-border)] focus-within:ring-[var(--rl-ring)]/50 peer-checked:[&_[data-slot=indicator]]:scale-100`
          }
        ])
      ),
      size: {
        sm: { box: "size-3.5", label: "text-xs" },
        md: { box: "size-4", label: "text-sm" },
        lg: { box: "size-4.5", label: "text-base" }
      },
      checked: {
        true: { indicator: "scale-100" },
        false: { indicator: "scale-0" }
      },
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    defaultVariants: {
      color: "primary",
      size: "md",
      checked: false
    }
  })

export default createCheckboxTheme()

import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createSliderTheme = (colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "track", "range", "thumb"],
    base: {
      root: "relative flex w-full touch-none select-none items-center",
      track: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted",
      range: "absolute h-full",
      thumb:
        "block size-4.5 rounded-full border border-border bg-background shadow transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            range: `bg-[var(--rl-bg)]`,
            thumb: `focus-visible:ring-[var(--rl-ring)]/50 hover:border-[var(--rl-border)]`
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

export default createSliderTheme()

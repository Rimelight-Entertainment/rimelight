import { defineTheme } from "../../resolver"

export const colorSliderTheme = defineTheme("color-slider", {
  slots: ["root", "track", "thumb"],
  base: {
    root: "relative flex w-full touch-none select-none items-center outline-none",
    track:
      "relative h-3 w-full grow rounded-full border border-default bg-muted cursor-pointer outline-none",
    thumb:
      "absolute block size-5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]/50"
  },
  variants: {
    color: "auto",
    theme: {
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  defaultVariants: {
    color: "primary"
  }
})

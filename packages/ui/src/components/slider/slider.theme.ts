import { defineTheme } from "../../resolver"

export const sliderTheme = defineTheme("slider", {
  slots: ["root", "track", "range", "thumb"],
  base: {
    root: "relative flex w-full touch-none select-none items-center",
    track: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted",
    range: "absolute h-full bg-[var(--rl-bg)]",
    thumb:
      "block size-4.5 rounded-full border border-default bg-default shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]/50 hover:border-[var(--rl-border)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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

import { defineTheme } from "../../utils/resolver"

export const colorFieldTheme = defineTheme("color-field", {
  slots: ["root", "input"],
  base: {
    root: "relative flex items-center border border-default rounded-lg bg-default shadow-sm px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--rl-ring)]/50 focus-within:ring-offset-2",
    input:
      "w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 text-highlighted placeholder-muted-foreground"
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

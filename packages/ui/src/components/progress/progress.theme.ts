import { defineTheme } from "../../utils/resolver"

export const progressTheme = defineTheme("progress", {
  slots: ["root", "indicator"],
  base: {
    root: "relative w-full overflow-hidden rounded-full bg-muted shadow-inner",
    indicator: "h-full w-full flex-1 transition-all duration-300 ease-in-out bg-[var(--rl-bg)]"
  },
  variants: {
    color: "auto",
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

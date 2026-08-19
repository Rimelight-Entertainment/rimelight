import { defineTheme } from "../../resolver"

export const spinnerTheme = defineTheme("spinner", {
  slots: ["root"],
  base: {
    root: "animate-spin shrink-0 rounded-full border-2 border-t-transparent text-[var(--rl-text)] border-current"
  },
  variants: {
    size: {
      xs: { root: "size-3" },
      sm: { root: "size-4" },
      md: { root: "size-6" },
      lg: { root: "size-8" },
      xl: { root: "size-10" }
    },
    color: "auto",
    theme: {
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  compoundVariants: [
    {
      color: "current",
      classNames: { root: "text-current" }
    }
  ],
  defaultVariants: {
    size: "md",
    color: "current"
  }
})

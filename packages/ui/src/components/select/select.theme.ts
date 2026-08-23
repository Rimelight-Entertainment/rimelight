import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon"],
  base: {
    root: "relative inline-flex items-center w-full",
    select:
      "rl-select w-full cursor-pointer rounded-md border border-default bg-default text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    icon: "pointer-events-none absolute right-2 flex items-center text-muted"
  },
  variants: {
    size: {
      xs: { select: "py-0.5 pl-2 pr-6 text-xs" },
      sm: { select: "py-1 pl-2.5 pr-7 text-xs" },
      md: { select: "py-1.5 pl-3 pr-8 text-sm" },
      lg: { select: "py-2 pl-3.5 pr-9 text-base" },
      xl: { select: "py-2.5 pl-4 pr-10 text-base" }
    },
    theme: {
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})

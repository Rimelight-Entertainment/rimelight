import { defineTheme } from "../../resolver"

export const themeSelectorTheme = defineTheme("theme-selector", {
  slots: ["root", "sun", "moon"],
  base: {
    root: "group rounded-full hover:bg-neutral-900/50 transition-colors inline-flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer",
    sun: "rla-theme-sun w-5 h-5 text-current",
    moon: "rla-theme-moon w-5 h-5 text-current"
  },
  variants: {},
  defaultVariants: {}
})

import { defineTheme } from "../../utils/resolver"

export const containerTheme = defineTheme("container", {
  slots: ["root"],
  base: {
    root: "w-full max-w-[var(--rl-container)] mx-auto px-xs sm:px-md md:px-xl lg:px-xl"
  },
  variants: {},
  defaultVariants: {}
})

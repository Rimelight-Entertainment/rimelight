import { defineTheme } from "../../types/component"

export const createThemeSelectorTheme = () =>
  defineTheme({
    slots: ["root", "sun", "moon"],
    base: {
      root: "group rounded-full hover:bg-neutral-900/50 transition-colors inline-flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer",
      sun: "hidden dark:block w-5 h-5 text-current",
      moon: "dark:hidden w-5 h-5 text-current"
    },
    variants: {},
    defaultVariants: {}
  })

export default createThemeSelectorTheme()

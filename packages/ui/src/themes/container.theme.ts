import { defineTheme } from "../utils/defineTheme"

export const createContainerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "w-full max-w-(--rl-container) mx-auto px-4 sm:px-6 lg:px-8"
    },
    variants: {},
    defaultVariants: {}
  })

export default createContainerTheme()

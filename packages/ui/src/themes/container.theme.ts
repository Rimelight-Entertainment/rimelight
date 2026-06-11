import { defineTheme } from "../utils/defineTheme"

export const createContainerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "w-full max-w-(--rl-container) mx-auto px-xs sm:px-md md:px-xl lg:px-xl"
    },
    variants: {},
    defaultVariants: {}
  })

export default createContainerTheme()

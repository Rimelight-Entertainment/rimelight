import { defineTheme } from "../../themes"

export const createRatingTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createRatingTheme()

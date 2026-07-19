import { defineTheme } from "../../utils/defineTheme"

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

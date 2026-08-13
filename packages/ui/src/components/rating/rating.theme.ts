import { defineTheme } from "../../types/component"

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

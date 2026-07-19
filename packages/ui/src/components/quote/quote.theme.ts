import { defineTheme } from "../../themes"

export const createQuoteTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createQuoteTheme()

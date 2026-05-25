import { defineTheme } from "../utils/defineTheme"

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

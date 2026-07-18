import { defineTheme } from "../../types/theme"

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

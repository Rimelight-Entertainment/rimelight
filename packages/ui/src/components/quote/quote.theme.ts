import { defineTheme } from "../../types/component"

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

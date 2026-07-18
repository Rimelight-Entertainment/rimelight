import { defineTheme } from "./defineTheme"

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

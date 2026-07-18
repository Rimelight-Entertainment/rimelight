import { defineTheme } from "./defineTheme"

export const createPricingTableTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPricingTableTheme()

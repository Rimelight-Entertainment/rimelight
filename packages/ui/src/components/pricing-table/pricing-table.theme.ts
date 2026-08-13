import { defineTheme } from "../../types/component"

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

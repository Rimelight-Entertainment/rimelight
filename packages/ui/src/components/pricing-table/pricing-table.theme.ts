import { defineTheme } from "../../utils/resolver"

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

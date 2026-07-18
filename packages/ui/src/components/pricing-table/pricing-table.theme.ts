import { defineTheme } from "../../types/theme"

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

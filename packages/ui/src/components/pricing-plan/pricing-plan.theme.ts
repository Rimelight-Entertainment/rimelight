import { defineTheme } from "../../utils/resolver"

export const createPricingPlanTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPricingPlanTheme()

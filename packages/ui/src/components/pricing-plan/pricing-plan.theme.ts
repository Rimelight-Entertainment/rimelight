import { defineTheme } from "../../types/component"

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

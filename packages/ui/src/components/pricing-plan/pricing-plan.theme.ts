import { defineTheme } from "../../themes"

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
